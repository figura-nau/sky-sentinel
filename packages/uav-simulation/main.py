import socketio
import time
import random
import math
import uuid
from datetime import datetime, timezone

sio = socketio.Client()
def get_next_position(lat, lon, speed_ms, heading, dt=1.0):
    """
    Calculate new Lat/Lon based on current speed (m/s) and heading.
    Using simple spherical earth approximation for short distances.
    """
    R = 6378137.0  # Radius of Earth in meters
    
    # Convert degrees to radians
    heading_rad = math.radians(heading)
    lat_rad = math.radians(lat)
    
    # Distance moved in this time step
    distance = speed_ms * dt
    
    # Calculate change
    delta_lat = (distance * math.cos(heading_rad)) / R
    delta_lon = (distance * math.sin(heading_rad)) / (R * math.cos(lat_rad))
    
    # Convert back to degrees
    new_lat = lat + math.degrees(delta_lat)
    new_lon = lon + math.degrees(delta_lon)
    
    return new_lat, new_lon
def calculate_uav_checksum(data: dict) -> str:
    sorted_keys = sorted(data.keys())
    parts = []
    for k in sorted_keys:
        val = data[k]
        if isinstance(val, (int, float)):
            # Rounding to 4 decimal places kills the 'drift' (0.00000000000002)
            # Adding 0.0 is a trick to convert -0.0 to 0.0
            val_normalized = round(float(val), 4) + 0.0
            val_str = format(val_normalized, 'g')
        elif isinstance(val, bool):
            val_str = "True" if val else "False"
        else:
            val_str = str(val)
        parts.append(f"{k}:{val_str}")
    
    payload_string = "|".join(parts)
    # print(f"PYTHON PAYLOAD: {payload_string}")
    checksum = 0
    for char in payload_string:
        checksum ^= ord(char)
    return hex(checksum)[2:].upper().zfill(2)

def run_advanced_simulation():
    # Initial Aircraft State (Standard Flight)
    state = {
        "latitude": 50.4501,
        "longitude": 30.5234,
        "altitude": 150.0,
        "verticalSpeed": 0.0,
        "airspeed": 85.0,        # Airspeed from Pitot Tube
        "groundSpeed": 82.0,     # Ground Speed from GPS (Redundancy)
        "pitch": 2.0,
        "roll": 0.0,
        "throttle": 65.0,        # Engine Power %
        "servoCurrent": 0.8,     # Amps (Normal load)
        "gear_status": 0,
        "battery_level": 95.0,
        "temperature": 42.0,
        "rssi": -62.0,
        "latency": 28.0
    }
    connected = False
    while not connected:
        try:
            print("Attempting to connect to Backend...")
            sio.connect('http://localhost:3003')
            connected = True
            print("Connected successfully!")
        except Exception as e:
            print(f"Connection failed: {e}. Retrying in 2 seconds...")
            time.sleep(2)

    print("Simulator started. Streaming flight data...")
    try:
        tick = 0
        while True:
            tick += 1
            state["id"] = str(uuid.uuid4())
            # --- 1. SIMULATE PHYSICS & REDUNDANCY ---
            current_heading = 90.0 
            current_heading = (current_heading + 3.0) % 360.0
            new_lat, new_lon = get_next_position(
                state["latitude"], 
                state["longitude"], 
                state["groundSpeed"], 
                current_heading
            )
            state["latitude"] = round(new_lat, 6)
            state["longitude"] = round(new_lon, 6)
            # Simulate Wind (difference between Airspeed and GroundSpeed)
            # Lecture №10: Analytical Redundancy check
            wind_effect = random.uniform(-2.0, 2.0)
            state["groundSpeed"] = round(state["airspeed"] + wind_effect, 1)

            # Simulate Battery Drain based on Throttle (рівень тяги)
            state["battery_level"] = round(max(0, state["battery_level"] - (state["throttle"] / 1000)), 1)

            # --- 2. INJECT FAILURES FOR TESTING (Triggered by time) ---

            # КЕЙС А: ВІДМОВА ПВД (Тест аналітичної надлишковості)
            # На 20-й секунді трубка Піто "забивається" — швидкість падає, але GPS показує рух
            if 20 < tick < 30:
                state["airspeed"] = 15.0 # Fake low reading
                print("!!! ІМІТАЦІЯ: Відмова ПВД (невідповідність Airspeed та GroundSpeed) !!!")

            # КЕЙС Б: ВІДМОВА СИЛОВОЇ УСТАНОВКИ (Тест розділу 3.3)
            # На 40-й секунді двигун втрачає потужність — тяга висока, але висота та швидкість падають
            elif 40 < tick < 50:
                state["throttle"] = 95.0 
                state["verticalSpeed"] = -4.2 # Losing height despite high power
                state["altitude"] -= 4.2
                state["airspeed"] -= 2.0
                print("!!! INJECTING: Propulsion System Failure !!!")

            # КЕЙС В: ЗАКЛИНЮВАННЯ СЕРВОПРИВОДА (Параметри контролю Лекції №10)
            # Високе споживання струму сервоприводами
            elif 60 < tick < 70:
                state["servoCurrent"] = 4.5 # Stall current (Normal is < 1.0)
                print("!!! ІМІТАЦІЯ: Відмова сервопривода (виявлено високий струм) !!!")

            else:
                # Normal Flight Logic (Cruise)
                state["airspeed"] = round(random.uniform(84, 86), 1)
                state["verticalSpeed"] = round(random.uniform(-0.1, 0.1), 1)
                state["servoCurrent"] = round(random.uniform(0.6, 0.9), 1)

            # --- 3. SEND PACKET ---
            now = datetime.now(timezone.utc)
            state["timestamp"] = now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
            checksum = calculate_uav_checksum(state)

            packet = {
                "data": state.copy(),
                "checksum": checksum
            }

            sio.emit('telemetry', packet)
            time.sleep(1.0)

    except Exception as e:
        print(f"Error: {e}")
        sio.disconnect()

if __name__ == "__main__":
    run_advanced_simulation()
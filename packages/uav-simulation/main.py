import socketio
import time
import random
import threading
import math
import tkinter as tk
from tkinter import ttk, scrolledtext
from datetime import datetime, timezone

# --- CONFIGURATION ---
BACKEND_URL = 'http://localhost:3003'

# --- THEME CONSTANTS ---
THEMES = {
    "DARK": {
        "bg_main": "#000000",      # Pure Black
        "bg_panel": "#0a0a0a",     # Zinc 950 / Near black
        "border": "#27272a",       # Zinc 800
        "accent_primary": "#10b981", # Emerald 500
        "accent_success": "#10b981", # Emerald 500
        "accent_warning": "#f59e0b", # Amber 500
        "accent_danger": "#ef4444",  # Red 500
        "text_main": "#ffffff",      # White
        "text_dim": "#a1a1aa",       # Zinc 400
        "terminal_bg": "#000000",
        "terminal_text": "#10b981",
        "btn_bg": "#18181b",       # Zinc 900
        "btn_fg": "#ffffff"
    },
    "LIGHT": {
        "bg_main": "#ffffff",      # Pure White
        "bg_panel": "#f4f4f5",     # Zinc 100
        "border": "#e4e4e7",       # Zinc 200
        "accent_primary": "#059669", # Emerald 600
        "accent_success": "#059669", # Emerald 600
        "accent_warning": "#d97706", # Amber 600
        "accent_danger": "#dc2626",  # Red 600
        "text_main": "#09090b",      # Zinc 950
        "text_dim": "#52525b",       # Zinc 600
        "terminal_bg": "#f4f4f5",
        "terminal_text": "#064e3b",  # Emerald 900
        "btn_bg": "#e4e4e7",       # Zinc 200
        "btn_fg": "#09090b"
    }
}

FONTS = {
    "header": ("Consolas", 18, "bold"),
    "sub_header": ("Consolas", 10, "bold"),
    "body": ("Consolas", 10),
    "mono": ("Consolas", 10),
    "data_label": ("Consolas", 9),
    "data_value": ("Consolas", 12, "bold")
}

# --- TRANSLATIONS ---
TEXTS = {
    "EN": {
        "diag": "DIAGNOSTICS",
        "routes": "FLIGHT ROUTES (ROADS)",
        "tele": "LIVE TELEMETRY",
        "start": "START STREAM",
        "stop": "STOP STREAM",
        "offline": "● OFFLINE",
        "live": "● LIVE",
        "lang_toggle": "🇺🇦 UA",
        "theme_toggle": "🌓 THEME",
        "failures": ["NORMAL", "PITOT CLOG", "ENGINE FAIL", "SERVO STALL", "SIGNAL LOSS", "HIGH LAG", "LOW BATTERY", "OVERHEAT"],
        "routes_btn": ["City Patrol", "Highway E40", "Border Sweep", "Return Base"],
        "metrics": ["ALTITUDE (m)", "AIRSPEED (km/h)", "LATITUDE", "LONGITUDE", 
                    "BATTERY (%)", "THROTTLE (%)", "TEMP (°C)", "RSSI (dBm)", "LATENCY (ms)"],
        "log_start": "Stream started.",
        "log_stop": "Stream stopped.",
        "log_route": "Redirecting to"
    },
    "UA": {
        "diag": "ДІАГНОСТИКА",
        "routes": "ПОЛЬОТНІ МАРШРУТИ",
        "tele": "ЖИВА ТЕЛЕМЕТРІЯ",
        "start": "ПОЧАТИ ТРАНСЛЯЦІЮ",
        "stop": "ЗУПИНИТИ ТРАНСЛЯЦІЮ",
        "offline": "● ОФЛАЙН",
        "live": "● В ЕФІРІ",
        "lang_toggle": "🇺🇸 EN",
        "theme_toggle": "🌓 ТЕМА",
        "failures": ["НОРМА", "ВІДМОВА ПВД", "ВІДМОВА ДВИГУНА", "ЗАКЛИНЮВАННЯ", "СЛАБКИЙ СИГНАЛ", "ЗАТРИМКА", "БАТАРЕЯ", "ПЕРЕГРІВ"],
        "routes_btn": ["Патруль міста", "Траса E40", "Обліт кордону", "На базу"],
        "metrics": ["ВИСОТА (м)", "ШВИД. (км/год)", "ШИРОТА", "ДОВГОТА", 
                    "БАТАРЕЯ (%)", "ТЯГА (%)", "ТЕМП (°C)", "RSSI (дБм)", "ЗАТРИМКА (мс)"],
        "log_start": "Трансляцію розпозочато.",
        "log_stop": "Трансляцію зупинено.",
        "log_route": "Зміна маршруту на"
    }
}

class UavSimulatorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("SkySentinel | Operator Console")
        self.root.geometry("750x900")
        
        self.sio = socketio.Client(handle_sigint=False)
        self.running = False
        self.failure_mode = "NORMAL"
        self.lang = "EN" # Default Language
        self.theme = "DARK"
        self.colors = THEMES[self.theme]
        
        self.root.configure(bg=self.colors["bg_main"])
        
        self.state = {
            "latitude": 50.4501, "longitude": 30.5234, "altitude": 150.0,
            "verticalSpeed": 0.0, "airspeed": 85.0, "groundSpeed": 82.0,
            "pitch": 2.0, "roll": 0.0, "throttle": 65.0, "servoCurrent": 0.8,
            "gear_status": 0, "battery_level": 95.0, "temperature": 42.0,
            "rssi": -62.0, "latency": 28.0
        }
        
        self.target_lat = self.state["latitude"]
        self.target_lon = self.state["longitude"]
        self.tick = 0.0
        self.current_route = "BASE"
        
        # UI Element References for dynamic translation and theme
        self.telemetry_labels = {} 
        self.ui_refs = {
            "fail_btns": [],
            "route_btns": [],
            "metric_labels": [],
            "metric_frames": [],
            "frames": []
        }
        
        self.setup_ui()
        self.root.protocol("WM_DELETE_WINDOW", self.on_exit)

    def setup_ui(self):
        t = TEXTS[self.lang]
        c = self.colors

        # --- HEADER ---
        self.header_frame = tk.Frame(self.root, bg=c["bg_main"])
        self.header_frame.pack(fill="x", padx=20, pady=(20, 10))
        
        self.title_lbl = tk.Label(self.header_frame, text="SKYSENTINEL", font=FONTS["header"], 
                 fg=c["accent_primary"], bg=c["bg_main"])
        self.title_lbl.pack(side="left")
        
        self.status_indicator = tk.Label(self.header_frame, text=t["offline"], font=FONTS["sub_header"],
                                         fg=c["text_dim"], bg=c["bg_main"])
        self.status_indicator.pack(side="right", anchor="center")

        self.theme_btn = tk.Button(self.header_frame, text=t["theme_toggle"], font=FONTS["sub_header"],
                                  bg=c["btn_bg"], fg=c["btn_fg"],
                                  activebackground=c["accent_primary"],
                                  relief="flat", cursor="hand2", command=self.toggle_theme)
        self.theme_btn.pack(side="right", padx=(10, 0))

        self.lang_btn = tk.Button(self.header_frame, text=t["lang_toggle"], font=FONTS["sub_header"],
                                  bg=c["btn_bg"], fg=c["btn_fg"],
                                  activebackground=c["accent_primary"],
                                  relief="flat", cursor="hand2", command=self.toggle_language)
        self.lang_btn.pack(side="right", padx=(10, 0))

        self.main_container = tk.Frame(self.root, bg=c["bg_main"])
        self.main_container.pack(fill="both", expand=True, padx=20)

        # --- LEFT COLUMN ---
        left_col = tk.Frame(self.main_container, bg=c["bg_main"])
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 10))
        self.ui_refs["frames"].append(left_col)

        # 1. Diagnostics
        self.fail_frame = tk.LabelFrame(left_col, text=t["diag"], font=FONTS["sub_header"],
                                   bg=c["bg_main"], fg=c["text_dim"], bd=1, relief="solid")
        self.fail_frame.pack(fill="x", pady=10, ipady=5)
        self.ui_refs["frames"].append(self.fail_frame)

        fail_modes = ["NORMAL", "PITOT", "ENGINE", "SERVO", "SIGNAL", "LATENCY", "BATTERY", "TEMP"]
        for i, mode in enumerate(fail_modes):
            r, c_idx = divmod(i, 2)
            btn = tk.Button(self.fail_frame, text=t["failures"][i], font=FONTS["body"],
                            bg=c["bg_panel"], fg=c["text_main"],
                            activebackground=c["accent_primary"],
                            relief="flat", borderwidth=0, cursor="hand2",
                            command=lambda m=mode: self.set_failure(m))
            btn.grid(row=r, column=c_idx, sticky="ew", padx=5, pady=5)
            self.ui_refs["fail_btns"].append(btn)
            
        self.fail_frame.grid_columnconfigure(0, weight=1)
        self.fail_frame.grid_columnconfigure(1, weight=1)

        # --- FLIGHT ROUTES PANEL ---
        self.route_frame = tk.LabelFrame(left_col, text=t["routes"], font=FONTS["sub_header"],
                                   bg=c["bg_main"], fg=c["text_dim"], bd=1, relief="solid")
        self.route_frame.pack(fill="x", pady=10, ipady=5)
        self.ui_refs["frames"].append(self.route_frame)

        route_modes = ["CITY_ROAD", "HIGHWAY", "BORDER", "BASE"]
        for i, mode in enumerate(route_modes):
            r, c_idx = divmod(i, 2)
            btn = tk.Button(self.route_frame, text=t["routes_btn"][i], font=FONTS["body"],
                            bg=c["bg_panel"], fg=c["text_main"],
                            activebackground=c["accent_primary"],
                            relief="flat", borderwidth=0, cursor="hand2",
                            command=lambda m=mode: self.set_route(m))
            btn.grid(row=r, column=c_idx, sticky="ew", padx=5, pady=5)
            self.ui_refs["route_btns"].append(btn)
            
        self.route_frame.grid_columnconfigure(0, weight=1)
        self.route_frame.grid_columnconfigure(1, weight=1)

        # 2. Connection Control
        self.start_btn = tk.Button(left_col, text=t["start"], font=FONTS["header"],
                                   bg=c["accent_primary"], fg="white", activebackground=c["accent_primary"],
                                   relief="flat", height=2, command=self.start_sim)
        self.start_btn.pack(fill="x", pady=(20, 0))

        # --- RIGHT COLUMN ---
        right_col = tk.Frame(self.main_container, bg=c["bg_main"])
        right_col.pack(side="right", fill="both", expand=True, padx=(10, 0))
        self.ui_refs["frames"].append(right_col)

        self.tele_frame = tk.LabelFrame(right_col, text=t["tele"], font=FONTS["sub_header"],
                                   bg=c["bg_main"], fg=c["text_dim"], bd=1, relief="solid")
        self.tele_frame.pack(fill="x", pady=10)
        self.ui_refs["frames"].append(self.tele_frame)

        metric_keys = ["altitude", "airspeed", "latitude", "longitude", "battery_level", "throttle", "temperature", "rssi", "latency"]
        for i, key in enumerate(metric_keys):
            r, c_idx = divmod(i, 2)
            cell = tk.Frame(self.tele_frame, bg=c["bg_panel"], padx=10, pady=5)
            cell.grid(row=r, column=c_idx, sticky="ew", padx=2, pady=2)
            self.ui_refs["metric_frames"].append(cell)
            
            lbl = tk.Label(cell, text=t["metrics"][i], font=FONTS["data_label"], fg=c["text_dim"], bg=c["bg_panel"])
            lbl.pack(anchor="w")
            self.ui_refs["metric_labels"].append(lbl)
            
            val = tk.Label(cell, text="--", font=FONTS["data_value"], fg=c["accent_primary"], bg=c["bg_panel"])
            val.pack(anchor="e")
            self.telemetry_labels[key] = val
            
        self.tele_frame.grid_columnconfigure(0, weight=1)
        self.tele_frame.grid_columnconfigure(1, weight=1)
        if len(metric_keys) > 8: self.tele_frame.grid_columnconfigure(2, weight=1)

        self.log_area = scrolledtext.ScrolledText(right_col, height=12, bg=c["terminal_bg"], 
                                                  fg=c["terminal_text"], font=FONTS["mono"],
                                                  insertbackground=c["terminal_text"])
        self.log_area.pack(fill="both", expand=True)

    def toggle_theme(self):
        """Switches between DARK and LIGHT themes."""
        self.theme = "LIGHT" if self.theme == "DARK" else "DARK"
        self.colors = THEMES[self.theme]
        c = self.colors
        t = TEXTS[self.lang]

        self.root.configure(bg=c["bg_main"])
        self.header_frame.config(bg=c["bg_main"])
        self.main_container.config(bg=c["bg_main"])
        self.title_lbl.config(bg=c["bg_main"], fg=c["accent_primary"])
        self.status_indicator.config(bg=c["bg_main"], fg=c["accent_success"] if self.running else c["text_dim"])
        self.theme_btn.config(bg=c["btn_bg"], fg=c["btn_fg"], text=t["theme_toggle"])
        self.lang_btn.config(bg=c["btn_bg"], fg=c["btn_fg"])
        
        self.start_btn.config(bg=c["accent_danger"] if self.running else c["accent_primary"])
        
        for frame in self.ui_refs["frames"]:
            frame.config(bg=c["bg_main"], fg=c["text_dim"] if isinstance(frame, tk.LabelFrame) else None)
            
        for btn in self.ui_refs["fail_btns"] + self.ui_refs["route_btns"]:
            btn.config(bg=c["bg_panel"], fg=c["text_main"])
            
        for cell in self.ui_refs["metric_frames"]:
            cell.config(bg=c["bg_panel"])
            
        for lbl in self.ui_refs["metric_labels"]:
            lbl.config(bg=c["bg_panel"], fg=c["text_dim"])
            
        for val in self.telemetry_labels.values():
            val.config(bg=c["bg_panel"], fg=c["accent_primary"])
            
        self.log_area.config(bg=c["terminal_bg"], fg=c["terminal_text"], insertbackground=c["terminal_text"])

    def toggle_language(self):
        """Swaps the language and updates all tracked UI elements instantly."""
        self.lang = "UA" if self.lang == "EN" else "EN"
        t = TEXTS[self.lang]
        c = self.colors
        
        # Update standalone widgets
        self.lang_btn.config(text=t["lang_toggle"])
        self.theme_btn.config(text=t["theme_toggle"])
        self.status_indicator.config(text=t["live"] if self.running else t["offline"])
        self.start_btn.config(text=t["stop"] if self.running else t["start"])
        self.fail_frame.config(text=t["diag"])
        self.route_frame.config(text=t["routes"])
        self.tele_frame.config(text=t["tele"])
        
        # Update lists of widgets
        for i, btn in enumerate(self.ui_refs["fail_btns"]):
            btn.config(text=t["failures"][i])
            
        for i, btn in enumerate(self.ui_refs["route_btns"]):
            btn.config(text=t["routes_btn"][i])
            
        for i, lbl in enumerate(self.ui_refs["metric_labels"]):
            lbl.config(text=t["metrics"][i])

    def set_failure(self, mode):
        """
        Класифікація відмов за Лекцією №4 (Апаратні, Програмні, Функціональні)
        та Лекцією №10 (Метод аналітичної надлишковості).
        """
        self.failure_mode = mode
        
        # Словник для логування з термінологією лекцій
        descriptions = {
            "EN": {
                "NORMAL": "Standard operation state (Normal)",
                "PITOT": "Pitot tube functional failure",
                "ENGINE": "Gradual engine failure (Thrust degradation)",
                "SERVO": "Servo hardware failure (Critical stall)",
                "SIGNAL": "Radio link degradation (Low RSSI)",
                "LATENCY": "Network congestion (High latency)",
                "BATTERY": "Power supply degradation (Critical Voltage)",
                "TEMP": "Thermal overload (Hardware Overheat)"
            },
            "UA": {
                "NORMAL": "Стан штатного функціонування (Норма)",
                "PITOT": "Функціональна відмова ПВД",
                "ENGINE": "Поступова відмова силової установки",
                "SERVO": "Апаратна відмова виконавчого механізму",
                "SIGNAL": "Деградація каналу зв'язку (Низький RSSI)",
                "LATENCY": "Перевантаження мережі (Висока затримка)",
                "BATTERY": "Деградація системи живлення (Розряд)",
                "TEMP": "Термічне перевантаження (Перегрів)"
            }
        }
        color = self.colors["accent_danger"] if mode != "NORMAL" else self.colors["accent_success"]
        self.log(f"CIUS_STATE >> {descriptions[self.lang].get(mode, mode)}", color)

    def set_route(self, route):
        self.log(f"ROUTE_CMD >> {TEXTS[self.lang]['log_route']} {route}", self.colors["accent_primary"])
        self.current_route = route
        
        if route == "CITY_ROAD":
            self.target_lat = 50.4501
            self.target_lon = 30.5234
        elif route == "HIGHWAY":
            self.target_lat = 50.3950
            self.target_lon = 30.6120
        elif route == "BORDER":
            self.target_lat = 50.5100
            self.target_lon = 30.4000
        elif route == "BASE":
            self.target_lat = 50.4100
            self.target_lon = 30.5000

    def log(self, msg, color=None):
        self.log_area.insert(tk.END, f"[{datetime.now().strftime('%H:%M:%S')}] {msg}\n") 
        self.log_area.see(tk.END)
    
    def calc_checksum(self, d):
        s = "|".join([f"{k}:{format(round(float(d[k]), 4) + 0.0, 'g')}" if isinstance(d[k], (int, float)) else f"{k}:{d[k]}" for k in sorted(d.keys())])
        c = 0
        for char in s: c ^= ord(char)
        return hex(c)[2:].upper().zfill(2)

    def sim_loop(self):
        while self.running:
            # --- ЛЕКЦІЯ №10: МОДЕЛЮВАННЯ ФІЗИЧНИХ ПРОЦЕСІВ ---
            
            # Рандомні коливання для Latency та RSSI (Штатна робота)
            self.state["rssi"] = round(random.uniform(-65, -58), 1)
            self.state["latency"] = round(random.uniform(25, 45), 1)

            if self.failure_mode == "PITOT":
                # Сценарій: Закупорка приймача повітряного тиску (ПВД)
                self.state["airspeed"] = 10.2 
                self.state["verticalSpeed"] = round(random.uniform(-0.1, 0.1), 1)
                
            elif self.failure_mode == "ENGINE":
                # Сценарій: Деградація силової установки
                self.state["throttle"] = 100.0
                if self.state["altitude"] > 10:
                    self.state["altitude"] -= 5.8
                if self.state["airspeed"] > 10:
                    self.state["airspeed"] -= 1.5
                    
            elif self.failure_mode == "SERVO":
                # Сценарій: Заклинювання привода (Апаратна відмова)
                self.state["servoCurrent"] = 4.9
                self.state["roll"] = random.uniform(15.0, 45.0)

            elif self.failure_mode == "SIGNAL":
                # Сценарій: Слабкий сигнал
                self.state["rssi"] = round(random.uniform(-95, -88), 1)
                self.state["latency"] = round(random.uniform(100, 300), 1)
            
            elif self.failure_mode == "LATENCY":
                # Сценарій: Висока затримка
                self.state["latency"] = round(random.uniform(800, 2500), 1)
                
            elif self.failure_mode == "BATTERY":
                # Сценарій: Швидкий розряд АКБ
                self.state["battery_level"] -= round(random.uniform(2.0, 5.0), 1)
                if self.state["battery_level"] < 0: self.state["battery_level"] = 0
                
            elif self.failure_mode == "TEMP":
                # Сценарій: Перегрів електроніки
                self.state["temperature"] += round(random.uniform(1.5, 3.0), 1)
                if self.state["temperature"] > 100: self.state["temperature"] = 100.0
                
            else:
                # NORMAL: Штатна робота
                self.state["airspeed"] = round(random.uniform(84, 86), 1)
                self.state["verticalSpeed"] = round(random.uniform(-0.1, 0.1), 1)
                self.state["servoCurrent"] = round(random.uniform(0.6, 0.9), 1)
                self.state["altitude"] += self.state["verticalSpeed"]
                
                # Поступовий розряд та стабілізація темп
                self.state["battery_level"] -= 0.05
                if self.state["temperature"] > 42: self.state["temperature"] -= 0.5
                elif self.state["temperature"] < 40: self.state["temperature"] += 0.5


            self.tick += 0.2 
            
            if self.current_route == "CITY_ROAD":
                dyn_lat = self.target_lat + (math.sin(self.tick) * 0.005)
                dyn_lon = self.target_lon + (math.cos(self.tick) * 0.005)
            elif self.current_route == "BORDER":
                dyn_lat = self.target_lat + (math.sin(self.tick) * 0.008)
                dyn_lon = self.target_lon + (math.sin(self.tick * 2) * 0.008)
            elif self.current_route == "HIGHWAY":
                dyn_lat = self.target_lat + (self.tick * 0.0005) 
                dyn_lon = self.target_lon + (math.sin(self.tick * 0.5) * 0.003) 
            else: 
                dyn_lat = self.target_lat
                dyn_lon = self.target_lon

            step = 0.004
            
            lat_diff = dyn_lat - self.state["latitude"]
            if abs(lat_diff) > step:
                self.state["latitude"] += step if lat_diff > 0 else -step
            else:
                self.state["latitude"] = dyn_lat
                
            lon_diff = dyn_lon - self.state["longitude"]
            if abs(lon_diff) > step:
                self.state["longitude"] += step if lon_diff > 0 else -step
            else:
                self.state["longitude"] = dyn_lon

            now = datetime.now(timezone.utc)
            self.state["timestamp"] = now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
            checksum = self.calc_checksum(self.state)
            packet = {"data": self.state.copy(), "checksum": checksum}
            
            try:
                self.sio.emit('telemetry', packet)
                self.root.after(0, self.update_telemetry_ui)
            except Exception as e:
                self.root.after(0, lambda: self.log(f"Emit Error: {e}", self.colors["accent_danger"]))

            time.sleep(0.8)

    def on_exit(self):
        self.running = False
        try:
            self.sio.disconnect()
        except:
            pass
        self.root.destroy()

    def update_telemetry_ui(self):
        for key, widget in self.telemetry_labels.items():
            if key in self.state:
                val = self.state[key]
                c = self.colors
                # --- ЛЕКЦІЯ №4: МОНІТОРИНГ ГРАНИЧНИХ ЗНАЧЕНЬ ---
                color = c["accent_primary"]
                if key == "latency":
                    if val > 800: color = c["accent_danger"]
                    elif val > 150: color = c["accent_warning"]
                elif key == "rssi":
                    if val < -85: color = c["accent_danger"]
                    elif val < -75: color = c["accent_warning"]
                elif key == "battery_level":
                    if val < 15: color = c["accent_danger"]
                    elif val < 30: color = c["accent_warning"]
                elif key == "temperature":
                    if val > 75: color = c["accent_danger"]
                    elif val > 60: color = c["accent_warning"]
                elif key == "servoCurrent":
                    if val > 4.0: color = c["accent_danger"]
                    elif val > 2.0: color = c["accent_warning"]

                if isinstance(val, float):
                    fmt = "{:.4f}" if key in ["latitude", "longitude"] else "{:.1f}"
                    text_val = fmt.format(val)
                else:
                    text_val = str(val)
                widget.config(text=text_val, fg=color)

    def start_sim(self):
        if not self.running:
            try:
                self.sio.connect(BACKEND_URL)
                self.running = True
                self.start_btn.config(text=TEXTS[self.lang]["stop"], bg=self.colors["accent_danger"])
                self.status_indicator.config(text=TEXTS[self.lang]["live"], fg=self.colors["accent_success"])
                threading.Thread(target=self.sim_loop, daemon=True).start()
                self.log(TEXTS[self.lang]["log_start"], self.colors["accent_success"])
            except Exception as e:
                self.log(f"Failed: {e}", self.colors["accent_danger"])
        else:
            self.running = False
            self.sio.disconnect()
            self.start_btn.config(text=TEXTS[self.lang]["start"], bg=self.colors["accent_primary"])
            self.status_indicator.config(text=TEXTS[self.lang]["offline"], fg=self.colors["text_dim"])
            self.log(TEXTS[self.lang]["log_stop"])

if __name__ == "__main__":
    root = tk.Tk()
    app = UavSimulatorGUI(root)
    root.mainloop()
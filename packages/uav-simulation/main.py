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
COLORS = {
    "bg_main": "#111827",
    "bg_panel": "#1f2937",
    "accent_primary": "#06b6d4",
    "accent_success": "#10b981",
    "accent_warning": "#f59e0b",
    "accent_danger": "#ef4444",
    "text_main": "#f3f4f6",
    "text_dim": "#9ca3af",
    "terminal_bg": "#000000",
    "terminal_text": "#22d3ee"
}

FONTS = {
    "header": ("Segoe UI", 16, "bold"),
    "sub_header": ("Segoe UI", 10, "bold"),
    "body": ("Segoe UI", 10),
    "mono": ("Consolas", 10),
    "data_label": ("Segoe UI", 9),
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
        "failures": ["NORMAL", "PITOT CLOG", "ENGINE FAIL", "SERVO STALL"],
        "routes_btn": ["City Patrol", "Highway E40", "Border Sweep", "Return Base"],
        "metrics": ["ALTITUDE (m)", "AIRSPEED (km/h)", "LATITUDE", "LONGITUDE", 
                    "BATTERY (%)", "THROTTLE (%)", "TEMP (°C)", "RSSI (dBm)"],
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
        "failures": ["НОРМА", "ВІДМОВА ПВД", "ВІДМОВА ДВИГУНА", "ЗАКЛИНЮВАННЯ"],
        "routes_btn": ["Патруль міста", "Траса E40", "Обліт кордону", "На базу"],
        "metrics": ["ВИСОТА (м)", "ШВИД. (км/год)", "ШИРОТА", "ДОВГОТА", 
                    "БАТАРЕЯ (%)", "ТЯГА (%)", "ТЕМП (°C)", "RSSI (дБм)"],
        "log_start": "Трансляцію розпочато.",
        "log_stop": "Трансляцію зупинено.",
        "log_route": "Зміна маршруту на"
    }
}

class UavSimulatorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("SkySentinel | Operator Console")
        self.root.geometry("700x850")
        self.root.configure(bg=COLORS["bg_main"])
        
        self.sio = socketio.Client(handle_sigint=False)
        self.running = False
        self.failure_mode = "NORMAL"
        self.lang = "EN" # Default Language
        
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
        
        # UI Element References for dynamic translation
        self.telemetry_labels = {} 
        self.ui_refs = {
            "fail_btns": [],
            "route_btns": [],
            "metric_labels": []
        }
        
        self.setup_ui()
        self.root.protocol("WM_DELETE_WINDOW", self.on_exit)

    def setup_ui(self):
        t = TEXTS[self.lang]

        # --- HEADER ---
        header_frame = tk.Frame(self.root, bg=COLORS["bg_main"])
        header_frame.pack(fill="x", padx=20, pady=(20, 10))
        
        tk.Label(header_frame, text="SKYSENTINEL", font=("Segoe UI", 22, "bold"), 
                 fg=COLORS["accent_primary"], bg=COLORS["bg_main"]).pack(side="left")
        
        self.status_indicator = tk.Label(header_frame, text=t["offline"], font=FONTS["sub_header"],
                                         fg=COLORS["text_dim"], bg=COLORS["bg_main"])
        self.status_indicator.pack(side="right", anchor="center")

        self.lang_btn = tk.Button(header_frame, text=t["lang_toggle"], font=FONTS["sub_header"],
                                  bg=COLORS["bg_panel"], fg=COLORS["text_main"],
                                  activebackground=COLORS["accent_primary"],
                                  relief="flat", cursor="hand2", command=self.toggle_language)
        self.lang_btn.pack(side="right", padx=(10, 10))

        main_container = tk.Frame(self.root, bg=COLORS["bg_main"])
        main_container.pack(fill="both", expand=True, padx=20)

        # --- LEFT COLUMN ---
        left_col = tk.Frame(main_container, bg=COLORS["bg_main"])
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 10))

        # 1. Diagnostics
        self.fail_frame = tk.LabelFrame(left_col, text=t["diag"], font=FONTS["sub_header"],
                                   bg=COLORS["bg_main"], fg=COLORS["text_dim"], bd=1, relief="solid")
        self.fail_frame.pack(fill="x", pady=10, ipady=5)

        fail_modes = ["NORMAL", "PITOT", "ENGINE", "SERVO"]
        for i, mode in enumerate(fail_modes):
            r, c = divmod(i, 2)
            btn = tk.Button(self.fail_frame, text=t["failures"][i], font=FONTS["body"],
                            bg=COLORS["bg_panel"], fg=COLORS["text_main"],
                            activebackground=COLORS["accent_primary"],
                            relief="flat", borderwidth=0, cursor="hand2",
                            command=lambda m=mode: self.set_failure(m))
            btn.grid(row=r, column=c, sticky="ew", padx=5, pady=5)
            self.ui_refs["fail_btns"].append(btn)
            
        self.fail_frame.grid_columnconfigure(0, weight=1)
        self.fail_frame.grid_columnconfigure(1, weight=1)

        # --- FLIGHT ROUTES PANEL ---
        self.route_frame = tk.LabelFrame(left_col, text=t["routes"], font=FONTS["sub_header"],
                                   bg=COLORS["bg_main"], fg=COLORS["text_dim"], bd=1, relief="solid")
        self.route_frame.pack(fill="x", pady=10, ipady=5)

        route_modes = ["CITY_ROAD", "HIGHWAY", "BORDER", "BASE"]
        for i, mode in enumerate(route_modes):
            r, c = divmod(i, 2)
            btn = tk.Button(self.route_frame, text=t["routes_btn"][i], font=FONTS["body"],
                            bg=COLORS["bg_panel"], fg=COLORS["text_main"],
                            activebackground=COLORS["accent_primary"],
                            relief="flat", borderwidth=0, cursor="hand2",
                            command=lambda m=mode: self.set_route(m))
            btn.grid(row=r, column=c, sticky="ew", padx=5, pady=5)
            self.ui_refs["route_btns"].append(btn)
            
        self.route_frame.grid_columnconfigure(0, weight=1)
        self.route_frame.grid_columnconfigure(1, weight=1)

        # 2. Connection Control
        self.start_btn = tk.Button(left_col, text=t["start"], font=("Segoe UI", 12, "bold"),
                                   bg="#2563eb", fg="white", activebackground="#1d4ed8",
                                   relief="flat", height=2, command=self.start_sim)
        self.start_btn.pack(fill="x", pady=(20, 0))

        # --- RIGHT COLUMN ---
        right_col = tk.Frame(main_container, bg=COLORS["bg_main"])
        right_col.pack(side="right", fill="both", expand=True, padx=(10, 0))

        self.tele_frame = tk.LabelFrame(right_col, text=t["tele"], font=FONTS["sub_header"],
                                   bg=COLORS["bg_main"], fg=COLORS["text_dim"], bd=1, relief="solid")
        self.tele_frame.pack(fill="x", pady=10)

        metric_keys = ["altitude", "airspeed", "latitude", "longitude", "battery_level", "throttle", "temperature", "rssi"]
        for i, key in enumerate(metric_keys):
            r, c = divmod(i, 2)
            cell = tk.Frame(self.tele_frame, bg=COLORS["bg_panel"], padx=10, pady=5)
            cell.grid(row=r, column=c, sticky="ew", padx=2, pady=2)
            
            lbl = tk.Label(cell, text=t["metrics"][i], font=FONTS["data_label"], fg=COLORS["text_dim"], bg=COLORS["bg_panel"])
            lbl.pack(anchor="w")
            self.ui_refs["metric_labels"].append(lbl)
            
            val = tk.Label(cell, text="--", font=FONTS["data_value"], fg=COLORS["accent_primary"], bg=COLORS["bg_panel"])
            val.pack(anchor="e")
            self.telemetry_labels[key] = val
            
        self.tele_frame.grid_columnconfigure(0, weight=1)
        self.tele_frame.grid_columnconfigure(1, weight=1)

        self.log_area = scrolledtext.ScrolledText(right_col, height=12, bg=COLORS["terminal_bg"], 
                                                  fg=COLORS["terminal_text"], font=FONTS["mono"])
        self.log_area.pack(fill="both", expand=True)

    def toggle_language(self):
        """Swaps the language and updates all tracked UI elements instantly."""
        self.lang = "UA" if self.lang == "EN" else "EN"
        t = TEXTS[self.lang]
        
        # Update standalone widgets
        self.lang_btn.config(text=t["lang_toggle"])
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
                "SERVO": "Servo hardware failure (Critical stall)"
            },
            "UA": {
                "NORMAL": "Стан штатного функціонування (Норма)",
                "PITOT": "Функціональна відмова ПВД",
                "ENGINE": "Поступова відмова силової установки",
                "SERVO": "Апаратна відмова виконавчого механізму"
            }
        }
        color = COLORS["accent_danger"] if mode != "NORMAL" else COLORS["accent_success"]
        self.log(f"CIUS_STATE >> {descriptions[self.lang].get(mode, mode)}", color)

    def set_route(self, route):
        self.log(f"ROUTE_CMD >> {TEXTS[self.lang]['log_route']} {route}", COLORS["accent_primary"])
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
            
            if self.failure_mode == "PITOT":
                # Сценарій: Закупорка приймача повітряного тиску (ПВД)
                # Результат: Airspeed (датчик) падає, але GroundSpeed (фізичний рух) стабільний.
                # Це створює "Нев'язку" (Residual) для алгоритму виявлення.
                self.state["airspeed"] = 10.2 
                self.state["verticalSpeed"] = round(random.uniform(-0.1, 0.1), 1)
                
            elif self.failure_mode == "ENGINE":
                # Сценарій: Деградація енергетичних параметрів (Лекція №8-9)
                # Результат: Throttle 100%, але VerticalSpeed < 0 (Втрата висоти).
                # Доводить неможливість виконання польотного завдання.
                self.state["throttle"] = 100.0
                if self.state["verticalSpeed"] > 10:
                    self.state["verticalSpeed"] = -5.8 
                if self.state["altitude"] > 10:
                    self.state["altitude"] -= 5.8
                if self.state["airspeed"] > 10:
                    self.state["airspeed"] -= 1.5
                    
            elif self.failure_mode == "SERVO":
                # Сценарій: Заклинювання привода (Апаратна відмова)
                # Результат: Струм (servoCurrent) перевищує поріг 4.0А.
                # Лекція №10: Контроль непрямих параметрів стану.
                self.state["servoCurrent"] = 4.9
                self.state["roll"] = random.uniform(15.0, 45.0)
                
            else:
                # NORMAL: Штатна робота CIUS
                # Параметри знаходяться в межах допусків (Dormant errors absent)
                self.state["airspeed"] = round(random.uniform(84, 86), 1)
                self.state["verticalSpeed"] = round(random.uniform(-0.1, 0.1), 1)
                self.state["servoCurrent"] = round(random.uniform(0.6, 0.9), 1)
                self.state["altitude"] += self.state["verticalSpeed"]

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
                self.root.after(0, lambda: self.log(f"Emit Error: {e}", COLORS["accent_danger"]))

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
                if isinstance(val, float):
                    fmt = "{:.4f}" if key in ["latitude", "longitude"] else "{:.1f}"
                    text_val = fmt.format(val)
                else:
                    text_val = str(val)
                widget.config(text=text_val)

    def start_sim(self):
        if not self.running:
            try:
                self.sio.connect(BACKEND_URL)
                self.running = True
                self.start_btn.config(text=TEXTS[self.lang]["stop"], bg=COLORS["accent_danger"])
                self.status_indicator.config(text=TEXTS[self.lang]["live"], fg=COLORS["accent_success"])
                threading.Thread(target=self.sim_loop, daemon=True).start()
                self.log(TEXTS[self.lang]["log_start"], COLORS["accent_success"])
            except Exception as e:
                self.log(f"Failed: {e}", COLORS["accent_danger"])
        else:
            self.running = False
            self.sio.disconnect()
            self.start_btn.config(text=TEXTS[self.lang]["start"], bg="#2563eb")
            self.status_indicator.config(text=TEXTS[self.lang]["offline"], fg=COLORS["text_dim"])
            self.log(TEXTS[self.lang]["log_stop"])

if __name__ == "__main__":
    root = tk.Tk()
    app = UavSimulatorGUI(root)
    root.mainloop()
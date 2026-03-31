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
        "bg_main": "#000000",
        "bg_panel": "#0a0a0a",
        "border": "#27272a",
        "accent_primary": "#10b981",
        "accent_success": "#10b981",
        "accent_warning": "#f59e0b",
        "accent_danger": "#ef4444",
        "text_main": "#ffffff",
        "text_dim": "#a1a1aa",
        "terminal_bg": "#000000",
        "terminal_text": "#10b981",
        "btn_bg": "#18181b",
        "btn_fg": "#ffffff"
    },
    "LIGHT": {
        "bg_main": "#ffffff",
        "bg_panel": "#f4f4f5",
        "border": "#e4e4e7",
        "accent_primary": "#059669",
        "accent_success": "#059669",
        "accent_warning": "#d97706",
        "accent_danger": "#dc2626",
        "text_main": "#09090b",
        "text_dim": "#52525b",
        "terminal_bg": "#f4f4f5",
        "terminal_text": "#064e3b",
        "btn_bg": "#e4e4e7",
        "btn_fg": "#09090b"
    }
}

FONTS = {
    "header":     ("Consolas", 18, "bold"),
    "sub_header": ("Consolas", 10, "bold"),
    "body":       ("Consolas", 10),
    "mono":       ("Consolas", 10),
    "data_label": ("Consolas", 9),
    "data_value": ("Consolas", 12, "bold")
}

# --- TRANSLATIONS ---
TEXTS = {
    "EN": {
        "diag":         "DIAGNOSTICS",
        "routes":       "FLIGHT ROUTES",
        "tele":         "LIVE TELEMETRY",
        "start":        "START STREAM",
        "stop":         "STOP STREAM",
        "offline":      "● OFFLINE",
        "live":         "● LIVE",
        "lang_toggle":  "🇺🇦 UA",
        "theme_toggle": "🌓 THEME",
        "failures": [
            "NORMAL", "PITOT CLOG", "ENGINE FAIL",
            "SERVO STALL", "SIGNAL LOSS", "HIGH LAG",
            "LOW BATTERY", "OVERHEAT"
        ],
        "routes_btn": ["City Patrol", "Highway E40", "Border Sweep", "Return Base"],
        # metric display labels — order matches METRIC_KEYS below
        "metrics": [
            "ALT REL (m)", "AIRSPEED (m/s)", "GROUNDSPEED (m/s)",
            "HEADING (°)", "LATITUDE", "LONGITUDE",
            "BATT REM (%)", "SERVO CURR (A)", "RSSI",
            "CAM STATUS", "SIGNAL QUAL (%)", "LOITER R (m)"
        ],
        "log_start": "Stream started.",
        "log_stop":  "Stream stopped.",
        "log_route": "Redirecting to"
    },
    "UA": {
        "diag":         "ДІАГНОСТИКА",
        "routes":       "ПОЛЬОТНІ МАРШРУТИ",
        "tele":         "ЖИВА ТЕЛЕМЕТРІЯ",
        "start":        "ПОЧАТИ ТРАНСЛЯЦІЮ",
        "stop":         "ЗУПИНИТИ ТРАНСЛЯЦІЮ",
        "offline":      "● ОФЛАЙН",
        "live":         "● В ЕФІРІ",
        "lang_toggle":  "🇺🇸 EN",
        "theme_toggle": "🌓 ТЕМА",
        "failures": [
            "НОРМА", "ВІДМОВА ПВД", "ВІДМОВА ДВИГУНА",
            "ЗАКЛИНЮВАННЯ", "СЛАБКИЙ СИГНАЛ", "ЗАТРИМКА",
            "БАТАРЕЯ", "ПЕРЕГРІВ"
        ],
        "routes_btn": ["Патруль міста", "Траса E40", "Обліт кордону", "На базу"],
        "metrics": [
            "ВИСОТА ВІД. (м)", "ПОВІТР. ШВ. (м/с)", "ЗЕМНА ШВ. (м/с)",
            "КУРС (°)", "ШИРОТА", "ДОВГОТА",
            "БАТАРЕЯ (%)", "СТРУМ СЕРВО (А)", "RSSI",
            "КАМ. СТАТУС", "ЯКІСТЬ СИГ. (%)", "РАДІУС ЛОТ. (м)"
        ],
        "log_start": "Трансляцію розпочато.",
        "log_stop":  "Трансляцію зупинено.",
        "log_route": "Зміна маршруту на"
    }
}

METRIC_KEYS = [
    "alt_rel", "airspeed", "groundspeed",
    "heading", "lat", "lon",
    "batt_rem", "servo_current", "rssi",
    "cam_status", "signal_quality", "loiter_radius"
]


class UavSimulatorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("SkySentinel | Operator Console")
        self.root.geometry("800x960")

        self.sio = socketio.Client(handle_sigint=False)
        self.running = False
        self.failure_mode = "NORMAL"
        self.lang = "EN"
        self.theme = "DARK"
        self.colors = THEMES[self.theme]

        self.root.configure(bg=self.colors["bg_main"])

        self.state = {
            # Navigation block
            "lat":      50.4501,
            "lon":      30.5234,
            "alt_rel":  350.0,       # metres above takeoff point
            "fix_type": 3,           # 0-6; <3 = unreliable GPS

            # Flight dynamics block
            "airspeed":    75.0,     # m/s
            "groundspeed": 72.0,     # m/s  — basis for analytical redundancy
            "heading":    120.0,     # degrees 0-359
            "pitch":        1.8,     # degrees  (positive = nose up)
            "roll":        -0.9,     # degrees  (positive = right bank)
            "throttle":    55.0,     # percent

            # Diagnostics block
            "batt_rem":      88.0,           # percent
            "servo_current":  1.2,           # Amperes
            "vibration":     [0.12, 0.09, 0.31],  # m/s²  [X, Y, Z]
            "rssi":          187,             # 0-254  (RC_CHANNELS compatible)

            # Recon-specific extensions
            "cam_status":     "ACTIVE",
            "signal_quality": 92,            # percent video-link quality
            "loiter_radius":  500,           # metres patrol radius
        }

        self.target_lat = self.state["lat"]
        self.target_lon = self.state["lon"]
        self.tick = 0.0
        self.current_route = "BASE"

        self.telemetry_labels = {}
        self.ui_refs = {
            "fail_btns":     [],
            "route_btns":    [],
            "metric_labels": [],
            "metric_frames": [],
            "frames":        []
        }

        self.setup_ui()
        self.root.protocol("WM_DELETE_WINDOW", self.on_exit)

    def setup_ui(self):
        t = TEXTS[self.lang]
        c = self.colors

        # HEADER
        self.header_frame = tk.Frame(self.root, bg=c["bg_main"])
        self.header_frame.pack(fill="x", padx=20, pady=(20, 10))

        self.title_lbl = tk.Label(
            self.header_frame, text="SKYSENTINEL",
            font=FONTS["header"], fg=c["accent_primary"], bg=c["bg_main"])
        self.title_lbl.pack(side="left")

        self.status_indicator = tk.Label(
            self.header_frame, text=t["offline"],
            font=FONTS["sub_header"], fg=c["text_dim"], bg=c["bg_main"])
        self.status_indicator.pack(side="right", anchor="center")

        self.theme_btn = tk.Button(
            self.header_frame, text=t["theme_toggle"], font=FONTS["sub_header"],
            bg=c["btn_bg"], fg=c["btn_fg"], activebackground=c["accent_primary"],
            relief="flat", cursor="hand2", command=self.toggle_theme)
        self.theme_btn.pack(side="right", padx=(10, 0))

        self.lang_btn = tk.Button(
            self.header_frame, text=t["lang_toggle"], font=FONTS["sub_header"],
            bg=c["btn_bg"], fg=c["btn_fg"], activebackground=c["accent_primary"],
            relief="flat", cursor="hand2", command=self.toggle_language)
        self.lang_btn.pack(side="right", padx=(10, 0))

        self.main_container = tk.Frame(self.root, bg=c["bg_main"])
        self.main_container.pack(fill="both", expand=True, padx=20)

        # LEFT COLUMN
        left_col = tk.Frame(self.main_container, bg=c["bg_main"])
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 10))
        self.ui_refs["frames"].append(left_col)

        # Diagnostics panel
        self.fail_frame = tk.LabelFrame(
            left_col, text=t["diag"], font=FONTS["sub_header"],
            bg=c["bg_main"], fg=c["text_dim"], bd=1, relief="solid")
        self.fail_frame.pack(fill="x", pady=10, ipady=5)
        self.ui_refs["frames"].append(self.fail_frame)

        fail_modes = ["NORMAL", "PITOT", "ENGINE", "SERVO", "SIGNAL", "LATENCY", "BATTERY", "TEMP"]
        for i, mode in enumerate(fail_modes):
            r, c_idx = divmod(i, 2)
            btn = tk.Button(
                self.fail_frame, text=t["failures"][i], font=FONTS["body"],
                bg=c["bg_panel"], fg=c["text_main"],
                activebackground=c["accent_primary"],
                relief="flat", borderwidth=0, cursor="hand2",
                command=lambda m=mode: self.set_failure(m))
            btn.grid(row=r, column=c_idx, sticky="ew", padx=5, pady=5)
            self.ui_refs["fail_btns"].append(btn)

        self.fail_frame.grid_columnconfigure(0, weight=1)
        self.fail_frame.grid_columnconfigure(1, weight=1)

        # Routes panel
        self.route_frame = tk.LabelFrame(
            left_col, text=t["routes"], font=FONTS["sub_header"],
            bg=c["bg_main"], fg=c["text_dim"], bd=1, relief="solid")
        self.route_frame.pack(fill="x", pady=10, ipady=5)
        self.ui_refs["frames"].append(self.route_frame)

        route_modes = ["CITY_ROAD", "HIGHWAY", "BORDER", "BASE"]
        for i, mode in enumerate(route_modes):
            r, c_idx = divmod(i, 2)
            btn = tk.Button(
                self.route_frame, text=t["routes_btn"][i], font=FONTS["body"],
                bg=c["bg_panel"], fg=c["text_main"],
                activebackground=c["accent_primary"],
                relief="flat", borderwidth=0, cursor="hand2",
                command=lambda m=mode: self.set_route(m))
            btn.grid(row=r, column=c_idx, sticky="ew", padx=5, pady=5)
            self.ui_refs["route_btns"].append(btn)

        self.route_frame.grid_columnconfigure(0, weight=1)
        self.route_frame.grid_columnconfigure(1, weight=1)

        # Start/Stop button
        self.start_btn = tk.Button(
            left_col, text=t["start"], font=FONTS["header"],
            bg=c["accent_primary"], fg="white",
            activebackground=c["accent_primary"],
            relief="flat", height=2, command=self.start_sim)
        self.start_btn.pack(fill="x", pady=(20, 0))

        # RIGHT COLUMN
        right_col = tk.Frame(self.main_container, bg=c["bg_main"])
        right_col.pack(side="right", fill="both", expand=True, padx=(10, 0))
        self.ui_refs["frames"].append(right_col)

        self.tele_frame = tk.LabelFrame(
            right_col, text=t["tele"], font=FONTS["sub_header"],
            bg=c["bg_main"], fg=c["text_dim"], bd=1, relief="solid")
        self.tele_frame.pack(fill="x", pady=10)
        self.ui_refs["frames"].append(self.tele_frame)

        for i, key in enumerate(METRIC_KEYS):
            r, c_idx = divmod(i, 2)
            cell = tk.Frame(self.tele_frame, bg=c["bg_panel"], padx=10, pady=5)
            cell.grid(row=r, column=c_idx, sticky="ew", padx=2, pady=2)
            self.ui_refs["metric_frames"].append(cell)

            lbl = tk.Label(cell, text=t["metrics"][i],
                           font=FONTS["data_label"], fg=c["text_dim"], bg=c["bg_panel"])
            lbl.pack(anchor="w")
            self.ui_refs["metric_labels"].append(lbl)

            val = tk.Label(cell, text="--",
                           font=FONTS["data_value"], fg=c["accent_primary"], bg=c["bg_panel"])
            val.pack(anchor="e")
            self.telemetry_labels[key] = val

        self.tele_frame.grid_columnconfigure(0, weight=1)
        self.tele_frame.grid_columnconfigure(1, weight=1)

        self.log_area = scrolledtext.ScrolledText(
            right_col, height=12,
            bg=c["terminal_bg"], fg=c["terminal_text"],
            font=FONTS["mono"], insertbackground=c["terminal_text"])
        self.log_area.pack(fill="both", expand=True)

    def toggle_theme(self):
        self.theme = "LIGHT" if self.theme == "DARK" else "DARK"
        self.colors = THEMES[self.theme]
        c = self.colors
        t = TEXTS[self.lang]

        self.root.configure(bg=c["bg_main"])
        self.header_frame.config(bg=c["bg_main"])
        self.main_container.config(bg=c["bg_main"])
        self.title_lbl.config(bg=c["bg_main"], fg=c["accent_primary"])
        self.status_indicator.config(
            bg=c["bg_main"],
            fg=c["accent_success"] if self.running else c["text_dim"])
        self.theme_btn.config(bg=c["btn_bg"], fg=c["btn_fg"], text=t["theme_toggle"])
        self.lang_btn.config(bg=c["btn_bg"], fg=c["btn_fg"])
        self.start_btn.config(
            bg=c["accent_danger"] if self.running else c["accent_primary"])

        for frame in self.ui_refs["frames"]:
            if isinstance(frame, tk.LabelFrame):
                frame.config(bg=c["bg_main"], fg=c["text_dim"])
            else:
                frame.config(bg=c["bg_main"])

        for btn in self.ui_refs["fail_btns"] + self.ui_refs["route_btns"]:
            btn.config(bg=c["bg_panel"], fg=c["text_main"])

        for cell in self.ui_refs["metric_frames"]:
            cell.config(bg=c["bg_panel"])

        for lbl in self.ui_refs["metric_labels"]:
            lbl.config(bg=c["bg_panel"], fg=c["text_dim"])

        for val in self.telemetry_labels.values():
            val.config(bg=c["bg_panel"], fg=c["accent_primary"])

        self.log_area.config(
            bg=c["terminal_bg"], fg=c["terminal_text"],
            insertbackground=c["terminal_text"])

    def toggle_language(self):
        self.lang = "UA" if self.lang == "EN" else "EN"
        t = TEXTS[self.lang]

        self.lang_btn.config(text=t["lang_toggle"])
        self.theme_btn.config(text=t["theme_toggle"])
        self.status_indicator.config(text=t["live"] if self.running else t["offline"])
        self.start_btn.config(text=t["stop"] if self.running else t["start"])
        self.fail_frame.config(text=t["diag"])
        self.route_frame.config(text=t["routes"])
        self.tele_frame.config(text=t["tele"])

        for i, btn in enumerate(self.ui_refs["fail_btns"]):
            btn.config(text=t["failures"][i])

        for i, btn in enumerate(self.ui_refs["route_btns"]):
            btn.config(text=t["routes_btn"][i])

        for i, lbl in enumerate(self.ui_refs["metric_labels"]):
            lbl.config(text=t["metrics"][i])

    def set_failure(self, mode):
        self.failure_mode = mode
        descriptions = {
            "EN": {
                "NORMAL":  "Standard operation (Normal)",
                "PITOT":   "Pitot tube functional failure → airspeed frozen",
                "ENGINE":  "Engine degradation → thrust loss, altitude drop",
                "SERVO":   "Servo hardware failure → servo_current spike + roll divergence",
                "SIGNAL":  "Radio link degradation → rssi critical",
                "LATENCY": "Network congestion → high latency",
                "BATTERY": "Power supply degradation → batt_rem drain",
                "TEMP":    "Thermal overload → electronics overheat"
            },
            "UA": {
                "NORMAL":  "Штатне функціонування (Норма)",
                "PITOT":   "Відмова ПВД → airspeed заморожено",
                "ENGINE":  "Деградація двигуна → втрата тяги, зниження висоти",
                "SERVO":   "Апаратна відмова серво → стрибок servo_current + крен",
                "SIGNAL":  "Деградація радіоканалу → rssi критичний",
                "LATENCY": "Перевантаження мережі → висока затримка",
                "BATTERY": "Деградація живлення → розряд batt_rem",
                "TEMP":    "Термічне перевантаження → перегрів електроніки"
            }
        }
        color = (self.colors["accent_danger"]
                 if mode != "NORMAL" else self.colors["accent_success"])
        self.log(f"FAULT >> {descriptions[self.lang].get(mode, mode)}", color)

    def set_route(self, route):
        self.log(
            f"ROUTE >> {TEXTS[self.lang]['log_route']} {route}",
            self.colors["accent_primary"])
        self.current_route = route

        coords = {
            "CITY_ROAD": (50.4501, 30.5234),
            "HIGHWAY":   (50.3950, 30.6120),
            "BORDER":    (50.5100, 30.4000),
            "BASE":      (50.4100, 30.5000),
        }
        self.target_lat, self.target_lon = coords.get(route, (self.state["lat"], self.state["lon"]))

    def log(self, msg, color=None):
        self.log_area.insert(tk.END, f"[{datetime.now().strftime('%H:%M:%S')}] {msg}\n")
        self.log_area.see(tk.END)

    def calc_checksum(self, d):
        """Simple XOR checksum over sorted key:value pairs (skips vibration vector)."""
        parts = []
        for k in sorted(d.keys()):
            v = d[k]
            if isinstance(v, list):
                parts.append(f"{k}:{','.join(str(round(x, 4)) for x in v)}")
            elif isinstance(v, float):
                parts.append(f"{k}:{round(v, 4):g}")
            else:
                parts.append(f"{k}:{v}")
        s = "|".join(parts)
        c = 0
        for ch in s:
            c ^= ord(ch)
        return hex(c)[2:].upper().zfill(2)

    def sim_loop(self):
        while self.running:

            # ── NORMAL baseline noise ────────────────────────────────────
            self.state["rssi"] = round(random.uniform(170, 210), 0)   # 0-254 scale
            vib_base = [
                round(random.uniform(0.08, 0.15), 3),
                round(random.uniform(0.06, 0.12), 3),
                round(random.uniform(0.25, 0.38), 3),
            ]
            self.state["vibration"] = vib_base

            # ── FAILURE SCENARIOS ────────────────────────────────────────
            if self.failure_mode == "PITOT":
                # Pitot clog: airspeed frozen; groundspeed continues normally
                # Analytical redundancy: airspeed vs groundspeed diverges → fault detected
                self.state["airspeed"] = 10.2

            elif self.failure_mode == "ENGINE":
                # Thrust degradation: throttle maxed, altitude and airspeed drop
                self.state["throttle"] = 100.0
                if self.state["alt_rel"] > 10:
                    self.state["alt_rel"] = round(self.state["alt_rel"] - 5.8, 1)
                if self.state["airspeed"] > 10:
                    self.state["airspeed"] = round(self.state["airspeed"] - 1.5, 1)

            elif self.failure_mode == "SERVO":
                # Servo stall: current spike + roll divergence
                self.state["servo_current"] = round(random.uniform(4.5, 5.2), 2)
                self.state["roll"] = round(random.uniform(15.0, 45.0), 1)
                # Vibration also spikes on the Y axis
                self.state["vibration"] = [
                    vib_base[0],
                    round(random.uniform(1.2, 2.5), 3),
                    vib_base[2],
                ]

            elif self.failure_mode == "SIGNAL":
                # REB / signal loss scenario
                self.state["rssi"] = round(random.uniform(20, 60), 0)
                self.state["signal_quality"] = random.randint(5, 25)
                self.state["cam_status"] = "DEGRADED"

            elif self.failure_mode == "LATENCY":
                # Network congestion — simulated via log only (real latency not in state)
                pass

            elif self.failure_mode == "BATTERY":
                # Rapid discharge
                self.state["batt_rem"] = round(
                    max(0.0, self.state["batt_rem"] - random.uniform(2.0, 5.0)), 1)

            elif self.failure_mode == "TEMP":
                # Electronics overheat — reflected via vibration Z (sensor drift)
                self.state["vibration"][2] = round(
                    min(5.0, self.state["vibration"][2] + random.uniform(0.3, 0.6)), 3)

            else:
                # ── NORMAL steady-state ──────────────────────────────────
                self.state["airspeed"]      = round(random.uniform(73, 77), 1)
                self.state["groundspeed"]   = round(self.state["airspeed"] - random.uniform(1.5, 4.0), 1)
                self.state["pitch"]         = round(random.uniform(1.2, 2.5), 1)
                self.state["roll"]          = round(random.uniform(-1.5, 1.5), 1)
                self.state["throttle"]      = round(random.uniform(52, 58), 1)
                self.state["servo_current"] = round(random.uniform(0.9, 1.4), 2)
                self.state["batt_rem"]      = round(max(0.0, self.state["batt_rem"] - 0.04), 1)
                self.state["signal_quality"] = random.randint(88, 96)
                self.state["cam_status"]    = "ACTIVE"
                self.state["fix_type"]      = 3

            # ── GPS: slow drift towards target ───────────────────────────
            self.tick += 0.2

            if self.current_route == "CITY_ROAD":
                dyn_lat = self.target_lat + math.sin(self.tick) * 0.005
                dyn_lon = self.target_lon + math.cos(self.tick) * 0.005
            elif self.current_route == "BORDER":
                dyn_lat = self.target_lat + math.sin(self.tick) * 0.008
                dyn_lon = self.target_lon + math.sin(self.tick * 2) * 0.008
            elif self.current_route == "HIGHWAY":
                dyn_lat = self.target_lat + self.tick * 0.0005
                dyn_lon = self.target_lon + math.sin(self.tick * 0.5) * 0.003
            else:
                dyn_lat = self.target_lat
                dyn_lon = self.target_lon

            step = 0.004
            for axis, dyn in [("lat", dyn_lat), ("lon", dyn_lon)]:
                diff = dyn - self.state[axis]
                if abs(diff) > step:
                    self.state[axis] = round(self.state[axis] + (step if diff > 0 else -step), 6)
                else:
                    self.state[axis] = round(dyn, 6)

            # Update heading to match direction of travel
            self.state["heading"] = round((math.degrees(math.atan2(
                dyn_lon - self.state["lon"],
                dyn_lat - self.state["lat"]
            )) + 360) % 360, 1)

            # ── BUILD PACKET ─────────────────────────────────────────────
            now = datetime.now(timezone.utc)
            self.state["timestamp"] = now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

            checksum = self.calc_checksum(self.state)
            packet = {"data": self.state.copy(), "checksum": checksum}

            try:
                self.sio.emit('telemetry', packet)
                self.root.after(0, self.update_telemetry_ui)
            except Exception as e:
                self.root.after(0, lambda err=e: self.log(
                    f"Emit Error: {err}", self.colors["accent_danger"]))

            time.sleep(0.8)

    def update_telemetry_ui(self):
        c = self.colors

        # Threshold rules per param
        thresholds = {
            "rssi":         [(80,  "danger"), (120, "warning")],   # lower = worse
            "batt_rem":     [(15,  "danger"), (30,  "warning")],   # lower = worse
            "servo_current":[(4.0, "danger"), (2.0, "warning")],   # higher = worse
            "signal_quality":[(20, "danger"), (50,  "warning")],   # lower = worse
        }

        for key, widget in self.telemetry_labels.items():
            if key not in self.state:
                continue

            val = self.state[key]
            color = c["accent_primary"]

            if key in thresholds:
                threshold_val, _ = thresholds[key][0]
                # For params where lower = worse
                if key in ("rssi", "batt_rem", "signal_quality"):
                    if isinstance(val, (int, float)):
                        if val < thresholds[key][0][0]:
                            color = c["accent_danger"]
                        elif val < thresholds[key][1][0]:
                            color = c["accent_warning"]
                # For params where higher = worse
                else:
                    if isinstance(val, (int, float)):
                        if val > thresholds[key][0][0]:
                            color = c["accent_danger"]
                        elif val > thresholds[key][1][0]:
                            color = c["accent_warning"]

            # cam_status colour
            if key == "cam_status":
                if val == "DEGRADED":
                    color = c["accent_warning"]
                elif val == "OFF":
                    color = c["accent_danger"]

            # Format display value
            if isinstance(val, list):
                # vibration vector
                text_val = f"[{val[0]:.2f}, {val[1]:.2f}, {val[2]:.2f}]"
            elif key in ("lat", "lon"):
                text_val = f"{val:.5f}"
            elif isinstance(val, float):
                text_val = f"{val:.1f}"
            elif isinstance(val, int):
                text_val = str(val)
            else:
                text_val = str(val)

            widget.config(text=text_val, fg=color)

    def start_sim(self):
        if not self.running:
            try:
                self.sio.connect(BACKEND_URL)
                self.running = True
                self.start_btn.config(
                    text=TEXTS[self.lang]["stop"],
                    bg=self.colors["accent_danger"])
                self.status_indicator.config(
                    text=TEXTS[self.lang]["live"],
                    fg=self.colors["accent_success"])
                threading.Thread(target=self.sim_loop, daemon=True).start()
                self.log(TEXTS[self.lang]["log_start"], self.colors["accent_success"])
            except Exception as e:
                self.log(f"Connection failed: {e}", self.colors["accent_danger"])
        else:
            self.running = False
            try:
                self.sio.disconnect()
            except Exception:
                pass
            self.start_btn.config(
                text=TEXTS[self.lang]["start"],
                bg=self.colors["accent_primary"])
            self.status_indicator.config(
                text=TEXTS[self.lang]["offline"],
                fg=self.colors["text_dim"])
            self.log(TEXTS[self.lang]["log_stop"])

    def on_exit(self):
        self.running = False
        try:
            self.sio.disconnect()
        except Exception:
            pass
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = UavSimulatorGUI(root)
    root.mainloop()
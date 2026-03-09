# 🚀 Frontend Feature Proposals: SkySentinel

Based on the current state of the UAV telemetry packets, backend logic, and database schema, here are the proposed features to enhance the SkySentinel frontend.

---

## 1. 🧠 AI-Powered Failure Deep-Dive
**Status:** Backend Ready (`AiService` exists).
**Proposed Feature:** When a failure is detected and logged, allow the user to click on the event to open an "AI Analysis" modal.
- **Visuals:** A clean, terminal-like interface showing the raw telemetry "evidence".
- **Content:** Display the `root_cause`, `severity`, `explanation`, and `suggested_action` returned by the Gemini AI integration.
- **Benefit:** Transforms raw error logs into actionable maintenance insights.

## 2. 🌍 Interactive 3D Flight & Attitude Viewer
**Status:** Telemetry Ready (`pitch`, `roll`, `altitude` available).
**Proposed Feature:** Replace or augment the 2D map with a 3D "Synthetic Vision" or "Attitude Indicator" (ADI).
- **Tech:** Use `Three.js` or `React Three Fiber`.
- **Functionality:** 
  - A 3D model of the UAV that tilts and rotates in real-time based on `pitch` and `roll`.
  - A "ribbon" altimeter and airspeed indicator on the sides (HUD style).
- **Benefit:** Provides immediate spatial awareness for the operator.

## 3. 📉 Advanced Analytical Redundancy Dashboard
**Status:** Backend Logic Ready (`FailuresService.checkPitotFailure`).
**Proposed Feature:** A dedicated tab for "System Integrity" showing correlations between sensors.
- **Charts:** Overlay `Airspeed` vs `GroundSpeed` on a single graph.
- **Visual Alert:** Highlight the area between the lines when the "Residual" (delta) exceeds the 15 km/h threshold.
- **Benefit:** Empirically demonstrates *why* a Pitot tube failure was diagnosed.

## 4. ⛽ Propulsion Efficiency Monitor
**Status:** Telemetry Ready (`throttle`, `verticalSpeed`, `battery_level`).
**Proposed Feature:** A "Thrust-to-Performance" widget.
- **Logic:** Plot `Throttle %` against `Vertical Speed (VSI)`.
- **Indicator:** If throttle is >80% but VSI is negative (losing altitude), show a "Propulsion Degraded" warning.
- **Energy Analytics:** Estimated remaining flight time based on current discharge rate and `battery_level`.

## 5. 📑 Automated Incident Reporting (PDF)
**Status:** Backend Concept Ready (`FailureReport` interface).
**Proposed Feature:** A "Generate Report" button on any resolved or critical failure log.
- **Action:** Frontend compiles the incident telemetry, the AI analysis, and the failsafe actions (e.g., "RTL - Return to Launch") into a downloadable PDF.
- **Use Case:** Official maintenance logs and post-flight analysis.

## 6. 🛰️ Connection & Signal Heatmap
**Status:** Telemetry Ready (`rssi`, `latency`).
**Proposed Feature:** Visualize signal quality over the flight path on the map.
- **Functionality:** The flight path line changes color based on `rssi` (Green = Strong, Yellow = Weak, Red = Critical/Laggy).
- **Benefit:** Helps operators identify "Dead Zones" in the radio coverage area.

## 7. 🛠️ Interactive Emergency Checklists
**Status:** Feature defined in `GEMINI.md`.
**Proposed Feature:** A slide-over panel that appears automatically during critical failures.
- **Logic:** If `Severity.CRITICAL` is received, show the corresponding checklist (e.g., "Engine Out Checklist", "Stall Recovery Steps").
- **Interactive:** User can "check off" steps as they are performed.

## 8. 🎮 Remote Command Console (Simulator Interaction)
**Status:** Simulator Ready (`set_route` commands).
**Proposed Feature:** Send commands back to the simulator/UAV from the UI.
- **Buttons:** "Return Home", "Orbit Current Point", "Emergency Land".
- **Tech:** Emit Socket.io events from Frontend -> Backend -> Simulator.

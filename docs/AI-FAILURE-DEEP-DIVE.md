# 🧠 AI-Powered Failure Deep-Dive: Feature Guide

The **AI-Powered Failure Deep-Dive** is a core diagnostic feature of SkySentinel that leverages **Gemini 1.5 Flash** to transform raw telemetry data into actionable maintenance insights. 

---

## 🏗️ Overall UX Overview
The feature solves the "So what?" problem for UAV operators. Instead of just seeing a "Propulsion Failure" alert, the operator receives a technical explanation and a clear next step. 

- **Interface:** A terminal-like "Forensics" modal triggered from the event log.
- **Goal:** Bridge the gap between real-time telemetry (raw numbers) and maintenance (human action).
- **Aesthetic:** Clean, high-contrast, "Glass Cockpit" compatible design.

---

## 🛠️ Step-by-Step Guide: How it Works

### 1. Failure Detection (The "Trigger")
- **System Action:** The `FailuresService` continuously monitors incoming telemetry. 
- **Example Logic:** If `Throttle > 80%` but `Vertical Speed < -1.0 m/s` is detected, a `FailureLog` entry is created.
- **Data Capture:** The system captures a "snapshot" of the UAV's state (airspeed, pitch, roll, battery, temperature) at the exact moment of the incident.

### 2. User Initiation (The "Deep-Dive")
- **User Action:** The operator identifies a red alert in the **Master Caution** panel and clicks "Deep-Dive" on the specific event.
- **UX Detail:** A modal appears with a "Scanning Telemetry Evidence..." state while the AI processes the request.

### 3. AI Processing (The "Brain")
- **Backend Logic:** The `AiService` constructs a prompt containing the telemetry snapshot and the error description.
- **Gemini Integration:** This context is sent to the Gemini 1.5 Flash model, acting as a "Virtual Diagnostic Engineer." It correlates variables (e.g., high temperature + battery sag) to identify the most likely failure mode.

### 4. Insight Generation (The "Output")
The AI returns a structured analysis containing:
- **Root Cause:** (e.g., "Mechanical: Motor bearing failure or propeller obstruction").
- **Severity:** (e.g., "CRITICAL").
- **Technical Explanation:** (e.g., "High current draw detected alongside a drop in VSI, indicating the motor is working hard but not producing lift").
- **Suggested Action:** (e.g., "Inspect motor #3 for physical resistance and check ESC calibration").

### 5. Reporting & Resolution (The "Outcome")
- **Outcome:** The operator makes an informed decision: abort mission, initiate Emergency RTL (Return to Launch), or schedule specific maintenance.
- **Next Step:** The analysis can be exported into an **Automated Incident Report (PDF)** for official flight logs.

---

## 📊 Technical Implementation Details
- **Backend Service:** `apps/backend/src/modules/ai/ai.service.ts`
- **AI Model:** `gemini-1.5-flash` (Optimized for low-latency analysis).
- **Prompt Strategy:** Structured system prompt enforcing strict JSON output for reliable frontend parsing.
- **Data Context:** Velocity, Attitude, Environment, System, and Error Log.

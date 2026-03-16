# Chapter 4. Implementation of the Ground Segment User Interface (KIUS Operator Console)

This chapter provides a comprehensive technical overview of the SkySentinel Ground Segment's graphical user interface (GUI). The interface is designed following the "Glass Cockpit" paradigm, ensuring high situational awareness and adherence to aviation safety standards for human-machine interaction in Computerized Information-Control Systems (KIUS).

## 4.1. Conceptual Framework and "Glass Cockpit" Design
The SkySentinel operator console serves as the primary node for real-time telemetry processing and failure visualization. In accordance with Modern Avionics standards, the interface prioritizes critical information, employing a dark-themed high-contrast layout to reduce operator eye fatigue during long-duration flight monitoring. 

The GUI is implemented using the React framework and Tailwind CSS, providing a responsive and low-latency environment for data representation.

## 4.2. Master Caution and Event Hierarchization (Lecture №4)
The system implements a centralized alerting mechanism based on **Lecture №4: Monitoring of Boundary Values**. This is realized through the **Master Caution** panel in the `StatusBar` component.

*   **Alerting Hierarchy:** Following aviation protocols, the system distinguishes between `Critical`, `Warning`, and `Advisory` states.
*   **Visual Logic:** The `StatusBar` utilizes a flashing red indicator and distinct auditory-visual cues when critical thresholds are breached.
*   **Threshold Triggering:** The Master Caution is automatically activated if any hardware parameter (Battery < 15%, Temperature > 75°C, Latency > 800ms, or RSSI < -85dBm) enters a failure state.

## 4.3. Analytical Redundancy Monitor (Lecture №10)
A key feature of the interface is the `RedundancyMonitor`, which applies the principle of **Analytical Redundancy** (Lecture №10). 

*   **Residual Analysis:** The component calculates the "Delta" (residual) between the Pitot-static system (Airspeed) and the GNSS-derived GroundSpeed.
*   **Fault Detection:** If the discrepancy exceeds 15 m/s, the system identifies a "Pitot Tube Failure" or "GNSS Drift," transitioning the visual state from Green (OK) to Red (FAIL). This allows the operator to detect "Dormant Errors" that do not trigger individual sensor alarms but manifest through inconsistent physical state representations.

## 4.4. Hardware Health Monitoring (HHM) System
The `HardwareHealth` component provides a localized dashboard for monitoring the physical integrity of the UAV. 

*   **Parameter Tracking:** It tracks Battery Level (Lecture №8-9: Energy Degradation), Electronics Temperature, and Network Quality (RSSI/Latency).
*   **Dynamic Visual Diagnostics:** Utilizing CSS-in-JS logic, tiles dynamically shift their color profile (Green $\rightarrow$ Yellow $\rightarrow$ Red) based on real-time telemetry. This ensures that the operator can perform "Pre-Failure" diagnostics by observing trends before they escalate into critical Master Caution events.

## 4.5. Telemetry Trend Analysis and Historical Visualization
For long-term state monitoring, the system includes a `TelemetryCharts` suite powered by the Recharts library.

*   **Live Stream Plotting:** Each metric (Altitude, Airspeed, Servo Currents, etc.) is mapped to a `TelemetryMiniChart`.
*   **Enhanced Interactivity:** Interactive tooltips provide the operator with exact time-stamped values upon hovering, facilitating post-incident analysis.
*   **Color-Coded Trends:** The charts inherit the dynamic color logic from the HHM system, changing their stroke and gradient colors in real-time to match the current safety status of the UAV.

## 4.6. Internationalization and Information Accessibility
Adhering to the principles of information compatibility, the SkySentinel UI supports multi-language operation (English/Ukrainian). This is implemented via the `i18next` framework, ensuring that all technical terminology and diagnostic logs are accessible to the operator in their preferred locale, minimizing the risk of misinterpretation during emergency procedures.

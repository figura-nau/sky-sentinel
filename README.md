# SkySentinel: Flight Data Intelligence & Failure Diagnosis

**SkySentinel** is a modern distributed CIMS (Computerized Information Management System) designed for telemetry monitoring and intelligent diagnostics of fixed-wing UAV technical status in real-time. The system provides a full flight data processing cycle: from raw data acquisition to the generation of analytical failure reports.

## 🎯 Project Goal

The goal of SkySentinel is to automate the process of detecting anomalies and technical malfunctions in UAVs. The system implements a **Ground Segment** concept, allowing operators to conduct deep flight analysis without installing specific software (Zero-Install Policy).

## 🏗️ System Architecture

The project is implemented as a Cloud-Native Web Application with a distributed structure:

### 1. Ground Segment (Frontend)

- **Stack:** React, TypeScript, Tailwind CSS.
- **Visualization:** Recharts (telemetry) and interactive 2D/3D maps.
- **Interface:** "Glass Cockpit" design with a built-in **Master Caution** panel for instant notification of critical conditions.

### 2. Server Segment (Backend)

- **Stack:** NestJS, WebSockets (Socket.io), Prisma ORM, PostgreSQL.
- **Diagnostic Engine:** A combination of deterministic algorithms (threshold analysis) and intelligent anomaly analysis.
- **Validation:** Implementation of data integrity verification algorithms via cyclic redundancy check (**XOR-checksum validation**).

### 3. Infrastructure (DevOps)

- **Data Bridge:** A Python bridge for translating data from a radio modem into a WebSocket channel.
- **Containerization:** Docker & Docker Compose.
- **Monitoring:** Prometheus + Grafana to monitor the "health" of the control system.

## 🚀 Key Features (Variant №9)

In accordance with the requirements for developing failure diagnosis systems:

- **Failure Classification:** Automatic grouping of events by levels: _Failure_ (red), _Warning_ (yellow), _Advisory_ (blue).
- **Anomaly Detection:**
- Detection of **Hard Landings** based on the vertical speed gradient.
- Diagnostics of **Stalls** and dangerous pitch/roll angles.
- Monitoring of communication link stability (**Heartbeat loss**).

- **Intelligent Reports:** Automatic generation of PDF flight safety summaries with maintenance recommendations.

## 🛠️ Technology Stack

- **Frontend:** React (Hooks, Context API), Tailwind CSS, Recharts, Lucide Icons.
- **Backend:** NestJS (Gateways, Guards, Interceptors), Prisma ORM.
- **Database:** PostgreSQL.
- **Deployment:** Docker, Nginx, Vercel (Frontend), DigitalOcean (Backend).

## 📊 Data Format

The system supports processing of **NMEA 0183** standard text streams and custom JSON telemetry packets. Every message undergoes an XOR-validation stage before being displayed or stored in the database.

---

_This project was developed as part of the "Computerized Information Management Systems" university discipline._
---

## Preview
![alt text](docs/image.png)
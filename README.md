# Ithemba Clinical Decision Support System (CDSS)

A full‑stack web application designed to support cancer‑related clinical decision-making by combining the
**implemented project features** (Patient–Nurse–Admin system, consultations, symptoms, appointments, notifications, secure login) with the 
**intended system requirements** from the official specification (oncology workflows, cancer prediction model, specialist referral, analytics, structured examination flows, cancer knowledge base).
This README provides a high‑level overview for academic evaluation.

---

## 1. Project Overview

The CDSS is a web‑based platform intended to improve early cancer detection, streamline clinical workflows, and support healthcare professionals with structured assessments.
The delivered system includes core features such as symptom capturing, consultations, prescriptions, role‑based dashboards, and secure authentication.

In alignment with the specifications document, the system is designed to evolve toward an oncology‑focused decision support tool that incorporates:

* A step‑by‑step clinical wizard for symptom entry
* Evidence‑based recommendations
* Cancer prediction using machine learning
* Specialist referral workflows
* Progress tracking and analytics
* Cancer knowledge base integration
---

## 2. Core Features

**Patient Features**

* Register, log in, and access dashboard
* Capture symptoms and request consultations
* View assigned nurse and consultation progress
* Receive email notifications
* Access prescriptions after consultations

**Nurse Features**

* View assigned patients and upcoming consultations
* Capture symptoms, notes, and clinical information
* Complete consultations and generate prescriptions
* Respond to notifications and updates

**Admin Features**

* Manage users (nurses, patients)
* Assign consultations to nurses
* System monitoring and oversight
* View appointment activity

### 2.2 Requirements‑Driven (Planned/Extended) Features

These features appear in the system specification and guide the system’s intended evolution:

* Cancer type probability prediction (ML model)
* Evidence‑based diagnostic recommendations aligned with WHO/NCCN guidelines
* Specialist referral to oncologists or radiologists
* Detailed clinical exam recording (vital signs, red flags, attachments)
* Analytics on patient outcomes, symptom frequency, and diagnostic trends
* Cancer knowledge base (200+ types) with search functionality
* Tracking patient journeys and follow‑ups over time

---

## Technology Stack

### Frontend

* React JSX

### Backend

* ASP.NET Core Web API
* Entity Framework Core
* Identity + JWT Authentication
* External Email API Integration (Resend or equivalent)
* C#
* Python

### Database

* Microsoft SQL Server (MSSQL)

### Tools

* Visual Studio / Visual Studio Code
* .NET SDK
* Node.js & npm
* Git & GitHub

---

## System Architecture & Structure

```
/Clinical-Decision-Support-System
│
├── Controllers/
│
├── DTOs/
│
├── Data/
│
├── Migrations/
│
├── Models/
│
├── Repositories/
│
├── Services/
│
├── XGBoost multi-class classifier/
│
├── frontend/
│
├── Clinical-Decision-Support-System.sln
├── MyApp.csproj
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── package.json
└── package-lock.json
```

---

## Setup & Installation

### Backend Setup

```
cd Server
dotnet restore
dotnet ef database update
dotnet run
```

### Backend Setup( Machine Learning Model

```
cd Server
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup

```
cd Client
npm install
npm start / ng serve
```

Open: `http://localhost:4200/`

---

## Contributors

* **Nkanini Avela**
* **Nxam Asemahle**
* **Vabaza Khanyiso**
* **Zide Yandisa**
* **Mr Vuyolwethu Mdunyelwa** — Supervisor/Lecturer

---

## 12. License

This project is for academic use as part of a final‑year submission.

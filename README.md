# Ithemba Clinical Decision Support System (CDSS)

**Welcome to our Ithemba CDSS!**

This **full‑stack web application** is designed to support healthcare professionals in **cancer-related decision making**. Our team has implemented several core features and aligned them with the **official system requirements**. Here's a quick overview:

**Implemented Features:**

* Patient–Nurse–Admin management system
* Consultations and symptom tracking
* Appointment scheduling
* Notifications and alerts
* Secure login and user authentication

**System Requirements & Goals:**

* Oncology workflow management
* Cancer prediction and analytics
* Specialist referrals
* Structured examination flows
* Comprehensive cancer knowledge base

This README provides a **high-level overview** of our project, highlighting how our team has combined practical features with the intended system objectives to deliver an effective clinical decision support system.

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

| **Patient Features**    | **Nurse Features**                             |**Admin Features** |
| ----------- | ---------------------------------------- | ---------------------------------------- |
| - Register, log in, and access dashboard | - View assigned patients and upcoming consultations | - Manage users (nurses, patients) |
| - Capture symptoms and request consultations | - Capture symptoms, notes, and clinical information | - Assign consultations to nurses |
| - View assigned nurse and consultation progress | - Complete consultations and generate prescriptions | - System monitoring and oversight |
| - Receive email notifications | - Respond to notifications and updates | - View appointment activity |
| - Access prescriptions after consultations |  | |

---

## 3. System Demo & Walkthrough

---

## 4. Technology Stack

### Frontend

* React JSX

### Backend

* ASP.NET Core Web API
* Entity Framework Core
* Identity + JWT Authentication
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

## 5. System Architecture & Structure

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

## 6. Setup & Installation

### Backend Setup


# Navigate to backend folder
```
cd Clinical-Decision-Support-System
``` 

# Restore NuGet packages
```
dotnet restore
```

# Apply Entity Framework migrations and update the database
```
dotnet ef database update
```

# Run the backend server
```
dotnet run
```

### Backend Setup( Machine Learning Model

# Navigate to Python model folder
```
cd "XGBoost multi-class classifier"
```

# Create virtual environment
```
python -m venv venv
```

# Activate virtual environment
# Windows
```
venv\Scripts\activate
```
# Mac/Linux
```
source venv/bin/activate
```

# Install dependencies
```
pip install -r requirements.txt
```

# Run the symptom predictor script
```
python run_symptom_predictor.py
```


### Frontend Setup

# Navigate to frontend
```
cd frontend
```

# Install dependencies
```
npm install
```

# Start the development server
```
npm start
```

```
Open: `http://localhost:4200/`
---

## 7. Contributors

* **Nkanini Avela**
* **Nxam Asemahle**
* **Vabaza Khanyiso**
* **Zide Yandisa**
* **Mr Vuyolwethu Mdunyelwa** — Supervisor/Lecturer

---

## 8. License

This project is for academic use as part of a final‑year submission.

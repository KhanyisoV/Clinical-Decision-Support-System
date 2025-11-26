# Ithemba Clinical Decision Support System (CDSS)
<img width="92" height="115" alt="image" src="https://github.com/user-attachments/assets/b03ce084-f24c-45f5-b5f3-b04802ea3fc1" />

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

## 3.1 System Demo & Walkthrough

[![Watch the video](https://github.com/user-attachments/assets/971d8440-76de-4618-b677-4d2a31654591)](https://youtu.be/yBjmgyRlS44)

## 3.2 System Screenshots

<table>
  <tr>
    <td><img width="1035" height="505" alt="image" src="https://github.com/user-attachments/assets/bea9ecb1-1b9e-4aab-9543-c69303a8362e" /></td>
    <td><img width="1022" height="503" alt="image" src="https://github.com/user-attachments/assets/41d32fea-cb31-4a3c-a593-e8f4c01f0735" />
</td>
  </tr>
  <tr>
    <td><img width="1027" height="506" alt="image" src="https://github.com/user-attachments/assets/3544376b-c32f-4737-89b1-4b2daddf3ee8" />
</td>
    <td><img width="1030" height="504" alt="image" src="https://github.com/user-attachments/assets/de8f886b-1638-4adf-9ade-126c8bff9c25" />
</td>
  </tr>
</table>

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
│   ├── AdminController.cs
│   ├── AllergyController.cs
│   ├── AnalyticsController.cs
│   ├── AppointmentController.cs
│   ├── AppointmentHistoryController.cs
│   ├── AuthController.cs
│   ├── ClientController.cs
│   ├── ClientHistoryController.cs
│   ├── ClinicalObservationController.cs
│   ├── DiagnosisController.cs
│   ├── DoctorController.cs
│   ├── LabResultController.cs
│   ├── MLPredictionController.cs
│   ├── Message.cs
│   ├── PredictionHistoryController.cs
│   ├── PrescriptionController.cs
│   ├── ProgressController.cs
│   ├── RecommendationController.cs
│   ├── SymptomController.cs
│   └── TreatmentController.cs
│
├── DTOs/
│   └── DTOs.cs
│
├── Data/
│   └── AppDbContext.cs
│
├── Migrations/
│   └── [EF migration files]
│
├── Models/
│   ├── Admin.cs
│   ├── Allergy.cs
│   ├── Appointment.cs
│   ├── AppointmentHistory.cs
│   ├── Client.cs
│   ├── ClinicalObservation.cs
│   ├── Diagnosis.cs
│   ├── Doctor.cs
│   ├── IUser.cs
│   ├── LabResult.cs
│   ├── MLPrediction.cs
│   ├── Message.cs
│   ├── PredictionHistory.cs
│   ├── Prescription.cs
│   ├── Progress.cs
│   ├── Recommendation.cs
│   ├── Symtom.cs
│   └── Treatment.cs
│
├── Repositories/
│   ├── AdminRepository.cs
│   ├── AllergyRepository.cs
│   ├── AppointmentHistoryRepository.cs
│   ├── AppointmentRepository.cs
│   ├── ClientRepository.cs
│   ├── ClinicalObservationRepository.cs
│   ├── DiagnosisRepository.cs
│   ├── DoctorRepository.cs
│   ├── IAllergyRepository.cs
│   ├── IAppointmentHistoryRepository.cs
│   ├── IAppointmentRepository.cs
│   ├── IClientRepository.cs
│   ├── IClinicalObservationRepository.cs
│   ├── IDiagnosisRepository.cs
│   ├── ILabResultRepository.cs
│   ├── IMLPredictionRepository.cs
│   ├── IPredictionHistoryRepository.cs
│   ├── IPrescriptionRepository.cs
│   ├── IProgressRepository.cs
│   ├── IRecommendationRepository.cs
│   ├── ISymptomRepository.cs
│   ├── ITreatmentRepository.cs
│   ├── LabResultRepository.cs
│   ├── MLPredictionRepository.cs
│   ├── PredictionHistoryRepository.cs
│   ├── PrescriptionRepository.cs
│   ├── ProgressRepository.cs
│   ├── RecommendationRepository.cs
│   ├── SymptomRepository.cs
│   └── TreatmentRepository.cs
│
├── Services/
│   ├── IAnalyticsService.cs
│   ├── IClientHistoryService.cs
│   └── IMappingService.cs
│
├── XGBoost multi-class classifier/
│   ├── __pycache__/
│   ├── api/
│   │   └── __pycache__/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   ├── README.md
│   ├── cancer_model.pkl
│   ├── feature_columns.pkl
│   ├── filters.py
│   ├── label_encoder.pkl
│   ├── requirements.txt
│   ├── run_symptom_predictor.py
│   └── symptom_model.py
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── admin/
│       │       ├── AdminManagment.jsx
│       │       ├── ClientManagement.jsx
│       │       ├── DiagnosesManagement.jsx
│       │       ├── DoctorManagement.jsx
│       │       ├── SymptomsManagement.jsx
│       │       ├── ClientRegisterForm.jsx
│       │       ├── DebugAuth.jsx
│       │       ├── DoctorRegisterForm.jsx
│       │       ├── Layout.jsx
│       │       ├── LoginForm.css
│       │       ├── LoginForm.jsx
│       │       ├── Messages.jsx
│       │       ├── Navbar.jsx
│       │       └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── AdminDashboard.css
│       │   ├── AdminDashboard.jsx
│       │   ├── ClientDashboard.jsx
│       │   ├── DoctorDashboard.jsx
│       │   └── NotFound.jsx
│       ├── services/
│       │   ├── api.jsx
│       │   ├── apiService.js
│       │   └── authService.js
│       ├── types/
│       │   └── auth.js
│       ├── App.css
│       ├── App.js
│       ├── index.css
│       └── index.js
│
├── Clinical-Decision-Support-System.sln
├── MyApp.csproj
├── MyApp.http
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── package.json
├── package-lock.json
└── README.md

```

---

## 6. Setup & Installation

### Backend Setup


#### Navigate to backend folder
```
cd Clinical-Decision-Support-System
``` 

#### Restore NuGet packages
```
dotnet restore
```

#### Apply Entity Framework migrations and update the database
```
dotnet ef database update
```

#### Run the backend server
```
dotnet run
```

### Backend Setup( Machine Learning Model

#### Navigate to Python model folder
```
cd "XGBoost multi-class classifier"
```

#### Create virtual environment
```
python -m venv venv
```

### Activate virtual environment
#### Windows
```
venv\Scripts\activate
```
#### Mac/Linux
```
source venv/bin/activate
```

#### Install dependencies
```
pip install -r requirements.txt
```

#### Run the symptom predictor script
```
python run_symptom_predictor.py
```


### Frontend Setup

#### Navigate to frontend
```
cd frontend
```

#### Install dependencies
```
npm install
```

#### Start the development server
```
npm start
```

## 7. Contributors

* **Nkanini Avela**
* **Nxam Asemahle**
* **Vabaza Khanyiso**
* **Zide Yandisa**
* **Mr Vuyolwethu Mdunyelwa** — Supervisor/Lecturer

---

## 8. License

This project is for academic use as part of a final‑year submission.

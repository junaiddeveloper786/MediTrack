# MediTrack – Clinic & Appointment Management System

**Company:** MedSoft Solutions Pvt. Ltd.  
**Client:** Sunrise Multi-Speciality Clinics, Pune  
**Type:** B2B SaaS Web Application

## 🔍 Overview

MediTrack is a full-stack SaaS platform for managing clinic operations, including doctor scheduling, appointment booking, and real-time tracking via a unified dashboard.

## 🚀 Features

### Admin

- JWT-secured login
- Dashboard: KPIs for doctors, appointments, patients
- CRUD for doctors (with specialty & availability)
- Approve/Cancel/Reschedule appointments
- Export appointments to CSV
- Email/SMS alerts for bookings

### Patient

- Register/Login with JWT
- Book appointment (date, time, doctor)
- View appointment history & profile
- Email confirmation & reminders

## 🛠 Tech Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Frontend   | React.js, Redux Toolkit, Tailwind CSS |
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB Atlas                         |
| Auth       | JWT, Bcrypt.js                        |
| Email/SMS  | Nodemailer, (optional) Twilio         |
| Deployment | Netlify (Frontend), Render (Backend)  |

## 🧱 Folder Structure

### Backend

```
backend/
├── config/
├── controllers/
├── models/
├── middleware/
├── routes/
├── utils/
└── server.js
```

### Frontend

```
frontend/
├── components/
├── pages/
├── redux/
├── services/
├── App.js
└── index.js
```

## 🧪 How to Run

### Backend

```bash
cd backend
npm install
npm run start
```

### Frontend

```bash
cd frontend
npm install
npm run start
```

## 📦 Deployment

- Frontend: [Netlify](https://netlify.com)
- Backend: [Render](https://render.com)
- Database: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📄 License

© 2025 MedSoft Solutions Pvt. Ltd.

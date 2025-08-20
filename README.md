# MediTrack – Clinic & Appointment Management System

**Company:** MedSoft Solutions Pvt. Ltd.  
**Client:** Sunrise Multi-Speciality Clinics, Pune  
**Project Type:** B2B SaaS Web Application

---

## **Project Overview**

MediTrack is a web-based SaaS platform designed to simplify clinic operations for Sunrise Multi-Speciality Clinics.  
It provides role-based access for Admins and Patients, supports doctor scheduling, appointment management, email reminders, data reporting, and real-time appointment tracking through a unified dashboard.

---

## **User Roles & Permissions**

### Admin (Clinic Manager)

- Secure login using JWT
- Admin dashboard with KPIs: Total Doctors, Appointments, Patients
- Add/Edit/Delete doctors with specialty & availability
- View/manage appointments (Approve, Cancel, Reschedule)
- Export appointment reports (CSV)
- Trigger email/SMS alerts for booking events

### Patient (User)

- Register/Login using JWT
- Book appointments with date, time, and preferred doctor
- View appointment history and upcoming schedule
- Edit personal profile and contact details
- Receive confirmation/reminder emails

---

## **Technology Stack**

| Category       | Tools & Technologies                   |
| -------------- | -------------------------------------- |
| Frontend       | React.js, Redux, React Router, Axios   |
| Styling        | Tailwind CSS and Material UI           |
| Backend        | Node.js, Express.js, MongoDB, Mongoose |
| Notifications  | Nodemailer (email) and Twilio (SMS)    |
| Tools          | Postman, Git, GitHub, Netlify, Render  |
| Authentication | JWT and Bcrypt.js                      |
| Calendar       | React-Calendar                         |

---

## **Deployment Links**

- **Frontend:** [https://medeetrack.netlify.app/](https://medeetrack.netlify.app/)
- **Backend:** [https://meditrack-bypw.onrender.com](https://meditrack-bypw.onrender.com)

---

## **Screenshots**

### MediTrack – Clinic & Appointment Management System

> ![MediTrack](<figma design.png>)

---

## **Setup Instructions**

### **Prerequisites**

- **Node.js:** v20.15.0
- **NPM:** 10.8.1
- **MongoDB:** 8.0 ( Atlas )
- **Environment Variables:**

  - `MONGO_URI`
  - `JWT_SECRET`
  - `EMAIL_USER`
  - `EMAIL_PASS`

### **Backend Setup**

````bash
cd backend
npm install
npm start

   **Frontend Setup**

```bash
cd frontend
npm install
npm start

---

API Endpoints (Basic Reference)

| Method | Endpoint               | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| POST   | /api/users/register    | Register a new user                    |
| POST   | /api/users/login       | Login user                             |
| GET    | /api/doctors           | Get all doctors                        |
| POST   | /api/doctors           | Add a doctor (Admin only)              |
| PUT    | /api/doctors/\:id      | Update doctor details                  |
| DELETE | /api/doctors/\:id      | Delete doctor                          |
| GET    | /api/appointments      | Get appointments                       |
| POST   | /api/appointments      | Book an appointment                    |
| PUT    | /api/appointments/\:id | Update appointment (reschedule/cancel) |

---

Features

Role-based access (Admin & Patient)

Doctor management (CRUD & slot scheduling)

Appointment booking, rescheduling, cancellation

Email notifications via Nodemailer

Admin dashboard with KPIs and reports

Redux Toolkit for global state management

Calendar-based appointment slot visualization

---

Future Enhancements:

🤖 AI Chat Assistant for patient queries & suggestions

🎥 Video Call Integration for online consultation

🌐 Multi-language Support (English, Hindi, Marathi)

💳 Payment Gateway Integration (Razorpay/Stripe)

📄 E-Prescription Generation

🏥 Role Extensions (Receptionist, Nurse)

📊 Advanced Analytics Dashboard (Revenue, Trends)

📱 Push Notifications & PWA Support

---

Team Members

Mohammed Junaid – Fullstack Developer

Abhishek Tumane – Fullstack Developer

Kapil Salunkhe – Fullstack Developer

Pooja Belenkar – Fullstack Developer

---

Challenges & Learnings

Implementing real-time appointment updates on dashboard

Integrating Redux Toolkit with multiple modules

Automating email reminders for appointments

Future focus: AI-based assistant and video consultation

---

Folder Structure

Backend

backend/
├── config/
├── controllers/
├── models/
├── middleware/
├── routes/
├── utils/
└── server.js

Frontend

frontend/
├── components/
├── layouts/
├── pages/
├── redux/
├── services/
├── utils.js
├── App.jsx
└── index.js

---

 📄 License

© 2025 MedSoft Solutions Pvt. Ltd.
This project is licensed for Sunrise Multi-Speciality Clinics use only.

````

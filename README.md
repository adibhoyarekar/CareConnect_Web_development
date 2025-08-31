Based on the files provided, here is a comprehensive README for your CareConnect project.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

CareConnect Clinic Management System
CareConnect is a comprehensive, mock clinic appointment management system designed for doctors, receptionists, and patients. It provides a user-friendly interface to book, manage, and track medical appointments with ease, all running locally in your browser with data persisted through localStorage.

✨ Features
The application supports three distinct user roles, each with a tailored dashboard and functionalities:

🧑‍⚕️ For Doctors
Onboarding: Complete a professional profile with details like specialty, clinic name, and available hours upon first login.

Dashboard: View upcoming appointments, see average patient ratings, and get a quick overview of the schedule.

Appointment Management: Accept or reject pending appointments and mark confirmed appointments as complete.

Patient Records: View medical records uploaded by patients and upload new reports or prescriptions for them.

Review Patient Feedback: See all reviews and ratings submitted by patients.

Profile Management: Update personal and professional details through a dedicated profile page.

Data Export: Export the appointment list to an Excel file.

🤕 For Patients
Onboarding: Complete a personal profile with age, gender, and contact information after signing up.

Dashboard: View upcoming and past appointments and manage personal medical records.

Book Appointments: Schedule new appointments by selecting a doctor, date, and time. The form prevents double-booking and shows doctor availability.

Doctor Ratings: See average doctor ratings when booking an appointment.

Leave Reviews: Submit a rating and a comment for doctors after a completed appointment.

Medical Records: Upload and manage personal health records for doctors to review.

Profile Management: Update personal information at any time.

clerical For Receptionists
Centralized Dashboard: Get a comprehensive view of all clinic appointments, patients, and doctors.

Full Appointment Control: Book new appointments for patients, reschedule existing ones, and cancel appointments when necessary.

Patient & Doctor Overview: Access lists of all registered patients and doctors in the system.

Data Export: Export the complete list of clinic appointments to Excel.

共通 General Features
Authentication: Secure sign-up and sign-in with email and password. Includes a simulated social login flow for Google and Facebook.

Notifications: Users receive notifications for appointment confirmations and reminders for appointments occurring the next day.

Persistent State: All application data (users, appointments, reviews, etc.) is saved in the browser's localStorage, so your session is preserved even after closing the tab.

Responsive UI: The interface is built with Tailwind CSS for a clean experience across different screen sizes.

🛠️ Tech Stack
Frontend: React, TypeScript

Styling: Tailwind CSS

Build Tool: esbuild

Data: Mock data stored in localStorage.

🚀 Getting Started
To run this project locally, follow these steps:

Clone the repository:

Bash

git clone <your-repository-url>
cd <repository-directory>
Install dependencies:

You'll need Node.js installed on your machine.

Run the following command in the project root:

Bash

npm install
Build the project:

The project uses esbuild to bundle the application. Run the build script:

Bash

npm run build
This will create a bundled JavaScript file at dist/index.js.

Run the application:

This project is a static single-page application and needs to be served by a local web server.

You can use any static server. One of the simplest ways is using serve:

Bash

npx serve
Once the server is running, open your browser and navigate to the provided local address (e.g., http://localhost:3000). The application should load.

🗂️ How It Works
Entry Point: The index.html file is the main entry point. It loads React, sets up Tailwind CSS, and includes the bundled dist/index.js script.

State Management: The root App.tsx component manages all application state, including users, appointments, medical records, and notifications. All state is initialized with mock data from constants.ts and persisted to localStorage via the useLocalStorage custom hook.

Component-Based Architecture: The UI is broken down into reusable React components located in the src/components directory.

Role-Based Rendering: The application checks the role of the logged-in user to render the appropriate dashboard and controls.

No Backend: This is a fully client-side application. All "database" operations are simulations that read from and write to the browser's localStorage.

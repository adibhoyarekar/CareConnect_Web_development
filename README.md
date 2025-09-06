# CareConnect - Clinic Appointment Management System

## Overview

CareConnect is a comprehensive, full-stack web application designed to streamline appointment management for medical clinics. It provides a seamless, role-based experience for patients, doctors, and receptionists, facilitating easy booking, management, and tracking of appointments.

This project is built with a modern tech stack, featuring a React frontend and a Node.js/Express backend, and is architected for deployment on platforms like Render.

## Key Features

### For Patients
- **User Authentication**: Secure sign-up and login, including social login simulations.
- **Profile Management**: Complete and update personal and medical information through an onboarding process and profile page.
- **Doctor Discovery**: View a list of available doctors, their specialties, and patient reviews.
- **Appointment Booking**: Schedule appointments with preferred doctors at available time slots.
- **Appointment History**: View past and upcoming appointments.
- **Medical Records**: Upload and view personal medical records and documents shared by doctors.
- **Leave Reviews**: Provide feedback and ratings for completed appointments.

### For Doctors
- **Secure Dashboard**: Manage appointments and patient information from a dedicated dashboard.
- **Profile Customization**: Update professional details like specialty, hospital affiliation, and availability.
- **Appointment Management**: Accept, reject, or mark appointments as complete.
- **Patient Records Access**: View medical records uploaded by patients.
- **Upload Reports**: Upload medical reports or prescriptions for patients.
- **View Reviews**: See patient feedback and average ratings to track performance.

### For Receptionists
- **Centralized Dashboard**: A comprehensive overview of all clinic appointments.
- **Advanced Filtering & Search**: Quickly find appointments by patient name, doctor name, date range, or status.
- **Appointment Coordination**: Book, reschedule, and cancel appointments on behalf of patients.
- **Data Export**: Export appointment data to Excel for reporting and analysis.

## Tech Stack

- **Frontend**:
    - **React 19**
    - **TypeScript**
    - **Tailwind CSS** for styling
    - **esbuild** for bundling
- **Backend**:
    - **Node.js** with ES Modules
    - **Express.js** for the REST API
    - **LowDB** (a lightweight JSON file-based database) for data persistence
- **Development**:
    - **Concurrent.ly** for running frontend and backend servers simultaneously in a local environment.

## Getting Started

To run this project locally, follow these steps:

### Prerequisites
- Node.js (v18 or newer recommended)
- npm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install root dependencies:**
    This step installs the dependencies required for the frontend and the concurrent runner.
    ```bash
    npm install
    ```

3.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

4.  **Run the application:**
    From the root directory, run the development script:
    ```bash
    npm run dev
    ```
    This command will start both the frontend development builder (with auto-rebuild on file changes) and the backend server concurrently.

    - The frontend will be accessible at `http://localhost:8000` (or another port if 8000 is busy).
    - The backend API will run on `http://localhost:3001`.

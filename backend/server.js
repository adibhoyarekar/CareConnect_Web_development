import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup lowdb
const adapter = new JSONFile(join(__dirname, 'db.json'));
const db = new Low(adapter, {});
await db.read();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper function to find a user
const findUser = (email) => {
    const { doctors, patients, receptionists } = db.data;
    const allUsers = [...doctors, ...patients, ...receptionists];
    return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// --- AUTH ROUTES ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = findUser(email);
    if (user && user.password === password) {
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

app.post('/api/signup', async (req, res) => {
    const details = req.body;
    if (findUser(details.email)) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const newUser = { ...details, id: `${details.role.toLowerCase()}-${nanoid(5)}` };
    
    if (newUser.role === 'Doctor') {
        const newDoctor = { ...newUser, specialty: '', address: '', fees: 0, mobile: '', profileComplete: false };
        db.data.doctors.push(newDoctor);
        await db.write();
        const { password: _, ...userToReturn } = newDoctor;
        res.status(201).json(userToReturn);
    } else if (newUser.role === 'Patient') {
        const newPatient = { ...newUser, age: 0, gender: 'Other', contact: '', profileComplete: false, weight: 0 };
        db.data.patients.push(newPatient);
        await db.write();
        const { password: _, ...userToReturn } = newPatient;
        res.status(201).json(userToReturn);
    } else if (newUser.role === 'Receptionist') {
        db.data.receptionists.push(newUser);
        await db.write();
        const { password: _, ...userToReturn } = newUser;
        res.status(201).json(userToReturn);
    } else {
        res.status(400).json({ message: 'Invalid role provided.' });
    }
});

app.post('/api/social-signup', async (req, res) => {
    const { role, account } = req.body;
    const existingUser = findUser(account.email);
    if (existingUser) {
        const { password: _, ...userToReturn } = existingUser;
        return res.status(200).json(userToReturn); // Log them in if they exist
    }

    const newUserBase = {
        name: account.name,
        email: account.email,
        password: 'social_login_password', // Mock password
        role: role,
        id: `${role.toLowerCase()}-${nanoid(5)}`
    };

    if (role === 'Doctor') {
        const newDoctor = { ...newUserBase, specialty: '', address: '', fees: 0, mobile: '', profileComplete: false };
        db.data.doctors.push(newDoctor);
        await db.write();
        const { password: _, ...userToReturn } = newDoctor;
        res.status(201).json(userToReturn);
    } else if (role === 'Patient') {
        const newPatient = { ...newUserBase, age: 0, gender: 'Other', contact: '', profileComplete: false, weight: 0 };
        db.data.patients.push(newPatient);
        await db.write();
        const { password: _, ...userToReturn } = newPatient;
        res.status(201).json(userToReturn);
    } else {
         res.status(400).json({ message: 'Invalid role for social signup.' });
    }
});


// --- DATA FETCHING ROUTES ---
app.get('/api/data', (req, res) => {
    const { doctors, patients, receptionists, appointments, medicalRecords, reviews, notifications } = db.data;
    // Strip passwords before sending
    const safeDoctors = doctors.map(({ password, ...d }) => d);
    const safePatients = patients.map(({ password, ...p }) => p);
    const safeReceptionists = receptionists.map(({ password, ...r }) => r);

    res.json({
        doctors: safeDoctors,
        patients: safePatients,
        receptionists: safeReceptionists,
        appointments,
        medicalRecords,
        reviews,
        notifications
    });
});


// --- APPOINTMENTS ---
app.post('/api/appointments', async (req, res) => {
    const newAppointmentData = req.body;
    const newAppointment = { ...newAppointmentData, id: `apt-${nanoid(8)}` };
    db.data.appointments.push(newAppointment);
    await db.write();
    res.status(201).json(newAppointment);
});

app.put('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const updatedAppointmentData = req.body;
    const index = db.data.appointments.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Appointment not found.' });
    }

    const previousAppointment = db.data.appointments[index];
    db.data.appointments[index] = updatedAppointmentData;

    // Handle notification creation on confirmation
    if (previousAppointment.status !== 'Confirmed' && updatedAppointmentData.status === 'Confirmed') {
        const patient = db.data.patients.find(p => p.id === updatedAppointmentData.patientId);
        const doctor = db.data.doctors.find(d => d.id === updatedAppointmentData.doctorId);

        if (patient && doctor) {
            db.data.notifications.push({
                id: `notif-confirm-p-${updatedAppointmentData.id}`,
                userId: patient.id,
                appointmentId: updatedAppointmentData.id,
                message: `Your appointment with ${doctor.name} on ${updatedAppointmentData.date} at ${updatedAppointmentData.time} for "${updatedAppointmentData.reason}" has been confirmed.`,
                date: new Date().toISOString(),
                read: false,
                type: 'Confirmation',
            });
            db.data.notifications.push({
                id: `notif-confirm-d-${updatedAppointmentData.id}`,
                userId: doctor.id,
                appointmentId: updatedAppointmentData.id,
                message: `Your appointment with ${patient.name} on ${updatedAppointmentData.date} at ${updatedAppointmentData.time} for "${updatedAppointmentData.reason}" has been confirmed.`,
                date: new Date().toISOString(),
                read: false,
                type: 'Confirmation',
            });
        }
    }

    await db.write();
    // Return all notifications so frontend can update its state
    res.json({ updatedAppointment: updatedAppointmentData, notifications: db.data.notifications });
});

// FIX: Add a route to handle appointment deletion
app.delete('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const index = db.data.appointments.findIndex(a => a.id === id);

    if (index !== -1) {
        db.data.appointments.splice(index, 1);
        await db.write();
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } else {
        res.status(404).json({ message: 'Appointment not found' });
    }
});

// --- PROFILES ---
app.put('/api/doctors/:id', async (req, res) => {
    const { id } = req.params;
    const updatedDoctorData = req.body;
    const index = db.data.doctors.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ message: 'Doctor not found.' });
    db.data.doctors[index] = { ...db.data.doctors[index], ...updatedDoctorData };
    await db.write();
    const { password, ...userToReturn } = db.data.doctors[index];
    res.json(userToReturn);
});

app.put('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    const updatedPatientData = req.body;
    const index = db.data.patients.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ message: 'Patient not found.' });
    db.data.patients[index] = { ...db.data.patients[index], ...updatedPatientData };
    await db.write();
    const { password, ...userToReturn } = db.data.patients[index];
    res.json(userToReturn);
});

app.put('/api/receptionists/:id', async (req, res) => {
    const { id } = req.params;
    const updatedReceptionistData = req.body;
    const index = db.data.receptionists.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ message: 'Receptionist not found.' });
    db.data.receptionists[index] = { ...db.data.receptionists[index], ...updatedReceptionistData };
    await db.write();
    const { password, ...userToReturn } = db.data.receptionists[index];
    res.json(userToReturn);
});

// --- MEDICAL RECORDS ---
app.post('/api/medical-records', async (req, res) => {
    const newRecordData = req.body;
    const newRecord = { ...newRecordData, id: `rec-${nanoid(8)}` };
    db.data.medicalRecords.push(newRecord);
    await db.write();
    res.status(201).json(newRecord);
});

// --- REVIEWS ---
app.post('/api/reviews', async (req, res) => {
    const newReviewData = req.body;
    const newReview = { ...newReviewData, id: `rev-${nanoid(8)}` };
    db.data.reviews.push(newReview);
    await db.write();
    res.status(201).json(newReview);
});

// --- NOTIFICATIONS ---
app.put('/api/notifications/read', async (req, res) => {
    const { id } = req.body;
    const notification = db.data.notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        await db.write();
    }
    res.status(200).json(notification || {});
});

app.put('/api/notifications/read-all', async (req, res) => {
    const { userId } = req.body;
    db.data.notifications.forEach(n => {
        if (n.userId === userId) {
            n.read = true;
        }
    });
    await db.write();
    res.status(200).json({ message: 'All notifications marked as read.' });
});

// --- REMINDER GENERATION (could be a cron job in real app) ---
app.post('/api/generate-reminders', async (req, res) => {
    const getTomorrowsDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };
    const tomorrowsDate = getTomorrowsDate();

    const upcomingAppointments = db.data.appointments.filter(
      appt => appt.date === tomorrowsDate && appt.status === 'Confirmed'
    );
    
    let newNotifications = [];

    upcomingAppointments.forEach(appt => {
      const patient = db.data.patients.find(p => p.id === appt.patientId);
      const doctor = db.data.doctors.find(d => d.id === appt.doctorId);
      if (!patient || !doctor) return;

      const patientNotifExists = db.data.notifications.some(n => n.appointmentId === appt.id && n.userId === patient.id && n.type === 'Reminder');
      if (!patientNotifExists) {
        newNotifications.push({
          id: `notif-p-${appt.id}`, userId: patient.id, appointmentId: appt.id,
          message: `Reminder: You have an appointment with ${doctor.name} tomorrow at ${appt.time}.`,
          date: new Date().toISOString(), read: false, type: 'Reminder',
        });
      }
      
      const doctorNotifExists = db.data.notifications.some(n => n.appointmentId === appt.id && n.userId === doctor.id && n.type === 'Reminder');
      if (!doctorNotifExists) {
        newNotifications.push({
          id: `notif-d-${appt.id}`, userId: doctor.id, appointmentId: appt.id,
          message: `Reminder: You have an appointment with ${patient.name} tomorrow at ${appt.time}.`,
          date: new Date().toISOString(), read: false, type: 'Reminder',
        });
      }
    });

    if (newNotifications.length > 0) {
      db.data.notifications.push(...newNotifications);
      await db.write();
    }

    res.json({ newNotifications });
});


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

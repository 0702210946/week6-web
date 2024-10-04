const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Routes
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Patient = {
    create: async (patientData) => {
        const hashedPassword = await bcrypt.hash(patientData.password, 10);
        const sql = 'INSERT INTO patients (name, email, password) VALUES (?, ?, ?)';
        return db.execute(sql, [patientData.name, patientData.email, hashedPassword]);
    },

    findByEmail: async (email) => {
        const sql = 'SELECT * FROM patients WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    },

    // Add other necessary methods for updating and deleting
};

module.exports = Patient;
const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');

// Registration route
router.post('/register', async (req, res) => {
    try {
        await Patient.create(req.body);
        res.status(201).send('Patient registered successfully');
    } catch (error) {
        res.status(500).send('Error registering patient');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const patient = await Patient.findByEmail(email);

    if (patient && await bcrypt.compare(password, patient.password)) {
        req.session.patientId = patient.id;
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid email or password');
    }
});

// Other routes for profile management and logout can be added here.

module.exports = router;
function isAuthenticated(req, res, next) {
  if (req.session.patientId) {
      return next();
  }
  res.status(401).send('You must log in first');
}

// Protecting a route
router.get('/appointments', isAuthenticated, async (req, res) => {
  // Fetch appointments for the logged-in patient
});
// Update route
router.put('/update', isAuthenticated, async (req, res) => {
  const { name } = req.body; // Get new data from the request
  const sql = 'UPDATE patients SET name = ? WHERE id = ?';
  await db.execute(sql, [name, req.session.patientId]);
  res.send('Profile updated successfully');
});

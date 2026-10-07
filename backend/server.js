const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./config/database.js');

// Import Routes
const roomRoutes = require('./routes/roomRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // BARU

// Daftarkan Routes ke Express
app.use('/api/rooms', roomRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes); // BARU

app.get('/', (req, res) => {
    res.json({ message: "Welcome to JuraganKos API" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server backend berjalan di port ${PORT}`);
});
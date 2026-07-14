const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('../server/config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('../server/routes/api'));

module.exports = app;

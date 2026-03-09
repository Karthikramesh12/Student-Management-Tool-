// Import dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const morgan = require("morgan");

// Import local modules
const prisma = require('./config/dbConnect');
const routes = require('./routes');
require("./cronJobs/deleteOldStudentsCron");

// Initialize Express app
const app = express();

// Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use('/api/v1', routes);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const express = require("express");
const router = express.Router();

const studentRoutes = require("../modules/student/routes/studentRoutes");
router.use("/student", studentRoutes);

module.exports = router;
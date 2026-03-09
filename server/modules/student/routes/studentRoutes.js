const express = require("express");
const router = express.Router();
const { getStudent, getStudentById, createStudent, updateStudent, deleteStudent, purge, restoreStudent, getDeletedStudents } = require("../services/StudentService");

router.get("/deleted", getDeletedStudents); 

router.delete("/:id/purge", purge);
router.patch("/:id/restore", restoreStudent);

router.get("/", getStudent);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.patch("/:id", updateStudent);
router.delete("/:id", deleteStudent);


module.exports = router;
const prisma = require("../../../config/dbConnect");
const apiResponse = require("../../../helpers/apiResponse");
const pageinate = require("../../../helpers/pageinate");

async function getStudent(req, res) {
  try {
    const where = {
      status: { not: "DELETED" },
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.name && {
        name: {
          contains: req.query.name,
          mode: "insensitive"
        },
      }),
      ...(req.query.email && {
        email: {
          contains: req.query.email,
          mode: "insensitive"
        },
      }),
    };

    const { skip, take, meta } = pageinate(req.query);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({
        where
      })
    ]);

    return res.json(apiResponse.response("SUCCESS", {
      students,
      pageinate: meta(total)
    }));

  } catch (error) {
    console.error("error in fetching the students: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

async function getStudentById(req, res) {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: req.params.id,
        status: "ACTIVE"
      }
    });

    if (!student) {
      return res.json(apiResponse.response("NOT_FOUND", {
        message: "student not found"
      }));
    }

    return res.json(apiResponse.response("SUCCESS", student));
  } catch (error) {
    console.error("Error in fetching the student details: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

async function createStudent(req, res) {
  try {
    const {
      name,
      email,
      age
    } = req.body;

    if (!name || !email || !age) {
      return res.json(apiResponse.response("VALIDATION_ERROR", {
        message: "missing fields: all fields are required"
      }));
    }

    const exists = await prisma.student.findUnique({
      where: {
        email
      }
    });

    if (exists) {
      return res.json(apiResponse.response("CONFLICT", {
        message: "a user with this email already exists"
      }));
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        age: Number(age)
      }
    });

    return res.json(apiResponse.response("SUCCESS", newStudent));
  } catch (error) {
    console.error("Error in creating the student: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "Internal server error",
      error: error.message
    }));
  }
}

async function updateStudent(req, res) {
  try {
    const { name, email, age, status } = req.body;

    const student = await prisma.student.findFirst({
      where: {
        id: req.params.id,
        status: "ACTIVE"
      }
    });

    if (!student) {
      return res.json(apiResponse.response("NOT_FOUND", {
        message: "Student not found"
      }));
    }

    const data = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (age !== undefined) data.age = Number(age);
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0) {
      return res.json(
        apiResponse.response("VALIDATION_ERROR", {
          message: "No fields provided to update"
        })
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data
    });

    return res.json(apiResponse.response("SUCCESS", updatedStudent));
  } catch (error) {
    console.error("Error in updating the student: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

async function deleteStudent(req, res) {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: req.params.id,
        status: "ACTIVE"
      },
    });

    if (!student) {
      return res.json(apiResponse.response("NOT_FOUND", {
        message: "Student Not found"
      }));
    }

    await prisma.student.update({
      where: {
        id: student.id
      },
      data: {
        status: "DELETED"
      }
    });

    return res.json(apiResponse.response("SUCCESS", {
      message: "Successfully deleted the student. If you want to restore the student please navigate to recently deleted"
    }));
  } catch (error) {
    console.error("Error in deleting the student: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

async function purge(req, res) {
  try {
    const deletedStudent = await prisma.student.findFirst({
      where: {
        id: req.params.id,
        status: "DELETED"
      },
    });

    if (!deletedStudent) {
      return res.json(apiResponse.response("NOT_FOUND", {
        message: "student not found"
      }));
    }

    await prisma.student.delete({
      where: {
        id: deletedStudent.id
      }
    });

    return res.json(apiResponse.response("SUCCESS", {
      message: "permentaly deleted a student"
    }));
  } catch (error) {
    console.error("Error in purging the student:  ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

async function restoreStudent(req, res) {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: req.params.id,
        status: "DELETED"
      },
    });

    if (!student) {
      return res.json(apiResponse.response("NOT_FOUND", {
        message: "student not found"
      }));
    }

    await prisma.student.update({
      where: {
        id: student.id
      },
      data: {
        status: "ACTIVE"
      }
    });

    return res.json(apiResponse.response("SUCCESS", {
      message: "successfully restore student"
    }));
  } catch (error) {
    console.error("Error in restoring the student: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

async function getDeletedStudents(req, res) {
  try {
    const where = {
      status: "DELETED",
      ...(req.query.name && {
        name: { contains: req.query.name, mode: "insensitive" }
      }),
      ...(req.query.email && {
        email: { contains: req.query.email, mode: "insensitive" }
      })
    };

    const { skip, take, meta } = pageinate(req.query);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({
        where
      })
    ]);

    return res.json(apiResponse.response("SUCCESS", {
      students,
      pageinate: meta(total)
    }));

  } catch (error) {
    console.error("error in fetching the students: ", error);
    return res.json(apiResponse.response("ERROR", {
      message: "internal server error",
      error: error.message
    }));
  }
}

module.exports = { getStudent, getStudentById, createStudent, updateStudent, deleteStudent, purge, restoreStudent, getDeletedStudents };
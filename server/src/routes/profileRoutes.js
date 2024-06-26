const express = require('express');
const router = express.Router();
const {validatePatient, validateStaff, validateUser} = require('../middlewares');
const catchAsync = require('../utils/catchAsync');

const {
    getPatientProfile,
    updatePatientProfile,
    deletePatientProfile,
    getStaffProfile,
    getStaffSchedule,
    updateStaffProfile,
    deleteStaffProfile,
    getAdminProfile,
    updateAdminProfile,
    deleteAdminProfile,
} = require('../controllers/profileController');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

router.get('/patient/:email', authMiddleware(["PATIENT"]), profileMiddleware(true), catchAsync(getPatientProfile));
router.put('/patient/:email', authMiddleware(["PATIENT"]), profileMiddleware(true), validatePatient, catchAsync(updatePatientProfile));
router.delete('/patient/:email', authMiddleware(["PATIENT"]), profileMiddleware(true), catchAsync(deletePatientProfile));

router.get('/staff/schedule/:email', authMiddleware(["DOCTOR", "PARAMEDICAL"]), profileMiddleware(true), catchAsync(getStaffSchedule));
router.get('/staff/:email', authMiddleware(["DOCTOR", "PARAMEDICAL"]), profileMiddleware(true), catchAsync(getStaffProfile));
router.put('/staff/:email', authMiddleware(["DOCTOR", "PARAMEDICAL"]), profileMiddleware(true), validateStaff, catchAsync(updateStaffProfile));
router.delete('/staff/:email', authMiddleware(["DOCTOR", "PARAMEDICAL"]), profileMiddleware(true), catchAsync(deleteStaffProfile));

router.get('/admin/:email', authMiddleware(["ADMIN"]), profileMiddleware(true), catchAsync(getAdminProfile));
router.put('/admin/:email', authMiddleware(["ADMIN"]), profileMiddleware(true), validateUser, catchAsync(updateAdminProfile));
router.delete('/admin/:email', authMiddleware(["ADMIN"]), profileMiddleware(true), catchAsync(deleteAdminProfile));

module.exports = router;
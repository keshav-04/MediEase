//utils
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const ExpressError = require('../utils/ExpressError');

const profileMiddleware = (completeProfileAssert = false) => {
    return async (req, res, next) => {
        try {
            const role = req.cookies.token;
            const user = req.user;

            if (!user || !role) {
                throw new ExpressError("User not found", 404);
            }

            req.completeProfile = true

            if (role === "PATIENT") {
                const patientExists = await prisma.patient.findUnique({
                    where: {
                        email: user.email
                    },
                });

                if (!patientExists  || patientExists.status === "INACTIVE") {
                    // throw new ExpressError("Patient Profile Incomplete, Please complete your profile", 400);
                    req.completeProfile = false;
                }

                req.patient = patientExists;
            }

            if (role === "PARAMEDICAL" || role === "DOCTOR") {
                const staffExists = await prisma.staff.findUnique({
                    where: {
                        email: user.email
                    },
                });

                if (!staffExists || staffExists.status === "INACTIVE") {
                    // const errMsg = `${role === "PARAMEDICAL" ? "Paramedical": "Doctor"} Profile Incomplete, Please complete your profile`;
                    // throw new ExpressError(errMsg, 400);
                    req.completeProfile = false;
                }

                req.staff = staffExists;
            }

            if (completeProfileAssert && !req.completeProfile) {
                throw new ExpressError("Profile Incomplete, Please complete your profile", 400);
            } else {
                next();
            }
        } catch (err) {
            throw new ExpressError(err.message, 500);
        }
    };
}

module.exports = profileMiddleware;
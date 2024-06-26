const express = require("express");
const router = express.Router();

//controllers
const {
  approveRequestController,
  rejectRequestController,
  pendingRequestController,
  feedbackSubmitController,
} = require("../controllers/mailController.js");
const catchAsync = require("../utils/catchAsync");

const authMiddleware = require("../middlewares/authMiddleware");
const { validateFeedback } = require("../middlewares.js");

const roles = ["ADMIN"];

router.post(
  "/approve",
  authMiddleware(roles),
  catchAsync(approveRequestController)
);
router.post(
  "/reject",
  authMiddleware(roles),
  catchAsync(rejectRequestController)
);
router.post("/pending", catchAsync(pendingRequestController));
router.post(
  "/feedback",
  authMiddleware(["DOCTOR", "PARAMEDICAL", "PATIENT"]), 
  validateFeedback,
  catchAsync(feedbackSubmitController)
);
module.exports = router;

const express = require("express");
const { createRequirement, getRequirements } = require("../controllers/requirementController");
const router = express.Router();
router.route("/").get(getRequirements).post(createRequirement);
module.exports = router;

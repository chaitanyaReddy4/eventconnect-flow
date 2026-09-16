const Requirement = require("../models/Requirement");
const categories = ["planner", "performer", "crew"];

const validationMessage = (body) => {
  const missing = ["eventName", "eventType", "startDate", "endDate", "location", "category"].find((field) => !body[field]);
  if (missing) return `${missing} is required`;
  if (!categories.includes(body.category)) return "category must be planner, performer, or crew";
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "startDate and endDate must be valid dates";
  if (endDate < startDate) return "End date cannot be before start date";
  if (!body.categoryDetails || typeof body.categoryDetails !== "object") return "categoryDetails is required";
  if (body.category === "planner" && !body.categoryDetails.planningType) return "planningType is required";
  if (body.category === "performer" && body.categoryDetails.performerMode === "individual" && !body.categoryDetails.performerType) return "performerType is required";
  if (body.category === "performer" && body.categoryDetails.performerMode === "band" && (!body.categoryDetails.groupName || Number(body.categoryDetails.numberOfMembers) < 1)) return "groupName and numberOfMembers are required";
  if (body.category === "performer" && body.categoryDetails.performerMode === "band" && Array.isArray(body.categoryDetails.members) && body.categoryDetails.members.some((member) => !member.role || Number(member.quantity) < 1)) return "Each band member role needs a name and a quantity of at least 1";
  if (body.category === "crew" && !body.categoryDetails.crewType) return "crewType is required";
  if (body.category === "crew") {
    const crewCountFields = ["numberOfPhotographers", "numberOfVideographers", "numberOfAudioCrew", "numberOfLightingCrew", "numberOfStageCrew", "numberOfCrewMembers", "numberOfSecurityPersonnel"];
    if (crewCountFields.some((field) => body.categoryDetails[field] !== undefined && Number(body.categoryDetails[field]) < 1)) return "Crew counts must be at least 1";
  }
  return null;
};

const createRequirement = async (req, res) => {
  const errorMessage = validationMessage(req.body);
  if (errorMessage) return res.status(400).json({ success: false, message: "Validation failed", error: errorMessage });
  try {
    const requirement = await Requirement.create(req.body);

    res.status(201).json({
      success: true,
      message: "Requirement created successfully",
      data: requirement,
    });
  } catch (error) {
    console.error("Create requirement error:", error.message);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create requirement",
      ...(process.env.NODE_ENV !== "production" ? { error: error.message } : {}),
    });
  }
};

const getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    console.error("Get requirements error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch requirements",
      ...(process.env.NODE_ENV !== "production" ? { error: error.message } : {}),
    });
  }
};

module.exports = {
  createRequirement,
  getRequirements,
};

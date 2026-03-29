const express = require("express");

const jobController = require("../controllers/jobController");

const router = express.Router();

router.post("/process/:jobId", jobController.processJob);
router.get("/results/:jobId", jobController.getResults);

module.exports = router;


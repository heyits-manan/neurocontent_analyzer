import express from "express";
import { processJob, getResults } from "../controllers/jobController";

const router = express.Router();

router.post("/process/:jobId", processJob);
router.get("/results/:jobId", getResults);

export default router;

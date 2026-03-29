const { v4: uuidv4 } = require("uuid");

const { readJobs, writeJobs } = require("../utils/storage");

const createJob = async ({ filename, originalName, mimetype, size, videoPath }) => {
  const jobs = await readJobs();

  const job = {
    id: uuidv4(),
    filename,
    originalName,
    mimetype,
    size,
    videoPath,
    status: "uploaded",
    results: null,
    error: null,
    createdAt: new Date().toISOString(),
    processedAt: null
  };

  jobs[job.id] = job;
  await writeJobs(jobs);
  return job;
};

const getJobById = async (jobId) => {
  const jobs = await readJobs();
  return jobs[jobId] || null;
};

const updateJob = async (jobId, updates) => {
  const jobs = await readJobs();

  if (!jobs[jobId]) {
    return null;
  }

  jobs[jobId] = {
    ...jobs[jobId],
    ...updates
  };

  await writeJobs(jobs);
  return jobs[jobId];
};

module.exports = {
  createJob,
  getJobById,
  updateJob
};


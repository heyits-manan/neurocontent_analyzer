const fs = require("fs/promises");
const path = require("path");

const dataDirectory = path.resolve(process.cwd(), "src/data");
const jobsFilePath = path.join(dataDirectory, "jobs.json");

const ensureStorage = async () => {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(jobsFilePath);
  } catch (_error) {
    await fs.writeFile(jobsFilePath, JSON.stringify({}, null, 2), "utf-8");
  }
};

const readJobs = async () => {
  await ensureStorage();
  const data = await fs.readFile(jobsFilePath, "utf-8");
  return JSON.parse(data);
};

const writeJobs = async (jobs) => {
  await ensureStorage();
  await fs.writeFile(jobsFilePath, JSON.stringify(jobs, null, 2), "utf-8");
};

module.exports = {
  ensureStorage,
  readJobs,
  writeJobs
};


import fs from "fs/promises";
import path from "path";
import { JobStore } from "../types";

const dataDirectory = path.resolve(process.cwd(), "src/data");
const jobsFilePath = path.join(dataDirectory, "jobs.json");

export const ensureStorage = async (): Promise<void> => {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(jobsFilePath);
  } catch (_error) {
    await fs.writeFile(jobsFilePath, JSON.stringify({}, null, 2), "utf-8");
  }
};

export const readJobs = async (): Promise<JobStore> => {
  await ensureStorage();
  const data = await fs.readFile(jobsFilePath, "utf-8");
  return JSON.parse(data) as JobStore;
};

export const writeJobs = async (jobs: JobStore): Promise<void> => {
  await ensureStorage();
  await fs.writeFile(jobsFilePath, JSON.stringify(jobs, null, 2), "utf-8");
};

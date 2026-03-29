import { v4 as uuidv4 } from "uuid";
import { readJobs, writeJobs } from "../utils/storage";
import { Job, CreateJobInput } from "../types";

export const createJob = async ({
  filename,
  originalName,
  mimetype,
  size,
  videoPath,
}: CreateJobInput): Promise<Job> => {
  const jobs = await readJobs();

  const job: Job = {
    id: uuidv4(),
    filename,
    originalName,
    mimetype,
    size,
    videoPath,
    audioPath: null,
    status: "uploaded",
    transcript: [],
    results: null,
    error: null,
    createdAt: new Date().toISOString(),
    processedAt: null,
  };

  jobs[job.id] = job;
  await writeJobs(jobs);
  return job;
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
  const jobs = await readJobs();
  return jobs[jobId] || null;
};

export const updateJob = async (
  jobId: string,
  updates: Partial<Job>
): Promise<Job | null> => {
  const jobs = await readJobs();

  if (!jobs[jobId]) {
    return null;
  }

  jobs[jobId] = {
    ...jobs[jobId],
    ...updates,
  };

  await writeJobs(jobs);
  return jobs[jobId];
};

import { supabase } from "../utils/supabaseClient";
import { Job, CreateJobInput } from "../types";

export const createJob = async (input: CreateJobInput): Promise<Job> => {
  const row: Record<string, unknown> = {
    status: "uploaded",
    video_storage_path: input.video_storage_path,
    original_name: input.original_name,
    mime_type: input.mime_type,
    size_bytes: input.size_bytes,
  };

  if (input.id) {
    row.id = input.id;
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return data as Job;
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  return data as Job;
};

export const updateJob = async (
  jobId: string,
  updates: Partial<Omit<Job, "id" | "created_at">>
): Promise<Job | null> => {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to update job: ${error.message}`);
  }

  return data as Job;
};

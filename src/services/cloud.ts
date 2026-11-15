import { createClient } from "@supabase/supabase-js";
import { parsePortable, type PortableData } from "./backup";
const configuration = import.meta.env;
const url = configuration.VITE_SUPABASE_URL;
const key = configuration.VITE_SUPABASE_ANON_KEY;
export const cloudClient =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
export type CloudSnapshot = { revision: number; payload: PortableData };
export async function readCloud(): Promise<CloudSnapshot | null> {
  if (!cloudClient) throw new Error("Cloud unavailable");
  const { data, error } = await cloudClient
    .from("study_backups")
    .select("revision,payload")
    .maybeSingle();
  if (error) throw error;
  return data
    ? { revision: data.revision, payload: parsePortable(data.payload) }
    : null;
}
export async function writeCloud(
  payload: PortableData,
  expected: number,
): Promise<number> {
  if (!cloudClient) throw new Error("Cloud unavailable");
  const { data, error } = await cloudClient.rpc("save_study_backup", {
    document: payload,
    expected_revision: expected,
  });
  if (error) throw error;
  if (typeof data !== "number") throw new Error("Invalid cloud response");
  return data;
}

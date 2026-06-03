import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  if (!client) {
    client = createClient(url, key);
  }
  return client;
}

export async function listCropsFromDb() {
  const supabase = getSupabase();
  if (!supabase) {
    return { source: "local", data: [] };
  }
  const { data, error } = await supabase
    .from("crops")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return { source: "supabase", data: data || [] };
}

export async function listBoostersFromDb() {
  const supabase = getSupabase();
  if (!supabase) {
    return { source: "local", data: [] };
  }
  const { data, error } = await supabase
    .from("boosters")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return { source: "supabase", data: data || [] };
}

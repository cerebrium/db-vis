import type { DBDetails } from "../types";

export type Response = {
  Name: string;
};

export async function get(path: string): Promise<DBDetails | null> {
  const current_domain = window.location.origin + "/api/";

  const res = await fetch(current_domain + path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    if (res.status !== 200) {
      console.error(res.statusText);
      return null;
    }
    const j_res = await res.json();

    return j_res;
  } catch (e) {
    console.error(e);
  }

  return null;
}

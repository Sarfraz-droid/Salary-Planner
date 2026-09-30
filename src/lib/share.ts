import LZ from "lz-string";
import { sanitize } from "./plan";
import type { Plan } from "./types";

const PREFIX = "#/s/";

/** The whole plan lives inside the URL fragment: no server, never sent over the wire. */
export function buildShareUrl(plan: Plan) {
  // Paid-state is personal; drop it from shared copies.
  const slim = { ...plan, items: plan.items.map((i) => ({ ...i, paid: false })) };
  const data = LZ.compressToEncodedURIComponent(JSON.stringify(slim));
  return `${location.origin}${location.pathname}${PREFIX}${data}`;
}

export function readSharedPlan(hash = location.hash): Plan | null {
  if (!hash.startsWith(PREFIX)) return null;
  try {
    const json = LZ.decompressFromEncodedURIComponent(hash.slice(PREFIX.length));
    return json ? sanitize(JSON.parse(json)) : null;
  } catch {
    return null;
  }
}

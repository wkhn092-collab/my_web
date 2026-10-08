import 'server-only';

/** The privacy policy promises this: "a lead that did not become work is deleted after 12 months". */
export const LEAD_RETENTION_MONTHS = 12;
/** Leads that became clients are business records and stay. */
export const KEPT_STATUS = 'won';
/** One run deletes at most this many, so a single invocation stays well inside the function time limit. */
export const PURGE_BATCH = 200;

export function retentionCutoff(now: Date = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - LEAD_RETENTION_MONTHS);
  return cutoff.toISOString();
}

/** Values arrive as GROQ parameters; the slice bound is a compile-time constant, never input. */
export const EXPIRED_LEADS_QUERY = `*[_type == "lead" && status != $kept && defined(createdAt) && createdAt < $cutoff] | order(createdAt asc) [0...${PURGE_BATCH}]._id`;

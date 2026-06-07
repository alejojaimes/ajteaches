export type WorkEntry = {
  role: string;
  company: string;
  period: string;
};

export function toWorkEntries(value: unknown): WorkEntry[] {
  return Array.isArray(value) ? (value as WorkEntry[]) : [];
}

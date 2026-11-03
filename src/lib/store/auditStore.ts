import { SolventAuditRecord } from "@/types";

// In-memory persistent store across requests for local/serverless environments
const auditsMap = new Map<string, SolventAuditRecord>();

export const AuditStore = {
  save(audit: SolventAuditRecord): void {
    auditsMap.set(audit.id, { ...audit });
  },

  getById(id: string): SolventAuditRecord | null {
    const record = auditsMap.get(id);
    if (!record) return null;
    return { ...record };
  },

  update(id: string, updates: Partial<SolventAuditRecord>): SolventAuditRecord | null {
    const record = auditsMap.get(id);
    if (!record) return null;
    const updated: SolventAuditRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    auditsMap.set(id, updated);
    return { ...updated };
  },

  delete(id: string): boolean {
    return auditsMap.delete(id);
  },
};

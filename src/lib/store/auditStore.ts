import { SolventAuditRecord } from "@/types";
import { supabase } from "../supabase";

declare global {
  // eslint-disable-next-line no-var
  var __solventAuditsMap: Map<string, SolventAuditRecord> | undefined;
}

// Ultra-fast global in-memory cache shared across Next.js route handlers
const auditsMap = globalThis.__solventAuditsMap || new Map<string, SolventAuditRecord>();
globalThis.__solventAuditsMap = auditsMap;

export const AuditStore = {
  async save(audit: SolventAuditRecord): Promise<void> {
    auditsMap.set(audit.id, { ...audit });

    // Sync to Supabase if credentials are provided
    if (supabase) {
      try {
        await supabase.from("solvent_audits").upsert({
          id: audit.id,
          created_at: audit.createdAt,
          updated_at: audit.updatedAt,
          expires_at: audit.expiresAt,
          status: audit.status,
          access_token_hash: audit.accessTokenHash,
          schema_version: audit.schemaVersion,
          period_start: audit.periodStart,
          period_end: audit.periodEnd,
          period_days: audit.periodDays,
          total_debits_inr: audit.totalDebitsINR,
          total_credits_inr: audit.totalCreditsINR,
          net_cash_flow_inr: audit.netCashFlowINR,
          total_debit_count: audit.totalDebitCount,
          total_credit_count: audit.totalCreditCount,
          micro_drain_count: audit.microDrainCount,
          micro_drain_inr: audit.microDrainINR,
          aggregated_payload: audit.aggregatedPayload,
          teaser_result: audit.teaserResult,
          pro_dossier: audit.proDossier,
          is_paid: true,
          currency: audit.currency,
        });
      } catch (err) {
        console.warn("Supabase sync non-fatal error:", err);
      }
    }
  },

  async getById(id: string): Promise<SolventAuditRecord | null> {
    const memoryRecord = auditsMap.get(id);
    if (memoryRecord) return { ...memoryRecord };

    // Fetch from Supabase if not in memory
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("solvent_audits")
          .select("*")
          .eq("id", id)
          .single();

        if (data && !error) {
          const record: SolventAuditRecord = {
            id: data.id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            expiresAt: data.expires_at,
            status: data.status,
            accessTokenHash: data.access_token_hash,
            schemaVersion: data.schema_version,
            periodStart: data.period_start,
            periodEnd: data.period_end,
            periodDays: data.period_days,
            totalDebitsINR: Number(data.total_debits_inr),
            totalCreditsINR: Number(data.total_credits_inr),
            netCashFlowINR: Number(data.net_cash_flow_inr),
            totalDebitCount: data.total_debit_count,
            totalCreditCount: data.total_credit_count,
            microDrainCount: data.micro_drain_count,
            microDrainINR: Number(data.micro_drain_inr),
            aggregatedPayload: data.aggregated_payload,
            teaserResult: data.teaser_result,
            proDossier: data.pro_dossier,
            isPaid: true,
            tierAmountPaise: 0,
            currency: data.currency || "INR",
          };
          auditsMap.set(id, record);
          return record;
        }
      } catch (err) {
        console.warn("Supabase fetch non-fatal error:", err);
      }
    }

    return null;
  },

  async update(id: string, updates: Partial<SolventAuditRecord>): Promise<SolventAuditRecord | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: SolventAuditRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    auditsMap.set(id, updated);

    if (supabase) {
      try {
        await supabase
          .from("solvent_audits")
          .update({
            updated_at: updated.updatedAt,
            teaser_result: updated.teaserResult,
            pro_dossier: updated.proDossier,
            status: updated.status,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase update non-fatal error:", err);
      }
    }

    return { ...updated };
  },

  delete(id: string): boolean {
    if (supabase) {
      supabase.from("solvent_audits").delete().eq("id", id).then();
    }
    return auditsMap.delete(id);
  },
};

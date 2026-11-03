"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  useEffect(() => {
    if (auditId) {
      // 100% Free - automatically forward directly to full report
      router.replace(`/report/${auditId}`);
    }
  }, [auditId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-center p-6 space-y-4">
      <Activity className="w-8 h-8 text-liquidity animate-spin" />
      <h2 className="text-base font-semibold text-text-primary">Opening your free forensic dossier...</h2>
    </div>
  );
}

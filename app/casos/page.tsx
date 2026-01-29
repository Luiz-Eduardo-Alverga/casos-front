"use client"

import { Reports } from "@/components/reports";
import { ProtectedRoute } from "@/components/protected-route";

export default function CasosPage() {
  return (
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  );
}

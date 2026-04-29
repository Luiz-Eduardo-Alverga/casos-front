"use client";

import { useMutation } from "@tanstack/react-query";
import {
  reportAnalysis,
  type ReportAnalysisParams,
} from "@/services/ia/assistant";

export function useReportAnalysis() {
  return useMutation({
    mutationFn: (params: ReportAnalysisParams) => reportAnalysis(params),
  });
}


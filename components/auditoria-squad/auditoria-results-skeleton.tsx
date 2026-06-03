"use client";

import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUMMARY_CARDS = 4;
const TABLE_ROWS = 4;

export function AuditoriaResultsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: SUMMARY_CARDS }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-divider bg-card p-5 shadow-card"
          >
            <div className="mb-3 flex items-start gap-3">
              <Skeleton className="h-[34px] w-[34px] shrink-0 rounded" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-6 w-10 rounded" />
            </div>
            <Skeleton className="mb-3 h-[5px] w-full rounded-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>

      <Card className="bg-card shadow-card rounded-lg">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Membros do Squad
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 border-b border-border-divider hover:bg-muted/40">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i} className="py-4 px-6">
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: TABLE_ROWS }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="py-3 px-6">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

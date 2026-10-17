"use client";

import { ReactNode } from "react";

type DashboardOverviewProps = {
  children: ReactNode;
};

export default function DashboardOverview({
  children,
}: DashboardOverviewProps) {
  return <>{children}</>;
}

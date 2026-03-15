import type { Metadata } from "next"
import AnalyticsPage from "@/components/dashboard/analytics/AnalyticsPage"
export const metadata: Metadata = { title: "Analytics" }
export default function Page() { return <AnalyticsPage /> }

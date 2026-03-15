import type { Metadata } from "next"
import TeamPage from "@/components/dashboard/team/TeamPage"
export const metadata: Metadata = { title: "Team" }
export default function Page() { return <TeamPage /> }

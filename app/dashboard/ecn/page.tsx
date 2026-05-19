import { redirect } from 'next/navigation'

export default function DashboardEcnRedirect() {
  redirect('/dashboard?funnel=ecn')
}

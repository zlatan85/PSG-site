import { redirect } from 'next/navigation';

export default function AgentEntry({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;
  const target = token ? `/admin/agent/clusters?token=${encodeURIComponent(token)}` : '/admin/agent/clusters';
  redirect(target);
}

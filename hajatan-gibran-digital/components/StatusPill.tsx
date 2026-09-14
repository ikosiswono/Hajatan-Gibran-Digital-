export default function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-pill status-${key}`}>{status}</span>;
}

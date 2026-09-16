export function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`status-pill ${active ? "status-pill-active" : ""}`}>
      <span className="status-pill-dot" />
      {label}
    </span>
  );
}

export function Header({ title, eyebrow, action }: { title: string; eyebrow: string; action?: React.ReactNode }) {
  return <header className="page-hero-header">
    <div className="page-hero-copy"><div className="kicker">{eyebrow}</div><h1>{title}</h1></div>
    {action && <div className="page-hero-action">{action}</div>}
  </header>;
}

export function Header({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <header className="mb-8">
      <div className="kicker">{eyebrow}</div>
      <h1 className="text-3xl md:text-5xl font-semibold tracking-[-.05em] mt-2">{title}</h1>
    </header>
  );
}

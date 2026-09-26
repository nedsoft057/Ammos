import type { LiveYieldPool } from "@/lib/live/types";

function money(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

export function LiveMarketChart({ pools }: { pools: LiveYieldPool[] }) {
  const data = [...pools].filter(p => p.tvlUsd > 0).sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, 8);
  const max = Math.max(...data.map(p => p.tvlUsd), 1);
  const points = data.map((p, i) => ({
    ...p,
    x: data.length === 1 ? 50 : 6 + (i / (data.length - 1)) * 88,
    y: 76 - (p.tvlUsd / max) * 55,
  }));
  const line = points.map(p => `${p.x},${p.y}`).join(" ");
  const area = points.length ? `6,82 ${line} 94,82` : "6,82 94,82";

  return (
    <div className="market-chart" aria-label="Live observed liquidity chart">
      <div className="chart-toolbar">
        <div>
          <div className="kicker">Live market surface</div>
          <div className="chart-title">Liquidity concentration</div>
        </div>
        <div className="chart-legend"><span className="legend-dot" /> current observations</div>
      </div>
      <div className="chart-canvas chart-canvas-large">
        <div className="chart-y-labels"><span>{money(max)}</span><span>{money(max * .66)}</span><span>{money(max * .33)}</span><span>$0</span></div>
        <svg viewBox="0 0 100 90" preserveAspectRatio="none" className="chart-svg" role="img">
          <defs>
            <linearGradient id="ammosArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8e7cff" stopOpacity=".34"/><stop offset="1" stopColor="#8e7cff" stopOpacity="0"/></linearGradient>
            <linearGradient id="ammosLine" x1="0" x2="1"><stop stopColor="#64e7ff"/><stop offset=".55" stopColor="#8e7cff"/><stop offset="1" stopColor="#dc61ff"/></linearGradient>
            <filter id="chartGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {[18, 38, 58, 78].map(y => <line key={y} x1="6" x2="94" y1={y} y2={y} className="chart-grid-line" />)}
          <polygon points={area} fill="url(#ammosArea)" />
          <polyline points={line} fill="none" stroke="url(#ammosLine)" strokeWidth=".9" vectorEffect="non-scaling-stroke" filter="url(#chartGlow)" />
          {points.map((p, i) => <g key={p.pool}><circle cx={p.x} cy={p.y} r="1.45" className="chart-point"/><circle cx={p.x} cy={p.y} r="3.8" className="chart-pulse" style={{ animationDelay: `${i * 180}ms` }} /></g>)}
        </svg>
        <div className="chart-x-labels">{points.map(p => <span key={p.pool}>{p.symbol.length > 9 ? `${p.symbol.slice(0, 8)}…` : p.symbol}</span>)}</div>
      </div>
      <div className="chart-footnote">DeFiLlama indexed Aave V3 / Uniswap V3 records · not a fabricated historical series.</div>
    </div>
  );
}

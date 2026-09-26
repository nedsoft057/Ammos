export function AmmosScene({ compact = false }: { compact?: boolean }) {
  const nodes = [
    { x: "18%", y: "27%", label: "AAVE", delay: "-1.2s" },
    { x: "78%", y: "20%", label: "UNI", delay: "-2.8s" },
    { x: "82%", y: "72%", label: "WETH", delay: "-4.1s" },
    { x: "22%", y: "76%", label: "USDC", delay: "-3.3s" },
  ];
  return (
    <div className={`ammos-scene ${compact ? "ammos-scene-compact" : ""}`} aria-hidden="true">
      <div className="scene-haze scene-haze-a" />
      <div className="scene-haze scene-haze-b" />
      <div className="scene-grid scene-grid-back" />
      <div className="scene-grid scene-grid-floor" />
      <svg className="scene-network" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="networkLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6ee7ff" stopOpacity="0" />
            <stop offset=".5" stopColor="#9b7cff" stopOpacity=".8" />
            <stop offset="1" stopColor="#d55cff" stopOpacity="0" />
          </linearGradient>
          <filter id="softGlow"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="M18 27 C34 32 36 42 50 50 C64 58 68 29 78 20" />
        <path d="M18 27 C32 52 29 62 22 76 C31 79 39 67 50 50 C61 34 67 53 82 72" />
        <path d="M78 20 C66 34 65 44 50 50 C60 61 71 64 82 72" />
        <path d="M22 76 C36 65 43 58 50 50 C57 43 63 40 78 20" />
        <g className="scene-flow" filter="url(#softGlow)"><circle cx="50" cy="50" r=".8"/><circle cx="50" cy="50" r=".45"/></g>
      </svg>
      {nodes.map((node) => (
        <div key={node.label} className="scene-node" style={{ left: node.x, top: node.y, animationDelay: node.delay }}>
          <span className="scene-node-ring" />
          <span className="scene-node-core" />
          <span className="scene-node-label">{node.label}</span>
        </div>
      ))}
      <div className="agent-orbit">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />
        <div className="agent-core">
          <div className="core-inner" />
          <div className="core-shine" />
        </div>
        <div className="agent-caption"><span className="status-dot" /> AMMOS / observing</div>
      </div>
      <div className="scene-scan" />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

type Point = { x:number; y:number; z:number; phase:number; speed:number; size:number };

function fitCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, dpr };
}

export function CinematicField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let disposed = false;
    const points: Point[] = Array.from({ length: 105 }, () => ({
      x: Math.random(), y: Math.random(), z: 0.35 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2, speed: 0.12 + Math.random() * 0.28,
      size: 0.45 + Math.random() * 1.4,
    }));

    const draw = (time: number) => {
      if (disposed) return;
      const { width, height, dpr } = fitCanvas(canvas);
      const t = time * 0.001;
      ctx.clearRect(0, 0, width, height);

      const base = ctx.createRadialGradient(width*.72, height*.48, 0, width*.72, height*.48, Math.max(width,height)*.82);
      base.addColorStop(0, "rgba(87,71,180,.16)");
      base.addColorStop(.42, "rgba(45,88,156,.07)");
      base.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let band=0; band<7; band++) {
        const yBase = height * (.18 + band*.105);
        ctx.beginPath();
        for (let i=0; i<=90; i++) {
          const x=(i/90)*width;
          const wave = Math.sin(i*.17 + t*(.42+band*.025))*height*(.012+band*.001) + Math.sin(i*.055-t*.22+band)*height*.022;
          const y=yBase+wave;
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        const g=ctx.createLinearGradient(0,0,width,0);
        g.addColorStop(0,"rgba(105,77,255,0)"); g.addColorStop(.2,"rgba(132,108,255,.10)");
        g.addColorStop(.52,"rgba(91,218,255,.16)"); g.addColorStop(.82,"rgba(150,105,255,.10)"); g.addColorStop(1,"rgba(105,77,255,0)");
        ctx.strokeStyle=g; ctx.lineWidth=Math.max(1,dpr*(.65+band*.06)); ctx.globalAlpha=.72; ctx.stroke();
      }
      ctx.restore();

      for (let r=0; r<13; r++) {
        const depth=r/12, yCenter=height*(.46+depth*.19), amplitude=height*(.035+depth*.055);
        ctx.beginPath();
        for (let i=0; i<=150; i++) {
          const p=i/150, x=width*(.05+p*.91), envelope=Math.sin(p*Math.PI);
          const waveA=Math.sin(p*8.2+t*.8+r*.31), waveB=Math.sin(p*18-t*.43+r*.17), waveC=Math.sin(p*3.4+t*.27);
          const y=yCenter+envelope*amplitude*(waveA*.58+waveB*.14+waveC*.25);
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        const g=ctx.createLinearGradient(0,0,width,0);
        g.addColorStop(0,"rgba(98,70,245,0)"); g.addColorStop(.16,`rgba(112,91,255,${.09+depth*.05})`);
        g.addColorStop(.48,`rgba(86,212,255,${.14+depth*.05})`); g.addColorStop(.75,`rgba(151,111,255,${.12+depth*.04})`); g.addColorStop(1,"rgba(98,70,245,0)");
        ctx.save(); ctx.strokeStyle=g; ctx.lineWidth=dpr*(1.1+(1-depth)*1.9); ctx.globalAlpha=.42+(1-depth)*.42;
        ctx.shadowBlur=dpr*(12+(1-depth)*14); ctx.shadowColor="rgba(112,101,255,.22)"; ctx.stroke(); ctx.restore();
      }

      for (const p of points) {
        const drift=(t*p.speed+p.phase)%1;
        const px=p.x*width+Math.sin(t*.23+p.phase)*width*.018;
        const py=p.y*height+Math.sin(t*p.speed+p.phase)*height*.025;
        const pulse=.62+Math.sin(t*1.6+p.phase)*.22, alpha=Math.max(.05,.32*p.z*pulse);
        ctx.beginPath(); ctx.arc(px,py+drift*height*.015,p.size*p.z*dpr,0,Math.PI*2);
        ctx.fillStyle=p.phase%2>1?`rgba(106,221,255,${alpha})`:`rgba(170,128,255,${alpha})`; ctx.fill();
      }

      const scan=(t*.055)%1.2-.1, sx=width*scan;
      const sg=ctx.createRadialGradient(sx,height*.52,0,sx,height*.52,width*.13);
      sg.addColorStop(0,"rgba(120,220,255,.075)"); sg.addColorStop(.35,"rgba(137,104,255,.035)"); sg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=sg; ctx.fillRect(0,0,width,height);

      const vignette=ctx.createRadialGradient(width*.58,height*.5,Math.min(width,height)*.16,width*.58,height*.5,Math.max(width,height)*.74);
      vignette.addColorStop(0,"rgba(0,0,0,0)"); vignette.addColorStop(.72,"rgba(0,0,0,.08)"); vignette.addColorStop(1,"rgba(0,0,0,.48)");
      ctx.fillStyle=vignette; ctx.fillRect(0,0,width,height);

      raf=window.requestAnimationFrame(draw);
    };

    const resizeObserver=new ResizeObserver(()=>fitCanvas(canvas));
    resizeObserver.observe(canvas);
    fitCanvas(canvas);
    raf=window.requestAnimationFrame(draw);

    return ()=>{ disposed=true; window.cancelAnimationFrame(raf); resizeObserver.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

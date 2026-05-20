/* ===================================================
   IVIS v2 — Premium JS: Cursor · Canvas · Dashboard
   =================================================== */
(function () {
  'use strict';

  /* ── Custom cursor ──────────────────────────── */
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function ringFollow() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(ringFollow);
  })();

  document.querySelectorAll('a, button, .btn, .widget, .service-card, .why-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  /* ── Magnetic buttons ───────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const bx = e.clientX - r.left - r.width  / 2;
      const by = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${bx * 0.18}px, ${by * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
  });

  /* ── Nav scroll ──────────────────────────────── */
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── Parallax on hero content ────────────────── */
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    if (heroContent) {
      heroContent.style.transform = `translateY(${window.scrollY * 0.07}px)`;
    }
  }, { passive: true });

  /* ─────────────────────────────────────────────
     HERO CANVAS — organic neural sketch
  ───────────────────────────────────────────── */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], time = 0;

    function resize() {
      const wrap = canvas.parentElement;
      W = canvas.width  = wrap.clientWidth;
      H = canvas.height = wrap.clientHeight;
    }

    function buildNodes(count) {
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: 60 + Math.random() * (W - 120),
          y: 40 + Math.random() * (H - 80),
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 1.8 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
          type: Math.floor(Math.random() * 3)
        });
      }
    }

    function wobblePath(cx, cy, r, wobble, segs) {
      segs = segs || 32;
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const nr = r + Math.sin(a * 4 + time * 0.6) * wobble +
                       Math.cos(a * 7 + time * 0.3) * (wobble * 0.5);
        const x = cx + Math.cos(a) * nr;
        const y = cy + Math.sin(a) * nr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function roughLine(x1, y1, x2, y2, jitter) {
      jitter = jitter || 1.2;
      const steps = 10;
      ctx.beginPath();
      ctx.moveTo(x1 + (Math.random()-0.5)*jitter, y1 + (Math.random()-0.5)*jitter);
      for (let i = 1; i <= steps; i++) {
        const t  = i / steps;
        const x  = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
        const y  = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
        ctx.lineTo(x, y);
      }
    }

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);
      time += 0.007;

      nodes.forEach(n => {
        n.x += n.vx + Math.sin(time * 0.5 + n.phase) * 0.18;
        n.y += n.vy + Math.cos(time * 0.4 + n.phase) * 0.14;
        if (n.x < 30 || n.x > W - 30) n.vx *= -1;
        if (n.y < 20 || n.y > H - 20) n.vy *= -1;
      });

      /* Connections */
      const maxDist = 180;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const a = (1 - d / maxDist) * 0.2;
            ctx.save();
            ctx.globalAlpha = a;
            ctx.strokeStyle = '#5a5249';
            ctx.lineWidth   = 0.7;
            roughLine(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, 0.6);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      /* Nodes */
      nodes.forEach((n, idx) => {
        const pulse = 1 + Math.sin(time * 1.1 + n.phase) * 0.25;

        ctx.save();
        ctx.globalAlpha = 0.5;
        wobblePath(n.x, n.y, n.r * pulse, 0.5, 14);
        ctx.fillStyle = '#1a1814';
        ctx.fill();
        ctx.restore();

        if (n.type === 0) {
          ctx.save();
          ctx.globalAlpha = 0.07;
          ctx.strokeStyle = '#1a1814';
          ctx.lineWidth = 0.7;
          wobblePath(n.x, n.y, n.r * 4 + Math.sin(time + n.phase) * 3, 2, 20);
          ctx.stroke();
          ctx.restore();
        }
        if (n.type === 1 && idx % 4 === 0) {
          ctx.save();
          ctx.globalAlpha = 0.05;
          ctx.strokeStyle = '#1a1814';
          ctx.lineWidth = 1;
          wobblePath(n.x, n.y, n.r * 7, 3, 24);
          ctx.stroke();
          ctx.restore();
        }
      });

      /* Central orbit system */
      const cx = W * 0.5, cy = H * 0.5;
      [0.36, 0.25, 0.15].forEach((frac, i) => {
        const r = Math.min(W, H) * frac;
        ctx.save();
        ctx.globalAlpha = 0.055 - i * 0.012;
        ctx.strokeStyle = '#1a1814';
        ctx.lineWidth   = 1.2 - i * 0.3;
        wobblePath(cx, cy, r, 5 - i * 1.5, 38);
        ctx.stroke();
        ctx.restore();
      });

      /* Orbiting particle */
      const ox = cx + Math.cos(time * 0.4) * (Math.min(W,H) * 0.3);
      const oy = cy + Math.sin(time * 0.4) * (Math.min(W,H) * 0.18);
      ctx.save();
      ctx.globalAlpha = 0.35;
      wobblePath(ox, oy, 3.5, 1, 12);
      ctx.fillStyle = '#1a1814';
      ctx.fill();
      ctx.restore();

      /* Centre dot */
      ctx.save();
      ctx.globalAlpha = 0.2;
      wobblePath(cx, cy, 5 + Math.sin(time) * 2, 1, 12);
      ctx.fillStyle = '#1a1814';
      ctx.fill();
      ctx.restore();

      requestAnimationFrame(drawFrame);
    }

    resize();
    buildNodes(32);
    drawFrame();
    window.addEventListener('resize', () => { resize(); buildNodes(32); });
  }

  /* ─────────────────────────────────────────────
     RING CHART (imperfect)
  ───────────────────────────────────────────── */
  function buildRingChart(svgEl, pct) {
    const R = 52, cx = 72, cy = 72;
    svgEl.setAttribute('viewBox', '0 0 144 144');
    svgEl.innerHTML = '';

    /* Ghost track */
    const trackD = arcWobblePath(cx, cy, R, 0, 1, 3.5);
    const track = makeSVGEl('path', {
      d: trackD, stroke: 'rgba(246,243,238,0.1)',
      'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round'
    });
    svgEl.appendChild(track);

    /* Second ghost ring */
    const ring2D = arcWobblePath(cx, cy, R - 11, 0, 1, 2.5);
    const ring2 = makeSVGEl('path', {
      d: ring2D, stroke: 'rgba(246,243,238,0.05)',
      'stroke-width': '3', fill: 'none'
    });
    svgEl.appendChild(ring2);

    /* Filled arc */
    const arcD = arcWobblePath(cx, cy, R, 0, pct, 2.5);
    const arc = makeSVGEl('path', {
      d: arcD, stroke: 'rgba(246,243,238,0.75)',
      'stroke-width': '5', fill: 'none', 'stroke-linecap': 'round',
      opacity: '0'
    });
    svgEl.appendChild(arc);
    /* Fade in */
    setTimeout(() => {
      arc.style.transition = 'opacity 0.8s';
      arc.setAttribute('opacity', '1');
    }, 200);

    /* Dash ticks */
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      const a = t * Math.PI * 2 - Math.PI / 2;
      const r1 = R + 10 + (Math.random()-0.5)*2;
      const r2 = R + 14 + (Math.random()-0.5)*2;
      const tick = makeSVGEl('line', {
        x1: (cx + Math.cos(a)*r1).toFixed(1), y1: (cy + Math.sin(a)*r1).toFixed(1),
        x2: (cx + Math.cos(a)*r2).toFixed(1), y2: (cy + Math.sin(a)*r2).toFixed(1),
        stroke: 'rgba(246,243,238,' + (t <= pct ? '0.3' : '0.08') + ')',
        'stroke-width': '1'
      });
      svgEl.appendChild(tick);
    }

    /* Centre text */
    const pctTxt = makeSVGEl('text', {
      x: cx, y: cy - 4,
      'text-anchor': 'middle',
      'font-family': 'DM Mono, monospace',
      'font-size': '13', fill: 'rgba(246,243,238,0.8)'
    });
    pctTxt.textContent = Math.round(pct * 100) + '%';
    svgEl.appendChild(pctTxt);

    const labelTxt = makeSVGEl('text', {
      x: cx, y: cy + 12,
      'text-anchor': 'middle',
      'font-family': 'DM Mono, monospace',
      'font-size': '7', fill: 'rgba(246,243,238,0.3)',
      'letter-spacing': '2'
    });
    labelTxt.textContent = 'ACTIVE';
    svgEl.appendChild(labelTxt);
  }

  function arcWobblePath(cx, cy, r, fromFrac, toFrac, wobble) {
    const steps = Math.max(4, Math.round((toFrac - fromFrac) * 80));
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = fromFrac + (toFrac - fromFrac) * (i / steps);
      const a = t * Math.PI * 2 - Math.PI / 2;
      const nr = r + Math.sin(a * 5 + 0.3) * wobble + Math.cos(a * 9) * (wobble * 0.4);
      const x  = cx + Math.cos(a) * nr;
      const y  = cy + Math.sin(a) * nr;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
    }
    return d;
  }

  /* ─────────────────────────────────────────────
     LINE CHART
  ───────────────────────────────────────────── */
  function buildLineChart(svgEl) {
    svgEl.setAttribute('viewBox', '0 0 380 100');
    svgEl.innerHTML = '';

    /* Grid lines */
    [25, 50, 75].forEach(y => {
      const l = makeSVGEl('line', {
        x1: 0, y1: y, x2: 380, y2: y,
        stroke: 'rgba(246,243,238,0.06)', 'stroke-width': '1'
      });
      svgEl.appendChild(l);
    });

    const generatePts = (offset, n) => {
      const pts = [];
      let y = 50 + offset;
      for (let i = 0; i < n; i++) {
        y += (Math.random()-0.5)*14 + Math.sin(i*0.6+offset)*8;
        y = Math.max(10, Math.min(90, y));
        pts.push({ x: 5 + (i/(n-1))*370, y });
      }
      return pts;
    };

    const buildLinePath = (pts, jitter) => {
      let d = '';
      pts.forEach((p, i) => {
        const jx = p.x + (Math.random()-0.5)*jitter;
        const jy = p.y + (Math.random()-0.5)*jitter;
        d += (i===0?'M':'L') + jx.toFixed(1)+','+jy.toFixed(1);
      });
      return d;
    };

    /* Area under main line */
    const pts1 = generatePts(0, 22);
    let fillD = `M${pts1[0].x},100 `;
    pts1.forEach(p => fillD += `L${p.x},${p.y} `);
    fillD += `L${pts1[pts1.length-1].x},100 Z`;
    svgEl.appendChild(makeSVGEl('path', {
      d: fillD, fill: 'rgba(246,243,238,0.04)'
    }));

    /* Secondary ghost line */
    const pts2 = generatePts(20, 22);
    const line2 = makeSVGEl('path', {
      d: buildLinePath(pts2, 1),
      stroke: 'rgba(246,243,238,0.2)', 'stroke-width': '1.2',
      fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svgEl.appendChild(line2);

    /* Main line */
    const mainD = buildLinePath(pts1, 1.2);
    const mainLine = makeSVGEl('path', {
      d: mainD, stroke: 'rgba(246,243,238,0.75)', 'stroke-width': '1.8',
      fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svgEl.appendChild(mainLine);

    /* Animate line stroke */
    const len = 800;
    mainLine.style.strokeDasharray  = len;
    mainLine.style.strokeDashoffset = len;
    mainLine.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(0.16,1,0.3,1) 0.3s';
    setTimeout(() => { mainLine.style.strokeDashoffset = 0; }, 100);

    /* Dots */
    pts1.forEach((p, i) => {
      if (i % 4 !== 0) return;
      svgEl.appendChild(makeSVGEl('circle', {
        cx: p.x.toFixed(1), cy: p.y.toFixed(1),
        r: '2.5', fill: 'rgba(246,243,238,0.5)'
      }));
    });
  }

  /* ─────────────────────────────────────────────
     BAR CHART
  ───────────────────────────────────────────── */
  function buildBarChart() {
    const wrap = document.querySelector('.bar-chart-inner');
    if (!wrap) return;
    const heights = [0.38, 0.6, 0.44, 0.78, 0.52, 0.9, 0.65, 0.42, 0.72, 0.55, 0.83, 0.47];
    wrap.innerHTML = '';
    heights.forEach((h, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = '0%';
      bar.style.opacity = 0.45 + h * 0.3;
      bar.style.transition = `height 1.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.055}s`;
      wrap.appendChild(bar);
      setTimeout(() => { bar.style.height = (h * 100) + '%'; }, 200);
    });
  }

  /* ─────────────────────────────────────────────
     NODE GRAPH
  ───────────────────────────────────────────── */
  function buildNodeGraph(svgEl) {
    svgEl.setAttribute('viewBox', '0 0 220 115');
    svgEl.innerHTML = '';

    const nodes = [
      {x:18,y:57},{x:55,y:28},{x:55,y:86},{x:100,y:20},
      {x:100,y:95},{x:140,y:40},{x:140,y:80},{x:185,y:35},
      {x:185,y:80},{x:210,y:57}
    ];
    const edges = [[0,1],[0,2],[1,3],[2,4],[1,4],[3,5],[4,6],[5,7],[6,8],[7,9],[8,9],[5,6],[3,6]];

    edges.forEach(([a,b]) => {
      const line = makeSVGEl('line', {
        x1: nodes[a].x, y1: nodes[a].y,
        x2: nodes[b].x, y2: nodes[b].y,
        stroke: 'rgba(246,243,238,0.15)', 'stroke-width': '0.8'
      });
      svgEl.appendChild(line);
    });

    nodes.forEach((n, i) => {
      const r = 2.5 + (i % 3) * 1.2;
      const outer = makeSVGEl('circle', {
        cx: n.x, cy: n.y, r: r + 4,
        fill: 'none', stroke: 'rgba(246,243,238,0.1)', 'stroke-width': '0.7'
      });
      svgEl.appendChild(outer);
      const inner = makeSVGEl('circle', {
        cx: n.x, cy: n.y, r,
        fill: 'rgba(246,243,238,0.55)'
      });
      svgEl.appendChild(inner);
    });
  }

  /* ─────────────────────────────────────────────
     TREND CHART (multi-series)
  ───────────────────────────────────────────── */
  function buildTrendChart(svgEl) {
    svgEl.setAttribute('viewBox', '0 0 320 90');
    svgEl.innerHTML = '';

    /* Grid */
    [22, 45, 68].forEach(y => {
      svgEl.appendChild(makeSVGEl('line', {
        x1: 0, y1: y, x2: 320, y2: y,
        stroke: 'rgba(246,243,238,0.05)', 'stroke-width': '1'
      }));
    });

    const series = [
      { opacity: '0.7', width: '1.6', offset: 0 },
      { opacity: '0.3', width: '1.2', offset: 18 },
      { opacity: '0.15', width: '1', offset: -15 }
    ];

    series.forEach(s => {
      const n = 24;
      let y = 45 + s.offset;
      const pts = [];
      for (let i = 0; i < n; i++) {
        y += (Math.random()-0.5)*10;
        y = Math.max(8, Math.min(82, y));
        pts.push({ x: 5 + (i/(n-1))*310, y });
      }
      let d = '';
      pts.forEach((p, i) => {
        const jx = p.x + (Math.random()-0.5)*1;
        const jy = p.y + (Math.random()-0.5)*1;
        d += (i===0?'M':'L') + jx.toFixed(1)+','+jy.toFixed(1);
      });
      svgEl.appendChild(makeSVGEl('path', {
        d, stroke: 'rgba(246,243,238,' + s.opacity + ')',
        'stroke-width': s.width, fill: 'none',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      }));
    });
  }

  /* ─────────────────────────────────────────────
     ABOUT SKETCH
  ───────────────────────────────────────────── */
  function buildAboutSketch(svgEl) {
    if (!svgEl) return;
    svgEl.setAttribute('viewBox', '0 0 300 400');
    svgEl.innerHTML = '';

    /* Paper sheet layers */
    [{r:-1.8, o:0.12},{r:0.6, o:0.16},{r:0, o:0.22}].forEach((sheet, i) => {
      const rect = makeSVGEl('rect', {
        x: 20, y: 30, width: 255, height: 340,
        fill: 'rgba(24,21,18,' + (i===2?'0.02':'0') + ')',
        stroke: 'rgba(24,21,18,' + sheet.o + ')',
        'stroke-width': '0.8',
        transform: `rotate(${sheet.r}, 148, 200)`
      });
      svgEl.appendChild(rect);
    });

    /* Horizontal sketch lines */
    for (let i = 0; i < 10; i++) {
      svgEl.appendChild(makeSVGEl('line', {
        x1: 38 + Math.random()*6, y1: 68 + i*28 + (Math.random()-0.5)*3,
        x2: 252 + Math.random()*8, y2: 68 + i*28 + (Math.random()-0.5)*3,
        stroke: 'rgba(24,21,18,0.08)', 'stroke-width': '0.6'
      }));
    }

    /* Central orbital system */
    const cx = 148, cy = 200;
    [{r:80, segs:50, wob:5, op:0.12},{r:55, segs:40, wob:3, op:0.15},{r:30, segs:30, wob:2, op:0.18}]
      .forEach(ring => {
        let d = '';
        for (let i = 0; i <= ring.segs; i++) {
          const a = (i/ring.segs)*Math.PI*2;
          const nr = ring.r + Math.sin(a*4+1)*ring.wob + Math.cos(a*7)*ring.wob*0.5;
          const x = cx + Math.cos(a)*nr;
          const y = cy + Math.sin(a)*nr;
          d += (i===0?'M':'L') + x.toFixed(2)+','+y.toFixed(2);
        }
        d += 'Z';
        svgEl.appendChild(makeSVGEl('path', {
          d, fill: 'none',
          stroke: 'rgba(24,21,18,' + ring.op + ')',
          'stroke-width': '0.8'
        }));
      });

    /* Radial spokes */
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2;
      svgEl.appendChild(makeSVGEl('line', {
        x1: cx + Math.cos(a)*12, y1: cy + Math.sin(a)*12,
        x2: cx + Math.cos(a)*(60 + Math.random()*20),
        y2: cy + Math.sin(a)*(60 + Math.random()*20),
        stroke: 'rgba(24,21,18,0.08)', 'stroke-width': '0.6'
      }));
    }

    /* Centre */
    svgEl.appendChild(makeSVGEl('circle', {
      cx, cy, r: '5', fill: 'none',
      stroke: 'rgba(24,21,18,0.3)', 'stroke-width': '1'
    }));

    /* Corner annotation arrow */
    const arrow = makeSVGEl('path', {
      d: 'M240,80 Q255,85 258,100',
      fill: 'none', stroke: 'rgba(24,21,18,0.2)',
      'stroke-width': '0.8', 'stroke-dasharray': '2,2'
    });
    svgEl.appendChild(arrow);

    /* Bottom label */
    const txt = makeSVGEl('text', {
      x: '148', y: '370',
      'text-anchor': 'middle',
      'font-family': 'DM Serif Display, serif',
      'font-size': '40', fill: 'rgba(24,21,18,0.06)',
      'letter-spacing': '8', 'font-style': 'italic'
    });
    txt.textContent = 'IVIS';
    svgEl.appendChild(txt);
  }

  /* ─────────────────────────────────────────────
     WHY VISUAL
  ───────────────────────────────────────────── */
  function buildWhyVisual(svgEl) {
    if (!svgEl) return;
    svgEl.setAttribute('viewBox', '0 0 340 340');
    svgEl.innerHTML = '';
    const cx = 170, cy = 170;

    /* Concentric imperfect rings */
    [130, 100, 72, 46, 22].forEach((r, i) => {
      let d = '';
      const segs = 50;
      for (let j = 0; j <= segs; j++) {
        const a = (j/segs)*Math.PI*2;
        const nr = r + Math.sin(a*5+i)*6 + Math.cos(a*8+i*0.5)*3;
        const x = cx + Math.cos(a)*nr;
        const y = cy + Math.sin(a)*nr;
        d += (j===0?'M':'L') + x.toFixed(2)+','+y.toFixed(2);
      }
      d += 'Z';
      svgEl.appendChild(makeSVGEl('path', {
        d, fill: 'none',
        stroke: 'rgba(246,243,238,' + (0.12 - i*0.015) + ')',
        'stroke-width': '1'
      }));
    });

    /* Radial lines */
    for (let i = 0; i < 16; i++) {
      const a = (i/16)*Math.PI*2;
      svgEl.appendChild(makeSVGEl('line', {
        x1: cx + Math.cos(a)*18, y1: cy + Math.sin(a)*18,
        x2: cx + Math.cos(a)*(80 + Math.random()*50),
        y2: cy + Math.sin(a)*(80 + Math.random()*50),
        stroke: 'rgba(246,243,238,0.07)', 'stroke-width': '0.6'
      }));
    }

    /* Cross-hairs */
    ['M170,30 L170,310', 'M30,170 L310,170'].forEach(d => {
      svgEl.appendChild(makeSVGEl('path', {
        d, stroke: 'rgba(246,243,238,0.06)',
        'stroke-width': '0.7', 'stroke-dasharray': '3,6'
      }));
    });

    /* Centre dot + ring */
    svgEl.appendChild(makeSVGEl('circle', {
      cx, cy, r: '8', fill: 'none',
      stroke: 'rgba(246,243,238,0.3)', 'stroke-width': '1'
    }));
    svgEl.appendChild(makeSVGEl('circle', {
      cx, cy, r: '3', fill: 'rgba(246,243,238,0.5)'
    }));

    /* IVIS label */
    const txt = makeSVGEl('text', {
      x: cx, y: cy + 5, 'text-anchor': 'middle',
      'font-family': 'DM Mono, monospace',
      'font-size': '8', fill: 'rgba(246,243,238,0.25)',
      'letter-spacing': '4'
    });
    txt.textContent = 'IVIS';
    svgEl.appendChild(txt);
  }

  /* ─────────────────────────────────────────────
     SERVICE DECO SVGs
  ───────────────────────────────────────────── */
  function buildServiceDecos() {
    document.querySelectorAll('.service-deco').forEach((svgEl, i) => {
      svgEl.setAttribute('viewBox', '0 0 60 60');
      svgEl.innerHTML = '';
      const cx = 30, cy = 30;
      const shapes = [
        () => {
          let d = '';
          for (let j = 0; j <= 40; j++) {
            const a = (j/40)*Math.PI*2;
            const r = 22 + Math.sin(a*4)*4;
            d += (j===0?'M':'L') + (cx+Math.cos(a)*r).toFixed(1)+','+(cy+Math.sin(a)*r).toFixed(1);
          }
          return d+'Z';
        },
        () => 'M10,50 L30,10 L50,50 Z',
        () => 'M10,10 L50,10 L50,50 L10,50 Z',
        () => {
          let d='M30,8';
          for(let j=1;j<6;j++){
            const a=(j*72-90)*Math.PI/180;
            d+=' L'+(30+22*Math.cos(a)).toFixed(1)+','+(30+22*Math.sin(a)).toFixed(1);
          }
          return d+'Z';
        },
        () => 'M30,8 L52,50 L8,50 Z'
      ];

      svgEl.appendChild(makeSVGEl('path', {
        d: shapes[i % shapes.length](),
        fill: 'none', stroke: 'rgba(24,21,18,1)',
        'stroke-width': '1.5'
      }));
    });
  }

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  function makeSVGEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    return el;
  }

  /* ─────────────────────────────────────────────
     SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ─────────────────────────────────────────────
     DASHBOARD INIT (on enter viewport)
  ───────────────────────────────────────────── */
  const dashObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        buildRingChart(document.querySelector('#ring1'), 0.74);
        buildRingChart(document.querySelector('#ring2'), 0.59);
        buildLineChart(document.querySelector('#lineChart'));
        buildBarChart();
        buildNodeGraph(document.querySelector('#nodeGraph'));
        buildTrendChart(document.querySelector('#trendChart'));

        /* Stream bars */
        document.querySelectorAll('.stream-bar-fill').forEach(f => {
          setTimeout(() => { f.style.width = f.dataset.width; }, 400);
        });

        dashObs.disconnect();
      }
    });
  }, { threshold: 0.08 });

  const dashSec = document.getElementById('dashboard');
  if (dashSec) dashObs.observe(dashSec);

  /* ─────────────────────────────────────────────
     STATIC SVGS
  ───────────────────────────────────────────── */
  buildAboutSketch(document.querySelector('.about-sketch'));
  buildWhyVisual(document.querySelector('.why-svg'));
  buildServiceDecos();

  /* ─────────────────────────────────────────────
     SCROLL PROGRESS BAR (top edge)
  ───────────────────────────────────────────── */
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const max  = document.body.scrollHeight - window.innerHeight;
    const pct  = (window.scrollY / max) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
  }, { passive: true });

  /* ─────────────────────────────────────────────
     SECTION PARALLAX on scroll
  ───────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const ghost = document.querySelector('.hero-ghost');
    if (ghost) ghost.style.transform = `translateY(${sy * 0.12}px)`;
  }, { passive: true });

})();

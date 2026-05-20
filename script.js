/* ===================================================
   IVIS — Vanilla JS: Canvas, Dashboard, Animations
   =================================================== */

(function () {
  'use strict';

  /* ── Hero Canvas: floating sketch neural network ── */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], time = 0;

    const PAPER = '#f5f2ee';
    const INK   = '#1a1814';
    const INK3  = '#6b6560';

    function resize() {
      const wrap = canvas.parentElement;
      W = canvas.width  = wrap.clientWidth;
      H = canvas.height = wrap.clientHeight;
    }

    /* Build organic node positions */
    function buildNodes(count) {
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.5 + Math.random() * 2.5,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    /* Imperfect circle: slightly wobbly */
    function wobbleCircle(cx, cy, r, wobble, segments) {
      segments = segments || 28;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const nr = r + Math.sin(a * 3 + time * 0.5) * wobble;
        const x = cx + Math.cos(a) * nr;
        const y = cy + Math.sin(a) * nr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    /* Rough line with jitter */
    function roughLine(x1, y1, x2, y2, jitter) {
      jitter = jitter || 1.5;
      const steps = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
        const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
        ctx.lineTo(mx, my);
      }
    }

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);
      time += 0.008;

      /* Update node physics */
      nodes.forEach(n => {
        n.x += n.vx + Math.sin(time * 0.4 + n.phase) * 0.15;
        n.y += n.vy + Math.cos(time * 0.3 + n.phase) * 0.12;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      /* Draw connections */
      const maxDist = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.18;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = INK3;
            ctx.lineWidth = 0.8;
            roughLine(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, 0.8);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      /* Draw nodes */
      nodes.forEach((n, idx) => {
        const pulse = 1 + Math.sin(time * 1.2 + n.phase) * 0.3;
        ctx.save();
        ctx.globalAlpha = 0.55;
        wobbleCircle(n.x, n.y, n.r * pulse, 0.6, 16);
        ctx.fillStyle = INK;
        ctx.fill();
        ctx.restore();

        /* Occasional larger orbit ring */
        if (idx % 5 === 0) {
          ctx.save();
          ctx.globalAlpha = 0.07;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 0.8;
          wobbleCircle(n.x, n.y, n.r * 5 + Math.sin(time + n.phase) * 4, 2.5, 20);
          ctx.stroke();
          ctx.restore();
        }
      });

      /* Central sketch brain/orbit */
      const cx = W * 0.5, cy = H * 0.5;

      /* Outer rough ring */
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      wobbleCircle(cx, cy, Math.min(W, H) * 0.38, 6, 40);
      ctx.stroke();
      ctx.restore();

      /* Middle ring */
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      wobbleCircle(cx, cy, Math.min(W, H) * 0.25, 4, 30);
      ctx.stroke();
      ctx.restore();

      /* Inner dot */
      ctx.save();
      ctx.globalAlpha = 0.25;
      wobbleCircle(cx, cy, 5 + Math.sin(time) * 2, 1.5, 14);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.restore();

      requestAnimationFrame(drawFrame);
    }

    resize();
    buildNodes(28);
    drawFrame();
    window.addEventListener('resize', () => { resize(); buildNodes(28); });
  }

  /* ── Dashboard: imperfect ring charts (SVG) ───── */
  function buildRingChart(svgEl, pct, label) {
    const R = 52, cx = 70, cy = 70;
    const wobble = 3.5;
    const segments = 60;
    const filled = Math.round(pct * segments);

    svgEl.setAttribute('viewBox', '0 0 140 140');
    svgEl.innerHTML = '';

    /* Build arc path with wobble */
    function arcPath(fromFrac, toFrac, radius, wob) {
      let d = '';
      const steps = Math.max(2, Math.round((toFrac - fromFrac) * 80));
      for (let i = 0; i <= steps; i++) {
        const t = fromFrac + (toFrac - fromFrac) * (i / steps);
        const angle = t * Math.PI * 2 - Math.PI / 2;
        const r = radius + Math.sin(angle * 5 + 0.3) * wob;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
      }
      return d;
    }

    /* Background track */
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    track.setAttribute('d', arcPath(0, 1, R, 3.5));
    track.setAttribute('stroke', 'rgba(26,24,20,0.08)');
    track.setAttribute('stroke-width', '5');
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke-linecap', 'round');
    svgEl.appendChild(track);

    /* Filled arc */
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', arcPath(0, pct, R, 2.8));
    arc.setAttribute('stroke', '#1a1814');
    arc.setAttribute('stroke-width', '5');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke-linecap', 'round');
    arc.setAttribute('opacity', '0.75');
    svgEl.appendChild(arc);

    /* Dash ticks */
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const angle = t * Math.PI * 2 - Math.PI / 2;
      const r1 = R + 10 + (Math.random() - 0.5) * 2;
      const r2 = R + 14 + (Math.random() - 0.5) * 2;
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', (cx + Math.cos(angle) * r1).toFixed(1));
      tick.setAttribute('y1', (cy + Math.sin(angle) * r1).toFixed(1));
      tick.setAttribute('x2', (cx + Math.cos(angle) * r2).toFixed(1));
      tick.setAttribute('y2', (cy + Math.sin(angle) * r2).toFixed(1));
      tick.setAttribute('stroke', '#1a1814');
      tick.setAttribute('stroke-width', '1');
      tick.setAttribute('opacity', t <= pct ? '0.35' : '0.1');
      svgEl.appendChild(tick);
    }

    /* Centre text */
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy + 5);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', 'DM Mono, monospace');
    txt.setAttribute('font-size', '11');
    txt.setAttribute('fill', '#1a1814');
    txt.setAttribute('opacity', '0.65');
    txt.textContent = Math.round(pct * 100) + '%';
    svgEl.appendChild(txt);
  }

  /* ── Dashboard: line chart ─────────────────── */
  function buildLineChart(svgEl) {
    svgEl.setAttribute('viewBox', '0 0 300 90');
    svgEl.innerHTML = '';

    const pts = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      pts.push({
        x: 10 + (i / (n - 1)) * 280,
        y: 20 + Math.random() * 50 + Math.sin(i * 0.7) * 15
      });
    }

    /* Area fill */
    let fillD = `M${pts[0].x},90 `;
    pts.forEach(p => fillD += `L${p.x},${p.y} `);
    fillD += `L${pts[pts.length-1].x},90 Z`;
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fill.setAttribute('d', fillD);
    fill.setAttribute('fill', 'rgba(26,24,20,0.04)');
    svgEl.appendChild(fill);

    /* Rough line */
    let d = '';
    pts.forEach((p, i) => {
      const jx = p.x + (Math.random() - 0.5) * 1.5;
      const jy = p.y + (Math.random() - 0.5) * 1.5;
      d += (i === 0 ? 'M' : 'L') + jx.toFixed(1) + ',' + jy.toFixed(1);
    });
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', d);
    line.setAttribute('stroke', '#1a1814');
    line.setAttribute('stroke-width', '1.4');
    line.setAttribute('fill', 'none');
    line.setAttribute('opacity', '0.65');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    svgEl.appendChild(line);

    /* Animate the line drawing */
    const len = line.getTotalLength ? line.getTotalLength() : 400;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.16,1,0.3,1) 0.5s';
    setTimeout(() => { line.style.strokeDashoffset = 0; }, 400);

    /* Dots at data points */
    pts.forEach((p, i) => {
      if (i % 3 !== 0) return;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', p.x.toFixed(1));
      c.setAttribute('cy', p.y.toFixed(1));
      c.setAttribute('r', '2.5');
      c.setAttribute('fill', '#1a1814');
      c.setAttribute('opacity', '0.5');
      svgEl.appendChild(c);
    });
  }

  /* ── Dashboard: bar chart ──────────────────── */
  function buildBarChart() {
    const wrap = document.querySelector('.bar-chart-inner');
    if (!wrap) return;
    const heights = [0.35, 0.55, 0.42, 0.72, 0.48, 0.85, 0.6, 0.38, 0.65, 0.78];
    wrap.innerHTML = '';
    heights.forEach(h => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = '0%';
      bar.style.transition = `height 1.4s cubic-bezier(0.16,1,0.3,1) ${Math.random() * 0.4}s`;
      wrap.appendChild(bar);
      setTimeout(() => { bar.style.height = (h * 100) + '%'; }, 300);
    });
  }

  /* ── Dashboard: node/connection SVG ───────── */
  function buildNodeGraph(svgEl) {
    svgEl.setAttribute('viewBox', '0 0 200 100');
    svgEl.innerHTML = '';

    const nodes = [
      {x:20,y:50},{x:60,y:25},{x:60,y:75},{x:110,y:20},
      {x:110,y:80},{x:150,y:50},{x:185,y:30},{x:185,y:70}
    ];
    const edges = [[0,1],[0,2],[1,3],[2,4],[1,4],[3,5],[4,5],[5,6],[5,7]];

    edges.forEach(([a,b]) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', nodes[a].x); line.setAttribute('y1', nodes[a].y);
      line.setAttribute('x2', nodes[b].x); line.setAttribute('y2', nodes[b].y);
      line.setAttribute('stroke', '#1a1814');
      line.setAttribute('stroke-width', '0.8');
      line.setAttribute('opacity', '0.22');
      svgEl.appendChild(line);
    });

    nodes.forEach((n, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const r = 3 + (i % 3);
      const wobR = r + (Math.random() - 0.5);
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y);
      c.setAttribute('r', wobR);
      c.setAttribute('fill', '#1a1814');
      c.setAttribute('opacity', '0.6');
      g.appendChild(c);
      svgEl.appendChild(g);
    });
  }

  /* ── Dashboard: trend chart ────────────────── */
  function buildTrendChart(svgEl) {
    svgEl.setAttribute('viewBox', '0 0 280 80');
    svgEl.innerHTML = '';

    const series = [
      { color: '#1a1814', opacity: 0.65 },
      { color: '#6b6560', opacity: 0.35 }
    ];

    series.forEach(s => {
      const pts = [];
      const n = 20;
      let y = 40;
      for (let i = 0; i < n; i++) {
        y += (Math.random() - 0.5) * 12;
        y = Math.max(8, Math.min(72, y));
        pts.push({ x: 5 + (i / (n-1)) * 270, y });
      }
      let d = '';
      pts.forEach((p, i) => d += (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1));
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', s.color);
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', s.opacity);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svgEl.appendChild(path);
    });
  }

  /* ── About sketch SVG ─────────────────────── */
  function buildAboutSketch(svgEl) {
    if (!svgEl) return;
    svgEl.setAttribute('viewBox', '0 0 300 380');
    svgEl.innerHTML = '';

    /* Paper layers */
    function sketchRect(x, y, w, h, rot) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', w); rect.setAttribute('height', h);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', '#1a1814');
      rect.setAttribute('stroke-width', '0.8');
      rect.setAttribute('opacity', '0.18');
      rect.setAttribute('transform', `rotate(${rot}, ${x+w/2}, ${y+h/2})`);
      svgEl.appendChild(rect);
    }

    sketchRect(20, 30, 260, 320, -1.2);
    sketchRect(25, 35, 255, 315, 0.8);

    /* Sketch lines inside */
    for (let i = 0; i < 8; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 40 + Math.random() * 10);
      line.setAttribute('y1', 60 + i * 30 + Math.random() * 5);
      line.setAttribute('x2', 240 + Math.random() * 20);
      line.setAttribute('y2', 60 + i * 30 + Math.random() * 5);
      line.setAttribute('stroke', '#1a1814');
      line.setAttribute('stroke-width', '0.7');
      line.setAttribute('opacity', '0.12');
      svgEl.appendChild(line);
    }

    /* IVIS text */
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', '150'); txt.setAttribute('y', '340');
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', 'DM Serif Display, serif');
    txt.setAttribute('font-size', '52');
    txt.setAttribute('fill', '#1a1814');
    txt.setAttribute('opacity', '0.08');
    txt.setAttribute('letter-spacing', '8');
    txt.textContent = 'IVIS';
    svgEl.appendChild(txt);

    /* Central orbit sketch */
    const cx = 150, cy = 180;
    [70, 100, 130].forEach((r, i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy);
      c.setAttribute('rx', r + (Math.random()-0.5)*5);
      c.setAttribute('ry', r * 0.65 + (Math.random()-0.5)*4);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', '#1a1814');
      c.setAttribute('stroke-width', '0.8');
      c.setAttribute('opacity', 0.12 - i * 0.02);
      c.setAttribute('transform', `rotate(${-15 + i * 10}, ${cx}, ${cy})`);
      svgEl.appendChild(c);
    });

    /* Central dot */
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
    dot.setAttribute('r', '4'); dot.setAttribute('fill', '#1a1814');
    dot.setAttribute('opacity', '0.3');
    svgEl.appendChild(dot);
  }

  /* ── Why visual sketch ────────────────────── */
  function buildWhyVisual(svgEl) {
    if (!svgEl) return;
    svgEl.setAttribute('viewBox', '0 0 320 320');
    svgEl.innerHTML = '';
    const cx = 160, cy = 160;

    /* Concentric imperfect rings */
    [60, 95, 130].forEach((r, i) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = '';
      const segs = 40;
      for (let j = 0; j <= segs; j++) {
        const a = (j / segs) * Math.PI * 2;
        const nr = r + Math.sin(a * 4 + i) * 5 + Math.cos(a * 7) * 3;
        const x = cx + Math.cos(a) * nr;
        const y = cy + Math.sin(a) * nr;
        d += (j === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
      }
      d += 'Z';
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#1a1814');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('opacity', 0.15 - i * 0.04);
      svgEl.appendChild(path);
    });

    /* Radial lines */
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx + Math.cos(a) * 20);
      line.setAttribute('y1', cy + Math.sin(a) * 20);
      line.setAttribute('x2', cx + Math.cos(a) * (60 + Math.random() * 70));
      line.setAttribute('y2', cy + Math.sin(a) * (60 + Math.random() * 70));
      line.setAttribute('stroke', '#1a1814');
      line.setAttribute('stroke-width', '0.6');
      line.setAttribute('opacity', '0.1');
      svgEl.appendChild(line);
    }

    /* Centre */
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
    dot.setAttribute('r', '6');
    dot.setAttribute('fill', 'none');
    dot.setAttribute('stroke', '#1a1814');
    dot.setAttribute('stroke-width', '1.2');
    dot.setAttribute('opacity', '0.4');
    svgEl.appendChild(dot);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy + 5);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', 'DM Mono, monospace');
    txt.setAttribute('font-size', '7');
    txt.setAttribute('fill', '#1a1814');
    txt.setAttribute('opacity', '0.4');
    txt.setAttribute('letter-spacing', '2');
    txt.textContent = 'IVIS';
    svgEl.appendChild(txt);
  }

  /* ── Stream bar animation ─────────────────── */
  function animateStreamBars() {
    const fills = document.querySelectorAll('.stream-bar-fill');
    fills.forEach(f => {
      const target = f.getAttribute('data-width') || '50%';
      setTimeout(() => { f.style.width = target; }, 500);
    });
  }

  /* ── Scroll Reveal ────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));

  /* ── Dashboard Init ───────────────────────── */
  const dashObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        /* Ring charts */
        const ring1 = document.querySelector('#ring1');
        const ring2 = document.querySelector('#ring2');
        if (ring1) buildRingChart(ring1, 0.73, 'User Activity');
        if (ring2) buildRingChart(ring2, 0.58, 'System Flow');

        /* Line chart */
        const lineChart = document.querySelector('#lineChart');
        if (lineChart) buildLineChart(lineChart);

        /* Bar chart */
        buildBarChart();

        /* Node graph */
        const nodeGraph = document.querySelector('#nodeGraph');
        if (nodeGraph) buildNodeGraph(nodeGraph);

        /* Trend chart */
        const trendChart = document.querySelector('#trendChart');
        if (trendChart) buildTrendChart(trendChart);

        /* Stream bars */
        animateStreamBars();

        dashObserver.disconnect();
      }
    });
  }, { threshold: 0.1 });

  const dashSection = document.getElementById('dashboard');
  if (dashSection) dashObserver.observe(dashSection);

  /* ── Static SVGs init ─────────────────────── */
  buildAboutSketch(document.querySelector('.about-sketch'));
  buildWhyVisual(document.querySelector('.why-svg'));

  /* ── Subtle parallax on scroll ────────────── */
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.transform = `translateY(${sy * 0.06}px)`;
    }
  }, { passive: true });

  /* ── Nav transparency ─────────────────────── */
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.backdropFilter = 'blur(12px)';
      nav.style.background = 'rgba(245,242,238,0.88)';
      nav.style.boxShadow = '0 1px 0 rgba(26,24,20,0.06)';
    } else {
      nav.style.backdropFilter = '';
      nav.style.background = '';
      nav.style.boxShadow = '';
    }
  }, { passive: true });

})();

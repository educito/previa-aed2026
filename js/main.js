/* Agenda Educativa Digital 2026–2030 · interacciones */
(() => {
  'use strict';

  // Fecha de lanzamiento: déjala en null para mostrar "Muy pronto",
  // o pon una fecha ISO (p. ej. '2026-11-20T10:00:00-05:00') para activar la cuenta regresiva.
  const FECHA_LANZAMIENTO = null;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Intro ---------- */
  $$('.hero__years b').forEach((b, i) => b.style.setProperty('--i', i));
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const toggle = $('#navToggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  const bar = $('.scroll-progress span');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const sections = $$('main section[id]');
  const links = $$('#navLinks a');
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => secObs.observe(s));

  /* ---------- Typewriter ---------- */
  const type = $('.type');
  if (type && !reduceMotion) {
    const words = JSON.parse(type.dataset.words);
    let w = 0, c = words[0].length, del = true;
    const tick = () => {
      const word = words[w];
      c += del ? -1 : 1;
      type.textContent = word.slice(0, c);
      let wait = del ? 45 : 85;
      if (!del && c === word.length) { del = true; wait = 2000; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Launch bar / countdown ---------- */
  const launchBar = $('#launchBar'), launchPct = $('#launchPct'), countdown = $('#launchCountdown');
  let pct = 0;
  const target = 87;
  const grow = () => {
    pct = Math.min(target, pct + Math.max(.4, (target - pct) * .05));
    launchBar.style.width = pct + '%';
    launchPct.textContent = Math.round(pct) + '%';
    if (pct < target) requestAnimationFrame(grow);
  };
  setTimeout(grow, reduceMotion ? 0 : 1200);

  if (FECHA_LANZAMIENTO) {
    const end = new Date(FECHA_LANZAMIENTO).getTime();
    const pad = n => String(n).padStart(2, '0');
    const upd = () => {
      const diff = end - Date.now();
      if (diff <= 0) { countdown.textContent = '¡Ya está aquí!'; return; }
      const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
            m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
      countdown.textContent = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
      setTimeout(upd, 1000);
    };
    upd();
  }

  /* ---------- Hero network canvas ---------- */
  const canvas = $('#heroNet');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], mouse = { x: -999, y: -999 };
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, W * H / 16000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.8 + .8, y2: Math.random() < .15
      }));
    };
    resize(); addEventListener('resize', resize);
    canvas.parentElement.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    let running = true;
    new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) draw(); }).observe(canvas);
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 15000) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 15000) * .35})`;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const md = (a.x - mouse.x) ** 2 + (a.y - mouse.y) ** 2;
        if (md < 30000) {
          ctx.strokeStyle = `rgba(22,242,178,${(1 - md / 30000) * .8})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = a.y2 ? '#F9CF00' : 'rgba(255,255,255,.9)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
  }

  /* ---------- Parallax (hero art) ---------- */
  const root = $('[data-parallax-root]');
  if (root && !reduceMotion && matchMedia('(pointer:fine)').matches) {
    const layers = $$('[data-depth]', root);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    $('.hero').addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2;
    });
    const loop = () => {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      const sy = Math.min(scrollY, innerHeight);
      layers.forEach(l => {
        const d = +l.dataset.depth;
        l.style.transform = `translate3d(${cx * d * -18}px, ${cy * d * -14 + sy * d * -.12}px, 0)`;
      });
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Reveal + counters ---------- */
  const fmt = n => n.toLocaleString('es-EC');
  const countUp = el => {
    const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = pre + fmt(to) + suf; return; }
    const dur = 1800, t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + fmt(Math.round(to * e)) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      $$('[data-count]', e.target).forEach(countUp);
      revObs.unobserve(e.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revObs.observe(el));

  /* ---------- Timeline fill ---------- */
  const tlFill = $('#timelineFill');
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    tlFill.style.width = '100%';
    tlFill.style.setProperty('--h', '100%');
    o.disconnect();
  }, { threshold: .35 }).observe($('#timeline'));

  /* ---------- Ejes modal ---------- */
  const EJES = [
    {
      color: '#008BF6',
      title: 'Conectividad universal y acceso equitativo',
      desc: 'Conectividad significativa, equipamiento tecnológico pertinente y entornos digitales seguros como base para integrar la tecnología en el aula.',
      purpose: 'La comunidad educativa cuenta con infraestructura tecnológica funcional, conectividad y espacios digitales adecuados.',
      goal: 'Al menos el 80 % de las instituciones con conectividad adecuada y equipamiento funcional (hoy: 66,6 %).',
      chips: ['Estándares mínimos de velocidad', 'Conectividad híbrida: fibra, satélite y móvil', 'Monitoreo en tiempo real', 'Aulas multipropósito', 'Docentes TIC', 'Redes de soporte territorial', 'Gestión de residuos tecnológicos']
    },
    {
      color: '#7a4dff',
      title: 'Competencias digitales y ciudadanía digital',
      desc: 'Conocimientos, habilidades, actitudes y valores para un uso crítico, ético, creativo y equitativo de la tecnología, con participación segura e informada.',
      purpose: 'La comunidad educativa posee competencias digitales y practica una ciudadanía digital responsable, crítica y segura.',
      goal: '70 % de docentes y 60 % de estudiantes demuestran competencias digitales.',
      chips: ['Microcredenciales en IA', 'Robótica y pensamiento computacional', 'Programación: HTML, JavaScript, Python', 'Prevención del ciberacoso', 'Bienestar digital', 'IA, RV, RA y XR en el aula', 'Sistema Nacional de Evaluación']
    },
    {
      color: '#00b98a',
      title: 'Contenidos abiertos y colaborativos',
      desc: 'Diseño, producción y difusión de Recursos Educativos Digitales Abiertos (REDA) alineados al currículo, contextualizados y de calidad.',
      purpose: 'La comunidad educativa accede, utiliza y genera recursos educativos digitales de calidad en plataformas educativas.',
      goal: 'Al menos 3.000 recursos digitales con certificación de calidad publicados.',
      chips: ['Estándares de calidad REDA', 'Licenciamiento abierto', 'Búsqueda y recomendación', 'Analítica de aprendizaje', 'Lenguas ancestrales', 'Contenidos accesibles', 'Modelo de Teleducación']
    },
    {
      color: '#e0a800',
      title: 'Innovación y gestión del conocimiento',
      desc: 'Una cultura de innovación, investigación aplicada y decisiones basadas en evidencia, que documenta y comparte lo que funciona.',
      purpose: 'La comunidad participa en innovación educativa, genera conocimiento basado en evidencia y aporta a una cultura digital colaborativa.',
      goal: 'Al menos 15 % de las instituciones participan en iniciativas de innovación digital.',
      chips: ['Laboratorio de Innovación Educativa', 'Observatorio de transformación digital', 'Espacios de experimentación', 'Comunidades de práctica', 'Red de agentes multiplicadores', 'Ferias, congresos y hackáthones']
    },
    {
      color: '#e2569a',
      title: 'Comunidades digitales activas e informadas',
      desc: 'Eje transversal: comunidades informadas, participativas y corresponsables, con gobernanza fortalecida y articulación intersectorial.',
      purpose: 'Estructuras de gobernanza fortalecidas y sistemas de gestión que garantizan una implementación sostenible.',
      goal: 'Madurez 4 de 5 en gobernanza digital y 85 % de las acciones de la Agenda ejecutadas.',
      chips: ['Alianzas público-privadas', 'Interoperabilidad de plataformas', 'Protección de datos personales', 'Tableros de control', 'Liderazgo digital directivo', 'Cooperación internacional']
    }
  ];
  const modal = $('#ejeModal');
  let current = 0, lastFocus = null;
  const fill = i => {
    const e = EJES[i];
    current = i;
    modal.querySelector('.modal__card').style.setProperty('--c', e.color);
    $('#modalIcon').src = `assets/img/eje${i + 1}.png`;
    $('#modalKicker').textContent = `Eje ${i + 1} de 5`;
    $('#modalTitle').textContent = e.title;
    $('#modalDesc').textContent = e.desc;
    $('#modalPurpose').textContent = e.purpose;
    $('#modalGoal').textContent = e.goal;
    $('#modalChips').innerHTML = e.chips.map((c, k) => `<li style="--i:${k}">${c}</li>`).join('');
    const card = modal.querySelector('.modal__card');
    card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';
  };
  const open = i => {
    lastFocus = document.activeElement;
    fill(i);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    $('.modal__close', modal).focus();
  };
  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocus && lastFocus.focus();
  };
  $$('.eje').forEach(b => b.addEventListener('click', () => open(+b.dataset.eje)));
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', close));
  $('#modalNext').addEventListener('click', () => fill((current + 1) % 5));
  $('#modalPrev').addEventListener('click', () => fill((current + 4) % 5));
  addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') fill((current + 1) % 5);
    if (e.key === 'ArrowLeft') fill((current + 4) % 5);
  });

  /* ---------- Glosario ---------- */
  const TERMS = [
    ['Conectividad significativa', 'Acceso a internet con velocidad, estabilidad, dispositivos y habilidades básicas que permiten un uso pedagógico intensivo, seguro y pertinente.'],
    ['Ciudadanía digital', 'Ejercicio responsable, ético y participativo de derechos y deberes en entornos digitales.'],
    ['REDA', 'Recursos Educativos Digitales Abiertos: materiales de acceso abierto con licencias que permiten usarlos, adaptarlos y redistribuirlos.'],
    ['Microcredencial', 'Reconocimiento formal que certifica aprendizajes específicos obtenidos en experiencias formativas de corta duración.'],
    ['Deepfake', 'Contenido sintético creado con inteligencia artificial que manipula o genera material audiovisual hiperrealista.'],
    ['Sesgo algorítmico', 'Resultados injustos o discriminatorios de sistemas de IA, generalmente por datos de entrenamiento sesgados o incompletos.'],
    ['Prompt engineering', 'Disciplina que diseña y optimiza las instrucciones que se dan a modelos de IA generativa para obtener resultados precisos.'],
    ['Brecha digital', 'Desigualdad en el acceso, uso y apropiación de las tecnologías digitales entre personas, territorios o grupos sociales.']
  ];
  const flips = $('#flips');
  flips.innerHTML = TERMS.map(([t, d], i) => `
    <button class="flip reveal" style="--d:${(i % 2) * .08}s" aria-pressed="false" aria-label="${t}: girar para ver la definición">
      <div class="flip__inner">
        <div class="flip__face flip__front"><span>Concepto ${String(i + 1).padStart(2, '0')}</span><i aria-hidden="true">?</i><h3>${t}</h3></div>
        <div class="flip__face flip__back"><b>${t}</b><p>${d}</p></div>
      </div>
    </button>`).join('');
  $('#quizTotal').textContent = TERMS.length;
  const seen = new Set();
  $$('.flip', flips).forEach((f, i) => {
    revObs.observe(f);
    f.addEventListener('click', () => {
      const on = f.classList.toggle('is-flipped');
      f.setAttribute('aria-pressed', on);
      seen.add(i);
      $('#quizCount').textContent = seen.size;
      $('#quizBar').style.width = (seen.size / TERMS.length * 100) + '%';
    });
  });

  /* ---------- Tilt cards ---------- */
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    $$('.tilt, .card--photo').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  /* ---------- Compartir ---------- */
  const toast = $('#shareToast');
  $('#shareBtn').addEventListener('click', async () => {
    const data = {
      title: 'Agenda Educativa Digital 2026–2030',
      text: 'Se viene la nueva Agenda Educativa Digital 2026–2030 del Ministerio de Educación, Deporte y Cultura. #AgendaEducativaDigital',
      url: location.href
    };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(`${data.text} ${data.url}`);
      toast.textContent = '¡Enlace copiado! Compártelo con tu comunidad educativa.';
    } catch {
      toast.textContent = 'Copia este enlace: ' + location.href;
    }
  });
})();

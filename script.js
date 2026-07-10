document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active nav highlighting on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('[data-nav]');

  const highlightNav = () => {
    let current = sections[0].id;
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.id;
      }
    });

    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  /* ---------- Dark / light mode toggle ---------- */
  const modeToggle = document.getElementById('modeToggle');
  const storedMode = getStoredMode();

  if (storedMode === 'light') document.body.classList.add('light');

  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    setStoredMode(document.body.classList.contains('light') ? 'light' : 'dark');
  });

  // in-memory fallback since this runs from a local file / no persistent storage assumed
  function getStoredMode() {
    try { return window.__portfolioMode || null; } catch (e) { return null; }
  }
  function setStoredMode(mode) {
    window.__portfolioMode = mode;
  }

  /* ---------- Copy email button ---------- */
  const emailCopyBtn = document.getElementById('emailCopy');
  const emailText = document.getElementById('emailText');
  const copyIcon = document.getElementById('copyIcon');

  emailCopyBtn.addEventListener('click', async () => {
    const email = emailText.textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
    } catch (e) {
      // fallback for environments without clipboard API
      const temp = document.createElement('textarea');
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    const original = copyIcon.textContent;
    copyIcon.textContent = 'copied';
    setTimeout(() => { copyIcon.textContent = original; }, 1800);
  });

  /* ---------- Project filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Stat count-up ---------- */
  const statNums = document.querySelectorAll('.stat-num');

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion || !target) { el.textContent = target; return; }
    let current = 0;
    const step = Math.max(1, Math.round(target / 30));
    const tick = () => {
      current = Math.min(target, current + step);
      el.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  statNums.forEach(el => statObserver.observe(el));

  /* ---------- Typewriter effect for the schema.sql panel ---------- */
  const typedCodeEl = document.getElementById('typedCode');
  const schemaLines = [
    { text: 'CREATE TABLE developer (', cls: [] },
    { text: '  id          INT            PRIMARY KEY,', cls: ['kw:INT', 'kw2:PRIMARY KEY'] },
    { text: "  name        VARCHAR(64)     'Akeny Douglas',", cls: [] },
    { text: "  role        VARCHAR(64)     'Full-Stack Developer',", cls: [] },
    { text: "  stack       SET('PHP','MySQL',", cls: [] },
    { text: "                  'JS','Bootstrap','Python'),", cls: [] },
    { text: "  status      ENUM('available',", cls: [] },
    { text: "                  'in_progress')  'available'", cls: [] },
    { text: ');', cls: [] }
  ];

  function highlight(line) {
    return line
      .replace(/\b(CREATE TABLE|PRIMARY KEY)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/\b(INT|VARCHAR|SET|ENUM)\b/g, '<span class="tok-type">$1</span>')
      .replace(/'([^']*)'/g, "<span class=\"tok-val\">'$1'</span>");
  }

  function typeSchema() {
    if (!typedCodeEl) return;

    if (reduceMotion) {
      typedCodeEl.innerHTML = schemaLines.map(l => highlight(l.text)).join('\n');
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let built = '';

    const typeChar = () => {
      if (lineIndex >= schemaLines.length) return;
      const line = schemaLines[lineIndex].text;

      if (charIndex <= line.length) {
        const soFar = built + line.slice(0, charIndex);
        typedCodeEl.innerHTML = highlight(soFar);
        charIndex++;
        setTimeout(typeChar, 14);
      } else {
        built += line + '\n';
        lineIndex++;
        charIndex = 0;
        setTimeout(typeChar, 90);
      }
    };
    typeChar();
  }

  const heroPanel = document.querySelector('.hero-panel');
  if (heroPanel) {
    const panelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeSchema();
          panelObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    panelObserver.observe(heroPanel);
  }

  /* ---------- Ambient network canvas (schema / ER-diagram motif) ---------- */
  const canvas = document.getElementById('networkCanvas');

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, nodes;
    const NODE_COUNT = 34;
    const LINK_DIST = 130;

    function resize() {
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      canvas.style.width = canvas.offsetWidth + 'px';
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25 * window.devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * window.devicePixelRatio,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = LINK_DIST * window.devicePixelRatio;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(194,26,3,${(1 - dist / maxDist) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.fillStyle = 'rgba(242,142,142,0.55)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    resize();
    initNodes();
    step();

    window.addEventListener('resize', () => {
      resize();
      initNodes();
    });
  }

});

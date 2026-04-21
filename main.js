(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;

  function initCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'pg-cursor';
    const dot = document.createElement('div');
    dot.className = 'pg-cursor-dot';
    document.body.append(cursor, dot);

    let mx = -200, my = -200, cx = -200, cy = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    $$('a, button, .contact-method, .project-card, .saga-node, .intro-cta').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    function raf() {
      cx = lerp(cx, mx, 0.1);
      cy = lerp(cy, my, 0.1);
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(raf);
    }
    raf();
  }

  function initScrollBar() {
    const bar = document.createElement('div');
    bar.className = 'pg-saga-bar';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }


  function initHeader() {
    const h = $('.site-header');
    if (!h) return;
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      h.classList.toggle('scrolled', y > 60);
      h.classList.toggle('hidden', y > last && y > 200);
      last = y;
    }, { passive: true });
  }


  function initReveal() {
    const items = $$('.reveal, .letter-panel, .project-card, .timeline-item, .metric, .chip, .info-item');
    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${(i % 8) * 0.055}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${(i % 8) * 0.055}s`;
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });
    items.forEach(el => io.observe(el));
  }


  function initCounters() {
    $$('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let started = false;
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const dur = 1600;
          const step = now => {
            const p = Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(2, -10 * p);
            el.textContent = (Number.isInteger(target) ? Math.round(target * e) : (target * e).toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          io.disconnect();
        }
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

 
  function initSkillBars() {
    $$('.bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            bar.style.transition = 'width 1.4s cubic-bezier(0.16,1,0.3,1)';
            bar.style.width = w;
          }, 180);
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(bar);
    });
  }


  function initTypewriter() {
    const el = $('.hero-typewriter');
    if (!el) return;
    const words = (el.dataset.words || '').split('|').filter(Boolean);
    if (!words.length) return;
    let wi = 0, ci = 0, del = false;
    const tick = () => {
      const w = words[wi];
      if (!del) {
        el.textContent = w.slice(0, ++ci);
        if (ci === w.length) { del = true; setTimeout(tick, 2000); return; }
      } else {
        el.textContent = w.slice(0, --ci);
        if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
      }
      setTimeout(tick, del ? 48 : 96);
    };
    setTimeout(tick, 600);
  }

  function initSagaMap() {
    const nodes = $$('.saga-node');
    if (!nodes.length) return;
    const page = location.pathname.split('/').pop() || 'index.html';
    nodes.forEach(node => {
      if (node.dataset.page === page) {
        node.classList.add('active');
      }
    });
  }

  function initIntro() {
    const overlay = $('#intro-overlay');
    if (!overlay) return;


    const shown = sessionStorage.getItem('pg-intro-shown');
    if (shown) {
      overlay.remove();
      return;
    }

    const flap = overlay.querySelector('.envelope-flap');
    const cta = overlay.querySelector('.intro-cta');

    overlay.addEventListener('mousemove', () => {
      flap && flap.classList.add('open');
    });

    if (cta) {
      cta.addEventListener('click', () => {
        sessionStorage.setItem('pg-intro-shown', '1');
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 800);
      });
    }

    setTimeout(() => {
      if (overlay.parentNode) {
        sessionStorage.setItem('pg-intro-shown', '1');
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 800);
      }
    }, 8000);
  }

  function initEasterEgg() {
    const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', e => {
      pos = e.key === code[pos] ? pos + 1 : 0;
      if (pos === code.length) { activate(); pos = 0; }
    });

    const brand = $('.brand');
    if (brand) {
      let clicks = 0, timer;
      brand.addEventListener('click', e => {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => clicks = 0, 1200);
        if (clicks >= 5) { activate(); clicks = 0; }
      });
    }
    function activate() {
      if ($('.pg-egg')) return;
      const el = document.createElement('div');
      el.className = 'pg-egg';
      el.innerHTML = `
        <div class="pg-egg-box">
          <div class="pg-egg-icon">🪶</div>
          <h2>Uma carta secreta encontrada.</h2>
          <p>O Konami Code foi ativado. Pedro Gabriel aprova este feito.</p>
          <div class="pg-egg-chips">
            <span>Explorador curioso</span>
            <span>Leitor atento</span>
            <span>+100 XP</span>
          </div>
          <button class="pg-egg-close">Fechar carta</button>
        </div>`;
      document.body.appendChild(el);
      setTimeout(() => el.classList.add('active'), 10);
      el.querySelector('.pg-egg-close').onclick = () => {
        el.classList.remove('active');
        setTimeout(() => el.remove(), 400);
      };
      el.onclick = e => { if (e.target === el) el.querySelector('.pg-egg-close').click(); };
    }
  }

  function initParticles() {
    const hero = $('.hero');
    if (!hero) return;
    const symbols = ['✦', '❋', '✿', '❀', '◈', '✧'];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('span');
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.cssText = `
        position:absolute;
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        color:var(--gold);
        font-size:${8 + Math.random()*8}px;
        opacity:${0.08 + Math.random()*0.18};
        animation:floatParticle ${6+Math.random()*6}s ${Math.random()*4}s ease-in-out infinite alternate;
        pointer-events:none;
        user-select:none;
      `;
      hero.appendChild(p);
    }
    if (!document.querySelector('#particle-style')) {
      const s = document.createElement('style');
      s.id = 'particle-style';
      s.textContent = `@keyframes floatParticle { from{transform:translateY(0) rotate(0deg)} to{transform:translateY(-20px) rotate(15deg)} }`;
      document.head.appendChild(s);
    }
  }

  function init() {
    const mobile = 'ontouchstart' in window || window.innerWidth < 768;
    if (!mobile) initCursor();
    initScrollBar();
    initHeader();
    initReveal();
    initCounters();
    initSkillBars();
    initTypewriter();
    initSagaMap();
    initIntro();
    initEasterEgg();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

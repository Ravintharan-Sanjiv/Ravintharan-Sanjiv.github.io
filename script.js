const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function initPreloader() {
  const pre = $('#preloader');
  const status = $('#preloaderStatus');
  if (!pre) return;

  const phrases = ['INITIALIZING SYSTEM', 'LOADING KERNEL MODULES', 'MOUNTING FILESYSTEM', 'ESTABLISHING SECURE LINK', 'ACCESS READY'];
  let i = 0;
  const cycle = setInterval(() => {
    i = (i + 1) % phrases.length;
    if (status) status.textContent = phrases[i];
  }, 420);

  const start = Date.now();
  const MIN_MS = 1600;
  const MAX_MS = 4500;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    const elapsed = Date.now() - start;
    setTimeout(() => {
      clearInterval(cycle);
      if (status) status.textContent = 'ACCESS READY';
      pre.classList.add('loaded');
    }, Math.max(0, MIN_MS - elapsed));
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
  setTimeout(finish, MAX_MS);
}

function initMatrixRain() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}|=!@#$%^&*';
  let cols, drops, fontSize;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fontSize = 13;
    cols = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(1);
  }

  function draw() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.fillStyle = isDark ? 'rgba(11, 6, 16, 0.06)' : 'rgba(248, 240, 247, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const brightness = Math.random();
      if (brightness > 0.98) ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      else if (brightness > 0.90) ctx.fillStyle = isDark ? '#9040e8' : '#7c3aed';
      else if (brightness > 0.82) ctx.fillStyle = isDark ? '#c2178f' : '#9d174d';
      else ctx.fillStyle = isDark ? `rgba(144, 64, 232, ${brightness * 0.45 + 0.05})` : `rgba(124, 58, 237, ${brightness * 0.28 + 0.05})`;

      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  resize();
  window.addEventListener('resize', resize);
  function loop() { setTimeout(() => { draw(); requestAnimationFrame(loop); }, 50); }
  loop();
}

function initThemeToggle() {
  const btn = $('#themeToggle'), icon = $('#themeIcon'), html = document.documentElement;
  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    icon.className = theme === 'light' ? 'bx bx-sun' : 'bx bx-moon';
    btn.setAttribute('title', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
  };
  applyTheme(localStorage.getItem('portfolio-theme') || 'dark');
  btn.addEventListener('click', () => applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
}

function initNavbar() {
  const navbar = $('#navbar'), navLinks = $$('.nav-link'), sections = $$('section[id]');
  const updateActiveLink = () => {
    let currentId = 'home';
    sections.forEach(sec => { if (window.scrollY + (window.innerHeight * 0.4) >= sec.offsetTop) currentId = sec.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === currentId));
  };
  window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 60); updateActiveLink(); }, { passive: true });
  updateActiveLink();
}

function initMobileMenu() {
  const btn = $('#hamburger'), menu = $('#mobileMenu');
  const toggleMenu = (forceClose = false) => {
    const isOpen = forceClose ? false : menu.hidden;
    menu.hidden = !isOpen;
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  };
  btn.addEventListener('click', () => toggleMenu());
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => toggleMenu(true)));
  document.addEventListener('click', e => { if (!btn.contains(e.target) && !menu.contains(e.target)) toggleMenu(true); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) toggleMenu(true); });
}

function initTypingEffect() {
  const el = $('#typingText');
  if (!el) return;
  const strings = ['Defensive Security Enthusiast', 'Aspiring Incident Responder', 'CTF Player'];
  let strIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const current = strings[strIndex];
    el.textContent = current.slice(0, isDeleting ? charIndex - 1 : charIndex + 1);
    charIndex += isDeleting ? -1 : 1;

    if (!isDeleting && charIndex === current.length) { isDeleting = true; setTimeout(type, 2200); }
    else if (isDeleting && charIndex === 0) { isDeleting = false; strIndex = (strIndex + 1) % strings.length; setTimeout(type, 500); }
    else setTimeout(type, isDeleting ? 40 : 80);
  }
  setTimeout(type, 800);
}

function releaseAnimationOnEnd(el) {
  el.addEventListener('animationend', function handler() {
    el.style.animation = 'none';
    el.removeEventListener('animationend', handler);
  }, { once: true });
}

function initRevealOnScroll() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      releaseAnimationOnEnd(entry.target);
      if (entry.target.classList.contains('reveal')) $$('.reveal-child', entry.target).forEach((child, i) => setTimeout(() => { child.classList.add('visible'); releaseAnimationOnEnd(child); }, i * 70));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  $$('.reveal').forEach(el => observer.observe(el));
  $$('.reveal-child').forEach(el => { if (!el.closest('.reveal')) observer.observe(el); });
}

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      if (link.id === 'decryptBtn') return;
      const target = $(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70) + 2;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => { btn.hidden = window.scrollY <= 400; btn.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initContactForm() {
  const form = $('#contactForm'), successBox = $('#formSuccess'), submitBtn = $('#submitBtn');
  if (!form) return;
  const fields = {
    name: { input: $('#contactName'), error: $('#nameError'), validate: v => v.trim().length >= 2 ? '' : 'Required.' },
    email: { input: $('#contactEmail'), error: $('#emailError'), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Invalid email.' },
    message: { input: $('#contactMessage'), error: $('#messageError'), validate: v => v.trim().length >= 10 ? '' : 'Message too short.' }
  };
  const showErr = (input, errEl, msg) => { errEl.textContent = msg; input.classList.toggle('error', !!msg); };

  Object.values(fields).forEach(({ input, error, validate }) => {
    input.addEventListener('blur', () => showErr(input, error, validate(input.value)));
    input.addEventListener('input', () => { if (input.classList.contains('error')) showErr(input, error, validate(input.value)); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    Object.values(fields).forEach(({ input, error, validate }) => {
      const msg = validate(input.value); showErr(input, error, msg); if (msg) valid = false;
    });
    if (!valid) return;

    submitBtn.disabled = true; submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Sending...</span>';
    fetch(form.action, { method: form.method, body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(res => {
        if (res.ok) {
          successBox.hidden = false; form.reset();
          Object.values(fields).forEach(({ input, error }) => { input.classList.remove('error'); error.textContent = ''; });
          setTimeout(() => successBox.hidden = true, 6000);
        } else alert("Submission failed.");
      })
      .catch(() => alert("Network error."))
      .finally(() => { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="bx bx-send"></i><span>Send Message</span>'; });
  });
}

function initDecryptButton() {
  const btn = $('#decryptBtn'), targetSection = $('#projects');
  if (!btn || !targetSection) return;
  const originalHTML = btn.innerHTML, CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}|=!@#$%^&*', targetText = "ACCESS GRANTED";

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    btn.classList.add('is-decrypting'); btn.classList.remove('btn-primary');
    let iterations = 0;

    const interval = setInterval(() => {
      btn.innerHTML = `<i class="bx bx-lock-open-alt"></i> ` + targetText.split('').map((char, i) => i < iterations / 2 ? targetText[i] : CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
      iterations++;
      if (iterations >= 40) {
        clearInterval(interval);
        btn.classList.replace('is-decrypting', 'is-decrypted');
        btn.innerHTML = `<i class="bx bx-check"></i> ${targetText}`;
        setTimeout(() => {
          window.scrollTo({ top: targetSection.getBoundingClientRect().top + window.scrollY - 70 + 2, behavior: 'smooth' });
          setTimeout(() => { btn.classList.replace('is-decrypted', 'btn-primary'); btn.innerHTML = originalHTML; }, 1200);
        }, 600);
      }
    }, 50);
  });
}

function initCertTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function attachTilt(card, strength, lift, perspective) {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(${perspective}px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(${lift}px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  }

  $$('.cert-card').forEach(card => attachTilt(card, 7, -4, 800));
  $$('.edu-card').forEach(card => attachTilt(card, 24, -16, 500));
}

function initCursorFX() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'cx-cursor';
  cursor.innerHTML = '<svg viewBox="0 0 20 26"><polygon class="cx-arrow" points="1,1 1,17 6,21 9,15 15,13" /></svg>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add('cursor-active');

  const COLORS = ['var(--accent)', 'var(--accent3)', '#ffffff'];
  const GLYPHS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ<>/=!$%'.split('');
  const MAGNET_SELECTOR = 'a, button, .btn';

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let renderX = mouseX, renderY = mouseY;
  let lastSpawnX = -999, lastSpawnY = -999;
  let magnetEls = [];
  let overField = false;

  function refreshMagnetEls() {
    magnetEls = $$(MAGNET_SELECTOR).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.width < 220 && r.height < 90;
    });
  }
  refreshMagnetEls();
  window.addEventListener('resize', refreshMagnetEls, { passive: true });

  function spawnPixel(x, y, opts = {}) {
    const el = document.createElement('span');
    const useGlyph = Math.random() < 0.55;
    el.className = 'cx-pixel' + (useGlyph ? ' cx-glyph' : '');
    const angle = opts.angle != null ? opts.angle : Math.random() * Math.PI * 2;
    const dist = opts.dist || (16 + Math.random() * 24);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
    el.style.setProperty('--dy', (Math.sin(angle) * dist) + 'px');
    if (useGlyph) {
      el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.style.fontSize = (9 + Math.random() * 5) + 'px';
      el.style.color = color;
    } else {
      const size = opts.size || (3 + Math.random() * 4);
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = color;
    }
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.classList.add('cx-visible');

    if (Math.hypot(mouseX - lastSpawnX, mouseY - lastSpawnY) > 15) {
      spawnPixel(mouseX, mouseY);
      lastSpawnX = mouseX; lastSpawnY = mouseY;
    }

    overField = !!e.target.closest('input, textarea');
  }, { passive: true });

  window.addEventListener('mousedown', () => {
    cursor.classList.add('cx-click');
    const n = 8;
    for (let i = 0; i < n; i++) {
      spawnPixel(mouseX, mouseY, { angle: (Math.PI * 2 / n) * i, dist: 26 + Math.random() * 12, size: 4 + Math.random() * 3 });
    }
  });
  window.addEventListener('mouseup', () => cursor.classList.remove('cx-click'));
  document.addEventListener('mouseleave', () => cursor.classList.remove('cx-visible'));

  function tick() {
    let targetX = mouseX, targetY = mouseY, bestDist = Infinity, pullCx = null, pullCy = null;
    for (const el of magnetEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > window.innerHeight + 40) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const reach = Math.max(r.width, r.height) / 2 + 30;
      const d = Math.hypot(mouseX - cx, mouseY - cy);
      if (d < reach && d < bestDist) { bestDist = d; pullCx = cx; pullCy = cy; }
    }
    if (pullCx !== null) {
      targetX = mouseX + (pullCx - mouseX) * 0.3;
      targetY = mouseY + (pullCy - mouseY) * 0.3;
    }
    cursor.classList.toggle('cx-hover', pullCx !== null || overField);
    renderX += (targetX - renderX) * 0.35;
    renderY += (targetY - renderY) * 0.35;
    cursor.style.transform = `translate(${renderX}px, ${renderY}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  [initPreloader, initMatrixRain, initThemeToggle, initNavbar, initMobileMenu, initTypingEffect, initRevealOnScroll, initSmoothScroll, initScrollTop, initContactForm, initDecryptButton, initCertTilt, initCursorFX].forEach(fn => fn());
});

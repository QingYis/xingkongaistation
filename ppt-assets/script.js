// ===== STARFIELD =====
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
const STAR_COUNT = 200;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 1 : -1
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.alpha += s.alphaDir * 0.005;
    if (s.alpha > 1) { s.alpha = 1; s.alphaDir = -1; }
    if (s.alpha < 0.1) { s.alpha = 0.1; s.alphaDir = 1; }
    s.y += s.speed;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha})`;
    ctx.fill();
    if (s.r > 1) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
      g.addColorStop(0, `rgba(0, 240, 255, ${s.alpha * 0.3})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fill();
    }
  });
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', () => { resizeCanvas(); initStars(); });
resizeCanvas();
initStars();
drawStars();

// ===== NAV DOTS =====
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = Array.from(slides).indexOf(entry.target);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  });
}, { threshold: 0.5 });

slides.forEach(s => observer.observe(s));

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    slides[i].scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== FADE-IN ON SCROLL =====
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

fadeEls.forEach(el => fadeObserver.observe(el));

// ===== PARTICLE MOUSE TRAIL =====
const particleCanvas = document.createElement('canvas');
particleCanvas.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
document.body.appendChild(particleCanvas);
const pCtx = particleCanvas.getContext('2d');
let particles = [];
let mouseX = 0, mouseY = 0;

function resizeParticleCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: mouseX, y: mouseY,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1, r: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '0,240,255' : '168,85,247'
    });
  }
});

function drawParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.02;
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(${p.color}, ${p.life})`;
    pCtx.fill();
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== KEYBOARD NAV =====
let currentSlide = 0;
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    currentSlide = Math.min(currentSlide + 1, slides.length - 1);
    slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    currentSlide = Math.max(currentSlide - 1, 0);
    slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
  }
});

// Update currentSlide on scroll
const slideObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentSlide = Array.from(slides).indexOf(entry.target);
    }
  });
}, { threshold: 0.5 });
slides.forEach(s => slideObserver.observe(s));

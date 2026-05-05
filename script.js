/* =============================================
   VALENTINE'S DAY SITE — script.js
   ============================================= */

"use strict";

/* ─── LOADER ─────────────────────────────────── */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
  }, 1800);
});

/* ─── CUSTOM CURSOR ──────────────────────────── */
const cursor = document.getElementById("cursor");
const follower = document.getElementById("cursor-follower");
let mouseX = 0,
  mouseY = 0,
  followerX = 0,
  followerY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + "px";
  cursor.style.top = mouseY + "px";
});
(function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + "px";
  follower.style.top = followerY + "px";
  requestAnimationFrame(animateCursor);
})();

/* ─── SMOOTH SCROLL (Enter button) ───────────── */
document.getElementById("btn-enter").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("story").scrollIntoView({ behavior: "smooth" });
});

/* ─── THREE.JS BACKGROUND (Floating Hearts) ──── */
(function initThree() {
  const canvas = document.getElementById("three-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  /* Heart shape geometry */
  function makeHeartGeometry(size) {
    const shape = new THREE.Shape();
    const s = size;
    shape.moveTo(0, s * 0.4);
    shape.bezierCurveTo(s * 0.5, s * 0.8, s, s * 0.4, 0, -s * 0.3);
    shape.bezierCurveTo(-s, s * 0.4, -s * 0.5, s * 0.8, 0, s * 0.4);
    return new THREE.ShapeGeometry(shape);
  }

  /* Star (point) particles */
  const starCount = 300;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 30;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xff6b9d,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
  });
  const starMesh = new THREE.Points(starGeo, starMat);
  scene.add(starMesh);

  /* Floating hearts */
  const hearts = [];
  const heartColors = [0xff6b9d, 0xe91e8c, 0xce93d8, 0xffd700, 0xff4081];
  for (let i = 0; i < 28; i++) {
    const size = Math.random() * 0.18 + 0.06;
    const geo = makeHeartGeometry(size);
    const mat = new THREE.MeshBasicMaterial({
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      transparent: true,
      opacity: Math.random() * 0.5 + 0.15,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
    );
    mesh.userData = {
      speedY: Math.random() * 0.004 + 0.002,
      speedRot: (Math.random() - 0.5) * 0.01,
      startY: mesh.position.y,
    };
    scene.add(mesh);
    hearts.push(mesh);
  }

  /* Mouse parallax */
  let targetRX = 0,
    targetRY = 0;
  document.addEventListener("mousemove", (e) => {
    targetRX = (e.clientY / window.innerHeight - 0.5) * 0.4;
    targetRY = (e.clientX / window.innerWidth - 0.5) * 0.4;
  });

  /* Resize */
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Animate */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Stars slow rotation
    starMesh.rotation.y = t * 0.04;
    starMesh.rotation.x = t * 0.02;

    // Hearts float up and reset
    hearts.forEach((h) => {
      h.position.y += h.userData.speedY;
      h.rotation.z += h.userData.speedRot;
      if (h.position.y > 6) h.position.y = -6;
    });

    // Camera parallax
    camera.rotation.x += (targetRX - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRY - camera.rotation.y) * 0.05;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ─── FLOATING HTML HEARTS (overlay) ─────────── */
(function spawnFloatingHearts() {
  const container = document.getElementById("floating-hearts");
  const emojis = ["❤", "💕", "💗", "💖", "💓"];
  setInterval(() => {
    const el = document.createElement("span");
    el.className = "float-heart";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: -60px;
      font-size: ${Math.random() * 1.5 + 0.8}rem;
      animation-duration: ${Math.random() * 8 + 7}s;
      animation-delay: ${Math.random() * 2}s;
      opacity: ${Math.random() * 0.18 + 0.05};
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 16000);
  }, 1200);
})();

/* ─── SCROLL REVEAL (IntersectionObserver) ────── */
const observerOpts = { threshold: 0.15 };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll(".timeline-item, .gallery-item").forEach((el) => {
  revealObserver.observe(el);
});

/* ─── GALLERY BUILD ───────────────────────────── */
const galleryImages = [
  { src: "images/IMG_20260321_121244.png", alt: "Our Special Shoot" },
  { src: "images/IMG_20260321_121406.png", alt: "Lying Together" },
  { src: "images/IMG_20260321_121459.png", alt: "Wedding Bliss" },
  { src: "images/IMG_20260321_121609.png", alt: "Golden Hour" },
  { src: "images/IMG_20260321_121834.png", alt: "Mirror Selfie" },
  { src: "images/IMG_20260323_223428.png", alt: "Royal Evening" },
  { src: "images/IMG_20260429_160000.png", alt: "Mehndi Celebration" },
  { src: "images/IMG_20250916_123805.jpg", alt: "Beautiful Together" },
];

const grid = document.getElementById("gallery-grid");
let lightboxIdx = 0;

galleryImages.forEach((img, idx) => {
  const item = document.createElement("div");
  item.className = "gallery-item";
  item.setAttribute("data-index", idx);
  item.innerHTML = `
    <img src="${img.src}" alt="${img.alt}" loading="lazy" />
    <div class="gallery-overlay"><span>🔍</span></div>
  `;
  item.addEventListener("click", () => openLightbox(idx));
  grid.appendChild(item);
  revealObserver.observe(item);
});

/* ─── LIGHTBOX ────────────────────────────────── */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

function openLightbox(idx) {
  lightboxIdx = idx;
  lightboxImg.src = galleryImages[idx].src;
  lightboxImg.alt = galleryImages[idx].alt;
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
}
function prevLight() {
  lightboxIdx = (lightboxIdx - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[lightboxIdx].src;
}
function nextLight() {
  lightboxIdx = (lightboxIdx + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[lightboxIdx].src;
}
lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", prevLight);
lightboxNext.addEventListener("click", nextLight);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prevLight();
  if (e.key === "ArrowRight") nextLight();
});

/* ─── LOVE LETTER ────────────────────────────── */
const envelope = document.getElementById("letter-envelope");
const letterContent = document.getElementById("letter-content");
const letterTyped = document.getElementById("letter-typed");
let letterOpened = false;

const letterLines = [
  "Yatri, mere pyaar,",
  "",
  "Some feelings are too big for words — yet here I am, trying.",
  "",
  "The moment I met you, something changed inside me forever.",
  "I didn't know love could feel this warm, this safe, this real.",
  "You are the reason my days feel worth living — and my nights feel peaceful.",
  "",
  "That evening at the café, when our hands first touched — I felt like",
  "the entire universe was holding its breath alongside me.",
  "In that small, quiet moment, I fell in love with you completely.",
  "",
  "With every passing day, I fall a little more.",
  "You are my calm in chaos, my laughter in silence,",
  "my home in every unfamiliar place.",
  "",
  "Thank you for choosing me. Thank you for being you.",
  "I promise to love you — today, tomorrow, and in every lifetime after.",
  "",
  "Happy Valentine's Day, my Yatri. 💕",
];

envelope.addEventListener("click", () => {
  if (letterOpened) return;
  letterOpened = true;
  envelope.classList.add("opened");
  setTimeout(() => {
    envelope.style.display = "none";
    letterContent.classList.add("visible");
    typeLetterLines(letterLines, 0, 0);
  }, 600);
});

function typeLetterLines(lines, lineIdx, charIdx) {
  if (lineIdx >= lines.length) {
    // Remove cursor after done
    const last = letterTyped.lastElementChild;
    if (last) last.classList.remove("cursor-blink");
    return;
  }
  if (charIdx === 0) {
    const p = document.createElement("p");
    p.className = "cursor-blink";
    letterTyped.appendChild(p);
    // Remove cursor from previous
    const all = letterTyped.querySelectorAll("p");
    if (all.length > 1) all[all.length - 2].classList.remove("cursor-blink");
  }
  const currentP = letterTyped.lastElementChild;
  const line = lines[lineIdx];
  if (charIdx < line.length) {
    currentP.textContent += line[charIdx];
    setTimeout(() => typeLetterLines(lines, lineIdx, charIdx + 1), 28);
  } else {
    // Line done — move to next
    currentP.classList.remove("cursor-blink");
    setTimeout(
      () => typeLetterLines(lines, lineIdx + 1, 0),
      line === "" ? 80 : 180,
    );
  }
}

/* ─── CONFETTI ────────────────────────────────── */
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");
let confettiPieces = [];

function resizeConfetti() {
  confettiCanvas.width = confettiCanvas.offsetWidth;
  confettiCanvas.height = confettiCanvas.offsetHeight;
}
resizeConfetti();
window.addEventListener("resize", resizeConfetti);

function launchConfetti() {
  confettiPieces = [];
  const colors = [
    "#ff6b9d",
    "#e91e8c",
    "#ce93d8",
    "#ffd700",
    "#ff4081",
    "#f06292",
    "#ba68c8",
  ];
  const shapes = ["heart", "circle", "rect"];
  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      size: Math.random() * 12 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      speedY: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      opacity: 1,
    });
  }
  animateConfetti();
}

function drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.5,
    y - size * 0.8,
    x + size,
    y - size * 0.3,
    x,
    y + size * 0.4,
  );
  ctx.bezierCurveTo(
    x - size,
    y - size * 0.3,
    x - size * 0.5,
    y - size * 0.8,
    x,
    y - size * 0.3,
  );
  ctx.fill();
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach((p, i) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    if (p.shape === "heart") drawHeart(ctx, 0, 0, p.size);
    else if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
    }
    ctx.restore();

    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotSpeed;
    p.opacity -= 0.004;
  });
  confettiPieces = confettiPieces.filter((p) => p.opacity > 0);
  if (confettiPieces.length > 0) requestAnimationFrame(animateConfetti);
}

/* ─── SURPRISE BUTTON & MODAL ─────────────────── */
const btnSurprise = document.getElementById("btn-surprise");
const surpriseModal = document.getElementById("surprise-modal");
const modalClose = document.getElementById("modal-close");
const modalOverlay = document.getElementById("modal-overlay");
const bgMusic = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");

btnSurprise.addEventListener("click", () => {
  launchConfetti();
  surpriseModal.classList.add("active");
  document.body.style.overflow = "hidden";
  // Try to play music if source exists
  if (bgMusic.querySelector("source")) {
    bgMusic
      .play()
      .then(() => {
        musicBtn.style.display = "block";
        musicBtn.classList.add("playing");
      })
      .catch(() => {});
  }
});

function closeModal() {
  surpriseModal.classList.remove("active");
  document.body.style.overflow = "";
}
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* Music toggle */
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.classList.add("playing");
  } else {
    bgMusic.pause();
    musicBtn.classList.remove("playing");
  }
});

/* ─── SCROLL-BASED NAVBAR HINT (optional glow) ── */
/* ─── SCROLL PROGRESS BAR ────────────────────── */
const progressBar = document.getElementById("scroll-progress-bar");

window.addEventListener("scroll", () => {
  const scrollY   = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
  progressBar.style.width = pct + "%";

  // CSS custom property for any other scroll-driven effects
  document.documentElement.style.setProperty("--scroll-y", scrollY + "px");
});

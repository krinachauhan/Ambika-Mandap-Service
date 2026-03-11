// ===== Navbar =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu) navMenu.classList.remove('active');
    if (navToggle) navToggle.classList.remove('active');
  });
});

window.addEventListener('scroll', () => {
  if (navbar && !navbar.classList.contains('navbar-solid')) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// Active nav on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector('.nav-link[href="#' + id + '"]');
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
});

// ===== Hero Particles =====
const particles = document.getElementById('particles');
if (particles) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    particles.appendChild(p);
  }
}

// ===== Counter Animation =====
const counters = document.querySelectorAll('.stat-number');
let countersAnimated = false;

function animateCounters() {
  counters.forEach(counter => {
    const target = +counter.dataset.count;
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased).toLocaleString() + '+';
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ===== Scroll Reveal =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.closest('.stats-section') && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
      }
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.service-card, .testimonial-card, .process-step, .contact-item, .about-grid, .stat-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// ===== Gallery =====
let galleryImages = [];
let currentImageIndex = 0;

function loadGallery() {
  const data = GalleryStore.getAll();
  const filtersEl = document.getElementById('galleryFilters');
  const gridEl = document.getElementById('galleryGrid');
  const emptyEl = document.getElementById('galleryEmpty');

  if (!filtersEl || !gridEl) return;

  const allImages = [];
  data.folders.forEach(folder => {
    folder.images.forEach(img => {
      allImages.push({ ...img, folderName: folder.name, folderSlug: folder.slug });
    });
  });

  if (allImages.length === 0) {
    gridEl.style.display = 'none';
    filtersEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  gridEl.style.display = '';
  filtersEl.style.display = '';

  // Filters - only show types that have images
  const foldersWithImages = data.folders.filter(f => f.images.length > 0);
  let filtersHTML = '<button class="filter-btn active" data-filter="all">All</button>';
  foldersWithImages.forEach(folder => {
    filtersHTML += '<button class="filter-btn" data-filter="' + folder.slug + '">' + escapeHtml(folder.name) + '</button>';
  });
  filtersEl.innerHTML = filtersHTML;

  // Render
  galleryImages = allImages;
  renderGalleryItems(allImages, gridEl);

  // Filter clicks
  filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const filtered = filter === 'all' ? allImages : allImages.filter(img => img.folderSlug === filter);
      galleryImages = filtered;
      renderGalleryItems(filtered, gridEl);
    });
  });
}

function renderGalleryItems(images, container) {
  const isHomepage = window.location.pathname.indexOf('gallery') === -1;
  const displayImages = isHomepage ? images.slice(0, 9) : images;

  container.innerHTML = displayImages.map((img, idx) =>
    '<div class="gallery-item" data-index="' + idx + '">' +
      '<img src="' + img.path + '" alt="' + escapeHtml(img.folderName) + '" loading="lazy">' +
      '<div class="gallery-item-overlay">' +
        '<span>' + escapeHtml(img.folderName) + '</span>' +
        '<i class="fas fa-search-plus"></i>' +
      '</div>' +
    '</div>'
  ).join('');

  container.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      currentImageIndex = parseInt(item.dataset.index);
      openLightbox(galleryImages[currentImageIndex].path);
    });
  });
}

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

function openLightbox(src) {
  if (!lightbox) return;
  lightboxImg.src = src;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

if (lightboxPrev) {
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentImageIndex].path;
  });
}
if (lightboxNext) {
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentImageIndex].path;
  });
}

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
  if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
});

// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your inquiry! We will contact you soon.');
    contactForm.reset();
  });
}

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== Utility =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Hero Slideshow =====
function initHeroSlideshow() {
  const container = document.getElementById('heroSlideshow');
  const hero = document.getElementById('home');
  if (!container || !hero) return;

  const images = HeroStore.getImages();
  if (images.length === 0) return;

  hero.classList.add('has-slides');

  images.forEach((img, idx) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (idx === 0 ? ' active' : '');
    slide.style.backgroundImage = 'url(' + img.path + ')';
    container.appendChild(slide);
  });

  if (images.length > 1) {
    let current = 0;
    const slides = container.querySelectorAll('.hero-slide');
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 4000);
  }
}

// ===== Init =====
loadGallery();
initHeroSlideshow();

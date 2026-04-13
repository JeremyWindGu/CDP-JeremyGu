/**
 * Portfolio navigation, bilingual toggle, image loading, and lightweight reveal effects
 */

const WORK_CONFIG = {
  1: { prefix: '1_', startIndex: 1 },
  2: { prefix: '2_', startIndex: 1 },
  3: { prefix: '3_', startIndex: 1 },
  4: { prefix: '4_', startIndex: 1, endIndex: 9 },
  0: { prefix: '0_', startIndex: 1 },
};

const LANG_STORAGE_KEY = 'portfolio-lang-mode';

function getImageBaseNames(workId) {
  const config = WORK_CONFIG[workId];
  if (!config) return [];

  const names = [];
  let i = config.startIndex;
  const endIndex = config.endIndex ?? 20;

  while (i <= endIndex) {
    names.push(`${config.prefix}${i}`);
    i += 1;
  }
  return names;
}

function renderWorkGallery(workId) {
  const gallery = document.querySelector(`.work-gallery[data-work="${workId}"]`);
  if (!gallery) return;

  gallery.innerHTML = '';
  const baseNames = getImageBaseNames(workId);

  baseNames.forEach((base) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = `images/${base}.jpg`;
    img.alt = `Work ${workId} - ${base}`;
    img.loading = 'lazy';
    img.onerror = function onJpgError() {
      this.onerror = null;
      this.src = `images/${base}.png`;
      this.onerror = function onPngError() {
        this.parentElement.style.display = 'none';
      };
    };

    item.appendChild(img);
    gallery.appendChild(item);
  });
}

function ensureWorkGalleryRendered(workId) {
  const gallery = document.querySelector(`.work-gallery[data-work="${workId}"]`);
  if (gallery && !gallery.hasChildNodes()) {
    renderWorkGallery(workId);
  }
}

function initRevealAnimations(scope = document) {
  const reveals = Array.from(scope.querySelectorAll('.reveal'));
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  reveals.forEach((el) => {
    if (el.classList.contains('visible')) return;
    observer.observe(el);
  });
}

function resetCaseStudyScroll(panel) {
  if (!panel) return;

  const scrollTarget = document.scrollingElement || document.documentElement;
  scrollTarget.scrollTo({ top: 0, behavior: 'auto' });

  panel.querySelectorAll('.reveal').forEach((el, index) => {
    if (index === 0 && el.classList.contains('hero-section')) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });

  initRevealAnimations(panel);
}

function showPanel(panelId) {
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
  const panel = document.getElementById(panelId);

  if (!panel) return;

  panel.classList.add('active');

  if (panel.classList.contains('work-panel')) {
    const workId = panel.querySelector('.work-gallery')?.dataset?.work;
    if (workId !== undefined) ensureWorkGalleryRendered(workId);
  }

  if (panel.classList.contains('case-panel')) {
    resetCaseStudyScroll(panel);
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

function initVideoPlayback() {
  document.querySelectorAll('video').forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  });
}

function applyLanguage(lang) {
  const normalized = lang === 'zh' ? 'zh' : 'en';
  document.documentElement.setAttribute('lang-mode', normalized);
  document.documentElement.setAttribute('lang', normalized === 'zh' ? 'zh-CN' : 'en');
  try {
    localStorage.setItem(LANG_STORAGE_KEY, normalized);
  } catch (error) {
    // ignore storage errors
  }
}

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (error) {
    // ignore storage errors
  }
  return 'zh';
}

function toggleLanguage() {
  const current = document.documentElement.getAttribute('lang-mode') === 'en' ? 'en' : 'zh';
  applyLanguage(current === 'zh' ? 'en' : 'zh');
}

function initLanguageToggle() {
  applyLanguage(getInitialLanguage());
  document.querySelectorAll('.lang-toggle').forEach((button) => {
    button.addEventListener('click', toggleLanguage);
  });
}

function init() {
  document.querySelectorAll('.cover-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      const link = card.dataset.link;
      if (link) {
        window.open(link, '_blank');
        return;
      }
      const workId = card.dataset.work;
      showPanel(`work-panel-${workId}`);
    });
  });

  document.querySelectorAll('.back-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showPanel('catalog-panel');
    });
  });

  initLanguageToggle();
  initRevealAnimations(document);
  initVideoPlayback();
}

document.addEventListener('DOMContentLoaded', init);
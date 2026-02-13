/**
 * 电子作品集 - 导航与图片加载
 */

const WORK_CONFIG = {
  1: { prefix: '1_', startIndex: 1 },                 // 作品1: 1_1, 1_2, 1_3...
  2: { prefix: '2_', startIndex: 1 },                 // 作品2: 2_1, 2_2...
  3: { prefix: '3_', startIndex: 1 },                 // 作品3: 3_1, 3_2...
  4: { prefix: '4_', startIndex: 1, endIndex: 9 },    // 作品4: 4_1 - 4_9
  0: { prefix: '0_', startIndex: 1 },                 // Other: 0_1, 0_2...
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

// 尝试加载图片，返回可用的扩展名或 null
function findImagePath(baseName) {
  for (const ext of IMAGE_EXTENSIONS) {
    const path = `images/${baseName}.${ext}`;
    // 预加载检测：创建 Image 对象
    return path; // 实际由 HTML onerror 处理，这里统一返回 .jpg 路径
  }
  return `images/${baseName}.jpg`;
}

// 生成作品图片列表的 baseName
function getImageBaseNames(workId) {
  const config = WORK_CONFIG[workId];
  if (!config) return [];
  const names = [];
  let i = config.startIndex;
  const endIndex = config.endIndex ?? 20;
  while (i <= endIndex) {
    names.push(`${config.prefix}${i}`);
    i++;
  }
  return names;
}

// 渲染作品面板图片
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
    img.onerror = function () {
      this.onerror = null;
      this.src = `images/${base}.png`;
      this.onerror = function () {
        this.parentElement.style.display = 'none';
      };
    };
    item.appendChild(img);
    gallery.appendChild(item);
  });
}

// 预渲染所有作品面板（首次进入时按需渲染）
function ensureWorkGalleryRendered(workId) {
  const gallery = document.querySelector(`.work-gallery[data-work="${workId}"]`);
  if (gallery && !gallery.hasChildNodes()) {
    renderWorkGallery(workId);
  }
}

// 切换面板
function showPanel(panelId) {
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.add('active');
    if (panel.classList.contains('work-panel')) {
      const workId = panel.querySelector('.work-gallery')?.dataset?.work;
      if (workId !== undefined) ensureWorkGalleryRendered(workId);
    }
  }
}

// 初始化
function init() {
  // 封面点击 -> 进入作品面板
  document.querySelectorAll('.cover-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const link = card.dataset.link;
      if (link) {
        window.open(link, '_blank');
        return;
      }
      const workId = card.dataset.work;
      const panelId = `work-panel-${workId}`;
      showPanel(panelId);
    });
  });

  // 返回按钮 -> 回到主目录
  document.querySelectorAll('.back-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showPanel('catalog-panel');
    });
  });
}

document.addEventListener('DOMContentLoaded', init);

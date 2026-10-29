(() => {
  const STORAGE_KEY = 'photocard-maker-v1';
  const BN = '০১২৩৪৫৬৭৮৯';
  const toBn = (s) => String(s).replace(/\d/g, (d) => BN[+d]);

  const TEMPLATES = [
    { id: 'breaking', label: 'ব্রেকিং', color: '#dc2626' },
    { id: 'classic', label: 'ক্লাসিক', color: '#f8fafc' },
    { id: 'dark', label: 'ডার্ক', color: '#0f172a' },
    { id: 'quote', label: 'কোট', color: '#1e293b' },
    { id: 'sports', label: 'খেলা', color: '#16a34a' },
    { id: 'condolence', label: 'শোক', color: '#171717' },
    { id: 'celebration', label: 'উদযাপন', color: '#ea580c' },
    { id: 'minimal', label: 'মিনিমাল', color: '#e5e5e5' }
  ];

  const CATEGORIES = [
    'ব্রেকিং', 'খেলা', 'রাজনীতি', 'বিনোদন', 'আন্তর্জাতিক',
    'অর্থনীতি', 'প্রযুক্তি', 'শোক', 'বিশেষ'
  ];

  const SIZES = {
    '1080x1080': [1080, 1080],
    '1080x1350': [1080, 1350],
    '1080x1920': [1080, 1920],
    '1200x630': [1200, 630]
  };

  const BN_MONTHS = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const $ = (id) => document.getElementById(id);
  const state = {
    template: 'breaking',
    size: '1080x1080',
    headline: 'বাংলাদেশে প্রথমবারের মতো *এআই* দিয়ে তৈরি হলো নিউজ কার্ড',
    subtext: 'মোবাইলেই ভাইরাল স্টাইলের ফটোকার্ড তৈরি করুন',
    category: 'ব্রেকিং',
    brandName: 'Robin Cents',
    siteName: 'robincents.com',
    font: 'Hind Siliguri',
    accent: '#dc2626',
    bnDate: true,
    watermark: false,
    date: new Date().toISOString().slice(0, 10),
    photoUrl: '',
    logoUrl: '',
    zoom: 100,
    panX: 0,
    panY: 0
  };

  let dragging = false;
  let lastX = 0, lastY = 0;

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatHeadline(raw) {
    const parts = String(raw || '').split(/(\*[^*]+\*)/g);
    return parts.map((p) => {
      if (/^\*[^*]+\*$/.test(p)) {
        return `<span class="hl">${escapeHtml(p.slice(1, -1))}</span>`;
      }
      return escapeHtml(p);
    }).join('').replace(/\n/g, '<br>');
  }

  function formatDate(iso, bn) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const month = BN_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    if (bn) return `${toBn(day)} ${month} ${toBn(year)}`;
    return `${day} ${month} ${year}`;
  }

  function photoStyle() {
    const z = (state.zoom || 100) / 100;
    const tx = state.panX || 0;
    const ty = state.panY || 0;
    const url = state.photoUrl
      ? `url("${state.photoUrl}")`
      : 'linear-gradient(135deg, #334155, #64748b 50%, #1e293b)';
    return `background-image:${url};transform:translate(${tx}px,${ty}px) scale(${z});transform-origin:center center;`;
  }

  function brandBlock() {
    const logo = state.logoUrl
      ? `<img class="brand-logo" src="${state.logoUrl}" alt="" />`
      : '';
    return `<div class="brand-line">${logo}<span class="brand-name">${escapeHtml(state.brandName || 'Robin Cents')}</span></div>`;
  }

  function wm() {
    if (!state.watermark) return '';
    return `<div class="wm">${escapeHtml(state.brandName || 'Robin Cents')}</div>`;
  }

  function metaFooter(extraClass = '') {
    return `
      <div class="meta-bar ${extraClass}">
        ${brandBlock()}
        <div class="date-line">${formatDate(state.date, state.bnDate)}</div>
      </div>
      <div class="footer-bar">
        <span>${escapeHtml(state.siteName || '')}</span>
        <span>${escapeHtml(state.category || '')}</span>
      </div>`;
  }

  function renderCard() {
    const root = $('cardRoot');
    const [w, h] = SIZES[state.size] || [1080, 1080];
    root.style.width = w + 'px';
    root.style.height = h + 'px';
    root.style.setProperty('--accent-color', state.accent);
    root.style.setProperty('--card-font', `"${state.font}", "Hind Siliguri", sans-serif`);

    const cat = `<span class="cat">${escapeHtml(state.category || '')}</span>`;
    const hl = `<h2 class="headline">${formatHeadline(state.headline)}</h2>`;
    const sub = state.subtext
      ? `<p class="sub">${escapeHtml(state.subtext).replace(/\n/g, '<br>')}</p>`
      : '';
    const photo = `<div class="photo-area"><div class="photo-layer" style="${photoStyle()}"></div><div class="overlay"></div></div>`;

    let html = '';
    switch (state.template) {
      case 'breaking':
        html = `<div class="pc breaking" style="--accent-color:${state.accent}">
          <div class="top-stripe"></div>${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'classic':
        html = `<div class="pc classic" style="--accent-color:${state.accent}">
          ${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'dark':
        html = `<div class="pc dark" style="--accent-color:${state.accent}">
          ${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'quote':
        html = `<div class="pc quote" style="--accent-color:${state.accent}">
          <div class="quote-photo" style="${photoStyle()}"></div>
          <div class="qmark">“</div>
          ${hl}${sub}
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'sports':
        html = `<div class="pc sports" style="--accent-color:${state.accent || '#22c55e'}">
          <div class="accent-bar"></div>${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'condolence':
        html = `<div class="pc condolence" style="--accent-color:${state.accent}">
          ${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'celebration':
        html = `<div class="pc celebration" style="--accent-color:${state.accent}">
          ${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
      case 'minimal':
      default:
        html = `<div class="pc minimal" style="--accent-color:${state.accent}">
          ${photo}
          <div class="content">${cat}${hl}${sub}</div>
          ${metaFooter()}${wm()}
        </div>`;
        break;
    }
    root.innerHTML = html;
    scalePreview();
    bindPhotoDrag();
  }

  function scalePreview() {
    const stage = $('previewStage');
    const root = $('cardRoot');
    const [w, h] = SIZES[state.size] || [1080, 1080];
    stage.dataset.ratio = state.size;
    const sw = stage.clientWidth || 360;
    const scale = sw / w;
    root.style.transform = `scale(${scale})`;
    // Keep layout height correct: the scaled visual height is h*scale
    root.style.marginBottom = `${-(h - h * scale)}px`;
    root.style.marginRight = `${-(w - w * scale)}px`;
  }

  function bindPhotoDrag() {
    const layers = document.querySelectorAll('.photo-layer, .quote-photo');
    layers.forEach((layer) => {
      layer.style.cursor = 'grab';
      layer.style.touchAction = 'none';
      const onDown = (e) => {
        dragging = true;
        layer.style.cursor = 'grabbing';
        const pt = e.touches ? e.touches[0] : e;
        lastX = pt.clientX;
        lastY = pt.clientY;
        e.preventDefault();
      };
      layer.addEventListener('mousedown', onDown);
      layer.addEventListener('touchstart', onDown, { passive: false });
    });
  }

  function onMove(e) {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - lastX;
    const dy = pt.clientY - lastY;
    lastX = pt.clientX;
    lastY = pt.clientY;
    const stage = $('previewStage');
    const [w] = SIZES[state.size] || [1080, 1080];
    const scale = (stage.clientWidth || 360) / w;
    state.panX += dx / scale;
    state.panY += dy / scale;
    document.querySelectorAll('.photo-layer, .quote-photo').forEach((el) => {
      const z = (state.zoom || 100) / 100;
      el.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${z})`;
      el.style.transformOrigin = 'center center';
      if (!el.style.backgroundImage && state.photoUrl) {
        el.style.backgroundImage = `url("${state.photoUrl}")`;
      }
    });
  }
  function onUp() { dragging = false; }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  function save() {
    const data = { ...state };
    // Don't persist huge data URLs forever if too large — still ok for typical photos
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {
      const slim = { ...data, photoUrl: '', logoUrl: '' };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slim)); } catch (__) {}
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(state, data);
    } catch (_) {}
  }

  function syncForm() {
    $('headline').value = state.headline || '';
    $('subtext').value = state.subtext || '';
    $('brandName').value = state.brandName || 'Robin Cents';
    $('siteName').value = state.siteName || '';
    $('fontSelect').value = state.font || 'Hind Siliguri';
    $('accentColor').value = state.accent || '#dc2626';
    $('accentHex').textContent = state.accent || '#dc2626';
    $('bnDate').checked = !!state.bnDate;
    $('watermark').checked = !!state.watermark;
    $('dateInput').value = state.date || new Date().toISOString().slice(0, 10);
    $('photoZoom').value = state.zoom || 100;
    document.querySelectorAll('input[name="size"]').forEach((el) => {
      el.checked = el.value === state.size;
    });
    document.querySelectorAll('.tpl-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.id === state.template);
    });
    document.querySelectorAll('.chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.cat === state.category);
    });
  }

  function buildUI() {
    const grid = $('tplGrid');
    grid.innerHTML = TEMPLATES.map((t) => `
      <button type="button" class="tpl-btn" data-id="${t.id}">
        <span class="dot" style="background:${t.color};border:1px solid #0002"></span>
        ${t.label}
      </button>`).join('');
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.tpl-btn');
      if (!btn) return;
      state.template = btn.dataset.id;
      if (state.template === 'sports' && state.accent === '#dc2626') state.accent = '#22c55e';
      if (state.template === 'breaking' && state.category === 'খেলা') state.category = 'ব্রেকিং';
      syncForm();
      renderCard();
      save();
    });

    const chips = $('catChips');
    chips.innerHTML = CATEGORIES.map((c) =>
      `<button type="button" class="chip" data-cat="${c}">${c}</button>`
    ).join('');
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      state.category = chip.dataset.cat;
      syncForm();
      renderCard();
      save();
    });
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function waitFonts() {
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
        // Force-load selected family
        await document.fonts.load(`700 64px "${state.font}"`);
        await document.fonts.load(`400 34px "${state.font}"`);
      }
    } catch (_) {}
    // Extra settle for Bangla shaping
    await new Promise((r) => setTimeout(r, 120));
  }

  async function exportPng() {
    const root = $('cardRoot');
    const btn = $('exportBtn');
    btn.disabled = true;
    toast('ফন্ট লোড হচ্ছে…');
    await waitFonts();
    // Temporarily unscale for crisp export
    const prev = root.style.transform;
    const prevMb = root.style.marginBottom;
    const prevMr = root.style.marginRight;
    root.style.transform = 'none';
    root.style.marginBottom = '0';
    root.style.marginRight = '0';
    try {
      const dataUrl = await window.htmlToImage.toPng(root, {
        width: root.offsetWidth,
        height: root.offsetHeight,
        pixelRatio: 1,
        cacheBust: true,
        skipAutoScale: true,
        style: { transform: 'none', margin: '0' }
      });
      root.style.transform = prev;
      root.style.marginBottom = prevMb;
      root.style.marginRight = prevMr;
      return dataUrl;
    } catch (err) {
      root.style.transform = prev;
      root.style.marginBottom = prevMb;
      root.style.marginRight = prevMr;
      throw err;
    } finally {
      btn.disabled = false;
    }
  }

  function downloadDataUrl(dataUrl, name) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function dataUrlToFile(dataUrl, name) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], name, { type: 'image/png' });
  }

  function bindForm() {
    const map = [
      ['headline', 'headline', 'input'],
      ['subtext', 'subtext', 'input'],
      ['brandName', 'brandName', 'input'],
      ['siteName', 'siteName', 'input'],
      ['fontSelect', 'font', 'change'],
      ['dateInput', 'date', 'change']
    ];
    map.forEach(([id, key, ev]) => {
      $(id).addEventListener(ev, (e) => {
        state[key] = e.target.value;
        renderCard();
        save();
      });
    });
    $('accentColor').addEventListener('input', (e) => {
      state.accent = e.target.value;
      $('accentHex').textContent = state.accent;
      renderCard();
      save();
    });
    $('bnDate').addEventListener('change', (e) => {
      state.bnDate = e.target.checked;
      renderCard();
      save();
    });
    $('watermark').addEventListener('change', (e) => {
      state.watermark = e.target.checked;
      renderCard();
      save();
    });
    $('photoZoom').addEventListener('input', (e) => {
      state.zoom = +e.target.value;
      renderCard();
      save();
    });
    document.querySelectorAll('input[name="size"]').forEach((el) => {
      el.addEventListener('change', () => {
        if (!el.checked) return;
        state.size = el.value;
        renderCard();
        save();
      });
    });
    $('photoInput').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      state.photoUrl = await readFile(f);
      state.panX = 0; state.panY = 0; state.zoom = 100;
      $('photoZoom').value = 100;
      renderCard();
      save();
      toast('ছবি যোগ হয়েছে');
    });
    $('logoInput').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      state.logoUrl = await readFile(f);
      renderCard();
      save();
      toast('লোগো যোগ হয়েছে');
    });
    $('exportBtn').addEventListener('click', async () => {
      try {
        const dataUrl = await exportPng();
        const name = `photocard-${state.template}-${state.size}.png`;
        downloadDataUrl(dataUrl, name);
        toast('PNG সেভ হয়েছে');
      } catch (err) {
        console.error(err);
        toast('এক্সপোর্ট ব্যর্থ — আবার চেষ্টা করুন');
      }
    });
    $('shareBtn').addEventListener('click', async () => {
      try {
        const dataUrl = await exportPng();
        const name = `photocard-${state.template}.png`;
        if (navigator.share && navigator.canShare) {
          const file = await dataUrlToFile(dataUrl, name);
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: state.brandName || 'Photocard',
              text: state.headline.replace(/\*/g, '')
            });
            toast('শেয়ার করা হয়েছে');
            return;
          }
        }
        downloadDataUrl(dataUrl, name);
        toast('শেয়ার সাপোর্ট নেই — PNG ডাউনলোড');
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        console.error(err);
        toast('শেয়ার ব্যর্থ');
      }
    });
    $('resetBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      Object.assign(state, {
        template: 'breaking',
        size: '1080x1080',
        headline: 'বাংলাদেশে প্রথমবারের মতো *এআই* দিয়ে তৈরি হলো নিউজ কার্ড',
        subtext: 'মোবাইলেই ভাইরাল স্টাইলের ফটোকার্ড তৈরি করুন',
        category: 'ব্রেকিং',
        brandName: 'Robin Cents',
        siteName: 'robincents.com',
        font: 'Hind Siliguri',
        accent: '#dc2626',
        bnDate: true,
        watermark: false,
        date: new Date().toISOString().slice(0, 10),
        photoUrl: '',
        logoUrl: '',
        zoom: 100,
        panX: 0,
        panY: 0
      });
      syncForm();
      renderCard();
      toast('রিসেট হয়েছে');
    });
    $('themeBtn').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : cur === 'light' ? '' : 'dark';
      if (next) document.documentElement.setAttribute('data-theme', next);
      else document.documentElement.removeAttribute('data-theme');
    });
  }

  // Expose for Playwright verification
  window.__photocard = {
    getState: () => ({ ...state }),
    setState: (patch) => { Object.assign(state, patch); syncForm(); renderCard(); save(); },
    renderCard,
    exportPng,
    waitFonts,
    TEMPLATES,
    SIZES
  };

  function init() {
    buildUI();
    load();
    if (!state.date) state.date = new Date().toISOString().slice(0, 10);
    syncForm();
    renderCard();
    bindForm();
    window.addEventListener('resize', scalePreview);
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

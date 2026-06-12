// All visible page copy, both languages. Keys map to data-i18n attributes.
export const strings = {
  en: {
    heroKicker: 'Sparkling Will presents',
    heroTagline: 'Your photos, painted into a moment.',
    heroSub: 'Upload a photo or two. Our AI studies their colors, then paints you back a moment worth keeping.',
    heroCta: 'Coming soon to Google Play',
    inputsLabel: 'your photos',
    arrowLabel: 'drawn from their colors',
    resultLabel: 'painted by Photo Gotcha',
    howTitle: 'How it works',
    step1Title: 'Share a photo',
    step1Body: 'Pick one or two photos of you — or anyone you love.',
    step2Title: 'Choose a style',
    step2Body: 'Sixteen styles, from neon nights to vintage film.',
    step3Title: 'Pull the crank',
    step3Body: 'A polaroid slides out — your moment, painted.',
    galleryTitle: 'Styles',
    gallerySub: '16 styles · 40 city backdrops',
    tplNeon: 'Neon',
    tplQipao: 'Qipao',
    tplVintage: 'Vintage',
    tplSnow: 'Snow',
    tplSunset: 'Sunset',
    tplForest: 'Forest',
    aboutTitle: 'About Sparkling Will',
    aboutBody: 'We create cool things to empower people to be more productive and kind.',
    footer: '© 2026 Sparkling Will. All rights reserved.',
  },
  zh: {
    heroKicker: 'Sparkling Will 出品',
    heroTagline: '一拍，一世界。',
    heroSub: '上传一两张照片，AI 读懂它们的色彩，为你绘出值得珍藏的一刻。',
    heroCta: '即将登陆 Google Play',
    inputsLabel: '你的照片',
    arrowLabel: '取其色，绘其形',
    resultLabel: 'Photo Gotcha 绘成',
    howTitle: '如何使用',
    step1Title: '上传照片',
    step1Body: '选择一两张你或所爱之人的照片。',
    step2Title: '挑选风格',
    step2Body: '十六种风格，从霓虹夜色到复古胶片。',
    step3Title: '转动手柄',
    step3Body: '一张拍立得缓缓滑出——属于你的一刻。',
    galleryTitle: '风格',
    gallerySub: '16 种风格 · 40 座城市背景',
    tplNeon: '霓虹',
    tplQipao: '旗袍',
    tplVintage: '复古',
    tplSnow: '落雪',
    tplSunset: '夕照',
    tplForest: '林间',
    aboutTitle: '关于 Sparkling Will',
    aboutBody: '我们创造美好的事物，让人们更高效、更友善。',
    footer: '© 2026 Sparkling Will 版权所有',
  },
};

function apply(lang) {
  const dict = strings[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.body.classList.toggle('lang-zh', lang === 'zh');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const t = dict[el.dataset.i18n];
    if (t) el.textContent = t;
  });
  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.textContent = lang === 'zh' ? 'EN' : '中文';
}

export function initI18n() {
  const saved = localStorage.getItem('sw-lang');
  const lang = saved === 'en' || saved === 'zh'
    ? saved
    : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  apply(lang);
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.lang.startsWith('zh') ? 'en' : 'zh';
    localStorage.setItem('sw-lang', next);
    apply(next);
  });
}

/* ============================================================
   NR 12 — Segurança na Operação de Máquinas — Shared logic (split refactor)
   ============================================================ */
function openImageModal(src) {
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('modalImg');
    if (!modal || !img) return;
    img.src = src;
    modal.classList.add('active');
}
function closeImageModal(e) {
    const modal = document.getElementById('imgModal');
    if (!modal) return;
    modal.classList.remove('active');
}


/* ════════════════════════════════════════
   NAVIGATION CORE
   ════════════════════════════════════════ */

// ===== Persistence helpers =====
function getPageKey() {
    try {
        if (window.MODULE_NAV && window.MODULE_NAV.id) return window.MODULE_NAV.id;
        const p = window.location.pathname.split('/').pop() || 'index.html';
        return p.replace(/\.html$/i, '') || 'index';
    } catch (e) { return 'index'; }
}

function cleanSlideNavUrl() {
    try {
        const url = new URL(window.location.href);
        if (!url.searchParams.has('last') && !url.searchParams.has('restoreslide')) return;
        url.searchParams.delete('last');
        url.searchParams.delete('restoreslide');
        const next = url.pathname + (url.search ? url.search : '') + url.hash;
        window.history.replaceState(null, '', next);
    } catch (e) { }
}

const _slideScrollBtns = {};
const _SCROLL_BTN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

window.scrollSlideDown = function (slideId) {
    const cfg = _slideScrollBtns[slideId];
    const area = cfg ? cfg.area : document.querySelector('#' + slideId + ' .content-area');
    if (!area) return;
    area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
};

window.scrollSumarioDown = function () {
    scrollSlideDown('s-sumario');
};

function updateSlideScrollBtn(slideId) {
    const cfg = _slideScrollBtns[slideId];
    if (!cfg) return;
    if (!window.matchMedia('(max-width: 768px)').matches) {
        cfg.btn.classList.add('is-hidden');
        return;
    }
    const needsScroll = cfg.area.scrollHeight > cfg.area.clientHeight + 8;
    const atBottom = cfg.area.scrollTop + cfg.area.clientHeight >= cfg.area.scrollHeight - 8;
    cfg.btn.classList.toggle('is-hidden', !needsScroll || atBottom);
}

window.updateSlideScrollBtn = updateSlideScrollBtn;

function refreshActiveSlideScrollBtn() {
    const active = document.querySelector('.slide.active');
    if (active && active.id) updateSlideScrollBtn(active.id);
}

function scheduleScrollBtnRefresh() {
    requestAnimationFrame(refreshActiveSlideScrollBtn);
    setTimeout(refreshActiveSlideScrollBtn, 80);
    setTimeout(refreshActiveSlideScrollBtn, 320);
}

window.refreshActiveSlideScrollBtn = refreshActiveSlideScrollBtn;
window.scheduleScrollBtnRefresh = scheduleScrollBtnRefresh;

function registerSlideScrollBtn(slideId, btn, area) {
    if (_slideScrollBtns[slideId]) return;
    _slideScrollBtns[slideId] = { btn, area };
    if (!btn.onclick) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            scrollSlideDown(slideId);
        });
    }
    area.addEventListener('scroll', function () { updateSlideScrollBtn(slideId); }, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(function () { updateSlideScrollBtn(slideId); });
        ro.observe(area);
    }
    if (typeof MutationObserver !== 'undefined') {
        const mo = new MutationObserver(function () { scheduleScrollBtnRefresh(); });
        mo.observe(area, { childList: true, subtree: true, attributes: true, characterData: true });
    }
    updateSlideScrollBtn(slideId);
}

function ensureSlideScrollBtn(slide) {
    const slideId = slide.id;
    if (!slideId) return;
    const area = slide.querySelector('.content-area');
    if (!area) return;

    let btn = slide.querySelector(':scope > .slide-scroll-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slide-scroll-btn is-hidden';
        btn.setAttribute('aria-label', 'Rolar para baixo');
        btn.innerHTML = _SCROLL_BTN_SVG;
        slide.appendChild(btn);
    }
    registerSlideScrollBtn(slideId, btn, area);
}

function initSlideScrollBtn(slideId, btnId) {
    const btn = document.getElementById(btnId);
    const area = document.querySelector('#' + slideId + ' .content-area');
    if (!btn || !area) return;
    registerSlideScrollBtn(slideId, btn, area);
}

function initAllSlideScrollBtns() {
    document.querySelectorAll('.slide').forEach(ensureSlideScrollBtn);
}

initAllSlideScrollBtns();
window.addEventListener('resize', refreshActiveSlideScrollBtn);
const _scrollBtnMq = window.matchMedia('(max-width: 768px)');
if (_scrollBtnMq.addEventListener) {
    _scrollBtnMq.addEventListener('change', refreshActiveSlideScrollBtn);
} else if (_scrollBtnMq.addListener) {
    _scrollBtnMq.addListener(refreshActiveSlideScrollBtn);
}

const _CAROUSEL_NAV_BTN = '[class*="-nav-btn"]:not(.nav-btn), [class*="-carousel-btn"]';

function initCarouselHints() {
    document.querySelectorAll('[class*="-carousel-nav"]').forEach(function (nav) {
        if (nav.querySelector('.carousel-hint')) return;
        var p = document.createElement('p');
        p.className = 'carousel-hint';
        p.textContent = 'Clique na seta para passar';
        nav.appendChild(p);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarouselHints);
} else {
    initCarouselHints();
}

function initCarouselNavTouchFix() {
    document.addEventListener('touchend', function (e) {
        if (!window.matchMedia('(max-width: 768px)').matches) return;
        const btn = e.target.closest(_CAROUSEL_NAV_BTN);
        if (!btn || btn.disabled) return;
        e.preventDefault();
        e.stopPropagation();
        btn.click();
    }, { passive: false, capture: true });
}

initCarouselNavTouchFix();

function initS2Accordion() {
    const items = document.querySelectorAll('#s2 .s2-acc-item');
    if (!items.length) return;

    const mq = window.matchMedia('(max-width: 768px)');

    items.forEach(function (item) {
        const trigger = item.querySelector('.s2-acc-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function () {
            if (!mq.matches) return;
            const isOpen = item.classList.contains('is-open');
            items.forEach(function (el) {
                el.classList.remove('is-open');
                const t = el.querySelector('.s2-acc-trigger');
                if (t) t.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
            if (typeof updateSlideScrollBtn === 'function') updateSlideScrollBtn('s2');
        });
    });

    mq.addEventListener('change', function () {
        if (!mq.matches) {
            items.forEach(function (el) {
                el.classList.remove('is-open');
                const t = el.querySelector('.s2-acc-trigger');
                if (t) t.setAttribute('aria-expanded', 'false');
            });
        }
        if (typeof updateSlideScrollBtn === 'function') updateSlideScrollBtn('s2');
    });
}

initS2Accordion();

function _loadReqState() {
    // No persistence: always start with empty requirements
    return [];
}
function _saveReqState(arr) {
    // No persistence: do nothing
}


// === GLOBAL SLIDE INDEXING ===
/* ═══════════════════════════════════════════════════════════
   ATALHO DE PRÉVIA PÚBLICA  ← mude SÓ esta linha
   ───────────────────────────────────────────────────────────
   null → curso completo (todas as páginas)
   1    → libera index + Módulo 1
   2    → libera até o Módulo 2
   3…6  → idem até o módulo escolhido
   O projeto inteiro permanece no Git; módulos acima do número
   ficam ocultos no sumário ("Em breve") e não abrem.
   ═══════════════════════════════════════════════════════════ */
const NR12_UNLOCK_THROUGH = (function () {
    try {
        var q = new URLSearchParams(window.location.search).get('unlock');
        if (q === 'all' || q === 'null') return null;
        if (q != null && q !== '' && !isNaN(Number(q))) return Number(q);
    } catch (e) { }
    if (typeof window.NR12_UNLOCK_THROUGH !== 'undefined') return window.NR12_UNLOCK_THROUGH;
    return null; // curso completo. Para prévia pública use 1 ou 2.
})();

const NR11_MODULE_OFFSETS = {
    'index': 0,
    'modulo-1': 3,
    'modulo-2': 9,
    'modulo-3': 14,
    'modulo-4': 20
};
const NR11_FULL_TOTAL_SLIDES = 31;
const NR12_MODULE_END_PAGE = { 1: 9, 2: 14, 3: 20, 4: 31 };

const NR12_PREVIEW_ACTIVE = NR12_UNLOCK_THROUGH != null
    && NR12_UNLOCK_THROUGH >= 1
    && NR12_UNLOCK_THROUGH < 4;
const NR12_PREVIEW_M1_ONLY = NR12_PREVIEW_ACTIVE && NR12_UNLOCK_THROUGH === 1; // compat
const NR11_TOTAL_SLIDES = NR12_PREVIEW_ACTIVE
    ? (NR12_MODULE_END_PAGE[NR12_UNLOCK_THROUGH] || NR11_FULL_TOTAL_SLIDES)
    : NR11_FULL_TOTAL_SLIDES;

function nr12ModuleNumFromId(id) {
    if (!id || id === 'index') return 0;
    var m = String(id).match(/modulo-(\d+)/);
    return m ? Number(m[1]) : 0;
}

function nr12IsModuleUnlocked(moduleNum) {
    if (!NR12_PREVIEW_ACTIVE) return true;
    return moduleNum <= NR12_UNLOCK_THROUGH;
}

(function applyPreviewNavClamp() {
    if (!NR12_PREVIEW_ACTIVE || !window.MODULE_NAV) return;
    var cur = nr12ModuleNumFromId(window.MODULE_NAV.id);
    if (cur > NR12_UNLOCK_THROUGH) {
        window.location.replace('index.html');
        return;
    }
    if (cur === NR12_UNLOCK_THROUGH) {
        window.MODULE_NAV.next = null;
    }
})();

function nr11GlobalSlide() {
    if (typeof currentSlide === 'undefined') return 1;
    const offset = NR11_MODULE_OFFSETS[(window.MODULE_NAV && window.MODULE_NAV.id) || 'index'] || 0;
    return offset + currentSlide + 1;
}
const QUIZ_AUDIO_HELPER_PAGES = [9, 15, 27];
const QUIZ_AUDIO_HELPER_PANELS = {
    sq1: 'q1-question-panel',
    sq2: 'q2-question-panel',
    's-quiz4': 'q4-question-panel',
    's-quiz5': 'q5-question-panel',
    's-quiz6': 'q6-question-panel'
};
window.updateQuizAudioHelper = function updateQuizAudioHelper() {
    const bar = document.getElementById('a11y-bar');
    const audioHelper = bar && bar.querySelector('.audio-helper');
    if (!audioHelper) return;

    let show = false;
    if (QUIZ_AUDIO_HELPER_PAGES.includes(nr11GlobalSlide())) {
        const activeSlide = document.querySelector('.slide.active');
        const panelId = activeSlide && QUIZ_AUDIO_HELPER_PANELS[activeSlide.id];
        if (panelId) {
            const panel = document.getElementById(panelId);
            show = !!(panel && window.getComputedStyle(panel).display !== 'none');
        }
    }

    audioHelper.classList.toggle('is-active', show);
    if (bar) bar.classList.toggle('quiz-audio-helper', show);
};

function persistSlideHash(idx) {
    try {
        const slides = document.querySelectorAll('.slide');
        const el = slides[idx];
        if (!el || !el.id) return;
        const next = window.location.pathname + window.location.search + '#' + el.id;
        const cur = window.location.pathname + window.location.search + window.location.hash;
        if (cur !== next) window.history.replaceState(null, '', next);
    } catch (e) { }
}

function slideIndexFromHash() {
    try {
        const hash = (window.location.hash || '').replace(/^#/, '');
        if (!hash) return null;
        const slides = document.querySelectorAll('.slide');
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].id === hash) return i;
        }
    } catch (e) { }
    return null;
}

/* ════════════════════════════════════════
   RELOAD GUARD: refresh sempre volta pro index
   ════════════════════════════════════════ */
// O script que forçava a limpeza do localStorage ao recarregar a página foi removido
// a pedido do usuário para preservar a página (o progresso) quando o usuário sair.

/* ════════════════════════════════════════
   GLOBAL HISTORY SYSTEM
   ════════════════════════════════════════ */
function trackHistory(slideIndex) {
    persistSlideHash(slideIndex);
}

function popHistory() {
    return null;
}

/* ════════════════════════════════════════
   MODULE NAVIGATION (multi-page refactor)
   ════════════════════════════════════════ */
window.MODULE_NAV = window.MODULE_NAV || { id: 'index', prev: null, next: null, label: 'Capa' };

function moduleNext(force) {
    try { playBeep && playBeep('click'); } catch (e) { }
    const total = document.querySelectorAll('.slide').length;
    if (currentSlide === total - 1) {
        if (!window.MODULE_NAV.next) return;
        if (!force && !isSlideCompleted(currentSlide)) {
            alert('Você precisa concluir o quiz deste módulo para avançar.');
            return;
        }
        // removed persistence
        window.location.href = window.MODULE_NAV.next;
        return;
    }
    goTo(currentSlide + 1, !!force);
}
window.moduleNext = moduleNext;

function modulePrev(force) {
    try { playBeep && playBeep('click'); } catch (e) { }
    if (currentSlide === 0) {
        if (!window.MODULE_NAV.prev) return;
        // Persistence removed for previous navigation
        window.location.href = window.MODULE_NAV.prev + '?last=1';
        return;
    }
    goTo(currentSlide - 1, true);
}
window.modulePrev = modulePrev;

const TOTAL = document.querySelectorAll('.slide').length;
let currentSlide = 0;

function startCourse() {
    const clickAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    clickAudio.volume = 0.4;
    clickAudio.play().catch(e => console.log('Audio error:', e));
    goTo(1, true);
}

function buildDots() {
    const dots = document.getElementById('nav-dots');
    if (!dots) return;
    dots.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
        const d = document.createElement('div');
        d.className = 'ndot' + (i === currentSlide ? ' cur' : '');
        d.onclick = () => goTo(i, true);
        dots.appendChild(d);
    }
}

window.demoMode = (function () {
    try { return sessionStorage.getItem('nr11-demoMode') === '1'; } catch (e) { return false; }
})();

function isDemoBtnRevealed() {
    try { return sessionStorage.getItem('nr11-demoBtnVisible') === '1'; } catch (e) { return false; }
}

function setDemoBtnRevealed(visible) {
    try { sessionStorage.setItem('nr11-demoBtnVisible', visible ? '1' : '0'); } catch (e) { }
}

function applyDemoModeUI() {
    const btn = document.getElementById('btn-demo');
    const ind = document.getElementById('demo-indicator');
    // Visível só com simulação ligada, ou se o atalho qa1010 revelou (antes de ligar)
    var revealBtn = !!window.demoMode || isDemoBtnRevealed();

    if (window.demoMode) {
        setDemoBtnRevealed(true);
        revealBtn = true;
    }

    if (btn) {
        btn.classList.toggle('demo-shortcut-visible', !!revealBtn);
        btn.classList.toggle('is-demo-on', !!window.demoMode);
        btn.classList.toggle('is-demo-off', !window.demoMode);
        btn.classList.toggle('active', !!window.demoMode);
        btn.setAttribute('aria-pressed', window.demoMode ? 'true' : 'false');
        btn.setAttribute('aria-label', window.demoMode ? 'Desativar modo simulação' : 'Ativar modo simulação');
        var simLabel = btn.querySelector('.simulation-text');
        if (simLabel) simLabel.textContent = window.demoMode ? 'Simulação: ON' : 'Simulação: OFF';
        var simItem = document.getElementById('sim-control-item');
        if (simItem) simItem.classList.toggle('demo-shortcut-visible', !!revealBtn);
        if (window.matchMedia('(min-width: 769px)').matches) {
            btn.removeAttribute('onmouseover');
            btn.removeAttribute('onmouseout');
            btn.onmouseover = null;
            btn.onmouseout = null;
            btn.style.removeProperty('color');
            btn.style.removeProperty('background');
            btn.style.removeProperty('border-color');
            btn.style.removeProperty('box-shadow');
        }
    }
    if (ind) {
        ind.classList.toggle('demo-shortcut-visible', !!window.demoMode);
        if (window.demoMode) {
            ind.style.opacity = '1';
            ind.style.transform = 'translateY(0)';
        } else {
            ind.style.opacity = '0';
            ind.style.transform = 'translateY(-20px)';
        }
    }
    updateNextButton();
    if (typeof window.positionA11yBar === 'function') window.positionA11yBar();
}

function toggleDemoMode() {
    window.demoMode = !window.demoMode;
    try { sessionStorage.setItem('nr11-demoMode', window.demoMode ? '1' : '0'); } catch (e) { }
    // Liga: mantém visível entre módulos. Desliga: esconde o atalho de novo.
    setDemoBtnRevealed(!!window.demoMode);
    applyDemoModeUI();
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDemoMode();
    }
});

(function initDemoShortcutReveal() {
    var seq = '';
    var target = 'qa1010';
    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
        if (!e.key || e.key.length !== 1) return;
        seq = (seq + e.key.toLowerCase()).slice(-target.length);
        if (seq !== target) return;
        var btn = document.getElementById('btn-demo');
        if (btn) {
            btn.classList.toggle('demo-shortcut-visible');
            var visible = btn.classList.contains('demo-shortcut-visible');
            setDemoBtnRevealed(visible);
            // Se esconder o atalho com simulação ainda ligada, desliga para não ficar "fantasma"
            if (!visible && window.demoMode) {
                window.demoMode = false;
                try { sessionStorage.setItem('nr11-demoMode', '0'); } catch (err) { }
            }
            applyDemoModeUI();
        }
        seq = '';
    });
})();

(function initGoPageShortcut() {
    var buf = '';
    var timer = null;
    var modules = [
        { id: 'index', offset: 0, file: 'index.html', module: 0 },
        { id: 'modulo-1', offset: 3, file: 'modulo-1.html', module: 1 },
        { id: 'modulo-2', offset: 9, file: 'modulo-2.html', module: 2 },
        { id: 'modulo-3', offset: 14, file: 'modulo-3.html', module: 3 },
        { id: 'modulo-4', offset: 20, file: 'modulo-4.html', module: 4 }
    ].filter(function (m) {
        return nr12IsModuleUnlocked(m.module);
    });

    function clearBuf() {
        buf = '';
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function resolveGlobalPage(pageNum) {
        if (!pageNum || pageNum < 1 || pageNum > NR11_TOTAL_SLIDES) return null;
        for (var i = modules.length - 1; i >= 0; i--) {
            if (pageNum > modules[i].offset) {
                return {
                    id: modules[i].id,
                    file: modules[i].file,
                    local: pageNum - modules[i].offset - 1
                };
            }
        }
        return null;
    }

    function jumpToGlobalPage(pageNum) {
        var target = resolveGlobalPage(pageNum);
        if (!target) return;
        clearBuf();
        var currentId = (window.MODULE_NAV && window.MODULE_NAV.id) || 'index';
        if (target.id === currentId) {
            if (typeof goTo === 'function') goTo(target.local, true);
            return;
        }
        window.location.href = target.file + '?restoreslide=' + target.local;
    }

    function tryCommitGo() {
        var m = buf.match(/^go(\d{1,2})$/);
        if (!m) return;
        var pageNum = parseInt(m[1], 10);
        if (pageNum >= 1 && pageNum <= NR11_TOTAL_SLIDES) jumpToGlobalPage(pageNum);
        else clearBuf();
    }

    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

        if (e.key === 'Enter' && /^go\d{1,2}$/.test(buf)) {
            e.preventDefault();
            tryCommitGo();
            return;
        }
        if (e.key === 'Escape') {
            clearBuf();
            return;
        }
        if (!e.key || e.key.length !== 1) return;

        var ch = e.key.toLowerCase();
        if (ch === 'g') {
            clearBuf();
            buf = 'g';
            return;
        }
        if (buf === 'g' && ch === 'o') {
            buf = 'go';
            return;
        }
        if (buf.indexOf('go') === 0 && /^\d$/.test(ch) && buf.length < 4) {
            buf += ch;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () { tryCommitGo(); }, 700);
            return;
        }
        clearBuf();
    });
})();

function isSlideCompleted(idx) {
    if (window.demoMode) return true;
    const slide = document.querySelectorAll('.slide')[idx];
    if (!slide) return true;
    const resultPanel = slide.querySelector('[id$="-result-panel"]');
    if (resultPanel && resultPanel.style.display === 'none') return false;
    if (resultPanel && resultPanel.style.display === 'block') {
        const status = resultPanel.querySelector('.r-status');
        if (status && status.classList.contains('ref')) return false;
    }
    // Vídeos bloqueiam o PRÓXIMO até assistir (mesmo antes do player marcar req-item)
    const videoWraps = slide.querySelectorAll('.video-wrap');
    for (let i = 0; i < videoWraps.length; i++) {
        if (!videoWraps[i].classList.contains('req-done')) return false;
    }
    const reqs = slide.querySelectorAll('.req-item');
    for (let i = 0; i < reqs.length; i++) {
        if (!reqs[i].classList.contains('req-done')) return false;
    }
    return true;
}

function lockAllVideoWraps() {
    document.querySelectorAll('.slide .video-wrap').forEach(function (wrap) {
        if (wrap.classList.contains('req-done')) return;
        var iframe = wrap.querySelector('iframe');
        var src = '';
        if (iframe) {
            src = iframe.getAttribute('src') || iframe.dataset.videoSrc || '';
            if ((!src || src === SLIDE_VIDEO_BLANK || !isSlideVideoSrc(src)) && getPandaIdFromIframe(iframe)) {
                src = buildPandaEmbedSrc(getPandaIdFromIframe(iframe));
            }
        }
        // Sem vídeo linkado (placeholder): libera navegação até substituir
        if (!iframe || !src || src === SLIDE_VIDEO_BLANK || !isSlideVideoSrc(src)) {
            wrap.classList.add('req-done');
            wrap.classList.remove('req-item');
            var warn = wrap.querySelector('.video-warn');
            if (warn) warn.style.display = 'none';
            return;
        }
        wrap.classList.add('req-item');
        wrap.style.cursor = 'default';
        ensureVideoWarn(wrap);
    });
}

function updateNextButton() {
    const btnFwd = document.getElementById('btn-fwd');
    if (!btnFwd) return;

    const isLast = currentSlide === TOTAL - 1;
    const hasNextModule = !!(window.MODULE_NAV && window.MODULE_NAV.next);

    // Preserva o SVG da seta ao montar o rótulo
    let label = btnFwd.querySelector('.fwd-label');
    let svg = btnFwd.querySelector('svg');
    if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2.5');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = '<polyline points="9 18 15 12 9 6" />';
    }
    if (!label) {
        label = document.createElement('span');
        label.className = 'fwd-label';
        btnFwd.textContent = '';
        btnFwd.appendChild(label);
        btnFwd.appendChild(svg);
    } else if (!btnFwd.contains(svg)) {
        btnFwd.appendChild(svg);
    }

    // Último slide sem próximo módulo (ex.: conclusão): esconde
    if (isLast && !hasNextModule) {
        btnFwd.disabled = true;
        btnFwd.style.display = 'none';
        btnFwd.classList.remove('btn-next-module');
        return;
    }

    // Mesmo pill redondo — rótulo sempre "PRÓXIMO"
    const showNextModuleLabel = isLast && hasNextModule && window.MODULE_NAV.id !== 'index';
    btnFwd.style.setProperty('display', 'flex', 'important');
    btnFwd.style.setProperty('visibility', 'visible', 'important');
    btnFwd.style.borderRadius = '999px';
    btnFwd.disabled = !isSlideCompleted(currentSlide);
    label.textContent = 'PRÓXIMO';
    btnFwd.classList.toggle('btn-next-module', showNextModuleLabel);

    const navEl = document.getElementById('nav');
    if (navEl) {
        if (window.MODULE_NAV && window.MODULE_NAV.id === 'index' && currentSlide === 0) {
            navEl.classList.add('nav-hidden-cover');
        } else {
            navEl.classList.remove('nav-hidden-cover');
        }
    }
}

/* ── Slide video lazy load (Panda / Vimeo) ── */
var SLIDE_VIDEO_BLANK = 'about:blank';
var _videoWrapInited = new WeakSet();

function getVimeoIdFromSrc(src) {
    var m = (src || '').match(/vimeo\.com\/video\/(\d+)/);
    return m ? m[1] : null;
}

function getPandaIdFromSrc(src) {
    var m = (src || '').match(/[?&]v=([0-9a-f-]{36})/i);
    return m ? m[1] : null;
}

function getPandaIdFromIframe(iframe) {
    if (!iframe) return null;
    var fromSrc = getPandaIdFromSrc(iframe.getAttribute('src') || iframe.dataset.videoSrc || '');
    if (fromSrc) return fromSrc;
    var m = (iframe.id || '').match(/^panda-([0-9a-f-]{36})$/i);
    return m ? m[1] : null;
}

function buildPandaEmbedSrc(videoId) {
    if (!videoId) return '';
    return 'https://player-vz-d35edf2a-8e7.tv.pandavideo.com.br/embed/?v=' + videoId
        + '&saveProgress=false'
        + '&disableForward=true';
}

function isLoadedVimeoIframe(iframe) {
    var src = iframe.getAttribute('src') || '';
    return src.indexOf('vimeo') !== -1 && src !== SLIDE_VIDEO_BLANK;
}

function isLoadedPandaIframe(iframe) {
    var src = iframe.getAttribute('src') || '';
    return src.indexOf('pandavideo') !== -1 && src !== SLIDE_VIDEO_BLANK;
}

function isSlideVideoSrc(src) {
    return (src || '').indexOf('vimeo') !== -1 || (src || '').indexOf('pandavideo') !== -1;
}

function ensureVideoPoster(wrap, videoSrc) {
    if (!wrap || wrap.querySelector('.video-poster')) return;
    var id = getVimeoIdFromSrc(videoSrc);
    if (!id) return;
    var poster = document.createElement('img');
    poster.className = 'video-poster';
    poster.alt = '';
    poster.src = 'https://vumbnail.com/' + id + '.jpg';
    poster.decoding = 'async';
    var iframe = wrap.querySelector('iframe');
    if (iframe) wrap.insertBefore(poster, iframe);
    else wrap.appendChild(poster);
}

function setVideoPosterVisible(wrap, visible) {
    var poster = wrap && wrap.querySelector('.video-poster');
    if (poster) poster.style.display = visible ? 'block' : 'none';
}

function ensurePandaNoProgressSrc(src) {
    if (!src || src.indexOf('pandavideo') === -1) return src;
    if (/[?&]saveProgress=/i.test(src)) {
        src = src.replace(/([?&]saveProgress=)[^&]*/i, '$1false');
    } else {
        src += (src.indexOf('?') === -1 ? '?' : '&') + 'saveProgress=false';
    }
    if (/[?&]disableForward=/i.test(src)) {
        src = src.replace(/([?&]disableForward=)[^&]*/i, '$1true');
    } else {
        src += '&disableForward=true';
    }
    return src;
}

function ensurePandaApiScript(cb) {
    if (typeof PandaPlayer !== 'undefined') {
        if (typeof cb === 'function') cb();
        return;
    }
    var src = 'https://player.pandavideo.com.br/api.v2.js';
    var existing = document.querySelector('script[src="' + src + '"]');
    if (!existing) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        document.head.appendChild(s);
        existing = s;
    }
    if (typeof cb !== 'function') return;
    var tries = 0;
    (function waitApi() {
        if (typeof PandaPlayer !== 'undefined') {
            cb();
            return;
        }
        if (tries++ > 80) return;
        setTimeout(waitApi, 100);
    })();
}

function prepareSlideVideoIframe(iframe) {
    if (!iframe || iframe.dataset.videoPrepared) return;
    var src = iframe.getAttribute('src');
    if (!src || src === SLIDE_VIDEO_BLANK || !isSlideVideoSrc(src)) {
        var pid = getPandaIdFromIframe(iframe);
        if (!pid) return;
        src = buildPandaEmbedSrc(pid);
        iframe.setAttribute('src', src);
    }
    src = ensurePandaNoProgressSrc(src);
    iframe.dataset.videoSrc = src;
    iframe.dataset.videoKind = src.indexOf('pandavideo') !== -1 ? 'panda' : 'vimeo';
    if (!iframe.id && iframe.dataset.videoKind === 'panda') {
        var idFromSrc = getPandaIdFromSrc(src);
        if (idFromSrc) iframe.id = 'panda-' + idFromSrc;
    }
    iframe.removeAttribute('src');
    iframe.dataset.videoPrepared = '1';
    var wrap = iframe.closest('.video-wrap');
    if (wrap) {
        wrap.classList.add('req-item');
        wrap.style.cursor = 'default';
        ensureVideoWarn(wrap);
        if (iframe.dataset.videoKind === 'vimeo') ensureVideoPoster(wrap, src);
    }
}

function pauseSlideVideoIframe(iframe) {
    try {
        if (isLoadedVimeoIframe(iframe) && typeof Vimeo !== 'undefined') {
            new Vimeo.Player(iframe).pause().catch(function () { });
        } else if (isLoadedPandaIframe(iframe) && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'pause' }, '*');
        }
    } catch (e) { }
}

function unloadSlideVideoIframe(iframe) {
    pauseSlideVideoIframe(iframe);
    if (!iframe.dataset.videoSrc) return;
    var wrap = iframe.closest('.video-wrap');
    iframe.setAttribute('src', SLIDE_VIDEO_BLANK);
    setVideoPosterVisible(wrap, true);
    // Permite reiniciar o player quando o slide voltar a ficar ativo
    if (wrap) {
        try { _videoWrapInited.delete(wrap); } catch (e) { }
        if (iframe.dataset) {
            delete iframe.dataset.pandaMsgBound;
        }
    }
}

function loadSlideVideoIframe(iframe) {
    var src = iframe.dataset.videoSrc;
    if (!src) return;
    var wrap = iframe.closest('.video-wrap');
    var current = iframe.getAttribute('src') || '';

    function onLoaded() {
        setVideoPosterVisible(wrap, false);
        initVideoWrapPlayer(wrap);
    }

    // Já está com o src certo: só garante o bind do player
    if (current === src) {
        onLoaded();
        return;
    }

    // Sempre (re)carrega quando o src ainda não é o do vídeo
    iframe.addEventListener('load', onLoaded, { once: true });
    iframe.setAttribute('src', src);
}

function ensureVideoWarn(wrap) {
    var warn = wrap.querySelector('.video-warn');
    if (warn) warn.remove();
    return null;
}

function markWrapVideoComplete(wrap, warn) {
    if (wrap.classList.contains('req-done')) return;
    wrap.classList.add('req-done');
    if (warn) {
        warn.style.display = 'none';
        warn.style.opacity = '0';
        warn.style.pointerEvents = 'none';
    }
    updateNextButton();
}

function initPandaWrapPlayer(wrap) {
    if (!wrap || _videoWrapInited.has(wrap)) return;
    var iframe = wrap.querySelector('iframe');
    if (!iframe || !isLoadedPandaIframe(iframe)) return;

    wrap.classList.add('req-item');
    wrap.style.cursor = 'default';
    var warn = ensureVideoWarn(wrap);

    if (!iframe.id) {
        var pid = getPandaIdFromSrc(iframe.getAttribute('src') || iframe.dataset.videoSrc || '');
        if (pid) iframe.id = 'panda-' + pid;
    }

    var state = {
        maxWatched: 0,
        duration: 0,
        completed: false,
        seekingBack: false
    };
    var SEEK_TOLERANCE = 1.0;

    function complete() {
        if (state.completed) return;
        state.completed = true;
        markWrapVideoComplete(wrap, warn);
    }

    function snapBack(player) {
        if (state.completed || wrap.classList.contains('req-done')) return;
        state.seekingBack = true;
        var target = Math.max(0, state.maxWatched);
        try {
            if (player && player.setCurrentTime) player.setCurrentTime(target);
        } catch (e) { }
        try {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'currentTime', parameter: target }, '*');
            }
        } catch (e) { }
        setTimeout(function () { state.seekingBack = false; }, 350);
    }

    function handleTime(t, dur, player) {
        if (state.completed || wrap.classList.contains('req-done')) return;
        if (typeof dur === 'number' && dur > 0) state.duration = dur;
        if (typeof t !== 'number' || isNaN(t)) return;
        if (state.seekingBack) return;
        if (t > state.maxWatched + SEEK_TOLERANCE) {
            snapBack(player);
            return;
        }
        if (t > state.maxWatched) state.maxWatched = t;
        if (state.duration > 0 && state.maxWatched >= Math.max(0, state.duration - 3)) complete();
    }

    // postMessage: funciona mesmo sem PandaPlayer API
    initPandaPostMessageFallback(wrap, iframe, warn, state, handleTime, complete, snapBack);

    function bindPlayer(player) {
        _videoWrapInited.add(wrap);
        try {
            if (player.setCurrentTime) player.setCurrentTime(0);
        } catch (e) { }
        try {
            var d = player.getDuration && player.getDuration();
            if (typeof d === 'number' && d > 0) state.duration = d;
        } catch (e) { }

        player.onEvent(function (e) {
            if (!e || state.completed) return;
            var msg = e.message;
            var t = typeof e.currentTime === 'number' ? e.currentTime : null;

            if (msg === 'panda_play') {
                warn.style.opacity = '0';
                warn.style.pointerEvents = 'none';
            }
            if (msg === 'panda_pause' && !wrap.classList.contains('req-done')) {
                warn.style.opacity = '1';
                warn.style.pointerEvents = 'auto';
            }
            if (msg === 'panda_ended') {
                complete();
                try { player.pause(); player.setCurrentTime(0); } catch (err) { }
                return;
            }
            if (msg === 'panda_timeupdate') {
                try {
                    var dd = player.getDuration && player.getDuration();
                    if (typeof dd === 'number' && dd > 0) state.duration = dd;
                } catch (err) { }
                handleTime(t, state.duration, player);
            }
            if (msg === 'panda_seeking' || msg === 'panda_seeked') {
                if (t !== null && t > state.maxWatched + SEEK_TOLERANCE) snapBack(player);
            }
        });
    }

    function startPanda() {
        ensurePandaApiScript(function () {
            window.pandascripttag = window.pandascripttag || [];
            window.pandascripttag.push(function () {
                try {
                    var player = new PandaPlayer(iframe.id, {
                        onReady: function () { bindPlayer(player); }
                    });
                    setTimeout(function () {
                        if (!_videoWrapInited.has(wrap)) _videoWrapInited.add(wrap);
                    }, 4000);
                } catch (e) {
                    _videoWrapInited.add(wrap);
                }
            });
        });
    }

    startPanda();
}

function initPandaPostMessageFallback(wrap, iframe, warn, state, onTime, onEnded, snapBack) {
    if (iframe.dataset.pandaMsgBound) return;
    iframe.dataset.pandaMsgBound = '1';
    var videoId = getPandaIdFromSrc(iframe.getAttribute('src') || iframe.dataset.videoSrc || '')
        || (iframe.id || '').replace(/^panda-/, '');
    if (!videoId) return;

    window.addEventListener('message', function (event) {
        var data = event.data;
        if (!data || !data.message) return;
        if (data.video && String(data.video) !== String(videoId)) return;
        if (state.completed || wrap.classList.contains('req-done')) return;

        var t = typeof data.currentTime === 'number' ? data.currentTime : null;
        var dur = typeof data.duration === 'number' ? data.duration : null;

        if (data.message === 'panda_play') {
            warn.style.opacity = '0';
            warn.style.pointerEvents = 'none';
        }
        if (data.message === 'panda_pause' && !wrap.classList.contains('req-done')) {
            warn.style.opacity = '1';
            warn.style.pointerEvents = 'auto';
        }
        if (data.message === 'panda_ended') {
            state.completed = true;
            if (typeof onEnded === 'function') onEnded();
            else markWrapVideoComplete(wrap, warn);
            return;
        }
        if (data.message === 'panda_seeking' || data.message === 'panda_seeked') {
            if (t !== null && t > state.maxWatched + 1.0) {
                if (typeof snapBack === 'function') snapBack(null);
            }
            return;
        }
        if (data.message === 'panda_timeupdate' && t !== null) {
            if (typeof onTime === 'function') onTime(t, dur, null);
        }
    });
}

function initVimeoWrapPlayer(wrap) {
    if (!wrap || _videoWrapInited.has(wrap)) return;
    var iframe = wrap.querySelector('iframe');
    if (!iframe || !isLoadedVimeoIframe(iframe)) return;
    if (typeof Vimeo === 'undefined') return;

    _videoWrapInited.add(wrap);
    wrap.classList.add('req-item');
    wrap.style.cursor = 'default';
    var warn = ensureVideoWarn(wrap);

    var player = new Vimeo.Player(iframe);
    var maxWatched = 0;
    var duration = 0;
    var completed = false;

    function markVideoComplete() {
        if (completed) return;
        completed = true;
        markWrapVideoComplete(wrap, warn);
    }

    player.getDuration().then(function (d) {
        duration = d || 0;
    }).catch(function () { });

    var enforceTime = function (data) {
        if (completed) return;
        if (data.seconds > maxWatched + 1.25) {
            player.setCurrentTime(maxWatched);
        }
    };

    player.on('timeupdate', function (data) {
        if (completed) return;
        if (typeof data.duration === 'number' && data.duration > 0) {
            duration = data.duration;
        }
        if (data.seconds > maxWatched + 2.5) {
            player.setCurrentTime(maxWatched);
            return;
        }
        if (data.seconds > maxWatched) {
            maxWatched = data.seconds;
        }
        if (duration > 0 && maxWatched >= Math.max(0, duration - 3)) {
            markVideoComplete();
        }
    });

    player.on('seeking', enforceTime);
    player.on('seeked', enforceTime);

    player.on('play', function () {
        warn.style.opacity = '0';
        warn.style.pointerEvents = 'none';
        player.getCurrentTime().then(function (seconds) {
            if (!completed && seconds > maxWatched + 1.25) player.setCurrentTime(maxWatched);
        });
    });

    player.on('pause', function () {
        if (!wrap.classList.contains('req-done')) {
            warn.style.opacity = '1';
            warn.style.pointerEvents = 'auto';
        }
    });

    player.on('ended', function () {
        markVideoComplete();
        try {
            player.pause().then(function () {
                return player.setCurrentTime(0);
            }).catch(function () { });
        } catch (e) { }
    });
}

function initVideoWrapPlayer(wrap) {
    if (!wrap) return;
    var iframe = wrap.querySelector('iframe');
    if (!iframe) return;
    if (isLoadedPandaIframe(iframe)) {
        initPandaWrapPlayer(wrap);
        return;
    }
    if (isLoadedVimeoIframe(iframe)) {
        initVimeoWrapPlayer(wrap);
    }
}

function syncSlideVideos(activeIdx) {
    var slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    lockAllVideoWraps();
    slides.forEach(function (slide, i) {
        slide.querySelectorAll('.video-wrap iframe').forEach(prepareSlideVideoIframe);
        // Só carrega no slide ativo (iframes em display:none quebram o Panda)
        var shouldLoad = (i === activeIdx);
        slide.querySelectorAll('.video-wrap iframe[data-video-prepared]').forEach(function (iframe) {
            if (shouldLoad) loadSlideVideoIframe(iframe);
            else unloadSlideVideoIframe(iframe);
        });
        slide.querySelectorAll('video').forEach(function (v) {
            v.setAttribute('preload', 'metadata');
            if (i !== activeIdx) {
                try { v.pause(); } catch (e) { }
            }
        });
    });
    updateNextButton();
}

function goTo(idx, force = false, skipHistory = false) {
    try {
        const clickAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        clickAudio.volume = 0.4;
        clickAudio.play().catch(e => console.log('Audio error:', e));
    } catch (e) { }

    if (idx < 0 || idx >= TOTAL) return;
    if (idx > currentSlide && !force && !isSlideCompleted(currentSlide)) {
        alert('Por favor, interaja com todos os itens e responda o quiz para avançar.');
        return;
    }
    const slides = document.querySelectorAll('.slide');
    const oldSlide = slides[currentSlide];
    oldSlide.classList.remove('active');
    oldSlide.classList.add('exit-left');
    // Pause q6 background music when leaving quiz 6 slide
    try {
        if (oldSlide.id === 's-quiz6') {
            const musicBtn = document.getElementById('q6-btn-music-toggle');
            if (musicBtn) musicBtn.hidden = true;
        }
        const q6Music = oldSlide.querySelector('#q6-bg-music');
        if (q6Music) { q6Music.pause(); q6Music.currentTime = 0; }
    } catch (e) { }
    setTimeout(() => { oldSlide.classList.remove('exit-left'); }, 600);

    currentSlide = idx;
    if (!skipHistory) trackHistory(currentSlide);
    cleanSlideNavUrl();
    persistSlideHash(currentSlide);
    const newSlide = slides[currentSlide];
    newSlide.classList.add('active');
    newSlide.classList.remove('exit-left');

    const nav = document.getElementById('nav');
    if (nav) nav.style.display = 'flex';

    if (newSlide.id === 's-conclusion') {
        startConclusionEpic();
    }
    if (_slideScrollBtns[newSlide.id] && typeof updateSlideScrollBtn === 'function') {
        scheduleScrollBtnRefresh();
    }
    const pbar = document.getElementById('pbar');
    if (pbar) pbar.style.width = (nr11GlobalSlide() / NR11_TOTAL_SLIDES * 100) + '%';
    const counter = document.getElementById('slide-counter');
    if (counter) counter.textContent = nr11GlobalSlide() + ' / ' + NR11_TOTAL_SLIDES;
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.disabled = (currentSlide === 0 && !window.MODULE_NAV.prev);
        btnBack.style.visibility = (currentSlide === 0 && !window.MODULE_NAV.prev) ? 'hidden' : 'visible';
    }
    const btnFwd = document.getElementById('btn-fwd');
    if (btnFwd) {
        btnFwd.style.visibility = 'visible';
        const hideFwd = currentSlide === TOTAL - 1 && !(window.MODULE_NAV && window.MODULE_NAV.next);
        btnFwd.style.display = hideFwd ? 'none' : 'flex';
        // Trava imediatamente; updateNextButton libera se a página estiver completa
        btnFwd.disabled = true;
    }
    buildDots();
    try { lockAllVideoWraps(); } catch (e) { }
    try { syncSlideVideos(currentSlide); } catch (e) { }
    updateNextButton();
    try { window.updateQuizAudioHelper(); } catch (e) { }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') moduleNext(true);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') modulePrev(true);
});


function startConclusionEpic() {
    createCinematicParticles();
    createPremiumConfetti();
    playConclusionCinematicAudio();
    try {
        const slide = document.getElementById('s-conclusion');
        if (slide) {
            const area = slide.querySelector('.content-area');
            if (area && !_slideScrollBtns['s-conclusion']) {
                let btn = slide.querySelector(':scope > .slide-scroll-btn');
                if (!btn) {
                    btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'slide-scroll-btn is-hidden';
                    btn.setAttribute('aria-label', 'Rolar para baixo');
                    btn.innerHTML = _SCROLL_BTN_SVG;
                    slide.appendChild(btn);
                }
                registerSlideScrollBtn('s-conclusion', btn, area);
            }
        }
        scheduleScrollBtnRefresh();
        setTimeout(scheduleScrollBtnRefresh, 600);
        setTimeout(scheduleScrollBtnRefresh, 1600);
    } catch (e) { }
}

function createCinematicParticles() {
    const container = document.getElementById('c-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle-green';
        p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = (Math.random() * 100 + 50) + 'vh';
        p.style.animationDuration = (Math.random() * 5 + 5) + 's';
        p.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(p);
    }
}

function createPremiumConfetti() {
    const container = document.getElementById('c-confetti');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#E7A0FE', '#000180', '#f1c40f', '#f39c12', '#ffffff'];
    for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = (Math.random() * 3 + 4) + 's';
        c.style.animationDelay = (Math.random() * 1.5) + 's';
        c.style.opacity = Math.random() * 0.5 + 0.5;
        container.appendChild(c);
    }
}

function playConclusionCinematicAudio() {
    try {
        // Usando caminho relativo para evitar bloqueios do navegador e ajustando volume
        const efeitofinal = new Audio('https://res.cloudinary.com/dzqns0zpe/video/upload/v1779288012/efeitofinal_kzr836.mp3');
        efeitofinal.volume = 0.5; // Volume ajustado para um nível médio/baixo
        efeitofinal.play().catch(e => console.log('Audio error:', e));
    } catch (e) { console.log('Audio disabled', e); }
}

function finishTraining() {
    console.log('--- TREINAMENTO FINALIZADO VIA SCORM/LMS ---');
    alert('Treinamento concluído e registrado com sucesso!');
    // Aqui iria a chamada para o LMS, ex: window.close(), SCORM.quit(), etc.
}

function restartCourse() {
    try {
        window.location.href = 'index.html';
    } catch (e) {
        window.location.assign('index.html');
    }
}
window.restartCourse = restartCourse;

/* ════════════════════════════════════════
   ════════════════════════════════════════ */
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let currentOsc = null;
let currentGain = null;
let quizCorrectAudio = null;
let quizWrongAudio = null;
let activeQuizSfx = null;

const QUIZ_CORRECT_SFX = encodeURI('assets/efeitos sonoros/correct-answer.mp3');
const QUIZ_WRONG_SFX = encodeURI('assets/efeitos sonoros/OBJMisc-wrong_answer-Elevenlabs.mp3');

function ensureAudioCtx() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
        return audioCtx.resume().then(function () { return audioCtx; }).catch(function () { return audioCtx; });
    }
    return Promise.resolve(audioCtx);
}

function stopQuizSfx(except) {
    [quizCorrectAudio, quizWrongAudio, activeQuizSfx].forEach(function (audio) {
        if (!audio || audio === except) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (e) { }
    });
}

function playSynthFallback(kind) {
    ensureAudioCtx().then(function (ctx) {
        if (!ctx) return;
        try {
            if (currentOsc) {
                try { currentOsc.stop(); currentOsc.disconnect(); } catch (e) { }
            }
            if (currentGain) {
                try { currentGain.disconnect(); } catch (e) { }
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            currentOsc = osc;
            currentGain = gain;

            const now = ctx.currentTime;
            if (kind === 'ok' || kind === 'correct') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.09);
                osc.frequency.setValueAtTime(783.99, now + 0.18);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
                osc.start(now);
                osc.stop(now + 0.4);
            } else {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
                osc.start(now);
                osc.stop(now + 0.34);
            }
        } catch (e) { }
    });
}

function playQuizMp3(kind) {
    const isOk = kind === 'ok' || kind === 'correct';
    const src = isOk ? QUIZ_CORRECT_SFX : QUIZ_WRONG_SFX;

    try {
        // Garante AudioContext desbloqueado no mesmo gesto do clique
        try { ensureAudioCtx(); } catch (e) { }

        let audio = isOk ? quizCorrectAudio : quizWrongAudio;
        if (!audio) {
            audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = 0.45;
            if (isOk) quizCorrectAudio = audio;
            else quizWrongAudio = audio;
        }

        stopQuizSfx(audio);
        activeQuizSfx = audio;

        const startPlay = function () {
            try {
                if (audio.readyState >= 1) audio.currentTime = 0;
            } catch (e) {
                try { audio.load(); } catch (err) { }
            }
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(function () {
                    try {
                        const fresh = new Audio(src);
                        fresh.volume = 0.45;
                        activeQuizSfx = fresh;
                        if (isOk) quizCorrectAudio = fresh;
                        else quizWrongAudio = fresh;
                        return fresh.play().catch(function () {
                            playSynthFallback(isOk ? 'ok' : 'nok');
                        });
                    } catch (err) {
                        playSynthFallback(isOk ? 'ok' : 'nok');
                    }
                });
            }
        };

        // Toca imediatamente (não espera canplay) — evita perder o gesto do usuário
        startPlay();
        // Se ainda estiver pausado após carregar, tenta de novo
        setTimeout(function () {
            if (activeQuizSfx === audio && audio.paused) {
                startPlay();
            }
        }, 120);
        // Fallback sintético se o MP3 falhar em silêncio
        setTimeout(function () {
            if (activeQuizSfx === audio && audio.paused) {
                playSynthFallback(isOk ? 'ok' : 'nok');
            }
        }, 320);
    } catch (e) {
        playSynthFallback(isOk ? 'ok' : 'nok');
    }
}

function playCorrectAnswerSound() {
    playQuizMp3('ok');
}

function playWrongAnswerSound() {
    playQuizMp3('nok');
}

function preloadQuizSfx() {
    try {
        if (!quizCorrectAudio) {
            quizCorrectAudio = new Audio(QUIZ_CORRECT_SFX);
            quizCorrectAudio.preload = 'auto';
            quizCorrectAudio.volume = 0.45;
        }
        if (!quizWrongAudio) {
            quizWrongAudio = new Audio(QUIZ_WRONG_SFX);
            quizWrongAudio.preload = 'auto';
            quizWrongAudio.volume = 0.45;
        }
        try { quizCorrectAudio.load(); } catch (e) { }
        try { quizWrongAudio.load(); } catch (e) { }
    } catch (e) { }
}

if (typeof document !== 'undefined') {
    const unlockOnce = function () {
        preloadQuizSfx();
        try { ensureAudioCtx(); } catch (e) { }
        document.removeEventListener('pointerdown', unlockOnce, true);
        document.removeEventListener('keydown', unlockOnce, true);
    };
    document.addEventListener('pointerdown', unlockOnce, true);
    document.addEventListener('keydown', unlockOnce, true);
}

function playBeep(type) {
    if (type === 'ok') {
        playCorrectAnswerSound();
        return;
    }
    if (type === 'nok') {
        playWrongAnswerSound();
        return;
    }

    ensureAudioCtx().then(function (ctx) {
        if (!ctx) return;

        // Evitar sobreposição cancelando o áudio anterior imediatamente
        if (currentOsc) {
            try { currentOsc.stop(); currentOsc.disconnect(); } catch (e) { }
        }
        if (currentGain) {
            try { currentGain.disconnect(); } catch (e) { }
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        currentOsc = osc;
        currentGain = gain;

        const now = ctx.currentTime;

        if (type === 'click') {
            // Som de clique tecnológico super rápido e sutil
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'end') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1);
            osc.frequency.setValueAtTime(659.25, now + 0.2);
            osc.frequency.setValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'flip') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        }
    });
}


// Global playTechClick - usa mesmo som do flip card  
window.playTechClick = function () {
    try { playBeep('flip'); } catch (e) { }
};

// Mobile/Browser audio unlock: resume AudioContext on first user interaction
(function unlockAudioOnFirstInteraction() {
    function unlock() {
        try {
            ensureAudioCtx();
            // create a tiny silent buffer to unlock audio on iOS
            const silent = new Audio();
            silent.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
            silent.volume = 0;
            silent.play().catch(() => { });
            // Pré-carrega efeitos de certo/errado para não falhar no 1º verify
            if (!quizCorrectAudio) {
                quizCorrectAudio = new Audio(QUIZ_CORRECT_SFX);
                quizCorrectAudio.preload = 'auto';
                quizCorrectAudio.volume = 0.45;
                try { quizCorrectAudio.load(); } catch (e) { }
            }
            if (!quizWrongAudio) {
                quizWrongAudio = new Audio(QUIZ_WRONG_SFX);
                quizWrongAudio.preload = 'auto';
                quizWrongAudio.volume = 0.45;
                try { quizWrongAudio.load(); } catch (e) { }
            }
        } catch (e) { }
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('click', unlock);
    }
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
})();

/* ── Reset de estado visual das respostas (quizzes/atividades) ── */
var ANSWER_STATE_CLASSES = ['selected', 'active', 'correct', 'wrong', 'checked', 'selected-true', 'selected-false', 'selected-visual', 'answered', 'muted'];

function clearAnswerState(el) {
    if (!el) return;
    ANSWER_STATE_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
}

function clearAnswerGroup(container, selector) {
    if (!container) return;
    container.querySelectorAll(selector).forEach(clearAnswerState);
}

function resetTfButtons(btnTrue, btnFalse) {
    [btnTrue, btnFalse].forEach(clearAnswerState);
    if (btnTrue) {
        btnTrue.className = 'tf-btn true';
        btnTrue.style.animation = '';
    }
    if (btnFalse) {
        btnFalse.className = 'tf-btn false';
        btnFalse.style.animation = '';
    }
}

/* ════════════════════════════════════════
   QUIZ ENGINE (generic)
   ════════════════════════════════════════ */
function createQuizEngine(prefix, questions, numDots) {
    let idx = 0, answered = false, score = 0, selectedOptIdx = -1;
    let wrongTopics = [];
    const isM1Quiz = () => prefix === 'q1' || prefix === 'q2' || prefix === 'q3' || prefix === 'q4' || prefix === 'q5';

    const _stateKey = () => 'nr11_' + getPageKey() + '_' + prefix + '_state';
    function _saveState() {
        // removed persistence
    }
    function _loadState() {
        return null;
    }

    function start() {
        const introPanel = document.getElementById(prefix + '-intro-panel');
        const qPanel = document.getElementById(prefix + '-question-panel');
        if (introPanel) introPanel.style.display = 'none';
        if (qPanel) {
            qPanel.style.display = 'block';
            qPanel.style.opacity = '0';
            setTimeout(() => qPanel.style.opacity = '1', 50);
        }
        render();
        playBeep('click');
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function renderDots() {
        const dotsContainer = document.querySelector('#' + prefix + '-question-panel .q-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < numDots; i++) {
                const d = document.createElement('div');
                d.id = prefix + 'dot' + i;
                d.className = 'qdot2' + (i < idx ? ' done' : '') + (i === idx ? ' cur' : '');
                dotsContainer.appendChild(d);
            }
        }
    }

    function render() {
        const qPanel = document.getElementById(prefix + '-question-panel');
        if (qPanel) qPanel.classList.remove('q-result-anim');

        // sempre resetar estado visual a cada nova pergunta
        answered = false;
        selectedOptIdx = -1;

        const q = questions[idx];
        const c = document.getElementById(prefix + '-counter');
        if (c) c.textContent = `Pergunta ${idx + 1} de ${questions.length}`;
        const txt = document.getElementById(prefix + '-text');
        if (txt) {
            txt.innerHTML = q.q;
            if (prefix === 'q5') {
                const img = txt.querySelector('img');
                if (img && !txt.querySelector('.q5-img-expand')) {
                    let wrap = img.closest('.q5-img-wrap');
                    if (!wrap) {
                        wrap = document.createElement('div');
                        wrap.className = 'q5-img-wrap';
                        img.parentNode.insertBefore(wrap, img);
                        wrap.appendChild(img);
                    }
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'q5-img-expand';
                    btn.setAttribute('aria-label', 'Ampliar imagem');
                    btn.title = 'Ampliar imagem';
                    btn.textContent = '🔍';
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof openImageModal === 'function') openImageModal(img.getAttribute('src') || img.src);
                    });
                    wrap.appendChild(btn);
                }
            }
        }
        const opts = document.getElementById(prefix + '-options');
        if (opts) {
            opts.innerHTML = '';
            const letters = ['A', 'B', 'C', 'D'];
            q.opts.forEach((opt, i) => {
                const el = document.createElement('div');
                el.className = 'q-opt';
                el.innerHTML = `<div class="opt-l">${letters[i]}</div><span>${opt}</span>`;
                el.onclick = () => selectAnswer(i, el);
                opts.appendChild(el);
            });
        }
        const fb = document.getElementById(prefix + '-feedback');
        if (fb) { fb.className = 'q-feedback'; fb.textContent = ''; }
        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }
        const btn = document.getElementById('btn-next-' + prefix);
        if (btn) btn.className = 'btn-next-q';
        renderDots();
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function selectAnswer(i, el) {
        if (answered) return;
        selectedOptIdx = i;
        const allOpts = document.querySelectorAll('#' + prefix + '-options .q-opt');
        allOpts.forEach(clearAnswerState);
        el.classList.add('selected');
        playBeep('click');

        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) {
            vCont.style.display = 'block';
            setTimeout(() => {
                vCont.style.opacity = '1';
                vCont.style.visibility = 'visible';
            }, 50);
        }
    }

    function verify() {
        if (answered || selectedOptIdx === -1) return;
        answered = true;

        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }

        const q = questions[idx];
        const allOpts = document.querySelectorAll('#' + prefix + '-options .q-opt');
        allOpts.forEach(function (o) {
            clearAnswerState(o);
            o.style.pointerEvents = 'none';
            o.classList.add('answered');
        });
        const fb = document.getElementById(prefix + '-feedback');

        function setOptIcon(el, icon) {
            if (!el) return;
            const letter = el.querySelector('.opt-l');
            if (letter) letter.textContent = icon;
        }

        if (selectedOptIdx === q.correct) {
            // removed persistence
            allOpts[selectedOptIdx].classList.add('correct');
            setOptIcon(allOpts[selectedOptIdx], '✓');
            if (fb) { fb.textContent = q.feedback_ok; fb.className = 'q-feedback ok'; }
            score++; playBeep('ok');
        } else {
            allOpts[selectedOptIdx].classList.add('wrong');
            setOptIcon(allOpts[selectedOptIdx], '✕');
            if (allOpts[q.correct]) {
                allOpts[q.correct].classList.add('correct');
                setOptIcon(allOpts[q.correct], '✓');
            }
            if (q.topic) wrongTopics.push(q.topic);
            else {
                var fallback = String(q.q || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (fallback) wrongTopics.push(fallback.length > 90 ? fallback.slice(0, 87) + '…' : fallback);
            }
            if (fb) { fb.textContent = q.feedback_nok; fb.className = 'q-feedback nok'; }
            playBeep('nok');
        }

        allOpts.forEach(function (o) {
            if (!o.classList.contains('correct') && !o.classList.contains('wrong')) {
                o.classList.add('muted');
            }
        });

        const btn = document.getElementById('btn-next-' + prefix);
        if (btn) btn.className = 'btn-next-q show';

        scheduleScrollBtnRefresh();

        // persist quiz state after verification
        try { _saveState(); } catch (e) { }
    }

    function next() {
        idx++;
        if (idx < questions.length) { render(); _saveState(); }
        else { showResult(); }
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function uniqueTopics(list) {
        const seen = {};
        const out = [];
        list.forEach(function (t) {
            if (!t || seen[t]) return;
            seen[t] = true;
            out.push(t);
        });
        return out;
    }

    function getMinCorrect() {
        if (prefix === 'q1' || prefix === 'q2') return 2;
        if (prefix === 'q3') return 4;
        if (prefix === 'q4') return 2;
        if (prefix === 'q5') return 3;
        return Math.ceil(questions.length * 0.60);
    }

    function showResult() {
        playBeep('end');
        const qPanel = document.getElementById(prefix + '-question-panel');
        if (qPanel) qPanel.style.display = 'none';
        const rPanel = document.getElementById(prefix + '-result-panel');
        if (rPanel) {
            rPanel.style.display = 'block';
            rPanel.classList.add('is-visible');
            rPanel.classList.remove('q-result-anim');
            void rPanel.offsetWidth;
            rPanel.classList.add('q-result-anim');
        }
        const minCorrect = getMinCorrect();
        const approved = score >= minCorrect;
        const pct = score / questions.length;
        const pctEl = document.getElementById(prefix + '-pct');
        if (pctEl) { pctEl.textContent = Math.round(pct * 100) + '%'; pctEl.className = 'result-pct ' + (approved ? 'green' : 'red-c'); }
        const starsEl = document.getElementById(prefix + '-stars');
        if (starsEl) {
            starsEl.textContent = pct === 1 ? '⭐⭐⭐' : approved ? '⭐⭐' : '⭐';
            starsEl.classList.remove('stars-anim');
            void starsEl.offsetWidth;
            starsEl.classList.add('stars-anim');
        }
        const status = document.getElementById(prefix + '-status');
        if (status) {
            if (isM1Quiz()) {
                status.textContent = approved ? 'Desafio Concluído!' : 'Desafio não concluído';
                status.className = 'quiz-result-title r-status ' + (approved ? 'ap' : 'ref');
            } else {
                status.textContent = approved ? '✅ Aprovado!' : (prefix === 'q5' ? '❌ Reprovado!' : '❌ Tente Novamente');
                status.className = 'r-status ' + (approved ? 'ap' : 'ref');
            }
        }
        const sub = document.getElementById(prefix + '-sub');
        if (sub) {
            if (isM1Quiz()) {
                if (approved) {
                    var endsPreview = NR12_PREVIEW_ACTIVE
                        && nr12ModuleNumFromId(window.MODULE_NAV && window.MODULE_NAV.id) === NR12_UNLOCK_THROUGH;
                    sub.textContent = endsPreview
                        ? `Você acertou ${score} de ${questions.length} questões. Parabéns! Esta prévia do treinamento termina aqui — os próximos módulos serão liberados em breve.`
                        : `Você acertou ${score} de ${questions.length} questões. Parabéns! Pode avançar para a próxima etapa.`;
                } else {
                    sub.textContent = `Você acertou ${score} de ${questions.length} questões. É necessário acertar pelo menos ${minCorrect} questões. Estude e tente novamente.`;
                }
            } else if (prefix === 'q5') {
                sub.textContent = `Você acertou ${score} de ${questions.length} questões. ` + (approved ? 'Você concluiu a simulação operacional com sucesso.' : 'Revise os procedimentos operacionais e tente novamente.');
            } else {
                sub.textContent = `Você acertou ${score} de ${questions.length} questões.` + (approved ? ' Parabéns!' : ' Revise o módulo e tente novamente.');
            }
        }

        if (isM1Quiz()) {
            const reviewEl = document.getElementById(prefix + '-review');
            const iconEl = document.getElementById(prefix + '-result-icon');
            const retryBtn = document.getElementById(prefix + '-retry-btn');
            const topics = uniqueTopics(wrongTopics);

            if (iconEl) iconEl.textContent = approved ? '🏅' : '📚';
            if (retryBtn) {
                retryBtn.textContent = approved ? 'REVISAR DESAFIO' : 'JOGAR NOVAMENTE';
                retryBtn.style.display = approved ? 'none' : 'inline-flex';
            }

            if (reviewEl) {
                if (!approved) {
                    reviewEl.hidden = false;
                    reviewEl.innerHTML = '<strong>Revise estes temas:</strong><ul>' +
                        (topics.length ? topics : ['Revise as questões do desafio e tente novamente.']).map(function (t) { return '<li>' + t + '</li>'; }).join('') +
                        '</ul>';
                } else {
                    reviewEl.hidden = true;
                    reviewEl.innerHTML = '';
                }
            }

            if (rPanel) {
                rPanel.classList.toggle('is-approved', approved);
                rPanel.classList.toggle('is-failed', !approved);
            }
        }

        // removed persistence
        updateNextButton();
        try { window.updateQuizAudioHelper(); } catch (e) { }
        scheduleScrollBtnRefresh();
    }

    function reset() {
        idx = 0; score = 0; answered = false; selectedOptIdx = -1;
        wrongTopics = [];
        const introPanel = document.getElementById(prefix + '-intro-panel');
        const qPanel = document.getElementById(prefix + '-question-panel');
        const rPanel = document.getElementById(prefix + '-result-panel');

        if (qPanel) {
            qPanel.style.display = 'none';
            qPanel.style.opacity = '';
        }
        if (rPanel) {
            rPanel.style.display = 'none';
            rPanel.classList.remove('is-approved', 'is-failed', 'q-result-anim', 'is-visible');
        }
        if (introPanel) {
            introPanel.style.display = 'flex';
        }

        const fb = document.getElementById(prefix + '-feedback');
        if (fb) { fb.className = 'q-feedback'; fb.textContent = ''; }

        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }

        const btn = document.getElementById('btn-next-' + prefix);
        if (btn) btn.className = 'btn-next-q';

        const reviewEl = document.getElementById(isM1Quiz() ? prefix + '-review' : null);
        if (reviewEl) { reviewEl.hidden = true; reviewEl.innerHTML = ''; }

        // removed persistence

        render();
        updateNextButton();

        // Volta o scroll para o card inicial (sem ficar “embaixo”)
        try {
            const slide = document.getElementById(prefix === 'q1' ? 'sq1' : prefix === 'q2' ? 'sq2' : prefix === 'q3' ? 's-quiz3' : prefix === 'q4' ? 's-quiz4' : prefix === 'q5' ? 's-quiz5' : null) ||
                (introPanel && introPanel.closest('.slide'));
            const area = slide && slide.querySelector('.content-area');
            if (area) area.scrollTop = 0;
            if (introPanel && introPanel.scrollIntoView) {
                introPanel.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            }
        } catch (e) { }

        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    return { render, next, reset, selectAnswer, start, verify };
}

/* ════════════════════════════════════════
   QUIZ DATA — MÓDULO 1
   ════════════════════════════════════════ */
const q1_questions = [
    {
        q: 'Qual é o objetivo principal da NR-12 na Central de Cores?',
        opts: [
            'Ensinar os operadores a realizarem misturas de cores personalizadas para os clientes da loja.',
            'Estabelecer referências técnicas e medidas de proteção para resguardar a saúde e a integridade física dos trabalhadores.',
            'Definir quais marcas de tintas e corantes químicos podem ser comercializados na loja.'
        ],
        correct: 1,
        topic: 'Objetivo principal da NR-12',
        feedback_ok: '✅ Excelente! O propósito central da NR-12 é definir os requisitos mínimos de proteção para prevenir acidentes e doenças do trabalho durante a utilização de máquinas e equipamentos.',
        feedback_nok: '❌ Incorreto. O propósito central da NR-12 é definir os requisitos mínimos de proteção para prevenir acidentes e doenças do trabalho durante a utilização de máquinas e equipamentos.'
    },
    {
        q: 'De acordo com o item 12.1.4 da norma, a NR-12 NÃO se aplica a qual dos seguintes itens da loja?',
        opts: [
            'Ao dosador automático computadorizado de corantes da Central.',
            'Às paleteiras manuais (movidas por força humana) e ferramentas elétricas portáteis (como furadeiras).',
            'Ao misturador mecânico giroscópico utilizado para homogeneizar as tintas.'
        ],
        correct: 1,
        topic: 'Limites de aplicação da NR-12 (item 12.1.4)',
        feedback_ok: '✅ Muito bem! A NR-12 deixa claro que equipamentos impulsionados por força humana ou animal, ferramentas portáteis elétricas e eletrodomésticos com selo do INMETRO estão fora do escopo de aplicação da norma.',
        feedback_nok: '❌ Incorreto. A NR-12 deixa claro que equipamentos impulsionados por força humana ou animal, ferramentas portáteis elétricas e eletrodomésticos com selo do INMETRO estão fora do escopo de aplicação da norma.'
    },
    {
        q: 'Segundo as exigências do Anexo II da NR-12, quem está legalmente autorizado a utilizar o dosador e o misturador de tintas?',
        opts: [
            'Qualquer colaborador da loja que precise preparar uma tinta de forma rápida.',
            'Apenas clientes, desde que acompanhados por um operador de caixa.',
            'Exclusivamente os colaboradores capacitados e aprovados no treinamento de segurança.'
        ],
        correct: 2,
        topic: 'Capacitação e autorização para operação (Anexo II)',
        feedback_ok: '✅ Correto! A formação de NR-12 é obrigatória para a utilização das máquinas da Central de Cores. Permitir que pessoas não autorizadas ou sem capacitação utilizem os equipamentos é proibido.',
        feedback_nok: '❌ Incorreto. A formação de NR-12 é obrigatória para a utilização das máquinas da Central de Cores. Permitir que pessoas não autorizadas ou sem capacitação utilizem os equipamentos é proibido.'
    }
];
const quiz1 = createQuizEngine('q1', q1_questions, 3);
function startQuiz1Intro() { quiz1.start(); }
function verifyAnswer1() { quiz1.verify(); }
function nextQuestion1() { quiz1.next(); }
function resetQuiz1() { quiz1.reset(); }

const q3_questions = [
    {
        q: 'A bateria atingiu 20% durante a operação. O que o operador deve fazer?',
        opts: ['Solicitar troca segura da bateria', 'Continuar operando até descarregar completamente', 'Aumentar velocidade para finalizar mais rápido', 'Ignorar o nível de carga'],
        correct: 0,
        topic: 'Troca de bateria',
        feedback_ok: '✅ Procedimento correto! A troca da bateria deve ocorrer ao atingir aproximadamente 20% de carga.',
        feedback_nok: '❌ Incorreto. O procedimento padrão indica que a bateria deve ser trocada ao atingir 20%.'
    },
    {
        q: 'A troca da bateria será realizada. Qual procedimento é obrigatório?',
        opts: ['Remover rapidamente sem desligar', 'Realizar sozinho para agilizar', 'Utilizar EPIs e apoio adequado', 'Desconectar apenas após remover'],
        correct: 2,
        topic: 'Troca de bateria com EPIs',
        feedback_ok: '✅ Procedimento correto! O uso de EPIs e o apoio adequado são fundamentais na troca da bateria.',
        feedback_nok: '❌ Incorreto. É obrigatório desligar, desconectar cabos e usar EPIs adequados.'
    },
    {
        q: 'O operador está transportando um palete. Qual altura correta da carga?',
        opts: ['Encostada no chão', 'Acima da linha de visão', 'O mais alto possível', '15–20 cm do solo'],
        correct: 3,
        topic: 'Altura da carga no transporte',
        feedback_ok: '✅ Procedimento correto! O deslocamento deve ser sempre feito entre 15 e 20 cm do solo.',
        feedback_nok: '❌ Incorreto. Para evitar acidentes, a carga deve transitar entre 15 e 20 cm do solo.'
    },
    {
        q: 'O operador se aproxima de um cruzamento. O que deve ser feito?',
        opts: ['Acelerar para passar rápido', 'Usar buzina e reduzir velocidade', 'Levantar a carga', 'Ignorar pedestres'],
        correct: 1,
        topic: 'Cruzamentos e pedestres',
        feedback_ok: '✅ Procedimento correto! Reduzir velocidade e emitir alerta sonoro são essenciais.',
        feedback_nok: '❌ Incorreto. É obrigatório reduzir a velocidade e usar a buzina em cruzamentos.'
    },
    {
        q: 'Outro funcionário pede carona no equipamento. Qual a atitude correta?',
        opts: ['Negar e seguir normas de segurança', 'Transportar em baixa velocidade', 'Permitir se for rápido', 'Permitir apenas sem carga'],
        correct: 0,
        topic: 'Transporte de pessoas',
        feedback_ok: '✅ Procedimento correto! A empilhadeira não é veículo de passageiros.',
        feedback_nok: '❌ Incorreto. O equipamento é exclusivo para transporte de cargas. Dar carona é proibido.'
    }
];
const quiz3 = createQuizEngine('q3', q3_questions, 5);
function startQuiz3Intro() { quiz3.start(); }
function verifyAnswer3() { quiz3.verify(); }
function nextQuestion3() { quiz3.next(); }
function resetQuiz3() { quiz3.reset(); }

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */
const urlParams = new URLSearchParams(window.location.search);
let restoreSlide = urlParams.get('restoreslide');
let isLast = urlParams.get('last');

if (restoreSlide !== null) {
    currentSlide = parseInt(restoreSlide, 10);
} else if (isLast === '1') {
    currentSlide = TOTAL - 1;
} else {
    const fromHash = slideIndexFromHash();
    currentSlide = fromHash !== null ? fromHash : 0;
}
if (isNaN(currentSlide) || currentSlide < 0 || currentSlide >= TOTAL) currentSlide = 0;
trackHistory(currentSlide);
cleanSlideNavUrl();
persistSlideHash(currentSlide);

document.querySelectorAll('.slide').forEach((s, i) => {
    if (i === currentSlide) s.classList.add('active');
    else s.classList.remove('active');
});
const pbarInit = document.getElementById('pbar');
if (pbarInit) pbarInit.style.width = (nr11GlobalSlide() / NR11_TOTAL_SLIDES * 100) + '%';

const counterInit = document.getElementById('slide-counter');
if (counterInit) {
    counterInit.textContent = nr11GlobalSlide() + ' / ' + NR11_TOTAL_SLIDES;
    counterInit.style.visibility = 'visible';
}
const btnBackInit = document.getElementById('btn-back');
if (btnBackInit) {
    btnBackInit.disabled = (currentSlide === 0 && !window.MODULE_NAV.prev);
    btnBackInit.style.visibility = (currentSlide === 0 && !window.MODULE_NAV.prev) ? 'hidden' : 'visible';
}
const btnFwdInit = document.getElementById('btn-fwd');
if (btnFwdInit) {
    btnFwdInit.style.visibility = 'visible';
    btnFwdInit.disabled = true;
}

buildDots();
if (document.getElementById('q1-question-panel')) quiz1.render();
if (document.getElementById('q3-question-panel')) quiz3.render();
try { lockAllVideoWraps(); } catch (e) { }
try { syncSlideVideos(currentSlide); } catch (e) { }
updateNextButton();
try { window.updateQuizAudioHelper(); } catch (e) { }

// removed persistence

document.addEventListener('DOMContentLoaded', () => {
    const interactives = document.querySelectorAll('.risk-card, .vplay, .c-badge');
    const savedReqs = _loadReqState();
    interactives.forEach((el, i) => {
        el.classList.add('req-item');
        el.title = 'Clique para confirmar leitura';
        // tag with stable index for persistence
        el.dataset.reqIndex = i;
        // restore
        if (savedReqs && savedReqs.indexOf(i) !== -1) {
            el.classList.add('req-done');
        }
        el.addEventListener('click', function () {
            if (this.classList.contains('req-done')) return;
            this.classList.add('req-done');
            // persist
            try {
                const idx = parseInt(this.dataset.reqIndex);
                const arr = _loadReqState();
                if (arr.indexOf(idx) === -1) arr.push(idx);
                _saveReqState(arr);
            } catch (e) { }
            updateNextButton();
        });
    });

    try { syncSlideVideos(currentSlide); } catch (e) { }

    updateNextButton();
});
// ==========================================
// ESTILOS HUD / TF (legado + quizzes)
// ==========================================
const styleHUD = document.createElement('style');
styleHUD.textContent = `
        .hud-glow-correct {
          box-shadow: 0 0 30px rgba(231, 160, 254, 0.4) !important;
          transform: scale(1.01);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 12px;
        }
        .hud-glow-error {
          box-shadow: 0 0 30px rgba(231, 76, 60, 0.4) !important;
          transform: scale(1.01);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 12px;
        }
        .tf-btn {
          transition: transform 0.1s ease, box-shadow 0.3s ease !important;
        }
        .tf-btn:active {
          transform: scale(0.95) !important;
        }
        .btn-tf-verify {
          background: var(--gold);
          color: var(--black);
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-family: var(--font-h);
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(241, 196, 15, 0.3);
        }
        .btn-tf-verify:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(241, 196, 15, 0.5);
        }
        .btn-tf-verify:active {
          transform: translateY(0);
        }
        .tf-btn.selected-visual {
          transform: scale(0.98);
          border-color: var(--gold) !important;
          box-shadow: 0 0 15px rgba(241, 196, 15, 0.4);
        }
        .hud-anim-enter {
          animation: hudFadeIn 0.4s ease forwards;
        }
        @keyframes hudFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
document.head.appendChild(styleHUD);

function playHUDBeep(type) {
    try {
        if (type === 'correct') {
            playCorrectAnswerSound();
            return;
        }
        if (type === 'incorrect') {
            playWrongAnswerSound();
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!window.hudAudioCtx) window.hudAudioCtx = new AudioContext();
        const ctx = window.hudAudioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'transition') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.0, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'conclusion') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.15);
            osc.frequency.setValueAtTime(659, now + 0.3);
            osc.frequency.setValueAtTime(880, now + 0.45);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.4);
            gain.gain.linearRampToValueAtTime(0.0, now + 0.8);
            osc.start(now);
            osc.stop(now + 0.8);
        }
    } catch (e) { }
}

const q2_questions = [
    {
        q: 'O timer do misturador permite ajustar o tempo de mistura em até 6 minutos.',
        opts: ['Verdadeiro', 'Falso'],
        correct: 0,
        topic: 'Timer do misturador (máx. 6 min)',
        feedback_ok: '✅ Correto! O timer do misturador permite ajustar o ciclo em até 6 minutos.',
        feedback_nok: '❌ Incorreto. O timer do misturador permite ajustar o tempo de mistura em até 6 minutos.'
    },
    {
        q: 'A porta cortina do misturador pode ficar aberta durante o ciclo de mistura.',
        opts: ['Verdadeiro', 'Falso'],
        correct: 1,
        topic: 'Porta cortina fechada no ciclo',
        feedback_ok: '✅ Correto! A porta cortina deve permanecer fechada; o dispositivo de segurança impede o funcionamento com ela aberta.',
        feedback_nok: '❌ Incorreto. A porta cortina não pode ficar aberta durante o ciclo de mistura.'
    },
    {
        q: 'Os canisters ficam na área de enchimento do dosador.',
        opts: ['Verdadeiro', 'Falso'],
        correct: 0,
        topic: 'Área de enchimento dos canisters',
        feedback_ok: '✅ Correto! Os canisters ficam na área de enchimento do dosador.',
        feedback_nok: '❌ Incorreto. Os canisters ficam na área de enchimento do dosador.'
    }
];
const quiz2 = createQuizEngine('q2', q2_questions, 3);
function startQuiz2Intro() { quiz2.start(); }
function verifyAnswer2() { quiz2.verify(); }
function nextQuestion2() { quiz2.next(); }
function resetQuiz2() { quiz2.reset(); }
window.startQuiz2Intro = startQuiz2Intro;
window.verifyAnswer2 = verifyAnswer2;
window.nextQuestion2 = nextQuestion2;
window.resetQuiz2 = resetQuiz2;

/* ════════════════════════════════════════
   ENGINE: CONDUÇÃO SEGURA (módulo 3) — layout igual ao quiz 1
   ════════════════════════════════════════ */
const conducaoData = [
    { text: "Usar celular durante operação", isAllowed: false, explanation: "O uso de celular reduz a atenção do operador e aumenta o risco de acidentes." },
    { text: "Reduzir velocidade em curvas", isAllowed: true, explanation: "Reduzir a velocidade aumenta a estabilidade e evita tombamentos." },
    { text: "Transportar pessoas no equipamento", isAllowed: false, explanation: "O equipamento não foi projetado para transportar passageiros." },
    { text: "Utilizar buzina em cruzamentos", isAllowed: true, explanation: "A buzina ajuda a alertar pedestres e outros operadores." },
    { text: "Circular com carga elevada", isAllowed: false, explanation: "Circular com a carga elevada reduz a estabilidade do equipamento." },
    { text: "Olhar sempre na direção do movimento", isAllowed: true, explanation: "Manter atenção na direção do deslocamento evita colisões." }
];
let currentConducao = 0;
let conducaoAnswered = false;
let conducaoLastCorrect = false;
let selectedConducaoAns = null;

function renderConducaoDots() {
    for (let i = 0; i < conducaoData.length; i++) {
        const d = document.getElementById('conducao-dot' + i);
        if (!d) continue;
        d.className = 'qdot2';
        if (i < currentConducao) d.classList.add('done');
        if (i === currentConducao) d.classList.add('cur');
    }
}

function hideConducaoVerify() {
    const vContainer = document.getElementById('conducao-verify-container');
    if (!vContainer) return;
    vContainer.style.display = 'none';
    vContainer.style.opacity = '0';
    vContainer.style.visibility = 'hidden';
}

function showConducaoVerify() {
    const vContainer = document.getElementById('conducao-verify-container');
    if (!vContainer) return;
    vContainer.style.display = 'block';
    setTimeout(function () {
        vContainer.style.opacity = '1';
        vContainer.style.visibility = 'visible';
    }, 50);
}

function loadConducao(idx) {
    if (idx >= conducaoData.length) return;

    conducaoAnswered = false;
    conducaoLastCorrect = false;
    selectedConducaoAns = null;
    currentConducao = idx;

    const counter = document.getElementById('conducao-counter');
    if (counter) counter.textContent = 'Ação ' + (idx + 1) + ' de ' + conducaoData.length;

    const textElement = document.getElementById('conducao-text');
    if (textElement) textElement.textContent = conducaoData[idx].text;

    const opts = document.getElementById('conducao-options');
    if (opts) {
        opts.innerHTML = '';
        [
            { label: 'Permitido', value: true, letter: 'A' },
            { label: 'Proibido', value: false, letter: 'B' }
        ].forEach(function (opt) {
            const el = document.createElement('div');
            el.className = 'q-opt';
            el.innerHTML = '<div class="opt-l">' + opt.letter + '</div><span>' + opt.label + '</span>';
            el.onclick = function () { answerConducao(opt.value, el); };
            opts.appendChild(el);
        });
    }

    const fb = document.getElementById('conducao-feedback');
    if (fb) { fb.className = 'q-feedback'; fb.textContent = ''; }

    hideConducaoVerify();

    const btnNext = document.getElementById('btn-next-conducao');
    if (btnNext) btnNext.className = 'btn-next-q';

    renderConducaoDots();
    try { window.updateQuizAudioHelper(); } catch (e) { }
    scheduleScrollBtnRefresh();
}

window.answerConducao = function (isAllowBtn, el) {
    if (conducaoAnswered) return;

    playBeep('click');
    selectedConducaoAns = isAllowBtn;

    const allOpts = document.querySelectorAll('#conducao-options .q-opt');
    allOpts.forEach(clearAnswerState);
    if (el) el.classList.add('selected');

    showConducaoVerify();
};

window.verifyConducao = function () {
    if (conducaoAnswered || selectedConducaoAns === null) return;
    conducaoAnswered = true;

    const data = conducaoData[currentConducao];
    const isCorrect = (data.isAllowed === selectedConducaoAns);
    conducaoLastCorrect = isCorrect;
    const isLastConducao = currentConducao === conducaoData.length - 1;

    hideConducaoVerify();

    const allOpts = document.querySelectorAll('#conducao-options .q-opt');
    allOpts.forEach(function (o) {
        clearAnswerState(o);
        o.style.pointerEvents = 'none';
        o.classList.add('answered');
    });

    function setOptIcon(optEl, icon) {
        if (!optEl) return;
        const letter = optEl.querySelector('.opt-l');
        if (letter) letter.textContent = icon;
    }

    const selectedIdx = selectedConducaoAns ? 0 : 1;
    const correctIdx = data.isAllowed ? 0 : 1;

    if (isCorrect) {
        allOpts[selectedIdx].classList.add('correct');
        setOptIcon(allOpts[selectedIdx], '✓');
        playBeep('ok');
    } else {
        allOpts[selectedIdx].classList.add('wrong');
        setOptIcon(allOpts[selectedIdx], '✕');
        if (allOpts[correctIdx]) {
            allOpts[correctIdx].classList.add('correct');
            setOptIcon(allOpts[correctIdx], '✓');
        }
        playBeep('nok');
    }

    allOpts.forEach(function (o) {
        if (!o.classList.contains('correct') && !o.classList.contains('wrong')) {
            o.classList.add('muted');
        }
    });

    const fb = document.getElementById('conducao-feedback');
    if (fb) {
        fb.textContent = data.explanation;
        fb.className = 'q-feedback ' + (isCorrect ? 'ok' : 'nok');
    }

    const btnNext = document.getElementById('btn-next-conducao');
    if (btnNext) {
        if (isLastConducao && isCorrect) {
            btnNext.className = 'btn-next-q';
            const panel = document.getElementById('conducao-question-panel');
            if (panel) panel.classList.add('req-done');
            updateNextButton();
            playHUDBeep('conclusion');
        } else {
            btnNext.className = 'btn-next-q show';
        }
    }

    scheduleScrollBtnRefresh();
};

window.nextConducao = function () {
    if (!conducaoAnswered) return;

    if (!conducaoLastCorrect) {
        loadConducao(currentConducao);
        return;
    }

    if (currentConducao >= conducaoData.length - 1) {
        const btnNext = document.getElementById('btn-next-conducao');
        if (btnNext) btnNext.className = 'btn-next-q';
        const panel = document.getElementById('conducao-question-panel');
        if (panel) panel.classList.add('req-done');
        updateNextButton();
        return;
    }

    playBeep('click');
    currentConducao++;
    loadConducao(currentConducao);
};

window.addEventListener('DOMContentLoaded', function () {
    const qPanel = document.getElementById('conducao-question-panel');
    if (qPanel) qPanel.style.display = 'block';
    loadConducao(0);
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    const introPanel = document.getElementById('q2-intro-panel');
    if (introPanel) introPanel.style.display = 'flex';

    const qPanel = document.getElementById('q2-question-panel');
    if (qPanel) qPanel.style.display = 'none';
});

window.checkMod4Item = function (el) {
    if (el.classList.contains('req-done')) return;
    if (window.soundClick) window.soundClick.play();
    el.classList.add('req-done');
    el.classList.add('active');

    const reqs = el.closest('.m4-check-list').querySelectorAll('.req-item');
    const done = el.closest('.m4-check-list').querySelectorAll('.req-done').length;
    const fill = el.closest('.slide').querySelector('.m4-progress-fill');
    const text = el.closest('.slide').querySelector('.m4-progress-top span:last-child');

    if (fill) fill.style.width = ((done / reqs.length) * 100) + '%';
    if (text) text.textContent = done + '/' + reqs.length + ' ITENS';

    if (done === reqs.length) {
        if (window.soundCorrect) setTimeout(() => window.soundCorrect.play(), 200);
        const comp = el.closest('.slide').querySelector('.m4-completion');
        if (comp) comp.style.display = 'block';

        const contentArea = el.closest('.slide').querySelector('.content-area');
        if (contentArea) {
            contentArea.style.justifyContent = 'flex-start';
        }
    }
    updateNextButton();
}

const q4_questions = [
    {
        q: 'Quais produtos são proibidos na limpeza do dosador?',
        opts: [
            'Pano seco',
            'Água e solventes como álcool, aguarrás e thinner',
            'Solução suave',
            'Pano úmido'
        ],
        correct: 1,
        topic: 'Produtos proibidos na limpeza do dosador',
        feedback_ok: '✅ Correto! Nunca use água ou solventes inflamáveis (álcool, aguarrás, thinner) na limpeza do dosador.',
        feedback_nok: '❌ Incorreto. São proibidos água e solventes como álcool, aguarrás e thinner na limpeza do dosador.'
    },
    {
        q: 'O que fazer se um corante for derramado dentro do dosador?',
        opts: [
            'Limpar com pano imediatamente',
            'Desligar e chamar técnico autorizado',
            'Continuar operando',
            'Usar água para diluir'
        ],
        correct: 1,
        topic: 'Corante derramado dentro do dosador',
        feedback_ok: '✅ Correto! Não tente limpar por conta própria: desligue a máquina e chame o serviço técnico autorizado.',
        feedback_nok: '❌ Incorreto. Em caso de corante dentro do dosador, desligue e chame o técnico autorizado — não limpe internamente sozinho.'
    },
    {
        q: 'Qual o peso máximo permitido para movimentar recipientes?',
        opts: [
            '10 kg',
            '15 kg',
            '25 kg',
            '40 kg'
        ],
        correct: 2,
        topic: 'Peso máximo de recipientes',
        feedback_ok: '✅ Correto! O limite máximo para movimentar recipientes é de 25 kg.',
        feedback_nok: '❌ Incorreto. O peso máximo permitido para movimentar recipientes é 25 kg.'
    }
];
const quiz4 = createQuizEngine('q4', q4_questions, 3);
if (document.getElementById('q4-question-panel')) quiz4.render();
function startQuiz4Intro() { quiz4.start(); }
function verifyAnswer4() { quiz4.verify(); }
function nextQuestion4() { quiz4.next(); }
function resetQuiz4() { quiz4.reset(); }

const q5_questions = [
    {
        q: '<img src="assets/imgur/YZ03elm.png" alt="Corredor obstruído"><span class="q5-topic">Corredor Obstruído</span><p class="q5-desc">O operador encontrou um corredor parcialmente bloqueado durante a movimentação da carga.</p><strong class="q5-ask">Qual deve ser o procedimento correto?</strong>',
        opts: ['Continuar normalmente', 'Sinalizar e liberar o corredor antes da operação', 'Passar rapidamente pelo bloqueio', 'Ignorar o obstáculo'],
        correct: 1,
        topic: 'Corredor Obstruído',
        feedback_ok: '✅ Correto! O corredor deve ser sinalizado e liberado antes de qualquer movimentação.',
        feedback_nok: '❌ Incorreto. É necessário sinalizar e liberar o corredor antes da operação.'
    },
    {
        q: '<img src="assets/imgur/jxIK2Rh.png" alt="Carga elevada"><span class="q5-topic">Carga Elevada</span><p class="q5-desc">A carga está sendo transportada acima da altura recomendada.</p><strong class="q5-ask">Qual é o principal risco desta operação?</strong>',
        opts: ['Melhor visibilidade', 'Maior estabilidade', 'Maior velocidade', 'Comprometimento da visibilidade e risco de colisão'],
        correct: 3,
        topic: 'Carga Elevada',
        feedback_ok: '✅ Correto! Transportar cargas elevadas compromete a visibilidade e aumenta gravemente os riscos de colisão.',
        feedback_nok: '❌ Incorreto. O principal risco é o comprometimento da visibilidade e a colisão.'
    },
    {
        q: '<img src="assets/imgur/EwLaKkj.png" alt="EPI ausente"><span class="q5-topic">EPI Ausente</span><p class="q5-desc">O operador iniciou a movimentação sem todos os EPIs obrigatórios.</p><strong class="q5-ask">Qual procedimento está correto?</strong>',
        opts: ['Interromper a operação até regularizar os EPIs', 'Operar apenas em áreas vazias', 'Continuar se a operação for rápida', 'Solicitar ajuda apenas em caso de risco'],
        correct: 0,
        topic: 'EPI Ausente',
        feedback_ok: '✅ Correto! Nenhuma operação deve prosseguir sem os EPIs regularizados e em conformidade.',
        feedback_nok: '❌ Incorreto. O procedimento correto é interromper a operação até regularizar os EPIs.'
    },
    {
        q: '<img src="assets/imgur/V9SVveG.png" alt="Emergência operacional"><span class="q5-topic">Emergência Operacional</span><p class="q5-desc">Foi identificado um princípio de incêndio próximo à área de movimentação.</p><strong class="q5-ask">Qual deve ser a primeira ação?</strong>',
        opts: ['Continuar a operação', 'Improvisar sozinho o combate', 'Parar a operação e afastar as pessoas', 'Mover a carga rapidamente'],
        correct: 2,
        topic: 'Emergência Operacional',
        feedback_ok: '✅ Correto! Parar a operação imediatamente e priorizar a vida afastando as pessoas é essencial.',
        feedback_nok: '❌ Incorreto. A primeira ação deve ser parar a operação e afastar as pessoas.'
    },
    {
        q: '<img src="assets/imgur/mAXUjMF.png" alt="Distanciamento seguro"><span class="q5-topic">Distanciamento Seguro</span><p class="q5-desc">Durante a movimentação, o operador reduziu excessivamente a distância da estrutura lateral.</p><strong class="q5-ask">Qual distância mínima deve ser mantida?</strong>',
        opts: ['20 cm', '50 cm', '30 cm', 'Não existe distância mínima'],
        correct: 1,
        topic: 'Distanciamento Seguro',
        feedback_ok: '✅ Correto! Deve-se manter no mínimo 50 cm de distância segura das estruturas.',
        feedback_nok: '❌ Incorreto. A distância mínima que deve ser mantida é de 50 cm.'
    }
];
const quiz5 = createQuizEngine('q5', q5_questions, 5);
if (document.getElementById('q5-question-panel')) quiz5.render();
function startQuiz5Intro() { quiz5.start(); }
function verifyAnswer5() { quiz5.verify(); }
function nextQuestion5() { quiz5.next(); }
function resetQuiz5() { quiz5.reset(); }

const q6_questions = [
    {
        q: '<img src="assets/imgur/CwVijDg.png" alt="Verificação do Trajeto"><span class="q6-topic">Verificação do Trajeto</span><p class="q6-desc">O operador irá iniciar a movimentação sem verificar o corredor operacional.</p><strong class="q6-ask">Qual deve ser a decisão correta?</strong>',
        correct: 1,
        topic: 'Verificação do Trajeto',
        feedback: 'O trajeto deve ser verificado antes da operação.'
    },
    {
        q: '<img src="assets/imgur/olIIX5d.png" alt="Altura da Carga"><span class="q6-topic">Altura da Carga</span><p class="q6-desc">A carga está posicionada corretamente para movimentação segura.</p><strong class="q6-ask">Qual deve ser a decisão correta?</strong>',
        correct: 0,
        topic: 'Altura da Carga',
        feedback: 'A altura da carga está dentro do padrão seguro.'
    },
    {
        q: '<img src="assets/imgur/ywjw7Y8.png" alt="Distração Operacional"><span class="q6-topic">Distração Operacional</span><p class="q6-desc">O operador utiliza celular durante a movimentação da carga.</p><strong class="q6-ask">Qual deve ser a decisão correta?</strong>',
        correct: 1,
        topic: 'Distração Operacional',
        feedback: 'O foco operacional deve ser mantido durante toda a operação.'
    },
    {
        q: '<img src="assets/imgur/YQuknH6.png" alt="Proteção Operacional"><span class="q6-topic">Proteção Operacional</span><p class="q6-desc">O operador iniciou a operação utilizando os EPIs obrigatórios.</p><strong class="q6-ask">Qual deve ser a decisão correta?</strong>',
        correct: 0,
        topic: 'Proteção Operacional',
        feedback: 'Os equipamentos de proteção estão corretos.'
    },
    {
        q: '<img src="assets/imgur/DuAmERU.png" alt="Finalização Segura"><span class="q6-topic">Finalização Segura</span><p class="q6-desc">O equipamento foi estacionado corretamente ao final da operação.</p><strong class="q6-ask">Qual deve ser a decisão correta?</strong>',
        correct: 0,
        topic: 'Finalização Segura',
        feedback: 'A operação foi encerrada corretamente.'
    }
];



function toggleQuiz6Music() {
    const m = document.getElementById('q6-bg-music');
    const btn = document.getElementById('q6-btn-music-toggle');
    if (!m || !btn) return;
    m.muted = !m.muted;
    if (m.muted) {
        btn.innerHTML = '🔇 MUSIC OFF';
        btn.classList.add('is-muted');
        btn.classList.remove('is-on');
    } else {
        btn.innerHTML = '🔊 MUSIC ON';
        btn.classList.remove('is-muted');
        btn.classList.add('is-on');
    }
}

function playQuiz6Audio(type) {
    try {
        if (type === 'correct') {
            playCorrectAnswerSound();
            return;
        }
        if (type === 'incorrect') {
            playWrongAnswerSound();
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        if (type === 'start') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(50, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 1);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 1);
        } else if (type === 'click') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'transition') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.linearRampToValueAtTime(2000, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'end') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.5);
        }
    } catch (e) { }
}

function createQuiz6Engine(questions) {
    let idx = 0, answered = false, score = 0, selectedOptIdx = -1;
    let wrongTopics = [];
    const MIN_CORRECT = 3;

    function setQuiz6MusicVisible(visible) {
        const musicBtn = document.getElementById('q6-btn-music-toggle');
        if (musicBtn) musicBtn.hidden = !visible;
    }

    function renderDots() {
        const dotsContainer = document.querySelector('#q6-question-panel .q-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < questions.length; i++) {
            const d = document.createElement('div');
            d.className = 'qdot2' + (i === idx ? ' cur' : '') + (i < idx ? ' done' : '');
            dotsContainer.appendChild(d);
        }
    }

    function uniqueTopics(list) {
        const seen = {};
        const out = [];
        list.forEach(function (t) {
            if (!t || seen[t]) return;
            seen[t] = true;
            out.push(t);
        });
        return out;
    }

    function attachExpand(txt) {
        if (!txt) return;
        const img = txt.querySelector('img');
        if (!img || txt.querySelector('.q6-img-expand')) return;
        let wrap = img.closest('.q6-img-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'q6-img-wrap';
            img.parentNode.insertBefore(wrap, img);
            wrap.appendChild(img);
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'q6-img-expand';
        btn.setAttribute('aria-label', 'Ampliar imagem');
        btn.title = 'Ampliar imagem';
        btn.textContent = '🔍';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof openImageModal === 'function') openImageModal(img.getAttribute('src') || img.src);
        });
        wrap.appendChild(btn);
    }

    function start() {
        const introPanel = document.getElementById('q6-intro-panel');
        const qPanel = document.getElementById('q6-question-panel');
        if (introPanel) introPanel.style.display = 'none';
        if (qPanel) {
            qPanel.style.display = 'block';
            qPanel.style.opacity = '0';
            setTimeout(function () { qPanel.style.opacity = '1'; }, 50);
        }
        setQuiz6MusicVisible(true);
        playQuiz6Audio('start');
        const m = document.getElementById('q6-bg-music');
        if (m) {
            m.volume = 0.15;
            m.play().catch(function () { });
        }
        render();
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function render() {
        const qPanel = document.getElementById('q6-question-panel');
        if (qPanel) qPanel.classList.remove('q-result-anim');

        const q = questions[idx];

        const counter = document.getElementById('q6-counter');
        if (counter) counter.textContent = 'Pergunta ' + (idx + 1) + ' de ' + questions.length;

        const txt = document.getElementById('q6-text');
        if (txt) {
            txt.innerHTML = q.q;
            attachExpand(txt);
        }

        const opts = document.getElementById('q6-options');
        if (opts) {
            opts.innerHTML = '';

            const btnA = document.createElement('div');
            btnA.className = 'q-opt opt-approve';
            btnA.innerHTML = '<div class="opt-l">✓</div><span>Liberar</span>';
            btnA.onclick = function () { selectAnswer(0, btnA); };
            opts.appendChild(btnA);

            const btnR = document.createElement('div');
            btnR.className = 'q-opt opt-reject';
            btnR.innerHTML = '<div class="opt-l">✕</div><span>Não Liberar</span>';
            btnR.onclick = function () { selectAnswer(1, btnR); };
            opts.appendChild(btnR);
        }

        const fb = document.getElementById('q6-feedback');
        if (fb) { fb.className = 'q-feedback'; fb.textContent = ''; }

        const vCont = document.getElementById('q6-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }

        const btn = document.getElementById('btn-next-q6');
        if (btn) btn.className = 'btn-next-q';
        answered = false;
        selectedOptIdx = -1;
        renderDots();
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function selectAnswer(i, el) {
        if (answered) return;
        selectedOptIdx = i;
        const allOpts = document.querySelectorAll('#q6-options .q-opt');
        allOpts.forEach(clearAnswerState);
        el.classList.add('selected');
        playQuiz6Audio('click');

        const vCont = document.getElementById('q6-verify-container');
        if (vCont) {
            vCont.style.display = 'block';
            setTimeout(function () {
                vCont.style.opacity = '1';
                vCont.style.visibility = 'visible';
            }, 50);
        }
    }

    function verify() {
        if (answered || selectedOptIdx === -1) return;
        answered = true;

        const vCont = document.getElementById('q6-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }

        const q = questions[idx];
        const allOpts = document.querySelectorAll('#q6-options .q-opt');
        allOpts.forEach(function (o) {
            clearAnswerState(o);
            o.style.pointerEvents = 'none';
            o.classList.add('answered');
            o.classList.add('muted');
        });

        const fb = document.getElementById('q6-feedback');
        const isCorrect = selectedOptIdx === q.correct;

        if (allOpts[q.correct]) {
            allOpts[q.correct].classList.remove('muted');
            allOpts[q.correct].classList.add('correct');
        }
        if (!isCorrect && allOpts[selectedOptIdx]) {
            allOpts[selectedOptIdx].classList.remove('muted');
            allOpts[selectedOptIdx].classList.add('wrong');
        }

        if (isCorrect) {
            if (fb) {
                fb.innerHTML = '✅ Correto! ' + q.feedback;
                fb.className = 'q-feedback ok';
            }
            score++;
            playQuiz6Audio('correct');
        } else {
            if (fb) {
                fb.innerHTML = '❌ Incorreto. ' + q.feedback;
                fb.className = 'q-feedback nok';
            }
            if (q.topic) wrongTopics.push(q.topic);
            else {
                var fallback6 = String(q.q || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (fallback6) wrongTopics.push(fallback6.length > 90 ? fallback6.slice(0, 87) + '…' : fallback6);
            }
            playQuiz6Audio('incorrect');
        }

        const btn = document.getElementById('btn-next-q6');
        if (btn) btn.className = 'btn-next-q show';

        setTimeout(function () {
            const target = document.getElementById('q6-feedback');
            if (target && window.matchMedia('(max-width: 768px)').matches) {
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 80);
        scheduleScrollBtnRefresh();
    }

    function next() {
        idx++;
        if (idx < questions.length) {
            playQuiz6Audio('transition');
            render();
        } else {
            showResult();
        }
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function showResult() {
        playQuiz6Audio('end');
        const m = document.getElementById('q6-bg-music');
        if (m) m.pause();

        setQuiz6MusicVisible(false);
        const qPanel = document.getElementById('q6-question-panel');
        if (qPanel) qPanel.style.display = 'none';

        const rPanel = document.getElementById('q6-result-panel');
        const approved = score >= MIN_CORRECT;

        if (rPanel) {
            rPanel.style.display = 'block';
            rPanel.classList.add('is-visible');
            rPanel.classList.toggle('is-approved', approved);
            rPanel.classList.toggle('is-failed', !approved);
            rPanel.classList.remove('q-result-anim');
            void rPanel.offsetWidth;
            rPanel.classList.add('q-result-anim');
        }

        const status = document.getElementById('q6-status');
        if (status) {
            status.textContent = approved ? 'Desafio Concluído!' : 'Desafio não concluído';
            status.className = 'quiz-result-title r-status ' + (approved ? 'ap' : 'ref');
        }

        const sub = document.getElementById('q6-sub');
        if (sub) {
            sub.textContent = approved
                ? 'Você acertou ' + score + ' de ' + questions.length + ' questões. Parabéns! Pode avançar para a próxima etapa.'
                : 'Você acertou ' + score + ' de ' + questions.length + ' questões. É necessário acertar pelo menos ' + MIN_CORRECT + ' questões. Estude e tente novamente.';
        }

        const iconEl = document.getElementById('q6-result-icon');
        if (iconEl) iconEl.textContent = approved ? '🏅' : '📚';

        const retryBtn = document.getElementById('q6-retry-btn');
        if (retryBtn) {
            retryBtn.textContent = approved ? 'REVISAR DESAFIO' : 'JOGAR NOVAMENTE';
            retryBtn.style.display = approved ? 'none' : 'inline-flex';
        }

        const reviewEl = document.getElementById('q6-review');
        if (reviewEl) {
            const topics = uniqueTopics(wrongTopics);
            if (!approved) {
                reviewEl.hidden = false;
                reviewEl.innerHTML = '<strong>Revise estes temas:</strong><ul>' +
                    (topics.length ? topics : ['Revise as questões do desafio e tente novamente.']).map(function (t) { return '<li>' + t + '</li>'; }).join('') +
                    '</ul>';
            } else {
                reviewEl.hidden = true;
                reviewEl.innerHTML = '';
            }
        }

        updateNextButton();
        try { window.updateQuizAudioHelper(); } catch (e) { }
        scheduleScrollBtnRefresh();
    }

    function reset() {
        idx = 0; score = 0; answered = false; selectedOptIdx = -1;
        wrongTopics = [];
        const introPanel = document.getElementById('q6-intro-panel');
        const qPanel = document.getElementById('q6-question-panel');
        const rPanel = document.getElementById('q6-result-panel');

        if (introPanel) introPanel.style.display = 'flex';
        if (qPanel) {
            qPanel.style.display = 'none';
            qPanel.style.opacity = '';
        }
        if (rPanel) {
            rPanel.style.display = 'none';
            rPanel.classList.remove('is-approved', 'is-failed', 'q-result-anim', 'is-visible');
        }
        const m = document.getElementById('q6-bg-music');
        if (m) { m.pause(); m.currentTime = 0; }
        setQuiz6MusicVisible(false);

        const reviewEl = document.getElementById('q6-review');
        if (reviewEl) { reviewEl.hidden = true; reviewEl.innerHTML = ''; }

        render();
        updateNextButton();
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    return { start, render, verify, next, reset };
}

const quiz6 = createQuiz6Engine(q6_questions);
if (document.getElementById('q6-question-panel')) quiz6.render();
function startQuiz6Intro() { quiz6.start(); }
function verifyAnswer6() { quiz6.verify(); }
function nextQuestion6() { quiz6.next(); }
function resetQuiz6() { quiz6.reset(); }



/* === Override Próximo button label/behavior at module end === */
(function () {
    const btnFwd = document.getElementById('btn-fwd');
    if (!btnFwd) return;

    // Normalize button structure: <span class="fwd-label">TEXT</span> + <svg/>
    (function normalize() {
        const svg = btnFwd.querySelector('svg');
        let label = btnFwd.querySelector('.fwd-label');
        if (!label) {
            label = document.createElement('span');
            label.className = 'fwd-label';
            label.textContent = 'PRÓXIMO';
            btnFwd.innerHTML = '';
            btnFwd.appendChild(label);
            if (svg) btnFwd.appendChild(svg);
        }
    })();

    try { updateNextButton(); } catch (e) { }
})();



/* ════════════════════════════════════════
   GLOBAL CLICK SOUND for cards (sem duplicar)
   Toca o som do flip card SOMENTE em cards que
   não tem som próprio. Detecta pelo onclick handler.
   ════════════════════════════════════════ */
(function () {
    const cardSelectors = [
        '.flip-card',
        '.comp-card-modern',
        '.compare-card',
        '.hub-spoke',
        '.icon-card',
        '.def-banner',
        '.check-item',
        '.stat-pill',
        '.risk-card',
        '.sum-item',
        '.rule-card',
        '.rampas-card',
        '.mod5-card',
        '.hud-panel-item',
        '.passo-card',
        '.c-badge',
        '.epi-img-wrapper',
        '.epi-card'
    ];
    const soundPatterns = /playBeep|playHUDBeep|playTechClick|playQuiz6Audio|soundClick|playClick|clickAudio|new Audio/;

    function hasOwnSound(el) {
        if (!el) return false;
        // Walk up the tree checking onclick attributes
        let cur = el;
        while (cur && cur !== document.body) {
            const oc = cur.getAttribute && cur.getAttribute('onclick');
            if (oc && soundPatterns.test(oc)) return true;
            cur = cur.parentElement;
        }
        return false;
    }

    document.addEventListener('click', function (ev) {
        const target = ev.target.closest(cardSelectors.join(','));
        if (!target) return;
        if (hasOwnSound(target)) return;
        try { playBeep('flip'); } catch (e) { }
    }, true);
})();


/* ════════════════════════════════════════
   ACESSIBILIDADE — Ouvir (áudio da página)
   Injetado automaticamente em todas as páginas
   ════════════════════════════════════════ */
(function () {
    if (window.__a11yInjected) return;
    window.__a11yInjected = true;

    function init() {
        if (document.getElementById('a11y-bar') || document.getElementById('top-controls')) return;

        // ── Top controls (estilo NR 06): Música + Transcrição + Simulação ──
        const topControls = document.createElement('div');
        topControls.id = 'top-controls';

        // Áudio de fundo (mesma faixa da NR 06)
        let bgMusicEl = document.getElementById('bg-music');
        if (!bgMusicEl) {
            bgMusicEl = document.createElement('audio');
            bgMusicEl.id = 'bg-music';
            bgMusicEl.src = 'musica/musica_foco.mp3';
            bgMusicEl.loop = true;
            bgMusicEl.preload = 'metadata';
            bgMusicEl.setAttribute('aria-hidden', 'true');
            document.body.appendChild(bgMusicEl);
        }
        bgMusicEl.volume = 0.35;
        window.bgMusic = bgMusicEl;
        if (typeof window.musicEnabled === 'undefined') window.musicEnabled = false;

        const musicItem = document.createElement('div');
        musicItem.className = 'top-control-item';
        musicItem.id = 'music-control-item';
        musicItem.innerHTML = `
            <button type="button" id="btn-music" class="btn-music-toggle" title="Alternar Música"
                aria-label="Ativar música de fundo">
                <span id="music-icon-container">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 5L9.91 7.09 12 9.18V5z"/>
                    </svg>
                </span>
                <span class="control-btn-text music-text">Música: OFF</span>
            </button>
            <span class="top-control-label">Música</span>
        `;
        topControls.appendChild(musicItem);

        const MUSIC_ICON_ON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V5L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        const MUSIC_ICON_OFF = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 5L9.91 7.09 12 9.18V5z"/></svg>';

        function syncMusicButtonUI() {
            const btnMusic = document.getElementById('btn-music');
            const iconContainer = document.getElementById('music-icon-container');
            const musicText = btnMusic && btnMusic.querySelector('.music-text');
            if (!btnMusic) return;
            const on = !!window.musicEnabled;
            btnMusic.classList.toggle('active', on);
            if (iconContainer) iconContainer.innerHTML = on ? MUSIC_ICON_ON : MUSIC_ICON_OFF;
            if (musicText) musicText.textContent = on ? 'Música: ON' : 'Música: OFF';
            btnMusic.setAttribute('aria-label', on ? 'Desativar música de fundo' : 'Ativar música de fundo');
        }

        function toggleMusic() {
            const bgMusic = document.getElementById('bg-music') || window.bgMusic;
            const btnMusic = document.getElementById('btn-music');
            if (!bgMusic || !btnMusic) return;

            if (window.musicEnabled) {
                window.musicEnabled = false;
                bgMusic.pause();
            } else {
                window.musicEnabled = true;
                bgMusic.play().catch(function (e) { console.log('Music play error:', e); });
            }
            try { sessionStorage.setItem('nr12-musicEnabled', window.musicEnabled ? '1' : '0'); } catch (e) { }
            syncMusicButtonUI();
        }
        window.toggleMusic = toggleMusic;

        try {
            window.musicEnabled = sessionStorage.getItem('nr12-musicEnabled') === '1';
        } catch (e) {
            window.musicEnabled = false;
        }
        musicItem.querySelector('#btn-music').addEventListener('click', toggleMusic);
        syncMusicButtonUI();
        if (window.musicEnabled) {
            bgMusicEl.play().catch(function () { /* autoplay bloqueado até interação */ });
        }

        const a11yItem = document.createElement('div');
        a11yItem.className = 'top-control-item';
        a11yItem.id = 'a11y-bar';
        a11yItem.setAttribute('role', 'toolbar');
        a11yItem.setAttribute('aria-label', 'Ferramentas de acessibilidade');
        a11yItem.innerHTML = `
            <button type="button" id="btn-accessibility" class="btn-accessibility-toggle" aria-pressed="false"
                title="Transcrição em áudio" aria-label="Ouvir transcrição em áudio do slide">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm7 9a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11z"/>
                </svg>
                <span class="control-btn-text a11y-text">Transcrição</span>
            </button>
            <span class="top-control-label">Transcrição</span>
            <div class="audio-helper">Reproduza o áudio em cada nova pergunta.</div>
        `;
        topControls.appendChild(a11yItem);

        // Envolve o botão de simulação existente (mantém regra qa1010 / demoMode)
        const existingDemo = document.getElementById('btn-demo');
        if (existingDemo) {
            const simItem = document.createElement('div');
            simItem.className = 'top-control-item';
            simItem.id = 'sim-control-item';

            existingDemo.classList.add('btn-simulation-toggle');
            existingDemo.removeAttribute('style');
            existingDemo.removeAttribute('onmouseover');
            existingDemo.removeAttribute('onmouseout');
            existingDemo.type = 'button';
            existingDemo.title = 'Modo simulação — avançar sem concluir vídeos, jogos ou quizzes';
            existingDemo.setAttribute('aria-pressed', 'false');
            existingDemo.setAttribute('aria-label', 'Ativar modo simulação');
            existingDemo.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.76-.5 2.54l2.6 1.53c.63-1.24 1-2.65 1-4.15 0-5.16-3.99-9.41-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                </svg>
                <span class="control-btn-text simulation-text">Simulação: OFF</span>
            `;

            simItem.appendChild(existingDemo);
            const simLabel = document.createElement('span');
            simLabel.className = 'top-control-label';
            simLabel.textContent = 'Simulação';
            simItem.appendChild(simLabel);
            topControls.appendChild(simItem);
        }

        document.body.appendChild(topControls);

        // ── Posiciona abaixo da logo (igual NR 06) ──
        function positionA11yBar() {
            const logo = document.getElementById('logo');
            if (!logo) return;
            const r = logo.getBoundingClientRect();
            const gapBelow = 8;
            const topPx = Math.max(48, Math.round(r.bottom + gapBelow));
            const rightPx = Math.max(8, Math.round(window.innerWidth - r.right));
            topControls.style.top = topPx + 'px';
            topControls.style.right = rightPx + 'px';
            topControls.style.left = 'auto';
        }
        window.positionA11yBar = positionA11yBar;
        positionA11yBar();
        window.addEventListener('resize', positionA11yBar);
        window.addEventListener('load', positionA11yBar);
        const logoEl = document.getElementById('logo');
        if (logoEl) {
            const logoImg = logoEl.querySelector('img');
            if (logoImg) {
                if (logoImg.complete) positionA11yBar();
                else logoImg.addEventListener('load', positionA11yBar);
            }
        }

        // ── OUVIR (ÁUDIO LOCAL) — mesma regra de áudio ──
        const btnA11y = document.getElementById('btn-accessibility');
        const a11yText = a11yItem.querySelector('.a11y-text');
        let currentAudio = null;

        function stopSpeak() {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            if (btnA11y) {
                btnA11y.classList.remove('active', 'is-active');
                btnA11y.setAttribute('aria-pressed', 'false');
                btnA11y.setAttribute('aria-label', 'Ouvir transcrição em áudio do slide');
            }
            if (a11yText) a11yText.textContent = 'Transcrição';
        }

        const AUDIO_DIR = 'audios-novos';
        function resolveAudioFile(pageNum) {
            const fallback = `${AUDIO_DIR}/pagina-${pageNum}.mp3`;
            try {
                if (typeof AUDIO_DATA === 'undefined' || !AUDIO_DATA.MULTI_STATE) return fallback;

                const activeSlide = document.querySelector('.slide.active');
                if (!activeSlide || !activeSlide.id) return fallback;

                const cfg = AUDIO_DATA.MULTI_STATE[activeSlide.id];
                if (!cfg) return fallback;

                const isVisible = (sel) => {
                    if (!sel) return false;
                    const el = activeSlide.querySelector(sel) || document.querySelector(sel);
                    if (!el) return false;
                    const cs = window.getComputedStyle(el);
                    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
                    return el.offsetParent !== null || el.getClientRects().length > 0;
                };

                if (cfg.panels && cfg.panels.result && isVisible(cfg.panels.result)) {
                    return `${AUDIO_DIR}/pagina-${pageNum}-result.mp3`;
                }
                if (cfg.panels && cfg.panels.intro && isVisible(cfg.panels.intro)) {
                    return `${AUDIO_DIR}/pagina-${pageNum}-intro.mp3`;
                }
                if (cfg.panels && cfg.panels.question && isVisible(cfg.panels.question)) {
                    const counter = activeSlide.querySelector(cfg.counterSelector) ||
                                    document.querySelector(cfg.counterSelector);
                    let qNum = 1;
                    if (counter) {
                        const pat = cfg.counterPattern || /(\d+)/;
                        const m = (counter.textContent || '').match(pat);
                        if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                    }
                    return `${AUDIO_DIR}/pagina-${pageNum}-q${qNum}.mp3`;
                }
            } catch (e) {
                console.warn('resolveAudioFile falhou, usando fallback:', e);
            }
            return fallback;
        }

        async function startSpeak() {
            if (btnA11y) {
                btnA11y.classList.add('active', 'is-active');
                btnA11y.setAttribute('aria-pressed', 'true');
                btnA11y.setAttribute('aria-label', 'Parar transcrição em áudio');
            }
            if (a11yText) a11yText.textContent = 'Lendo...';

            const pageNum = nr11GlobalSlide();
            const audioSrc = resolveAudioFile(pageNum);

            try {
                currentAudio = new Audio(audioSrc);

                const wasPlayingMusic = window.musicEnabled && window.bgMusic && !window.bgMusic.paused;
                if (wasPlayingMusic) window.bgMusic.pause();

                await currentAudio.play();

                currentAudio.onended = () => {
                    stopSpeak();
                    if (window.musicEnabled && window.bgMusic) window.bgMusic.play().catch(() => { });
                };

                currentAudio.onerror = () => {
                    console.error('Áudio local não encontrado: ' + audioSrc);
                    stopSpeak();
                };
            } catch (err) {
                console.error('Erro ao iniciar áudio:', err);
                stopSpeak();
            }
        }

        if (btnA11y) {
            btnA11y.addEventListener('click', function (e) {
                e.stopPropagation();
                if (btnA11y.classList.contains('active')) {
                    stopSpeak();
                } else {
                    startSpeak();
                }
                window.updateQuizAudioHelper();
            });
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopSpeak();
        });
        window.addEventListener('beforeunload', stopSpeak);

        if (typeof window.goTo === 'function' && !window.goTo.__a11yHooked) {
            const origGoTo = window.goTo;
            window.goTo = function () {
                stopSpeak();
                const result = origGoTo.apply(this, arguments);
                window.updateQuizAudioHelper();
                return result;
            };
            window.goTo.__a11yHooked = true;
        }

        window.updateQuizAudioHelper();
        ['q1-question-panel', 'q2-question-panel', 'conducao-question-panel', 'q3-question-panel', 'q4-question-panel', 'q5-question-panel', 'q6-question-panel'].forEach(function (id) {
            const panel = document.getElementById(id);
            if (panel) {
                new MutationObserver(window.updateQuizAudioHelper).observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
            }
        });

        if (typeof applyDemoModeUI === 'function') applyDemoModeUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


/* ════════════════════════════════════════
   MOBILE PERF — lazy load em imagens internas dos slides
   ════════════════════════════════════════ */
(function () {
    function shouldSkipLazy(img) {
        if (img.closest('.s1-hero-img, #logo, #a11y-bar, #top-controls, #nav, #a11y-launcher, .a11y-btn')) return true;
        if (img.closest('#s-mod6-comp-preventiva')) return true;
        if (img.closest('#s-mod6-mensagem-final')) return true;
        if (img.closest('#s-quiz6')) return true;
        if (img.id === 'modalImg') return true;
        return false;
    }

    function applySlideImageLazyLoading() {
        document.querySelectorAll('.slide img').forEach(function (img) {
            if (shouldSkipLazy(img)) return;
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySlideImageLazyLoading);
    } else {
        applySlideImageLazyLoading();
    }
})();
/* ════════════════════════════════════════
   TUTORIAL OBRIGATÓRIO — primeira tela
   ════════════════════════════════════════ */
(function () {
    if (window.__tutorialInjected) return;
    window.__tutorialInjected = true;

    function isIndexPage() {
        return !!(window.MODULE_NAV && window.MODULE_NAV.id === 'index');
    }

    function addReplayButton() {
        if (document.querySelector('.s1-secondary-actions') || document.querySelector('#s1 .tutorial-replay')) return;
        const startBtn = document.querySelector('#s1 .btn-start');
        if (!startBtn) return;

        const row = document.createElement('div');
        row.className = 's1-secondary-actions';

        const replay = document.createElement('button');
        replay.type = 'button';
        replay.className = 'btn-tutorial tutorial-replay';
        replay.innerHTML = '▶ Ver tutorial';
        replay.onclick = function () {
            const staticModal = document.getElementById('tutorialModal');
            if (staticModal) staticModal.classList.add('active');
        };
        row.appendChild(replay);

        startBtn.insertAdjacentElement('afterend', row);
    }

    function init() {
        if (!isIndexPage()) return;
        addReplayButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDemoModeUI);
} else {
    applyDemoModeUI();
}

/* Preview: marca módulos travados no sumário */
(function applySumarioPreview() {
    function paint() {
        var items = document.querySelectorAll('#s-sumario .sum-item[data-module]');
        if (!items.length) return;
        items.forEach(function (el) {
            var n = Number(el.getAttribute('data-module'));
            var locked = NR12_PREVIEW_ACTIVE && !nr12IsModuleUnlocked(n);
            el.classList.toggle('sum-item--soon', locked);
            if (locked) el.setAttribute('aria-disabled', 'true');
            else el.removeAttribute('aria-disabled');
            var num = el.querySelector('.sum-num-big');
            if (!num) return;
            if (!num.dataset.label) num.dataset.label = num.textContent.trim();
            num.textContent = locked ? 'Em breve' : num.dataset.label;
            var icon = el.querySelector('.sum-icon');
            if (icon) {
                if (!icon.dataset.icon) icon.dataset.icon = icon.textContent.trim();
                icon.textContent = locked ? '🚧' : icon.dataset.icon;
            }
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
    else paint();
})();

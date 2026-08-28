/* ============================================================
   AUDIO DATA — NR 12 Leroy Merlin
   Extração de texto + manifesto (estáticos + quizzes por pergunta).
   ============================================================ */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.AUDIO_DATA = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /** Overrides inventados — VAZIO (ler HTML / decks reais). */
    const NARRATION_OVERRIDES = {};

    const TOTAL_PAGES = 32;

    const SLIDE_ORDER = {
        'index.html': ['s1', 's1b', 's-sumario'],
        'modulo-1.html': ['intro-m1', 's-o-que-e-nr12', 's-conceito-maquinas', 's2', 's4', 's6', 's-central-cores', 'sq1'],
        'modulo-2.html': ['intro-m2', 's-equipamento', 's10', 's9', 'sq2'],
        'modulo-3.html': ['intro-m3', 's-bateria', 's-conducao', 's-rampas', 's-bateria-troca', 's-quiz3'],
        'modulo-4.html': [
            's-mod4-intro', 's-mod4-video', 's-mod4-inspecao', 's-mod4-limpeza', 's-mod4-pode-nao',
            's-mod4-video-finalizacao', 's-mod4-organizacao', 's-quiz4', 's-mod6-video-final', 's-conclusion'
        ]
    };

    const MODULE_OFFSETS = {
        'index.html': 0,
        'modulo-1.html': 3,
        'modulo-2.html': 11,
        'modulo-3.html': 16,
        'modulo-4.html': 22
    };

    /**
     * Quizzes: um MP3 por estado (intro / qN / result).
     * Runtime resolve pelo DOM (painel + contador).
     */
    const QUIZ_META = {
        sq1: {
            prefix: 'sq1',
            title: 'Hora do Desafio. Quiz do Módulo 1.',
            panels: { intro: 'q1-intro-panel', play: 'q1-question-panel', result: 'q1-result-panel' },
            counter: 'q1-counter',
            type: 'mcq',
            letters: ['A', 'B', 'C']
        },
        sq2: {
            prefix: 'sq2',
            title: 'Hora do Desafio. Quiz do Módulo 2.',
            panels: { intro: 'q2-intro-panel', play: 'q2-question-panel', result: 'q2-result-panel' },
            counter: 'q2-counter',
            type: 'vf',
            letters: ['A', 'B']
        },
        's-quiz3': {
            prefix: 's-quiz3',
            title: 'Hora do Desafio. Encontre os riscos. Módulo 3.',
            panels: { intro: 'find-risk-intro', play: 'find-risk-play', result: 'q3-result-panel' },
            counter: 'find-risk-counter',
            type: 'liberado',
            letters: null
        },
        's-quiz4': {
            prefix: 's-quiz4',
            title: 'Hora do Desafio. Quiz do Módulo 4.',
            panels: { intro: 'q4-intro-panel', play: 'q4-question-panel', result: 'q4-result-panel' },
            counter: 'q4-counter',
            type: 'mcq',
            letters: ['A', 'B', 'C', 'D']
        }
    };

    /** Decks espelhando shared.js / HTML (geração offline). */
    const QUIZ_DECKS = {
        sq1: [
            {
                q: 'Qual é o objetivo principal da NR-12 na Central de Cores?',
                opts: [
                    'Ensinar os operadores a realizarem misturas de cores personalizadas para os clientes da loja.',
                    'Estabelecer referências técnicas e medidas de proteção para resguardar a saúde e a integridade física dos trabalhadores.',
                    'Definir quais marcas de tintas e corantes químicos podem ser comercializados na loja.'
                ]
            },
            {
                q: 'De acordo com o item 12.1.4 da norma, a NR-12 NÃO se aplica a qual dos seguintes itens da loja?',
                opts: [
                    'Ao dosador automático computadorizado de corantes da Central.',
                    'Às paleteiras manuais, movidas por força humana, e ferramentas elétricas portáteis, como furadeiras.',
                    'Ao misturador mecânico giroscópico utilizado para homogeneizar as tintas.'
                ]
            },
            {
                q: 'Segundo as exigências do Anexo II da NR-12, quem está legalmente autorizado a utilizar o dosador e o misturador de tintas?',
                opts: [
                    'Qualquer colaborador da loja que precise preparar uma tinta de forma rápida.',
                    'Apenas clientes, desde que acompanhados por um operador de caixa.',
                    'Exclusivamente os colaboradores capacitados e aprovados no treinamento de segurança.'
                ]
            }
        ],
        sq2: [
            { q: 'O timer do misturador permite ajustar o tempo de mistura em até 6 minutos.', opts: ['Verdadeiro', 'Falso'] },
            { q: 'A porta cortina do misturador pode ficar aberta durante o ciclo de mistura.', opts: ['Verdadeiro', 'Falso'] },
            { q: 'Os canisters ficam na área de enchimento do dosador.', opts: ['Verdadeiro', 'Falso'] }
        ],
        's-quiz3': [
            {
                q: 'Imagem: Operador sem calçado de segurança perto do misturador. Você libera este procedimento?',
                opts: null,
                liberado: true
            },
            {
                q: 'Imagem: Painel elétrico do dosador aberto. Você libera este procedimento?',
                opts: null,
                liberado: true
            },
            {
                q: 'Imagem: Lata fora do centro do prato do misturador. Você libera este procedimento?',
                opts: null,
                liberado: true
            }
        ],
        's-quiz4': [
            {
                q: 'Situação na loja. Hora de limpar o dosador. Um colega pega álcool e aguarrás e pergunta se pode usar. Quais produtos são proibidos na limpeza?',
                opts: [
                    'Pano seco',
                    'Água e solventes como álcool, aguarrás e thinner.',
                    'Solução suave',
                    'Pano úmido'
                ]
            },
            {
                q: 'Situação na loja. Durante o uso, um corante derrama para dentro do dosador. A máquina ainda está ligada. Qual é a atitude correta agora?',
                opts: [
                    'Limpar com pano imediatamente',
                    'Desligar e chamar técnico autorizado',
                    'Continuar operando',
                    'Usar água para diluir'
                ]
            },
            {
                q: 'Situação na loja. Você precisa movimentar recipientes de tinta sozinho até a área de uso. Qual o peso máximo permitido?',
                opts: ['10 kg', '15 kg', '25 kg', '40 kg']
            }
        ]
    };

    const QUIZ_INTRO = {
        sq1: 'Desafio NR 12 — Módulo 1. Responda 3 perguntas. Você precisa acertar no mínimo 2 para avançar. Toque em Iniciar Desafio para começar.',
        sq2: 'Desafio NR 12 — Módulo 2. Responda 3 perguntas de verdadeiro ou falso. Você precisa acertar no mínimo 2 para avançar. Toque em Iniciar Desafio para começar.',
        's-quiz3': 'Desafio NR 12 — Módulo 3. Observe 3 fotos e decida se libera ou não libera o procedimento. Você precisa acertar no mínimo 2 para avançar. Toque em Iniciar Desafio para começar.',
        's-quiz4': 'Desafio NR 12 — Módulo 4. Mini-quiz de manutenção e limpeza. Responda 3 missões. Você precisa acertar no mínimo 2 para avançar. Toque em Iniciar Desafio para começar.'
    };

    const QUIZ_RESULT = {
        sq1: 'Resultado do Quiz do Módulo 1. Veja sua pontuação na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.',
        sq2: 'Resultado do Quiz do Módulo 2. Veja sua pontuação na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.',
        's-quiz3': 'Resultado do desafio Encontre os riscos. Veja sua pontuação na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.',
        's-quiz4': 'Resultado do Quiz do Módulo 4. Veja sua pontuação na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
    };

    /**
     * Carrosséis / flip-cards: um MP3 por card (audios/{slideId}-c{N}.mp3).
     * counter = id do elemento com "1 / 3" ou "Dica 1/6".
     */
    const CAROUSEL_META = {
        's-o-que-e-nr12': { counter: 'nr12-counter', cardSelector: '.nr12-card', count: 3 },
        's-conceito-maquinas': { counter: 'cm-counter', cardSelector: '.cm-card', count: 3 },
        's4': { counter: 's4-counter', cardSelector: '.s4-flip-card', count: 7, flip: true },
        's9': { counter: 's9-counter', cardSelector: '.p13-card', count: 2 },
        's-rampas': { counter: 'opc-counter', cardSelector: '.opc-card', count: 3, flip: true },
        's-mod4-inspecao': { counter: 'm4m-counter', cardSelector: '.m4m-card', count: 3 },
        's-mod4-limpeza': { counter: 'm4l-counter', cardSelector: '.m4l-pane', count: 2, flip: true },
        's-mod4-organizacao': { counter: 'm4o-progress-lbl', cardSelector: '.m4o-card', count: 6 },
        's-mod4-pode-nao': { type: 'tab', count: 2 }
    };

    function slideTitleText(slide) {
        const t = slide && slide.querySelector('.slide-title, h1, h2');
        return t ? cleanText(t.textContent) : '';
    }

    function extractFlipCardText(card) {
        if (!card) return '';
        const parts = [];
        const frontTitle = card.querySelector(
            '.s4-flip-front-foot h4, .m4l-flip-front .m4l-title, .m4l-flip-front h3, .opc-flip-front h4, .s2-flip-front-foot h4, .p13-cover-foot h3, .p13-title, h3, h4'
        );
        if (frontTitle) parts.push(cleanText(frontTitle.textContent));
        const back = card.querySelector('.s4-flip-back, .m4l-flip-back, .opc-flip-back, .s2-flip-back');
        if (back) {
            const bt = back.querySelector('h3, h4, strong');
            const bp = back.querySelector('p');
            if (bt) parts.push(cleanText(bt.textContent));
            if (bp) parts.push(cleanText(bp.textContent));
            else if (!bt) parts.push(cleanText(back.textContent));
        }
        const body = card.querySelector('.p13-body, .m4m-body, .nr12-card-top, .cm-card');
        if (body && !back) parts.push(cleanText(body.textContent));
        if (!parts.length) parts.push(cleanText(card.textContent));
        return cleanText(parts.join('. '));
    }

    function extractCarouselCardText(slide, meta, cardIndex) {
        if (!slide || !meta) return '';
        const title = slideTitleText(slide);
        if (meta.type === 'tab') {
            const panelSel = cardIndex === 1 ? '.m4p-panel--ok' : '.m4p-panel--no';
            const panel = slide.querySelector(panelSel);
            const cap = panel && panel.querySelector('.m4p-caption');
            const bit = cap ? cleanText(cap.textContent) : (panel ? cleanText(panel.textContent) : '');
            return cleanText([title, bit].filter(Boolean).join('. '));
        }
        const cards = slide.querySelectorAll(meta.cardSelector);
        const card = cards[cardIndex];
        if (!card) return title;
        const bit = meta.flip ? extractFlipCardText(card) : cleanText(card.textContent);
        return cleanText([title, bit].filter(Boolean).join('. '));
    }

    /** Índice 1-based do card ativo (browser). */
    function getCarouselIndex(slideId, root) {
        root = root || (typeof document !== 'undefined' ? document : null);
        if (!root) return 1;
        const meta = CAROUSEL_META[slideId];
        if (!meta) return 1;
        if (meta.type === 'tab') {
            const slide = root.getElementById(slideId);
            const on = slide && slide.querySelector('.m4p-tab.is-on');
            return on && on.getAttribute('data-m4p') === 'no' ? 2 : 1;
        }
        const el = root.getElementById(meta.counter);
        if (!el || !el.textContent) return 1;
        const m = String(el.textContent).match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 1;
    }

    function carouselNarrationSrc(slideId, root) {
        if (!CAROUSEL_META[slideId]) return null;
        return 'audios/' + slideId + '-c' + getCarouselIndex(slideId, root) + '.mp3';
    }

    function stripEmojis(s) {
        if (!s) return '';
        return String(s).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F2FF}\u{FE0F}]/gu, ' ');
    }

    function cleanText(s) {
        let t = stripEmojis(s);
        t = t.replace(/<[^>]+>/g, ' ');
        t = t.replace(/[·•●▪►▶←→↑↓]+/g, '. ');
        t = t.replace(/[–—]/g, ', ');
        t = t.replace(/\.{2,}/g, '.');
        t = t.replace(/\s+/g, ' ').trim();
        return t;
    }

    function globalSlideOf(file, slideId) {
        const order = SLIDE_ORDER[file];
        if (!order) return null;
        const idx = order.indexOf(slideId);
        if (idx < 0) return null;
        return (MODULE_OFFSETS[file] || 0) + idx + 1;
    }

    function buildMcqNarration(meta, item, i, total) {
        const letters = meta.letters || ['A', 'B', 'C', 'D'];
        const parts = [
            meta.title,
            'Pergunta ' + (i + 1) + ' de ' + total + '.',
            cleanText(item.q)
        ];
        if (meta.type === 'vf') {
            parts.push('Alternativas: Verdadeiro ou Falso.');
        } else if (meta.type === 'liberado' || item.liberado) {
            parts.push('Alternativas: Liberado ou Não liberado.');
        } else if (item.opts && item.opts.length) {
            item.opts.forEach(function (opt, oi) {
                parts.push('Alternativa ' + letters[oi] + ': ' + cleanText(opt) + '.');
            });
        }
        return cleanText(parts.join(' '));
    }

    function extractSlideText(slide) {
        if (!slide) return '';
        const custom = slide.getAttribute && slide.getAttribute('data-audio-text');
        if (custom) return cleanText(custom);

        const parts = [];

        if (slide.id === 's1') {
            const tag = slide.querySelector('.s1-tag');
            const h1 = slide.querySelector('h1');
            const p = slide.querySelector('.s1-text-col > p');
            if (tag) parts.push(cleanText(tag.textContent));
            if (h1) parts.push(cleanText(h1.textContent));
            if (p) parts.push(cleanText(p.textContent));
            slide.querySelectorAll('.s1-badge').forEach(function (badge) {
                const strong = badge.querySelector('strong');
                const span = badge.querySelector('span');
                const line = [strong && strong.textContent, span && span.textContent]
                    .map(cleanText)
                    .filter(Boolean)
                    .join('. ');
                if (line) parts.push(line);
            });
            return parts.filter(Boolean).join('. ');
        }

        const clone = slide.cloneNode(true);

        // Flip cards (muitos são <button>): extrair verso ANTES de remover botões
        const flipBits = [];
        clone.querySelectorAll(
            '.m4l-flip-back, .s4-flip-back, .s2-flip-back, .opc-flip-back, .flip-back'
        ).forEach(function (back) {
            const card = back.closest('.m4l-pane, .s4-flip-card, .s2-flip-card, .opc-card, .flip-card') || back;
            const frontTitle = card.querySelector('.s4-flip-front-foot h4, .m4l-flip-front h3, .m4l-title, h4, h3');
            const backTitle = back.querySelector('h3, h4, strong');
            const backBody = back.querySelector('p');
            const line = [
                frontTitle && cleanText(frontTitle.textContent),
                backTitle && cleanText(backTitle.textContent),
                backBody && cleanText(backBody.textContent),
                cleanText(back.textContent)
            ].filter(Boolean);
            // Evitar triplicar: preferir título + 1º parágrafo do verso
            const compact = [];
            if (frontTitle) compact.push(cleanText(frontTitle.textContent));
            if (backTitle) compact.push(cleanText(backTitle.textContent));
            if (backBody) compact.push(cleanText(backBody.textContent));
            else if (!backTitle) compact.push(cleanText(back.textContent));
            const bit = cleanText(compact.join('. '));
            if (bit) flipBits.push(bit);
        });

        const REMOVE = [
            'script', 'style', 'noscript', 'svg', 'iframe', 'audio', 'video',
            'canvas', 'embed', 'object', 'button', 'nav',
            '[aria-hidden="true"]',
            '.wave', '.section-tag', '.slide-subtitle',
            '.epi-flip-hint', '.epi-flip-carousel-hint', '.epi-flip-tap', '.epi-flip-back-foot',
            '.m4l-flip-hint', '.m4l-hint', '.m4l-expand',
            '.s4-flip-hint', '.s4-flip-tap', '.s4-flip-back-foot',
            '.s1-actions', '.s1-secondary-actions',
            '[id$="-intro-panel"]', '[id$="-question-panel"]', '[id$="-result-panel"]',
            '#find-risk-intro', '#find-risk-play', '#q3-result-panel'
        ];
        REMOVE.forEach(function (sel) {
            try { clone.querySelectorAll(sel).forEach(function (n) { n.remove(); }); } catch (e) { /* ignore */ }
        });

        clone.querySelectorAll('img[alt]').forEach(function (img) {
            const alt = (img.getAttribute('alt') || '').trim();
            if (alt) {
                const span = clone.ownerDocument.createElement('span');
                span.textContent = ' Imagem: ' + alt + '. ';
                if (img.parentNode) img.parentNode.insertBefore(span, img);
            }
            img.remove();
        });

        const titleEl = clone.querySelector('.slide-title, h1, h2');
        if (titleEl) parts.push(cleanText(titleEl.textContent));
        const content = clone.querySelector('.content-area, .s1-text-col, .s1-inner') || clone;
        const body = cleanText(content.textContent || '');
        if (body) parts.push(body);
        if (flipBits.length) parts.push(flipBits.join('. '));
        return cleanText(parts.join('. '));
    }

    function buildManifestEntries(loadSlideFn, opts) {
        opts = opts || {};
        const only = opts.onlyIds ? new Set(opts.onlyIds) : null;
        const entries = [];

        Object.keys(SLIDE_ORDER).forEach(function (file) {
            (SLIDE_ORDER[file] || []).forEach(function (slideId) {
                if (only && !only.has(slideId)) return;
                const slideEl = loadSlideFn(file, slideId);
                const globalN = globalSlideOf(file, slideId);
                const quiz = QUIZ_META[slideId];

                if (quiz) {
                    const deck = QUIZ_DECKS[slideId] || [];
                    entries.push({
                        id: slideId + '-intro',
                        slideId: slideId,
                        file: 'audios/' + slideId + '-intro.mp3',
                        text: cleanText((quiz.title ? quiz.title + ' ' : '') + (QUIZ_INTRO[slideId] || '')),
                        audioReady: false,
                        globalN: globalN,
                        sourceFile: file,
                        state: 'intro'
                    });
                    deck.forEach(function (item, i) {
                        entries.push({
                            id: slideId + '-q' + (i + 1),
                            slideId: slideId,
                            file: 'audios/' + slideId + '-q' + (i + 1) + '.mp3',
                            text: buildMcqNarration(quiz, item, i, deck.length),
                            audioReady: false,
                            globalN: globalN,
                            sourceFile: file,
                            state: 'q' + (i + 1)
                        });
                    });
                    entries.push({
                        id: slideId + '-result',
                        slideId: slideId,
                        file: 'audios/' + slideId + '-result.mp3',
                        text: cleanText(QUIZ_RESULT[slideId] || 'Resultado do quiz. Veja sua pontuação na tela.'),
                        audioReady: false,
                        globalN: globalN,
                        sourceFile: file,
                        state: 'result'
                    });
                    return;
                }

                if (!slideEl) {
                    console.warn('[audio-data] Slide #' + slideId + ' não encontrado em ' + file);
                    return;
                }

                const carousel = CAROUSEL_META[slideId];
                if (carousel) {
                    for (let ci = 0; ci < carousel.count; ci++) {
                        entries.push({
                            id: slideId + '-c' + (ci + 1),
                            slideId: slideId,
                            file: 'audios/' + slideId + '-c' + (ci + 1) + '.mp3',
                            text: extractCarouselCardText(slideEl, carousel, ci),
                            audioReady: false,
                            globalN: globalN,
                            sourceFile: file,
                            state: 'c' + (ci + 1)
                        });
                    }
                    return;
                }

                const override = NARRATION_OVERRIDES[slideId];
                const text = cleanText(override || extractSlideText(slideEl));
                entries.push({
                    id: slideId,
                    slideId: slideId,
                    file: 'audios/' + slideId + '.mp3',
                    text: text,
                    audioReady: false,
                    globalN: globalN,
                    sourceFile: file,
                    state: 'main'
                });
            });
        });
        return entries;
    }

    return {
        SLIDE_ORDER: SLIDE_ORDER,
        MODULE_OFFSETS: MODULE_OFFSETS,
        TOTAL_PAGES: TOTAL_PAGES,
        QUIZ_META: QUIZ_META,
        QUIZ_DECKS: QUIZ_DECKS,
        CAROUSEL_META: CAROUSEL_META,
        MULTI_STATE: QUIZ_META,
        NARRATION_OVERRIDES: NARRATION_OVERRIDES,
        OVERRIDES: NARRATION_OVERRIDES,
        globalSlideOf: globalSlideOf,
        cleanText: cleanText,
        extractSlideText: extractSlideText,
        extractCarouselCardText: extractCarouselCardText,
        getCarouselIndex: getCarouselIndex,
        carouselNarrationSrc: carouselNarrationSrc,
        buildManifestEntries: buildManifestEntries,
        buildMcqNarration: buildMcqNarration
    };
}));

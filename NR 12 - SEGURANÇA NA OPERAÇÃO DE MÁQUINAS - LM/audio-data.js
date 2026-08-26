/* ============================================================
   AUDIO DATA — Mapa de slides e textos para narração
   ------------------------------------------------------------
   Este arquivo é a ÚNICA fonte de verdade que descreve:
     (1) ordem dos slides em cada HTML (precisa bater com NR11_MODULE_OFFSETS de shared.js)
     (2) quais slides têm múltiplos estados (quiz, micro-quiz)
     (3) o que deve ser narrado em cada estado de um slide multi-estado

   Usado por:
     - generate-audios.js  (Node, gera os MP3 batendo na API de TTS)
     - shared.js           (browser, escolhe qual MP3 tocar a cada clique em "Ouvir")
   ============================================================ */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.AUDIO_DATA = factory();
}(typeof self !== 'undefined' ? self : this, function () {

    /* Ordem dos slides em cada HTML — DEVE bater com NR11_MODULE_OFFSETS.
       Soma das slides = NR11_TOTAL_SLIDES (33).                              */
    const SLIDE_ORDER = {
        'index.html': ['s1', 's1b', 's-sumario'],
        'modulo-1.html': ['intro-m1', 's-o-que-e-nr12', 's-conceito-maquinas', 's2', 's4', 's6', 's-central-cores', 'sq1'],
        'modulo-2.html': ['intro-m2', 's-equipamento', 's10', 's9', 'sq2'],
        'modulo-3.html': ['intro-m3', 's-bateria', 's-conducao', 's-rampas', 's-bateria-troca', 's-quiz3'],
        'modulo-4.html': ['s-mod4-intro', 's-mod4-video', 's-mod4-inspecao', 's-mod4-limpeza', 's-mod4-pode-nao', 's-mod4-video-finalizacao', 's-mod4-organizacao', 's-quiz4', 's-mod6-mensagem-final', 's-mod6-video-final', 's-conclusion']
    };

    /* MULTI_STATE: slides com múltiplos conteúdos exibidos em sequência.
       O player troca de áudio conforme o estado visível na tela.

       Campos:
         panels: { intro:'#id', question:'#id', result:'#id' }  -> usado para detectar estado no DOM
         counterSelector:  seletor para ler "Pergunta X de N" e descobrir índice
         intro / result:   texto narrado para esses estados
         questions[]:      texto narrado para cada pergunta (i+1 = Q1, Q2 …)                */
    const MULTI_STATE = {
        // ─── QUIZ 1 (slide global 11, modulo-1.html, sq1) ────────────────────
        'sq1': {
            panels: { intro: '#q1-intro-panel', question: '#q1-question-panel', result: '#q1-result-panel' },
            counterSelector: '#q1-counter',
            intro: 'Hora do desafio. Quiz do Módulo 1. Mostre que você domina os principais conteúdos da NR-12 na Central de Cores. Esta avaliação contém três perguntas. É necessário acertar pelo menos duas para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 3. Qual é o objetivo principal da NR-12 na Central de Cores? Opção A: Ensinar os operadores a realizarem misturas de cores personalizadas para os clientes da loja. Opção B: Estabelecer referências técnicas e medidas de proteção para resguardar a saúde e a integridade física dos trabalhadores. Opção C: Definir quais marcas de tintas e corantes químicos podem ser comercializados na loja.',
                'Pergunta 2 de 3. De acordo com o item 12.1.4 da norma, a NR-12 NÃO se aplica a qual dos seguintes itens da loja? Opção A: Ao dosador automático computadorizado de corantes da Central. Opção B: Às paleteiras manuais, movidas por força humana, e ferramentas elétricas portáteis, como furadeiras. Opção C: Ao misturador mecânico giroscópico utilizado para homogeneizar as tintas.',
                'Pergunta 3 de 3. Segundo as exigências do Anexo II da NR-12, quem está legalmente autorizado a utilizar o dosador e o misturador de tintas? Opção A: Qualquer colaborador da loja que precise preparar uma tinta de forma rápida. Opção B: Apenas clientes, desde que acompanhados por um operador de caixa. Opção C: Exclusivamente os colaboradores capacitados e aprovados no treinamento de segurança.'
            ],
            result: 'Resultado do Quiz do Módulo 1. Veja sua pontuação na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── QUIZ 2 (slide global 16, modulo-2.html, sq2) — Verdadeiro / Falso ──
        'sq2': {
            panels: { intro: '#q2-intro-panel', question: '#q2-question-panel', result: '#q2-result-panel' },
            counterSelector: '#q2-counter',
            intro: 'Quiz do Módulo 2. Hora do desafio. Esta avaliação contém três perguntas de verdadeiro ou falso. É necessário acertar pelo menos duas para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 3. O timer do misturador permite ajustar o tempo de mistura em até 6 minutos. Opção A: Verdadeiro. Opção B: Falso.',
                'Pergunta 2 de 3. A porta cortina do misturador pode ficar aberta durante o ciclo de mistura. Opção A: Verdadeiro. Opção B: Falso.',
                'Pergunta 3 de 3. Os canisters ficam na área de enchimento do dosador. Opção A: Verdadeiro. Opção B: Falso.'
            ],
            result: 'Resultado do Quiz do Módulo 2. Veja sua pontuação na tela. Toque em Tentar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── QUIZ 4 (slide global 28, modulo-4.html, s-quiz4) ─────────────────
        's-quiz4': {
            panels: { intro: '#q4-intro-panel', question: '#q4-question-panel', result: '#q4-result-panel' },
            counterSelector: '#q4-counter',
            intro: 'Quiz do Módulo 4. Mini-quiz de manutenção e limpeza. Esta avaliação contém três perguntas de múltipla escolha. É necessário acertar pelo menos duas para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 3. Quais produtos são proibidos na limpeza do dosador? Opção A: Pano seco. Opção B: Água e solventes como álcool, aguarrás e thinner. Opção C: Solução suave. Opção D: Pano úmido.',
                'Pergunta 2 de 3. O que fazer se um corante for derramado dentro do dosador? Opção A: Limpar com pano imediatamente. Opção B: Desligar e chamar técnico autorizado. Opção C: Continuar operando. Opção D: Usar água para diluir.',
                'Pergunta 3 de 3. Qual o peso máximo permitido para movimentar recipientes? Opção A: 10 kg. Opção B: 15 kg. Opção C: 25 kg. Opção D: 40 kg.'
            ],
            result: 'Resultado do Quiz do Módulo 4. Veja sua pontuação na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        }
    };

    /* Textos hardcoded para slides "normais" cujos áudios atuais ficaram ruins.
       Adicione aqui se quiser sobrescrever o texto extraído do HTML.
       Slides não listados usam extração automática via jsdom no generator.    */
    const OVERRIDES = {
        's-quiz3': 'Encontre os riscos. Observe três fotos e decida se libera ou não libera o procedimento. Em todas as cenas há risco: sem calçado de segurança, painel elétrico aberto e lata fora do centro do prato do misturador. A decisão correta é não liberar.',
        's-conclusion': 'Página 33 de 33. Treinamento — Concluído. Certificado de conclusão. Parabéns! Você concluiu o treinamento NR 12 — Segurança na Operação de Máquinas. Por mérito, dedicação e compromisso com a segurança, você percorreu os 4 módulos. 4 módulos. NR 12. Máquinas.'
    };

    /* Calcula o número global do slide (1..NR11_TOTAL_SLIDES) a partir do
       nome do arquivo HTML e do índice interno do slide. Mantém em sintonia
       com NR11_MODULE_OFFSETS de shared.js.                                    */
    const MODULE_OFFSETS = {
        'index.html': 0, 'modulo-1.html': 3, 'modulo-2.html': 11,
        'modulo-3.html': 16, 'modulo-4.html': 22
    };

    function globalSlideOf(file, slideId) {
        const order = SLIDE_ORDER[file];
        if (!order) return null;
        const idx = order.indexOf(slideId);
        if (idx < 0) return null;
        return (MODULE_OFFSETS[file] || 0) + idx + 1;
    }

    return { SLIDE_ORDER, MULTI_STATE, OVERRIDES, MODULE_OFFSETS, globalSlideOf };
}));

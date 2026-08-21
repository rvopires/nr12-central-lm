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
       Soma das slides = NR11_TOTAL_SLIDES (45).                              */
    const SLIDE_ORDER = {
        'index.html': ['s1', 's1b', 's-sumario'],
        'modulo-1.html': ['intro-m1', 's2', 's4', 's6', 's-central-cores', 'sq1'],
        'modulo-2.html': ['intro-m2', 's-equipamento', 's10', 's9', 'sq2'],
        'modulo-3.html': ['intro-m3', 's-bateria', 's-conducao', 's-rampas', 's-bateria-troca', 's-quiz3'],
        'modulo-4.html': ['s-mod4-intro', 's-mod4-video', 's-mod4-inspecao', 's-mod4-limpeza', 's-mod4-video-finalizacao', 's-mod4-organizacao', 's-quiz4'],
        'modulo-5.html': ['s-mod5-intro', 's-mod5-video1', 's-mod5-comp1', 's-mod5-video2', 's-mod5-distancia', 's-mod5-video3', 's-mod5-flip', 's-mod5-epi', 's-quiz5'],
        'modulo-6.html': ['s-mod6-intro', 's-mod6-video-encerramento', 's-mod6-compromissos', 's-mod6-comp-preventiva', 's-mod6-mensagem-final', 's-mod6-video-mensagem-final', 's-mod6-video-final', 's-quiz6', 's-conclusion']
    };

    /* MULTI_STATE: slides com múltiplos conteúdos exibidos em sequência.
       O player troca de áudio conforme o estado visível na tela.

       Campos:
         panels: { intro:'#id', question:'#id', result:'#id' }  -> usado para detectar estado no DOM
         counterSelector:  seletor para ler "Pergunta X de N" e descobrir índice
         intro / result:   texto narrado para esses estados
         questions[]:      texto narrado para cada pergunta (i+1 = Q1, Q2 …)                */
    const MULTI_STATE = {
        // ─── QUIZ 1 (slide global 9, modulo-1.html, sq1) ─────────────────────
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

        // ─── QUIZ 2 (slide global 14, modulo-2.html, sq2) — Verdadeiro / Falso ──
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

        // ─── QUIZ 4 (slide global 27, modulo-4.html, s-quiz4) ─────────────────
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
        },

        // ─── QUIZ 5 (slide global 35, modulo-5.html, s-quiz5) ─────────────────
        's-quiz5': {
            panels: { intro: '#q5-intro-panel', question: '#q5-question-panel', result: '#q5-result-panel' },
            counterSelector: '#q5-counter',
            intro: 'Quiz do Módulo 5. Simulação Operacional. Avalie cenários de movimentação, armazenagem e emergências. Esta avaliação contém cinco situações com mínimo de setenta por cento de acertos. Toque em Iniciar para começar.',
            questions: [
                'Pergunta 1 de 5. Corredor Obstruído. O operador encontrou um corredor parcialmente bloqueado durante a movimentação da carga. Qual deve ser o procedimento correto? Opção A: Continuar normalmente. Opção B: Sinalizar e liberar o corredor antes da operação. Opção C: Passar rapidamente pelo bloqueio. Opção D: Ignorar o obstáculo.',
                'Pergunta 2 de 5. Carga Elevada. A carga está sendo transportada acima da altura recomendada. Qual é o principal risco desta operação? Opção A: Melhor visibilidade. Opção B: Maior estabilidade. Opção C: Maior velocidade. Opção D: Comprometimento da visibilidade e risco de colisão.',
                'Pergunta 3 de 5. EPI Ausente. O operador iniciou a movimentação sem todos os EPIs obrigatórios. Qual procedimento está correto? Opção A: Interromper a operação até regularizar os EPIs. Opção B: Operar apenas em áreas vazias. Opção C: Continuar se a operação for rápida. Opção D: Solicitar ajuda apenas em caso de risco.',
                'Pergunta 4 de 5. Emergência Operacional. Foi identificado um princípio de incêndio próximo à área de movimentação. Qual deve ser a primeira ação? Opção A: Continuar a operação. Opção B: Improvisar sozinho o combate. Opção C: Parar a operação e afastar as pessoas. Opção D: Mover a carga rapidamente.',
                'Pergunta 5 de 5. Distanciamento Seguro. Durante a movimentação, o operador reduziu excessivamente a distância da estrutura lateral. Qual distância mínima deve ser mantida? Opção A: Vinte centímetros. Opção B: Cinquenta centímetros. Opção C: Trinta centímetros. Opção D: Não existe distância mínima.'
            ],
            result: 'Resultado do Quiz do Módulo 5. Veja sua pontuação na tela. Toque em Tentar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── QUIZ 6 (slide global 43, modulo-6.html, s-quiz6) — Liberar/Não ───
        's-quiz6': {
            panels: { intro: '#q6-intro-panel', question: '#q6-question-panel', result: '#q6-result-panel' },
            counterSelector: '#q6-counter',
            counterPattern: /Pergunta\s+(\d+)\s+de/i,
            intro: 'Quiz Final. Hora do Desafio do Módulo 6. Analise cada cenário e decida se a operação deve ser liberada ou não liberada. Esta avaliação contém cinco perguntas com mínimo de três acertos. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 5. Verificação do Trajeto. O operador irá iniciar a movimentação sem verificar o corredor operacional. Você deve liberar ou não liberar?',
                'Pergunta 2 de 5. Altura da Carga. A carga está posicionada corretamente para movimentação segura. Você deve liberar ou não liberar?',
                'Pergunta 3 de 5. Distração Operacional. O operador utiliza celular durante a movimentação da carga. Você deve liberar ou não liberar?',
                'Pergunta 4 de 5. Proteção Operacional. O operador iniciou a operação utilizando os EPIs obrigatórios. Você deve liberar ou não liberar?',
                'Pergunta 5 de 5. Finalização Segura. O equipamento foi estacionado corretamente ao final da operação. Você deve liberar ou não liberar?'
            ],
            result: 'Resultado do Desafio. Veja sua pontuação na tela. Caso aprovado, toque em Próximo. Caso contrário, jogue novamente.'
        }
    };

    /* Textos hardcoded para slides "normais" cujos áudios atuais ficaram ruins.
       Adicione aqui se quiser sobrescrever o texto extraído do HTML.
       Slides não listados usam extração automática via jsdom no generator.    */
    const OVERRIDES = {
        's-quiz3': 'Encontre os riscos. Observe três fotos e decida se libera ou não libera o procedimento. Em todas as cenas há risco: sem calçado de segurança, painel elétrico aberto e lata fora do centro do prato do misturador. A decisão correta é não liberar.'
    };

    /* Calcula o número global do slide (1..NR11_TOTAL_SLIDES) a partir do
       nome do arquivo HTML e do índice interno do slide. Mantém em sintonia
       com NR11_MODULE_OFFSETS de shared.js.                                    */
    const MODULE_OFFSETS = {
        'index.html': 0, 'modulo-1.html': 3, 'modulo-2.html': 9,
        'modulo-3.html': 14, 'modulo-4.html': 20, 'modulo-5.html': 27,
        'modulo-6.html': 36
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

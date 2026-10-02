(function () {
  var rm = {
    usuario: {
      numero: "",
      data: "02/10/2026 09:40",
      solicitante: "Eduardo Martins",
      gestor: "Eduardo Martins",
      gerencia: "Gerência Industrial",
      areaDiretoria: "Diretoria Industrial",
      diretor: "Roberto Siqueira",
      seguranca: "Marcos Oliveira",
      gestorRh: "Ricardo Nunes",
      empresa: "Lonax Indústria Brasileira de Lonas",
      filial: "Matriz - Sarzedo/MG"
    },
    colaboradores: [
      {
        nome: "Carlos Pereira",
        chapa: "000731",
        admissao: "14/03/2019",
        cargo: "Operador de Produção",
        funcao: "Operador de Extrusora",
        descricaoCargo: "Operar máquinas de extrusão, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.",
        nivel: "Operacional - Step 2",
        step: "Step 2",
        faixa: "R$ 3.200,00",
        salario: "R$ 3.450,00",
        escala: "6x1",
        horario: "06:00 às 14:00",
        secao: "Produção",
        centro: "IND.PRO.001"
      },
      {
        nome: "Fernanda Lima",
        chapa: "000918",
        admissao: "22/08/2021",
        cargo: "Assistente Administrativo",
        funcao: "Assistente Administrativo",
        descricaoCargo: "Executar rotinas administrativas, apoiar controles internos, organizar documentos e atender demandas operacionais da área.",
        nivel: "Administrativo - Step 1",
        step: "Step 1",
        faixa: "R$ 3.100,00",
        salario: "R$ 2.750,00",
        escala: "5x1",
        horario: "08:00 às 17:48",
        secao: "Administração",
        centro: "ADM.GER.002"
      }
    ],
    cargos: ["Analista de Qualidade", "Operador de Produção", "Líder de Produção", "Assistente Administrativo"],
    descricoesCargo: {
      "Analista de Qualidade": "Executar inspeções de qualidade em produtos e processos, registrar não conformidades, apoiar planos de ação e acompanhar indicadores da área industrial.",
      "Operador de Produção": "Operar máquinas de extrusão, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.",
      "Líder de Produção": "Acompanhar equipe operacional, distribuir atividades, controlar indicadores produtivos e apoiar a supervisão na rotina da área.",
      "Assistente Administrativo": "Executar rotinas administrativas, apoiar controles internos, organizar documentos e atender demandas operacionais da área."
    },
    funcoes: ["Analista de Controle de Qualidade", "Operador de Extrusora", "Líder de Turno", "Assistente Administrativo"],
    niveis: ["Operacional - Step 1", "Operacional - Step 2", "Operacional - Step 3", "Técnico - Step 2", "Pleno - Step 2", "Sênior - Step 3"],
    steps: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    escalas: [
      { nome: "5x1", horario: "08:00 às 17:48" },
      { nome: "6x1", horario: "06:00 às 14:00" },
      { nome: "12x36", horario: "19:00 às 07:00" }
    ],
    equipamentos: ["Notebook / Computador", "Monitor", "Telefone", "Celular", "Outros"],
    tabelaSalarial: [
      { step: "Step 1", faixa: "R$ 3.100,00", salario: "R$ 3.100,00", referencia: "Entrada" },
      { step: "Step 2", faixa: "R$ 3.200,00", salario: "R$ 3.200,00", referencia: "Posição atual" },
      { step: "Step 3", faixa: "R$ 3.300,00", salario: "R$ 3.300,00", referencia: "Referência sugerida" },
      { step: "Step 4", faixa: "R$ 3.400,00", salario: "R$ 3.400,00", referencia: "Teto da faixa" },
      { step: "Step 5", faixa: "R$ 3.500,00", salario: "R$ 3.500,00", referencia: "Faixa superior" }
    ],
    faixasPorCargo: {
      "Operador de Produção": [
        { step: "Step 1", faixa: "R$ 3.100,00", referencia: "Entrada" },
        { step: "Step 2", faixa: "R$ 3.200,00", referencia: "Posição atual" },
        { step: "Step 3", faixa: "R$ 3.300,00", referencia: "Referência intermediária" },
        { step: "Step 4", faixa: "R$ 3.400,00", referencia: "Referência superior" },
        { step: "Step 5", faixa: "R$ 3.500,00", referencia: "Teto do cargo" }
      ],
      "Assistente Administrativo": [
        { step: "Step 1", faixa: "R$ 3.100,00", referencia: "Entrada" },
        { step: "Step 2", faixa: "R$ 3.200,00", referencia: "Referência intermediária" },
        { step: "Step 3", faixa: "R$ 3.300,00", referencia: "Referência superior" },
        { step: "Step 4", faixa: "R$ 3.400,00", referencia: "Teto técnico" },
        { step: "Step 5", faixa: "R$ 3.500,00", referencia: "Teto do cargo" }
      ],
      "Analista de Qualidade": [
        { step: "Step 1", faixa: "R$ 4.200,00", referencia: "Entrada" },
        { step: "Step 2", faixa: "R$ 4.800,00", referencia: "Referência da vaga" },
        { step: "Step 3", faixa: "R$ 5.100,00", referencia: "Referência intermediária" },
        { step: "Step 4", faixa: "R$ 5.600,00", referencia: "Referência superior" },
        { step: "Step 5", faixa: "R$ 6.200,00", referencia: "Teto do cargo" }
      ],
      "Líder de Produção": [
        { step: "Step 1", faixa: "R$ 5.400,00", referencia: "Entrada" },
        { step: "Step 2", faixa: "R$ 5.900,00", referencia: "Referência da vaga" },
        { step: "Step 3", faixa: "R$ 6.300,00", referencia: "Referência intermediária" },
        { step: "Step 4", faixa: "R$ 6.800,00", referencia: "Referência superior" },
        { step: "Step 5", faixa: "R$ 7.300,00", referencia: "Teto do cargo" }
      ]
    }
  };

  var stages = [
    { key: "solicitacao", title: "Solicitar Movimentação de Carreira", icon: "fa-user-tie", tone: "blue", desc: "Abertura da solicitação pelo Gestor." },
    { key: "diretoria", title: "Aprovação Diretoria", icon: "fa-building-user", tone: "purple", desc: "Será detalhada na próxima fase do protótipo." },
    { key: "seguranca", title: "Segurança do Trabalho", icon: "fa-helmet-safety", tone: "orange", desc: "Aplicável somente para Promoção." },
    { key: "rh", title: "Aprovação RH", icon: "fa-users-gear", tone: "teal", desc: "Será detalhada na próxima fase do protótipo." },
    { key: "finalizada", title: "Movimentação Finalizada", icon: "fa-circle-check", tone: "green", desc: "Encerramento simulado do processo." }
  ];

  var state = {
    stage: "solicitacao",
    status: "Em preenchimento",
    errors: {},
    collapses: {},
    form: {
      numero: "",
      data: rm.usuario.data,
      solicitante: rm.usuario.solicitante,
      gestor: rm.usuario.gestor,
      gerencia: rm.usuario.gerencia,
      areaDiretoria: rm.usuario.areaDiretoria,
      filial: rm.usuario.filial,
      colaborador: "Carlos Pereira",
      chapa: "000731",
      admissao: "14/03/2019",
      cargoAtual: "Operador de Produção",
      funcaoAtual: "Operador de Extrusora",
      descricaoCargoAtual: "Operar máquinas de extrusão, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.",
      nivelAtual: "Operacional - Step 2",
      stepAtual: "Step 2",
      faixaAtual: "R$ 3.200,00",
      salarioAtual: "R$ 3.450,00",
      escalaAtual: "6x1",
      horarioAtual: "06:00 às 14:00",
      secaoAtual: "Produção",
      centroAtual: "IND.PRO.001",
      tipoMovimentacao: "Promoção",
      novoCargo: "Analista de Qualidade",
      novaFuncao: "Analista de Controle de Qualidade",
      descricaoCargoProposto: "Executar inspeções de qualidade em produtos e processos, registrar não conformidades, apoiar planos de ação e acompanhar indicadores da área industrial.",
      novoNivel: "Pleno - Step 2",
      novoStep: "Step 2",
      novaFaixa: "R$ 4.800,00",
      novoSalario: "R$ 4.800,00",
      novaEscala: "5x1",
      novoHorario: "08:00 às 17:48",
      dataVigencia: "2026-10-20",
      stepSugerido: "Step 3",
      salarioSugerido: "R$ 3.300,00",
      diferencaValor: "R$ 550,00",
      diferencaPercentual: "17,19%",
      usaEquipamentoAtual: "Sim",
      equipamentosOrigem: [
        { equipamento: "Notebook / Computador", quantidade: "1", destino: "Acompanham o colaborador" },
        { equipamento: "Monitor", quantidade: "1", destino: "Permanecem na área atual" }
      ],
      novoCargoPrecisaEquipamento: "Sim",
      equipamentosNecessarios: [
        { equipamento: "Notebook / Computador", quantidade: "1", observacao: "Notebook individual para nova rotina" },
        { equipamento: "Monitor", quantidade: "1", observacao: "Monitor para análise de indicadores" }
      ],
      justificativa: "Movimentação proposta para reconhecer evolução técnica e aderência do colaborador à nova responsabilidade na área.",
      observacoes: "Colaborador apresenta evolução consistente nas entregas da área e aderência às responsabilidades previstas para a movimentação proposta.",
      anexos: []
    }
  };

  var stageNav = document.getElementById("stageNav");
  var appView = document.getElementById("appView");
  var statusLabel = document.getElementById("statusLabel");
  var isStagePage = !!appView;
  var radioCounter = 0;
  var modal = {
    wrap: document.getElementById("modalBackdrop"),
    dialog: document.getElementById("modalDialog"),
    title: document.getElementById("modalTitle"),
    message: document.getElementById("modalMessage"),
    icon: document.getElementById("modalIcon"),
    cancel: document.getElementById("modalCancel"),
    confirm: document.getElementById("modalConfirm"),
    action: null
  };

  if (isStagePage) state.stage = getRequestedStage();

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function getStage(key) { return stages.filter(function (item) { return item.key === key; })[0] || stages[0]; }
  function getRequestedStage() { return getStage(new URLSearchParams(window.location.search).get("etapa") || "solicitacao").key; }
  function getStageUrl(key) { return "etapa.html?etapa=" + encodeURIComponent(key); }
  function formatDate(value) {
    var parts = String(value || "").split("-");
    if (parts.length !== 3) return value || "-";
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }
  function onlyDigits(value) { return String(value || "").replace(/\D/g, ""); }
  function parseMoney(value) {
    var cleaned = String(value || "").replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
    return Number(cleaned) || 0;
  }
  function formatCurrency(value) {
    var number = Number(value) || 0;
    var formatted = number.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return "R$ " + formatted;
  }
  function formatMoney(value) {
    var digits = onlyDigits(value);
    if (!digits) return "";
    var number = (Number(digits) / 100).toFixed(2).replace(".", ",");
    return "R$ " + number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function todayValue() { return "2026-10-02"; }
  function getSalaryRangeForCargo(cargo) {
    return rm.faixasPorCargo[cargo] || rm.tabelaSalarial;
  }
  function getProposedCargo() {
    var f = state.form;
    return f.tipoMovimentacao === "Promoção" ? f.novoCargo : f.cargoAtual;
  }
  function getFaixaSalarialByStep(step, cargo) {
    var row = getSalaryRangeForCargo(cargo || getProposedCargo()).filter(function (item) { return item.step === step; })[0];
    return row ? row.faixa : "";
  }
  function getStepSalary(step, cargo) {
    return parseMoney(getFaixaSalarialByStep(step, cargo));
  }
  function getSuggestedStepBySalary(step, salary, cargo) {
    var table = getSalaryRangeForCargo(cargo);
    var currentRange = getStepSalary(step, cargo);
    if (!salary || salary <= currentRange) return step;
    for (var i = 0; i < table.length; i++) {
      if (salary <= parseMoney(table[i].faixa)) return table[i].step;
    }
    return table[table.length - 1].step;
  }
  function getStepFromNivel(value) {
    var match = String(value || "").match(/Step\s*\d+/i);
    return match ? match[0].replace(/step/i, "Step") : "";
  }
  function getNivelBase(value) {
    return String(value || "").split(" - Step")[0] || "";
  }
  function getNivelByStep(step) {
    var base = getNivelBase(state.form.nivelAtual);
    return base ? base + " - " + step : step;
  }
  function getDescricaoCargo(cargo) {
    return rm.descricoesCargo[cargo] || "";
  }
  function updateEnquadramentoCalculations() {
    var f = state.form;
    if (f.tipoMovimentacao !== "Enquadramento") return;
    var selectedStep = f.novoStep || f.stepAtual;
    var cargo = f.cargoAtual;
    var stepSalary = getStepSalary(selectedStep, cargo);
    var currentSalary = parseMoney(f.salarioAtual);
    var newSalary = parseMoney(f.novoSalario);
    var suggestedStep = getSuggestedStepBySalary(selectedStep, newSalary, cargo);
    var suggestedSalary = newSalary > stepSalary ? newSalary : stepSalary;
    var diff = suggestedSalary - currentSalary;
    f.stepSugerido = suggestedStep;
    f.salarioSugerido = formatCurrency(suggestedSalary);
    f.diferencaValor = formatCurrency(diff);
    f.diferencaPercentual = currentSalary ? (diff / currentSalary * 100).toFixed(2).replace(".", ",") + "%" : "0,00%";
  }
  function syncEnquadramentoFields() {
    ["stepSugerido", "salarioSugerido", "diferencaValor", "diferencaPercentual"].forEach(function (name) {
      var node = document.querySelector('[data-field="' + name + '"]');
      if (node) node.value = state.form[name] || "";
    });
  }

  render();

  function render() {
    if (statusLabel) statusLabel.textContent = state.status;
    if (stageNav) stageNav.innerHTML = stages.map(renderStageCard).join("");
    if (appView) renderView();
    bindEvents();
  }

  function renderStageCard(stage) {
    var active = stage.key === state.stage ? " lx-stage-current" : "";
    return '<a class="lx-stage-card' + active + '" href="' + getStageUrl(stage.key) + '" data-stage="' + stage.key + '">' +
      '<span class="lx-stage-icon lx-dot-' + stage.tone + '"><i class="fa-solid ' + stage.icon + '"></i></span>' +
      '<div><h3>' + stage.title + '</h3><p>' + stage.desc + '</p></div></a>';
  }

  function renderView() {
    var stage = getStage(state.stage);
    var body = state.stage === "solicitacao"
      ? renderSolicitacao()
      : viewComponent(stage.title, stage.desc, "Em desenho", '<div class="lx-career-alert"><i class="fa-solid fa-circle-info"></i><div>Esta etapa será construída depois da tela inicial de solicitação estar validada.</div></div>', "", stage.icon, stage.tone);
    appView.innerHTML = state.stage === "solicitacao" ? viewComponent(stage.title, stage.desc, state.status, body, "", stage.icon, stage.tone) : body;
  }

  function viewComponent(title, description, pill, body, extraClass, icon, tone) {
    var stage = getStage(state.stage);
    return '<div class="lx-view-frame"><div class="lx-view-rail"></div>' +
      '<div class="lx-timeline-dot lx-dot-' + (tone || stage.tone || "blue") + '"><i class="fa-solid ' + (icon || stage.icon || "fa-pen-to-square") + '"></i></div>' +
      '<div class="lx-view-shell ' + (extraClass || "") + '"><div class="lx-view-head"><div><h2>' + title + '</h2><p>' + description + '</p></div>' + (pill ? '<span class="lx-pill">' + pill + '</span>' : "") + '</div><div class="lx-view-body">' + body + '</div></div></div>';
  }

  function renderSolicitacao() {
    var f = state.form;
    return section("Dados do Solicitante", "user", grid([
      field("Data/Hora", "data", f.data, true, true),
      field("Solicitante", "solicitante", f.solicitante, true, true),
      field("Filial", "filial", f.filial, true, true),
      field("Gerência", "gerencia", f.gerencia, true, true),
      field("Gestor Imediato", "gestor", f.gestor, true, true),
      field("Área Diretoria", "areaDiretoria", f.areaDiretoria, true, true)
    ], "lx-grid-4")) +
    section("Dados da Movimentação de Carreira", "id-badge",
      formFieldset("Dados do Colaborador", "user-tie", grid([
        singleSelect("Colaborador", "colaborador", f.colaborador, rm.colaboradores.map(function (item) { return item.nome; }), true),
        field("Matrícula", "chapa", f.chapa, true, true),
        field("Data de Admissão", "admissao", f.admissao, true, true),
        field("Cargo Atual", "cargoAtual", f.cargoAtual, true, true),
        field("Função Atual", "funcaoAtual", f.funcaoAtual, true, true),
        field("Nível Atual", "nivelAtual", f.nivelAtual, true, true),
        field("Setor / Seção Atual", "secaoAtual", f.secaoAtual, true, true),
        field("Centro de Custo Atual", "centroAtual", f.centroAtual, true, true),
        readonlyTextarea("Descrição do Cargo Atual", "descricaoCargoAtual", f.descricaoCargoAtual, true),
        field("Escala Atual", "escalaAtual", f.escalaAtual, true, true),
        field("Horário Atual", "horarioAtual", f.horarioAtual, true, true),
        field("Step Atual", "stepAtual", f.stepAtual, true, true),
        field("Faixa Salarial Atual", "faixaAtual", f.faixaAtual, true, true),
        field("Salário Atual", "salarioAtual", f.salarioAtual, true, true)
      ], "lx-career-current-grid")) +
      grid([
        radioGroup("Tipo da Movimentação", "tipoMovimentacao", f.tipoMovimentacao, ["Promoção", "Progressão", "Enquadramento"], true)
      ], "lx-career-type-grid") +
      formFieldset("Movimentação Proposta", "chart-line",
        renderMovementTypeFields() +
        renderSalaryRangeComponent() +
        textarea("Observações adicionais", "observacoes", f.observacoes, false)
      )
    ) +
    (f.tipoMovimentacao === "Promoção" ? formFieldset("Infraestrutura e Equipamentos", "laptop", renderInfrastructure()) : "") +
    section("Comparação Atual x Proposto", "table-columns", renderComparison()) +
    renderAttachmentsEditor("anexos", "Upload de Arquivos", "paperclip") +
    formFieldset("Justificativa", "comment-dots", textarea("Justificativa da " + f.tipoMovimentacao, "justificativa", f.justificativa, true)) +
    '<div class="lx-actions"><button class="lx-btn lx-btn-secondary" type="button" data-action="draft"><i class="fa-solid fa-save"></i> Salvar rascunho</button><button class="lx-btn lx-btn-primary" type="button" data-action="submit"><i class="fa-solid fa-paper-plane"></i> Enviar para aprovação</button></div>';
  }

  function renderMovementTypeFields() {
    var f = state.form;
    if (f.tipoMovimentacao === "Promoção") {
      return grid([
        singleSelect("Novo Cargo", "novoCargo", f.novoCargo, rm.cargos, true),
        singleSelect("Nova Função", "novaFuncao", f.novaFuncao, rm.funcoes, true),
        singleSelect("Novo Nível", "novoNivel", f.novoNivel, rm.niveis, true),
        readonlyTextarea("Descrição do Cargo", "descricaoCargoProposto", f.descricaoCargoProposto, true),
        field("Nova Faixa Salarial", "novaFaixa", f.novaFaixa, true, true),
        field("Novo Salário", "novoSalario", f.novoSalario, true),
        singleSelect("Nova Escala", "novaEscala", f.novaEscala, rm.escalas.map(function (item) { return item.nome; }), true),
        field("Novo Horário", "novoHorario", f.novoHorario, true, true),
        field("Data de Início da Vigência", "dataVigencia", f.dataVigencia, true, false, "date")
      ], "lx-career-proposed-grid lx-career-promotion-grid");
    }
    if (f.tipoMovimentacao === "Progressão") {
      return grid([
        field("Cargo após movimentação", "cargoAtual", f.cargoAtual, true, true),
        field("Função após movimentação", "funcaoAtual", f.funcaoAtual, true, true),
        singleSelect("Novo Nível", "novoNivel", f.novoNivel, rm.niveis, true),
        readonlyTextarea("Descrição do Cargo", "descricaoCargoProposto", f.descricaoCargoProposto, true),
        field("Nova Faixa Salarial", "novaFaixa", f.novaFaixa, true, true),
        field("Novo Salário", "novoSalario", f.novoSalario, true),
        field("Data de Início da Vigência", "dataVigencia", f.dataVigencia, true, false, "date")
      ], "lx-career-proposed-grid lx-career-progression-grid");
    }
    return grid([
        field("Step correto sugerido", "stepSugerido", f.stepSugerido, true, true),
        field("Salário correspondente ao Step sugerido", "salarioSugerido", f.salarioSugerido, true, true),
        field("Diferença salarial em valor", "diferencaValor", f.diferencaValor, true, true),
        field("Diferença salarial em percentual", "diferencaPercentual", f.diferencaPercentual, true, true),
        singleSelect("Nova Step", "novoStep", f.novoStep, rm.steps, true),
        field("Novo Nível", "novoNivel", f.novoNivel, true, true),
        field("Nova Faixa Salarial", "novaFaixa", f.novaFaixa, true, true),
        field("Novo Salário Enquadrado", "novoSalario", f.novoSalario, true),
        field("Data de Início da Vigência", "dataVigencia", f.dataVigencia, true, false, "date")
      ], "lx-career-proposed-grid lx-career-enquadramento-grid");
  }

  function renderSalaryRangeComponent() {
    var f = state.form;
    var cargo = getProposedCargo();
    if (f.tipoMovimentacao === "Promoção" && !cargo) return "";
    if (!cargo) return "";
    var highlightStep = f.tipoMovimentacao === "Enquadramento" ? f.stepSugerido : f.novoStep;
    return '<div class="lx-career-salary-range"><div class="lx-career-salary-title"><i class="fa-solid fa-layer-group"></i><div><strong>Faixa Salarial do Cargo</strong><span>' + escapeHtml(cargo) + '</span></div></div>' +
      '<div class="lx-read-table lx-salary-range-table"><div class="lx-read-head"><span>Step</span><span>Faixa Salarial</span><span>Referência</span></div>' +
      getSalaryRangeForCargo(cargo).map(function (row) {
        var active = row.step === highlightStep ? " lx-salary-range-active" : "";
        return '<div class="lx-read-row' + active + '"><strong>' + escapeHtml(row.step) + '</strong><strong>' + escapeHtml(row.faixa) + '</strong><span>' + escapeHtml(row.referencia || "-") + '</span></div>';
      }).join("") + '</div></div>';
  }

  function renderComparison() {
    var f = state.form;
    var rows = [
      ["Cargo", f.cargoAtual, f.tipoMovimentacao === "Promoção" ? f.novoCargo : f.cargoAtual],
      ["Função", f.funcaoAtual, f.tipoMovimentacao === "Promoção" ? f.novaFuncao : f.funcaoAtual],
      ["Nível", f.nivelAtual, f.novoNivel],
      ["Step", f.stepAtual, f.novoStep],
      ["Faixa Salarial", f.faixaAtual, f.novaFaixa],
      ["Salário", f.salarioAtual, f.novoSalario],
      ["Escala", f.escalaAtual, f.tipoMovimentacao === "Promoção" ? f.novaEscala : f.escalaAtual],
      ["Horário", f.horarioAtual, f.tipoMovimentacao === "Promoção" ? f.novoHorario : f.horarioAtual]
    ];
    return '<div class="lx-read-table lx-career-comparison"><div class="lx-read-head"><span>Campo</span><span>Atual</span><span>Proposto</span></div>' +
      rows.map(function (row) { return '<div class="lx-read-row"><strong>' + escapeHtml(row[0]) + '</strong><strong>' + escapeHtml(row[1]) + '</strong><strong>' + escapeHtml(row[2]) + '</strong></div>'; }).join("") +
      '</div>';
  }

  function renderInfrastructure() {
    var f = state.form;
    return formFieldset("Equipamentos Atuais", "laptop",
      radioGroup("O colaborador utiliza equipamentos atualmente?", "usaEquipamentoAtual", f.usaEquipamentoAtual, ["Sim", "Não"], true) +
      (f.usaEquipamentoAtual === "Sim" ? renderCurrentEquipments() : radioGroup("O novo cargo / função necessita equipamentos?", "novoCargoPrecisaEquipamento", f.novoCargoPrecisaEquipamento, ["Sim", "Não"], true))
    ) +
    (needsNewEquipmentBlock() ? formFieldset("Equipamentos Necessários", "desktop", renderRequiredEquipments()) : "");
  }

  function renderCurrentEquipments() {
    return '<div class="lx-child-table lx-origin-equipment-table"><button class="lx-btn lx-btn-primary" type="button" data-action="add-current-equipment"><i class="fa-solid fa-plus"></i> Adicionar equipamento</button>' +
      state.form.equipamentosOrigem.map(function (item, index) {
        return '<div class="lx-child-row lx-career-equipment-row lx-career-current-equipment-row">' +
          singleSelect("Equipamento", "equipamento", item.equipamento, rm.equipamentos, true, "currentEquipment", index) +
          field("Quantidade", "quantidade", item.quantidade, true, true, "text", "currentEquipment", index) +
          textareaScoped("Destino do Equipamento", "destino", item.destino, true, "currentEquipment", index) +
          '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-current-equipment" data-index="' + index + '" aria-label="Excluir equipamento"><i class="fa-solid fa-trash"></i></button>' +
        '</div>';
      }).join("") + '</div>';
  }

  function renderRequiredEquipments() {
    return '<div class="lx-child-table"><button class="lx-btn lx-btn-primary" type="button" data-action="add-required-equipment"><i class="fa-solid fa-plus"></i> Adicionar equipamento</button>' +
      state.form.equipamentosNecessarios.map(function (item, index) {
        return '<div class="lx-child-row lx-career-equipment-row lx-career-required-equipment-row">' +
          singleSelect("Equipamento", "equipamento", item.equipamento, rm.equipamentos, true, "requiredEquipment", index) +
          field("Quantidade", "quantidade", item.quantidade, true, false, "number", "requiredEquipment", index) +
          textareaScoped("Observações", "observacao", item.observacao, false, "requiredEquipment", index) +
          '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-required-equipment" data-index="' + index + '" aria-label="Excluir equipamento"><i class="fa-solid fa-trash"></i></button>' +
        '</div>';
      }).join("") + '</div>';
  }

  function needsNewEquipmentBlock() {
    return state.form.usaEquipamentoAtual === "Sim" || state.form.novoCargoPrecisaEquipamento === "Sim";
  }

  function section(title, icon, content) {
    return '<div class="lx-section"><div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid fa-' + icon + '"></i></span><h2>' + title + '</h2></div></div><div class="lx-view-body">' + content + '</div></div>';
  }
  function formFieldset(title, icon, content) { return '<fieldset class="lx-fieldset"><legend><i class="fa-solid fa-' + icon + '"></i> ' + title + '</legend>' + content + '</fieldset>'; }
  function grid(items, className) { return '<div class="' + className + '">' + items.join("") + '</div>'; }
  function fieldClass(name, scope) { return "lx-field-name-" + (scope ? scope + "-" : "") + name; }
  function scopedAttrs(scope, index) { return scope ? ' data-scope="' + scope + '" data-index="' + index + '"' : ""; }
  function scopedName(scope, index, name) { return scope ? scope + "." + index + "." + name : name; }
  function errorHtml(error) { return error ? '<small class="lx-error-message">' + escapeHtml(error) + '</small>' : ""; }
  function field(label, name, value, required, readonly, type, scope, index) {
    var key = scopedName(scope, index, name);
    var error = state.errors[key] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><input type="' + (type || "text") + '" data-field="' + name + '"' + scopedAttrs(scope, index) + (readonly ? " readonly" : "") + ' value="' + escapeHtml(value) + '" />' + errorHtml(error) + '</label>';
  }
  function textarea(label, name, value, required) {
    var error = state.errors[name] || "";
    return '<label class="lx-field ' + fieldClass(name) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea data-field="' + name + '">' + escapeHtml(value) + '</textarea>' + errorHtml(error) + '</label>';
  }
  function readonlyTextarea(label, name, value, required) {
    return '<label class="lx-field ' + fieldClass(name) + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea readonly>' + escapeHtml(value) + '</textarea></label>';
  }
  function textareaScoped(label, name, value, required, scope, index) {
    var key = scopedName(scope, index, name);
    var error = state.errors[key] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea data-field="' + name + '"' + scopedAttrs(scope, index) + '>' + escapeHtml(value) + '</textarea>' + errorHtml(error) + '</label>';
  }
  function selectScoped(label, name, value, options, required, scope, index) {
    var key = scopedName(scope, index, name);
    var error = state.errors[key] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><select data-field="' + name + '"' + scopedAttrs(scope, index) + '>' + options.map(function (option) { return '<option' + (option === value ? " selected" : "") + '>' + escapeHtml(option) + '</option>'; }).join("") + '</select>' + errorHtml(error) + '</label>';
  }
  function radioGroup(label, name, value, options, required) {
    var error = state.errors[name] || "";
    var radioName = name + "_" + radioCounter++;
    return '<div class="lx-field lx-radio-field ' + fieldClass(name) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><div class="lx-radio-options">' + options.map(function (option) {
      return '<label class="lx-radio-option' + (option === value ? " lx-radio-option-selected" : "") + '"><input type="radio" name="' + radioName + '" data-field="' + name + '" value="' + escapeHtml(option) + '"' + (option === value ? " checked" : "") + ' /><strong>' + escapeHtml(option) + '</strong></label>';
    }).join("") + '</div>' + errorHtml(error) + '</div>';
  }
  function singleSelect(label, name, value, options, required, scope, index) {
    var key = scopedName(scope, index, name);
    var error = state.errors[key] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><div class="lx-single-select' + (value ? " has-value" : "") + '" data-single-select data-field="' + name + '"' + scopedAttrs(scope, index) + '><div class="lx-single-select-control"><span class="lx-tag" data-selected-text>' + escapeHtml(value) + ' <button type="button" data-clear-select aria-label="Remover">x</button></span><input data-select-input placeholder="Pesquisar ' + label.toLowerCase() + '..." /></div><div class="lx-select-list lx-hidden">' + options.map(function (option) { return '<button type="button" data-select-option="' + escapeHtml(option) + '">' + escapeHtml(option) + '</button>'; }).join("") + '</div></div>' + errorHtml(error) + '</label>';
  }
  function renderAttachmentsEditor(fieldName, title, icon) {
    return formFieldset(title, icon, '<div class="lx-dropzone" data-dropzone="' + fieldName + '"><i class="fa-solid fa-cloud-arrow-up"></i><p>Arraste e solte seus arquivos aqui</p><span>ou</span><button type="button" class="lx-btn-outline">Escolher arquivo</button><input type="file" class="lx-file-input" data-file-upload="' + fieldName + '" multiple /></div>' + renderAttachmentsList(state.form[fieldName] || [], fieldName, true));
  }
  function renderAttachmentsList(files, fieldName, editable) {
    if (!files.length) return '<div class="lx-empty-list">Nenhum arquivo anexado.</div>';
    return '<div class="lx-attachment-list">' + files.map(function (file, index) {
      return '<div class="lx-attachment-row"><div class="lx-attachment-info"><i class="fa-solid fa-file-lines"></i><div><strong>' + escapeHtml(file.nome) + '</strong><span>' + escapeHtml(file.tamanho || "-") + ' - ' + escapeHtml(file.origem || "Anexo") + '</span></div></div><div class="lx-attachment-actions"><button class="lx-btn-icon lx-btn-secondary" type="button" data-action="view-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Visualizar anexo"><i class="fa-solid fa-eye"></i></button>' + (editable ? '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Excluir anexo"><i class="fa-solid fa-trash"></i></button>' : "") + '</div></div>';
    }).join("") + '</div>';
  }

  function bindEvents() {
    document.querySelectorAll("[data-stage]").forEach(function (card) { card.addEventListener("click", function (event) { event.preventDefault(); window.location.href = card.getAttribute("href"); }); });
    document.querySelectorAll("[data-field]").forEach(function (node) { if (node.hasAttribute("data-single-select")) return; node.addEventListener("input", updateFieldFromEvent); node.addEventListener("change", updateFieldFromEvent); });
    bindSingleSelects();
    document.querySelectorAll("[data-action]").forEach(function (button) { button.addEventListener("click", handleAction); });
    document.querySelectorAll("[data-file-upload]").forEach(function (input) { input.addEventListener("change", handleFileUpload); });
    document.querySelectorAll("[data-dropzone]").forEach(function (dropzone) {
      var input = dropzone.querySelector("[data-file-upload]");
      if (!input) return;
      dropzone.addEventListener("click", function () { input.click(); });
      dropzone.addEventListener("dragover", function (event) { event.preventDefault(); dropzone.classList.add("lx-drag-over"); });
      dropzone.addEventListener("dragleave", function () { dropzone.classList.remove("lx-drag-over"); });
      dropzone.addEventListener("drop", function (event) { event.preventDefault(); dropzone.classList.remove("lx-drag-over"); addFilesToAttachmentList(dropzone.getAttribute("data-dropzone"), event.dataTransfer && event.dataTransfer.files); render(); });
    });
  }
  function bindSingleSelects() {
    document.querySelectorAll("[data-single-select]").forEach(function (selectNode) {
      var list = selectNode.querySelector(".lx-select-list");
      var clear = selectNode.querySelector("[data-clear-select]");
      selectNode.querySelector(".lx-single-select-control").addEventListener("click", function () { closeSelectLists(list); list.classList.remove("lx-hidden"); });
      if (clear) clear.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); setSingleSelectValue(selectNode, ""); });
      selectNode.querySelectorAll("[data-select-option]").forEach(function (option) { option.addEventListener("click", function () { setSingleSelectValue(selectNode, option.getAttribute("data-select-option")); }); });
    });
  }
  function closeSelectLists(except) { document.querySelectorAll(".lx-select-list").forEach(function (list) { if (list !== except) list.classList.add("lx-hidden"); }); }
  function setSingleSelectValue(selectNode, value) {
    var scope = selectNode.getAttribute("data-scope");
    var index = Number(selectNode.getAttribute("data-index"));
    var name = selectNode.getAttribute("data-field");
    if (scope === "currentEquipment") state.form.equipamentosOrigem[index][name] = value;
    else if (scope === "requiredEquipment") state.form.equipamentosNecessarios[index][name] = value;
    else { state.form[name] = value; applyAutoFill(name, value); }
    state.errors = {};
    render();
  }
  function updateFieldFromEvent(event) {
    var node = event.target;
    var name = node.getAttribute("data-field");
    var scope = node.getAttribute("data-scope");
    var index = Number(node.getAttribute("data-index"));
    var value = node.value;
    if (name === "novoSalario") value = formatMoney(value);
    if (scope === "currentEquipment") state.form.equipamentosOrigem[index][name] = value;
    else if (scope === "requiredEquipment") state.form.equipamentosNecessarios[index][name] = value;
    else { state.form[name] = value; applyAutoFill(name, value); }
    state.errors = {};
    if (name === "novoSalario" && event.type === "input") {
      node.value = value;
      syncEnquadramentoFields();
      return;
    }
    if (name === "dataVigencia" && value && value < todayValue()) {
      state.errors.dataVigencia = "A data de início da vigência não pode ser menor que a data atual.";
      showModal({ title: "Data inválida", message: "A data de início da vigência não pode ser menor que a data atual.", icon: "fa-triangle-exclamation", confirmText: "Entendi", cancelText: "Fechar", onConfirm: hideModal });
    }
    render();
  }
  function applyAutoFill(name, value) {
    var f = state.form;
    if (name === "colaborador") {
      var colaborador = rm.colaboradores.filter(function (item) { return item.nome === value; })[0];
      if (!colaborador) return clearCollaboratorFields();
      f.chapa = colaborador.chapa; f.admissao = colaborador.admissao; f.cargoAtual = colaborador.cargo; f.funcaoAtual = colaborador.funcao; f.descricaoCargoAtual = colaborador.descricaoCargo; f.nivelAtual = colaborador.nivel; f.stepAtual = colaborador.step; f.faixaAtual = getFaixaSalarialByStep(colaborador.step, colaborador.cargo); f.salarioAtual = colaborador.salario; f.escalaAtual = colaborador.escala; f.horarioAtual = colaborador.horario; f.secaoAtual = colaborador.secao; f.centroAtual = colaborador.centro;
      applyMovementDefaults(f.tipoMovimentacao);
    }
    if (name === "novoCargo") {
      f.descricaoCargoProposto = getDescricaoCargo(value);
      if (f.tipoMovimentacao === "Promoção") f.novaFaixa = value ? getFaixaSalarialByStep(f.novoStep, value) : "";
    }
    if (name === "novaEscala") {
      var escala = rm.escalas.filter(function (item) { return item.nome === value; })[0];
      f.novoHorario = escala ? escala.horario : "";
    }
    if (name === "novoNivel") {
      f.novoStep = getStepFromNivel(value);
      f.novaFaixa = getFaixaSalarialByStep(f.novoStep, getProposedCargo());
    }
    if (name === "novoStep") {
      f.novoNivel = getNivelByStep(value);
      f.novaFaixa = getFaixaSalarialByStep(value, getProposedCargo());
      updateEnquadramentoCalculations();
    }
    if (name === "novoSalario") updateEnquadramentoCalculations();
    if (name === "tipoMovimentacao") applyMovementDefaults(value);
  }
  function clearCollaboratorFields() {
    var f = state.form;
    f.chapa = ""; f.admissao = ""; f.cargoAtual = ""; f.funcaoAtual = ""; f.descricaoCargoAtual = ""; f.nivelAtual = ""; f.stepAtual = ""; f.faixaAtual = ""; f.salarioAtual = ""; f.escalaAtual = ""; f.horarioAtual = ""; f.secaoAtual = ""; f.centroAtual = "";
    f.novoCargo = ""; f.novaFuncao = ""; f.descricaoCargoProposto = ""; f.novoNivel = ""; f.novoStep = ""; f.novaFaixa = ""; f.novoSalario = ""; f.novaEscala = ""; f.novoHorario = "";
  }
  function applyMovementDefaults(type) {
    var f = state.form;
    if (type === "Promoção") {
      f.novoCargo = "Analista de Qualidade"; f.novaFuncao = "Analista de Controle de Qualidade"; f.descricaoCargoProposto = getDescricaoCargo(f.novoCargo); f.novoNivel = "Pleno - Step 2"; f.novoStep = getStepFromNivel(f.novoNivel); f.novaFaixa = getFaixaSalarialByStep(f.novoStep, f.novoCargo); f.novoSalario = "R$ 4.800,00"; f.novaEscala = "5x1"; f.novoHorario = "08:00 às 17:48";
    }
    if (type === "Progressão") {
      f.novoCargo = f.cargoAtual; f.novaFuncao = f.funcaoAtual; f.descricaoCargoProposto = f.descricaoCargoAtual; f.novoNivel = "Operacional - Step 3"; f.novoStep = getStepFromNivel(f.novoNivel); f.novaFaixa = getFaixaSalarialByStep(f.novoStep, f.cargoAtual); f.novoSalario = "R$ 3.750,00"; f.novaEscala = f.escalaAtual; f.novoHorario = f.horarioAtual;
    }
    if (type === "Enquadramento") {
      f.novoCargo = f.cargoAtual; f.novaFuncao = f.funcaoAtual; f.descricaoCargoProposto = f.descricaoCargoAtual; f.novoNivel = f.nivelAtual; f.novoStep = f.stepAtual; f.novaFaixa = getFaixaSalarialByStep(f.novoStep, f.cargoAtual); f.novoSalario = f.salarioAtual; f.novaEscala = f.escalaAtual; f.novoHorario = f.horarioAtual;
      updateEnquadramentoCalculations();
    }
  }

  function handleAction(event) {
    var action = event.currentTarget.getAttribute("data-action");
    if (action === "draft") showModal({ title: "Salvar rascunho", message: "Deseja salvar os dados preenchidos até o momento?", icon: "fa-save", confirmText: "Salvar", onConfirm: function () { state.status = "Rascunho salvo"; hideModal(); render(); } });
    if (action === "submit") { if (!validateSolicitacao()) return renderAndScroll(); showModal({ title: "Enviar solicitação", message: "Deseja enviar a movimentação de carreira para aprovação?", icon: "fa-paper-plane", confirmText: "Enviar", onConfirm: function () { state.status = "Enviado para aprovação"; hideModal(); render(); } }); }
    if (action === "add-current-equipment") { state.form.equipamentosOrigem.push({ equipamento: "", quantidade: "1", destino: "" }); render(); }
    if (action === "delete-current-equipment") { var currentIndex = Number(event.currentTarget.getAttribute("data-index")); showDelete("Deseja remover este equipamento atual?", function () { state.form.equipamentosOrigem.splice(currentIndex, 1); }); }
    if (action === "add-required-equipment") { state.form.equipamentosNecessarios.push({ equipamento: "", quantidade: "1", observacao: "" }); render(); }
    if (action === "delete-required-equipment") { var requiredIndex = Number(event.currentTarget.getAttribute("data-index")); showDelete("Deseja remover este equipamento necessário?", function () { state.form.equipamentosNecessarios.splice(requiredIndex, 1); }); }
    if (action === "delete-attachment") { var attachmentIndex = Number(event.currentTarget.getAttribute("data-index")); showDelete("Deseja remover este arquivo anexado?", function () { state.form.anexos.splice(attachmentIndex, 1); }); }
    if (action === "view-attachment") { var file = state.form.anexos[Number(event.currentTarget.getAttribute("data-index"))]; showModal({ title: file ? file.nome : "Visualizar anexo", message: file ? "Prévia simulada do anexo selecionado." : "Anexo não encontrado.", icon: "fa-eye", confirmText: "Fechar", hideCancel: true, onConfirm: hideModal }); }
  }
  function showDelete(message, onConfirm) {
    showModal({ title: "Excluir item", message: message, icon: "fa-trash", confirmText: "Excluir", onConfirm: function () { onConfirm(); hideModal(); render(); } });
  }
  function validateSolicitacao() {
    var f = state.form;
    var errors = {};
    ["colaborador", "tipoMovimentacao", "dataVigencia", "justificativa"].forEach(function (name) { if (!String(f[name] || "").trim()) errors[name] = "Campo obrigatório."; });
    if (f.dataVigencia && f.dataVigencia < todayValue()) errors.dataVigencia = "A data de início da vigência não pode ser menor que a data atual.";
    if (f.tipoMovimentacao === "Promoção") {
      ["novoCargo", "novaFuncao", "novoNivel", "novaFaixa", "novoSalario", "novaEscala", "novoHorario"].forEach(function (name) { if (!String(f[name] || "").trim()) errors[name] = "Campo obrigatório."; });
      if (f.novoCargo === f.cargoAtual) errors.novoCargo = "Promoção deve alterar o cargo.";
      if (f.novaFuncao === f.funcaoAtual) errors.novaFuncao = "Promoção deve alterar a função.";
      if (f.usaEquipamentoAtual === "Sim" && !f.equipamentosOrigem.length) errors.usaEquipamentoAtual = "Informe os equipamentos utilizados atualmente.";
      if (needsNewEquipmentBlock() && !f.equipamentosNecessarios.length) errors.novoCargoPrecisaEquipamento = "Informe os equipamentos necessários.";
    }
    if (f.tipoMovimentacao === "Progressão") {
      ["novoNivel", "novaFaixa", "novoSalario"].forEach(function (name) { if (!String(f[name] || "").trim()) errors[name] = "Campo obrigatório."; });
      if (f.novoCargo !== f.cargoAtual || f.novaFuncao !== f.funcaoAtual) errors.tipoMovimentacao = "Progressão não pode alterar cargo ou função. Utilize Promoção.";
    }
    if (f.tipoMovimentacao === "Enquadramento") {
      ["novoStep", "novoNivel", "novaFaixa", "novoSalario"].forEach(function (name) { if (!String(f[name] || "").trim()) errors[name] = "Campo obrigatório."; });
      if (f.novoCargo !== f.cargoAtual || f.novaFuncao !== f.funcaoAtual) errors.tipoMovimentacao = "Enquadramento não pode alterar cargo ou função. Utilize Promoção.";
    }
    f.equipamentosOrigem.forEach(function (item, index) {
      if (!String(item.equipamento || "").trim()) errors["currentEquipment." + index + ".equipamento"] = "Campo obrigatório.";
      if (!String(item.quantidade || "").trim() || Number(item.quantidade) <= 0) errors["currentEquipment." + index + ".quantidade"] = "Quantidade inválida.";
      if (!String(item.destino || "").trim()) errors["currentEquipment." + index + ".destino"] = "Campo obrigatório.";
    });
    f.equipamentosNecessarios.forEach(function (item, index) {
      if (!String(item.equipamento || "").trim()) errors["requiredEquipment." + index + ".equipamento"] = "Campo obrigatório.";
      if (!String(item.quantidade || "").trim() || Number(item.quantidade) <= 0) errors["requiredEquipment." + index + ".quantidade"] = "Quantidade inválida.";
    });
    state.errors = errors;
    return Object.keys(errors).length === 0;
  }
  function renderAndScroll() {
    render();
    window.requestAnimationFrame(function () {
      var firstError = document.querySelector(".lx-error");
      if (!firstError) return;
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      var focusable = firstError.querySelector("input:not([readonly]), select, textarea, [data-select-input]");
      if (focusable) focusable.focus({ preventScroll: true });
    });
  }
  function handleFileUpload(event) { addFilesToAttachmentList(event.target.files); render(); }
  function addFilesToAttachmentList(files) {
    if (!files || !files.length) return;
    for (var i = 0; i < files.length; i++) state.form.anexos.push({ nome: files[i].name, tamanho: formatFileSize(files[i].size), origem: "Solicitação" });
  }
  function formatFileSize(size) { if (!size) return "0 KB"; if (size < 1024 * 1024) return Math.max(1, Math.round(size / 1024)) + " KB"; return (size / 1024 / 1024).toFixed(1).replace(".", ",") + " MB"; }
  function showModal(options) {
    modal.title.textContent = options.title || "Confirmação";
    modal.message.innerHTML = options.html || escapeHtml(options.message || "");
    modal.icon.innerHTML = '<i class="fa-solid ' + (options.icon || "fa-circle-question") + '"></i>';
    modal.confirm.textContent = options.confirmText || "Confirmar";
    modal.cancel.textContent = options.cancelText || "Cancelar";
    modal.cancel.classList.toggle("lx-hidden", !!options.hideCancel);
    modal.action = options.onConfirm || hideModal;
    modal.wrap.classList.remove("lx-hidden");
  }
  function hideModal() { modal.wrap.classList.add("lx-hidden"); modal.action = null; }
  if (modal.cancel) modal.cancel.addEventListener("click", hideModal);
  if (modal.confirm) modal.confirm.addEventListener("click", function () { if (modal.action) modal.action(); });
})();

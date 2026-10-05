(function () {
  var rm = {
    usuario: {
      numero: "MOV-2026-0042",
      data: "01/10/2026 09:18",
      gestorCedente: "Eduardo Martins",
      gerenciaOrigem: "Gerência Industrial",
      gestorRecebedor: "Patrícia Almeida",
      gerenciaDestino: "Gerência de Qualidade",
      diretorDestino: "Roberto Siqueira",
      seguranca: "Marcos Oliveira",
      gestorRh: "Ricardo Nunes",
      filial: "Matriz - Sarzedo/MG"
    },
    colaboradores: [
      { nome: "Carlos Pereira", chapa: "000731", admissao: "14/03/2019", empresa: "Lonax Indústria Brasileira de Lonas", cargo: "Operador de Produção", funcao: "Operador de Extrusora", nivel: "Operacional - Step 2", descricaoCargoAtual: "Operar máquinas de extrusão, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.", secao: "Produção", centro: "IND.PRO.001", escala: "6x1", horario: "06:00 às 14:00" },
      { nome: "Fernanda Lima", chapa: "000918", admissao: "22/08/2021", empresa: "Lonax Indústria Brasileira de Lonas", cargo: "Assistente Administrativo", funcao: "Assistente Administrativo", nivel: "Administrativo - Step 1", descricaoCargoAtual: "Executar rotinas administrativas, controlar documentos, apoiar lançamentos e organizar informações da área.", secao: "Administração", centro: "ADM.GER.002", escala: "5x1", horario: "08:00 às 17:48" }
    ],
    cargos: ["Analista de Qualidade", "Operador de Produção", "Técnico de Segurança", "Assistente Administrativo"],
    funcoes: ["Analista de Controle de Qualidade", "Operador de Extrusora", "Técnico de Segurança do Trabalho", "Assistente Administrativo"],
    niveis: ["Operacional - Step 2", "Técnico - Step 1", "Pleno - Step 2", "Sênior - Step 3"],
    setores: [
      { nome: "Produção", centro: "IND.PRO.001", gerencia: "Gerência Industrial" },
      { nome: "Administração", centro: "ADM.GER.002", gerencia: "Administração" },
      { nome: "Expedição", centro: "LOG.EXP.003", gerencia: "Logística" },
      { nome: "Manutenção", centro: "IND.MAN.005", gerencia: "Gerência Industrial" }
    ],
    escalas: [
      { nome: "5x1", horario: "08:00 às 17:48" },
      { nome: "6x1", horario: "06:00 às 14:00" },
      { nome: "12x36", horario: "19:00 às 07:00" }
    ],
    equipamentos: ["Notebook / Computador", "Monitor", "Telefone", "Celular", "Outros"]
  };

  var stages = [
    { key: "cedente", title: "Solicitar Movimentação de Pessoal", icon: "fa-user-pen", tone: "blue", desc: "Seleção do colaborador, dados atuais e infraestrutura da origem." },
    { key: "recebedor", title: "Aprovação Gestor Recebedor", icon: "fa-people-arrows", tone: "green", desc: "Complemento da movimentação, destino, início e comparação." },
    { key: "diretoria", title: "Aprovação Diretoria Recebedora", icon: "fa-building-user", tone: "purple", desc: "Validação pela diretoria da área de destino." },
    { key: "seguranca", title: "Aprovação Segurança do Trabalho", icon: "fa-helmet-safety", tone: "orange", desc: "Validação obrigatória quando houver mudança de função." },
    { key: "rh", title: "Aprovação RH", icon: "fa-users-gear", tone: "teal", desc: "Conferência final e aprovação da movimentação." },
    { key: "correcao", title: "Correção do Gestor Recebedor", icon: "fa-rotate-left", tone: "slate", desc: "Ajuste de informações após devolução." },
    { key: "reprovada", title: "Movimentação Reprovada", icon: "fa-ban", tone: "red", desc: "Visualização da movimentação reprovada." },
    { key: "finalizada", title: "Movimentação Finalizada", icon: "fa-circle-check", tone: "green", desc: "Movimentação aprovada e concluída." },
    { key: "equipamentos", title: "Notificação de Equipamentos", icon: "fa-laptop", tone: "teal", desc: "Prévia do e-mail para infraestrutura." }
  ];

  var state = {
    stage: "cedente",
    status: "Em preenchimento",
    errors: {},
    collapses: {},
    decisions: {},
    form: {
      numero: rm.usuario.numero,
      data: rm.usuario.data,
      solicitante: rm.usuario.gestorCedente,
      gestorCedente: rm.usuario.gestorCedente,
      gerenciaOrigem: rm.usuario.gerenciaOrigem,
      gestorRecebedor: rm.usuario.gestorRecebedor,
      gerenciaDestino: rm.usuario.gerenciaDestino,
      diretorDestino: rm.usuario.diretorDestino,
      areaDiretoria: "Diretoria Industrial",
      seguranca: rm.usuario.seguranca,
      gestorRh: rm.usuario.gestorRh,
      filial: rm.usuario.filial,
      colaborador: "Carlos Pereira",
      chapa: "000731",
      admissao: "14/03/2019",
      empresa: "Lonax Indústria Brasileira de Lonas",
      cargoAtual: "Operador de Produção",
      funcaoAtual: "Operador de Extrusora",
      nivelAtual: "Operacional - Step 2",
      descricaoCargoAtual: "Operar máquinas de extrusão, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.",
      secaoAtual: "Produção",
      centroAtual: "IND.PRO.001",
      escalaAtual: "6x1",
      horarioAtual: "06:00 às 14:00",
      usaEquipamentoAtual: "Sim",
      observacoesOrigem: "Colaborador utiliza notebook compartilhado e monitor na área de produção.",
      equipamentosOrigem: [
        { equipamento: "Notebook / Computador", quantidade: "1", observacao: "Acompanharão o colaborador" },
        { equipamento: "Monitor", quantidade: "1", observacao: "Permanecerão na área de origem" }
      ],
      tipoMovimentacao: "Mudança de função com transferência de centro de custo",
      cargoDestino: "Analista de Qualidade",
      funcaoDestino: "Analista de Controle de Qualidade",
      nivelDestino: "Pleno - Step 2",
      descricaoCargoDestino: "Executar inspeções de qualidade em produtos e processos, registrar não conformidades, apoiar planos de ação e acompanhar indicadores da área industrial.",
      secaoDestino: "Administração",
      centroDestino: "ADM.GER.002",
      escalaDestino: "5x1",
      horarioDestino: "08:00 às 17:48",
      vigencia: "2026-10-20",
      duracao: "Provisória",
      fimProvisorio: "2026-12-20",
      observacoesMovimentacao: "Movimentação provisória para apoio à área de qualidade durante o período de reforço operacional.",
      precisaEquipamentoDestino: "Sim",
      observacoesDestino: "Nova posição exige notebook individual e monitor para rotina de inspeção.",
      justificativa: "Movimentação necessária para reforçar o controle de qualidade diante do aumento de demanda da linha industrial.",
      equipamentos: [
        { equipamento: "Notebook / Computador", quantidade: "1", observacao: "Acompanhar colaborador" },
        { equipamento: "Monitor", quantidade: "1", observacao: "Novo monitor para área destino" }
      ],
      anexos: [
        { nome: "teste 1.pdf", tamanho: "26 KB", origem: "Gestor Cedente", url: "anexos/teste 1.pdf" },
        { nome: "teste 2.pdf", tamanho: "26 KB", origem: "Gestor Recebedor", url: "anexos/teste 2.pdf" }
      ],
      anexosRecebedor: [
        { nome: "teste 3.pdf", tamanho: "26 KB", origem: "Gestor Recebedor", url: "anexos/teste 3.pdf" }
      ],
      anexosSeguranca: [
        { nome: "teste 5.pdf", tamanho: "26 KB", origem: "Segurança do Trabalho", url: "anexos/teste 5.pdf" }
      ],
      anexosRh: [
        { nome: "teste 4.pdf", tamanho: "26 KB", origem: "RH", url: "anexos/teste 4.pdf" }
      ]
    }
  };

  var stageNav = document.getElementById("stageNav");
  var appView = document.getElementById("appView");
  var statusLabel = document.getElementById("statusLabel");
  var isStagePage = !!appView;
  var radioCounter = 0;
  var correctionReason = "Necessário revisar centro de custo de destino e complementar a justificativa da movimentação.";
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

  function formatDate(value) {
    var parts = String(value || "").split("-");
    if (parts.length !== 3) return value || "-";
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function todayValue() { return "2026-10-01"; }
  function todayLabel() { return "01/10/2026 10:30"; }
  function getStage(key) { return stages.filter(function (item) { return item.key === key; })[0] || stages[0]; }
  function getRequestedStage() { return getStage(new URLSearchParams(window.location.search).get("etapa") || "cedente").key; }
  function getStageUrl(key) { return "etapa.html?etapa=" + encodeURIComponent(key); }

  function movementDescription(key) {
    var f = state.form;
    var meta = {
      cedente: [f.data, f.gestorCedente, f.gerenciaOrigem],
      recebedor: ["01/10/2026 11:05", f.gestorRecebedor, f.gerenciaDestino],
      diretoria: ["01/10/2026 14:20", f.diretorDestino, f.gerenciaDestino],
      seguranca: ["02/10/2026 08:40", f.seguranca, "Segurança do Trabalho"],
      rh: ["02/10/2026 10:15", f.gestorRh, "Recursos Humanos"]
    }[key] || [todayLabel(), f.gestorCedente, f.gerenciaOrigem];
    return escapeHtml(meta[0]) + " - " + escapeHtml(meta[1]) + " - " + escapeHtml(meta[2]);
  }

  function setStage(key) {
    if (!isStagePage) {
      window.location.href = getStageUrl(key);
      return;
    }
    state.stage = key;
    state.errors = {};
    window.history.replaceState(null, "", getStageUrl(key));
    render();
  }

  function setStatus(value) {
    state.status = value;
    if (statusLabel) statusLabel.textContent = value;
  }

  function showModal(config) {
    modal.title.textContent = config.title || "Confirmação";
    if (config.html) modal.message.innerHTML = config.html;
    else modal.message.textContent = config.message || "";
    modal.icon.innerHTML = '<i class="fa-solid ' + (config.icon || "fa-circle-question") + '"></i>';
    modal.confirm.textContent = config.confirmText || "Confirmar";
    modal.cancel.textContent = config.cancelText || "Cancelar";
    modal.cancel.classList.toggle("lx-hidden", !!config.hideCancel);
    modal.dialog.classList.toggle("lx-modal-wide", !!config.wide);
    modal.action = config.onConfirm || null;
    modal.wrap.classList.remove("lx-hidden");
    modal.message.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", handleAction);
    });
  }

  function hideModal() {
    modal.wrap.classList.add("lx-hidden");
    modal.dialog.classList.remove("lx-modal-wide");
    modal.cancel.classList.remove("lx-hidden");
    modal.message.innerHTML = "";
    modal.action = null;
  }

  function render() {
    radioCounter = 0;
    if (stageNav) renderNav();
    if (appView) renderView();
    bindEvents();
  }

  function renderNav() {
    stageNav.innerHTML = stages.map(function (stage) {
      var active = isStagePage && state.stage === stage.key ? " lx-stage-current" : "";
      return '<a class="lx-stage-card' + active + '" href="' + getStageUrl(stage.key) + '" data-stage="' + stage.key + '">' +
        '<span class="lx-stage-icon lx-dot-' + stage.tone + '"><i class="fa-solid ' + stage.icon + '"></i></span>' +
        '<div><h3>' + stage.title + '</h3><p>' + stage.desc + '</p></div></a>';
    }).join("");
  }

  function renderView() {
    var stage = getStage(state.stage);
    var body = "";
    var stack = false;

    if (state.stage === "cedente") body = renderCedente(false);
    if (state.stage === "recebedor") {
      body = renderReadOnlySummaryComponent() + viewComponent(stage.title, stage.desc, state.status, renderRecebedor(), "", stage.icon, stage.tone);
      stack = true;
    }
    if (state.stage === "diretoria") { body = renderApproval("diretoria", "Aprovar movimentação", "A movimentação seguirá para validação técnica."); stack = true; }
    if (state.stage === "seguranca") { body = renderApproval("seguranca", "Validar movimentação", "A movimentação seguirá para aprovação final do RH."); stack = true; }
    if (state.stage === "rh") { body = renderApproval("rh", "Aprovar movimentação", "A movimentação será aprovada e seguirá para conclusão."); stack = true; }
    if (state.stage === "correcao") { body = renderCorrectionFlow(); stack = true; }
    if (state.stage === "reprovada") { body = renderRejectedFlow(); stack = true; }
    if (state.stage === "finalizada") { body = renderFinishedFlow(); stack = true; }
    if (state.stage === "equipamentos") { body = renderEquipmentNotification(); stack = true; }

    appView.innerHTML = stack ? body : viewComponent(stage.title, stage.desc, state.status, body, "", stage.icon, stage.tone);
  }

  function viewComponent(title, description, pill, body, extraClass, icon, tone) {
    var stage = getStage(state.stage);
    return '<div class="lx-view-frame"><div class="lx-view-rail"></div>' +
      '<div class="lx-timeline-dot lx-dot-' + (tone || stage.tone || "blue") + '"><i class="fa-solid ' + (icon || stage.icon || "fa-pen-to-square") + '"></i></div>' +
      '<div class="lx-view-shell ' + (extraClass || "") + '"><div class="lx-view-head"><div><h2>' + title + '</h2><p>' + description + '</p></div>' + (pill ? '<span class="lx-pill">' + pill + '</span>' : "") + '</div><div class="lx-view-body">' + body + '</div></div></div>';
  }

  function renderCedente(isCorrection) {
    var f = state.form;
    var correction = isCorrection ? '<div class="lx-alert"><i class="fa-solid fa-rotate-left"></i><div><strong>Movimentação devolvida para correção.</strong><br />' + escapeHtml(correctionReason) + '</div></div>' : "";
    return correction +
      section("Dados do Solicitante", "user", grid([
        field("Data/Hora", "data", f.data, true),
        field("Solicitante", "solicitante", f.solicitante, true),
        field("Filial", "filial", f.filial, true),
        field("Gerência", "gerenciaOrigem", f.gerenciaOrigem, true),
        field("Gestor Imediato", "gestorCedente", f.gestorCedente, true),
        field("Área Diretoria", "areaDiretoria", f.areaDiretoria, true)
      ], "lx-grid-4")) +
      section("Dados da Movimentação de Pessoal", "people-arrows",
        grid([
          singleSelect("Colaborador", "colaborador", f.colaborador, rm.colaboradores.map(function (item) { return item.nome; }), true),
          field("Matrícula", "chapa", f.chapa, true, true),
          field("Data de Admissão", "admissao", f.admissao, true, true),
          field("Cargo Atual", "cargoAtual", f.cargoAtual, true, true),
          field("Função Atual", "funcaoAtual", f.funcaoAtual, true, true),
          field("Nível Atual", "nivelAtual", f.nivelAtual, true, true),
          field("Setor / Seção Atual", "secaoAtual", f.secaoAtual, true, true),
          field("Centro de Custo Origem", "centroAtual", f.centroAtual, true, true),
          readonlyTextarea("Descrição do Cargo Atual", "descricaoCargoAtual", f.descricaoCargoAtual, true),
          field("Escala", "escalaAtual", f.escalaAtual, true, true),
          field("Horário", "horarioAtual", f.horarioAtual, true, true)
        ], "lx-movement-current-grid") +
        formFieldset("Infraestrutura da Origem", "laptop",
          radioGroup("Colaborador utiliza equipamentos atualmente?", "usaEquipamentoAtual", f.usaEquipamentoAtual, ["Sim", "Não"], true) +
          renderOriginEquipmentsEditor()
        ) +
        renderAttachmentsEditor("anexos", "Upload de Arquivos", "paperclip") +
        formFieldset("Justificativa", "comment-dots", textarea("Justificativa da movimentação", "justificativa", f.justificativa, true)) +
        '<div class="lx-actions"><button class="lx-btn lx-btn-secondary" type="button" data-action="draft"><i class="fa-solid fa-save"></i> Salvar rascunho</button><button class="lx-btn lx-btn-primary" type="button" data-action="submit-cedente"><i class="fa-solid fa-paper-plane"></i> Enviar para Gestor Recebedor</button></div>'
      );
  }

  function renderRecebedor() {
    var decision = state.decisions.recebedor || {};
    if (decision.value !== "approve") return renderRecebedorOriginComponent() + renderRecebedorDecision();
    return renderRecebedorOriginComponent() + renderRecebedorFields() + renderRecebedorDecision();
  }

  function renderRecebedorFields() {
    var f = state.form;
    return section("Dados de Destino", "people-arrows",
      grid([
        radioGroup("Tipo de Movimentação", "tipoMovimentacao", f.tipoMovimentacao, [
          "Mudança de função com transferência de centro de custo",
          "Mudança de função sem transferência de centro de custo",
          "Transferência de centro de custo"
        ], true)
      ], "lx-destination-type-grid") +
      formFieldset("Situação Destino", "briefcase",
        grid([
          destinationSelect("Cargo de Destino", "cargoDestino", f.cargoDestino, rm.cargos, canEditDestinationRole()),
          destinationSelect("Função de Destino", "funcaoDestino", f.funcaoDestino, rm.funcoes, canEditDestinationRole()),
          destinationSelect("Nível / Step de Destino", "nivelDestino", f.nivelDestino, rm.niveis, canEditDestinationRole()),
          singleSelect("Setor / Seção Destino", "secaoDestino", f.secaoDestino, rm.setores.map(function (item) { return item.nome; }), true),
          destinationSelect("Centro de Custo Destino", "centroDestino", f.centroDestino, rm.setores.map(function (item) { return item.centro; }), canEditDestinationCostCenter()),
          readonlyTextarea("Descrição do Cargo de Destino", "descricaoCargoDestino", f.descricaoCargoDestino, true),
          singleSelect("Escala", "escalaDestino", f.escalaDestino, rm.escalas.map(function (item) { return item.nome; }), true),
          field("Horário", "horarioDestino", f.horarioDestino, true, true),
          field("Data Prevista de Início", "vigencia", f.vigencia, isCostCenterOnlyMovement(), true, "", "", "date"),
          radioGroup("Duração da movimentação", "duracao", f.duracao, ["Definitiva", "Provisória"], true),
          f.duracao === "Provisória" ? field("Data Prevista de Término", "fimProvisorio", f.fimProvisorio, false, true, "", "", "date") : "",
          textarea("Observações adicionais da movimentação", "observacoesMovimentacao", f.observacoesMovimentacao, false)
        ], "lx-movement-destination-grid")
      ) +
      formFieldset("Infraestrutura do Destino", "laptop",
        '<div class="lx-destination-equipment-grid">' +
          radioGroup("Colaborador utilizará equipamentos na área de destino?", "precisaEquipamentoDestino", f.precisaEquipamentoDestino, ["Sim", "Não"], true) +
        '</div>' +
        (f.precisaEquipamentoDestino === "Sim" ? renderEquipmentsEditor() : "") +
        (f.precisaEquipamentoDestino === "Sim" ? textarea("Observações do destino", "observacoesDestino", f.observacoesDestino, false) : "")
      )
    ) +
    renderAttachmentsEditor("anexosRecebedor", "Upload de Arquivos", "paperclip") +
    renderComparison() +
    formFieldset("Justificativa", "comment-dots", textarea("Justificativa da movimentação", "justificativa", f.justificativa, true));
  }

  function renderRecebedorDecision() {
    var decision = state.decisions.recebedor || { value: "", justification: "" };
    var hideReturnRecebedor = state.stage === "correcao" && state.status.indexOf("Gestor Cedente") === -1;
    return '<div class="lx-recebedor-approval">' + section("Aprovação Gestor Recebedor", "list-check",
      '<div class="lx-current-decision" data-approval="recebedor">' +
        decisionOption("approve", "Aprovar movimentação", "A movimentação seguirá para aprovação da Diretoria.", decision.value) +
        decisionOption("returnCedente", "Devolver ao Gestor Cedente", "A movimentação retornará para ajuste dos dados de origem.", decision.value) +
        (hideReturnRecebedor ? "" : decisionOption("returnRecebedor", "Corrigir com Gestor Recebedor", "A movimentação retornará para ajuste dos dados de destino.", decision.value)) +
        decisionOption("reject", "Reprovar movimentação", "A movimentação será encerrada como reprovada.", decision.value) +
        '<label class="lx-field' + (!decision.value || decision.value === "approve" ? " lx-hidden" : "") + '" data-approval-justification><span>Justificativa <b>*</b></span><textarea data-decision-field="justification" placeholder="Informe o motivo da correção ou reprovação...">' + escapeHtml(decision.justification) + '</textarea></label>' +
        '<div class="lx-actions"><button class="lx-btn lx-btn-secondary" type="button" data-action="draft"><i class="fa-solid fa-save"></i> Salvar rascunho</button><button class="lx-btn lx-btn-primary" type="button" data-action="submit-recebedor"><i class="fa-solid fa-paper-plane"></i> Enviar decisão</button></div>' +
      '</div>'
    ) + '</div>';
  }

  function renderComparison() {
    var f = state.form;
    return renderComparisonSnapshot(f.centroDestino);
  }

  function renderRecebedorOriginComponent() {
    return section("Dados de Origem", "user-pen", renderOriginSnapshot(false));
  }

  function renderComparisonSnapshot(centroDestino) {
    var f = state.form;
    var rows = [["Cargo", f.cargoAtual, f.cargoDestino], ["Função", f.funcaoAtual, f.funcaoDestino], ["Setor", f.secaoAtual, f.secaoDestino], ["Centro de Custo", f.centroAtual, centroDestino || f.centroDestino], ["Escala", f.escalaAtual, f.escalaDestino], ["Horário", f.horarioAtual, f.horarioDestino]];
    return section("Comparação Origem x Destino", "table-columns", '<div class="lx-read-table lx-comparison-table"><div class="lx-read-head"><span>Campo</span><span>Situação Origem</span><span>Situação Destino</span></div>' +
      rows.map(function (row) { return '<div class="lx-read-row"><strong>' + row[0] + '</strong><strong>' + escapeHtml(row[1]) + '</strong><strong>' + escapeHtml(row[2]) + '</strong></div>'; }).join("") + '</div>');
  }

  function renderApproval(key, approveTitle, approveText) {
    var decision = state.decisions[key] || { value: "approve", justification: "" };
    var previous = renderReadOnlySummaryComponent();
    if (key === "diretoria") previous += renderPreviousComponent("recebedor");
    if (key === "seguranca") previous += renderPreviousComponent("recebedor") + renderPreviousApprovalComponent("diretoria");
    if (key === "rh") previous += renderPreviousComponent("recebedor") + renderPreviousApprovalComponent("diretoria") + (requiresSafety() ? renderPreviousApprovalComponent("seguranca") : "");
    return previous + viewComponent(getStage(key).title, getStage(key).desc, state.status,
      renderRecebedorOriginComponent() +
      formFieldset("Decisão de Aprovação", "list-check",
        '<div class="lx-current-decision" data-approval="' + key + '">' +
        decisionOption("approve", approveTitle, approveText, decision.value) +
        decisionOption("returnCedente", "Devolver ao Gestor Cedente", "A movimentação retornará para ajuste dos dados de origem.", decision.value) +
        decisionOption("returnRecebedor", "Devolver para Gestor Recebedor", "A movimentação retornará para ajuste dos dados de destino.", decision.value) +
        decisionOption("reject", "Reprovar movimentação", "A movimentação será encerrada como reprovada.", decision.value) +
        '<label class="lx-field' + (decision.value === "approve" ? " lx-hidden" : "") + '" data-approval-justification><span>Justificativa <b>*</b></span><textarea data-decision-field="justification" placeholder="Informe o motivo da devolução ou reprovação...">' + escapeHtml(decision.justification) + '</textarea></label>' +
        (key === "seguranca" ? renderAttachmentsEditor("anexosSeguranca", "Upload de Arquivos - Segurança do Trabalho", "paperclip") : "") +
        (key === "rh" ? renderAttachmentsEditor("anexosRh", "Upload de Arquivos - RH", "paperclip") : "") +
        '<div class="lx-actions"><button class="lx-btn lx-btn-secondary" type="button" data-action="draft"><i class="fa-solid fa-save"></i> Salvar rascunho</button><button class="lx-btn lx-btn-primary" type="button" data-action="send-approval" data-approval-key="' + key + '"><i class="fa-solid fa-paper-plane"></i> Enviar decisão</button></div></div>'
      ), "", getStage(key).icon, getStage(key).tone);
  }

  function renderCorrectionFlow() {
    var isCedente = state.status.indexOf("Gestor Cedente") > -1;
    var title = isCedente ? "Correção do Gestor Cedente" : "Correção do Gestor Recebedor";
    var body = isCedente ? renderCedente(true) : renderRecebedorOriginComponent() + renderRecebedorFields() + renderRecebedorDecision();
    return renderPreviousComponent("recebedor") + renderPreviousApprovalComponent("diretoria", { value: isCedente ? "returnCedente" : "returnRecebedor", justification: correctionReason }) + viewComponent(title, getStage("correcao").desc, state.status, body, "", "fa-rotate-left", "slate");
  }

  function renderRejectedFlow() {
    return renderReadOnlySummaryComponent() + renderPreviousComponent("recebedor") + renderPreviousApprovalComponent("diretoria") + renderPreviousApprovalComponent("seguranca") + renderPreviousApprovalComponent("rh", { value: "reject", justification: "Movimentação reprovada por divergência entre função de destino e planejamento de quadro." }, true) + viewComponent("Movimentação Reprovada", "Visualização da movimentação encerrada.", "Reprovada", '<div class="lx-history-stage lx-history-stage-red">Movimentação encerrada como reprovada após decisão do RH.</div>', "", "fa-ban", "red");
  }

  function renderFinishedFlow() {
    return renderReadOnlySummaryComponent() +
      renderPreviousComponent("recebedor") +
      renderPreviousApprovalComponent("diretoria", {
        value: "returnRecebedor",
        justification: "Necessário revisar o Centro de Custo Destino e complementar as observações da movimentação."
      }, false, "aprovacaoDiretoriaRetorno1") +
      renderMovementCorrectionRecordComponent("correcaoAjuste1", "Correção do Gestor Recebedor", "Ajustes realizados após devolução da Diretoria.", {
        centroDestino: "IND.QUA.004",
        observacoesMovimentacao: "Centro de custo revisado e observações complementadas conforme orientação da Diretoria."
      }) +
      renderPreviousApprovalComponent("recebedor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após correção da movimentação."
      }, false, "aprovacaoRecebedorAposCorrecao1") +
      renderPreviousApprovalComponent("diretoria", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após correção da movimentação."
      }, false, "aprovacaoDiretoriaFinal") +
      (requiresSafety() ? renderPreviousApprovalComponent("seguranca", {
        value: "returnCedente",
        justification: "Necessário complementar a análise dos equipamentos e anexar evidência de validação da área."
      }, false, "aprovacaoSegurancaRetorno1") : "") +
      (requiresSafety() ? renderMovementCorrectionRecordComponent("correcaoAjuste2", "Correção do Gestor Cedente", "Ajustes realizados após devolução da Segurança do Trabalho.", {
        centroDestino: "IND.QUA.004",
        observacoesMovimentacao: "Centro de custo revisado e observações complementadas conforme orientação da Diretoria.",
        observacoesDestino: "Análise de infraestrutura complementada com evidência da área de destino.",
        anexosRecebedor: state.form.anexosRecebedor.concat([{ nome: "evidencia-seguranca.pdf", tamanho: "32 KB", origem: "Gestor Recebedor", url: "anexos/teste 3.pdf" }])
      }) : "") +
      (requiresSafety() ? renderPreviousApprovalComponent("recebedor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após complementação da correção."
      }, false, "aprovacaoRecebedorAposCorrecao2") : "") +
      renderPreviousApprovalComponent("diretoria", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após correção da movimentação."
      }, false, "aprovacaoDiretoriaAposCorrecao2") +
      (requiresSafety() ? renderPreviousApprovalComponent("seguranca", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após complementação das informações."
      }, false, "aprovacaoSegurancaFinal") : "") +
      renderPreviousApprovalComponent("rh", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }, false, "aprovacaoRhFinal") +
      viewComponent("Movimentação Finalizada", "Movimentação aprovada e concluída.", "Finalizada", '<div class="lx-history-stage lx-history-stage-green">Movimentação de pessoal finalizada após aprovação do RH.</div>', "", "fa-circle-check", "green");
  }

  function renderMovementCorrectionRecordComponent(key, title, description, changes) {
    var stage = getStage("correcao");
    var open = !!state.collapses[key];
    return viewComponent(
      '<button type="button" class="lx-collapse-title" data-collapse="' + key + '" aria-expanded="' + open + '"><span>' + title + '</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>',
      movementDescription("correcao"),
      "",
      open ? renderMovementCorrectionSnapshot(changes) : "",
      "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"),
      stage.icon,
      "green"
    );
  }

  function renderMovementCorrectionSnapshot(changes) {
    var f = state.form;
    var snapshot = {
      centroDestino: changes.centroDestino || f.centroDestino,
      observacoesMovimentacao: changes.observacoesMovimentacao || f.observacoesMovimentacao,
      observacoesDestino: changes.observacoesDestino || f.observacoesDestino,
      anexosRecebedor: changes.anexosRecebedor || f.anexosRecebedor
    };

    return historySection("Dados do Solicitante", "user", "blue", [["Data/Hora", f.data], ["Número Solicitação", f.numero], ["Solicitante", f.solicitante], ["Gerência", f.gerenciaOrigem], ["Filial", f.filial], ["Gestor Imediato", f.gestorCedente], ["Área Diretoria", f.areaDiretoria]]) +
      historySection("Dados da Movimentação de Pessoal", "people-arrows", "green", [["Colaborador", f.colaborador], ["Matrícula", f.chapa], ["Data de Admissão", f.admissao], ["Cargo Atual", f.cargoAtual], ["Função Atual", f.funcaoAtual], ["Nível Atual", f.nivelAtual], ["Setor / Seção Atual", f.secaoAtual], ["Centro de Custo Origem", f.centroAtual], ["Descrição do Cargo Atual", f.descricaoCargoAtual], ["Escala", f.escalaAtual], ["Horário", f.horarioAtual]], "lx-readonly-request-grid") +
      historyCustomSection("Equipamentos da Origem", "laptop", "purple", renderOriginEquipmentsSnapshot()) +
      historySection("Dados de Destino", "people-arrows", "blue", [["Tipo de Movimentação", f.tipoMovimentacao]]) +
      historySection("Situação Destino", "briefcase", "green", [["Cargo de Destino", f.cargoDestino], ["Função de Destino", f.funcaoDestino], ["Nível / Step de Destino", f.nivelDestino], ["Setor / Seção Destino", f.secaoDestino], ["Centro de Custo Destino", snapshot.centroDestino], ["Descrição do Cargo de Destino", f.descricaoCargoDestino], ["Escala", f.escalaDestino], ["Horário", f.horarioDestino], ["Data Prevista de Início", formatDate(f.vigencia)], ["Duração da movimentação", f.duracao], ["Data Prevista de Término", f.duracao === "Provisória" ? formatDate(f.fimProvisorio) : "-"], ["Observações adicionais da movimentação", snapshot.observacoesMovimentacao || "-"]], "lx-readonly-request-grid lx-destination-history-grid") +
      renderDestinationInfrastructureSnapshot({ observacoesDestino: snapshot.observacoesDestino }) +
      historyCustomSection("Upload de Arquivos", "paperclip", "purple", renderAttachmentsList(snapshot.anexosRecebedor, "anexosRecebedor", false)) +
      renderComparisonSnapshot(snapshot.centroDestino) +
      historyCustomSection("Justificativa", "comment-dots", "teal", escapeHtml(f.justificativa || "-"));
  }

  function renderEquipmentNotification() {
    var f = state.form;
    return renderFinishedFlow() + viewComponent("Prévia do e-mail para infraestrutura", getStage("equipamentos").desc, "",
      '<div class="lx-history-stage lx-history-stage-blue"><strong>Assunto:</strong> Movimentação de equipamentos - ' + escapeHtml(f.numero) + '<br /><br /><strong>Colaborador:</strong> ' + escapeHtml(f.colaborador) + ' - ' + escapeHtml(f.chapa) + '<br /><strong>Origem:</strong> ' + escapeHtml(f.gestorCedente) + ' / ' + escapeHtml(f.gerenciaOrigem) + ' / ' + escapeHtml(f.centroAtual) + '<br /><strong>Destino:</strong> ' + escapeHtml(f.gestorRecebedor) + ' / ' + escapeHtml(f.gerenciaDestino) + ' / ' + escapeHtml(f.centroDestino) + '<br /><strong>Data prevista de início:</strong> ' + escapeHtml(formatDate(f.vigencia)) + '<br /><strong>Equipamentos atuais:</strong><br />' + renderOriginEquipmentLines() + '<br /><br /><strong>Novos equipamentos:</strong><br />' + f.equipamentos.map(function (item) { return "- " + item.equipamento + " (" + item.quantidade + ") - " + item.observacao; }).join("<br />") + '</div>', "", "fa-laptop", "teal");
  }

  function renderReadOnlySummaryComponent() {
    var open = !!state.collapses.dadosMovimentacao;
    return viewComponent('<button type="button" class="lx-collapse-title" data-collapse="dadosMovimentacao" aria-expanded="' + open + '"><span>Dados da Movimentação de Pessoal</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>', movementDescription("cedente"), "", open ? renderOriginSnapshot() : "", "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"), "fa-user-pen", "green");
  }

  function renderPreviousComponent(key) {
    var open = !!state.collapses[key];
    return viewComponent('<button type="button" class="lx-collapse-title" data-collapse="' + key + '" aria-expanded="' + open + '"><span>Aprovação Gestor Recebedor</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>', movementDescription(key), "", open ? renderDestinationSnapshot() : "", "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"), "fa-people-arrows", "green");
  }

  function renderPreviousApprovalComponent(key, snapshot, forceOpen) {
    var stage = getStage(key);
    var open = forceOpen || !!state.collapses["aprovacao_" + key];
    var decision = snapshot || state.decisions[key] || { value: "approve", justification: "Etapa aprovada sem ressalvas." };
    var label = isCorrectionDecision(decision.value) ? correctionDecisionLabel(decision.value) : decision.value === "reject" ? "Movimentação reprovada" : "Movimentação aprovada";
    var tone = isCorrectionDecision(decision.value) ? "orange" : decision.value === "reject" ? "red" : "green";
    var body = historySection("Decisão sobre a Movimentação", "list-check", tone, [["Decisão", label], ["Responsável", responsibleName(key)], ["Observação", decision.justification || "Etapa aprovada sem ressalvas."]]) +
      (key === "seguranca" ? historyCustomSection("Upload de Arquivos - Segurança do Trabalho", "paperclip", "purple", renderAttachmentsList(state.form.anexosSeguranca, "anexosSeguranca", false)) : "") +
      (key === "rh" ? historyCustomSection("Upload de Arquivos - RH", "paperclip", "purple", renderAttachmentsList(state.form.anexosRh, "anexosRh", false)) : "");
    return viewComponent('<button type="button" class="lx-collapse-title" data-collapse="aprovacao_' + key + '" aria-expanded="' + open + '"><span>' + stage.title + '</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>', movementDescription(key), "", open ? body : "", "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"), stage.icon, "green");
  }

  function renderOriginSnapshot(showRequester) {
    var f = state.form;
    var requester = showRequester === false ? "" : historySection("Dados do Solicitante", "user", "blue", [["Data/Hora", f.data], ["Número Solicitação", f.numero], ["Solicitante", f.solicitante], ["Gerência", f.gerenciaOrigem], ["Filial", f.filial], ["Gestor Imediato", f.gestorCedente], ["Área Diretoria", f.areaDiretoria]]);
    return requester +
      historySection("Dados da Movimentação de Pessoal", "people-arrows", "green", [["Colaborador", f.colaborador], ["Matrícula", f.chapa], ["Data de Admissão", f.admissao], ["Cargo Atual", f.cargoAtual], ["Função Atual", f.funcaoAtual], ["Nível Atual", f.nivelAtual], ["Setor / Seção Atual", f.secaoAtual], ["Centro de Custo Origem", f.centroAtual], ["Descrição do Cargo Atual", f.descricaoCargoAtual], ["Escala", f.escalaAtual], ["Horário", f.horarioAtual]], "lx-readonly-request-grid") +
      historyCustomSection("Equipamentos da Origem", "laptop", "purple", renderOriginEquipmentsSnapshot()) +
      historyCustomSection("Upload de Arquivos", "paperclip", "purple", renderAttachmentsList(f.anexos, "anexos", false)) +
      historyCustomSection("Justificativa", "comment-dots", "teal", escapeHtml(f.justificativa || "-"));
  }

  function renderOriginEquipmentsSnapshot() {
    var f = state.form;
    if (f.usaEquipamentoAtual !== "Sim") return '<div class="lx-history-stage-grid"><div class="lx-history-stage-item"><span>Utiliza Equipamentos?</span><strong>Não</strong></div></div>';
    if (!f.equipamentosOrigem.length) return '<div class="lx-empty-list">Nenhum equipamento informado.</div>';
    return '<div class="lx-read-table lx-read-table-origin"><div class="lx-read-head"><span>Equipamento</span><span>Quantidade</span><span>Destino do Equipamento</span></div>' +
      f.equipamentosOrigem.map(function (item) {
        return '<div class="lx-read-row"><strong>' + escapeHtml(item.equipamento || "-") + '</strong><strong>' + escapeHtml(item.quantidade || "-") + '</strong><strong>' + escapeHtml(item.observacao || "-") + '</strong></div>';
      }).join("") + '</div><div class="lx-history-note"><span>Observações da Origem</span><strong>' + escapeHtml(f.observacoesOrigem || "-") + '</strong></div>';
  }

  function renderOriginEquipmentLines() {
    var f = state.form;
    if (f.usaEquipamentoAtual !== "Sim" || !f.equipamentosOrigem.length) return "- Não informado";
    return f.equipamentosOrigem.map(function (item) {
      return "- " + escapeHtml(item.equipamento || "-") + " (" + escapeHtml(item.quantidade || "-") + ") - " + escapeHtml(item.observacao || "-");
    }).join("<br />");
  }

  function renderDestinationSnapshot() {
    var f = state.form;
    return historySection("Dados de Destino", "people-arrows", "blue", [["Tipo de Movimentação", f.tipoMovimentacao]]) +
      historySection("Situação Destino", "briefcase", "green", [["Cargo de Destino", f.cargoDestino], ["Função de Destino", f.funcaoDestino], ["Nível / Step de Destino", f.nivelDestino], ["Setor / Seção Destino", f.secaoDestino], ["Centro de Custo Destino", f.centroDestino], ["Descrição do Cargo de Destino", f.descricaoCargoDestino], ["Escala", f.escalaDestino], ["Horário", f.horarioDestino], ["Data Prevista de Início", formatDate(f.vigencia)], ["Duração da movimentação", f.duracao], ["Data Prevista de Término", f.duracao === "Provisória" ? formatDate(f.fimProvisorio) : "-"], ["Observações adicionais da movimentação", f.observacoesMovimentacao || "-"]], "lx-readonly-request-grid lx-destination-history-grid") +
      renderDestinationInfrastructureSnapshot() +
      historyCustomSection("Upload de Arquivos", "paperclip", "purple", renderAttachmentsList(f.anexosRecebedor, "anexosRecebedor", false)) +
      renderComparison() +
      historyCustomSection("Justificativa", "comment-dots", "teal", escapeHtml(f.justificativa || "-")) +
      renderRecebedorDecisionSnapshot();
  }

  function renderDestinationInfrastructureSnapshot(overrides) {
    var f = state.form;
    var observacoesDestino = overrides && overrides.observacoesDestino ? overrides.observacoesDestino : f.observacoesDestino;
    var rows = [["Colaborador utilizará equipamentos na área de destino?", f.precisaEquipamentoDestino]];
    return historyCustomSection("Infraestrutura do Destino", "laptop", "purple",
      '<div class="lx-history-stage-grid lx-readonly-request-grid">' +
        rows.map(function (row) { return '<div class="lx-history-stage-item ' + readonlyItemClass(row[0]) + '"><span>' + escapeHtml(row[0]) + '</span><strong>' + escapeHtml(row[1] || "-") + '</strong></div>'; }).join("") +
      '</div>' +
      (f.precisaEquipamentoDestino === "Sim" ? renderDestinationEquipmentsSnapshot() + '<div class="lx-history-note"><span>Observações do destino</span><strong>' + escapeHtml(observacoesDestino || "-") + '</strong></div>' : "")
    );
  }

  function renderDestinationEquipmentsSnapshot() {
    var f = state.form;
    if (!f.equipamentos.length) return '<div class="lx-empty-list">Nenhum equipamento necessário informado.</div>';
    return '<div class="lx-read-table lx-read-table-destination-equipment"><div class="lx-read-head"><span>Equipamento</span><span>Quantidade</span><span>Observação</span></div>' +
      f.equipamentos.map(function (item) {
        return '<div class="lx-read-row"><strong>' + escapeHtml(item.equipamento || "-") + '</strong><strong>' + escapeHtml(item.quantidade || "-") + '</strong><strong>' + escapeHtml(item.observacao || "-") + '</strong></div>';
      }).join("") + '</div>';
  }

  function renderRecebedorDecisionSnapshot() {
    var decision = state.decisions.recebedor || { value: "approve", justification: "Etapa aprovada sem ressalvas." };
    var label = isCorrectionDecision(decision.value) ? correctionDecisionLabel(decision.value) : decision.value === "reject" ? "Movimentação reprovada" : "Movimentação aprovada";
    var tone = isCorrectionDecision(decision.value) ? "orange" : decision.value === "reject" ? "red" : "green";
    return historySection("Decisão sobre a Movimentação", "list-check", tone, [["Decisão", label], ["Responsável", state.form.gestorRecebedor], ["Observação", decision.justification || "Etapa aprovada sem ressalvas."]]);
  }

  function responsibleName(key) {
    var f = state.form;
    return { diretoria: f.diretorDestino, seguranca: f.seguranca, rh: f.gestorRh }[key] || f.gestorRecebedor;
  }

  function requiresSafety() { return state.form.tipoMovimentacao.indexOf("Mudança de função") === 0; }
  function hasEquipmentAction() { var f = state.form; return f.usaEquipamentoAtual === "Sim" || f.precisaEquipamentoDestino === "Sim"; }
  function isCorrectionDecision(value) { return value === "returnCedente" || value === "returnRecebedor"; }
  function correctionDecisionLabel(value) { return value === "returnCedente" ? "Movimentação devolvida para correção - Gestor Cedente" : "Movimentação devolvida para correção - Gestor Recebedor"; }
  function isRoleAndCostCenterMovement() { return state.form.tipoMovimentacao === "Mudança de função com transferência de centro de custo"; }
  function isRoleOnlyMovement() { return state.form.tipoMovimentacao === "Mudança de função sem transferência de centro de custo"; }
  function isCostCenterOnlyMovement() { return state.form.tipoMovimentacao === "Transferência de centro de custo"; }
  function canEditDestinationRole() { return isRoleAndCostCenterMovement() || isRoleOnlyMovement(); }
  function canEditDestinationCostCenter() { return isRoleAndCostCenterMovement() || isCostCenterOnlyMovement(); }

  function section(title, icon, content) {
    return '<div class="lx-section"><div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid fa-' + icon + '"></i></span><h2>' + title + '</h2></div></div><div class="lx-view-body">' + content + '</div></div>';
  }
  function formFieldset(title, icon, content) { return '<fieldset class="lx-fieldset"><legend><i class="fa-solid fa-' + icon + '"></i> ' + title + '</legend>' + content + '</fieldset>'; }
  function grid(items, className) { return '<div class="' + className + '">' + items.join("") + '</div>'; }
  function errorHtml(error) { return error ? '<small class="lx-error-message">' + escapeHtml(error) + '</small>' : ""; }
  function fieldClass(name, scope) { return "lx-field-name-" + (scope ? scope + "-" : "") + name; }
  function scopedAttrs(scope, index) { return scope ? ' data-scope="' + scope + '" data-index="' + index + '"' : ""; }
  function scopedName(scope, index, name) { return scope ? scope + "." + index + "." + name : name; }

  function field(label, name, value, readonly, required, scope, index, type) {
    var key = scopedName(scope, index, name);
    var error = state.errors[key] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><input type="' + (type || "text") + '" data-field="' + name + '"' + scopedAttrs(scope, index) + (readonly ? " readonly" : "") + ' value="' + escapeHtml(value) + '" />' + errorHtml(error) + '</label>';
  }
  function textarea(label, name, value, required) {
    var error = state.errors[name] || "";
    return '<label class="lx-field ' + fieldClass(name) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea data-field="' + name + '">' + escapeHtml(value) + '</textarea>' + errorHtml(error) + '</label>';
  }
  function textareaScoped(label, name, value, required, scope, index) {
    var key = scopedName(scope, index, name);
    var error = state.errors[key] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea data-field="' + name + '"' + scopedAttrs(scope, index) + '>' + escapeHtml(value) + '</textarea>' + errorHtml(error) + '</label>';
  }
  function readonlyTextarea(label, name, value, required) {
    return '<label class="lx-field ' + fieldClass(name) + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea data-field="' + name + '" readonly>' + escapeHtml(value) + '</textarea></label>';
  }
  function select(label, name, value, options, required) {
    var error = state.errors[name] || "";
    return '<label class="lx-field ' + fieldClass(name) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><select data-field="' + name + '">' + options.map(function (option) { return '<option' + (option === value ? " selected" : "") + '>' + escapeHtml(option) + '</option>'; }).join("") + '</select>' + errorHtml(error) + '</label>';
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
  function destinationSelect(label, name, value, options, editable) {
    return editable ? singleSelect(label, name, value, options, true) : field(label, name, value, true, true);
  }

  function renderEquipmentsEditor() {
    return '<div class="lx-child-table"><button class="lx-btn lx-btn-primary" type="button" data-action="add-equipment"><i class="fa-solid fa-plus"></i> Adicionar equipamento</button>' + state.form.equipamentos.map(function (item, index) {
      return '<div class="lx-child-row">' + singleSelect("Equipamento", "equipamento", item.equipamento, rm.equipamentos, true, "equipment", index) + field("Quantidade", "quantidade", item.quantidade, false, true, "equipment", index, "number") + textareaScoped("Observação", "observacao", item.observacao, false, "equipment", index) + '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-equipment" data-index="' + index + '" aria-label="Excluir equipamento"><i class="fa-solid fa-trash"></i></button></div>';
    }).join("") + '</div>';
  }
  function renderOriginEquipmentsEditor() {
    if (state.form.usaEquipamentoAtual !== "Sim") return "";
    return '<div class="lx-child-table lx-origin-equipment-table"><button class="lx-btn lx-btn-primary" type="button" data-action="add-origin-equipment"><i class="fa-solid fa-plus"></i> Adicionar equipamento</button>' + state.form.equipamentosOrigem.map(function (item, index) {
      return '<div class="lx-child-row lx-origin-equipment-row">' +
        singleSelect("Equipamento", "equipamento", item.equipamento, rm.equipamentos, true, "originEquipment", index) +
        field("Quantidade", "quantidade", item.quantidade, false, true, "originEquipment", index, "text") +
        textareaScoped("Destino do Equipamento", "observacao", item.observacao, false, "originEquipment", index) +
        '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-origin-equipment" data-index="' + index + '" aria-label="Excluir equipamento"><i class="fa-solid fa-trash"></i></button>' +
        '</div>';
    }).join("") + '</div>' + textarea("Observações da Origem", "observacoesOrigem", state.form.observacoesOrigem, false);
  }
  function renderAttachmentsEditor(fieldName, title, icon) {
    return formFieldset(title, icon, '<div class="lx-dropzone" data-dropzone="' + fieldName + '"><i class="fa-solid fa-cloud-arrow-up"></i><p>Arraste e solte seus arquivos aqui</p><span>ou</span><button type="button" class="lx-btn-outline">Escolher arquivo</button><input type="file" class="lx-file-input" data-file-upload="' + fieldName + '" multiple /></div>' + renderAttachmentsList(state.form[fieldName] || [], fieldName, true));
  }
  function renderAttachmentsList(files, fieldName, editable) {
    if (!files.length) return '<div class="lx-empty-list">Nenhum arquivo anexado.</div>';
    return '<div class="lx-attachment-list">' + files.map(function (file, index) {
      return '<div class="lx-attachment-row"><div class="lx-attachment-info"><i class="fa-solid fa-file-lines"></i><div><strong>' + escapeHtml(file.nome) + '</strong><span>' + escapeHtml(file.tamanho || "-") + ' - ' + escapeHtml(file.origem || "Anexo") + '</span></div></div><div class="lx-attachment-actions"><button class="lx-btn-icon lx-btn-secondary" type="button" data-action="view-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Visualizar anexo"><i class="fa-solid fa-eye"></i></button><button class="lx-btn-icon lx-btn-secondary" type="button" data-action="download-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Baixar anexo"><i class="fa-solid fa-download"></i></button>' + (editable ? '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Excluir anexo"><i class="fa-solid fa-trash"></i></button>' : "") + '</div></div>';
    }).join("") + '</div>';
  }

  function historySection(title, icon, tone, rows, gridClass) {
    return historyCustomSection(title, icon, tone, '<div class="lx-history-stage-grid ' + (gridClass || "") + '">' + rows.map(function (row) { return '<div class="lx-history-stage-item ' + readonlyItemClass(row[0]) + '"><span>' + escapeHtml(row[0]) + '</span><strong>' + escapeHtml(row[1] || "-") + '</strong></div>'; }).join("") + '</div>');
  }
  function historyCustomSection(title, icon, tone, content) { return '<fieldset class="lx-history-fieldset lx-history-fieldset-' + tone + '"><legend><i class="fa-solid fa-' + icon + '"></i> ' + title + '</legend><div class="lx-history-stage lx-history-stage-' + tone + '">' + content + '</div></fieldset>'; }
  function readonlyItemClass(label) { return "lx-readonly-item-" + String(label || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase(); }
  function decisionOption(value, title, description, selected) {
    var tone = value === "approve" ? "approve" : isCorrectionDecision(value) ? "return" : "reject";
    return '<label class="lx-decision-option lx-decision-' + tone + (selected === value ? " lx-decision-option-selected" : "") + '" data-decision="' + value + '"><input type="radio" name="decision"' + (selected === value ? " checked" : "") + ' /><div><span>' + title + '</span><p>' + description + '</p></div></label>';
  }

  function bindEvents() {
    document.querySelectorAll("[data-stage]").forEach(function (card) { card.addEventListener("click", function (event) { event.preventDefault(); setStage(card.getAttribute("data-stage")); }); });
    document.querySelectorAll("[data-collapse]").forEach(function (button) { button.addEventListener("click", function () { var key = button.getAttribute("data-collapse"); state.collapses[key] = !state.collapses[key]; render(); }); });
    document.querySelectorAll("[data-field]").forEach(function (node) { if (node.hasAttribute("data-single-select")) return; node.addEventListener("input", updateFieldFromEvent); node.addEventListener("change", updateFieldFromEvent); });
    bindSingleSelects();
    document.querySelectorAll("[data-decision]").forEach(function (node) { node.addEventListener("click", function () { var key = node.closest("[data-approval]").getAttribute("data-approval"); state.decisions[key] = state.decisions[key] || {}; state.decisions[key].value = node.getAttribute("data-decision"); render(); }); });
    document.querySelectorAll("[data-decision-field]").forEach(function (node) { node.addEventListener("input", function () { var key = node.closest("[data-approval]").getAttribute("data-approval"); state.decisions[key] = state.decisions[key] || {}; state.decisions[key].justification = node.value; }); });
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

  function updateFieldFromEvent(event) {
    var node = event.target;
    var scope = node.getAttribute("data-scope");
    var index = node.getAttribute("data-index");
    var name = node.getAttribute("data-field");
    var value = node.value;
    var rerender = ["tipoMovimentacao", "duracao", "usaEquipamentoAtual", "precisaEquipamentoDestino"].indexOf(name) > -1 && event.type === "change";
    if (scope === "equipment") state.form.equipamentos[Number(index)][name] = value;
    else if (scope === "originEquipment") state.form.equipamentosOrigem[Number(index)][name] = value;
    else { state.form[name] = value; applyAutoFill(name, value); }
    state.errors = {};
    if (name === "vigencia" && value && value < todayValue()) { state.errors.vigencia = "A Data Prevista de Início não pode ser menor que a data atual."; showModal({ title: "Data inválida", message: "A Data Prevista de Início não pode ser menor que a data atual.", icon: "fa-triangle-exclamation", confirmText: "Entendi", cancelText: "Fechar", onConfirm: hideModal }); render(); return; }
    if (rerender) render();
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
    var index = selectNode.getAttribute("data-index");
    var name = selectNode.getAttribute("data-field");
    if (scope === "equipment") state.form.equipamentos[Number(index)][name] = value;
    else if (scope === "originEquipment") state.form.equipamentosOrigem[Number(index)][name] = value;
    else { state.form[name] = value; applyAutoFill(name, value); }
    state.errors = {};
    render();
  }
  function applyAutoFill(name, value) {
    var f = state.form;
    if (name === "colaborador") {
      var colaborador = rm.colaboradores.filter(function (item) { return item.nome === value; })[0];
      if (!colaborador) { clearCurrentEmployeeFields(); return; }
      f.chapa = colaborador.chapa; f.admissao = colaborador.admissao; f.empresa = colaborador.empresa; f.cargoAtual = colaborador.cargo; f.funcaoAtual = colaborador.funcao; f.nivelAtual = colaborador.nivel; f.descricaoCargoAtual = colaborador.descricaoCargoAtual || ""; f.secaoAtual = colaborador.secao; f.centroAtual = colaborador.centro; f.escalaAtual = colaborador.escala; f.horarioAtual = colaborador.horario;
    }
    if (name === "tipoMovimentacao") applyMovementTypeRules();
    if (name === "duracao" && value !== "Provisória") f.fimProvisorio = "";
    if (name === "secaoDestino") {
      var setor = rm.setores.filter(function (item) { return item.nome === value; })[0];
      f.gerenciaDestino = setor ? setor.gerencia : f.gerenciaDestino;
    }
    if (name === "escalaDestino") { var escala = rm.escalas.filter(function (item) { return item.nome === value; })[0]; f.horarioDestino = escala ? escala.horario : ""; }
  }
  function applyMovementTypeRules() {
    var f = state.form;
    if (isRoleOnlyMovement()) f.centroDestino = f.centroAtual;
    if (isCostCenterOnlyMovement()) {
      f.cargoDestino = f.cargoAtual;
      f.funcaoDestino = f.funcaoAtual;
      f.nivelDestino = f.nivelAtual;
      f.descricaoCargoDestino = f.descricaoCargoAtual;
    }
  }
  function clearCurrentEmployeeFields() {
    ["chapa", "admissao", "empresa", "cargoAtual", "funcaoAtual", "nivelAtual", "descricaoCargoAtual", "secaoAtual", "centroAtual", "escalaAtual", "horarioAtual"].forEach(function (fieldName) {
      state.form[fieldName] = "";
    });
  }

  function handleAction(event) {
    var action = event.currentTarget.getAttribute("data-action");
    if (action === "draft") showModal({ title: "Salvar rascunho", message: "Deseja salvar os dados preenchidos até o momento?", icon: "fa-save", confirmText: "Salvar", onConfirm: function () { setStatus("Rascunho salvo"); hideModal(); } });
    if (action === "submit-cedente") { if (!validateCedente()) return renderAndScroll(); showModal({ title: "Enviar movimentação", message: "Deseja enviar a movimentação para o Gestor Recebedor?", icon: "fa-paper-plane", confirmText: "Enviar", onConfirm: function () { setStatus("Enviado para Gestor Recebedor"); hideModal(); render(); } }); }
    if (action === "submit-recebedor") {
      var recebedorDecision = state.decisions.recebedor || {};
      if (!recebedorDecision.value) { showModal({ title: "Decisão obrigatória", message: "Selecione uma decisão para a movimentação.", icon: "fa-triangle-exclamation", confirmText: "Entendi", cancelText: "Fechar", onConfirm: hideModal }); return; }
      if (recebedorDecision.value === "approve" && !validateRecebedor()) return renderAndScroll();
      if (!validateApproval("recebedor")) return;
      showModal({ title: "Enviar decisão", message: "Deseja registrar a decisão do Gestor Recebedor?", icon: "fa-paper-plane", confirmText: "Enviar", onConfirm: function () { applyDecision("recebedor"); hideModal(); render(); } });
    }
    if (action === "add-equipment") { state.form.equipamentos.push({ equipamento: "", quantidade: "1", observacao: "" }); render(); }
    if (action === "delete-equipment") { var index = Number(event.currentTarget.getAttribute("data-index")); showModal({ title: "Excluir equipamento", message: "Deseja remover este equipamento?", icon: "fa-trash", confirmText: "Excluir", onConfirm: function () { state.form.equipamentos.splice(index, 1); hideModal(); render(); } }); }
    if (action === "add-origin-equipment") { state.form.equipamentosOrigem.push({ equipamento: "", quantidade: "1", observacao: "" }); render(); }
    if (action === "delete-origin-equipment") { var originIndex = Number(event.currentTarget.getAttribute("data-index")); showModal({ title: "Excluir equipamento", message: "Deseja remover este equipamento da origem?", icon: "fa-trash", confirmText: "Excluir", onConfirm: function () { state.form.equipamentosOrigem.splice(originIndex, 1); hideModal(); render(); } }); }
    if (action === "send-approval") { var key = event.currentTarget.getAttribute("data-approval-key"); if (!validateApproval(key)) return render(); showModal({ title: "Enviar decisão", message: "Deseja registrar a decisão desta etapa?", icon: "fa-paper-plane", confirmText: "Enviar", onConfirm: function () { applyDecision(key); hideModal(); render(); } }); }
    if (action === "view-attachment") { var attachment = getAttachmentFromButton(event.currentTarget); showModal({ title: attachment ? attachment.nome : "Visualizar anexo", html: renderAttachmentPreview(attachment), icon: "fa-eye", confirmText: "Fechar", hideCancel: true, wide: true, onConfirm: hideModal }); }
    if (action === "download-attachment") { var file = getAttachmentFromButton(event.currentTarget); if (file && file.url) { window.open(file.url, "_blank"); return; } showModal({ title: "Baixar anexo", message: file ? file.nome : "Anexo não encontrado.", icon: "fa-download", confirmText: "Ok", cancelText: "Fechar", onConfirm: hideModal }); }
    if (action === "delete-attachment") { var button = event.currentTarget; var fieldName = button.getAttribute("data-attachment-field"); var attachmentIndex = Number(button.getAttribute("data-index")); showModal({ title: "Excluir anexo", message: "Deseja remover este arquivo anexado?", icon: "fa-trash", confirmText: "Excluir", onConfirm: function () { state.form[fieldName].splice(attachmentIndex, 1); hideModal(); render(); } }); }
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
  function validateCedente() {
    var errors = {};
    ["colaborador", "usaEquipamentoAtual", "justificativa"].forEach(function (name) { if (!String(state.form[name] || "").trim()) errors[name] = "Campo obrigatório."; });
    if (state.form.usaEquipamentoAtual === "Sim") {
      if (!state.form.equipamentosOrigem.length) errors.usaEquipamentoAtual = "Informe ao menos um equipamento utilizado atualmente.";
      state.form.equipamentosOrigem.forEach(function (item, index) {
        if (!String(item.equipamento || "").trim()) errors["originEquipment." + index + ".equipamento"] = "Campo obrigatório.";
        if (!String(item.quantidade || "").trim() || Number(item.quantidade) <= 0) errors["originEquipment." + index + ".quantidade"] = "Quantidade inválida.";
      });
    }
    state.errors = errors;
    return Object.keys(errors).length === 0;
  }
  function validateRecebedor() {
    var f = state.form;
    var errors = {};
    ["tipoMovimentacao", "cargoDestino", "funcaoDestino", "nivelDestino", "secaoDestino", "centroDestino", "escalaDestino", "horarioDestino", "duracao", "vigencia", "precisaEquipamentoDestino", "justificativa"].forEach(function (name) { if (!String(f[name] || "").trim()) errors[name] = "Campo obrigatório."; });
    if (f.vigencia && f.vigencia < todayValue()) errors.vigencia = "A Data Prevista de Início não pode ser menor que a data atual.";
    if (f.duracao === "Provisória" && !String(f.fimProvisorio || "").trim()) errors.fimProvisorio = "Informe a Data Prevista de Término.";
    if (f.duracao === "Provisória" && f.fimProvisorio && f.vigencia && f.fimProvisorio < f.vigencia) errors.fimProvisorio = "A Data Prevista de Término não pode ser menor que a Data Prevista de Início.";
    if (f.precisaEquipamentoDestino === "Sim") {
      if (!f.equipamentos.length) errors.precisaEquipamentoDestino = "Informe os equipamentos necessários para a posição.";
      f.equipamentos.forEach(function (item, index) { if (!String(item.equipamento || "").trim()) errors["equipment." + index + ".equipamento"] = "Campo obrigatório."; if (!String(item.quantidade || "").trim() || Number(item.quantidade) <= 0) errors["equipment." + index + ".quantidade"] = "Quantidade inválida."; });
    }
    state.errors = errors;
    return Object.keys(errors).length === 0;
  }
  function validateApproval(key) {
    var decision = state.decisions[key] || { value: "approve", justification: "" };
    if (decision.value !== "approve" && !String(decision.justification || "").trim()) { showModal({ title: "Justificativa obrigatória", message: "Informe a justificativa para devolver ou reprovar a movimentação.", icon: "fa-triangle-exclamation", confirmText: "Entendi", cancelText: "Fechar", onConfirm: hideModal }); return false; }
    return true;
  }
  function applyDecision(key) {
    var decision = state.decisions[key] || { value: "approve", justification: "" };
    if (isCorrectionDecision(decision.value)) { setStatus(correctionDecisionLabel(decision.value)); setStage("correcao"); return; }
    if (decision.value === "reject") { setStatus("Reprovada"); setStage("reprovada"); return; }
    if (key === "recebedor") { setStatus("Em aprovação - Diretoria"); setStage("diretoria"); return; }
    if (key === "diretoria") { setStatus(requiresSafety() ? "Em validação - Segurança do Trabalho" : "Em aprovação final - RH"); setStage(requiresSafety() ? "seguranca" : "rh"); }
    else if (key === "seguranca") { setStatus("Em aprovação final - RH"); setStage("rh"); }
    else if (hasEquipmentAction()) { setStatus("Aprovada - Aguardando notificação de equipamentos"); setStage("equipamentos"); }
    else { setStatus("Finalizada"); setStage("finalizada"); }
  }

  function handleFileUpload(event) { addFilesToAttachmentList(event.target.getAttribute("data-file-upload"), event.target.files); render(); }
  function addFilesToAttachmentList(fieldName, files) {
    if (!files || !files.length) return;
    state.form[fieldName] = state.form[fieldName] || [];
    for (var i = 0; i < files.length; i++) state.form[fieldName].push({ nome: files[i].name, tamanho: formatFileSize(files[i].size), origem: attachmentOrigin(fieldName), url: URL.createObjectURL(files[i]) });
  }
  function attachmentOrigin(fieldName) { return fieldName === "anexosRh" ? "RH" : fieldName === "anexosSeguranca" ? "Segurança do Trabalho" : fieldName === "anexosRecebedor" ? "Gestor Recebedor" : "Gestor Cedente"; }
  function formatFileSize(size) { if (!size) return "0 KB"; if (size < 1024 * 1024) return Math.max(1, Math.round(size / 1024)) + " KB"; return (size / 1024 / 1024).toFixed(1).replace(".", ",") + " MB"; }
  function getAttachmentFromButton(button) { var fieldName = button.getAttribute("data-attachment-field"); return (state.form[fieldName] || [])[Number(button.getAttribute("data-index"))]; }
  function renderAttachmentPreview(attachment) { if (!attachment) return '<div class="lx-attachment-preview-empty">Anexo não encontrado.</div>'; if (!attachment.url) return '<div class="lx-attachment-preview-empty">Este anexo não possui arquivo disponível para visualização.</div>'; return '<div class="lx-attachment-preview"><iframe class="lx-attachment-frame" src="' + escapeHtml(encodeURI(attachment.url)) + '" title="' + escapeHtml(attachment.nome) + '"></iframe></div>'; }

  modal.cancel.addEventListener("click", hideModal);
  modal.confirm.addEventListener("click", function () { if (modal.action) modal.action(); });
  document.addEventListener("click", function (event) { if (!event.target.closest("[data-single-select]")) closeSelectLists(); });
  setStatus(state.status);
  render();
})();

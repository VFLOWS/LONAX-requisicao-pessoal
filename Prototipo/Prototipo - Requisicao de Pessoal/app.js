(function () {
  var rm = {
    usuario: {
      numero: "REQ-2026-0184",
      data: "30/09/2026 11:08",
      solicitante: "Marina Carvalho",
      filial: "Matriz - Sarzedo/MG",
      gerencia: "Gerência Industrial",
      gestor: "Eduardo Martins",
      diretoria: "Diretoria Industrial",
      diretor: "Patrícia Almeida",
      gestorRh: "Ricardo Nunes"
    },
    cargos: ["Analista de Qualidade", "Assistente Administrativo", "Operador de Produção", "Técnico de Segurança"],
    niveis: ["Júnior - Step 1", "Pleno - Step 2", "Sênior - Step 3"],
    setores: [
      { nome: "Controle de Qualidade", centro: "IND.QUA.004" },
      { nome: "Produção", centro: "IND.PRO.001" },
      { nome: "Administração", centro: "ADM.GER.002" },
      { nome: "Logística", centro: "LOG.EXP.003" }
    ],
    escalas: [
      { nome: "5x1", horario: "08:00 às 17:48" },
      { nome: "6x1", horario: "06:00 às 14:00" },
      { nome: "12x36", horario: "19:00 às 07:00" }
    ],
    centros: ["IND.QUA.004", "IND.PRO.001", "ADM.GER.002", "LOG.EXP.003"],
    colaboradores: [
      { nome: "Carlos Pereira", chapa: "000731", cargo: "Analista de Qualidade", secao: "Controle de Qualidade", centro: "IND.QUA.004" },
      { nome: "Fernanda Lima", chapa: "000918", cargo: "Assistente Administrativo", secao: "Administração", centro: "ADM.GER.002" }
    ],
    equipamentos: ["Notebook", "Monitor", "Telefone", "Celular", "Headset", "Dock station"]
  };

  var stages = [
    { key: "solicitacao", title: "Solicitar Requisição de Pessoal", icon: "fa-pen-to-square", tone: "blue", desc: "Abertura da necessidade, dados da posição e equipamentos." },
    { key: "gestor", title: "Aprovação Gestor Imediato", icon: "fa-user-check", tone: "green", desc: "Análise inicial da área solicitante." },
    { key: "diretoria", title: "Aprovação Diretoria", icon: "fa-building-user", tone: "purple", desc: "Validação conforme gerência e estrutura organizacional." },
    { key: "rh", title: "Aprovação Gestor do RH", icon: "fa-users-gear", tone: "orange", desc: "Validação final de cargo, nível e abertura da vaga." },
    { key: "correcao", title: "Correção da Solicitação", icon: "fa-rotate-left", tone: "slate", desc: "Ajuste dos dados após devolução por alguma alçada." },
    { key: "cancelada", title: "Solicitação Reprovada", icon: "fa-ban", tone: "red", desc: "Visualização da requisição reprovada." },
    { key: "finalizada", title: "Solicitação Finalizada", icon: "fa-circle-check", tone: "green", desc: "Visualização da requisição aprovada e concluída." },
    { key: "ti", title: "Notificação para TI", icon: "fa-laptop", tone: "teal", desc: "E-mail automático quando houver equipamentos." }
  ];

  var state = {
    stage: "solicitacao",
    status: "Em preenchimento",
    errors: {},
    draftSavedAt: "",
    collapses: {
      dadosRequisicao: false,
      aprovacaoGestor: false,
      aprovacaoDiretoria: false,
      aprovacaoRh: false
    },
    form: {
      numero: rm.usuario.numero,
      data: rm.usuario.data,
      solicitante: rm.usuario.solicitante,
      filial: rm.usuario.filial,
      gerencia: rm.usuario.gerencia,
      gestor: rm.usuario.gestor,
      diretoria: rm.usuario.diretoria,
      diretor: rm.usuario.diretor,
      gestorRh: rm.usuario.gestorRh,
      tipo: "Substituto",
      cargo: "Analista de Qualidade",
      descricaoCargo: "Executar inspeções de qualidade em produtos e processos, registrar não conformidades, apoiar planos de ação e acompanhar indicadores da área industrial.",
      nivel: "Pleno - Step 2",
      contrato: "Efetivo",
      salario: "R$ 4.800,00",
      idadeMin: "24",
      idadeMax: "45",
      estadoCivil: "Indiferente",
      sexo: "Indiferente",
      dataDesejada: "2026-10-20",
      centro: "IND.QUA.004",
      secao: "Controle de Qualidade",
      escala: "5x1",
      horario: "08:00 às 17:48",
      precisaEquipamento: "Sim",
      observacoesVaga: "Priorizar profissional com experiência em inspeção de processos industriais e rotina de análise de não conformidades.",
      justificativa: "Ampliação da capacidade de inspeção de qualidade para atender o aumento de produção.",
      substituido: "Carlos Pereira",
      chapa: "000731",
      cargoAtual: "Analista de Qualidade",
      secaoAtual: "Controle de Qualidade",
      centroAtual: "IND.QUA.004",
      saidaPrevista: "2026-10-15",
      equipamentos: [
        { equipamento: "Notebook", quantidade: "1", observacao: "Perfil administrativo" },
        { equipamento: "Monitor", quantidade: "1", observacao: "24 polegadas" }
      ],
      anexos: [
        { nome: "teste 1.pdf", tamanho: "26 KB", origem: "Solicitação", url: "anexos/teste 1.pdf" },
        { nome: "teste 2.pdf", tamanho: "26 KB", origem: "Solicitação", url: "anexos/teste 2.pdf" },
        { nome: "teste 3.pdf", tamanho: "26 KB", origem: "Solicitação", url: "anexos/teste 3.pdf" }
      ],
      anexosRh: [
        { nome: "teste 4.pdf", tamanho: "26 KB", origem: "Gestor do RH", url: "anexos/teste 4.pdf" }
      ]
    },
    decisions: {},
    history: [
      { etapa: "Solicitação", responsavel: "Marina Carvalho", decisao: "Solicitação aberta", data: "30/09/2026 11:08", obs: "Aumento de quadro para Analista de Qualidade." }
    ]
  };

  var stageNav = document.getElementById("stageNav");
  var appView = document.getElementById("appView");
  var statusLabel = document.getElementById("statusLabel");
  var isStagePage = !!appView;
  var radioCounter = 0;
  var correctionReason = "Necessário revisar o Centro de Custo e complementar a justificativa da vaga antes da análise do RH.";
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

  if (isStagePage) {
    state.stage = getRequestedStage();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function todayLabel() {
    return "30/09/2026 11:30";
  }

  function todayValue() {
    return "2026-09-30";
  }

  function formatDate(value) {
    var parts = String(value || "").split("-");
    if (parts.length !== 3) return value || "-";
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function formatMoney(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";

    return (Number(digits) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function moneyToNumber(value) {
    var normalized = String(value || "").replace(/[^\d,]/g, "").replace(",", ".");
    return Number(normalized || 0);
  }

  function isPastDate(value) {
    return String(value || "") < todayValue();
  }

  function getStage(key) {
    return stages.filter(function (item) { return item.key === key; })[0] || stages[0];
  }

  function movementDescription(key) {
    var f = state.form;
    var meta = {
      solicitacao: [f.solicitante, f.data, f.gerencia],
      gestor: [f.gestor, "30/09/2026 14:20", f.gerencia],
      diretoria: [f.diretor, "01/10/2026 09:15", f.diretoria],
      rh: [f.gestorRh, "01/10/2026 11:40", "Recursos Humanos"],
      correcao: [f.solicitante, "01/10/2026 10:25", f.gerencia]
    }[key] || [f.solicitante, todayLabel(), f.gerencia];

    return escapeHtml(meta[1]) + " - " + escapeHtml(meta[0]) + " - " + escapeHtml(meta[2]);
  }

  function getRequestedStage() {
    var params = new URLSearchParams(window.location.search);
    var stage = params.get("etapa") || "solicitacao";
    return getStage(stage).key;
  }

  function getStageUrl(key) {
    return "etapa.html?etapa=" + encodeURIComponent(key);
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
    statusLabel.textContent = value;
  }

  function showModal(config) {
    modal.title.textContent = config.title || "Confirmação";
    if (config.html) {
      modal.message.innerHTML = config.html;
    } else {
      modal.message.textContent = config.message || "";
    }
    modal.icon.innerHTML = '<i class="fa-solid ' + (config.icon || "fa-circle-question") + '"></i>';
    modal.confirm.textContent = config.confirmText || "Confirmar";
    modal.cancel.textContent = config.cancelText || "Cancelar";
    modal.cancel.classList.toggle("lx-hidden", !!config.hideCancel);
    modal.action = config.onConfirm || null;
    modal.dialog.classList.toggle("lx-modal-wide", !!config.wide);
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
    if (!stageNav) return;

    stageNav.innerHTML = stages.map(function (stage) {
      var active = isStagePage && state.stage === stage.key ? " lx-stage-current" : "";
      return '' +
        '<a class="lx-stage-card' + active + '" href="' + getStageUrl(stage.key) + '" data-stage="' + stage.key + '">' +
          '<span class="lx-stage-icon lx-dot-' + stage.tone + '"><i class="fa-solid ' + stage.icon + '"></i></span>' +
          '<div><h3>' + stage.title + '</h3><p>' + stage.desc + '</p></div>' +
        '</a>';
    }).join("");
  }

  function renderView() {
    var stage = getStage(state.stage);
    var body = "";
    var renderAsStack = false;

    if (state.stage === "solicitacao") body = renderSolicitacao(false);
    if (state.stage === "correcao") {
      body = renderCorrectionFlow();
      renderAsStack = true;
    }
    if (state.stage === "gestor") {
      body = renderApproval("gestor", "Aprovação Gestor Imediato", "A solicitação seguirá para a Diretoria.");
      renderAsStack = true;
    }
    if (state.stage === "diretoria") {
      body = renderApproval("diretoria", "Aprovação Diretoria", "A solicitação seguirá para o Gestor do RH.");
      renderAsStack = true;
    }
    if (state.stage === "rh") {
      body = renderApproval("rh", "Aprovação Gestor do RH", "A requisição será aprovada e seguirá para a finalização.");
      renderAsStack = true;
    }
    if (state.stage === "ti") {
      body = renderTi();
      renderAsStack = true;
    }
    if (state.stage === "cancelada") {
      body = renderCanceledFlow();
      renderAsStack = true;
    }
    if (state.stage === "finalizada") {
      body = renderFinishedFlow();
      renderAsStack = true;
    }

    appView.innerHTML = renderAsStack ? body : viewComponent(stage.title, stage.desc, state.status, body);
  }

  function viewComponent(title, description, pill, body, extraClass, icon, tone) {
    var stage = getStage(state.stage);
    return '<div class="lx-view-frame">' +
      '<div class="lx-view-rail"></div>' +
      '<div class="lx-timeline-dot lx-dot-' + (tone || stage.tone || "blue") + '"><i class="fa-solid ' + (icon || stage.icon || "fa-pen-to-square") + '"></i></div>' +
      '<div class="lx-view-shell ' + (extraClass || "") + '">' +
        '<div class="lx-view-head">' +
          '<div><h2>' + title + '</h2><p>' + description + '</p></div>' +
          (pill ? '<span class="lx-pill">' + pill + '</span>' : "") +
        '</div>' +
        '<div class="lx-view-body">' + body + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderSolicitacao(isCorrection) {
    var f = state.form;
    var correction = isCorrection
      ? '<div class="lx-alert"><i class="fa-solid fa-rotate-left"></i><div><strong>Solicitação devolvida para correção.</strong><br />' + escapeHtml(correctionReason) + '</div></div>'
      : "";
    var requesterFields = [
      field("Data/Hora", "data", f.data, true),
      field("Solicitante", "solicitante", f.solicitante, true),
      field("Filial", "filial", f.filial, true),
      field("Gerência", "gerencia", f.gerencia, true),
      field("Gestor Imediato", "gestor", f.gestor, true),
      field("Área Diretoria", "diretoria", f.diretoria, true)
    ];

    if (isCorrection) {
      requesterFields.splice(1, 0, field("Número Solicitação", "numero", f.numero, true));
    }

    return correction +
      '<div class="lx-section">' +
        '<div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid fa-user"></i></span><h2>Dados do Solicitante</h2></div></div>' +
        '<div class="lx-view-body">' +
          grid(requesterFields, "lx-grid-4") +
        '</div>' +
      '</div>' +
      '<div class="lx-section">' +
        '<div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid fa-briefcase"></i></span><h2>Dados da Requisição de Pessoal</h2></div></div>' +
          '<div class="lx-view-body">' +
          renderCompactRequisitionFields(f) +
          textarea("Perfil do Candidato", "observacoesVaga", f.observacoesVaga, true) +
          renderSubstitution() +
          formFieldset("Equipamentos", "laptop", "" +
            '<div class="lx-equipment-choice">' +
              radioGroup("Necessita Equipamento?", "precisaEquipamento", f.precisaEquipamento, ["Sim", "Não"], true) +
            '</div>' +
            (f.precisaEquipamento === "Sim" ? renderEquipmentsEditor() : "")
          ) +
          renderAttachmentsEditor("anexos", "Upload de Arquivos", "paperclip") +
          formFieldset("Justificativa", "comment-dots", textarea("Justificativa", "justificativa", f.justificativa, true)) +
          '<div class="lx-actions">' +
            '<button class="lx-btn lx-btn-secondary" type="button" data-action="draft"><i class="fa-solid fa-save"></i> Salvar rascunho</button>' +
            '<button class="lx-btn lx-btn-primary" type="button" data-action="submit"><i class="fa-solid fa-paper-plane"></i> Enviar solicitação</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      "";
  }

  function renderCorrectionFlow() {
    var stage = getStage("correcao");

    return renderReadOnlySummaryComponent() +
      renderPreviousApprovalComponent("gestor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }) +
      renderPreviousApprovalComponent("diretoria", {
        value: "return",
        justification: correctionReason
      }) +
      viewComponent(
        stage.title,
        stage.desc,
        state.status,
        renderSolicitacao(true),
        "",
        stage.icon,
        stage.tone
      ) +
      renderPreviousApprovalComponent("gestor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após correção da solicitação."
      }, false, "aprovacaoGestorAposCorrecao");
  }

  function renderCanceledFlow() {
    var stage = getStage("cancelada");

    return renderReadOnlySummaryComponent() +
      renderPreviousApprovalComponent("gestor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }) +
      renderPreviousApprovalComponent("diretoria", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }) +
      renderPreviousApprovalComponent("rh", {
        value: "reject",
        justification: "O perfil solicitado para a vaga não está aderente ao planejamento atual de contratação do RH."
      }, true) +
      viewComponent(
        stage.title,
        stage.desc,
        "Reprovada",
        '<div class="lx-history-stage lx-history-stage-red">A requisição foi encerrada como reprovada após decisão do Gestor do RH.</div>',
        "",
        stage.icon,
        stage.tone
      );
  }

  function renderFinishedFlow() {
    var stage = getStage("finalizada");

    return renderReadOnlySummaryComponent() +
      renderPreviousApprovalComponent("gestor", {
        value: "return",
        justification: "Necessário complementar a justificativa da vaga e revisar o salário proposto."
      }, false, "aprovacaoGestorRetorno1") +
      renderCorrectionRecordComponent("correcaoAjuste1", "Correção da Solicitação", "Ajustes realizados após devolução do Gestor Imediato.", {
        salario: "R$ 5.100,00",
        justificativa: state.form.justificativa + " Justificativa complementada após retorno do Gestor Imediato."
      }) +
      renderPreviousApprovalComponent("gestor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }, false, "aprovacaoGestorFinal") +
      renderPreviousApprovalComponent("diretoria", {
        value: "return",
        justification: "Necessário revisar o Centro de Custo antes da validação final da Diretoria."
      }, false, "aprovacaoDiretoriaRetorno1") +
      renderCorrectionRecordComponent("correcaoAjuste2", "Correção da Solicitação", "Ajustes realizados após devolução da Diretoria.", {
        cargo: "Analista de Qualidade Sênior",
        nivel: "Sênior - Step 3",
        centro: "IND.QUA.005",
        salario: "R$ 5.100,00",
        idadeMin: "26",
        idadeMax: "48",
        justificativa: state.form.justificativa + " Dados da vaga revisados conforme orientação da Diretoria."
      }) +
      renderPreviousApprovalComponent("gestor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas após a segunda correção da solicitação."
      }, false, "aprovacaoGestorAposCorrecao2") +
      renderPreviousApprovalComponent("diretoria", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }, false, "aprovacaoDiretoriaFinal") +
      renderPreviousApprovalComponent("rh", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }, false, "aprovacaoRhFinal") +
      viewComponent(
        stage.title,
        stage.desc,
        "Finalizada",
        '<div class="lx-history-stage lx-history-stage-green">Solicitação finalizada após aprovação do Gestor do RH.</div>',
        "",
        stage.icon,
        stage.tone
      );
  }

  function renderGroupedRequisitionFields(f) {
    return formFieldset("Perfil e Contrato", "id-card", grid(
      [radioGroup("Tipo de Necessidade", "tipo", f.tipo, ["Aumento de quadro", "Substituto"], true)]
        .concat(renderVacancyFields(f), renderProfileFields(f)),
      "lx-requisition-grid lx-profile-grid"
    )) +
      formFieldset("Jornada", "clock", grid(renderJourneyFields(f), "lx-grid-2"));
  }

  function renderCompactRequisitionFields(f) {
    return grid([
      radioGroup("Tipo de Necessidade", "tipo", f.tipo, ["Aumento de quadro", "Substituto"], true)
    ].concat(renderVacancyFields(f), renderProfileFields(f), renderJourneyFields(f)), "lx-requisition-grid lx-compact-requisition-grid");
  }

  function renderVacancyFields(f) {
    return [
      singleSelect("Cargo", "cargo", f.cargo, rm.cargos, true),
      singleSelect("Nível do Cargo", "nivel", f.nivel, rm.niveis, true),
      singleSelect("Setor / Seção", "secao", f.secao, rm.setores.map(function (item) { return item.nome; }), true),
      textarea("Descrição do Cargo", "descricaoCargo", f.descricaoCargo, true, true),
      singleSelect("Centro de Custo", "centro", f.centro, rm.centros, true),
      field("Salário Proposto", "salario", f.salario, false, true),
      field("Data Desejada de Início", "dataDesejada", f.dataDesejada, false, true, "", "", "date")
    ];
  }

  function renderProfileFields(f) {
    return [
      select("Tipo de Contrato", "contrato", f.contrato, ["Efetivo", "Aprendiz", "Estágio", "Temporário", "Tempo Determinado"], true),
      field("Idade Mínima", "idadeMin", f.idadeMin, false, true, "", "", "number"),
      field("Idade Máxima", "idadeMax", f.idadeMax, false, true, "", "", "number"),
      select("Estado Civil", "estadoCivil", f.estadoCivil, ["Indiferente", "Solteiro(a)", "Casado(a)"], true),
      select("Sexo", "sexo", f.sexo, ["Indiferente", "Masculino", "Feminino"], true)
    ];
  }

  function renderJourneyFields(f) {
    return [
      singleSelect("Escala", "escala", f.escala, rm.escalas.map(function (item) { return item.nome; }), true),
      field("Horário", "horario", f.horario, true, true)
    ];
  }

  function renderSubstitution() {
    var f = state.form;
    if (f.tipo !== "Substituto") return "";
    return formFieldset("Colaborador Substituído", "user-minus", grid([
        singleSelect("Colaborador substituído", "substituido", f.substituido, rm.colaboradores.map(function (item) { return item.nome; }), true),
        field("Matrícula / Chapa", "chapa", f.chapa, true),
        field("Cargo atual", "cargoAtual", f.cargoAtual, true),
        field("Setor / Seção", "secaoAtual", f.secaoAtual, true),
        field("Centro de Custo", "centroAtual", f.centroAtual, true),
        field("Data Prevista de Saída", "saidaPrevista", f.saidaPrevista, true, true, "", "", "date")
      ], "lx-grid-3"));
  }

  function renderEquipmentsEditor() {
    return '<div class="lx-child-table">' +
      '<button class="lx-btn lx-btn-primary" type="button" data-action="add-equipment"><i class="fa-solid fa-plus"></i> Adicionar equipamento</button>' +
      state.form.equipamentos.map(function (item, index) {
        return '<div class="lx-child-row" data-equipment-index="' + index + '">' +
          singleSelect("Equipamento", "equipamento", item.equipamento, rm.equipamentos, true, "equipment", index) +
          field("Quantidade", "quantidade", item.quantidade, false, true, "equipment", index, "number") +
          field("Observação", "observacao", item.observacao, false, true, "equipment", index) +
          '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-equipment" data-index="' + index + '" aria-label="Excluir equipamento"><i class="fa-solid fa-trash"></i></button>' +
        '</div>';
      }).join("") +
    '</div>';
  }

  function renderAttachmentsEditor(fieldName, title, icon) {
    var files = state.form[fieldName] || [];
    return formFieldset(title, icon, '' +
      '<div class="lx-dropzone" data-dropzone="' + fieldName + '">' +
        '<i class="fa-solid fa-cloud-arrow-up"></i>' +
        '<p>Arraste e solte seus arquivos aqui</p>' +
        '<span>ou</span>' +
        '<button type="button" class="lx-btn-outline" data-upload-trigger="' + fieldName + '">Escolher arquivo</button>' +
        '<input type="file" class="lx-file-input" data-file-upload="' + fieldName + '" multiple />' +
      '</div>' +
      renderAttachmentsList(files, fieldName, true)
    );
  }

  function renderAttachmentsList(files, fieldName, editable) {
    if (!files.length) return '<div class="lx-empty-list">Nenhum arquivo anexado.</div>';

    return '<div class="lx-attachment-list">' + files.map(function (file, index) {
      return '<div class="lx-attachment-row">' +
        '<div class="lx-attachment-info"><i class="fa-solid fa-file-lines"></i><div><strong>' + escapeHtml(file.nome) + '</strong><span>' + escapeHtml(file.tamanho || "-") + ' - ' + escapeHtml(file.origem || "Anexo") + '</span></div></div>' +
        '<div class="lx-attachment-actions">' +
          '<button class="lx-btn-icon lx-btn-secondary" type="button" data-action="view-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Visualizar anexo"><i class="fa-solid fa-eye"></i></button>' +
          '<button class="lx-btn-icon lx-btn-secondary" type="button" data-action="download-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Baixar anexo"><i class="fa-solid fa-download"></i></button>' +
          (editable ? '<button class="lx-btn-icon lx-btn-danger" type="button" data-action="delete-attachment" data-attachment-field="' + fieldName + '" data-index="' + index + '" aria-label="Excluir anexo"><i class="fa-solid fa-trash"></i></button>' : "") +
        '</div>' +
      '</div>';
    }).join("") + '</div>';
  }

  function renderApproval(key, title, approveText) {
    var decision = state.decisions[key] || { value: "approve", justification: "" };
    var previousComponents = renderReadOnlySummaryComponent();

    if (key === "diretoria") {
      previousComponents += renderPreviousApprovalComponent("gestor");
    }

    if (key === "rh") {
      previousComponents += renderPreviousApprovalComponent("gestor");
      previousComponents += renderPreviousApprovalComponent("diretoria");
    }

    return previousComponents +
      viewComponent(title, getStage(key).desc, state.status,
        '<div class="lx-current-decision" data-approval="' + key + '">' +
          decisionOption("approve", "Aprovar solicitação", approveText, decision.value) +
          decisionOption("return", "Devolver para correção", "A solicitação retornará ao solicitante para ajustes.", decision.value) +
          decisionOption("reject", "Reprovar solicitação", "A requisição será encerrada como reprovada.", decision.value) +
          '<label class="lx-field' + (decision.value === "approve" ? " lx-hidden" : "") + '" data-approval-justification><span>Justificativa <b>*</b></span><textarea data-decision-field="justification" placeholder="Informe o motivo da devolução ou reprovação...">' + escapeHtml(decision.justification) + '</textarea></label>' +
          (key === "rh" ? renderAttachmentsEditor("anexosRh", "Upload de Arquivos - RH", "paperclip") : "") +
          '<div class="lx-actions">' +
            '<button class="lx-btn lx-btn-secondary" type="button" data-action="draft"><i class="fa-solid fa-save"></i> Salvar rascunho</button>' +
            '<button class="lx-btn lx-btn-primary" type="button" data-action="send-approval" data-approval-key="' + key + '"><i class="fa-solid fa-paper-plane"></i> Enviar decisão</button>' +
          '</div>' +
        '</div>', "", getStage(key).icon, getStage(key).tone) +
      "";
  }

  function renderPreviousApprovalComponent(key, decisionSnapshot, forceOpen, customCollapseKey) {
    var stage = getStage(key);
    var collapseKey = customCollapseKey || "aprovacao" + key.charAt(0).toUpperCase() + key.slice(1);
    var open = forceOpen || !!state.collapses[collapseKey];
    var decision = decisionSnapshot || state.decisions[key] || { value: "approve", justification: "" };
    var responsaveis = { gestor: state.form.gestor, diretoria: state.form.diretor, rh: state.form.gestorRh };
    var label = decision.value === "return"
      ? "Solicitação devolvida para correção"
      : decision.value === "reject"
        ? "Solicitação reprovada"
        : "Solicitação aprovada";
    var tone = decision.value === "return" ? "orange" : decision.value === "reject" ? "red" : "green";
    var body = historySection("Decisão sobre a Solicitação", "list-check", tone, [
      ["Decisão", label],
      ["Responsável", responsaveis[key] || "-"],
      ["Observação", decision.justification || "Etapa aprovada sem ressalvas."]
    ]) + (key === "rh" ? renderRhAttachmentsReadOnly() : "");

    return viewComponent(
      '<button type="button" class="lx-collapse-title" data-collapse="' + collapseKey + '" aria-expanded="' + open + '"><span>' + stage.title + '</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>',
      movementDescription(key),
      "",
      (open ? body : ""),
      "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"),
      stage.icon,
      "green"
    );
  }

  function renderCorrectionRecordComponent(collapseKey, title, description, changes) {
    var stage = getStage("correcao");
    var open = !!state.collapses[collapseKey];

    return viewComponent(
      '<button type="button" class="lx-collapse-title" data-collapse="' + collapseKey + '" aria-expanded="' + open + '"><span>' + title + '</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>',
      movementDescription("correcao"),
      "",
      (open ? renderCorrectionSnapshot(changes) : ""),
      "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"),
      stage.icon,
      "green"
    );
  }

  function renderCorrectionSnapshot(changes) {
    var f = state.form;
    var snapshot = {
      tipo: changes.tipo || f.tipo,
      cargo: changes.cargo || f.cargo,
      descricaoCargo: changes.descricaoCargo || f.descricaoCargo,
      nivel: changes.nivel || f.nivel,
      secao: changes.secao || f.secao,
      centro: changes.centro || f.centro,
      salario: changes.salario || f.salario,
      dataDesejada: changes.dataDesejada || f.dataDesejada,
      contrato: changes.contrato || f.contrato,
      idadeMin: changes.idadeMin || f.idadeMin,
      idadeMax: changes.idadeMax || f.idadeMax,
      estadoCivil: changes.estadoCivil || f.estadoCivil,
      sexo: changes.sexo || f.sexo,
      escala: changes.escala || f.escala,
      horario: changes.horario || f.horario,
      observacoesVaga: changes.observacoesVaga || f.observacoesVaga,
      justificativa: changes.justificativa || f.justificativa
    };

    return historySection("Dados do Solicitante", "user", "blue", [
      ["Data/Hora", f.data], ["Número Solicitação", f.numero], ["Solicitante", f.solicitante], ["Gerência", f.gerencia], ["Filial", f.filial], ["Gestor Imediato", f.gestor]
    ]) +
      historySection("Solicitação Preenchida", "briefcase", "green", [
        ["Tipo de Necessidade", snapshot.tipo],
        ["Cargo", snapshot.cargo],
        ["Nível do Cargo", snapshot.nivel],
        ["Setor / Seção", snapshot.secao],
        ["Centro de Custo", snapshot.centro],
        ["Salário Proposto", snapshot.salario],
        ["Data Desejada de Início", formatDate(snapshot.dataDesejada)],
        ["Descrição do Cargo", snapshot.descricaoCargo],
        ["Tipo de Contrato", snapshot.contrato],
        ["Idade Mínima", snapshot.idadeMin],
        ["Idade Máxima", snapshot.idadeMax],
        ["Estado Civil", snapshot.estadoCivil],
        ["Sexo", snapshot.sexo],
        ["Escala", snapshot.escala],
        ["Horário", snapshot.horario]
      ], "lx-readonly-request-grid") +
      historyCustomSection("Perfil do Candidato", "clipboard-list", "blue", escapeHtml(snapshot.observacoesVaga || "-")) +
      renderReadOnlySubstitution() +
      historyCustomSection("Equipamentos", "laptop", "purple", '' +
        '<div class="lx-history-stage-grid"><div class="lx-history-stage-item"><span>Necessita Equipamento?</span><strong>' + escapeHtml(f.precisaEquipamento) + '</strong></div></div>' +
        renderEquipmentsReadTable()
      ) +
      historyCustomSection("Upload de Arquivos", "paperclip", "purple", renderAttachmentsList(f.anexos || [], "anexos", false)) +
      historyCustomSection("Justificativa", "comment-dots", "teal", escapeHtml(snapshot.justificativa || "-"));
  }

  function renderReadOnlySummaryComponent() {
    var f = state.form;
    var open = !!state.collapses.dadosRequisicao;

    return viewComponent(
      '<button type="button" class="lx-collapse-title" data-collapse="dadosRequisicao" aria-expanded="' + open + '"><span>Dados de Requisição de Pessoal</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? " lx-collapse-chevron-open" : "") + '"></i></button>',
      movementDescription("solicitacao"),
      "",
      (open ? '' +
        historySection("Dados do Solicitante", "user", "blue", [
          ["Data/Hora", f.data], ["Número Solicitação", f.numero], ["Solicitante", f.solicitante], ["Gerência", f.gerencia], ["Filial", f.filial], ["Gestor Imediato", f.gestor]
        ]) +
        historySection("Solicitação Preenchida", "briefcase", "green", [
          ["Tipo de Necessidade", f.tipo],
          ["Cargo", f.cargo],
          ["Nível do Cargo", f.nivel],
          ["Setor / Seção", f.secao],
          ["Centro de Custo", f.centro],
          ["Salário Proposto", f.salario],
          ["Data Desejada de Início", formatDate(f.dataDesejada)],
          ["Descrição do Cargo", f.descricaoCargo],
          ["Tipo de Contrato", f.contrato],
          ["Idade Mínima", f.idadeMin],
          ["Idade Máxima", f.idadeMax],
          ["Estado Civil", f.estadoCivil],
          ["Sexo", f.sexo],
          ["Escala", f.escala],
          ["Horário", f.horario]
        ], "lx-readonly-request-grid") +
        historyCustomSection("Perfil do Candidato", "clipboard-list", "blue", escapeHtml(f.observacoesVaga || "-")) +
        renderReadOnlySubstitution() +
        historyCustomSection("Equipamentos", "laptop", "purple", '' +
          '<div class="lx-history-stage-grid"><div class="lx-history-stage-item"><span>Necessita Equipamento?</span><strong>' + escapeHtml(f.precisaEquipamento) + '</strong></div></div>' +
          renderEquipmentsReadTable()
        ) +
        historyCustomSection("Upload de Arquivos", "paperclip", "purple", renderAttachmentsList(f.anexos || [], "anexos", false)) +
        historyCustomSection("Justificativa", "comment-dots", "teal", escapeHtml(f.justificativa || "-"))
      : ""),
      "lx-view-shell-history" + (open ? "" : " lx-view-shell-collapsed"),
      "fa-pen-to-square",
      "green"
    );
  }

  function renderReadOnlySubstitution() {
    var f = state.form;
    if (f.tipo !== "Substituto") return "";

    return historySection("Colaborador Substituído", "user", "orange", [
      ["Colaborador Substituído", f.substituido],
      ["Matrícula / Chapa", f.chapa],
      ["Cargo Atual", f.cargoAtual],
      ["Setor / Seção", f.secaoAtual],
      ["Centro de Custo", f.centroAtual],
      ["Data Prevista de Saída", formatDate(f.saidaPrevista)]
    ]);
  }

  function renderRhAttachmentsReadOnly() {
    return historyCustomSection("Upload de Arquivos - RH", "paperclip", "purple", renderAttachmentsList(state.form.anexosRh || [], "anexosRh", false));
  }

  function renderTi() {
    var f = state.form;
    return renderReadOnlySummaryComponent() +
      renderPreviousApprovalComponent("gestor", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }) +
      renderPreviousApprovalComponent("diretoria", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }) +
      renderPreviousApprovalComponent("rh", {
        value: "approve",
        justification: "Etapa aprovada sem ressalvas."
      }) +
      viewComponent(
        "Prévia do e-mail para TI",
        "E-mail automático quando houver equipamentos.",
        "",
        '<div class="lx-history-stage lx-history-stage-blue">' +
            '<strong>Assunto:</strong> Requisição de equipamento - ' + escapeHtml(f.numero) + '<br /><br />' +
            '<strong>Área:</strong> ' + escapeHtml(f.gerencia) + '<br />' +
            '<strong>Cargo:</strong> ' + escapeHtml(f.cargo) + ' / ' + escapeHtml(f.nivel) + '<br />' +
            '<strong>Data Desejada de Início:</strong> ' + escapeHtml(formatDate(f.dataDesejada)) + '<br />' +
            '<strong>Equipamentos:</strong><br />' + state.form.equipamentos.map(function (item) { return "- " + item.equipamento + " (" + item.quantidade + ") - " + item.observacao; }).join("<br />") +
          '</div>',
        "",
        "fa-laptop",
        "teal"
      );
  }

  function renderFinalState(title, tone, message) {
    return renderReadOnlySummaryComponent() +
      '<div class="lx-section">' +
        '<div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid ' + (tone === "red" ? "fa-ban" : "fa-circle-check") + '"></i></span><h2>' + title + '</h2></div></div>' +
        '<div class="lx-view-body"><div class="lx-history-stage lx-history-stage-' + tone + '">' + message + '</div></div>' +
      '</div>' +
      renderHistory();
  }

  function renderHistory() {
    return '<div class="lx-section">' +
      '<div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid fa-timeline"></i></span><h2>Histórico do Processo</h2></div></div>' +
      '<div class="lx-view-body"><div class="lx-timeline"><div class="lx-timeline-line"></div>' +
        state.history.map(function (item) {
          return '<div class="lx-timeline-step"><div class="lx-timeline-dot lx-dot-blue"><i class="fa-solid fa-check"></i></div><div class="lx-history-card">' +
            '<div class="lx-history-head lx-history-head-blue"><div><h3>' + escapeHtml(item.etapa) + '</h3><p>' + escapeHtml(item.responsavel) + ' - ' + escapeHtml(item.data) + '</p></div></div>' +
            '<div class="lx-history-body">' + historySection("Decisão", "list-check", item.decisao.indexOf("reprov") > -1 ? "red" : "green", [["Decisão", item.decisao], ["Observação", item.obs || "-"]]) + '</div>' +
          '</div></div>';
        }).join("") +
      '</div></div>' +
    '</div>';
  }

  function historySection(title, icon, tone, rows, gridClass) {
    return historyCustomSection(title, icon, tone, '<div class="lx-history-stage-grid ' + (gridClass || "") + '">' +
      rows.map(function (row) {
        return '<div class="lx-history-stage-item ' + readonlyItemClass(row[0]) + '"><span>' + escapeHtml(row[0]) + '</span><strong>' + escapeHtml(row[1] || "-") + '</strong></div>';
      }).join("") +
    '</div>');
  }

  function historyCustomSection(title, icon, tone, content) {
    return '<fieldset class="lx-history-fieldset lx-history-fieldset-' + tone + '">' +
      '<legend><i class="fa-solid fa-' + icon + '"></i> ' + title + '</legend>' +
      '<div class="lx-history-stage lx-history-stage-' + tone + '">' + content + '</div>' +
    '</fieldset>';
  }

  function readonlyItemClass(label) {
    return "lx-readonly-item-" + String(label || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }

  function renderEquipmentsReadTable() {
    if (state.form.precisaEquipamento !== "Sim") return "";
    return '<div class="lx-read-table"><div class="lx-read-head"><span>Equipamento</span><span>Quantidade</span><span>Observação</span></div>' +
      state.form.equipamentos.map(function (item) {
        return '<div class="lx-read-row"><strong>' + escapeHtml(item.equipamento) + '</strong><strong>' + escapeHtml(item.quantidade) + '</strong><strong>' + escapeHtml(item.observacao || "-") + '</strong></div>';
      }).join("") +
    '</div>';
  }

  function grid(items, className) {
    return '<div class="' + className + '">' + items.join("") + '</div>';
  }

  function formFieldset(title, icon, content) {
    return '<fieldset class="lx-fieldset">' +
      '<legend><i class="fa-solid fa-' + icon + '"></i> ' + title + '</legend>' +
      content +
    '</fieldset>';
  }

  function field(label, name, value, readonly, required, scope, index, type) {
    var fieldKey = scopedName(scope, index, name);
    var error = state.errors[fieldKey] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><input type="' + (type || "text") + '" data-field="' + name + '"' + scopedAttrs(scope, index) + (readonly ? " readonly" : "") + ' value="' + escapeHtml(value) + '" />' + errorHtml(error) + '</label>';
  }

  function textarea(label, name, value, required, readonly) {
    var error = state.errors[name] || "";
    return '<label class="lx-field ' + fieldClass(name) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><textarea data-field="' + name + '"' + (readonly ? " readonly" : "") + '>' + escapeHtml(value) + '</textarea>' + errorHtml(error) + '</label>';
  }

  function select(label, name, value, options, required) {
    var error = state.errors[name] || "";
    return '<label class="lx-field ' + fieldClass(name) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><select data-field="' + name + '">' +
      options.map(function (option) { return '<option' + (option === value ? " selected" : "") + '>' + escapeHtml(option) + '</option>'; }).join("") +
    '</select>' + errorHtml(error) + '</label>';
  }

  function radioGroup(label, name, value, options, required) {
    var error = state.errors[name] || "";
    var radioName = name + "_" + radioCounter++;
    return '<div class="lx-field lx-radio-field ' + fieldClass(name) + (error ? " lx-error" : "") + '">' +
      '<span>' + label + (required ? " <b>*</b>" : "") + '</span>' +
      '<div class="lx-radio-options">' +
        options.map(function (option) {
          return '<label class="lx-radio-option' + (option === value ? " lx-radio-option-selected" : "") + '">' +
            '<input type="radio" name="' + radioName + '" data-field="' + name + '" value="' + escapeHtml(option) + '"' + (option === value ? " checked" : "") + ' />' +
            '<strong>' + escapeHtml(option) + '</strong>' +
          '</label>';
        }).join("") +
      '</div>' +
      errorHtml(error) +
    '</div>';
  }

  function singleSelect(label, name, value, options, required, scope, index) {
    var fieldKey = scopedName(scope, index, name);
    var error = state.errors[fieldKey] || "";
    return '<label class="lx-field ' + fieldClass(name, scope) + (error ? " lx-error" : "") + '"><span>' + label + (required ? " <b>*</b>" : "") + '</span><div class="lx-single-select' + (value ? " has-value" : "") + '" data-single-select data-field="' + name + '"' + scopedAttrs(scope, index) + '>' +
      '<div class="lx-single-select-control">' +
        '<span class="lx-tag" data-selected-text>' + escapeHtml(value) + ' <button type="button" data-clear-select aria-label="Remover">x</button></span>' +
        '<input data-select-input placeholder="Pesquisar ' + label.toLowerCase() + '..." />' +
      '</div>' +
      '<div class="lx-select-list lx-hidden">' + options.map(function (option) { return '<button type="button" data-select-option="' + escapeHtml(option) + '">' + escapeHtml(option) + '</button>'; }).join("") + '</div>' +
    '</div>' + errorHtml(error) + '</label>';
  }

  function fieldClass(name, scope) {
    return 'lx-field-name-' + (scope ? scope + "-" : "") + name;
  }

  function decisionOption(value, title, description, selected) {
    var selectedClass = selected === value ? " lx-decision-option-selected" : "";
    var tone = value === "approve" ? "approve" : value === "return" ? "return" : "reject";
    return '<label class="lx-decision-option lx-decision-' + tone + selectedClass + '" data-decision="' + value + '"><input type="radio" name="decision"' + (selected === value ? " checked" : "") + ' /><div><span>' + title + '</span><p>' + description + '</p></div></label>';
  }

  function errorHtml(error) {
    return error ? '<small class="lx-error-message">' + escapeHtml(error) + '</small>' : "";
  }

  function scopedAttrs(scope, index) {
    return scope ? ' data-scope="' + scope + '" data-index="' + index + '"' : "";
  }

  function scopedName(scope, index, name) {
    return scope ? scope + "." + index + "." + name : name;
  }

  function bindEvents() {
    document.querySelectorAll("[data-stage]").forEach(function (card) {
      card.addEventListener("click", function (event) {
        event.preventDefault();
        setStage(card.getAttribute("data-stage"));
      });
    });

    document.querySelectorAll("[data-collapse]").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-collapse");
        state.collapses[key] = !state.collapses[key];
        render();
      });
    });

    document.querySelectorAll("[data-field]").forEach(function (fieldNode) {
      if (fieldNode.hasAttribute("data-single-select")) return;
      fieldNode.addEventListener("input", updateFieldFromEvent);
      fieldNode.addEventListener("change", updateFieldFromEvent);
    });

    bindSingleSelects();

    document.querySelectorAll("[data-decision]").forEach(function (node) {
      node.addEventListener("click", function () {
        var wrap = node.closest("[data-approval]");
        var key = wrap.getAttribute("data-approval");
        state.decisions[key] = state.decisions[key] || {};
        state.decisions[key].value = node.getAttribute("data-decision");
        render();
      });
    });

    document.querySelectorAll("[data-decision-field]").forEach(function (node) {
      node.addEventListener("input", function () {
        var key = node.closest("[data-approval]").getAttribute("data-approval");
        state.decisions[key] = state.decisions[key] || {};
        state.decisions[key].justification = node.value;
      });
    });

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", handleAction);
    });

    document.querySelectorAll("[data-file-upload]").forEach(function (input) {
      input.addEventListener("change", handleFileUpload);
    });

    document.querySelectorAll("[data-dropzone]").forEach(function (dropzone) {
      var input = dropzone.querySelector("[data-file-upload]");
      if (!input) return;

      dropzone.addEventListener("click", function () {
        input.click();
      });

      dropzone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropzone.classList.add("lx-drag-over");
      });

      dropzone.addEventListener("dragleave", function () {
        dropzone.classList.remove("lx-drag-over");
      });

      dropzone.addEventListener("drop", function (event) {
        event.preventDefault();
        dropzone.classList.remove("lx-drag-over");
        addFilesToAttachmentList(dropzone.getAttribute("data-dropzone"), event.dataTransfer && event.dataTransfer.files);
      });
    });
  }

  function handleFileUpload(event) {
    var input = event.target;
    addFilesToAttachmentList(input.getAttribute("data-file-upload"), input.files);
    render();
  }

  function addFilesToAttachmentList(fieldName, files) {
    if (!files || !files.length) return;

    state.form[fieldName] = state.form[fieldName] || [];

    for (var i = 0; i < files.length; i++) {
      state.form[fieldName].push({
        nome: files[i].name,
        tamanho: formatFileSize(files[i].size),
        origem: fieldName === "anexosRh" ? "Gestor do RH" : "Solicitação",
        url: URL.createObjectURL(files[i])
      });
    }
  }

  function formatFileSize(size) {
    if (!size) return "0 KB";
    if (size < 1024 * 1024) return Math.max(1, Math.round(size / 1024)) + " KB";
    return (size / 1024 / 1024).toFixed(1).replace(".", ",") + " MB";
  }

  function updateFieldFromEvent(event) {
    var node = event.target;
    var scope = node.getAttribute("data-scope");
    var index = node.getAttribute("data-index");
    var name = node.getAttribute("data-field");
    var shouldRender = event.type === "change" && (name === "tipo" || name === "precisaEquipamento");
    var value = node.value;

    if (name === "salario") {
      value = formatMoney(value);
      node.value = value;
    }

    if (scope === "equipment") {
      state.form.equipamentos[Number(index)][name] = value;
    } else {
      state.form[name] = value;
      applyAutoFill(name, value);
    }

    state.errors = {};
    clearFieldError(node);

    if (name === "dataDesejada" && value && isPastDate(value)) {
      state.errors.dataDesejada = "A data desejada de início não pode ser menor que a data atual.";
      showModal({
        title: "Data inválida",
        message: "A Data Desejada de Início não pode ser menor que a data atual.",
        icon: "fa-triangle-exclamation",
        confirmText: "Entendi",
        cancelText: "Fechar",
        onConfirm: hideModal
      });
      render();
      return;
    }

    if (shouldRender) render();
  }

  function clearFieldError(node) {
    var wrap = node.closest(".lx-field");
    if (!wrap) return;
    wrap.classList.remove("lx-error");
    var message = wrap.querySelector(".lx-error-message");
    if (message) message.remove();
  }

  function bindSingleSelects() {
    document.querySelectorAll("[data-single-select]").forEach(function (selectNode) {
      var list = selectNode.querySelector(".lx-select-list");
      var clear = selectNode.querySelector("[data-clear-select]");
      selectNode.querySelector(".lx-single-select-control").addEventListener("click", function () {
        closeSelectLists(list);
        list.classList.remove("lx-hidden");
      });
      if (clear) {
        clear.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          setSingleSelectValue(selectNode, "");
        });
      }
      selectNode.querySelectorAll("[data-select-option]").forEach(function (option) {
        option.addEventListener("click", function () {
          setSingleSelectValue(selectNode, option.getAttribute("data-select-option"));
        });
      });
    });

  }

  function closeSelectLists(except) {
    document.querySelectorAll(".lx-select-list").forEach(function (list) {
      if (list !== except) list.classList.add("lx-hidden");
    });
  }

  function setSingleSelectValue(selectNode, value) {
    var scope = selectNode.getAttribute("data-scope");
    var index = selectNode.getAttribute("data-index");
    var name = selectNode.getAttribute("data-field");

    if (scope === "equipment") {
      state.form.equipamentos[Number(index)][name] = value;
    } else {
      state.form[name] = value;
      applyAutoFill(name, value);
    }

    state.errors = {};
    render();
  }

  function applyAutoFill(name, value) {
    if (name === "secao") {
      var setor = rm.setores.filter(function (item) { return item.nome === value; })[0];
      state.form.centro = setor ? setor.centro : "";
    }

    if (name === "escala") {
      var escala = rm.escalas.filter(function (item) { return item.nome === value; })[0];
      state.form.horario = escala ? escala.horario : "";
    }

    if (name === "substituido") {
      var colaborador = rm.colaboradores.filter(function (item) { return item.nome === value; })[0];
      if (colaborador) {
        state.form.chapa = colaborador.chapa;
        state.form.cargoAtual = colaborador.cargo;
        state.form.secaoAtual = colaborador.secao;
        state.form.centroAtual = colaborador.centro;
        state.form.saidaPrevista = "2026-10-15";
      } else {
        state.form.chapa = "";
        state.form.cargoAtual = "";
        state.form.secaoAtual = "";
        state.form.centroAtual = "";
        state.form.saidaPrevista = "";
      }
    }
  }

  function handleAction(event) {
    var action = event.currentTarget.getAttribute("data-action");

    if (action === "draft") {
      showModal({
        title: "Salvar rascunho",
        message: "Deseja salvar os dados preenchidos até o momento?",
        icon: "fa-save",
        confirmText: "Salvar",
        onConfirm: function () {
          state.draftSavedAt = todayLabel();
          setStatus("Rascunho salvo");
          hideModal();
        }
      });
    }

    if (action === "submit") {
      if (!validateSolicitacao()) {
        render();
        scrollToFirstError();
        return;
      }
      showModal({
        title: "Enviar solicitação",
        message: "Deseja enviar a requisição para aprovação do Gestor Imediato?",
        icon: "fa-paper-plane",
        confirmText: "Enviar",
        onConfirm: function () {
          pushHistory("Solicitação de Requisição de Pessoal", state.form.solicitante, "Solicitação enviada", "Dados encaminhados para o Gestor Imediato.");
          setStatus("Em aprovação - Gestor Imediato");
          hideModal();
          setStage("gestor");
        }
      });
    }

    if (action === "add-equipment") {
      state.form.equipamentos.push({ equipamento: "", quantidade: "1", observacao: "" });
      render();
    }

    if (action === "delete-equipment") {
      var index = Number(event.currentTarget.getAttribute("data-index"));
      showModal({
        title: "Excluir equipamento",
        message: "Deseja remover este equipamento da requisição?",
        icon: "fa-trash",
        confirmText: "Excluir",
        onConfirm: function () {
          state.form.equipamentos.splice(index, 1);
          hideModal();
          render();
        }
      });
    }

    if (action === "view-attachment") {
      var attachment = getAttachmentFromButton(event.currentTarget);
      showModal({
        title: attachment ? attachment.nome : "Visualizar anexo",
        html: renderAttachmentPreview(attachment),
        icon: "fa-eye",
        confirmText: "Fechar",
        hideCancel: true,
        wide: true,
        onConfirm: hideModal
      });
    }

    if (action === "download-attachment") {
      var downloadAttachment = getAttachmentFromButton(event.currentTarget);
      if (downloadAttachment && downloadAttachment.url) {
        window.open(downloadAttachment.url, "_blank");
        return;
      }
      showModal({
        title: "Baixar anexo",
        message: downloadAttachment ? downloadAttachment.nome + " - " + downloadAttachment.tamanho : "Anexo não encontrado.",
        icon: "fa-download",
        confirmText: "Ok",
        cancelText: "Fechar",
        onConfirm: hideModal
      });
    }

    if (action === "delete-attachment") {
      var button = event.currentTarget;
      var fieldName = button.getAttribute("data-attachment-field");
      var attachmentIndex = Number(button.getAttribute("data-index"));
      showModal({
        title: "Excluir anexo",
        message: "Deseja remover este arquivo anexado?",
        icon: "fa-trash",
        confirmText: "Excluir",
        onConfirm: function () {
          state.form[fieldName].splice(attachmentIndex, 1);
          hideModal();
          render();
        }
      });
    }

    if (action === "send-approval") {
      var key = event.currentTarget.getAttribute("data-approval-key");
      if (!validateApproval(key)) return render();
      showModal({
        title: "Enviar decisão",
        message: "Deseja registrar a decisão desta etapa?",
        icon: "fa-paper-plane",
        confirmText: "Enviar",
        onConfirm: function () {
          applyDecision(key);
          hideModal();
          render();
        }
      });
    }

  }

  function getAttachmentFromButton(button) {
    var fieldName = button.getAttribute("data-attachment-field");
    var index = Number(button.getAttribute("data-index"));
    return (state.form[fieldName] || [])[index];
  }

  function renderAttachmentPreview(attachment) {
    if (!attachment) {
      return '<div class="lx-attachment-preview-empty">Anexo não encontrado.</div>';
    }

    if (!attachment.url) {
      return '<div class="lx-attachment-preview-empty">Este anexo não possui arquivo disponível para visualização.</div>';
    }

    return '<div class="lx-attachment-preview">' +
      '<iframe class="lx-attachment-frame" src="' + escapeHtml(encodeURI(attachment.url)) + '" title="' + escapeHtml(attachment.nome) + '"></iframe>' +
    '</div>';
  }

  function resolveAttachmentField(attachment) {
    return state.form.anexosRh.indexOf(attachment) > -1 ? "anexosRh" : "anexos";
  }

  function resolveAttachmentIndex(attachment) {
    var fieldName = resolveAttachmentField(attachment);
    return state.form[fieldName].indexOf(attachment);
  }

  function validateSolicitacao() {
    var f = state.form;
    var errors = {};
    ["tipo", "cargo", "descricaoCargo", "nivel", "contrato", "salario", "idadeMin", "idadeMax", "estadoCivil", "sexo", "dataDesejada", "centro", "secao", "escala", "horario", "precisaEquipamento", "observacoesVaga", "justificativa"].forEach(function (fieldName) {
      if (!String(f[fieldName] || "").trim()) errors[fieldName] = "Campo obrigatório.";
    });

    if (moneyToNumber(f.salario) <= 0 || isNaN(moneyToNumber(f.salario))) errors.salario = "Informe um salário proposto válido.";
    if (Number(f.idadeMin) <= 0 || isNaN(Number(f.idadeMin))) errors.idadeMin = "Informe uma idade mínima válida.";
    if (Number(f.idadeMax) <= 0 || isNaN(Number(f.idadeMax))) errors.idadeMax = "Informe uma idade máxima válida.";
    if (Number(f.idadeMax) < Number(f.idadeMin)) errors.idadeMax = "A idade máxima deve ser maior ou igual à idade mínima.";
    if (f.dataDesejada && isPastDate(f.dataDesejada)) errors.dataDesejada = "A data desejada de início não pode ser menor que a data atual.";

    if (f.tipo === "Substituto") {
      ["substituido", "saidaPrevista"].forEach(function (fieldName) {
        if (!String(f[fieldName] || "").trim()) errors[fieldName] = "Campo obrigatório.";
      });
    }

    if (f.precisaEquipamento === "Sim") {
      if (!f.equipamentos.length) {
        errors["equipment.0.equipamento"] = "Informe ao menos um equipamento.";
      }
      f.equipamentos.forEach(function (item, index) {
        if (!String(item.equipamento || "").trim()) errors["equipment." + index + ".equipamento"] = "Campo obrigatório.";
        if (!String(item.quantidade || "").trim() || Number(item.quantidade) <= 0) errors["equipment." + index + ".quantidade"] = "Quantidade inválida.";
        if (!String(item.observacao || "").trim()) errors["equipment." + index + ".observacao"] = "Campo obrigatório.";
      });
    }

    state.errors = errors;
    return Object.keys(errors).length === 0;
  }

  function scrollToFirstError() {
    window.requestAnimationFrame(function () {
      var firstError = document.querySelector(".lx-error");
      var focusable = firstError ? firstError.querySelector("input:not([readonly]), select, textarea, [data-select-input]") : null;

      if (!firstError) return;

      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      if (focusable) focusable.focus({ preventScroll: true });
    });
  }

  function validateApproval(key) {
    var decision = state.decisions[key] || { value: "approve", justification: "" };
    state.errors = {};
    if (decision.value !== "approve" && !String(decision.justification || "").trim()) {
      showModal({
        title: "Justificativa obrigatória",
        message: "Informe a justificativa para devolver ou reprovar a solicitação.",
        icon: "fa-triangle-exclamation",
        confirmText: "Entendi",
        cancelText: "Fechar",
        onConfirm: hideModal
      });
      return false;
    }
    return true;
  }

  function applyDecision(key) {
    var labels = { gestor: "Aprovação Gestor Imediato", diretoria: "Aprovação Diretoria", rh: "Aprovação Gestor do RH" };
    var responsaveis = { gestor: state.form.gestor, diretoria: state.form.diretor, rh: state.form.gestorRh };
    var decision = state.decisions[key] || { value: "approve", justification: "" };

    if (decision.value === "return") {
      pushHistory(labels[key], responsaveis[key], "Solicitação devolvida para correção", decision.justification);
      setStatus("Devolvida para correção");
      setStage("correcao");
      return;
    }

    if (decision.value === "reject") {
      pushHistory(labels[key], responsaveis[key], "Solicitação reprovada", decision.justification);
      setStatus("Reprovada");
      setStage("cancelada");
      return;
    }

    pushHistory(labels[key], responsaveis[key], "Solicitação aprovada", "Etapa aprovada sem ressalvas.");

    if (key === "gestor") {
      setStatus("Em aprovação - Diretoria");
      setStage("diretoria");
    } else if (key === "diretoria") {
      setStatus("Em aprovação - Gestor do RH");
      setStage("rh");
    } else if (state.form.precisaEquipamento === "Sim") {
      setStatus("Aprovada - Aguardando notificação TI");
      setStage("ti");
    } else {
      setStatus("Finalizada");
      setStage("finalizada");
    }
  }

  function pushHistory(etapa, responsavel, decisao, obs) {
    state.history.push({ etapa: etapa, responsavel: responsavel, decisao: decisao, data: todayLabel(), obs: obs });
  }

  modal.cancel.addEventListener("click", hideModal);
  modal.confirm.addEventListener("click", function () {
    if (modal.action) modal.action();
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-single-select]")) closeSelectLists();
  });

  setStatus(state.status);
  render();
})();

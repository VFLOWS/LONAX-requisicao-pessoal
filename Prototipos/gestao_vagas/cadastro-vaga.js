(function () {
  var SL = window.SLComponents;
  var DB = window.SLVagas;
  var requestedCode = new URLSearchParams(window.location.search).get("vaga");
  var existing = requestedCode ? DB.find(requestedCode) : null;
  var storedDraft = DB.readDraft();
  var draft = storedDraft && (storedDraft.code || "") === (existing ? existing.code : "") ? storedDraft : null;
  var state = draft || existing || {
    requisitionNumber: DB.requisitions[0].number,
    title: "Operador de Máquinas - Linha Industrial",
    openingDate: DB.today(),
    recruiter: "Carla Mendes",
    admissionOwner: "Renato Silva",
    modality: "Presencial",
    address: "Av. das Indústrias, 1450 - Sarzedo/MG",
    steps: ["triagem", "avaliacao", "entrevistaGestor", "teste", "parecer"],
    published: false,
    reference: "",
    url: "",
    publicationDate: "",
    publicationNotes: "",
    notes: ""
  };
  var pendingRecord = null;
  var dialogOpener = null;
  var dirty = false;
  var busy = false;
  var pendingNavigation = "dashboard.html";
  var steps = (state.selectionStages || DB.selectionSteps).map(function (step) { return Object.assign({}, step); });
  var stageIcons = [
    { icon: "fa-list-check", label: "Triagem" }, { icon: "fa-user-tie", label: "Gestor" },
    { icon: "fa-comments", label: "Entrevista" }, { icon: "fa-people-arrows", label: "Interação" },
    { icon: "fa-clipboard-check", label: "Avaliação" }, { icon: "fa-user-check", label: "Aprovação" },
    { icon: "fa-users", label: "Equipe" }, { icon: "fa-magnifying-glass", label: "Análise" },
    { icon: "fa-file-lines", label: "Documentação" }, { icon: "fa-file-signature", label: "Assinatura" },
    { icon: "fa-calendar-days", label: "Agendamento" }, { icon: "fa-briefcase", label: "Experiência" },
    { icon: "fa-laptop", label: "Teste técnico" }, { icon: "fa-graduation-cap", label: "Escolaridade" },
    { icon: "fa-shield-halved", label: "Segurança" }, { icon: "fa-helmet-safety", label: "Teste prático" },
    { icon: "fa-stethoscope", label: "Exame médico" }, { icon: "fa-handshake", label: "Proposta" },
    { icon: "fa-chart-simple", label: "Indicadores" }, { icon: "fa-bullseye", label: "Competências" },
    { icon: "fa-phone", label: "Contato" }, { icon: "fa-video", label: "Videoconferência" },
    { icon: "fa-building", label: "Área" }, { icon: "fa-flag-checkered", label: "Conclusão" }
  ];

  function selectedRequisition() {
    return DB.requisitions.find(function (item) { return item.number === document.getElementById("requisitionNumber").value; });
  }

  function input(name, label, config) {
    return SL.formField(Object.assign({ name: name, label: label, value: state[name] || "" }, config || {}));
  }

  function origin(name, label, config) {
    return input(name, label, Object.assign({ readonly: true }, config || {}));
  }

  function options(values) {
    return values.map(function (value) { return { value: value, label: value }; });
  }

  function formSection(title, icon, tone, fields, columns) {
    return SL.infoSection({ title: title, icon: icon, tone: tone, bodyHtml: '<div class="sl-form-grid sl-form-grid-' + (columns || 4) + '">' + fields.join("") + '</div>' });
  }

  function selectionBuilder() {
    return '<div class="sl-selection-toolbar">' + action("openStageDialog", "Adicionar etapa", "fa-plus") + '</div>' +
      '<div class="sl-selection-builder"><div><div class="sl-selection-heading"><h3>Etapas da seleção</h3><span id="selectionCount" role="status" aria-live="polite"></span></div><div class="sl-selection-stage-list" id="selectionStageList">' + steps.map(function (step, index) {
        return stageRow(step, index, state.steps.indexOf(step.id) !== -1);
      }).join("") + '</div><span class="sl-sr-only" id="selectionOrderFeedback" role="status" aria-live="polite"></span></div><div class="sl-selection-preview"><div class="sl-selection-heading"><h3>Fluxo da seleção</h3><i class="fa-solid fa-diagram-project" aria-hidden="true"></i></div><div id="selectionPreview"></div></div></div>';
  }

  function stageRow(step, index, active) {
    var inputId = "selection-switch-" + step.id;
    return '<div class="sl-selection-stage" data-stage-id="' + SL.escapeHtml(step.id) + '">' +
      SL.button({ className: "sl-stage-drag-handle", icon: "fa-grip-vertical", attrs: { "aria-label": "Ordenar etapa " + step.title, title: "Arraste para ordenar: " + step.title } }) +
      '<span class="sl-selection-stage-index" aria-hidden="true">' + (index + 1) + '</span><i class="fa-solid ' + SL.escapeHtml(step.icon) + '" aria-hidden="true"></i><label class="sl-selection-stage-title" for="' + SL.escapeHtml(inputId) + '">' + SL.escapeHtml(step.title) + '</label><input id="' + SL.escapeHtml(inputId) + '" class="sl-selection-switch" type="checkbox" role="switch" name="selectionStep" value="' + SL.escapeHtml(step.id) + '"' + (active ? ' checked' : '') + ' /></div>';
  }

  function stageIconChoices() {
    return '<div class="sl-stage-icon-grid" role="radiogroup" aria-label="Ícone da etapa">' + stageIcons.map(function (item, index) {
      return '<label class="sl-stage-icon-choice" title="' + SL.escapeHtml(item.label) + '"><input type="radio" name="stageIcon" value="' + item.icon + '" aria-label="' + SL.escapeHtml(item.label) + '"' + (index === 0 ? ' checked' : '') + ' /><i class="fa-solid ' + item.icon + '" aria-hidden="true"></i></label>';
    }).join("") + '</div>';
  }

  function selectedSteps() {
    return Array.from(document.querySelectorAll('#selectionStageList input[name="selectionStep"]:checked')).map(function (control) { return control.value; });
  }

  function updateSelection() {
    var selected = selectedSteps();
    var applicable = steps.filter(function (step) { return selected.indexOf(step.id) !== -1; });
    document.getElementById("selectionCount").textContent = selected.length + " de " + steps.length + " ativas";
    document.getElementById("selectionPreview").innerHTML = SL.selectionRoute(applicable);
  }

  function selectionChanged() {
    dirty = true;
    document.getElementById("draftFeedback").textContent = "";
    document.getElementById("stepsError").classList.add("sl-hidden");
    updateSelection();
  }

  function syncStageOrder() {
    var definitions = steps;
    steps = Array.from(document.querySelectorAll("#selectionStageList > [data-stage-id]")).map(function (row, index) {
      row.querySelector(".sl-selection-stage-index").textContent = index + 1;
      return definitions.find(function (step) { return step.id === row.getAttribute("data-stage-id"); });
    });
    selectionChanged();
  }

  function updateStageIconPreview() {
    var icon = document.querySelector('input[name="stageIcon"]:checked').value;
    document.getElementById("stageIconPreview").innerHTML = '<span><i class="fa-solid ' + icon + '" aria-hidden="true"></i></span><strong>' + SL.escapeHtml(document.getElementById("stageName").value.trim() || "Nova etapa") + '</strong>';
  }

  function addStage() {
    var name = document.getElementById("stageName");
    var title = name.value.trim().replace(/\s+/g, " ");
    var normalize = function (value) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR"); };
    name.setCustomValidity(!title ? "Informe o nome da etapa." : steps.some(function (step) { return normalize(step.title) === normalize(title); }) ? "Já existe uma etapa com esse nome." : "");
    if (!name.checkValidity()) {
      name.classList.add("sl-control-invalid");
      name.reportValidity();
      name.focus();
      return;
    }
    var step = { id: "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8), title: title, icon: document.querySelector('input[name="stageIcon"]:checked').value };
    steps.push(step);
    document.getElementById("selectionStageList").insertAdjacentHTML("beforeend", stageRow(step, steps.length - 1, true));
    selectionChanged();
    closeDialog("vacancyStage");
    document.getElementById("selectionOrderFeedback").textContent = "Etapa " + title + " adicionada.";
  }

  function action(id, label, icon, className) {
    return SL.button({ label: label, icon: icon, className: className || "sl-secondary-button", attrs: { id: id } });
  }

  function render() {
    var fields = [
      SL.infoSection({ title: "Requisição de origem", icon: "fa-file-signature", tone: "blue", bodyHtml:
        input("requisitionNumber", "Requisição de Pessoal aprovada", { type: "select", required: true, options: [{ value: "", label: "Selecione uma requisição aprovada" }].concat(DB.requisitions.map(function (item) { return { value: item.number, label: item.number + " - " + item.role + " - " + item.positions + (item.positions === 1 ? " posição" : " posições") }; })) }) +
        '<div class="sl-origin-presentation" id="requisitionPresentation"></div>'
      }),
      SL.infoSection({ title: "Dados da posição", icon: "fa-briefcase", tone: "green", bodyHtml: '<div id="positionPresentation"></div>' }),
      formSection("Dados do recrutamento", "fa-users", "purple", [
        input("title", "Título da vaga", { required: true, wide: true, attrs: { maxlength: 180 } }),
        origin("code", "Código da vaga", { value: existing ? existing.code : "Gerado ao cadastrar" }),
        origin("openingDate", "Data de abertura", { type: "date", value: existing ? existing.openingDate : DB.today() }),
        input("macrostatus", "Status da vaga", { type: "select", required: true, value: state.status || (state.published ? "Em recrutamento" : "Aguardando publicação"), options: options(DB.statuses) }),
        input("modality", "Modalidade", { required: true, type: "select", options: options(["Presencial", "Híbrido", "Remoto"]) }),
        input("recruiter", "Responsável pelo recrutamento", { required: true, type: "select", options: options(["Carla Mendes", "Renato Silva", "Ricardo Nunes"]) }),
        input("admissionOwner", "Responsável pela admissão", { required: true, type: "select", options: options(["Renato Silva", "Carla Mendes", "Ricardo Nunes"]) }),
        input("address", "Local de trabalho", { wide: true, attrs: { maxlength: 250 } }),
        input("notes", "Observações do recrutamento", { type: "textarea", wide: true })
      ]),
      SL.infoSection({ title: "Configuração do processo seletivo", icon: "fa-diagram-project", tone: "blue", bodyHtml:
        selectionBuilder() + '<p class="sl-form-error sl-hidden" id="stepsError" role="alert"></p>'
      }),
      SL.infoSection({ title: "Publicação na Sólides", icon: "fa-bullhorn", tone: "purple", bodyHtml:
        '<div class="sl-publication-choice"><span>Vaga publicada na Sólides?</span><div><label><input type="radio" name="published" value="yes"' + (state.published ? ' checked' : '') + ' /> Sim</label><label><input type="radio" name="published" value="no"' + (!state.published ? ' checked' : '') + ' /> Não</label></div></div>' +
        '<div class="sl-form-grid sl-publication-fields" id="publicationFields">' +
          input("reference", "Código / referência Sólides", { attrs: { maxlength: 80 } }) +
          input("url", "Link da vaga na Sólides", { type: "url", attrs: { placeholder: "https://lonax.vagas.solides.com.br/vaga/...", maxlength: 500 } }) +
          input("publicationDate", "Data de publicação", { type: "date", attrs: { max: DB.today() } }) +
          input("publicationNotes", "Observação da publicação", { type: "textarea", wide: true }) +
        '</div>'
      }),
      '<p class="sl-form-error sl-hidden" id="vacancyError" role="alert"></p>',
      '<div class="sl-form-actions sl-vacancy-actions">' +
        action("cancelVacancy", "Cancelar", "fa-xmark") +
        action("saveDraft", "Salvar rascunho", "fa-floppy-disk") +
        SL.button({ label: existing ? "Salvar alterações" : "Cadastrar vaga", icon: "fa-check", type: "submit" }) +
      '</div>'
    ];
    document.getElementById("cadastroVagaApp").innerHTML = SL.pageSection({
      title: existing ? "Cadastro da vaga " + existing.code : "Cadastro de vaga",
      description: "Dados da posição aprovada e configuração do recrutamento e seleção.",
      icon: "fa-briefcase", iconClass: "sl-section-icon-candidates",
      className: "sl-vacancy-registration",
      actionsHtml: '<a class="sl-secondary-button" href="dashboard.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Painel de vagas</a>',
      bodyHtml: '<form id="cadastroVagaForm" class="sl-cadastro-vaga-form" novalidate>' + fields.join("") + '</form><p class="sl-vacancy-feedback" id="draftFeedback" role="status">' + (draft ? 'Rascunho recuperado.' : '') + '</p>'
    }) + SL.dialog({
      id: "vacancyConfirm", title: existing ? "Confirmar alterações" : "Confirmar cadastro da vaga",
      description: "Confira a posição e as informações do recrutamento.",
      bodyHtml: '<div id="vacancyReview"></div>',
      actionsHtml: action("backVacancyConfirm", "Voltar", "fa-arrow-left") + action("finishVacancy", "Confirmar", "fa-check", "sl-primary-button")
    }) + SL.dialog({
      id: "vacancyStage", title: "Adicionar etapa da seleção", icon: "fa-diagram-project", className: "sl-stage-dialog",
      bodyHtml: '<div class="sl-stage-form">' + SL.formField({ name: "stageName", label: "Nome da etapa", required: true, attrs: { maxlength: 80, autocomplete: "off" } }) + '<div><span class="sl-stage-icon-label">Ícone da etapa</span>' + stageIconChoices() + '</div><div class="sl-stage-icon-preview" id="stageIconPreview"></div></div>',
      actionsHtml: action("cancelStageDialog", "Cancelar", "fa-xmark") + action("confirmStageDialog", "Adicionar etapa", "fa-plus", "sl-primary-button")
    }) + SL.dialog({
      id: "vacancyDraft", title: "Salvar rascunho", icon: "fa-floppy-disk",
      className: "sl-vacancy-dialog-compact",
      description: "O preenchimento será salvo para continuar depois. A vaga ainda não será cadastrada.",
      bodyHtml: '<div id="vacancyDraftReview"></div>',
      actionsHtml: action("backVacancyDraft", "Voltar", "fa-arrow-left") + action("confirmVacancyDraft", "Salvar rascunho", "fa-floppy-disk", "sl-primary-button")
    }) + SL.dialog({
      id: "vacancyDraftSuccess", title: "Rascunho salvo", icon: "fa-circle-check",
      className: "sl-vacancy-dialog-compact",
      description: "As informações foram salvas. Você poderá retomar o preenchimento depois.",
      actionsHtml: action("continueVacancyDraft", "Continuar preenchendo", "fa-pen-to-square", "sl-primary-button")
    }) + SL.dialog({
      id: "vacancyCancel", title: "Cancelar cadastro", icon: "fa-triangle-exclamation",
      className: "sl-vacancy-dialog-compact",
      description: "Ao cancelar, as informações deste preenchimento não serão salvas e serão perdidas. O rascunho deste cadastro, se houver, também será descartado.",
      actionsHtml: action("backVacancyCancel", "Continuar preenchendo", "fa-arrow-left") + action("discardVacancy", "Confirmar cancelamento", "fa-xmark", "sl-primary-button")
    }) + SL.dialog({
      id: "vacancySuccess", title: "Vaga cadastrada", icon: "fa-circle-check",
      description: "O registro da vaga foi salvo.",
      bodyHtml: '<div id="vacancySuccessData"></div>',
      actionsHtml: '<a class="sl-secondary-button" id="openSavedVacancy" href="detalhe-vaga.html"><i class="fa-solid fa-briefcase" aria-hidden="true"></i> Visualizar vaga</a><a class="sl-primary-button" href="dashboard.html"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Ir ao painel</a>'
    }) + '<section class="sl-confirm-backdrop sl-hidden" id="vacancyLoading" role="status" aria-live="polite"><div class="sl-result-panel"><div class="sl-loading-box"><span class="sl-loader"></span><h3>Salvando vaga</h3><p>Registrando a posição e as etapas de seleção.</p></div></div></section>';
    bind();
    updateOrigin();
    updatePublication(false);
    updateSelection();
  }

  function updateOrigin() {
    var requisition = selectedRequisition();
    function value(key) { return requisition ? String(requisition[key]) : "—"; }
    function date(key) { return requisition ? requisition[key].split("-").reverse().join("/") : "—"; }
    document.getElementById("requisitionPresentation").innerHTML = SL.infoGrid([
      { label: "Solicitante", value: value("requester") },
      { label: "Aprovado pelo RH", value: value("approvedBy") },
      { label: "Data da aprovação", value: date("approvedAt") }
    ], 3);
    document.getElementById("positionPresentation").innerHTML = SL.infoGrid([
      { label: "Cargo", value: value("role") }, { label: "Nível / Step", value: value("level") },
      { label: "Setor / Seção", value: value("area") }, { label: "Centro de custo", value: value("costCenter") },
      { label: "Descrição do cargo", value: value("description"), wide: true },
      { label: "Área / Gerência", value: value("department") }, { label: "Gestor responsável", value: value("manager") },
      { label: "Unidade / Filial", value: value("unit") }, { label: "Quantidade de posições", value: value("positions") },
      { label: "Tipo de necessidade", value: value("need") }, { label: "Tipo de contrato", value: value("contract") },
      { label: "Salário proposto", value: value("salary") }, { label: "Data desejada de início", value: date("desiredDate") },
      { label: "Escala", value: value("schedule") }, { label: "Horário", value: value("hours") },
      { label: "Escolaridade", value: value("education") },
      { label: "Justificativa", value: value("justification"), wide: true },
      { label: "Observações para a vaga", value: value("notes"), wide: true }
    ], 4);
    document.getElementById("publicationDate").min = requisition ? requisition.approvedAt : "";
  }

  function updatePublication(syncStatus) {
    var published = document.querySelector('input[name="published"]:checked').value === "yes";
    document.getElementById("publicationFields").classList.toggle("sl-hidden", !published);
    ["reference", "url", "publicationDate", "publicationNotes"].forEach(function (name) {
      var control = document.getElementById(name);
      control.disabled = !published;
      var required = published && name !== "publicationNotes";
      control.required = required;
      control.closest("label").querySelector("span").innerHTML = SL.escapeHtml({ reference: "Código / referência Sólides", url: "Link da vaga na Sólides", publicationDate: "Data de publicação", publicationNotes: "Observação da publicação" }[name]) + (required ? ' <em>*</em>' : '');
    });
    var status = document.getElementById("macrostatus");
    if (syncStatus !== false && (status.value === "Aguardando publicação" || status.value === "Em recrutamento")) {
      status.value = published ? "Em recrutamento" : "Aguardando publicação";
    }
  }

  function snapshot() {
    var data = Object.fromEntries(new FormData(document.getElementById("cadastroVagaForm")).entries());
    var requisition = selectedRequisition();
    return {
      code: existing ? existing.code : "",
      requisitionNumber: requisition ? requisition.number : "",
      requisition: requisition || null,
      title: data.title.trim(),
      openingDate: data.openingDate,
      recruiter: data.recruiter,
      admissionOwner: data.admissionOwner,
      modality: data.modality,
      address: data.address.trim(),
      selectionStages: steps.map(function (step) { return Object.assign({}, step); }),
      steps: selectedSteps(),
      published: data.published === "yes",
      reference: (data.reference || "").trim(),
      url: (data.url || "").trim(),
      publicationDate: data.publicationDate || "",
      publicationNotes: (data.publicationNotes || "").trim(),
      notes: data.notes.trim(),
      status: data.macrostatus
    };
  }

  function showError(message) {
    var element = document.getElementById("vacancyError");
    element.textContent = message;
    element.classList.remove("sl-hidden");
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function validate() {
    var form = document.getElementById("cadastroVagaForm");
    form.classList.add("sl-form-submitted");
    document.getElementById("vacancyError").classList.add("sl-hidden");
    document.getElementById("stepsError").classList.add("sl-hidden");
    ["title", "reference"].forEach(function (name) {
      var control = document.getElementById(name);
      control.setCustomValidity(control.required && !control.value.trim() ? "Preencha este campo." : "");
    });
    var url = document.getElementById("url");
    var publicationDate = document.getElementById("publicationDate");
    url.setCustomValidity("");
    publicationDate.setCustomValidity("");
    if (!url.disabled && url.value) {
      try {
        var parsed = new URL(url.value);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") url.setCustomValidity("Informe um link HTTP ou HTTPS válido.");
      } catch (error) {
        url.setCustomValidity("Informe um link válido.");
      }
    }
    if (!publicationDate.disabled && publicationDate.value > DB.today()) publicationDate.setCustomValidity("A data de publicação não pode estar no futuro.");
    if (!publicationDate.disabled && publicationDate.value && publicationDate.value < publicationDate.min) publicationDate.setCustomValidity("A publicação deve ocorrer a partir da aprovação da requisição.");
    if (!form.checkValidity()) {
      var invalid = form.querySelector(":invalid");
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
      invalid.focus({ preventScroll: true });
      invalid.reportValidity();
      return false;
    }
    if (!document.querySelector('input[name="selectionStep"]:checked')) {
      var error = document.getElementById("stepsError");
      error.textContent = "Selecione ao menos uma etapa para o processo seletivo.";
      error.classList.remove("sl-hidden");
      error.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelector('input[name="selectionStep"]').focus({ preventScroll: true });
      return false;
    }
    var requisition = selectedRequisition();
    if (DB.list().some(function (item) { return item.requisition.number === requisition.number && (!existing || item.code !== existing.code); })) {
      showError("Esta requisição já possui uma vaga cadastrada. Selecione outra requisição aprovada.");
      return false;
    }
    return true;
  }

  function review(record) {
    return SL.infoGrid([
      { label: "Requisição de origem", value: record.requisitionNumber },
      { label: "Título da vaga", value: record.title },
      { label: "Cargo", value: record.requisition.role },
      { label: "Nível / Step", value: record.requisition.level },
      { label: "Quantidade de posições", value: String(record.requisition.positions) },
      { label: "Gestor", value: record.requisition.manager },
      { label: "Responsável pelo recrutamento", value: record.recruiter },
      { label: "Status da vaga", value: record.status },
      { label: "Referência Sólides", value: record.reference || "Não vinculada" },
      { label: "Etapas de seleção", value: DB.activeSelectionSteps(record).map(function (step) { return step.title; }).join(" → "), wide: true }
    ]);
  }

  function openDialog(id) {
    dialogOpener = document.activeElement;
    var element = document.getElementById(id);
    element.classList.remove("sl-hidden");
    document.body.classList.add("sl-modal-open");
    var control = element.querySelector('input[type="text"], select, textarea, button, a');
    if (control) control.focus();
  }

  function closeDialog(id) {
    document.getElementById(id).classList.add("sl-hidden");
    document.body.classList.remove("sl-modal-open");
    if (dialogOpener && dialogOpener.isConnected) dialogOpener.focus({ preventScroll: true });
  }

  function save() {
    if (busy) return;
    busy = true;
    closeDialog("vacancyConfirm");
    openDialog("vacancyLoading");
    window.setTimeout(function () {
      try {
        var record = pendingRecord;
        record.updatedAt = new Date().toISOString();
        record.createdAt = existing ? existing.createdAt : record.updatedAt;
        DB.save(record);
        existing = record;
        dirty = false;
        try { DB.clearDraft(); } catch (error) { /* The saved record remains available. */ }
        document.getElementById("code").value = record.code;
        document.getElementById("vacancySuccessTitle").textContent = "Vaga " + record.code + " salva";
        document.getElementById("vacancySuccessData").innerHTML = review(record);
        document.getElementById("openSavedVacancy").href = "detalhe-vaga.html?vaga=" + encodeURIComponent(record.code);
        closeDialog("vacancyLoading");
        openDialog("vacancySuccess");
      } catch (error) {
        closeDialog("vacancyLoading");
        showError(error.message || "Não foi possível salvar a vaga. Tente novamente.");
      }
      busy = false;
    }, 2000);
  }

  function saveDraft() {
    try {
      DB.saveDraft(snapshot());
      dirty = false;
      closeDialog("vacancyDraft");
      document.getElementById("draftFeedback").textContent = "Rascunho salvo.";
      openDialog("vacancyDraftSuccess");
    } catch (error) {
      closeDialog("vacancyDraft");
      showError("Não foi possível salvar o rascunho neste navegador.");
    }
  }

  function cancel(destination) {
    pendingNavigation = typeof destination === "string" ? destination : "dashboard.html";
    openDialog("vacancyCancel");
  }

  function bind() {
    var form = document.getElementById("cadastroVagaForm");
    form.addEventListener("input", function (event) {
      dirty = true;
      document.getElementById("draftFeedback").textContent = "";
      if (event.target.setCustomValidity) event.target.setCustomValidity("");
    });
    form.addEventListener("change", function () { dirty = true; });
    document.getElementById("requisitionNumber").addEventListener("change", function () {
      updateOrigin();
      var requisition = selectedRequisition();
      document.getElementById("title").value = requisition ? requisition.role : "";
    });
    var stageList = document.getElementById("selectionStageList");
    Sortable.create(stageList, {
      handle: ".sl-stage-drag-handle",
      draggable: ".sl-selection-stage",
      animation: 150,
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 4,
      ghostClass: "sl-selection-stage-ghost",
      chosenClass: "sl-selection-stage-chosen",
      onEnd: function (event) {
        if (event.oldIndex === event.newIndex) return;
        syncStageOrder();
        document.getElementById("selectionOrderFeedback").textContent = steps[event.newIndex].title + " movida para a posição " + (event.newIndex + 1) + ".";
      }
    });
    stageList.addEventListener("change", selectionChanged);
    stageList.addEventListener("keydown", function (event) {
      var handle = event.target.closest(".sl-stage-drag-handle");
      if (!handle || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
      event.preventDefault();
      var row = handle.closest(".sl-selection-stage");
      if (event.key === "ArrowUp" && row.previousElementSibling) stageList.insertBefore(row, row.previousElementSibling);
      else if (event.key === "ArrowDown" && row.nextElementSibling) stageList.insertBefore(row.nextElementSibling, row);
      else return;
      syncStageOrder();
      handle.focus({ preventScroll: true });
      document.getElementById("selectionOrderFeedback").textContent = row.querySelector(".sl-selection-stage-title").textContent + " movida para a posição " + row.querySelector(".sl-selection-stage-index").textContent + ".";
    });
    document.getElementById("openStageDialog").addEventListener("click", function () {
      var name = document.getElementById("stageName");
      name.value = "";
      name.setCustomValidity("");
      name.classList.remove("sl-control-invalid");
      document.querySelector('input[name="stageIcon"]').checked = true;
      updateStageIconPreview();
      openDialog("vacancyStage");
    });
    document.getElementById("stageName").addEventListener("input", function () {
      this.setCustomValidity("");
      this.classList.remove("sl-control-invalid");
      updateStageIconPreview();
    });
    document.getElementById("stageName").addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); addStage(); }
    });
    document.querySelectorAll('input[name="stageIcon"]').forEach(function (control) {
      control.addEventListener("change", updateStageIconPreview);
    });
    document.getElementById("cancelStageDialog").addEventListener("click", function () { closeDialog("vacancyStage"); });
    document.getElementById("confirmStageDialog").addEventListener("click", addStage);
    document.querySelectorAll('input[name="published"]').forEach(function (control) { control.addEventListener("change", updatePublication); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate()) return;
      pendingRecord = snapshot();
      document.getElementById("vacancyReview").innerHTML = review(pendingRecord);
      openDialog("vacancyConfirm");
    });
    document.getElementById("backVacancyConfirm").addEventListener("click", function () { closeDialog("vacancyConfirm"); });
    document.getElementById("finishVacancy").addEventListener("click", save);
    document.getElementById("saveDraft").addEventListener("click", function () {
      var record = snapshot();
      document.getElementById("vacancyDraftReview").innerHTML = SL.infoGrid([
        { label: "Requisição de origem", value: record.requisitionNumber || "Não selecionada" },
        { label: "Título da vaga", value: record.title || "Não informado" },
        { label: "Status da vaga", value: record.status },
        { label: "Etapas ativas", value: String(record.steps.length) }
      ], 2);
      openDialog("vacancyDraft");
    });
    document.getElementById("backVacancyDraft").addEventListener("click", function () { closeDialog("vacancyDraft"); });
    document.getElementById("confirmVacancyDraft").addEventListener("click", saveDraft);
    document.getElementById("continueVacancyDraft").addEventListener("click", function () { closeDialog("vacancyDraftSuccess"); });
    document.getElementById("cancelVacancy").addEventListener("click", cancel);
    document.getElementById("backVacancyCancel").addEventListener("click", function () { closeDialog("vacancyCancel"); });
    document.getElementById("discardVacancy").addEventListener("click", function () {
      try {
        var currentDraft = DB.readDraft();
        if (currentDraft && (currentDraft.code || "") === (existing ? existing.code : "")) DB.clearDraft();
      } catch (error) { /* Navigation is still available. */ }
      window.location.href = pendingNavigation;
    });
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || !dirty || busy || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || document.querySelector(".sl-confirm-backdrop:not(.sl-hidden)")) return;
      if (link.target === "_blank" || link.getAttribute("href") === "#") return;
      event.preventDefault();
      cancel(link.getAttribute("href"));
    });
    document.addEventListener("keydown", function (event) {
      var modal = document.querySelector(".sl-confirm-backdrop:not(.sl-hidden)");
      if (!modal || busy) return;
      if (event.key === "Escape" && ["vacancyConfirm", "vacancyCancel", "vacancyDraft", "vacancyDraftSuccess", "vacancyStage"].indexOf(modal.id) !== -1) closeDialog(modal.id);
      if (event.key === "Tab") {
        var controls = Array.from(modal.querySelectorAll('button, a, input:not([type="radio"]), input[type="radio"]:checked, select, textarea')).filter(function (control) { return !control.disabled; });
        if (!controls.length) return;
        if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
      }
    });
  }

  render();
}());

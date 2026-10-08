var existingCandidates = [
  {
    name: "Marina Oliveira",
    email: "marina.oliveira@email.com",
    cpf: "123.456.789-10",
    phone: "(62) 99921-3388",
    profile: ["Comunicador", "Executor"],
    workflow: "5001",
    activity: "Triagem RH",
    status: "Em processo",
    sla: "No prazo",
    birthDate: "18/04/1999",
    gender: "Feminino",
    address: "Aparecida de Goiania - GO",
    origin: "Sólides",
    salary: "R$ 1.200,00"
  },
  {
    name: "Caio Henrique",
    email: "caio.henrique@email.com",
    cpf: "987.654.321-00",
    phone: "(62) 98810-2211",
    profile: ["Planejador", "Analista"],
    workflow: "5002",
    activity: "Avaliação do Gestor",
    status: "Em processo",
    sla: "No prazo",
    birthDate: "02/09/1998",
    gender: "Masculino",
    address: "Goiania - GO",
    origin: "Sólides",
    salary: "R$ 1.200,00"
  }
];

var importedCandidates = [];
var selectedIds = [];
var workflowSeed = 5100;
var SL = window.SLComponents;
var manualStep = "personal";

var mockImportCandidates = [
  {
    id: "imp-1",
    name: "ALEXANDER HAUBRICHS DE",
    email: "alexandeer181@gmail.com",
    cpf: "155.909.707-84",
    phone: "(21) 98091-0707",
    profile: ["Planejador", "Executor", "Analista"],
    birthDate: "25/10/1992",
    gender: "Masculino",
    address: "Rua Acapu, Marechal Hermes - Rio de Janeiro/RJ",
    origin: "JOBS API",
    salary: "R$ 3.500,00"
  },
  {
    id: "imp-2",
    name: "LARISSA MENDES",
    email: "larissa.mendes@email.com",
    cpf: "274.119.638-20",
    phone: "(62) 99118-4402",
    profile: ["Comunicador", "Executor"],
    birthDate: "14/06/2001",
    gender: "Feminino",
    address: "Setor Bueno - Goiania/GO",
    origin: "Sólides",
    salary: "R$ 1.300,00"
  },
  {
    id: "imp-3",
    name: "RAFAEL ALVES",
    email: "rafael.alves@email.com",
    cpf: "391.402.778-55",
    phone: "(62) 99742-8840",
    profile: ["Executor", "Analista"],
    birthDate: "08/11/2000",
    gender: "Masculino",
    address: "Aparecida de Goiania/GO",
    origin: "CSV Sólides",
    salary: "R$ 1.200,00"
  }
];

var vacancy = {
  title: "Operador de Máquinas - Linha Industrial",
  period: "Publicação 31/07/2026 - Fechamento 14/08/2026",
  status: "Atrasado",
  meta: [
    { icon: "fa-location-dot", text: "Av. das Indústrias, 1450 - Sarzedo/MG" },
    { icon: "fa-building", text: "Presencial" },
    { icon: "fa-medal", text: "Operacional" },
    { icon: "fa-dollar-sign", text: "R$ 2.450,00" }
  ],
  metrics: [
    { icon: "fa-file-signature", className: "sl-vagas-kpi-blue", label: "Requisição de origem", value: "REQ-2026-0184" },
    { icon: "fa-id-badge", className: "sl-vagas-kpi-green", label: "Tipo de contratação", value: "Efetivo" },
    { icon: "fa-users-gear", className: "sl-vagas-kpi-orange", label: "Quantidade de posições", value: "1" },
    { icon: "fa-link", className: "sl-vagas-kpi-red", label: "Referência Sólides", value: "895022" }
  ],
  responsibles: [
    { initials: "CM", name: "Carla Mendes" },
    { initials: "RS", name: "Renato Silva" }
  ],
  linkHref: "https://lonax.vagas.solides.com.br/vaga/895022",
  linkText: "lonax.vagas.solides.com.br/vaga/895022"
};

function renderProcessPage() {
  var actions = [
    '<input id="candidateFile" type="file" accept=".csv,.xls,.xlsx" hidden />',
    SL.button({ className: "sl-secondary-button", icon: "fa-user-plus", label: "Cadastrar candidato", attrs: { id: "manualButton" } }),
    SL.button({ className: "sl-primary-button", icon: "fa-file-import", label: "Importar Excel", attrs: { id: "importButton" } })
  ].join("");

  document.getElementById("processApp").innerHTML = [
    SL.pageSection({
      title: "Processo seletivo",
      description: "Candidatos inscritos e selecionados para acompanhamento desta vaga.",
      icon: "fa-users",
      iconClass: "sl-section-icon-candidates",
      bodyHtml: [
        SL.jobSummary(vacancy),
        '<div class="sl-candidate-list-head"><div><h3>Lista de candidatos</h3><p>Candidatos vinculados a esta vaga e suas solicitações individuais no Fluig.</p></div><div class="sl-panel-actions">' + actions + "</div></div>",
        '<div class="sl-vagas-viewbar">' + SL.tabs({
          label: "Visualização dos candidatos",
          items: [
            { label: "Lista", icon: "fa-list", active: true, attrs: { "data-view": "list" } },
            { label: "Kanban", icon: "fa-table-columns", attrs: { "data-view": "kanban" } }
          ]
        }) + "</div>",
        SL.table({
          id: "listView",
          className: "sl-candidates-table",
          bodyId: "candidateTable",
          columns: ["Candidato", "E-mail", "CPF", "Perfil", "Solicitação Fluig", "Atividade atual", "Status", "SLA"]
        }),
        '<div class="sl-kanban sl-candidate-kanban sl-hidden" id="kanbanView"></div>'
      ].join("")
    }),
    SL.modalShell()
  ].join("");
}

renderProcessPage();

var els = {
  candidateTable: document.getElementById("candidateTable"),
  candidateFile: document.getElementById("candidateFile"),
  importButton: document.getElementById("importButton"),
  selectFileButton: document.getElementById("selectFileButton"),
  importPanel: document.getElementById("importPanel"),
  closeImport: document.getElementById("closeImport"),
  confirmPanel: document.getElementById("confirmPanel"),
  cancelConfirm: document.getElementById("cancelConfirm"),
  cancelPanel: document.getElementById("cancelPanel"),
  backCancel: document.getElementById("backCancel"),
  confirmCancel: document.getElementById("confirmCancel"),
  loadingPanel: document.getElementById("loadingPanel"),
  loadingTitle: document.getElementById("loadingTitle"),
  loadingText: document.getElementById("loadingText"),
  successPanel: document.getElementById("successPanel"),
  successTitle: document.getElementById("successTitle"),
  manualPanel: document.getElementById("manualPanel"),
  manualConfirmPanel: document.getElementById("manualConfirmPanel"),
  manualConfirmTable: document.getElementById("manualConfirmTable"),
  manualConfirmBack: document.getElementById("manualConfirmBack"),
  manualConfirmFinish: document.getElementById("manualConfirmFinish"),
  manualButton: document.getElementById("manualButton"),
  manualClose: document.getElementById("manualClose"),
  manualCancel: document.getElementById("manualCancel"),
  manualForm: document.getElementById("manualForm"),
  manualName: document.getElementById("manualName"),
  manualEmail: document.getElementById("manualEmail"),
  manualCpf: document.getElementById("manualCpf"),
  manualPhone: document.getElementById("manualPhone"),
  manualBirthDate: document.getElementById("manualBirthDate"),
  manualGender: document.getElementById("manualGender"),
  manualAddress: document.getElementById("manualAddress"),
  manualStepper: document.getElementById("manualStepper"),
  manualStepPersonal: document.getElementById("manualStepPersonal"),
  manualStepProfile: document.getElementById("manualStepProfile"),
  manualStepReview: document.getElementById("manualStepReview"),
  manualProfileChoices: document.getElementById("manualProfileChoices"),
  manualReview: document.getElementById("manualReview"),
  manualBack: document.getElementById("manualBack"),
  manualNext: document.getElementById("manualNext"),
  manualSave: document.getElementById("manualSave"),
  importSelectionTable: document.getElementById("importSelectionTable"),
  candidateDetails: document.getElementById("candidateDetails"),
  goDetails: document.getElementById("goDetails"),
  goConfirm: document.getElementById("goConfirm"),
  finishImport: document.getElementById("finishImport"),
  finishClose: document.getElementById("finishClose"),
  selectAllButton: document.getElementById("selectAllButton"),
  confirmText: document.getElementById("confirmText"),
  confirmImportedTable: document.getElementById("confirmImportedTable"),
  successText: document.getElementById("successText"),
  successImportedTable: document.getElementById("successImportedTable"),
  stepper: document.getElementById("importStepper"),
  listView: document.getElementById("listView"),
  kanbanView: document.getElementById("kanbanView")
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(function (part) { return part.charAt(0); })
    .join("")
    .toUpperCase() || "CD";
}

function profileTags(profile) {
  return '<div class="sl-profile-tags">' + profile.map(function (item) {
    var initial = profileInitial(item);
    return '<span class="sl-profile-badge sl-profile-' + initial.toLowerCase() + '" data-profile="' + escapeHtml(item) + '" title="' + escapeHtml(item) + '" aria-label="' + escapeHtml(item) + '">' + initial + "</span>";
  }).join("") + "</div>";
}

function profileInitial(profile) {
  return String(profile || "?").trim().charAt(0).toUpperCase() || "?";
}

function candidateHref(candidate) {
  return "detalhe-candidato.html?candidato=" + encodeURIComponent(window.SLCandidatos.remember(candidate));
}

function renderCandidateTable() {
  els.candidateTable.innerHTML = existingCandidates.map(function (candidate) {
    return [
      "<tr>",
      '<td><a class="sl-candidate-name sl-candidate-link" href="' + candidateHref(candidate) + '"><span class="sl-avatar-sm">' + initials(candidate.name) + "</span>" + escapeHtml(candidate.name) + "</a></td>",
      "<td>" + escapeHtml(candidate.email) + "</td>",
      "<td>" + escapeHtml(candidate.cpf || "-") + "</td>",
      "<td>" + profileTags(candidate.profile || []) + "</td>",
      "<td>" + escapeHtml(candidate.workflow || "-") + "</td>",
      "<td>" + escapeHtml(candidate.activity || "-") + "</td>",
      '<td><span class="sl-status-pill ' + (candidate.status === "Solicitação iniciada" ? "sl-status-success" : "sl-status-neutral") + '">' + escapeHtml(candidate.status) + "</span></td>",
      "<td>" + escapeHtml(candidate.sla || "-") + "</td>",
      "</tr>"
    ].join("");
  }).join("");
  renderKanban();
}

function renderKanban() {
  var columns = [
    { title: "Triagem RH", match: function (candidate) { return candidate.activity === "Triagem RH" && candidate.status !== "Solicitação iniciada"; } },
    { title: "Avaliação do Gestor", match: function (candidate) { return candidate.activity === "Avaliação do Gestor" && candidate.status !== "Solicitação iniciada"; } },
    { title: "Aguardando início", match: function (candidate) { return candidate.activity === "Aguardando início" && candidate.status !== "Solicitação iniciada"; } },
    { title: "Solicitação iniciada", match: function (candidate) { return candidate.status === "Solicitação iniciada"; } }
  ];

  els.kanbanView.innerHTML = columns.map(function (column) {
    var candidates = existingCandidates.filter(column.match);
    return [
      '<article class="sl-kanban-column">',
      '<div class="sl-kanban-head"><span>' + escapeHtml(column.title) + '</span><span class="sl-kanban-count">' + candidates.length + "</span></div>",
      '<div class="sl-kanban-list">',
      candidates.length ? candidates.map(renderKanbanCard).join("") : '<div class="sl-kanban-empty">Nenhum candidato</div>',
      "</div>",
      "</article>"
    ].join("");
  }).join("");
}

function renderKanbanCard(candidate) {
  return [
    '<a class="sl-kanban-card" href="' + candidateHref(candidate) + '">',
    '<strong>' + escapeHtml(candidate.name) + "</strong>",
    '<small>Solicitação: ' + escapeHtml(candidate.workflow || "-") + "</small>",
    profileTags(candidate.profile || []),
    '<span class="sl-status-pill ' + (candidate.status === "Solicitação iniciada" ? "sl-status-success" : "sl-status-neutral") + '">' + escapeHtml(candidate.status) + "</span>",
    "</a>"
  ].join("");
}

function openImportPanel() {
  els.importPanel.classList.remove("sl-hidden");
  document.body.classList.add("sl-modal-open");
  showStep("upload");
}

function closeImportPanel() {
  els.importPanel.classList.add("sl-hidden");
  els.confirmPanel.classList.add("sl-hidden");
  els.cancelPanel.classList.add("sl-hidden");
  els.loadingPanel.classList.add("sl-hidden");
  els.successPanel.classList.add("sl-hidden");
  els.manualPanel.classList.add("sl-hidden");
  els.manualConfirmPanel.classList.add("sl-hidden");
  document.body.classList.remove("sl-modal-open");
}

function openManualPanel() {
  els.manualPanel.classList.remove("sl-hidden");
  document.body.classList.add("sl-modal-open");
  showManualStep("personal");
  updateManualProfileChoices();
}

function closeManualPanel() {
  els.manualPanel.classList.add("sl-hidden");
  els.manualConfirmPanel.classList.add("sl-hidden");
  document.body.classList.remove("sl-modal-open");
}

function showManualStep(step) {
  manualStep = step;

  var stepMap = {
    personal: 0,
    profile: 1,
    review: 2
  };

  [
    { key: "personal", element: els.manualStepPersonal },
    { key: "profile", element: els.manualStepProfile },
    { key: "review", element: els.manualStepReview }
  ].forEach(function (item) {
    item.element.classList.toggle("sl-hidden", item.key !== step);
  });

  Array.prototype.forEach.call(els.manualStepper.children, function (item, index) {
    item.classList.toggle("sl-step-active", index === stepMap[step]);
    item.classList.toggle("sl-step-done", index < stepMap[step]);
  });

  els.manualBack.classList.toggle("sl-hidden", step === "personal");
  els.manualNext.classList.toggle("sl-hidden", step === "review");
  els.manualSave.classList.toggle("sl-hidden", step !== "review");
}

function showStep(step) {
  ["Upload", "Selection", "Details"].forEach(function (name) {
    document.getElementById("step" + name).classList.add("sl-hidden");
  });

  var stepMap = {
    upload: 0,
    selection: 1,
    details: 2
  };

  document.getElementById("step" + step.charAt(0).toUpperCase() + step.slice(1)).classList.remove("sl-hidden");
  els.stepper.classList.remove("sl-hidden");

  Array.prototype.forEach.call(els.stepper.children, function (item, index) {
    item.classList.toggle("sl-step-active", index === stepMap[step]);
  });
}

function parseCsv(text) {
  var lines = text.split(/\r?\n/).filter(function (line) { return line.trim(); });
  if (lines.length < 2) return [];

  var headers = splitCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map(function (line, index) {
    var values = splitCsvLine(line);
    var row = {};
    headers.forEach(function (header, i) {
      row[header] = values[i] || "";
    });

    return completeCandidate({
      id: "csv-" + index,
      name: row.nome || row.candidato || row.fullname || row.name,
      email: row.email || row.mainemail,
      cpf: row.cpf || row.idnumber,
      phone: row.telefone || row.phone || row.mobile,
      profile: parseProfile(row.perfil || row.profile),
      origin: "CSV Sólides"
    }, index);
  }).filter(function (candidate) {
    return candidate.name || candidate.email;
  });
}

function splitCsvLine(line) {
  var result = [];
  var current = "";
  var insideQuotes = false;

  for (var i = 0; i < line.length; i++) {
    var char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if ((char === "," || char === ";") && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function normalizeHeader(header) {
  return String(header || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseProfile(value) {
  if (!value) return ["Planejador", "Executor"];
  return String(value).split(/[|,;/]/).map(function (item) {
    return item.trim();
  }).filter(Boolean);
}

function completeCandidate(candidate, index) {
  var fallback = mockImportCandidates[index % mockImportCandidates.length];
  return {
    id: candidate.id || fallback.id,
    name: candidate.name || fallback.name,
    email: candidate.email || fallback.email,
    cpf: formatCpf(candidate.cpf || fallback.cpf),
    phone: candidate.phone || fallback.phone,
    profile: candidate.profile && candidate.profile.length ? candidate.profile : fallback.profile,
    birthDate: candidate.birthDate || fallback.birthDate,
    gender: candidate.gender || fallback.gender,
    address: candidate.address || fallback.address,
    origin: candidate.origin || fallback.origin,
    salary: candidate.salary || fallback.salary
  };
}

function formatCpf(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length !== 11) return value || "";
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function loadFile(file) {
  openImportPanel();

  var isCsv = /\.csv$/i.test(file.name);
  if (!isCsv) {
    importedCandidates = mockImportCandidates.slice();
    selectedIds = importedCandidates.map(function (candidate) { return candidate.id; });
    renderSelection();
    showStep("selection");
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    var parsed = parseCsv(reader.result || "");
    importedCandidates = parsed.length ? parsed : mockImportCandidates.slice();
    selectedIds = importedCandidates.map(function (candidate) { return candidate.id; });
    renderSelection();
    showStep("selection");
  };
  reader.readAsText(file);
}

function renderSelection() {
  els.importSelectionTable.innerHTML = importedCandidates.map(function (candidate) {
    return [
      "<tr>",
      '<td><input type="checkbox" data-candidate-id="' + escapeHtml(candidate.id) + '" ' + (selectedIds.indexOf(candidate.id) >= 0 ? "checked" : "") + " /></td>",
      '<td><strong class="sl-modal-candidate-name">' + escapeHtml(candidate.name) + "</strong></td>",
      "<td>" + escapeHtml(candidate.email) + "</td>",
      "<td>" + escapeHtml(candidate.phone || "-") + "</td>",
      "<td>" + escapeHtml(candidate.origin || "Sólides") + "</td>",
      "<td>" + profileTags(candidate.profile || []) + "</td>",
      "</tr>"
    ].join("");
  }).join("");

  els.importSelectionTable.querySelectorAll("input[type='checkbox']").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      var id = checkbox.getAttribute("data-candidate-id");
      selectedIds = checkbox.checked
        ? selectedIds.concat([id]).filter(unique)
        : selectedIds.filter(function (item) { return item !== id; });
      updateSelectAllButton();
    });
  });
  updateSelectAllButton();
}

function unique(value, index, array) {
  return array.indexOf(value) === index;
}

function selectedCandidates() {
  return importedCandidates.filter(function (candidate) {
    return selectedIds.indexOf(candidate.id) >= 0;
  });
}

function renderDetails() {
  var candidates = selectedCandidates();
  els.candidateDetails.innerHTML = [
    '<div class="sl-table-wrap sl-detail-table-wrap">',
    '<table class="sl-table sl-detail-table">',
    "<thead>",
    "<tr>",
    "<th>Candidato</th>",
    "<th>CPF</th>",
    "<th>Nascimento</th>",
    "<th>Gênero</th>",
    "<th>E-mail</th>",
    "<th>Telefone</th>",
    "<th>Endereço</th>",
    "<th>Perfil</th>",
    "</tr>",
    "</thead>",
    "<tbody>",
    candidates.map(function (candidate) {
      return [
        "<tr>",
        '<td><strong class="sl-modal-candidate-name">' + escapeHtml(candidate.name) + "</strong></td>",
        "<td>" + escapeHtml(candidate.cpf || "-") + "</td>",
        "<td>" + escapeHtml(candidate.birthDate || "-") + "</td>",
        "<td>" + escapeHtml(candidate.gender || "-") + "</td>",
        "<td>" + escapeHtml(candidate.email || "-") + "</td>",
        "<td>" + escapeHtml(candidate.phone || "-") + "</td>",
        "<td>" + escapeHtml(candidate.address || "-") + "</td>",
        "<td>" + profileTags(candidate.profile || []) + "</td>",
        "</tr>"
      ].join("");
    }).join(""),
    "</tbody>",
    "</table>",
    "</div>"
  ].join("");
}

function confirmImport() {
  var candidates = selectedCandidates();
  els.confirmPanel.classList.add("sl-hidden");
  els.importPanel.classList.add("sl-hidden");
  els.loadingTitle.textContent = "Importando candidatos";
  els.loadingText.textContent = "Estamos criando os registros e iniciando as solicitações individuais no Fluig.";
  els.loadingPanel.classList.remove("sl-hidden");

  window.setTimeout(function () {
    finishImport(candidates);
  }, 2000);
}

function finishImport(candidates) {
  var importedNow = [];
  candidates.forEach(function (candidate) {
    var exists = existingCandidates.some(function (item) {
      return item.email === candidate.email;
    });
    if (exists) return;

    workflowSeed += 1;
    var importedCandidate = {
      name: candidate.name,
      email: candidate.email,
      cpf: candidate.cpf,
      phone: candidate.phone,
      profile: candidate.profile,
      workflow: String(workflowSeed),
      activity: "Triagem RH",
      status: "Solicitação iniciada",
      sla: "No prazo",
      birthDate: candidate.birthDate,
      gender: candidate.gender,
      address: candidate.address,
      origin: candidate.origin,
      salary: candidate.salary,
      registeredAt: new Date().toISOString()
    };

    existingCandidates.push(importedCandidate);
    importedNow.push(importedCandidate);
  });

  renderCandidateTable();
  els.successTitle.textContent = "Importação concluída";
  els.successText.textContent = importedNow.length + " candidato(s) importado(s) e solicitação(ões) individual(is) iniciada(s) com sucesso.";
  renderSuccessTable(importedNow);
  els.loadingPanel.classList.add("sl-hidden");
  els.successPanel.classList.remove("sl-hidden");
}

function renderSuccessTable(candidates) {
  els.successImportedTable.innerHTML = candidates.map(function (candidate) {
    return [
      "<tr>",
      '<td><strong class="sl-modal-candidate-name">' + escapeHtml(candidate.name) + "</strong></td>",
      "<td>" + escapeHtml(candidate.cpf || "-") + "</td>",
      "<td>" + profileTags(candidate.profile || []) + "</td>",
      "<td>" + escapeHtml(candidate.workflow || "-") + "</td>",
      '<td><span class="sl-status-pill ' + (candidate.status === "Solicitação iniciada" ? "sl-status-success" : "sl-status-neutral") + '">' + escapeHtml(candidate.status) + "</span></td>",
      "</tr>"
    ].join("");
  }).join("");
}

function renderConfirmTable(candidates) {
  els.confirmImportedTable.innerHTML = candidates.map(function (candidate) {
    return [
      "<tr>",
      '<td><strong class="sl-modal-candidate-name">' + escapeHtml(candidate.name) + "</strong></td>",
      "<td>" + escapeHtml(candidate.cpf || "-") + "</td>",
      "<td>" + profileTags(candidate.profile || []) + "</td>",
      "<td>" + escapeHtml(candidate.origin || "Sólides") + "</td>",
      '<td><span class="sl-status-pill sl-status-neutral">A importar</span></td>',
      "</tr>"
    ].join("");
  }).join("");
}

function selectedManualProfiles() {
  return Array.prototype.slice.call(els.manualProfileChoices.querySelectorAll("input:checked")).map(function (input) {
    return input.value;
  });
}

function updateManualProfileChoices() {
  Array.prototype.forEach.call(els.manualProfileChoices.querySelectorAll(".sl-profile-choice"), function (choice) {
    var input = choice.querySelector("input");
    choice.classList.toggle("sl-profile-choice-active", Boolean(input && input.checked));
  });
}

function manualCandidateData() {
  return {
    name: els.manualName.value.trim(),
    email: els.manualEmail.value.trim(),
    cpf: formatCpf(els.manualCpf.value),
    phone: els.manualPhone.value.trim(),
    profile: selectedManualProfiles(),
    birthDate: els.manualBirthDate.value.trim(),
    gender: els.manualGender.value,
    address: els.manualAddress.value.trim(),
    origin: "Cadastro manual",
    salary: "R$ 2.450,00"
  };
}

function validateManualStep(step) {
  var fields = step === "personal"
    ? [els.manualName, els.manualEmail, els.manualCpf, els.manualPhone, els.manualBirthDate, els.manualGender, els.manualAddress]
    : [];

  var invalid = fields.filter(function (field) {
    return !String(field.value || "").trim();
  });

  if (step === "profile" && !selectedManualProfiles().length) {
    window.alert("Selecione ao menos um perfil para o candidato.");
    return false;
  }

  if (invalid.length) {
    invalid[0].focus();
    return false;
  }

  return true;
}

function renderManualReview() {
  var candidate = manualCandidateData();
  els.manualReview.innerHTML = [
    '<div class="sl-table-wrap">',
    '<table class="sl-table sl-manual-review-table">',
    "<thead><tr><th>Candidato</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Perfil</th></tr></thead>",
    "<tbody><tr>",
    '<td><strong class="sl-modal-candidate-name">' + escapeHtml(candidate.name) + "</strong></td>",
    "<td>" + escapeHtml(candidate.cpf || "-") + "</td>",
    "<td>" + escapeHtml(candidate.email || "-") + "</td>",
    "<td>" + escapeHtml(candidate.phone || "-") + "</td>",
    "<td>" + profileTags(candidate.profile || []) + "</td>",
    "</tr></tbody>",
    "</table>",
    "</div>",
    '<div class="sl-manual-review-grid">',
    '<span><small>Data de nascimento</small><strong>' + escapeHtml(candidate.birthDate || "-") + "</strong></span>",
    '<span><small>Gênero</small><strong>' + escapeHtml(candidate.gender || "-") + "</strong></span>",
    '<span><small>Endereço</small><strong>' + escapeHtml(candidate.address || "-") + "</strong></span>",
    "</div>"
  ].join("");
}

function renderManualConfirmTable(candidate) {
  els.manualConfirmTable.innerHTML = [
    "<tr>",
    '<td><strong class="sl-modal-candidate-name">' + escapeHtml(candidate.name) + "</strong></td>",
    "<td>" + escapeHtml(candidate.cpf || "-") + "</td>",
    "<td>" + escapeHtml(candidate.email || "-") + "</td>",
    "<td>" + escapeHtml(candidate.phone || "-") + "</td>",
    "<td>" + profileTags(candidate.profile || []) + "</td>",
    '<td><span class="sl-status-pill sl-status-neutral">A cadastrar</span></td>',
    "</tr>"
  ].join("");
}

function advanceManualStep() {
  if (manualStep === "personal") {
    if (!validateManualStep("personal")) return;
    showManualStep("profile");
    return;
  }

  if (manualStep === "profile") {
    if (!validateManualStep("profile")) return;
    renderManualReview();
    showManualStep("review");
  }
}

function backManualStep() {
  if (manualStep === "review") {
    showManualStep("profile");
    return;
  }

  if (manualStep === "profile") {
    showManualStep("personal");
  }
}

function showManualConfirm(event) {
  event.preventDefault();
  if (!validateManualStep("personal")) {
    showManualStep("personal");
    return;
  }
  if (!validateManualStep("profile")) return;

  var candidate = manualCandidateData();
  renderManualConfirmTable(candidate);
  els.manualConfirmPanel.classList.remove("sl-hidden");
}

function confirmManualCandidate() {
  var candidate = manualCandidateData();
  els.manualConfirmPanel.classList.add("sl-hidden");
  els.manualPanel.classList.add("sl-hidden");
  els.loadingTitle.textContent = "Cadastrando candidato";
  els.loadingText.textContent = "Estamos criando o registro e iniciando a solicitação individual no Fluig.";
  els.loadingPanel.classList.remove("sl-hidden");

  window.setTimeout(function () {
    finishManualCandidate(candidate);
  }, 2000);
}

function finishManualCandidate(candidate) {
  workflowSeed += 1;

  var manualCandidate = {
    name: candidate.name,
    email: candidate.email,
    cpf: candidate.cpf,
    phone: candidate.phone,
    profile: candidate.profile,
    workflow: String(workflowSeed),
    activity: "Triagem RH",
    status: "Solicitação iniciada",
    sla: "No prazo",
    birthDate: candidate.birthDate,
    gender: candidate.gender,
    address: candidate.address,
    origin: candidate.origin,
    salary: candidate.salary,
    registeredAt: new Date().toISOString()
  };

  existingCandidates.push(manualCandidate);

  renderCandidateTable();
  els.successTitle.textContent = "Cadastro concluído";
  els.successText.textContent = "1 candidato cadastrado e solicitação individual iniciada com sucesso.";
  renderSuccessTable([manualCandidate]);
  els.loadingPanel.classList.add("sl-hidden");
  els.successPanel.classList.remove("sl-hidden");
}

function updateSelectAllButton() {
  var allSelected = importedCandidates.length && selectedIds.length === importedCandidates.length;
  els.selectAllButton.textContent = allSelected ? "Limpar seleção" : "Selecionar todos";
}

function ensureSelected() {
  if (!selectedCandidates().length) {
    window.alert("Selecione ao menos um candidato para avançar.");
    return false;
  }
  return true;
}

els.importButton.addEventListener("click", function () {
  openImportPanel();
});

els.manualButton.addEventListener("click", openManualPanel);
els.manualClose.addEventListener("click", closeManualPanel);
els.manualCancel.addEventListener("click", closeManualPanel);
els.manualBack.addEventListener("click", backManualStep);
els.manualNext.addEventListener("click", advanceManualStep);
els.manualForm.addEventListener("submit", showManualConfirm);
els.manualConfirmBack.addEventListener("click", function () {
  els.manualConfirmPanel.classList.add("sl-hidden");
});
els.manualConfirmFinish.addEventListener("click", confirmManualCandidate);

els.manualProfileChoices.querySelectorAll("input[type='checkbox']").forEach(function (input) {
  input.addEventListener("change", updateManualProfileChoices);
});

els.selectFileButton.addEventListener("click", function () {
  els.candidateFile.click();
});

els.candidateFile.addEventListener("change", function () {
  if (els.candidateFile.files && els.candidateFile.files[0]) {
    loadFile(els.candidateFile.files[0]);
  }
});

els.closeImport.addEventListener("click", closeImportPanel);
els.cancelConfirm.addEventListener("click", function () {
  els.confirmPanel.classList.add("sl-hidden");
});
els.finishClose.addEventListener("click", closeImportPanel);
els.backCancel.addEventListener("click", function () {
  els.cancelPanel.classList.add("sl-hidden");
});
els.confirmCancel.addEventListener("click", closeImportPanel);

document.querySelectorAll(".js-cancel-import").forEach(function (button) {
  button.addEventListener("click", function () {
    els.cancelPanel.classList.remove("sl-hidden");
  });
});

els.selectAllButton.addEventListener("click", function () {
  var allSelected = importedCandidates.length && selectedIds.length === importedCandidates.length;
  selectedIds = allSelected ? [] : importedCandidates.map(function (candidate) { return candidate.id; });
  renderSelection();
});

els.goDetails.addEventListener("click", function () {
  if (!ensureSelected()) return;
  renderDetails();
  showStep("details");
});

els.goConfirm.addEventListener("click", function () {
  if (!ensureSelected()) return;
  els.confirmText.textContent = selectedCandidates().length + " candidato(s) serão vinculados à vaga Operador de Máquinas.";
  renderConfirmTable(selectedCandidates());
  els.confirmPanel.classList.remove("sl-hidden");
});

els.finishImport.addEventListener("click", confirmImport);

document.querySelectorAll("[data-step-back]").forEach(function (button) {
  button.addEventListener("click", function () {
    showStep(button.getAttribute("data-step-back"));
  });
});

document.querySelectorAll("[data-view]").forEach(function (button) {
  button.addEventListener("click", function () {
    var view = button.getAttribute("data-view");
    document.querySelectorAll("[data-view]").forEach(function (item) {
      item.classList.toggle("sl-tab-active", item === button);
    });
    els.listView.classList.toggle("sl-hidden", view !== "list");
    els.kanbanView.classList.toggle("sl-hidden", view !== "kanban");
  });
});

els.importPanel.addEventListener("click", function (event) {
  if (event.target === els.importPanel) closeImportPanel();
});

els.confirmPanel.addEventListener("click", function (event) {
  if (event.target === els.confirmPanel) {
    els.confirmPanel.classList.add("sl-hidden");
  }
});

els.cancelPanel.addEventListener("click", function (event) {
  if (event.target === els.cancelPanel) {
    els.cancelPanel.classList.add("sl-hidden");
  }
});

els.manualPanel.addEventListener("click", function (event) {
  if (event.target === els.manualPanel) {
    closeManualPanel();
  }
});

els.manualConfirmPanel.addEventListener("click", function (event) {
  if (event.target === els.manualConfirmPanel) {
    els.manualConfirmPanel.classList.add("sl-hidden");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !els.cancelPanel.classList.contains("sl-hidden")) {
    els.cancelPanel.classList.add("sl-hidden");
    return;
  }
  if (event.key === "Escape" && !els.confirmPanel.classList.contains("sl-hidden")) {
    els.confirmPanel.classList.add("sl-hidden");
    return;
  }
  if (event.key === "Escape" && !els.manualConfirmPanel.classList.contains("sl-hidden")) {
    els.manualConfirmPanel.classList.add("sl-hidden");
    return;
  }
  if (event.key === "Escape" && !els.manualPanel.classList.contains("sl-hidden")) {
    closeManualPanel();
    return;
  }
  if (event.key === "Escape" && !els.importPanel.classList.contains("sl-hidden")) {
    closeImportPanel();
  }
});

renderCandidateTable();

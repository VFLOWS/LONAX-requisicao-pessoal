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
  successPanel: document.getElementById("successPanel"),
  importSelectionTable: document.getElementById("importSelectionTable"),
  candidateDetails: document.getElementById("candidateDetails"),
  goDetails: document.getElementById("goDetails"),
  goConfirm: document.getElementById("goConfirm"),
  finishImport: document.getElementById("finishImport"),
  finishClose: document.getElementById("finishClose"),
  selectAllButton: document.getElementById("selectAllButton"),
  confirmText: document.getElementById("confirmText"),
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

function renderCandidateTable() {
  els.candidateTable.innerHTML = existingCandidates.map(function (candidate) {
    return [
      "<tr>",
      '<td><div class="sl-candidate-name"><span class="sl-avatar-sm">' + initials(candidate.name) + "</span>" + escapeHtml(candidate.name) + "</div></td>",
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
    { title: "Triagem RH", match: function (candidate) { return candidate.activity === "Triagem RH"; } },
    { title: "Avaliação do Gestor", match: function (candidate) { return candidate.activity === "Avaliação do Gestor"; } },
    { title: "Aguardando início", match: function (candidate) { return candidate.activity === "Aguardando início"; } },
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
    '<div class="sl-kanban-card">',
    '<strong>' + escapeHtml(candidate.name) + "</strong>",
    '<small>Solicitação: ' + escapeHtml(candidate.workflow || "-") + "</small>",
    profileTags(candidate.profile || []),
    '<span class="sl-status-pill ' + (candidate.status === "Solicitação iniciada" ? "sl-status-success" : "sl-status-neutral") + '">' + escapeHtml(candidate.status) + "</span>",
    "</div>"
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
  document.body.classList.remove("sl-modal-open");
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
      salary: candidate.salary
    };

    existingCandidates.push(importedCandidate);
    importedNow.push(importedCandidate);
  });

  renderCandidateTable();
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

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !els.cancelPanel.classList.contains("sl-hidden")) {
    els.cancelPanel.classList.add("sl-hidden");
    return;
  }
  if (event.key === "Escape" && !els.confirmPanel.classList.contains("sl-hidden")) {
    els.confirmPanel.classList.add("sl-hidden");
    return;
  }
  if (event.key === "Escape" && !els.importPanel.classList.contains("sl-hidden")) {
    closeImportPanel();
  }
});

renderCandidateTable();

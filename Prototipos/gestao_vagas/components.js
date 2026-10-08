(function (global) {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function attrs(attributes) {
    return Object.keys(attributes || {}).map(function (key) {
      var value = attributes[key];
      if (value === false || value === null || typeof value === "undefined") return "";
      if (value === true) return " " + key;
      return " " + key + '="' + escapeHtml(value) + '"';
    }).join("");
  }

  function sectionHead(config) {
    var iconClass = config.iconClass ? " " + config.iconClass : "";
    return [
      '<div class="sl-page-section-head">',
      "<div>",
      '<span class="sl-section-icon' + iconClass + '"><i class="fa-solid ' + escapeHtml(config.icon || "fa-table-list") + '"></i></span>',
      "<div>",
      "<h2>" + escapeHtml(config.title) + "</h2>",
      config.description ? "<p>" + escapeHtml(config.description) + "</p>" : "",
      "</div>",
      "</div>",
      config.actionsHtml ? '<div class="sl-panel-actions">' + config.actionsHtml + "</div>" : "",
      "</div>"
    ].join("");
  }

  function pageSection(config) {
    return [
      '<section class="sl-page-section' + (config.className ? " " + escapeHtml(config.className) : "") + '"' + attrs(config.attrs) + ">",
      sectionHead(config),
      '<div class="sl-page-section-body">',
      config.bodyHtml || "",
      "</div>",
      "</section>"
    ].join("");
  }

  function button(config) {
    return [
      '<button class="' + escapeHtml(config.className || "sl-primary-button") + '" type="' + escapeHtml(config.type || "button") + '"' + attrs(config.attrs) + ">",
      config.icon ? '<i class="fa-solid ' + escapeHtml(config.icon) + '" aria-hidden="true"></i>' : "",
      escapeHtml(config.label || ""),
      "</button>"
    ].join("");
  }

  function tabs(config) {
    return [
      '<div class="sl-tabs" aria-label="' + escapeHtml(config.label || "Alternar visualizacao") + '">',
      (config.items || []).map(function (item) {
        return [
          '<button class="sl-tab' + (item.active ? " sl-tab-active" : "") + '" type="button"' + attrs(item.attrs) + ">",
          item.icon ? '<i class="fa-solid ' + escapeHtml(item.icon) + '"></i>' : "",
          escapeHtml(item.label),
          "</button>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function table(config) {
    return [
      '<div class="sl-table-card' + (config.hidden ? " sl-hidden" : "") + '"' + attrs({ id: config.id }) + ">",
      '<div class="sl-table-wrap">',
      '<table class="sl-table' + (config.className ? " " + escapeHtml(config.className) : "") + '">',
      "<thead><tr>",
      (config.columns || []).map(function (column) {
        return "<th>" + escapeHtml(column) + "</th>";
      }).join(""),
      "</tr></thead>",
      '<tbody' + attrs({ id: config.bodyId }) + ">",
      (config.rows || []).map(function (row) {
        return "<tr>" + row.map(function (cell) {
          return "<td>" + cell + "</td>";
        }).join("") + "</tr>";
      }).join(""),
      "</tbody>",
      "</table>",
      "</div>",
      config.footerHtml || "",
      "</div>"
    ].join("");
  }

  function kpiGrid(items) {
    return [
      '<div class="sl-vagas-kpis">',
      items.map(function (item) {
        var className = item.className || item.iconClass || "";
        return [
          '<article class="sl-vagas-kpi ' + escapeHtml(className) + '">',
          '<span><i class="fa-solid ' + escapeHtml(item.icon) + '"></i></span>',
          "<small>" + escapeHtml(item.label) + "</small>",
          "<strong>" + escapeHtml(item.value) + "</strong>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function filters(config) {
    return [
      '<div class="sl-vagas-toolbar" aria-label="' + escapeHtml(config.label || "Filtros") + '">',
      (config.fields || []).map(function (field) {
        if (field.type === "search") {
          return [
            '<label class="sl-vagas-search">',
            "<span>" + escapeHtml(field.label) + "</span>",
            "<div>",
            '<i class="fa-solid fa-magnifying-glass"></i>',
            '<input type="text" placeholder="' + escapeHtml(field.placeholder || "") + '" />',
            "</div>",
            "</label>"
          ].join("");
        }

        if (field.type === "select") {
          return [
            "<label>",
            escapeHtml(field.label),
            "<select>",
            (field.options || []).map(function (option) {
              return "<option>" + escapeHtml(option) + "</option>";
            }).join(""),
            "</select>",
            "</label>"
          ].join("");
        }

        return [
          "<label>",
          escapeHtml(field.label),
          '<input type="text" placeholder="' + escapeHtml(field.placeholder || "") + '" />',
          "</label>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function summaryMeta(items) {
    return [
      '<div class="sl-summary-meta">',
      (items || []).map(function (item) {
        return [
          "<span>",
          '<i class="fa-solid ' + escapeHtml(item.icon) + '"></i>',
          escapeHtml(item.text),
          "</span>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function personPills(items) {
    return [
      '<div class="sl-responsibles">',
      "<h3>Responsáveis:</h3>",
      "<div>",
      items.map(function (person) {
        return '<span class="sl-person-pill"><strong>' + escapeHtml(person.initials) + "</strong> " + escapeHtml(person.name) + "</span>";
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function jobSummary(job) {
    return [
      '<div class="sl-record-summary">',
      '<div class="sl-record-title">',
      "<div>",
      "<h2>" + escapeHtml(job.title) + "</h2>",
      "<p>" + escapeHtml(job.period) + "</p>",
      "</div>",
      '<div class="sl-card-actions"><span class="sl-status-pill ' + escapeHtml(job.statusClass || "sl-status-danger") + '">' + escapeHtml(job.status) + "</span></div>",
      "</div>",
      summaryMeta(job.meta || []),
      kpiGrid(job.metrics || []),
      personPills(job.responsibles || []),
      job.linkHref ? '<p class="sl-job-link">' : '',
      job.linkHref ? '<span><i class="fa-solid fa-arrow-up-right-from-square"></i></span><strong>Link da vaga</strong><a href="' + escapeHtml(job.linkHref) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(job.linkText) + '</a></p>' : '',
      "</div>"
    ].join("");
  }

  function behaviorProfileCards(profiles) {
    var definitions = {
      planejador: { initial: "P", description: "Organização, previsibilidade e método." },
      executor: { initial: "E", description: "Agilidade, foco em entrega e ação." },
      analista: { initial: "A", description: "Critério, precisão e atenção aos detalhes." },
      comunicador: { initial: "C", description: "Relacionamento, influência e comunicação." }
    };
    return '<div class="sl-behavior-profiles">' + profiles.map(function (name) {
      var key = String(name || "").trim().toLocaleLowerCase("pt-BR");
      var known = Object.prototype.hasOwnProperty.call(definitions, key);
      var definition = known ? definitions[key] : { initial: key.charAt(0).toUpperCase() || "?", description: "Descrição não disponível." };
      return '<article class="sl-behavior-profile sl-behavior-profile-' + (known ? definition.initial.toLowerCase() : "unknown") + '"><span class="sl-behavior-profile-avatar" aria-hidden="true">' + escapeHtml(definition.initial) + '</span><div><h3>' + escapeHtml(name) + '</h3><p>' + escapeHtml(definition.description) + '</p></div></article>';
    }).join("") + '</div>';
  }

  function selectionRoute(steps) {
    if (!steps.length) return '<p class="sl-selection-empty">Nenhuma etapa selecionada.</p>';
    return '<ol class="sl-selection-route">' + steps.map(function (step, index) {
      return '<li><span class="sl-selection-route-icon"><i class="fa-solid ' + escapeHtml(step.icon) + '" aria-hidden="true"></i></span><div><small>Etapa ' + (index + 1) + '</small><strong>' + escapeHtml(step.title) + '</strong></div></li>';
    }).join("") + '</ol><div class="sl-selection-outcomes"><span>Resultado da seleção</span><div><span class="sl-status-pill sl-status-success">Aprovado</span><span class="sl-status-pill sl-status-danger">Reprovado</span></div></div>';
  }

  function formField(config) {
    var attributes = Object.assign({}, config.attrs || {}, {
      id: config.name,
      name: config.name,
      required: !!config.required,
      readonly: !!config.readonly
    });
    var value = config.value == null ? "" : config.value;
    var control;
    if (config.type === "textarea") {
      control = '<textarea' + attrs(attributes) + '>' + escapeHtml(value) + '</textarea>';
    } else if (config.type === "select") {
      control = '<select' + attrs(attributes) + '>' + (config.options || []).map(function (option) {
        return '<option' + attrs({ value: option.value, selected: String(option.value) === String(value) }) + '>' + escapeHtml(option.label) + '</option>';
      }).join("") + '</select>';
    } else {
      control = '<input' + attrs(Object.assign(attributes, { type: config.type || "text", value: value })) + ' />';
    }
    return '<label class="sl-form-field' + (config.wide ? ' sl-form-field-wide' : '') + '"><span>' + escapeHtml(config.label) + (config.required ? ' <em>*</em>' : '') + '</span>' + control + '</label>';
  }

  function dialog(config) {
    return '<section class="sl-confirm-backdrop sl-hidden"' + attrs({ id: config.id }) + '><div class="sl-confirm-panel sl-vacancy-dialog' + (config.className ? ' ' + escapeHtml(config.className) : '') + '" role="dialog" aria-modal="true"' + attrs({ "aria-labelledby": config.id + "Title" }) + '><div class="sl-confirm-intro"><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid ' + escapeHtml(config.icon || "fa-circle-check") + '"></i></span><div><h3' + attrs({ id: config.id + "Title" }) + '>' + escapeHtml(config.title) + '</h3><p>' + escapeHtml(config.description || "") + '</p></div></div><div class="sl-vacancy-dialog-body">' + (config.bodyHtml || "") + '</div><div class="sl-confirm-actions">' + (config.actionsHtml || "") + '</div></div></section>';
  }

  function infoGrid(items, columns) {
    return '<dl class="sl-record-fields sl-record-fields-' + (columns || 3) + '">' + (items || []).map(function (item) {
      return '<div' + (item.wide ? ' class="sl-info-wide"' : '') + '><dt>' + escapeHtml(item.label) + '</dt><dd>' + escapeHtml(item.value) + '</dd></div>';
    }).join("") + '</dl>';
  }

  function infoSection(config) {
    return '<fieldset class="sl-record-fieldset sl-record-tone-' + escapeHtml(config.tone || "blue") + '"><legend><i class="fa-solid ' + escapeHtml(config.icon || "fa-circle-info") + '"></i> ' + escapeHtml(config.title) + '</legend>' + (config.bodyHtml || infoGrid(config.items, config.columns)) + '</fieldset>';
  }

  function historyTimeline(events) {
    var dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    return '<div class="sl-record-timeline">' + events.slice().sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }).map(function (event, index) {
      var timestamp = dateFormat.format(new Date(event.date)).replace(",", "");
      return [
        '<article class="sl-record-event">',
        '<span class="sl-record-event-dot"><i class="fa-solid ' + escapeHtml(event.icon || "fa-file-lines") + '"></i></span>',
        '<details class="sl-record-collapse"' + (index === 0 ? ' open' : '') + '>',
        '<summary><div><h3>' + escapeHtml(event.title) + '</h3>',
        '<p><time datetime="' + escapeHtml(event.date) + '">' + escapeHtml(timestamp) + '</time> - ' + escapeHtml(event.responsible) + ' - ' + escapeHtml(event.department) + '</p></div>',
        '<i class="fa-solid fa-chevron-down sl-record-chevron"></i></summary>',
        '<div class="sl-record-event-body">',
        infoSection({ title: "Informações da etapa", icon: event.icon, tone: event.tone || "blue", items: (event.items || []).concat([{ label: "Observação", value: event.description, wide: true }]) }),
        '</div></details></article>'
      ].join("");
    }).join("") + '</div>';
  }

  function modalShell() {
    return [
      '<section class="sl-modal-backdrop sl-hidden" id="importPanel" aria-live="polite">',
      '<div class="sl-import-panel" role="dialog" aria-modal="true" aria-labelledby="importTitle">',
      '<div class="sl-panel-head">',
      "<div>",
      '<span class="sl-section-icon sl-section-icon-excel"><i class="fa-solid fa-file-excel"></i></span>',
      "<div>",
      '<h2 id="importTitle">Importação de candidatos</h2>',
      "<p>Carregue a planilha, selecione os candidatos e confirme a criação dos registros na vaga.</p>",
      "</div>",
      "</div>",
      '<button class="sl-icon-button" type="button" id="closeImport" aria-label="Fechar importação"><i class="fa-solid fa-xmark"></i></button>',
      "</div>",
      '<ol class="sl-stepper" id="importStepper">',
      '<li class="sl-step-active"><span class="sl-step-icon"><i class="fa-solid fa-file-arrow-up"></i></span><span>Arquivo</span></li>',
      '<li><span class="sl-step-icon"><i class="fa-solid fa-list-check"></i></span><span>Seleção</span></li>',
      '<li><span class="sl-step-icon"><i class="fa-solid fa-address-card"></i></span><span>Detalhes</span></li>',
      "</ol>",
      '<div class="sl-step-content" id="stepUpload">',
      '<div class="sl-upload-box" id="dropZone">',
      '<i class="fa-solid fa-cloud-arrow-up"></i>',
      "<strong>Importe a planilha exportada da Sólides</strong>",
      "<span>Selecione um arquivo CSV, XLS ou XLSX para carregar os candidatos escolhidos pelo RH.</span>",
      button({ className: "sl-primary-button", label: "Selecionar arquivo", attrs: { id: "selectFileButton" } }),
      "</div>",
      '<div class="sl-step-actions">' + button({ className: "sl-secondary-button js-cancel-import", label: "Cancelar" }) + "</div>",
      "</div>",
      '<div class="sl-step-content sl-hidden" id="stepSelection">',
      '<div class="sl-step-toolbar"><div><h3>Seleção de candidatos da planilha</h3><p>Marque os candidatos que serão importados e vinculados à vaga.</p></div>',
      button({ className: "sl-secondary-button sl-select-toggle", label: "Selecionar todos", attrs: { id: "selectAllButton" } }),
      "</div>",
      '<div class="sl-table-wrap">',
      '<table class="sl-table sl-selection-table"><thead><tr><th></th><th>Candidato</th><th>E-mail</th><th>Telefone</th><th>Origem</th><th>Perfil</th></tr></thead><tbody id="importSelectionTable"></tbody></table>',
      "</div>",
      '<div class="sl-step-actions">',
      button({ className: "sl-secondary-button js-cancel-import", label: "Cancelar" }),
      button({ className: "sl-secondary-button", label: "Voltar", attrs: { "data-step-back": "upload" } }),
      button({ className: "sl-primary-button", label: "Avançar", attrs: { id: "goDetails" } }),
      "</div>",
      "</div>",
      '<div class="sl-step-content sl-hidden" id="stepDetails">',
      '<div class="sl-step-toolbar"><div><h3>Detalhes do Candidato</h3><p>Dados complementares simulados a partir do currículo retornado para conferência.</p></div></div>',
      '<div class="sl-candidate-detail-grid" id="candidateDetails"></div>',
      '<div class="sl-step-actions">',
      button({ className: "sl-secondary-button js-cancel-import", label: "Cancelar" }),
      button({ className: "sl-secondary-button", label: "Voltar", attrs: { "data-step-back": "selection" } }),
      button({ className: "sl-primary-button", label: "Confirmar", attrs: { id: "goConfirm" } }),
      "</div>",
      "</div>",
      "</div>",
      "</section>",
      '<section class="sl-confirm-backdrop sl-hidden" id="confirmPanel" aria-live="polite">',
      '<div class="sl-confirm-panel sl-confirm-panel-wide" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">',
      '<div class="sl-confirm-intro"><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid fa-circle-check"></i></span><div><h3 id="confirmTitle">Confirmar importação</h3><p id="confirmText">Os candidatos selecionados serão vinculados à vaga e poderão ter o processo seletivo iniciado.</p></div></div>',
      '<div class="sl-table-wrap sl-confirm-table-wrap">',
      '<table class="sl-table sl-confirm-import-table"><thead><tr><th>Candidato</th><th>CPF</th><th>Perfil</th><th>Origem</th><th>Status</th></tr></thead><tbody id="confirmImportedTable"></tbody></table>',
      "</div>",
      '<div class="sl-confirm-actions">',
      button({ className: "sl-secondary-button", label: "Voltar", attrs: { id: "cancelConfirm" } }),
      button({ className: "sl-primary-button", label: "Confirmar importação", attrs: { id: "finishImport" } }),
      "</div>",
      "</div>",
      "</section>",
      '<section class="sl-confirm-backdrop sl-hidden" id="manualPanel" aria-live="polite">',
      '<div class="sl-result-panel sl-result-panel-wide" role="dialog" aria-modal="true" aria-labelledby="manualTitle">',
      '<div class="sl-panel-head"><div><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid fa-user-plus"></i></span><div><h2 id="manualTitle">Cadastro manual de candidato</h2><p>Inclua um candidato diretamente na vaga sem importar planilha.</p></div></div>',
      '<button class="sl-icon-button" type="button" id="manualClose" aria-label="Fechar cadastro manual"><i class="fa-solid fa-xmark"></i></button></div>',
      '<ol class="sl-stepper sl-manual-stepper" id="manualStepper">',
      '<li class="sl-step-active"><span class="sl-step-icon"><i class="fa-solid fa-user"></i></span><span>Dados</span></li>',
      '<li><span class="sl-step-icon"><i class="fa-solid fa-chart-simple"></i></span><span>Perfil</span></li>',
      '<li><span class="sl-step-icon"><i class="fa-solid fa-clipboard-check"></i></span><span>Confirmação</span></li>',
      "</ol>",
      '<form class="sl-manual-form" id="manualForm" novalidate>',
      '<div class="sl-manual-step" id="manualStepPersonal">',
      '<div class="sl-step-toolbar"><div><h3>Dados do candidato</h3><p>Preencha as informações básicas para vínculo com a vaga.</p></div></div>',
      '<label>Nome completo<input type="text" id="manualName" value="Bruno Ferreira" required /></label>',
      '<label>E-mail<input type="email" id="manualEmail" value="bruno.ferreira@email.com" required /></label>',
      '<label>CPF<input type="text" id="manualCpf" value="452.771.638-40" required /></label>',
      '<label>Telefone<input type="text" id="manualPhone" value="(31) 98844-1020" required /></label>',
      '<label>Data de nascimento<input type="text" id="manualBirthDate" value="12/05/1997" required /></label>',
      '<label>Gênero<select id="manualGender" required><option>Masculino</option><option>Feminino</option><option>Não informado</option></select></label>',
      '<label>Endereço<input type="text" id="manualAddress" value="Sarzedo/MG" required /></label>',
      "</div>",
      '<div class="sl-manual-step sl-hidden" id="manualStepProfile">',
      '<div class="sl-step-toolbar"><div><h3>Perfil do candidato</h3><p>Selecione um ou mais perfis identificados na triagem.</p></div></div>',
      '<div class="sl-profile-choice-grid" id="manualProfileChoices">',
      '<label class="sl-profile-choice sl-profile-choice-p"><input type="checkbox" value="Planejador" checked /><span>P</span><strong>Planejador</strong><small>Organização, previsibilidade e método.</small></label>',
      '<label class="sl-profile-choice sl-profile-choice-e"><input type="checkbox" value="Executor" checked /><span>E</span><strong>Executor</strong><small>Agilidade, foco em entrega e ação.</small></label>',
      '<label class="sl-profile-choice sl-profile-choice-a"><input type="checkbox" value="Analista" /><span>A</span><strong>Analista</strong><small>Critério, precisão e atenção aos detalhes.</small></label>',
      '<label class="sl-profile-choice sl-profile-choice-c"><input type="checkbox" value="Comunicador" /><span>C</span><strong>Comunicador</strong><small>Relacionamento, influência e comunicação.</small></label>',
      "</div>",
      "</div>",
      '<div class="sl-manual-step sl-hidden" id="manualStepReview">',
      '<div class="sl-step-toolbar"><div><h3>Confirmar cadastro</h3><p>Confira os dados antes de criar o registro do candidato na vaga.</p></div></div>',
      '<div class="sl-manual-review" id="manualReview"></div>',
      "</div>",
      '<div class="sl-confirm-actions sl-manual-actions">',
      button({ className: "sl-secondary-button", label: "Cancelar", attrs: { id: "manualCancel" } }),
      button({ className: "sl-secondary-button sl-hidden", label: "Voltar", attrs: { id: "manualBack" } }),
      button({ className: "sl-primary-button", label: "Avançar", attrs: { id: "manualNext" } }),
      button({ className: "sl-primary-button sl-hidden", label: "Cadastrar candidato", attrs: { id: "manualSave" }, type: "submit" }),
      "</div>",
      "</form>",
      "</div>",
      "</section>",
      '<section class="sl-confirm-backdrop sl-hidden" id="manualConfirmPanel" aria-live="polite">',
      '<div class="sl-confirm-panel sl-confirm-panel-wide" role="dialog" aria-modal="true" aria-labelledby="manualConfirmTitle">',
      '<div class="sl-confirm-intro"><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid fa-user-check"></i></span><div><h3 id="manualConfirmTitle">Confirmar cadastro</h3><p>O candidato abaixo será cadastrado manualmente e vinculado à vaga Operador de Máquinas.</p></div></div>',
      '<div class="sl-table-wrap sl-confirm-table-wrap">',
      '<table class="sl-table sl-manual-confirm-table"><thead><tr><th>Candidato</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Perfil</th><th>Status</th></tr></thead><tbody id="manualConfirmTable"></tbody></table>',
      "</div>",
      '<div class="sl-confirm-actions">',
      button({ className: "sl-secondary-button", label: "Voltar", attrs: { id: "manualConfirmBack" } }),
      button({ className: "sl-primary-button", label: "Confirmar cadastro", attrs: { id: "manualConfirmFinish" } }),
      "</div>",
      "</div>",
      "</section>",
      '<section class="sl-confirm-backdrop sl-hidden" id="cancelPanel" aria-live="polite">',
      '<div class="sl-confirm-panel" role="dialog" aria-modal="true" aria-labelledby="cancelTitle">',
      '<div class="sl-confirm-box sl-cancel-box"><i class="fa-solid fa-triangle-exclamation"></i><div><h3 id="cancelTitle">Cancelar importação</h3><p>As informações carregadas não serão salvas. Deseja confirmar o cancelamento?</p></div></div>',
      '<div class="sl-confirm-actions">',
      button({ className: "sl-secondary-button", label: "Voltar", attrs: { id: "backCancel" } }),
      button({ className: "sl-primary-button", label: "Confirmar cancelamento", attrs: { id: "confirmCancel" } }),
      "</div>",
      "</div>",
      "</section>",
      '<section class="sl-confirm-backdrop sl-hidden" id="loadingPanel" aria-live="polite">',
      '<div class="sl-result-panel"><div class="sl-loading-box"><span class="sl-loader"></span><h3 id="loadingTitle">Importando candidatos</h3><p id="loadingText">Estamos criando os registros e iniciando as solicitações individuais no Fluig.</p></div></div>',
      "</section>",
      '<section class="sl-confirm-backdrop sl-hidden" id="successPanel" aria-live="polite">',
      '<div class="sl-result-panel sl-result-panel-wide" role="dialog" aria-modal="true" aria-labelledby="successTitle">',
      '<div class="sl-panel-head"><div><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid fa-circle-check"></i></span><div><h2 id="successTitle">Importação concluída</h2><p id="successText">Candidatos importados com sucesso.</p></div></div>',
      '<button class="sl-icon-button" type="button" id="finishClose" aria-label="Fechar retorno"><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="sl-success-box">',
      '<div class="sl-table-wrap sl-success-table-wrap">',
      '<table class="sl-table sl-imported-table"><thead><tr><th>Candidato</th><th>CPF</th><th>Perfil</th><th>Solicitação Fluig</th><th>Status</th></tr></thead><tbody id="successImportedTable"></tbody></table>',
      "</div>",
      "</div>",
      "</div>",
      "</section>"
    ].join("");
  }

  global.SLComponents = {
    escapeHtml: escapeHtml,
    attrs: attrs,
    button: button,
    filters: filters,
    behaviorProfileCards: behaviorProfileCards,
    selectionRoute: selectionRoute,
    formField: formField,
    dialog: dialog,
    infoGrid: infoGrid,
    infoSection: infoSection,
    historyTimeline: historyTimeline,
    jobSummary: jobSummary,
    kpiGrid: kpiGrid,
    modalShell: modalShell,
    pageSection: pageSection,
    personPills: personPills,
    tabs: tabs,
    table: table
  };
}(window));

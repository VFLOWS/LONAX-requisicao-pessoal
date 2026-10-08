(function () {
  var SL = window.SLComponents;

  var vagas = [
    {
      codigo: "VG-001",
      requisicao: "REQ-2026-0184",
      cargo: "Operador de Máquinas",
      nivel: "Operacional - Step 2",
      area: "Produção",
      gestor: "Eduardo Martins",
      unidade: "Matriz - Sarzedo/MG",
      posicoes: "1",
      abertura: "31/07/2026",
      status: "Em seleção",
      statusClass: "sl-status-neutral",
      admissao: "Não iniciada",
      solides: "895022",
      kanban: "Em seleção",
      detalhe: "12 candidatos · 1 aprovado"
    },
    {
      codigo: "VG-002",
      requisicao: "REQ-2026-0210",
      cargo: "Analista de Qualidade",
      nivel: "Pleno - Step 2",
      area: "Controle de Qualidade",
      gestor: "Patrícia Almeida",
      unidade: "Matriz - Sarzedo/MG",
      posicoes: "2",
      abertura: "05/08/2026",
      status: "Em admissão",
      statusClass: "sl-status-success",
      admissao: "Em andamento",
      solides: "895118",
      kanban: "Em admissão",
      detalhe: "2 aprovados · admissão em andamento"
    },
    {
      codigo: "VG-003",
      requisicao: "REQ-2026-0224",
      cargo: "Auxiliar Administrativo",
      nivel: "Júnior - Step 1",
      area: "Administração",
      gestor: "Carla Mendes",
      unidade: "Unidade Contagem/MG",
      posicoes: "1",
      abertura: "12/08/2026",
      status: "Aguardando publicação",
      statusClass: "sl-status-neutral",
      admissao: "Não iniciada",
      solides: "-",
      kanban: "Aguardando publicação",
      detalhe: "Sem candidatos vinculados"
    }
  ];

  var registered = window.SLVagas.list().map(function (record) {
    var origin = record.requisition;
    return {
      codigo: record.code, requisicao: origin.number, cargo: record.title, nivel: origin.level,
      area: origin.area, gestor: origin.manager, unidade: origin.unit, posicoes: String(origin.positions),
      abertura: record.openingDate.split("-").reverse().join("/"), status: record.status,
      statusClass: "sl-status-neutral", admissao: "Não iniciada", solides: record.reference || "-",
      kanban: record.status, detalhe: "Sem candidatos vinculados", registered: true
    };
  });
  vagas = vagas.concat(registered);

  function vagaHref(vaga) {
    return "detalhe-vaga.html" + (vaga.registered ? "?vaga=" + encodeURIComponent(vaga.codigo) : "");
  }

  function vagaCell(title, subtitle) {
    return '<div class="sl-vaga-cell"><strong>' + SL.escapeHtml(title) + "</strong><span>" + SL.escapeHtml(subtitle) + "</span></div>";
  }

  function statusPill(vaga) {
    return '<span class="sl-status-pill ' + SL.escapeHtml(vaga.statusClass) + '">' + SL.escapeHtml(vaga.status) + "</span>";
  }

  function dashboardFooter() {
    return [
      '<div class="sl-table-footer" id="dashboardFooter">',
      '<div class="sl-table-pagination">',
      "<label>Itens por página",
      "<select><option>15</option><option>30</option><option>50</option><option>100</option></select>",
      "</label>",
      "</div>",
      '<div class="sl-table-pages">',
      '<button type="button" aria-label="Página anterior"><i class="fa-solid fa-chevron-left"></i></button>',
      "<strong>1</strong>",
      '<button type="button">2</button>',
      '<button type="button">3</button>',
      '<button type="button">4</button>',
      "<span>...</span>",
      '<button type="button">12</button>',
      '<button type="button" aria-label="Próxima página"><i class="fa-solid fa-chevron-right"></i></button>',
      "</div>",
      '<div class="sl-table-result"><strong>' + vagas.length + ' vagas</strong><span>exibidas nesta visão</span></div>',
      "</div>"
    ].join("");
  }

  function renderRows() {
    return vagas.map(function (vaga) {
      return [
        '<a class="sl-table-link" href="' + vagaHref(vaga) + '">' + SL.escapeHtml(vaga.codigo) + "</a>",
        SL.escapeHtml(vaga.requisicao),
        vagaCell(vaga.cargo, vaga.nivel),
        vagaCell(vaga.area, vaga.gestor),
        SL.escapeHtml(vaga.unidade),
        SL.escapeHtml(vaga.posicoes),
        SL.escapeHtml(vaga.abertura),
        statusPill(vaga),
        SL.escapeHtml(vaga.admissao),
        SL.escapeHtml(vaga.solides)
      ];
    });
  }

  function renderKanbanColumn(title) {
    var items = vagas.filter(function (vaga) {
      return vaga.kanban === title;
    });

    return [
      '<article class="sl-kanban-column">',
      '<div class="sl-kanban-head"><span>' + SL.escapeHtml(title) + '</span><span class="sl-kanban-count">' + items.length + "</span></div>",
      '<div class="sl-kanban-list">',
      items.length ? items.map(function (vaga) {
        return [
          '<a class="sl-kanban-card" href="' + vagaHref(vaga) + '">',
          "<strong>" + SL.escapeHtml(vaga.codigo) + "</strong>",
          "<small>" + SL.escapeHtml(vaga.cargo) + "</small>",
          "<span>" + SL.escapeHtml(vaga.detalhe) + "</span>",
          "</a>"
        ].join("");
      }).join("") : '<div class="sl-kanban-empty">Nenhuma vaga</div>',
      "</div>",
      "</article>"
    ].join("");
  }

  function renderDashboard() {
    var kanbanStatuses = registered.some(function (vaga) { return vaga.status === "Em recrutamento"; })
      ? ["Aguardando publicação", "Em recrutamento", "Em seleção", "Em admissão"]
      : ["Aguardando publicação", "Em seleção", "Em admissão"];
    var actions = [
      '<span class="sl-last-update">Última atualização: 07/10/2026 11:42</span>',
      SL.button({ className: "sl-light-button sl-refresh-button", icon: "fa-rotate-right", label: "Atualizar" })
    ].join("");

    document.getElementById("dashboardApp").innerHTML = SL.pageSection({
      title: "Painel de vagas",
      description: "Acompanhamento gerencial das vagas aprovadas, candidatos e admissões.",
      icon: "fa-table-list",
      iconClass: "sl-section-icon-candidates",
      actionsHtml: actions,
      bodyHtml: [
        SL.kpiGrid([
          { className: "sl-vagas-kpi-blue", icon: "fa-briefcase", label: "Vagas abertas", value: String(12 + registered.length) },
          { className: "sl-vagas-kpi-green", icon: "fa-list-check", label: "Em seleção", value: "5" },
          { className: "sl-vagas-kpi-orange", icon: "fa-users", label: "Candidatos em processo", value: "38" },
          { className: "sl-vagas-kpi-red", icon: "fa-triangle-exclamation", label: "Fora do SLA", value: "4" }
        ]),
        SL.filters({
          label: "Filtros de vagas",
          fields: [
            { type: "search", label: "Buscar vaga", placeholder: "Código, cargo, requisição ou gestor" },
            { type: "select", label: "Status", options: ["Todos"].concat(window.SLVagas.statuses) },
            { label: "Área / Gerência", placeholder: "Área ou gerência" },
            { type: "select", label: "Situação da admissão", options: ["Todas", "Não iniciada", "Em andamento"] }
          ]
        }),
        '<div class="sl-vagas-viewbar">' + SL.tabs({
          label: "Visualização das vagas",
          items: [
            { label: "Lista", icon: "fa-list", active: true, attrs: { "data-dashboard-view": "list" } },
            { label: "Kanban", icon: "fa-table-columns", attrs: { "data-dashboard-view": "kanban" } }
          ]
        }) + '<a class="sl-primary-button sl-vagas-create-button" href="cadastro-vaga.html"><i class="fa-solid fa-plus"></i> Cadastrar vaga</a></div>',
        SL.table({
          id: "dashboardList",
          className: "sl-vagas-table",
          columns: ["Código", "Requisição", "Vaga", "Área e gestor", "Unidade", "Posições", "Abertura", "Status", "Admissão", "Sólides"],
          rows: renderRows(),
          footerHtml: dashboardFooter()
        }),
        '<div class="sl-dashboard-kanban' + (kanbanStatuses.length === 4 ? ' sl-dashboard-kanban-four' : '') + ' sl-hidden" id="dashboardKanban">' + kanbanStatuses.map(renderKanbanColumn).join("") + "</div>"
      ].join("")
    });
  }

  function bindDashboard() {
    document.querySelectorAll("[data-dashboard-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        var view = button.getAttribute("data-dashboard-view");

        document.querySelectorAll("[data-dashboard-view]").forEach(function (item) {
          item.classList.toggle("sl-tab-active", item === button);
        });

        document.getElementById("dashboardList").classList.toggle("sl-hidden", view !== "list");
        document.getElementById("dashboardFooter").classList.toggle("sl-hidden", view !== "list");
        document.getElementById("dashboardKanban").classList.toggle("sl-hidden", view !== "kanban");
      });
    });
  }

  renderDashboard();
  bindDashboard();
}());

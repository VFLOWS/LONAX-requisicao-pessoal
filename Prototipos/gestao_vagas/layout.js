(function () {
  var page = document.body.getAttribute("data-sl-page") || "";
  var current = document.body.getAttribute("data-sl-current") || "Painel de vagas";
  var backHref = document.body.getAttribute("data-sl-back-href") || "#";
  var backLabel = document.body.getAttribute("data-sl-back-label") || "Voltar para o Fluig";

  var navItems = [
    {
      id: "painel",
      href: "dashboard.html",
      label: "Painel de vagas",
      icon: "fa-chart-line"
    },
    {
      id: "cadastro",
      href: "cadastro-vaga.html",
      label: "Cadastro de vaga",
      icon: "fa-plus"
    },
    {
      id: "processo",
      href: "index.html",
      label: "Processo seletivo",
      icon: "fa-users"
    }
  ];

  function navItem(item) {
    var active = item.id === page ? " sl-sidebar-item-active" : "";
    return [
      '<a class="sl-sidebar-item' + active + '" href="' + item.href + '" aria-label="' + item.label + '">',
      '<i class="fa-solid ' + item.icon + '"></i>',
      "<span>" + item.label + "</span>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSectionHead(element) {
    var title = element.getAttribute("data-title") || "";
    var description = element.getAttribute("data-description") || "";
    var icon = element.getAttribute("data-icon") || "fa-table-list";
    var iconClass = element.getAttribute("data-icon-class") || "";
    var actionsTemplateId = element.getAttribute("data-actions-template");
    var actionsTemplate = actionsTemplateId ? document.getElementById(actionsTemplateId) : null;
    var actions = actionsTemplate ? actionsTemplate.innerHTML : "";

    element.className = "sl-page-section-head";
    element.innerHTML = [
      "<div>",
      '<span class="sl-section-icon ' + escapeHtml(iconClass) + '"><i class="fa-solid ' + escapeHtml(icon) + '"></i></span>',
      "<div>",
      "<h2>" + escapeHtml(title) + "</h2>",
      "<p>" + escapeHtml(description) + "</p>",
      "</div>",
      "</div>",
      actions ? '<div class="sl-panel-actions">' + actions + "</div>" : ""
    ].join("");
  }

  var layout = [
    '<header class="sl-page-head">',
    '<a class="sl-header-brand" href="dashboard.html" aria-label="Gestao de Vagas Lonax">',
    '<img src="https://www.lonax.com.br/wp-content/uploads/2024/08/Logomarca_Lonax-02.webp" alt="Lonax" />',
    "</a>",
    '<div class="sl-title-content">',
    '<nav aria-label="Caminho da pagina">',
    '<a href="dashboard.html">Gestão de Vagas</a>',
    '<i class="fa-solid fa-chevron-right"></i>',
    "<strong>" + current + "</strong>",
    "</nav>",
    "</div>",
    '<a class="sl-back-button" href="' + backHref + '">',
    '<i class="fa-solid fa-arrow-left"></i>',
    backLabel,
    "</a>",
    "</header>",
    '<aside class="sl-sidebar" aria-label="Menu da widget">',
    '<div class="sl-sidebar-group">Gestão de Vagas</div>',
    navItems.map(navItem).join(""),
    "</aside>"
  ].join("");

  document.body.insertAdjacentHTML("afterbegin", layout);
  document.querySelectorAll("[data-sl-section-head]").forEach(renderSectionHead);
}());

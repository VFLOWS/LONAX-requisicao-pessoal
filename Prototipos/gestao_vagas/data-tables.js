(function (global, $) {
  "use strict";

  var instances = new WeakMap();

  function tables(scope) {
    scope = scope || document;
    var result = Array.from(scope.querySelectorAll("table.sl-table"));
    if (scope.matches && scope.matches("table.sl-table")) result.unshift(scope);
    return result;
  }

  function plainText(html) {
    var element = document.createElement("div");
    element.innerHTML = html == null ? "" : String(html);
    element.querySelectorAll(".sl-avatar-sm, [aria-hidden='true'], .fa-solid").forEach(function (decoration) { decoration.remove(); });
    element.querySelectorAll(".sl-vaga-cell > strong, [data-profile]").forEach(function (part) { part.after(document.createTextNode(" ")); });
    element.querySelectorAll("[data-profile]").forEach(function (badge) {
      badge.textContent = badge.getAttribute("data-profile");
    });
    return element.textContent.replace(/\s+/g, " ").trim();
  }

  function display(html) {
    if (!/<[a-z][\s\S]*>/i.test(String(html))) return '<span class="sl-dt-cell-text">' + html + '</span>';
    var element = document.createElement('div'); element.innerHTML = html;
    element.querySelectorAll('.sl-candidate-name').forEach(function (link) {
      Array.from(link.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && node.textContent.trim()) {
          var name = document.createElement('span'); name.className = 'sl-dt-cell-text'; name.textContent = node.textContent;
          node.replaceWith(name);
        }
      });
    });
    return element.innerHTML;
  }

  function mount(scope) {
    return tables(scope).map(function (table) {
      if ($.fn.dataTable.isDataTable(table)) return $(table).DataTable();
      var compact = table.getAttribute("data-sl-table-compact") === "true";
      var search = !compact && table.getAttribute("data-sl-table-search") !== "false";
      var label = table.getAttribute("data-sl-table-label") || "registros";
      var columns = [];
      var definitions = Array.from(table.tHead.rows[0].cells).map(function (heading, index) {
        var title = heading.textContent.trim();
        columns.push({ label: title, resizable: !!title });
        var filterable = !!title && title !== 'Ações';
        var date = /^(Abertura|Nascimento|Previsão de início)$/.test(title);
        return {
          targets: index,
          orderable: !!title,
          orderSequence: ['asc', 'desc'],
          columnControl: filterable ? [{ extend: 'dropdown', text: 'Filtrar ' + title, content: [
            { extend: 'searchList', orthogonal: 'columnLabel', search: true, select: true },
            'spacer', 'orderAsc', 'orderDesc', 'searchClear'
          ] }] : [],
          searchable: !!title,
          render: function (data, type) {
            if (type === "display") return display(data);
            var text = plainText(data);
            if (type === 'columnLabel') return global.SLComponents.escapeHtml(text) || 'Não informado';
            if (date && (type === "sort" || type === "type")) {
              var match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
              return match ? match[3] + match[2] + match[1] : "";
            }
            return text;
          }
        };
      });
      var api = $(table).DataTable({
        autoWidth: false,
        order: [],
        pageLength: Number(table.getAttribute("data-sl-table-page-size")) || 15,
        lengthMenu: [15, 30, 50, 100],
        paging: !compact,
        info: !compact,
        searching: true,
        ordering: true,
        columnDefs: definitions,
        layout: {
          topStart: null, topEnd: search ? "search" : null,
          bottomStart: compact ? null : "pageLength",
          bottom: null, bottomEnd: compact ? null : ["paging", "info"]
        },
        language: {
          search: "Buscar:", searchPlaceholder: "Pesquisar na tabela…",
          lengthMenu: "Itens por Página _MENU_",
          info: "_START_–_END_ de _TOTAL_ " + label,
          infoEmpty: "0 " + label,
          infoFiltered: "(de _MAX_ no total)",
          emptyTable: "Nenhum registro disponível.",
          zeroRecords: "Nenhum resultado encontrado para os filtros aplicados.",
          paginate: { first: "«", previous: "‹", next: "›", last: "»" },
          columnControl: { dropdown: 'Filtrar Coluna', orderAsc: 'Ordenar Crescente', orderDesc: 'Ordenar Decrescente', searchClear: 'Limpar Filtro', list: { empty: 'Nenhuma opção encontrada', all: 'Selecionar', none: 'Limpar Seleção', search: 'Pesquisar opções…' } },
          aria: { paginate: { first: "Primeira Página", previous: "Página Anterior", next: "Próxima Página", last: "Última Página" } }
        }
      });
      var viewport = table.closest('.dt-layout-table');
      viewport.classList.add('sl-table-scroll');
      viewport.setAttribute('role', 'region'); viewport.tabIndex = 0;
      viewport.setAttribute('aria-label', table.caption?.textContent || table.closest('.sl-table-card')?.parentElement.querySelector('h2,h3')?.textContent || 'Tabela de Registros');
      var features = { api: api };
      features.filters = new global.SLColumnFilters(table, api, columns);
      features.scroll = new global.SLTableScroll(viewport);
      features.layout = new global.SLTableLayout({ element: table, api: api, columns: columns, onResize: function () {
        features.filters.search(); features.scroll.refresh();
      } });
      api.on('draw.dt.slTables', function () { features.layout.schedule(); });
      api.on('destroy.dt.slTables', function () {
        features.filters.destroy(); features.layout.destroy(); features.scroll.destroy(); instances.delete(table);
      });
      instances.set(table, features);
      return api;
    });
  }

  function replace(body, html, reset) {
    var table = body.closest("table");
    if (!$.fn.dataTable.isDataTable(table)) {
      body.innerHTML = html;
      return mount(table)[0];
    }
    var api = $(table).DataTable();
    var next = document.createElement("tbody");
    next.innerHTML = html;
    if (reset) { api.search("").columns().search(""); api.columns().columnControl.searchClear(); }
    api.clear().rows.add(Array.from(next.rows)).draw(!!reset);
    api.columns().columnControl.searchList('refresh');
    var info = api.page.info();
    if (info.pages && info.page >= info.pages) api.page(info.pages - 1).draw("page");
    return api;
  }

  global.SLTables = {
    mount: mount,
    replace: replace,
    clearFilters: function (scope) {
      tables(scope).forEach(function (table) {
        if ($.fn.dataTable.isDataTable(table)) {
          var api = $(table).DataTable();
          api.search('').columns().search(''); api.columns().columnControl.searchClear(); api.draw();
        }
      });
    },
    destroy: function (scope) {
      tables(scope).forEach(function (table) {
        if ($.fn.dataTable.isDataTable(table)) $(table).DataTable().destroy();
      });
    },
    adjust: function (scope) {
      tables(scope).forEach(function (table) {
        if (table.getClientRects().length && $.fn.dataTable.isDataTable(table)) {
          $(table).DataTable().columns.adjust(); instances.get(table)?.layout.schedule();
        }
      });
    }
  };
  document.addEventListener("DOMContentLoaded", function () { mount(document); });
}(window, window.jQuery));

(function (global) {
  'use strict';
  var escape = global.SLComponents.escapeHtml;

  function Selection(candidates, vacancyCode, record) {
    this.candidates = candidates;
    this.storageKey = 'lonax.gestaoVagas.selecao.v1.' + vacancyCode;
    this.steps = global.SLVagas.activeSelectionSteps(record || {
      steps: ['triagem', 'avaliacao', 'entrevistaGestor', 'teste', 'parecer']
    });
    this.selected = new Set();
    this.filter = 'all';
    this.view = 'list';
    try {
      var saved = JSON.parse(localStorage.getItem(this.storageKey));
      if (Array.isArray(saved) && saved.every(function (item) { return item && typeof item.name === 'string' && typeof item.email === 'string'; })) {
        var emails = new Set(saved.map(function (candidate) { return candidate.email.trim().toLowerCase(); }));
        var additions = candidates.filter(function (candidate) { return !emails.has(candidate.email.trim().toLowerCase()); });
        candidates.splice.apply(candidates, [0, candidates.length].concat(saved, additions));
      }
    } catch (error) { /* O protótipo continua disponível sem armazenamento local. */ }
    this.normalize();
  }

  Selection.prototype.normalize = function () {
    var self = this;
    this.candidates.forEach(function (candidate) {
      candidate.selectionId = candidate.email.trim().toLowerCase() || candidate.cpf || candidate.name;
      if (!self.steps.some(function (step) { return step.id === candidate.selectionStage; })) {
        var initial = self.steps.find(function (step) { return step.title === candidate.activity; }) || self.steps[0];
        candidate.selectionStage = initial ? initial.id : '';
      }
    });
  };

  Selection.prototype.save = function () {
    this.normalize();
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.candidates)); } catch (error) { /* Armazenamento opcional. */ }
  };

  Selection.prototype.stageTitle = function (candidate) {
    if (candidate.selectionDisqualified) return 'Desqualificado';
    var step = this.steps.find(function (item) { return item.id === candidate.selectionStage; });
    return step ? step.title : 'Sem Etapa';
  };

  Selection.prototype.checkbox = function (candidate) {
    return '<input class="sl-selection-check" type="checkbox" data-selection-id="' + escape(candidate.selectionId) + '" aria-label="Selecionar ' + escape(candidate.name) + '"' + (this.selected.has(candidate.selectionId) ? ' checked' : '') + (candidate.selectionDisqualified ? ' disabled' : '') + '>';
  };

  Selection.prototype.actionButton = function (candidate) {
    return '<button type="button" class="sl-icon-button sl-candidate-actions" data-candidate-actions="' + escape(candidate.selectionId) + '" aria-label="Ações de ' + escape(candidate.name) + '" aria-haspopup="menu" aria-expanded="false"><i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i></button>';
  };

  Selection.prototype.html = function () {
    return '<section class="sl-selection-stages" aria-label="Etapas da Seleção"><h3>Etapas da Seleção</h3><div class="sl-selection-stage-list" id="selectionStages"></div></section>';
  };

  Selection.prototype.toolbar = function (tabs) {
    return '<div class="sl-process-toolbar">' + tabs + '<div class="sl-process-search-actions"><label class="sl-selection-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" id="candidateSearch" aria-label="Buscar Candidatos" placeholder="Buscar candidatos…"></label></div></div>';
  };

  Selection.prototype.bulkToolbar = function () {
    return '<div class="sl-selection-bulk"><label class="sl-select-visible"><input type="checkbox" class="sl-selection-check" id="selectFilteredCandidates" aria-label="Selecionar Todos os Candidatos Filtrados"><span>Selecionar Todos</span></label><span id="candidateSelectionCount" aria-live="polite">Nenhum selecionado</span><button type="button" id="selectedCandidateActions" class="sl-icon-button sl-candidate-actions" aria-label="Ações dos Candidatos Selecionados" aria-haspopup="menu" aria-expanded="false" disabled><i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i></button></div>';
  };

  Selection.prototype.hideToast = function () {
    clearTimeout(this.toastTimer);
    if (this.toast) {
      var focused = this.toast.contains(document.activeElement);
      this.toast.remove();
      this.toast = null;
      if (focused && this.toastPreviousFocus && this.toastPreviousFocus.isConnected) this.toastPreviousFocus.focus({ preventScroll: true });
    }
  };

  Selection.prototype.showToast = function (message) {
    var self = this;
    this.hideToast();
    this.toastPreviousFocus = document.activeElement;
    var toast = document.createElement('div');
    toast.className = 'sl-movement-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>' + escape(message) + '</span><button type="button" class="sl-icon-button" aria-label="Fechar Notificação"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
    this.toast = toast;
    document.body.appendChild(toast);
    var pause = function () { clearTimeout(self.toastTimer); };
    var resume = function () { pause(); self.toastTimer = setTimeout(function () { self.hideToast(); }, 5000); };
    toast.querySelector('button').addEventListener('click', function () { self.hideToast(); });
    toast.addEventListener('mouseenter', pause);
    toast.addEventListener('mouseleave', function () { if (!toast.contains(document.activeElement)) resume(); });
    toast.addEventListener('focusin', pause);
    toast.addEventListener('focusout', function (event) { if (!toast.contains(event.relatedTarget) && !toast.matches(':hover')) resume(); });
    resume();
  };

  Selection.prototype.visibleCandidates = function () {
    var candidates = this.candidates;
    return this.api.rows({ search: 'applied' }).indexes().toArray().map(function (index) { return candidates[index]; }).filter(Boolean);
  };

  Selection.prototype.setView = function (view) {
    this.view = view === 'kanban' && this.filter === 'all' ? 'kanban' : 'list';
    var self = this;
    document.querySelectorAll('[data-view]').forEach(function (button) {
      var unavailable = button.dataset.view === 'kanban' && self.filter !== 'all';
      button.classList.toggle('sl-hidden', unavailable);
      button.disabled = unavailable;
      button.classList.toggle('sl-tab-active', button.dataset.view === self.view);
      button.setAttribute('aria-pressed', String(button.dataset.view === self.view));
    });
    var list = document.getElementById('listView');
    var showingList = this.view === 'list' && list.classList.contains('sl-hidden');
    list.classList.toggle('sl-hidden', this.view !== 'list');
    this.kanban.classList.toggle('sl-hidden', this.view !== 'kanban');
    if (showingList) global.SLTables.adjust(list);
  };

  Selection.prototype.refresh = function () {
    this.setView(this.view);
    var self = this;
    var stages = [{ id: 'all', title: 'Todos', icon: 'fa-users' }].concat(this.steps, [{ id: 'disqualified', title: 'Desqualificados', icon: 'fa-user-slash' }]);
    document.getElementById('selectionStages').innerHTML = stages.map(function (step) {
      var count = self.candidates.filter(function (candidate) {
        return step.id === 'all' || (step.id === 'disqualified' ? candidate.selectionDisqualified : !candidate.selectionDisqualified && candidate.selectionStage === step.id);
      }).length;
      return '<button type="button" class="sl-selection-stage' + (step.id === self.filter ? ' is-active' : '') + '" data-selection-stage="' + escape(step.id) + '" aria-pressed="' + (step.id === self.filter) + '"><i class="fa-solid ' + escape(step.icon || 'fa-circle-check') + '" aria-hidden="true"></i><span>' + escape(step.title) + '</span><strong>' + count + '</strong></button>';
    }).join('');
    var visible = this.visibleCandidates().filter(function (candidate) { return !candidate.selectionDisqualified; });
    var selectedVisible = visible.filter(function (candidate) { return self.selected.has(candidate.selectionId); }).length;
    var all = document.getElementById('selectFilteredCandidates');
    all.checked = visible.length > 0 && selectedVisible === visible.length;
    all.indeterminate = selectedVisible > 0 && selectedVisible < visible.length;
    all.disabled = !visible.length;
    var tableAll = document.getElementById('selectTableCandidates');
    if (tableAll) { tableAll.checked = all.checked; tableAll.indeterminate = all.indeterminate; tableAll.disabled = all.disabled; }
    document.getElementById('candidateSelectionCount').textContent = this.selected.size ? this.selected.size + (this.selected.size === 1 ? ' selecionado' : ' selecionados') : 'Nenhum selecionado';
    document.getElementById('selectedCandidateActions').disabled = !this.selected.size;
    Array.from(this.api.rows().nodes()).concat([this.kanban]).forEach(function (node) {
      node.querySelectorAll('[data-selection-id]').forEach(function (input) {
        input.checked = self.selected.has(input.dataset.selectionId);
        var row = input.closest('tr, .sl-process-kanban-card');
        if (row) row.classList.toggle('is-selected', input.checked);
      });
    });
  };

  Selection.prototype.closeMenu = function (restoreFocus) {
    if (!this.menu) return;
    this.menu.remove();
    this.menu = null;
    this.menuTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus && this.menuTrigger.isConnected) this.menuTrigger.focus({ preventScroll: true });
  };

  Selection.prototype.openMenu = function (trigger) {
    var self = this;
    if (this.menu && trigger === this.menuTrigger) { this.closeMenu(true); return; }
    this.closeMenu(false);
    this.menuTrigger = trigger;
    var ids = trigger.id === 'selectedCandidateActions' ? this.selected : new Set([trigger.dataset.candidateActions]);
    var candidates = this.candidates.filter(function (candidate) { return ids.has(candidate.selectionId); });
    if (!candidates.length) return;
    this.menu = document.createElement('div');
    this.menu.className = 'sl-selection-menu';
    this.menu.setAttribute('role', 'menu');
    this.menu.setAttribute('aria-label', 'Movimentar Candidatos');
    var canMove = candidates.every(function (candidate) { return !candidate.selectionDisqualified; });
    var actions = [
      { id: 'next', title: 'Mover para a Próxima Etapa', icon: 'fa-arrow-right', enabled: canMove && candidates.every(function (candidate) { return self.steps.findIndex(function (step) { return step.id === candidate.selectionStage; }) < self.steps.length - 1; }) && self.steps.length > 0 },
      { id: 'previous', title: 'Voltar para a Etapa Anterior', icon: 'fa-arrow-left', enabled: canMove && candidates.every(function (candidate) { return self.steps.findIndex(function (step) { return step.id === candidate.selectionStage; }) > 0; }) },
      { id: 'move', title: 'Mover para Outra Etapa', icon: 'fa-arrow-right-arrow-left', enabled: canMove && self.steps.length > 1 },
      { id: 'disqualify', title: 'Desqualificar', icon: 'fa-user-slash', enabled: canMove }
    ];
    this.menu.innerHTML = '<p>' + (candidates.length === 1 ? escape(candidates[0].name) : candidates.length + ' candidatos selecionados') + '</p>' + actions.map(function (action) {
      return '<button type="button" role="menuitem" data-selection-action="' + action.id + '"' + (action.enabled ? '' : ' disabled') + '><i class="fa-solid ' + action.icon + '" aria-hidden="true"></i>' + action.title + '</button>';
    }).join('');
    this.menu.addEventListener('click', function (event) {
      var action = event.target.closest('[data-selection-action]');
      if (!action || action.disabled) return;
      self.closeMenu(false);
      self.openReview(action.dataset.selectionAction, candidates);
    });
    document.body.appendChild(this.menu);
    trigger.setAttribute('aria-expanded', 'true');
    var rect = trigger.getBoundingClientRect();
    this.menuAnchor = { top: rect.top, left: rect.left };
    var width = this.menu.offsetWidth, height = this.menu.offsetHeight;
    this.menu.style.left = Math.max(8, Math.min(rect.right - width, innerWidth - width - 8)) + 'px';
    this.menu.style.top = Math.max(8, rect.bottom + height + 6 <= innerHeight ? rect.bottom + 6 : rect.top - height - 6) + 'px';
    var first = this.menu.querySelector('button:not(:disabled)');
    if (first) first.focus({ preventScroll: true });
  };

  Selection.prototype.mount = function (table, kanban, render, renderKanban) {
    var self = this;
    this.api = jQuery(table).DataTable();
    this.kanban = kanban;
    this.render = render;
    var header = this.api.column(0).header();
    header.innerHTML = '<input type="checkbox" class="sl-selection-check" id="selectTableCandidates" aria-label="Selecionar Todos os Candidatos Filtrados">';
    this.api.search.fixed('selection-stage', function (text, data, index) {
      var candidate = self.candidates[index];
      return !!candidate && (self.filter === 'all' || (self.filter === 'disqualified' ? candidate.selectionDisqualified : !candidate.selectionDisqualified && candidate.selectionStage === self.filter));
    });
    jQuery(table).on('draw.dt.slSelection', function () {
      self.closeMenu(false);
      renderKanban();
      self.refresh();
    });
    document.getElementById('candidateSearch').addEventListener('input', function (event) { self.api.search(event.target.value).draw(); });
    document.getElementById('selectionStages').addEventListener('click', function (event) {
      var stage = event.target.closest('[data-selection-stage]');
      if (!stage) return;
      self.filter = stage.dataset.selectionStage;
      self.api.draw();
      document.querySelector('[data-selection-stage="' + self.filter + '"]').focus({ preventScroll: true });
    });
    document.getElementById('processApp').addEventListener('change', function (event) {
      var input = event.target;
      if (input.id === 'selectFilteredCandidates' || input.id === 'selectTableCandidates') {
        self.visibleCandidates().filter(function (candidate) { return !candidate.selectionDisqualified; }).forEach(function (candidate) { if (input.checked) self.selected.add(candidate.selectionId); else self.selected.delete(candidate.selectionId); });
      } else if (input.matches('[data-selection-id]')) {
        if (input.checked) self.selected.add(input.dataset.selectionId); else self.selected.delete(input.dataset.selectionId);
      } else return;
      self.refresh();
    });
    this.bindActions();
    this.api.draw();
  };

  Selection.prototype.bindActions = function () {
    if (this.actionsBound) return;
    this.actionsBound = true;
    var self = this;
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-candidate-actions], #selectedCandidateActions');
      if (trigger && !trigger.disabled) self.openMenu(trigger);
      else if (self.menu && !self.menu.contains(event.target)) self.closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (self.summary) { self.handleSummaryKeys(event); return; }
      if (self.review) { self.handleReviewKeys(event); return; }
      if (!self.menu) return;
      if (event.key === 'Escape') { event.preventDefault(); self.closeMenu(true); }
      else if (event.key === 'Tab') self.closeMenu(false);
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        var buttons = Array.from(self.menu.querySelectorAll('button:not(:disabled)'));
        if (!buttons.length) return;
        var index = buttons.indexOf(document.activeElement);
        var next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
      }
    });
    window.addEventListener('resize', function () { self.closeMenu(false); });
    document.addEventListener('scroll', function (event) {
      if (!self.menu || self.menu.contains(event.target)) return;
      var rect = self.menuTrigger.getBoundingClientRect();
      if (Math.abs(rect.top - self.menuAnchor.top) > .5 || Math.abs(rect.left - self.menuAnchor.left) > .5) self.closeMenu(false);
    }, true);
  };

  global.SLSelection = Selection;
}(window));

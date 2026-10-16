(function (global) {
  "use strict";
  class ColumnFilters {
    constructor(element, api, columns) {
      this.element = element; this.api = api;
      columns.forEach((column, index) => {
        const button = api.column(index).header().querySelector('.dtcc-button_dropdown');
        if (button) button.setAttribute('aria-label', 'Filtrar ' + column.label);
      });
      this.open = event => {
        const button = event.target.closest('button.dtcc-button_dropdown');
        if (!button) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.show(button), 0);
      };
      this.escape = event => {
        if (event.key !== 'Escape' || !this.menu?.isConnected) return;
        event.preventDefault(); event.stopPropagation();
        this.close(); this.button.focus({ preventScroll: true });
      };
      this.reposition = () => this.position();
      this.search = () => {
        if (!this.menu?.isConnected) return;
        const list = this.menu.querySelector('.dtcc-list-buttons');
        const buttons = [...list.querySelectorAll('button')];
        const hasOptions = buttons.length ? buttons.some(button => button.getClientRects().length) : !!list.textContent.trim();
        this.empty.hidden = hasOptions; this.position();
      };
      element.tHead.addEventListener('click', this.open, true);
      element.tHead.addEventListener('keypress', this.open, true);
      document.addEventListener('keydown', this.escape, true);
      document.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    }
    show(button) {
      if (this.destroyed || button.getAttribute('aria-expanded') !== 'true') return;
      this.menu?.removeEventListener('input', this.search);
      this.menu = this.api.table().container().querySelector('.dtcc-dropdown');
      this.button = button;
      if (!this.menu) return;
      this.menu.classList.add('sl-column-filter-menu');
      // Escape clipping and transformed modal ancestors; keep ColumnControl's own menu.
      document.body.appendChild(this.menu);
      const label = button.getAttribute('aria-label').replace(/^Filtrar /, '');
      this.menu.setAttribute('aria-label', 'Filtrar ' + label);
      const input = this.menu.querySelector('input');
      if (input) { input.setAttribute('aria-label', 'Pesquisar opções de ' + label); input.focus({ preventScroll: true }); }
      this.empty = this.menu.querySelector('.sl-column-filter-empty');
      if (!this.empty) {
        this.empty = document.createElement('p'); this.empty.className = 'sl-column-filter-empty';
        this.empty.setAttribute('role', 'status'); this.empty.textContent = 'Nenhuma opção encontrada.';
        this.menu.querySelector('.dtcc-list-buttons').after(this.empty);
      }
      this.menu.addEventListener('input', this.search); this.search();
    }
    position() {
      if (!this.menu?.isConnected || !this.button?.isConnected) return;
      if (!this.button.getClientRects().length) { this.close(); return; }
      const bounds = this.button.getBoundingClientRect();
      const viewport = this.element.closest('.sl-table-scroll').getBoundingClientRect();
      if (bounds.right <= viewport.left || bounds.left >= viewport.right || bounds.bottom <= viewport.top || bounds.top >= viewport.bottom) { this.close(); return; }
      const modal = this.button.closest('[role="dialog"], .sl-import-panel')?.getBoundingClientRect();
      const top = Math.max(0, modal?.top || 0), bottom = Math.min(innerHeight, modal?.bottom || innerHeight);
      const below = Math.max(0, bottom - bounds.bottom - 8), above = Math.max(0, bounds.top - top - 8);
      const upwards = this.menu.scrollHeight > below && above > below;
      this.menu.style.maxHeight = (upwards ? above : below) + 'px';
      this.menu.style.left = Math.max(8, Math.min(innerWidth - this.menu.offsetWidth - 8, bounds.right - this.menu.offsetWidth)) + 'px';
      this.menu.style.top = (upwards ? bounds.top - this.menu.offsetHeight - 4 : bounds.bottom + 4) + 'px';
    }
    close() { if (this.menu?.isConnected) this.menu._close(); }
    destroy() {
      this.destroyed = true; clearTimeout(this.timer); this.close();
      this.menu?.removeEventListener('input', this.search);
      this.element.tHead.removeEventListener('click', this.open, true);
      this.element.tHead.removeEventListener('keypress', this.open, true);
      document.removeEventListener('keydown', this.escape, true);
      document.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
  }
  global.SLColumnFilters = ColumnFilters;
}(window));

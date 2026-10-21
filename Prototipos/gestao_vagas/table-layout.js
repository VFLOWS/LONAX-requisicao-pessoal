(function (global) {
    'use strict';
    class TableLayout {
        constructor({ element, api, columns, resizable = true, onResize }) {
            this.element = element; this.api = api; this.columns = columns; this.onResize = onResize;
            this.header = element.tHead; this.viewport = element.closest('.sl-table-scroll');
            this.originalStyle = { width: element.style.width, minWidth: element.style.minWidth };
            this.sized = element.hasAttribute('data-sl-columns-sized');
            this.handles = []; this.widths = null;
            this.minimumTableWidth = parseFloat(getComputedStyle(element).minWidth) || 0;
            this.measure = document.createElement('canvas').getContext('2d');
            this.schedule = () => {
                if (this.destroyed || this.frame) return;
                this.frame = requestAnimationFrame(() => { this.frame = null; this.refresh(); });
            };
            this.sizing = () => { this.applyWidths(); this.schedule(); };
            this.preventSort = event => {
                if (event.target.closest('.sl-column-resize-handle')) { event.preventDefault(); event.stopImmediatePropagation(); }
            };
            this.pointerDown = event => {
                const handle = event.target.closest('.sl-column-resize-handle');
                if (!handle || event.button !== 0) return;
                event.preventDefault(); event.stopImmediatePropagation();
                this.captureWidths(); const index = Number(handle.dataset.column);
                this.drag = { id: event.pointerId, handle, index, x: event.clientX, width: this.widths[index] };
                handle.focus({ preventScroll: true }); handle.setPointerCapture(event.pointerId);
                this.element.classList.add('is-resizing-columns');
            };
            this.pointerMove = event => {
                if (!this.drag || this.drag.id !== event.pointerId) return;
                event.preventDefault();
                this.setWidth(this.drag.index, this.drag.width + event.clientX - this.drag.x);
            };
            this.pointerEnd = event => {
                if (!this.drag || this.drag.id !== event.pointerId) return;
                const handle = this.drag.handle; this.drag = null;
                this.element.classList.remove('is-resizing-columns');
                if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
                this.refresh();
            };
            this.keyDown = event => {
                const handle = event.target.closest('.sl-column-resize-handle');
                if (!handle || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
                event.preventDefault(); event.stopImmediatePropagation(); this.captureWidths();
                const index = Number(handle.dataset.column), step = event.shiftKey ? 25 : 10;
                this.setWidth(index, this.widths[index] + (event.key === 'ArrowRight' ? step : -step));
            };
            if (resizable) columns.forEach((column, index) => {
                if (column.resizable === false) return;
                const handle = document.createElement('span');
                handle.className = 'sl-column-resize-handle'; handle.dataset.column = String(index); handle.tabIndex = 0;
                handle.setAttribute('role', 'separator'); handle.setAttribute('aria-orientation', 'vertical');
                handle.setAttribute('aria-label', 'Ajustar largura de ' + column.label);
                handle.setAttribute('aria-valuemin', '48'); handle.setAttribute('aria-valuemax', '2000');
                api.column(index).header().appendChild(handle); this.handles.push(handle);
            });
            this.header.addEventListener('click', this.preventSort, true);
            this.header.addEventListener('pointerdown', this.pointerDown, true);
            this.header.addEventListener('pointermove', this.pointerMove);
            this.header.addEventListener('pointerup', this.pointerEnd);
            this.header.addEventListener('pointercancel', this.pointerEnd);
            this.header.addEventListener('lostpointercapture', this.pointerEnd);
            this.header.addEventListener('keydown', this.keyDown, true);
            this.api.on('column-sizing.dt.slLayout', this.sizing);
            window.addEventListener('resize', this.schedule);
            if (typeof ResizeObserver !== 'undefined') {
                this.observer = new ResizeObserver(this.schedule);
                this.observer.observe(element); this.observer.observe(this.viewport);
            }
            if (document.fonts) {
                document.fonts.ready.then(this.schedule);
                document.fonts.addEventListener('loadingdone', this.schedule);
            }
            this.refresh();
        }
        captureWidths() {
            if (!this.widths) this.widths = this.api.columns().header().toArray().map(cell => cell.getBoundingClientRect().width);
        }
        setWidth(index, width) {
            this.widths[index] = Math.max(48, Math.min(2000, width));
            this.applyWidths(); this.refresh();
        }
        fitColumns() {
            if (this.widths || !this.viewport.clientWidth || !this.element.getClientRects().length) return;
            const headers = this.api.columns().header().toArray();
            if (!this.proportions) {
                const widths = headers.map(header => header.getBoundingClientRect().width);
                const total = widths.reduce((sum, width) => sum + width, 0);
                this.proportions = widths.map(width => width / total);
            }
            const available = Math.max(this.viewport.clientWidth, this.minimumTableWidth);
            this.automaticWidths = headers.map((header, index) => {
                const style = getComputedStyle(header);
                this.measure.font = style.font;
                const text = this.measure.measureText(this.columns[index].label).width;
                const controls = [...header.querySelectorAll('.dt-column-order, .dtcc')].reduce((sum, control) => sum + control.getBoundingClientRect().width, 0);
                const minimum = Math.ceil(text + controls + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 22);
                return Math.max(48, minimum, available * this.proportions[index]);
            });
        }
        applyWidths() {
            const widths = this.widths || this.automaticWidths;
            if (!widths) return;
            const cols = this.element.querySelectorAll('colgroup col');
            widths.forEach((width, index) => { if (cols[index]) cols[index].style.width = width + 'px'; });
            const total = widths.reduce((sum, width) => sum + width, 0);
            this.element.setAttribute('data-sl-columns-sized', 'true');
            this.element.style.width = total + 'px'; this.element.style.minWidth = total + 'px';
        }
        refresh() {
            if (this.destroyed) return;
            this.fitColumns(); this.applyWidths();
            this.handles.forEach(handle => handle.setAttribute('aria-valuenow', String(Math.round(this.api.column(Number(handle.dataset.column)).header().getBoundingClientRect().width))));
            for (const cell of this.element.querySelectorAll('tbody td')) {
                const texts = [];
                for (const candidate of [cell, ...cell.querySelectorAll('*')]) {
                    if (!(candidate instanceof HTMLElement) || !candidate.clientWidth || !candidate.clientHeight) continue;
                    const style = getComputedStyle(candidate);
                    const ellipsis = style.textOverflow === 'ellipsis' && /^(hidden|clip)$/.test(style.overflowX);
                    const clamped = Number.parseInt(style.webkitLineClamp, 10) > 0 && style.overflowY === 'hidden';
                    if (!ellipsis && !clamped) continue;
                    if (candidate.scrollWidth > candidate.clientWidth + 1 || candidate.scrollHeight > candidate.clientHeight + 1) texts.push(candidate.textContent.trim());
                }
                const title = [...new Set(texts)].filter(Boolean).join('\n');
                if (title) {
                    if (!cell.hasAttribute('data-sl-truncated')) cell.dataset.slOriginalTitle = cell.getAttribute('title') || '';
                    cell.setAttribute('title', title); cell.setAttribute('data-sl-truncated', 'true');
                } else if (cell.hasAttribute('data-sl-truncated')) {
                    if (cell.dataset.slOriginalTitle) cell.setAttribute('title', cell.dataset.slOriginalTitle);
                    else cell.removeAttribute('title');
                    cell.removeAttribute('data-sl-truncated'); delete cell.dataset.slOriginalTitle;
                }
            }
            if (this.onResize) this.onResize();
        }
        destroy() {
            this.destroyed = true;
            if (this.frame) cancelAnimationFrame(this.frame);
            if (this.observer) this.observer.disconnect();
            window.removeEventListener('resize', this.schedule);
            if (document.fonts) document.fonts.removeEventListener('loadingdone', this.schedule);
            this.api.off('column-sizing.dt.slLayout', this.sizing);
            this.header.removeEventListener('click', this.preventSort, true);
            this.header.removeEventListener('pointerdown', this.pointerDown, true);
            this.header.removeEventListener('pointermove', this.pointerMove);
            this.header.removeEventListener('pointerup', this.pointerEnd);
            this.header.removeEventListener('pointercancel', this.pointerEnd);
            this.header.removeEventListener('lostpointercapture', this.pointerEnd);
            this.header.removeEventListener('keydown', this.keyDown, true);
            this.handles.forEach(handle => handle.remove());
            this.element.classList.remove('is-resizing-columns');
            if (!this.sized) this.element.removeAttribute('data-sl-columns-sized');
            this.element.querySelectorAll('[data-sl-truncated]').forEach(cell => {
                if (cell.dataset.slOriginalTitle) cell.setAttribute('title', cell.dataset.slOriginalTitle); else cell.removeAttribute('title');
                cell.removeAttribute('data-sl-truncated'); delete cell.dataset.slOriginalTitle;
            });
            this.element.style.width = this.originalStyle.width; this.element.style.minWidth = this.originalStyle.minWidth;
        }
    }
    let nextViewport = 0;
    class HorizontalScroll {
        constructor(viewport) {
            this.originalId = viewport.id;
            if (!viewport.id) viewport.id = 'sl-table-viewport-' + (++nextViewport);
            this.viewport = viewport;
            this.rail = document.createElement('div');
            this.rail.className = 'sl-table-horizontal-scroll';
            this.rail.hidden = true; this.rail.tabIndex = 0;
            this.rail.setAttribute('role', 'scrollbar');
            this.rail.setAttribute('aria-orientation', 'horizontal');
            this.rail.setAttribute('aria-controls', viewport.id);
            this.rail.setAttribute('aria-valuemin', '0');
            this.rail.setAttribute('aria-label', 'Rolagem horizontal: ' + viewport.getAttribute('aria-label'));
            this.thumb = document.createElement('div');
            this.thumb.className = 'sl-table-horizontal-scroll-thumb';
            this.thumb.setAttribute('aria-hidden', 'true');
            this.rail.appendChild(this.thumb); viewport.after(this.rail);
            this.fromViewport = () => this.positionThumb();
            this.pointerDown = event => {
                if (event.button !== 0 || this.rail.hidden || !this.travel) return;
                event.preventDefault(); this.rail.focus({ preventScroll: true });
                if (event.target !== this.thumb) {
                    const left = event.clientX - this.rail.getBoundingClientRect().left - this.thumbWidth / 2;
                    this.moveTo(left / this.travel * this.maximum);
                }
                this.drag = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft };
                this.rail.setPointerCapture(event.pointerId); this.rail.classList.add('is-dragging');
            };
            this.pointerMove = event => {
                if (!this.drag || this.drag.id !== event.pointerId || !this.travel) return;
                this.moveTo(this.drag.left + (event.clientX - this.drag.x) / this.travel * this.maximum);
            };
            this.pointerEnd = event => {
                if (!this.drag || this.drag.id !== event.pointerId) return;
                this.drag = null; this.rail.classList.remove('is-dragging');
                if (this.rail.hasPointerCapture(event.pointerId)) this.rail.releasePointerCapture(event.pointerId);
            };
            this.keyDown = event => {
                const targets = { ArrowLeft: viewport.scrollLeft - 40, ArrowRight: viewport.scrollLeft + 40,
                    Home: 0, End: this.maximum, PageUp: viewport.scrollLeft - viewport.clientWidth,
                    PageDown: viewport.scrollLeft + viewport.clientWidth };
                if (!(event.key in targets)) return;
                event.preventDefault(); this.moveTo(targets[event.key]);
            };
            this.schedule = () => {
                if (this.destroyed || this.frame) return;
                this.frame = requestAnimationFrame(() => { this.frame = null; this.refresh(); });
            };
            viewport.addEventListener('scroll', this.fromViewport, { passive: true });
            this.rail.addEventListener('pointerdown', this.pointerDown);
            this.rail.addEventListener('pointermove', this.pointerMove);
            this.rail.addEventListener('pointerup', this.pointerEnd);
            this.rail.addEventListener('pointercancel', this.pointerEnd);
            this.rail.addEventListener('lostpointercapture', this.pointerEnd);
            this.rail.addEventListener('keydown', this.keyDown);
            document.addEventListener('scroll', this.schedule, { capture: true, passive: true });
            window.addEventListener('resize', this.schedule);
            if (typeof ResizeObserver !== 'undefined') {
                this.observer = new ResizeObserver(this.schedule);
                this.observer.observe(viewport); this.observer.observe(viewport.querySelector('table'));
            }
            this.refresh();
        }
        moveTo(value) {
            this.viewport.scrollLeft = Math.max(0, Math.min(this.maximum, value));
            this.positionThumb();
        }
        positionThumb() {
            const left = Math.max(0, this.viewport.scrollLeft);
            this.thumb.style.transform = `translateX(${this.maximum ? left / this.maximum * this.travel : 0}px)`;
            this.rail.setAttribute('aria-valuenow', String(Math.round(left)));
        }
        refresh() {
            if (this.destroyed) return;
            const viewport = this.viewport;
            const width = viewport.clientWidth;
            const bounds = viewport.getBoundingClientRect();
            let top = 0, bottom = window.innerHeight;
            // A table inside a modal follows that modal's scroll area rather
            // than covering its footer or using the full browser viewport.
            for (let parent = viewport.parentElement; parent && parent !== document.body && parent !== document.documentElement; parent = parent.parentElement) {
                if (/^(auto|scroll|hidden|clip)$/.test(getComputedStyle(parent).overflowY)) {
                    const rect = parent.getBoundingClientRect();
                    top = Math.max(top, rect.top); bottom = Math.min(bottom, rect.bottom);
                }
            }
            const visible = Math.min(bounds.bottom, bottom) > Math.max(bounds.top, top);
            const overflow = viewport.scrollWidth > width + 1;
            const show = width > 0 && visible && overflow && bounds.bottom > bottom + 1;
            this.maximum = Math.max(0, viewport.scrollWidth - width);
            this.thumbWidth = viewport.scrollWidth ? Math.min(width, Math.max(24, width * width / viewport.scrollWidth)) : width;
            this.travel = Math.max(0, width - this.thumbWidth);
            this.thumb.style.width = this.thumbWidth + 'px';
            this.rail.setAttribute('aria-valuemax', String(this.maximum));
            this.rail.style.width = width + 'px';
            this.rail.style.left = bounds.left + viewport.clientLeft + 'px';
            const railHeight = parseFloat(getComputedStyle(this.rail).height) || 8;
            this.rail.style.top = Math.min(bounds.bottom, bottom) - railHeight + 'px';
            this.rail.hidden = !show;
            this.positionThumb();
        }
        destroy() {
            this.destroyed = true;
            if (this.frame) cancelAnimationFrame(this.frame);
            if (this.observer) this.observer.disconnect();
            this.viewport.removeEventListener('scroll', this.fromViewport);
            this.rail.removeEventListener('pointerdown', this.pointerDown);
            this.rail.removeEventListener('pointermove', this.pointerMove);
            this.rail.removeEventListener('pointerup', this.pointerEnd);
            this.rail.removeEventListener('pointercancel', this.pointerEnd);
            this.rail.removeEventListener('lostpointercapture', this.pointerEnd);
            this.rail.removeEventListener('keydown', this.keyDown);
            document.removeEventListener('scroll', this.schedule, true);
            window.removeEventListener('resize', this.schedule);
            this.rail.remove();
            this.viewport.id = this.originalId;
        }
    }
    global.SLTableScroll = HorizontalScroll;
    global.SLTableLayout = TableLayout;
})(window);

(function () {
  'use strict';
  const A = window.LonaxAdmission, SL = window.SLComponents;
  if (!A || !SL) return;
  const query = new URLSearchParams(location.search);
  const candidateKey = query.get('candidato');
  const vacancy = query.get('vaga') || 'VG-001';
  const escape = SL.escapeHtml;
  let updating = false;
  function tableRows(table, match, transform) {
    if (!table) return;
    const $ = window.jQuery;
    if ($?.fn.dataTable.isDataTable(table)) {
      const api = $(table).DataTable(); let changed = false;
      api.rows().every(function () { const before = this.data(); if (!match(before)) return; const after = transform(before.slice()); if (JSON.stringify(before) !== JSON.stringify(after)) { this.data(after); changed = true; } });
      if (changed) api.draw(false);
    } else table.querySelectorAll('tbody tr').forEach(row => {
      const before = Array.from(row.cells, cell => cell.innerHTML); if (!match(before)) return;
      const after = transform(before.slice()); after.forEach((value, index) => { if (row.cells[index] && row.cells[index].innerHTML !== value) row.cells[index].innerHTML = value; });
    });
  }
  function update() {
    if (updating) return; updating = true;
    try {
      // O candidato aprovado do cenário de Seleção inicia uma única admissão.
      let process = A.selection(vacancy, 'ana-beatriz');
      if (candidateKey === 'ana-beatriz' && vacancy === 'VG-001' && !process) process = A.start('Processo Seletivo');
      if (!process) return;
      const status = A.status(process);
      const current = A.stages.find(item => item.key === process.current)?.title || 'Preparação da Admissão';
      const link = '../admissao_pessoal/etapa.html?etapa=' + process.current + '&id=' + encodeURIComponent(process.id);
      const admitted = process.current === 'finalizada', cancelled = process.current === 'cancelada';
      const pill = '<span class="sl-status-pill ' + (admitted ? 'sl-status-success' : 'sl-status-neutral') + '">' + escape(status) + '</span>';
      if (candidateKey === 'ana-beatriz' && document.getElementById('candidateDetailApp')) {
        document.querySelectorAll('.sl-vagas-kpi').forEach(node => {
          const label = node.querySelector('small')?.textContent;
          const value = node.querySelector('strong');
          if (value && label === 'Situação da admissão') value.textContent = status;
          if (value && label === 'Atividade atual') value.textContent = current;
        });
        const tags = document.querySelector('.sl-candidate-profile-tags .sl-status-pill'); if (tags) tags.textContent = status;
        let target = document.getElementById('admissionTracking');
        if (!target) { target = document.createElement('div'); target.id = 'admissionTracking'; document.getElementById('candidateDetailApp').append(target); }
        const content = SL.infoSection({ title: 'Acompanhamento da Admissão', icon: 'fa-file-signature', tone: 'blue', bodyHtml: SL.infoGrid([{ label: 'Solicitação', value: process.id }, { label: 'Atividade atual', value: current }, { label: 'Situação da admissão', value: status }, { label: 'Chapa', value: process.rm.chapa || 'Aguardando integração' }]) + '<a class="sl-primary-button" href="' + link + '"><i class="fa-solid fa-arrow-right"></i> Acessar admissão</a>' });
        if (target.innerHTML !== content) target.innerHTML = content;
      }
      if (vacancy === 'VG-001' && document.getElementById('tabAdmissoes')) {
        tableRows(document.querySelector('.sl-admission-table'), row => /Ana Beatriz/.test(row[0] || ''), row => [row[0], escape(process.id), escape(current), 'Juliana Costa', pill, escape(A.date(process.form.admissao))]);
        let target = document.getElementById('admissionVacancyTracking');
        if (!target) { target = document.createElement('div'); target.id = 'admissionVacancyTracking'; document.getElementById('tabAdmissoes').append(target); }
        const content = SL.infoSection({ title: 'Resultado da Admissão', icon: 'fa-user-check', tone: 'green', bodyHtml: SL.infoGrid([{ label: 'Candidato', value: process.form.nome }, { label: 'Situação da admissão', value: status }, { label: 'Situação da posição', value: admitted ? 'Preenchida' : cancelled ? 'Disponível para seleção' : 'Aguardando conclusão da admissão' }]) + '<a class="sl-secondary-button" href="' + link + '">Consultar admissão</a>' });
        if (target.innerHTML !== content) target.innerHTML = content;
      }
      tableRows(document.querySelector('.sl-candidates-table'), row => /candidato=ana-beatriz|Ana Beatriz/.test(row[0] || ''), row => { row[4] = '<a class="sl-table-link" href="' + link + '">' + escape(process.id) + '</a>'; row[5] = escape(current); row[6] = pill; return row; });
      document.querySelectorAll('#kanbanView a[href*="candidato=ana-beatriz"] .sl-status-pill').forEach(node => { node.textContent = status; });
      document.querySelectorAll('#dashboardApp table').forEach(table => tableRows(table, row => /VG-001/.test(row[0] || '') && row.length === 10, row => { row[8] = escape(status); if (admitted) row[7] = '<span class="sl-status-pill sl-status-success">Preenchida</span>'; return row; }));
      document.querySelectorAll('#dashboardApp .sl-kanban-card').forEach(node => { if (node.querySelector('strong')?.textContent.trim() === 'VG-001' && node.querySelector('span')) node.querySelector('span').textContent = status + (admitted ? ' · Posição preenchida' : cancelled ? ' · Posição disponível para seleção' : ''); });
    } finally { updating = false; }
  }
  update();
  window.addEventListener('storage', event => { if (event.key === A.STORE) update(); });
  window.addEventListener('pageshow', update);
  const tableBody = document.getElementById('candidateTable'); if (tableBody) new MutationObserver(update).observe(tableBody, { childList: true });
})();

(function (global) {
  'use strict';
  var Selection = global.SLSelection;
  var SL = global.SLComponents;
  var escape = SL.escapeHtml;

  function mockAttachment(candidate, title, filename) {
    function pdfText(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, ' ').replace(/([\\()])/g, '\\$1'); }
    var lines = [title, 'Candidato: ' + candidate.name, 'CPF: ' + candidate.cpf, 'Solicitacao Fluig: ' + candidate.workflow, 'Responsavel: Carla Mendes', 'Data: 16/10/2026', 'Avaliacao registrada para acompanhamento da selecao.'];
    var stream = 'BT /F1 12 Tf 50 790 Td ' + lines.map(function (line, index) { return (index ? '0 -25 Td ' : '') + '(' + pdfText(line) + ') Tj'; }).join('\n') + '\nET';
    var objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream'];
    var pdf = '%PDF-1.4\n', offsets = [0];
    objects.forEach(function (object, index) { offsets.push(pdf.length); pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n'; });
    var xref = pdf.length;
    pdf += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(function (offset) { return String(offset).padStart(10, '0') + ' 00000 n \n'; }).join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    return { name: filename, size: pdf.length, type: 'application/pdf', data: 'data:application/pdf;base64,' + btoa(pdf), url: URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' })), by: 'Carla Mendes', date: '16/10/2026 10:00' };
  }

  function trapDialogKeys(event, element, close) {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    var controls = Array.from(element.querySelectorAll('button:not(:disabled), a[href], textarea, select, input:not([type="file"])')).filter(function (node) { return node.getClientRects().length; });
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function candidateInfo(candidate, stage) {
    var profile = Array.isArray(candidate.profile) ? candidate.profile.join(' / ') : candidate.profile;
    var birthDate = String(candidate.birthDate || '').replace(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/, '$3/$2/$1');
    var locality = typeof candidate.address === 'string' ? candidate.address : '';
    if (!locality) {
      var address = candidate.addressDetails || candidate.address;
      locality = address ? [address.city?.name || address.foreign_city, address.city?.state?.initials || address.stateAcronym].filter(Boolean).join(' / ') : '';
    }
    var fields = [{ label: 'CPF', value: candidate.cpf || 'Não informado' }, { label: 'Solicitação Fluig', value: candidate.workflow || '—' }];
    if (stage) fields.push({ label: 'Etapa Atual', value: stage });
    fields.push({ label: 'Perfil Comportamental', value: profile || 'Não informado' }, { label: 'Gênero', value: candidate.gender || 'Não informado' }, { label: 'Data de Nascimento', value: birthDate || 'Não informada' }, { label: 'Localidade', value: locality || 'Não informada' });
    return '<div class="sl-candidate-info">' + SL.infoGrid(fields, 3) + '</div>';
  }

  Selection.prototype.reviewCard = function (draft, index, disqualify) {
    var candidate = draft.candidate;
    var initials = candidate.name.split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
    var options = this.steps.filter(function (step) { return step.id !== candidate.selectionStage; }).map(function (step) { return { value: step.id, label: step.title }; });
    var observation = '<div class="sl-review-observation">' + SL.formField({ name: 'selectionObservation-' + index, label: 'Observação', type: 'textarea', value: draft.observation, attrs: { 'data-review-observation': String(index), maxlength: 500, rows: 3, placeholder: disqualify ? 'Registre as observações da desqualificação…' : 'Registre as observações desta movimentação…' } }) + '<span class="sl-review-counter" data-review-counter="' + index + '">' + draft.observation.length + '/500</span></div>';
    var attachments = '<div class="sl-review-attachments"><h4>Anexos</h4><div class="sl-review-dropzone" data-review-drop="' + index + '"><i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i><div><p>Arraste e solte seus arquivos aqui</p><span>ou</span> <button type="button" class="sl-secondary-button" data-review-choose="' + index + '">Escolher Arquivos</button></div><input type="file" data-review-upload="' + index + '" multiple hidden></div><div class="sl-review-file-list" data-review-files="' + index + '"><p class="sl-review-empty">Nenhum arquivo anexado.</p></div><p class="sl-review-file-message" data-review-file-message="' + index + '" role="status"></p></div>';
    return '<article class="sl-selection-review-card" data-review-candidate="' + index + '" aria-labelledby="selectionCandidateName-' + index + '">' +
      '<header class="sl-selection-review-head"><span class="sl-avatar-sm" aria-hidden="true">' + escape(initials) + '</span><div><h3 id="selectionCandidateName-' + index + '">' + escape(candidate.name) + '</h3><p>' + escape(candidate.email) + '</p></div><span class="sl-selection-review-number">Candidato ' + (index + 1) + '</span></header>' +
      candidateInfo(candidate, this.stageTitle(candidate)) +
      (disqualify ? '<p class="sl-selection-review-outcome"><i class="fa-solid fa-user-slash" aria-hidden="true"></i> Desqualificar Candidato</p>' : SL.formField({ name: 'selectionDestination-' + index, label: 'Etapa de Destino', type: 'select', required: true, options: options, value: draft.destination, attrs: { 'data-review-destination': String(index) } })) +
      '<div class="sl-selection-review-details">' + attachments + observation + '</div></article>';
  };

  Selection.prototype.openReview = function (type, candidates) {
    var self = this;
    var disqualify = type === 'disqualify';
    var singular = candidates.length === 1;
    this.review = {
      type: type,
      pendingFiles: 0,
      urls: [],
      trigger: this.menuTrigger,
      drafts: candidates.map(function (candidate) {
        var current = self.steps.findIndex(function (step) { return step.id === candidate.selectionStage; });
        var destination = self.steps[current + (type === 'previous' ? -1 : 1)];
        if (type === 'move') destination = destination || self.steps.find(function (step) { return step.id !== candidate.selectionStage; });
        var observation = disqualify ? 'A candidatura de ' + candidate.name + ' não atende à disponibilidade de horário prevista para a vaga. Avaliação e parecer anexados para registro.' : type === 'previous' ? 'Retornar a candidatura de ' + candidate.name + ' para complementar as informações da avaliação e revisar a disponibilidade de horário.' : 'Currículo e experiência de ' + candidate.name + ' conferidos. Perfil compatível com a vaga e disponibilidade confirmada para a próxima avaliação.';
        var slug = candidate.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return { candidate: candidate, destination: destination ? destination.id : '', observation: observation, files: [mockAttachment(candidate, 'Avaliacao Curricular', 'avaliacao-curricular-' + slug + '.pdf'), mockAttachment(candidate, 'Parecer da Selecao', 'parecer-selecao-' + slug + '.pdf')] };
      })
    };
    this.review.urls = this.review.drafts.flatMap(function (draft) { return draft.files.map(function (file) { return file.url; }); });
    var title = disqualify ? (singular ? 'Desqualificar Candidato' : 'Desqualificar Candidatos') : (singular ? 'Movimentar Candidato' : 'Movimentar Candidatos');
    var modal = document.createElement('section');
    modal.className = 'sl-confirm-backdrop sl-selection-modal';
    modal.id = 'selectionActionModal';
    modal.innerHTML = '<form class="sl-confirm-panel sl-selection-dialog" role="dialog" aria-modal="true" aria-labelledby="selectionActionTitle" aria-describedby="selectionActionDescription"><header class="sl-selection-dialog-head"><div class="sl-confirm-intro"><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid ' + (disqualify ? 'fa-user-slash' : 'fa-arrow-right-arrow-left') + '" aria-hidden="true"></i></span><div><h2 id="selectionActionTitle">' + title + '</h2><p id="selectionActionDescription">' + candidates.length + (singular ? ' candidato selecionado. Confira os dados e registre a observação e os anexos.' : ' candidatos selecionados. Confira os dados e registre a observação e os anexos de cada candidato.') + '</p></div></div><button type="button" class="sl-icon-button" data-review-close aria-label="Fechar"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header>' +
      '<div class="sl-selection-dialog-body">' + this.review.drafts.map(function (draft, index) { return self.reviewCard(draft, index, disqualify); }).join('') + '</div><footer class="sl-selection-dialog-actions"><button type="button" class="sl-secondary-button" data-review-close>Cancelar</button><button type="submit" class="sl-primary-button' + (disqualify ? ' sl-selection-danger-button' : '') + '" id="confirmSelectionAction"><i class="fa-solid ' + (disqualify ? 'fa-user-slash' : 'fa-check') + '" aria-hidden="true"></i>' + (disqualify ? 'Confirmar Desqualificação' : 'Confirmar Movimentação') + '</button></footer></form>';
    this.review.element = modal;
    document.body.appendChild(modal);
    this.review.drafts.forEach(function (draft, index) { self.renderReviewFiles(index); });
    document.body.classList.add('sl-modal-open');
    modal.querySelector('form').addEventListener('submit', function (event) { event.preventDefault(); self.confirmReview(); });
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('[data-review-close]')) { self.closeReview(true); return; }
      var choose = event.target.closest('[data-review-choose]');
      if (choose) modal.querySelector('[data-review-upload="' + choose.dataset.reviewChoose + '"]').click();
      var remove = event.target.closest('[data-review-remove-file]');
      if (remove) {
        var index = Number(remove.dataset.reviewCandidate);
        var draft = self.review.drafts[index];
        var file = draft.files.splice(Number(remove.dataset.reviewRemoveFile), 1)[0];
        URL.revokeObjectURL(file.url);
        self.renderReviewFiles(index);
        modal.querySelector('[data-review-choose="' + index + '"]').focus({ preventScroll: true });
      }
    });
    modal.addEventListener('input', function (event) {
      var input = event.target;
      if (input.matches('[data-review-observation]')) {
        var index = Number(input.dataset.reviewObservation);
        self.review.drafts[index].observation = input.value;
        modal.querySelector('[data-review-counter="' + index + '"]').textContent = input.value.length + '/500';
      }
    });
    modal.addEventListener('change', function (event) {
      var input = event.target;
      if (input.matches('[data-review-destination]')) self.review.drafts[Number(input.dataset.reviewDestination)].destination = input.value;
      if (input.matches('[data-review-upload]')) { self.addReviewFiles(Number(input.dataset.reviewUpload), input.files); input.value = ''; }
    });
    ['dragover', 'dragleave', 'drop'].forEach(function (name) {
      modal.addEventListener(name, function (event) {
        var zone = event.target.closest('[data-review-drop]');
        if (!zone) return;
        event.preventDefault();
        if (name === 'dragover') zone.classList.add('is-dragging');
        else if (name === 'drop' || !zone.contains(event.relatedTarget)) zone.classList.remove('is-dragging');
        if (name === 'drop') self.addReviewFiles(Number(zone.dataset.reviewDrop), event.dataTransfer.files);
      });
    });
    modal.querySelector('[data-review-close]').focus({ preventScroll: true });
  };

  Selection.prototype.fileListHtml = function (files, index, editable) {
    return files.length ? files.map(function (file, fileIndex) {
      return '<div class="sl-review-file"><i class="fa-solid fa-file-lines" aria-hidden="true"></i><div><strong>' + escape(file.name) + '</strong><span>' + escape(file.by) + ' • ' + escape(file.date) + ' • ' + Math.max(1, Math.ceil(file.size / 1024)) + ' KB</span></div><div class="sl-review-file-actions"><a class="sl-icon-button" href="' + escape(file.url) + '" target="_blank" rel="noopener" aria-label="Visualizar ' + escape(file.name) + '" title="Visualizar Anexo"><i class="fa-solid fa-eye" aria-hidden="true"></i></a><a class="sl-icon-button" href="' + escape(file.url) + '" download="' + escape(file.name) + '" aria-label="Baixar ' + escape(file.name) + '" title="Baixar Anexo"><i class="fa-solid fa-download" aria-hidden="true"></i></a>' + (editable ? '<button type="button" class="sl-icon-button sl-review-remove-file" data-review-candidate="' + index + '" data-review-remove-file="' + fileIndex + '" aria-label="Remover ' + escape(file.name) + '" title="Remover Anexo"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>' : '') + '</div></div>';
    }).join('') : '<p class="sl-review-empty">Nenhum arquivo anexado.</p>';
  };

  Selection.prototype.renderReviewFiles = function (index) {
    this.review.element.querySelector('[data-review-files="' + index + '"]').innerHTML = this.fileListHtml(this.review.drafts[index].files, index, true);
  };

  Selection.prototype.addReviewFiles = function (index, files) {
    var self = this;
    var review = this.review;
    var list = Array.from(files);
    if (!list.length) return;
    var message = review.element.querySelector('[data-review-file-message="' + index + '"]');
    message.textContent = 'Carregando anexos…';
    review.pendingFiles += list.length;
    review.element.querySelector('#confirmSelectionAction').disabled = true;
    list.forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        if (self.review !== review) return;
        var url = URL.createObjectURL(file);
        review.urls.push(url);
        review.drafts[index].files.push({ name: file.name, size: file.size, type: file.type, data: reader.result, url: url, by: 'Carla Mendes', date: new Date().toLocaleString('pt-BR') });
        self.renderReviewFiles(index);
      };
      reader.onerror = function () { if (self.review === review) message.textContent = 'Não foi possível carregar ' + file.name + '. Selecione o arquivo novamente.'; };
      reader.onloadend = function () {
        if (self.review !== review) return;
        review.pendingFiles--;
        if (message.textContent === 'Carregando anexos…') message.textContent = '';
        review.element.querySelector('#confirmSelectionAction').disabled = review.pendingFiles > 0;
      };
      reader.readAsDataURL(file);
    });
  };

  Selection.prototype.confirmReview = function () {
    var self = this;
    var review = this.review;
    if (!review || this.summary || review.pendingFiles || !review.element.querySelector('form').reportValidity()) return;
    var results = review.drafts.map(function (draft) {
      var candidate = draft.candidate;
      var destination = self.steps.find(function (step) { return step.id === draft.destination; });
      return { name: candidate.name, email: candidate.email, cpf: candidate.cpf, workflow: candidate.workflow, profile: Array.isArray(candidate.profile) ? candidate.profile.slice() : candidate.profile, gender: candidate.gender, birthDate: candidate.birthDate, address: candidate.address, addressDetails: candidate.addressDetails, origin: self.stageTitle(candidate), destination: review.type === 'disqualify' ? 'Desqualificado' : destination.title, observation: draft.observation, files: draft.files };
    });
    review.element.classList.add('sl-hidden');
    this.openSummary(results, review.drafts[0].candidate.selectionId, review.type);
  };

  Selection.prototype.completeReview = function () {
    var self = this;
    var review = this.review;
    if (!review || !this.summary || this.summary.phase !== 'confirm' || review.pendingFiles) return;
    var timestamp = new Date().toISOString();
    review.drafts.forEach(function (draft) {
      var candidate = draft.candidate;
      var record = {
        action: review.type,
        from: candidate.selectionStage,
        to: review.type === 'disqualify' ? 'disqualified' : draft.destination,
        observation: draft.observation,
        attachments: draft.files.map(function (file) { var attachment = Object.assign({}, file); delete attachment.url; return attachment; }),
        at: timestamp,
        by: 'Carla Mendes'
      };
      if (review.type === 'disqualify') candidate.selectionDisqualified = true;
      else candidate.selectionStage = draft.destination;
      candidate.selectionHistory = (candidate.selectionHistory || []).concat([record]);
      self.selected.delete(candidate.selectionId);
    });
    var count = review.drafts.length;
    var message = review.type === 'disqualify' ? count + (count === 1 ? ' candidatura desqualificada.' : ' candidaturas desqualificadas.') : count + (count === 1 ? ' candidato movimentado.' : ' candidatos movimentados.');
    this.summary.urls = review.urls;
    this.summary.timestamp = timestamp;
    this.summary.message = message;
    this.summary.phase = 'success';
    review.urls = [];
    this.closeReview(false);
    this.render();
    this.renderSummary();
  };

  Selection.prototype.openSummary = function (results, focusId, type) {
    var self = this;
    var modal = document.createElement('section');
    modal.className = 'sl-confirm-backdrop sl-selection-modal';
    modal.id = 'selectionSummaryModal';
    this.summary = { element: modal, urls: [], focusId: focusId, results: results, type: type, phase: 'confirm' };
    document.body.appendChild(modal);
    document.body.classList.add('sl-modal-open');
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('[data-summary-close]')) self.closeSummary(true);
      else if (event.target.closest('[data-summary-confirm]')) self.completeReview();
    });
    this.renderSummary();
  };

  Selection.prototype.renderSummary = function () {
    var self = this;
    var summary = this.summary;
    var success = summary.phase === 'success';
    var disqualify = summary.type === 'disqualify';
    var title = success ? (disqualify ? 'Desqualificação Realizada com Sucesso' : 'Movimentação Realizada com Sucesso') : 'Resumo das Movimentações';
    var message = success ? summary.message : 'Confira o detalhamento de cada candidato antes de confirmar ' + (disqualify ? 'a desqualificação.' : 'a movimentação.');
    var meta = [{ label: 'Responsável', value: 'Carla Mendes' }, { label: 'Candidatos', value: String(summary.results.length) }];
    if (success) meta.push({ label: 'Data/Hora', value: new Date(summary.timestamp).toLocaleString('pt-BR') });
    var actions = success ? '<button type="button" class="sl-primary-button" data-summary-close>Fechar</button>' : '<button type="button" class="sl-secondary-button" data-summary-close>Voltar</button><button type="button" class="sl-primary-button' + (disqualify ? ' sl-selection-danger-button' : '') + '" data-summary-confirm>' + (disqualify ? 'Confirmar Desqualificação' : 'Confirmar Movimentação') + '</button>';
    summary.element.innerHTML = '<div class="sl-confirm-panel sl-selection-dialog" role="dialog" aria-modal="true" aria-labelledby="selectionSummaryTitle" aria-describedby="selectionSummaryDescription"><header class="sl-selection-dialog-head"><div class="sl-confirm-intro"><span class="sl-section-icon ' + (success ? 'sl-selection-summary-icon' : 'sl-section-icon-candidates') + '"><i class="fa-solid ' + (success ? 'fa-check' : 'fa-clipboard-check') + '" aria-hidden="true"></i></span><div><h2 id="selectionSummaryTitle">' + title + '</h2><p id="selectionSummaryDescription">' + escape(message) + '</p></div></div><button type="button" class="sl-icon-button" data-summary-close aria-label="' + (success ? 'Fechar Resumo' : 'Voltar à Edição') + '"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header><div class="sl-selection-dialog-body">' +
      '<div class="sl-selection-summary-meta">' + SL.infoGrid(meta, meta.length) + '</div>' + summary.results.map(function (result) {
        return '<article class="sl-selection-review-card sl-selection-summary-card"><header class="sl-selection-review-head"><div><h3>' + escape(result.name) + '</h3><p>' + escape(result.email) + '</p></div><span class="sl-status-pill ' + (success ? 'sl-status-success' : 'sl-status-neutral') + '">' + (success ? 'Concluído' : 'Aguardando Confirmação') + '</span></header>' + candidateInfo(result) + '<div class="sl-selection-summary-route"><div><span>Etapa de Origem</span><strong>' + escape(result.origin) + '</strong></div><i class="fa-solid fa-arrow-right" aria-hidden="true"></i><div><span>Resultado / Etapa de Destino</span><strong>' + escape(result.destination) + '</strong></div></div><div class="sl-review-attachments"><h4>Anexos</h4><div class="sl-review-file-list">' + self.fileListHtml(result.files, 0, false) + '</div></div><div class="sl-selection-summary-note"><h4>Observação</h4><p>' + escape(result.observation || 'Nenhuma observação informada.') + '</p></div></article>';
      }).join('') + '</div><footer class="sl-selection-dialog-actions">' + actions + '</footer></div>';
    summary.element.querySelector('[data-summary-close]').focus({ preventScroll: true });
  };

  Selection.prototype.closeSummary = function (restoreFocus) {
    if (!this.summary) return;
    var focusId = this.summary.focusId;
    var message = this.summary.phase === 'success' ? this.summary.message : '';
    this.summary.urls.forEach(function (url) { URL.revokeObjectURL(url); });
    this.summary.element.remove();
    this.summary = null;
    if (this.review) {
      this.review.element.classList.remove('sl-hidden');
      if (restoreFocus) this.review.element.querySelector('#confirmSelectionAction').focus({ preventScroll: true });
      return;
    }
    document.body.classList.remove('sl-modal-open');
    if (restoreFocus) {
      var focus = Array.from(document.querySelectorAll('[data-candidate-actions]')).find(function (button) { return button.dataset.candidateActions === focusId && button.getClientRects().length; });
      (focus || document.querySelector('[data-selection-stage="' + this.filter + '"]')).focus({ preventScroll: true });
    }
    if (message) this.showToast(message);
  };

  Selection.prototype.closeReview = function (restoreFocus) {
    if (!this.review) return;
    var trigger = this.review.trigger;
    this.review.urls.forEach(function (url) { URL.revokeObjectURL(url); });
    this.review.element.remove();
    this.review = null;
    if (!this.summary) document.body.classList.remove('sl-modal-open');
    if (restoreFocus && trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
  };

  Selection.prototype.handleReviewKeys = function (event) {
    var self = this;
    trapDialogKeys(event, this.review.element, function () { self.closeReview(true); });
  };

  Selection.prototype.handleSummaryKeys = function (event) {
    var self = this;
    trapDialogKeys(event, this.summary.element, function () { self.closeSummary(true); });
  };
}(window));

(function () {
  'use strict';
  const A = window.LonaxAdmission;
  const params = new URLSearchParams(location.search);
  const selected = params.get('id') || A.read().selected;
  const entryOrigin = params.has('origem') ? params.get('origem') === 'manual' ? 'Manual' : 'Processo Seletivo' : !params.has('id') && params.get('etapa') === 'solicitacao' ? 'Manual' : !params.has('id') && params.get('etapa') === 'preparacao' ? 'Processo Seletivo' : null;
  let state = entryOrigin ? A.start(entryOrigin) : A.read().processes[selected] || A.start();
  let stage = params.get('etapa') === 'nova_validacao' ? 'validacao_final' : A.stages.some(item => item.key === params.get('etapa')) ? params.get('etapa') : 'preparacao';
  const collectionTabs = new Map();
  let fieldSequence = 0;
  let errors = {};
  const expanded = {};
  const groupsOpen = {};
  const views = [];
  let modalAction, previousFocus, previewURL, integrationTimer, serviceTimer;
  const app = document.getElementById('appView');
  const modalBox = document.getElementById('modalBackdrop');
  const dialog = document.getElementById('modalDialog');
  const clone = A.clone;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  const get = path => path.split('.').reduce((value, part) => value?.[part], state);
  function set(path, value) { const parts = path.split('.'); const last = parts.pop(); const parent = parts.reduce((object, part) => object[part] ??= {}, state); parent[last] = value; }
  const meta = key => A.stages.find(item => item.key === key) || A.stages[0];
  const preview = () => !state.started && !['solicitacao', 'preparacao'].includes(stage);
  const editable = () => !state.started || state.current === stage;
  const href = (key, extra = '') => 'etapa.html?etapa=' + key + '&id=' + encodeURIComponent(state.id) + extra;
  function completeDefaults() {
    const defaults = A.fresh(state.id, state.origin);
    ['tae', 'rm', 'validation', 'notification', 'rmReview', 'functional'].forEach(key => { state[key] = { ...clone(defaults[key]), ...state[key] }; });
    state.infrastructure ??= clone(defaults.infrastructure);
    if (!state.form.documentosAssinatura) {
      state.form.documentosAssinatura = clone(defaults.form.documentosAssinatura);
      state.form.documentosAssinatura.forEach(doc => { Object.assign(doc.signatarios[0], { nome: state.form.nome, email: state.form.email, cpf: state.form.cpf }); });
    }
    state.form.cargoDescricao ??= defaults.form.cargoDescricao;
    if (state.origin === 'Manual' && !Object.hasOwn(state.form, 'vagaSelecionada')) {
      const vacancy = A.vacancies.find(item => item.id === state.form.vaga) || A.vacancies[0];
      Object.assign(state.form, { vagaSelecionada: vacancy.id, vaga: vacancy.id, requisicao: vacancy.requisicao, selecao: vacancy.selecao, candidato: vacancy.candidato });
    }
    state.form.documentosAssinatura.forEach(doc => { doc.signatarios ??= []; state.files['assinatura-' + doc.id] ??= clone(defaults.files['assinatura-' + doc.id] || [A.fixed('documento-admissional-1.pdf')]); });
    if (state.origin === 'Manual' && state.current === 'preparacao') state.current = state.started ? 'coleta' : 'solicitacao';
    Object.entries(state.decisions).forEach(([key, choice]) => {
      if (isTreatment(key)) choice.value = treatmentDecisionValue(choice.value || 'approve');
      else if (choice.value === 'cancel') choice.value = 'withdraw';
      if (key === 'validacao_rm' && ['return', 'reject'].includes(choice.value)) choice.value = 'return_final';
      if (key === 'assinaturas' && choice.value === 'return_validacao') choice.value = 'return_final';
      if (key === 'coleta' && state.form.origem === 'Manual' && choice.value === 'return') choice.value = '';
      if (key === 'validacao_final' && ['return', 'correction'].includes(choice.value)) choice.value = choice.value === 'correction' && choice.target === 'sesmt' ? 'return_sesmt' : 'return_coleta';
      if (key === 'preparacao' && choice.value === 'return') choice.value = 'approve';
    });
    if (state.current === 'nova_validacao') {
      state.current = 'validacao_final'; state.functional.active = true; state.validation.final = false; state.validation.rm = false;
      state.functional.note ||= 'Conferir a inconsistência identificada no cadastro do RM.';
    }
    if (state.started && state.current === 'integracao' && state.rm.status !== 'Em processamento') state.rm.authorized = true;
    ['solicitacaoObs', 'preparacaoObs', 'coletaObs'].forEach(key => { state.form[key] ??= defaults.form[key]; });
    ['solicitacao', 'preparacao', 'coleta', 'coletaOutros', 'epi'].forEach(key => { state.files[key] ??= defaults.files[key]; });
    ['utilizaEpi', 'epiObs', 'epis'].forEach(key => { state.medical[key] ??= clone(defaults.medical[key]); });
    if (params.get('cenario') === 'correcao-rm' && !state.started && stage === 'coleta') state.correction ??= { adjustments: 'Dados e documentos conferidos conforme a devolução do tratamento da integração.' };
    if (params.get('cenario') === 'correcao-rm' && !state.started && stage === 'coleta' && !state.tae.documents.some(doc => doc.fingerprint)) {
      state.tae.documents = A.signatures(true, state.form.nome);
      state.tae.documents.forEach(doc => { doc.fingerprint = documentFingerprint(doc.id); });
    }
    if (!state.started && state.exampleVersion !== defaults.exampleVersion) {
      ['seguro', 'prazo', 'representante', 'cnh'].forEach(key => { state.form[key] = defaults.form[key]; });
      if (state.form.contrato === 'Prazo indeterminado') state.form.contrato = defaults.form.contrato;
      ['dependentes', 'transportes', 'beneficios', 'beneficiarios'].forEach(key => { if (!state.form[key]?.length) state.form[key] = clone(defaults.form[key]); });
      state.exampleVersion = defaults.exampleVersion;
    }
  }
  function restoreEquipmentExamples() {
    const defaults = A.fresh(state.id);
    // Restaura somente nomes vazios ao abrir a página, sem recriar itens removidos.
    [[state.infrastructure.equipamentos, defaults.infrastructure.equipamentos], [state.medical.epis, defaults.medical.epis]].forEach(([items, examples]) => {
      items.forEach((item, index) => {
        if (!String(item.tipo ?? '').trim()) item.tipo = (examples.find(example => example.id === item.id) || examples[index % examples.length]).tipo;
      });
    });
  }
  function save() { try { A.save(state); return true; } catch (_) { feedback('Não foi possível salvar os dados neste navegador.', true); return false; } }
  function go(key) { stage = key; errors = {}; history.pushState(null, '', href(key)); render(); window.scrollTo(0, 0); }
  function feedback(message, bad = false) {
    const node = document.getElementById('feedback'); node.textContent = message; node.className = 'lx-feedback' + (bad ? ' lx-feedback-error' : '');
    clearTimeout(feedback.timer); feedback.timer = setTimeout(() => { node.textContent = ''; node.className = ''; }, 5000);
  }
  function modal(title, content, action, label = 'Confirmar', icon = 'circle-question', wide = false) {
    previousFocus = document.activeElement; modalAction = action;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalIcon').innerHTML = '<i class="fa-solid fa-' + icon + '" aria-hidden="true"></i>';
    document.getElementById('modalMessage').innerHTML = content;
    document.getElementById('modalConfirm').textContent = label;
    document.getElementById('modalCancel').classList.toggle('lx-hidden', !action);
    dialog.classList.toggle('lx-modal-wide', wide); modalBox.classList.remove('lx-hidden'); dialog.focus();
  }
  function closeModal() { modalBox.classList.add('lx-hidden'); document.getElementById('modalMessage').innerHTML = ''; modalAction = null; if (previewURL) URL.revokeObjectURL(previewURL); previewURL = null; previousFocus?.focus(); }
  const icon = name => '<i class="fa-solid fa-' + name + '" aria-hidden="true"></i>';
  const button = (action, label, style = 'primary', attributes = '') => '<button type="button" class="lx-btn lx-btn-' + style + '" data-action="' + action + '" ' + attributes + '>' + label + '</button>';
  const actions = (action, label) => '<div class="lx-actions">' + button('draft', icon('floppy-disk') + ' Salvar Rascunho', 'secondary') + button(action, icon('paper-plane') + ' ' + label) + '</div>';
  const fieldset = (title, name, content, readonly = false, tone = 'blue') => '<fieldset class="' + (readonly ? 'lx-history-fieldset lx-history-fieldset-' + tone : 'lx-fieldset') + '"><legend>' + icon(name) + ' ' + esc(title) + '</legend>' + content + '</fieldset>';
  const section = (title, name, content, readonly = false) => readonly ? fieldset(title, name, content, true) : '<section class="lx-section lx-admission-section"><div class="lx-section-head"><div><span class="lx-section-icon">' + icon(name) + '</span><h2>' + esc(title) + '</h2></div></div><div class="lx-view-body">' + content + '</div></section>';
  const subsection = (title, content) => '<section class="lx-admission-subsection"><h3>' + esc(title) + '</h3>' + content + '</section>';
  const grid = content => '<div class="lx-grid-3">' + content + '</div>';
  const display = (value, def = {}) => def.type === 'date' ? A.date(value) : def.type === 'money' ? A.money(value) || '—' : value || '—';
  const readGrid = (rows, extraClass = '') => '<div class="lx-history-stage-grid lx-admission-read-grid' + (extraClass ? ' ' + extraClass : '') + '">' + rows.map(([label, value, wide]) => '<div class="lx-history-stage-item lx-readonly-item-' + slug(label) + (wide ? ' lx-span-all' : '') + '"><span>' + esc(label) + '</span><strong>' + esc(value || '—') + '</strong></div>').join('') + '</div>';
  function field(def, prefix = 'form', data = null, forceReadonly = false) {
    const path = prefix + '.' + def.key;
    const value = data ? data[def.key] : get(path);
    const readonly = forceReadonly || def.readonly || !editable();
    const id = 'field-' + slug(path) + '-' + (++fieldSequence);
    const attrs = ' id="' + id + '" data-field="' + path + '"' + (def.required ? ' data-required aria-required="true"' : '') + (def.mask ? ' data-mask="' + def.mask + '"' : '') + (def.type === 'money' ? ' data-money' : '');
    let control;
    if (readonly) control = '<input' + attrs + ' type="text" readonly value="' + esc(display(value, def)) + '" />';
    else if (def.searchable) {
      control = '<div class="lx-single-select' + (value ? ' has-value' : '') + '" data-selector="' + path + '"><input' + attrs + ' type="hidden" value="' + esc(value) + '" /><div class="lx-single-select-control"><span class="lx-tag"><span class="lx-select-value">' + esc(value) + '</span><button type="button" data-clear="' + path + '" aria-label="Remover ' + esc(def.label) + '">×</button></span><input data-search aria-label="Pesquisar ' + esc(def.label) + '" placeholder="Pesquisar..." /></div><div class="lx-select-list lx-hidden">' + def.options.map(option => '<button type="button" data-option="' + esc(option) + '">' + esc(option) + '</button>').join('') + '</div></div>';
    } else if (def.options) control = '<select' + attrs + '><option value="">Selecione...</option>' + def.options.map(option => '<option' + (option === value ? ' selected' : '') + '>' + esc(option) + '</option>').join('') + '</select>';
    else if (def.type === 'textarea') control = '<textarea' + attrs + ' rows="3" maxlength="500">' + esc(value) + '</textarea>';
    else control = '<input' + attrs + ' type="' + (def.type === 'money' ? 'text' : def.type || 'text') + '" value="' + esc(def.type === 'money' ? A.money(value) : value) + '"' + (def.type === 'number' ? def.integer ? ' min="1" step="1"' : ' min="0" step="0.01"' : '') + ' />';
    return '<div class="lx-field' + (def.wide ? ' lx-span-all' : '') + '" data-wrap="' + path + '"><label for="' + id + '">' + esc(def.label) + (def.required ? ' <b>*</b>' : '') + '</label>' + control + (def.type === 'textarea' && !readonly ? '<small class="lx-field-counter"><span data-count="' + path + '">' + String(value || '').length + '</span>/500</small>' : '') + '</div>';
  }
  function fields(defs, prefix = 'form', data = null, readonly = false) { return readonly ? readGrid(defs.map(def => [def.label, display(data?.[def.key] ?? get(prefix + '.' + def.key), def), def.wide])) : grid(defs.map(def => field(def, prefix, data)).join('')); }
  function block(title, name, defs, readonly = false, data = state.form, prefix = 'form') { return fieldset(title, name, fields(defs, prefix, data, readonly), readonly); }
  function radios(label, path, values = ['Sim', 'Não'], value = get(path), readonly = false) {
    if (readonly) return readGrid([[label, value]]);
    return '<div class="lx-field lx-radio-field" data-wrap="' + path + '"><span>' + esc(label) + ' <b>*</b></span><div class="lx-radio-options">' + values.map(item => '<label class="lx-radio-option' + (item === value ? ' lx-radio-option-selected' : '') + '"><input type="radio" name="' + path + '" data-field="' + path + '" value="' + esc(item) + '"' + (item === value ? ' checked' : '') + ' /><strong>' + esc(item) + '</strong></label>').join('') + '</div></div>';
  }
  function panel(key, body, historic = false, description = '', unique = key) {
    const m = meta(key); const open = !historic || !!expanded[unique];
    const badge = key === 'coleta' ? (tabs.length + (correctionContext() ? 1 : 0)) + ' Blocos de Informações' : key === 'finalizada' ? 'Concluída' : key === 'cancelada' ? 'Cancelada' : key === 'sesmt' ? 'SESMT' : ['enviar_assinatura', 'notificacao_ti'].includes(key) ? 'Automática' : 'RH / DP';
    return '<div class="lx-view-frame"><div class="lx-view-rail"></div><div class="lx-timeline-dot lx-dot-' + (historic ? 'green' : m.tone) + '">' + icon(m.icon) + '</div><section class="lx-view-shell' + (historic ? ' lx-view-shell-history' : '') + (open ? '' : ' lx-view-shell-collapsed') + '" data-stage="' + key + '"><div class="lx-view-head"><div><h2>' + (historic ? '<button type="button" class="lx-collapse-title" data-collapse="' + unique + '" aria-expanded="' + open + '"><span>' + esc(m.title) + '</span>' + icon('chevron-down') + '</button>' : esc(m.title)) + '</h2><p>' + esc(description || m.description) + '</p></div>' + (historic ? '' : '<span class="lx-pill"' + (key === 'coleta' ? ' data-step-count' : '') + '>' + esc(badge) + '</span>') + '</div><div class="lx-view-body">' + body + '</div></section></div>';
  }
  function attachmentButton(action, name, label, source, index) { return button(action, icon(name), name === 'trash' ? 'danger' : 'secondary', 'data-source="' + source + '" data-index="' + index + '" aria-label="' + label + '"').replace('class="lx-btn ', 'class="lx-btn-icon '); }
  function attachments(group, edit = true, files = state.files[group] || [], compact = false) {
    const source = views.push({ group, files, editable: edit && editable() }) - 1;
    const canEdit = edit && editable();
    const accept = group === 'coletaOutros' || group.startsWith('assinatura-') ? '' : ' accept="application/pdf,image/png,image/jpeg,image/webp"';
    if (compact) {
      const upload = canEdit ? button('choose-file', icon('cloud-arrow-up') + ' Escolher Arquivo', 'outline', 'data-group="' + group + '" data-drop="' + group + '"') + '<input class="lx-file-input" type="file" data-upload="' + group + '"' + accept + ' />' : '';
      const list = files.length ? files.map((file, index) => '<div class="lx-attachment-row"><div class="lx-attachment-info">' + icon('file-lines') + '<div><strong title="' + esc(file.name) + '">' + esc(file.name) + '</strong><span>' + esc(file.by || A.owners.coleta) + ' • ' + esc(file.date) + ' • ' + Math.ceil(file.size / 1024) + ' KB</span></div></div><div class="lx-attachment-actions">' + attachmentButton('file', 'eye', 'Visualizar Anexo', source, index) + attachmentButton('download', 'download', 'Baixar Anexo', source, index) + (canEdit ? attachmentButton('delete-file', 'trash', 'Excluir Anexo', source, index) : '') + '</div></div>').join('') : '<div class="lx-empty-list">Nenhum arquivo anexado.</div>';
      return '<div class="lx-upload lx-upload-inline' + (canEdit ? '' : ' is-readonly') + '" data-file-group="' + group + '" data-wrap="files.' + group + '">' + upload + '<div class="lx-attachment-list">' + list + '</div></div>';
    }
    return '<div class="lx-upload" data-file-group="' + group + '" data-wrap="files.' + group + '">' + (canEdit ? '<div class="lx-dropzone" data-drop="' + group + '">' + icon('cloud-arrow-up') + '<p>Arraste e solte seus arquivos aqui</p><span>ou</span>' + button('choose-file', 'Escolher Arquivo', 'outline', 'data-group="' + group + '"') + '<input class="lx-file-input" type="file" data-upload="' + group + '"' + accept + (group.startsWith('assinatura-') ? '' : ' multiple') + ' /></div>' : '') + '<div class="lx-attachment-list">' + (files.length ? files.map((file, index) => '<div class="lx-attachment-row"><div class="lx-attachment-info">' + icon('file-lines') + '<div><strong>' + esc(file.name) + '</strong><span>' + esc(file.by || A.owners.coleta) + ' • ' + esc(file.date) + ' • ' + Math.ceil(file.size / 1024) + ' KB</span></div></div><div class="lx-attachment-actions">' + attachmentButton('file', 'eye', 'Visualizar Anexo', source, index) + attachmentButton('download', 'download', 'Baixar Anexo', source, index) + (canEdit ? attachmentButton('delete-file', 'trash', 'Excluir Anexo', source, index) : '') + '</div></div>').join('') : '<div class="lx-empty-list">Nenhum arquivo anexado.</div>') + '</div></div>';
  }
  function additionalAttachments(readonly = false, files = state.files) {
    const list = files.coletaOutros || [];
    return '<details class="lx-admission-group" data-group="coletaOutros"' + (groupsOpen.coletaOutros ? ' open' : '') + '><summary>' + icon('chevron-down') + '<strong>Outros</strong><span class="lx-status">' + list.length + (list.length === 1 ? ' Arquivo' : ' Arquivos') + '</span></summary><div class="lx-admission-group-body">' + attachments('coletaOutros', !readonly, list) + '</div></details>';
  }
  function signatureDocuments(readonly = false, form = state.form, files = state.files) {
    const documents = form.documentosAssinatura || [];
    const removeButton = (action, label, attributes) => button(action, icon('trash'), 'danger', attributes + ' aria-label="' + esc(label) + '" title="' + esc(label) + '"').replace('class="lx-btn ', 'class="lx-btn-icon lx-admission-remove-icon ');
    return section('Documentos para Assinatura Eletrônica', 'file-signature', '<div class="lx-admission-children" data-wrap="form.documentosAssinatura">' + (readonly ? '' : '<div class="lx-admission-list-toolbar">' + button('add-signature-document', icon('plus') + ' Adicionar Documento', 'primary') + '</div>') + documents.map((doc, index) => {
      const prefix = 'form.documentosAssinatura.' + index;
      const head = '<div class="lx-admission-child-head lx-admission-document-head"><strong>' + icon('file-signature') + ' Documento ' + (index + 1) + '</strong>' + (readonly ? '' : button('remove-signature-document', icon('trash') + ' Remover Documento', 'danger', 'data-document="' + index + '" aria-label="Remover Documento ' + (index + 1) + '"')) + '</div>';
      const signers = '<div class="lx-admission-children lx-admission-document-signers" data-wrap="' + prefix + '.signatarios">' + (readonly ? '' : '<div class="lx-admission-list-toolbar">' + button('add-signer', icon('plus') + ' Adicionar Signatário', 'primary', 'data-document="' + index + '"') + '</div>') + (doc.signatarios || []).map((person, personIndex) => {
        const personPrefix = prefix + '.signatarios.' + personIndex;
        const defs = [simple('nome', 'Nome'), simple('email', 'E-mail', true, 'email'), { ...simple('cpf', 'CPF'), mask: 'cpf' }];
        const controls = readonly ? formRow(defs, person, true, 3, personPrefix) : '<div class="lx-admission-form-row lx-admission-signer-fields">' + defs.slice(0, 2).map(def => field(def, personPrefix, person)).join('') + '<div class="lx-admission-signer-cpf">' + field(defs[2], personPrefix, person) + removeButton('remove-signer', 'Remover Signatário ' + (personIndex + 1) + ' do documento ' + (index + 1), 'data-document="' + index + '" data-person="' + personIndex + '"') + '</div></div>';
        return '<div class="lx-child-table lx-admission-signer-card"><div class="lx-admission-child-head"><strong>Signatário ' + (personIndex + 1) + '</strong></div>' + controls + '</div>';
      }).join('') + '</div>';
      const name = readonly ? readGrid([['Nome do Documento', doc.nome, true]]) : field(simple('nome', 'Nome do Documento'), prefix, doc);
      const documentContent = '<div class="lx-admission-document-file">' + head + '<div class="lx-admission-document-inline">' + name + attachments('assinatura-' + doc.id, !readonly, files['assinatura-' + doc.id] || [], true) + '</div></div>';
      return '<div class="lx-child-table lx-admission-child-card" data-signature-document="' + esc(doc.id) + '"><div class="lx-admission-document-layout">' + documentContent + signers + '</div></div>';
    }).join('') + '</div>', readonly);
  }
  function requester(readonly = false) {
    const defs = [
      { key: 'abertura', label: 'Data/Hora', value: state.created }, { key: 'solicitante', label: 'Solicitante', value: 'Juliana Costa' },
      { key: 'filial', label: 'Filial', value: 'Matriz — Sarzedo/MG' }, { key: 'gerencia', label: 'Gerência', value: 'Departamento Pessoal' },
      { key: 'gestor', label: 'Gestor Imediato', value: 'Ricardo Nunes' }, { key: 'diretoria', label: 'Área Diretoria', value: 'Diretoria Administrativa' }
    ];
    const data = Object.fromEntries(defs.map(def => [def.key, def.value]));
    return section('Dados do Solicitante', 'user', readonly ? readGrid(defs.map(def => [def.label, def.value]), 'lx-admission-requester-grid') : '<div class="lx-grid-4">' + defs.map(def => field({ ...def, readonly: true }, 'requester', data)).join('') + '</div>', readonly);
  }
  function formRow(defs, form, readonly, columns = defs.length, prefix = 'form') {
    return '<div class="lx-admission-form-row lx-admission-cols-' + columns + (readonly ? ' lx-admission-history-row' : '') + '">' + (readonly ? defs.map(def => '<div class="lx-history-stage-item"><span>' + esc(def.label) + '</span><strong>' + esc(display(form[def.key], def)) + '</strong></div>').join('') : defs.map(def => field(def, prefix, form)).join('')) + '</div>';
  }
  function preparation(readonly = false, form = state.form, files = state.files, area = stage, infraData = state.infrastructure) {
    const origin = form.origem;
    const refs = ['vaga', 'requisicao', 'selecao', 'candidato'].map((key, index) => ({ key, label: ['ID da Vaga', 'Número da Requisição', 'ID do Processo de Seleção', 'ID / Referência do Candidato'][index], readonly: true })).filter(def => origin !== 'Manual' || def.key !== 'candidato');
    const D = A.definitions.hiring;
    const group = area === 'solicitacao' ? 'solicitacao' : 'preparacao';
    const hiring = formRow(D.slice(0, 4), form, readonly) + formRow(D.slice(4, 9), form, readonly) + formRow(D.slice(9, 15), form, readonly) + formRow(D.slice(15, 19), form, readonly) + fields(D.slice(19), 'form', form, readonly);
    return requester(readonly) + section('Dados da Admissão', 'user-plus',
      (origin === 'Manual' && !readonly ? '<div class="lx-field" data-wrap="form.vagaSelecionada"><label for="admission-vacancy">Vagas em Aberto <b>*</b></label><select id="admission-vacancy" data-field="form.vagaSelecionada" aria-required="true"' + (!editable() ? ' disabled' : '') + '><option value="">Selecione...</option>' + A.vacancies.map(vacancy => '<option value="' + vacancy.id + '"' + (form.vagaSelecionada === vacancy.id ? ' selected' : '') + '>' + esc(vacancy.label) + '</option>').join('') + '</select></div>' : '') +
      formRow(refs, form, readonly) + subsection('Identificação do Candidato', formRow(A.definitions.identity, form, readonly)) +
      fieldset('Dados da Contratação', 'briefcase', hiring, readonly) +
      infrastructure(readonly, infraData) +
      fieldset('Upload de Arquivos', 'paperclip', attachments(group, !readonly, files[group] || []), readonly) +
      (group === 'solicitacao' ? fieldset('Observações', 'comment-dots', fields([{ key: 'solicitacaoObs', label: 'Observações da Solicitação', type: 'textarea', wide: true }], 'form', form, readonly), readonly) : ''), readonly);
  }
  const simple = (key, label, required = true, type = 'text', options) => ({ key, label, required, type, ...(options ? { options } : {}) });
  function collectionSections(form) {
    const D = A.definitions;
    const sections = [
      { tab: 'pessoais', title: 'Dados Pessoais', icon: 'user', defs: D.personal },
      { tab: 'pessoais', title: 'Contatos', icon: 'phone', defs: A.definitions.identity.slice(2) },
      { tab: 'pessoais', title: 'Filiação', icon: 'users', defs: [simple('mae', 'Nome da Mãe'), simple('pai', 'Nome do Pai', false)] },
      { tab: 'pessoais', title: 'Endereço', icon: 'location-dot', defs: D.address },
      { tab: 'documentos', title: 'Documento de Identidade', icon: 'id-card', defs: D.rg },
      { tab: 'documentos', title: 'CTPS', icon: 'address-book', defs: D.ctps },
      { tab: 'bancarios', title: 'Dados Bancários', icon: 'building-columns', defs: D.bank }
    ];
    if (form.pcd === 'Sim') sections.push({ tab: 'pessoais', title: 'Pessoa com Deficiência', icon: 'universal-access', defs: [{ ...simple('pcdObs', 'Observações sobre a Deficiência'), type: 'textarea', wide: true }] });
    if (form.primeiroEmprego !== 'Sim') sections.push({ tab: 'documentos', title: 'PIS', icon: 'id-badge', defs: [simple('pis', 'Número do PIS')] });
    if (form.ctpsTipo === 'Física') sections.push({ tab: 'documentos', title: 'Dados da CTPS Física', icon: 'address-book', defs: D.ctpsPhysical });
    [['cnh', 'CNH', 'car', D.license], ['titulo', 'Título de Eleitor', 'id-card', D.voting], ['militar', 'Documento Militar', 'id-card', D.military], ['classe', 'Registro Profissional', 'id-card', D.professional]].forEach(([key, title, name, defs]) => { if (form[key] === 'Sim') sections.push({ tab: 'documentos', title, icon: name, defs }); });
    if (form.nacionalidade === 'Estrangeira') sections.push({ tab: 'condicionais', title: 'Documentos de Estrangeiro', icon: 'passport', defs: D.foreign });
    if (form.prazo === 'Sim' || ['Experiência', 'Prazo determinado'].includes(form.contrato)) sections.push({ tab: 'condicionais', title: 'Contrato com Prazo', icon: 'calendar-days', defs: D.term.filter(def => form.contrato === 'Experiência' || !['experiencia1', 'experiencia2'].includes(def.key)) });
    if (form.contrato === 'Estágio') sections.push({ tab: 'condicionais', title: 'Estágio', icon: 'graduation-cap', defs: D.internship });
    if (form.contrato === 'Aprendiz') sections.push({ tab: 'condicionais', title: 'Aprendiz', icon: 'book-open', defs: D.apprentice });
    if (form.representante === 'Sim') sections.push({ tab: 'condicionais', title: 'Representante Legal', icon: 'user-shield', defs: D.legal });
    return sections;
  }
  const tabs = [['pessoais', 'Dados Pessoais', 'user'], ['documentos', 'Documentos Pessoais', 'id-card'], ['bancarios', 'Dados Bancários', 'building-columns'], ['dependentes', 'Dependentes', 'users'], ['beneficios', 'Transporte e Benefícios', 'bus'], ['condicionais', 'Informações Condicionais', 'list-check'], ['anexos', 'Documentos da Admissão', 'paperclip']];
  function childDefinitions(scope) {
    return ({
      epis: [simple('tipo', 'EPI'), { ...simple('quantidade', 'Quantidade', true, 'number'), integer: true }],
      dependentes: [simple('nome', 'Nome'), { ...simple('cpf', 'CPF'), mask: 'cpf' }, simple('nascimento', 'Data de Nascimento', true, 'date'), simple('parentesco', 'Parentesco', true, 'text', ['Filha', 'Filho', 'Cônjuge', 'Companheiro(a)', 'Outro'])],
      transportes: [simple('destino', 'Destino'), simple('linhaNumero', 'Número da Linha'), simple('linhaNome', 'Nome da Linha'), simple('empresa', 'Empresa de Transporte'), simple('cartao', 'Cartão'), simple('tarifa', 'Valor da Tarifa (R$)', true, 'money'), simple('viagens', 'Viagens por Dia', true, 'number')],
      beneficios: [simple('beneficio', 'Benefício', true, 'text', ['Assistência médica', 'Assistência odontológica', 'Alimentação']), simple('plano', 'Plano / Modalidade'), simple('beneficiarios', 'Beneficiários')],
      beneficiarios: [simple('nome', 'Nome'), simple('nascimento', 'Data de Nascimento', true, 'date'), simple('parentesco', 'Parentesco'), simple('percentual', 'Percentual de Participação', true, 'number')]
    })[scope];
  }
  function childRows(scope, readonly = false, form = state.form, files = state.files, root = 'form') {
    const names = { dependentes: 'Dependente', transportes: 'Trajeto', beneficios: 'Benefício', beneficiarios: 'Beneficiário', epis: 'EPI' };
    const add = readonly ? '' : '<div class="lx-admission-list-toolbar">' + button('add-child', icon('plus') + ' Adicionar ' + names[scope], 'primary', 'data-scope="' + scope + '"') + '</div>';
    return '<div class="lx-admission-children" data-wrap="' + root + '.' + scope + '">' + add + (form[scope] || []).map((item, index) => {
      const prefix = root + '.' + scope + '.' + index;
      const defs = childDefinitions(scope);
      let content = scope === 'transportes' ? formRow(defs.slice(0, 4), item, readonly, 4, prefix) + formRow(defs.slice(4), item, readonly, 3, prefix) : formRow(defs, item, readonly, defs.length, prefix);
      if (scope === 'dependentes') content += '<div class="lx-admission-child-options">' + [['ir', 'Dependência para IR?'], ['familia', 'Salário-Família?'], ['medica', 'Assistência Médica?'], ['odontologica', 'Assistência Odontológica?'], ['pensao', 'Pensão?']].map(([key, label]) => radios(label, prefix + '.' + key, ['Sim', 'Não'], item[key], readonly)).join('') + '</div>';
      if (scope === 'beneficios') content = radios('Optante?', prefix + '.optante', ['Sim', 'Não'], item.optante, readonly) + (item.optante === 'Sim' ? content : fields(childDefinitions(scope).slice(0, 1), prefix, item, readonly));
      if (scope !== 'beneficiarios') content += fields([{ key: 'observacoes', label: 'Observações', type: 'textarea', wide: true }], prefix, item, readonly);
      if (scope === 'dependentes') content += attachments('dependente-' + item.id, !readonly, files['dependente-' + item.id] || []);
      return '<div class="lx-child-table lx-admission-child-card" data-child-id="' + esc(item.id) + '"><div class="lx-admission-child-head"><strong>' + icon(({ dependentes: 'user', transportes: 'bus', beneficios: 'heart', beneficiarios: 'user-shield', epis: 'helmet-safety' })[scope]) + ' ' + esc(({ dependentes: 'Dependente', transportes: 'Trajeto', beneficios: 'Benefício', beneficiarios: 'Beneficiário', epis: 'EPI' })[scope]) + ' ' + (index + 1) + '</strong>' + (!readonly ? button('remove-child', icon('trash') + ' Remover', 'danger', 'data-scope="' + scope + '" data-index="' + index + '"') : '') + '</div>' + content + '</div>';
    }).join('') + '</div>';
  }
  function equipmentRows(scope, readonly, data, root, options) {
    const label = scope === 'epis' ? 'EPI' : 'Equipamento';
    const add = readonly ? '' : button('add-child', icon('plus') + ' Adicionar ' + label, 'primary', 'data-scope="' + scope + '"');
    return '<div class="lx-child-table lx-origin-equipment-table" data-wrap="' + root + '.' + scope + '">' + add + (data[scope] || []).map((item, index) => {
      if (readonly) return '<div class="lx-child-row lx-admission-equipment-history">' + readGrid([[scope === 'epis' ? 'EPI' : 'Equipamento', item.tipo], ['Quantidade', item.quantidade], ['Observação', item.observacoes, true]]) + '</div>';
      const prefix = root + '.' + scope + '.' + index;
      return '<div class="lx-child-row lx-origin-equipment-row lx-dismissal-origin-row" data-child-id="' + esc(item.id) + '">' + field(simple('tipo', scope === 'epis' ? 'EPI' : 'Equipamento'), prefix, item) + field({ ...simple('quantidade', 'Quantidade', true, 'number'), integer: true }, prefix, item) + '<div class="lx-item-observation">' + field({ key: 'observacoes', label: 'Observação', type: 'textarea' }, prefix, item) + '</div><button type="button" class="lx-btn-icon lx-btn-danger" data-action="remove-child" data-scope="' + scope + '" data-index="' + index + '" aria-label="Excluir ' + label + ' ' + (index + 1) + '">' + icon('trash') + '</button></div>';
    }).join('') + '</div>';
  }
  function infrastructure(readonly = false, data = state.infrastructure) {
    return fieldset('Infraestrutura do Colaborador', 'laptop', radios('Necessita Equipamentos?', 'infrastructure.necessita', ['Sim', 'Não'], data.necessita, readonly) + (data.necessita === 'Sim' ? equipmentRows('equipamentos', readonly, data, 'infrastructure', ['Notebook', 'Computador', 'Monitor', 'Celular', 'Telefone', 'Outros']) : '') + fields([{ key: 'observacoes', label: 'Observações da Infraestrutura', type: 'textarea', wide: true }], 'infrastructure', data, readonly), readonly);
  }
  function collectionSectionFields(item, form, readonly) {
    if (item.title === 'CNH') return formRow(item.defs.slice(0, 3), form, readonly) + formRow(item.defs.slice(3), form, readonly);
    if (item.title === 'Título de Eleitor') return formRow(item.defs, form, readonly);
    if (item.defs.length <= 4) return formRow(item.defs, form, readonly, item.defs.length === 4 ? 2 : item.defs.length);
    return fields(item.defs, 'form', form, readonly);
  }
  function collectionPart(key, readonly = false, form = state.form, files = state.files) {
    let content = '';
    if (key === 'pessoais') {
      const D = A.definitions;
      const family = fields(A.definitions.identity.slice(2), 'form', form, readonly) + subsection('Filiação', formRow([simple('mae', 'Nome da Mãe'), simple('pai', 'Nome do Pai', false)], form, readonly));
      content += formRow(D.personal.slice(0, 4), form, readonly) + formRow(D.personal.slice(4, 9), form, readonly) +
        '<div class="lx-admission-form-row lx-admission-cols-4">' + (readonly ? D.personal.slice(9).map(def => '<div class="lx-history-stage-item"><span>' + esc(def.label) + '</span><strong>' + esc(display(form[def.key], def)) + '</strong></div>').join('') : D.personal.slice(9).map(def => field(def, 'form', form)).join('')) + radios('Pessoa com Deficiência?', 'form.pcd', ['Sim', 'Não'], form.pcd, readonly) + '</div>' + (form.pcd === 'Sim' ? fields([{ key: 'pcdObs', label: 'Observações sobre a Deficiência', required: true, type: 'textarea', wide: true }], 'form', form, readonly) : '') +
        fieldset('Contatos e Filiação', 'users', family, readonly) + block('Endereço', 'location-dot', D.address, readonly, form);
    }
    if (key === 'documentos') {
      content += fieldset('Documentos Aplicáveis', 'list-check', '<div class="lx-admission-options-grid">' + [['primeiroEmprego', 'Primeiro Emprego / sem PIS?'], ['cnh', 'CNH Necessária à Contratação?'], ['titulo', 'Informar Título de Eleitor?'], ['militar', 'Informar Documento Militar?'], ['classe', 'Cargo Exige Registro Profissional?']].map(([path, label]) => radios(label, 'form.' + path, ['Sim', 'Não'], form[path], readonly)).join('') + '</div>', readonly);
      const identity = formRow(A.definitions.rg, form, readonly) + formRow([...A.definitions.ctps, ...(form.primeiroEmprego === 'Sim' ? [] : [simple('pis', 'Número do PIS')])], form, readonly) + (form.ctpsTipo === 'Física' ? formRow(A.definitions.ctpsPhysical, form, readonly) : '');
      content += fieldset('Documentos de Identidade', 'id-card', identity, readonly);
      content += '<div class="lx-admission-fieldset-grid">' + collectionSections(form).filter(item => item.tab === key && !['Documento de Identidade', 'CTPS', 'PIS', 'Dados da CTPS Física'].includes(item.title)).map(item => '<div' + (item.defs.length > 4 ? ' class="lx-span-all"' : '') + '>' + fieldset(item.title, item.icon, collectionSectionFields(item, form, readonly), readonly) + '</div>').join('') + '</div>';
    }
    if (key === 'bancarios') content += fields(A.definitions.bank, 'form', form, readonly);
    if (key === 'dependentes') content += radios('Possui Dependentes?', 'form.temDependentes', ['Sim', 'Não'], form.temDependentes, readonly) + (form.temDependentes === 'Sim' ? childRows('dependentes', readonly, form, files) : '');
    if (key === 'beneficios') content += fieldset('Vale-Transporte', 'bus', radios('Deseja Vale-Transporte?', 'form.transporte', ['Sim', 'Não'], form.transporte, readonly) + (form.transporte === 'Sim' ? childRows('transportes', readonly, form, files) : ''), readonly) + fieldset('Benefícios Aplicáveis', 'heart', childRows('beneficios', readonly, form, files), readonly) + fieldset('Seguro de Vida', 'shield-heart', radios('Optante por Seguro de Vida?', 'form.seguro', ['Sim', 'Não'], form.seguro, readonly) + (form.seguro === 'Sim' ? childRows('beneficiarios', readonly, form, files) : ''), readonly);
    if (key === 'condicionais') {
      const reference = [simple('contrato', 'Tipo de Contrato', false), simple('nacionalidade', 'Nacionalidade', false)];
      const conditions = readonly ? readGrid([['Tipo de Contrato', form.contrato], ['Nacionalidade', form.nacionalidade], ['Contrato com Prazo?', form.prazo], ['Informar Representante Legal?', form.representante]], 'lx-admission-conditions-row') : '<div class="lx-admission-form-row lx-admission-cols-4 lx-admission-conditions-row">' + reference.map(def => field({ ...def, readonly: true }, 'form', form)).join('') + radios('Contrato com Prazo?', 'form.prazo', ['Sim', 'Não'], form.prazo) + radios('Informar Representante Legal?', 'form.representante', ['Sim', 'Não'], form.representante) + '</div>';
      content += fieldset('Condições da Contratação', 'list-check', conditions, readonly);
      content += collectionSections(form).filter(item => item.tab === key).map(item => item.title === 'Contrato com Prazo' ? fieldset(item.title, item.icon,
        formRow(item.defs.filter(def => ['experiencia1', 'experiencia2', 'contratoFim', 'prazoTipo'].includes(def.key)), form, readonly) + fields(item.defs.filter(def => def.key === 'prazoMotivo'), 'form', form, readonly), readonly) : block(item.title, item.icon, item.defs, readonly, form)).join('');
    }
    if (key === 'anexos') content += A.documents.map(doc => {
      const list = files[doc.group] || [];
      return '<details class="lx-admission-group" data-group="' + doc.group + '"' + (groupsOpen[doc.group] ? ' open' : '') + '><summary>' + icon('chevron-down') + '<strong>' + esc(doc.label) + '</strong><span class="lx-status ' + (list.length ? 'is-done' : 'is-pending') + '">' + (list.length ? 'Recebido' : 'Pendente') + '</span></summary><div class="lx-admission-group-body">' + attachments(doc.group, !readonly, list) + '</div></details>';
    }).join('') + additionalAttachments(readonly, files);
    return content;
  }
  const tabDescriptions = {
    contratacao: 'Confira a identificação da admissão e os dados da contratação.',
    pessoais: 'Registre os dados pessoais, contatos, filiação e endereço do candidato.',
    documentos: 'Confira os documentos pessoais e indique quais se aplicam à contratação.',
    bancarios: 'Informe a conta bancária indicada pelo candidato.',
    dependentes: 'Cadastre os dependentes, os vínculos e seus documentos.',
    beneficios: 'Registre os trajetos e as opções de benefícios do candidato.',
    condicionais: 'Complete as informações específicas do tipo de contratação.',
    anexos: 'Confira e anexe os documentos recebidos do candidato.'
  };
  function collection(readonly = false, form = state.form, files = state.files, correction = false, id = 'current', infra = state.infrastructure) {
    const allTabs = correction ? [['contratacao', 'Dados da Admissão', 'briefcase'], ...tabs] : tabs;
    const selected = collectionTabs.get(id) || 'pessoais';
    const active = allTabs.some(([key]) => key === selected) ? selected : allTabs[0][0];
    const prefix = 'collection-' + slug(id);
    return '<div class="lx-admission-horizontal" data-collection-id="' + esc(id) + '" data-collection-readonly="' + readonly + '"><div class="lx-admission-tabs" role="tablist" aria-label="Blocos da Admissão' + (readonly ? ' — histórico' : '') + '">' + allTabs.map(([key, title, name], index) =>
      (index ? '<span class="lx-admission-tab-connector" aria-hidden="true"></span>' : '') +
      '<button type="button" role="tab" class="lx-admission-tab' + (active === key ? ' is-active' : '') + '" id="' + prefix + '-tab-' + key + '" data-collection-tab="' + key + '" aria-selected="' + (active === key) + '" aria-controls="' + prefix + '-panel-' + key + '" tabindex="' + (active === key ? 0 : -1) + '"><span class="lx-admission-tab-icon">' + icon(name) + '</span><strong>' + esc(title) + '</strong><span class="lx-admission-tab-description">' + esc(tabDescriptions[key]) + '</span></button>'
    ).join('') + '</div>' + allTabs.map(([key, title, name]) => {
      const attrs = ' role="tabpanel" id="' + prefix + '-panel-' + key + '" aria-labelledby="' + prefix + '-tab-' + key + '" data-collection-block="' + key + '"' + (active === key ? '' : ' hidden');
      const body = '<div class="lx-section-head"><div><span class="lx-section-icon">' + icon(name) + '</span><h3>' + esc(title) + '</h3></div></div><div class="lx-admission-group-body"><p class="lx-admission-block-description">' + esc(tabDescriptions[key]) + '</p>' + (key === 'contratacao' ? preparation(readonly, form, files, form.origem === 'Manual' ? 'solicitacao' : 'preparacao', infra) : collectionPart(key, readonly, form, files)) + '</div>';
      if (key === 'anexos') return '<div class="lx-admission-tab-panel"' + attrs + '><section class="lx-section lx-admission-tab-panel lx-admission-section">' + body + '</section>' + signatureDocuments(readonly, form, files) + '</div>';
      return '<section class="lx-section lx-admission-tab-panel"' + attrs + '>' + body + '</section>';
    }).join('') + '</div>';
  }
  function decisionTarget(key, value) {
    if (key === 'coleta' && value === 'return') return state.form.origem === 'Manual' ? 'solicitacao' : 'preparacao';
    if (key === 'validacao' && value === 'return') return 'coleta';
    if (key === 'validacao_rm' && value === 'reject') return 'validacao_final';
    return ({ return_sesmt: 'sesmt', return_coleta: 'coleta', return_rm: 'validacao_rm', return_assinaturas: 'assinaturas', return_final: 'validacao_final', return_validacao: 'validacao', return: key === 'tratamento' ? 'coleta' : 'validacao_final' })[value];
  }
  function isTreatment(key) { return ['tratamento', 'tratamento_tae', 'tratamento_ti'].includes(key); }
  function treatmentDecisionValue(value) { return ({ approve: 'retry', reject: 'cancel', withdraw: 'cancel' })[value] || value; }
  function decisionOptions(key) {
    const correction = (value, description) => [value, 'Correção — ' + meta(decisionTarget(key, value)).title, description, 'return'];
    const approved = (description, title = 'Aprovado') => ['approve', title, description, 'approve'];
    const rejected = ['reject', 'Reprovado', 'Encerrar a admissão como reprovada, com justificativa registrada.', 'reject'];
    const withdrawal = ['withdraw', 'Desistência', 'Registrar a desistência do candidato e encerrar a admissão.', 'reject'];
    const reintegration = description => ['retry', 'Reintegração', description, 'approve'];
    const cancellation = ['cancel', 'Cancelar', 'Encerrar o processo de admissão, com o motivo do cancelamento registrado.', 'reject'];
    return ({
      preparacao: [approved('Encaminhar para Coleta e Preenchimento.'), rejected, withdrawal],
      coleta: [approved('Encaminhar para Validação de Dados e Documentos.'), rejected, ...(state.form.origem === 'Manual' ? [] : [correction('return', 'Enviar para Preparação da Admissão para corrigir os dados da contratação.')]), withdrawal],
      validacao: [approved('Encaminhar para Exame Admissional — SESMT.'), rejected, correction('return', 'Enviar para Coleta e Preenchimento para corrigir os dados e documentos; depois, validar novamente.'), withdrawal],
      validacao_final: [approved(signaturesCurrent() ? 'Integrar automaticamente os dados atualizados no RM e encaminhar para conferência do cadastro.' : 'Encaminhar os documentos para assinatura eletrônica; após as assinaturas, integrar no RM.'), rejected, correction('return_sesmt', 'Enviar para Exame Admissional — SESMT para corrigir o exame, o ASO ou os EPIs.'), correction('return_coleta', 'Enviar para Coleta e Preenchimento para corrigir os dados e documentos.'), withdrawal],
      assinaturas: [approved('Assinaturas conferidas. Integrar automaticamente no RM e encaminhar para conferência do cadastro.'), rejected, correction('return_final', 'Enviar para Validação Final do RH / DP para revisar os dados e os documentos de assinatura.'), withdrawal],
      validacao_rm: [approved('Prosseguir com a admissão; notificar automaticamente a TI quando houver equipamentos e concluir o processo.'), correction('return_final', 'Enviar para Validação Final do RH / DP para corrigir os dados e documentos da admissão.')],
      tratamento: [reintegration('Executar novamente a integração com o TOTVS RM, preservando o cadastro e a Chapa já retornados.'), correction('return_coleta', 'Enviar para Coleta e Preenchimento para ajustar os dados e documentos.'), correction('return_sesmt', 'Enviar para Exame Admissional — SESMT para corrigir o exame, o ASO ou os EPIs.'), cancellation],
      tratamento_tae: [reintegration('Reenviar os documentos para assinatura eletrônica ao TAE.'), correction('return_final', 'Enviar para Validação Final do RH / DP para conferir os dados e documentos antes do reenvio.'), correction('return_sesmt', 'Enviar para Exame Admissional — SESMT para corrigir o exame, o ASO ou os EPIs; depois, encaminhar para Validação Final do RH / DP.'), correction('return_validacao', 'Enviar para Validação de Dados e Documentos para conferir as informações e os anexos antes de prosseguir com a admissão.'), cancellation],
      tratamento_ti: [reintegration('Reenviar a notificação à TI com os equipamentos previstos.'), correction('return_rm', 'Enviar para Validar Inclusão / Atualização no TOTVS RM para conferir o cadastro antes da notificação.'), correction('return_assinaturas', 'Enviar para Acompanhamento das Assinaturas para conferir os documentos assinados.'), correction('return_final', 'Enviar para Validação Final do RH / DP para revisar os dados da admissão e a infraestrutura.'), cancellation]
    })[key] || [];
  }
  function decisionData(key, record = null) {
    if (record?.decision) return record.decision;
    const choice = { value: 'approve', note: key === 'validacao_final' ? state.form.finais : 'Dados e documentos conferidos pelo RH / DP.', ...state.decisions[key] };
    if (isTreatment(key)) choice.value = treatmentDecisionValue(choice.value || 'approve');
    return choice;
  }
  function approvalChoices(options, selected, path, decisionKey = '') {
    const attribute = decisionKey ? 'data-decision="' + esc(decisionKey) + '"' : 'data-field="' + esc(path) + '"';
    return '<div class="lx-current-decision" data-wrap="' + esc(path) + '">' + options.map(([value, title, text, tone]) => '<label class="lx-decision-option lx-decision-' + tone + (selected === value ? ' lx-decision-option-selected' : '') + '"><input type="radio" name="' + slug(path) + '" ' + attribute + ' value="' + esc(value) + '"' + (selected === value ? ' checked' : '') + ' /><div><span>' + esc(title) + '</span><p>' + esc(text) + '</p></div></label>').join('') + '</div>';
  }
  function decision(key, readonly = false, record = null, responsible = A.owners[key]) {
    const d = decisionData(key, record);
    const options = decisionOptions(key);
    if (readonly) return fieldset('Decisão sobre a Solicitação', 'list-check', readGrid([['Decisão', d.value === 'retry' ? 'Reintegração solicitada' : d.value === 'approve' ? 'Solicitação aprovada' : d.value === 'withdraw' ? 'Desistência registrada' : d.value === 'reject' ? key === 'validacao_rm' ? 'Cadastro reprovado — retorno à Validação Final' : 'Solicitação reprovada' : d.value === 'cancel' ? 'Solicitação cancelada' : 'Solicitação devolvida para correção'], ['Responsável', responsible], ['Observação', d.note || 'Etapa aprovada sem ressalvas.']]), true, ['approve', 'retry'].includes(d.value) ? 'green' : ['reject', 'withdraw', 'cancel'].includes(d.value) && key !== 'validacao_rm' ? 'red' : 'orange');
    const correction = d.value.startsWith('return') || d.value === 'correction';
    const label = d.value === 'retry' ? 'Reintegrar' : d.value === 'cancel' ? 'Cancelar Admissão' : d.value === 'withdraw' ? 'Registrar Desistência' : d.value === 'reject' ? key === 'validacao_rm' ? 'Enviar para Nova Validação' : 'Reprovar Admissão' : correction ? 'Retornar para Correção' : ({ preparacao: 'Encaminhar para Coleta', coleta: 'Enviar para Validação de Dados e Documentos', validacao: 'Enviar Decisão', validacao_final: 'Enviar Decisão', assinaturas: 'Encaminhar para Integração', validacao_rm: 'Enviar Decisão' })[key];
    const action = ({ preparacao: 'prepare', coleta: 'collect', tratamento: 'retry', assinaturas: 'finish', tratamento_tae: 'retry-tae', validacao_rm: 'review-rm', tratamento_ti: 'retry-ti' })[key] || 'review';
    return fieldset(isTreatment(key) ? 'Decisão do Tratamento' : 'Decisão de Aprovação', 'clipboard-check', approvalChoices(options, d.value, 'decision.' + key, key) + field({ key: 'note', label: key === 'preparacao' ? 'Observação da Preparação' : 'Observação', type: 'textarea', required: !['approve', 'retry'].includes(d.value), wide: true }, 'decisions.' + key, d)) + actions(action, label);
  }
  function validation(key) {
    if (key !== 'validacao_final' || !state.functional.active) return decision(key);
    return fieldset(state.rm.employeeId ? 'Correção após Integração no RM' : 'Correção para Envio ao TAE', 'rotate-left', readGrid([['Inconsistência Identificada', state.functional.note, true], ...(state.rm.employeeId ? [['Cadastro no RM', state.rm.employeeId], ['Chapa', state.rm.chapa]] : [])]) + field({ key: 'adjustments', label: 'Ajustes Realizados', type: 'textarea', required: true }, 'functional')) + preparation() + collection(false, state.form, state.files, false, 'functional') + fieldset('Documentos Impactados pela Correção', 'file-signature', '<div data-signature-impact>' + signatureImpactSummary() + '</div><p class="lx-admission-block-description">A revisão considera os dados presentes em cada documento. Os documentos alterados serão gerados novamente e enviados ao TAE.</p>') + decision(key);
  }
  function exam(readonly = false, data = state.medical, files = state.files) {
    const defs = [simple('encaminhamento', 'Data do Encaminhamento', true, 'date'), simple('prevista', 'Data Prevista do Exame', true, 'date'), simple('realizacao', 'Data de Realização', true, 'date')];
    const result = readonly ? readGrid([['Resultado', data.resultado]]) : approvalChoices([['Apto', 'Apto', 'Encaminhar a admissão para validação final do RH / DP.', 'approve'], ['Inapto', 'Inapto', 'Encerrar a admissão conforme o resultado do exame admissional.', 'reject'], ['Desistência', 'Desistência', 'Registrar a desistência do candidato e encerrar a admissão.', 'reject']], data.resultado, 'medical.resultado');
    const epi = fieldset('Equipamentos de Proteção Individual — EPI', 'helmet-safety', radios('Necessita EPI?', 'medical.utilizaEpi', ['Sim', 'Não'], data.utilizaEpi || 'Não', readonly) + (data.utilizaEpi === 'Sim' ? equipmentRows('epis', readonly, data, 'medical', A.catalog.epi) + attachments('epi', !readonly, files.epi || []) : '') + fields([{ key: 'epiObs', label: 'Observações de EPI', type: 'textarea', wide: true }], 'medical', data, readonly), readonly);
    return block('Exame Admissional', 'stethoscope', defs, readonly, data, 'medical') + fieldset('Guia de Encaminhamento', 'file-medical', attachments('guia', !readonly, files.guia || []), readonly) + fieldset('ASO — Atestado de Saúde Ocupacional', 'file-circle-check', attachments('aso', !readonly, files.aso || []), readonly) + epi + fieldset('Resultado do Exame', 'clipboard-check', result + fields([{ key: 'observacao', label: 'Observações', type: 'textarea', required: true, wide: true }], 'medical', data, readonly), readonly) + (readonly ? '' : actions('exam', data.resultado === 'Desistência' ? 'Registrar Desistência' : data.resultado === 'Inapto' ? 'Encerrar Admissão' : correctionContext() ? 'Reenviar para ' + meta(correctionContext().returnTo).title : 'Encaminhar para Validação Final'));
  }
  function effectiveRM() { return preview() && ['validacao_rm', 'nova_validacao', 'notificacao_ti', 'tratamento_ti', 'finalizada'].includes(stage) && state.rm.status === 'Não iniciada' ? { ...state.rm, status: 'Integrada com sucesso', attempts: 1, employeeId: 'RM-001475', chapa: '001475', at: '16/10/2026, 10:00:00', message: 'Colaborador incluído e documentos assinados disponibilizados no TOTVS RM.' } : state.rm; }
  function rmSummary(rm, readonly = false) { return fieldset('Integração da Admissão', 'arrows-rotate', readGrid([['Status da Integração', rm.status], ['Data / Hora', rm.at || state.created], ...(rm.chapa ? [['Chapa', rm.chapa]] : []), ['Mensagem de Retorno', rm.message, true], ...(rm.error ? [['Detalhes do Erro', rm.error, true]] : [])]), readonly); }
  function treatment() {
    const rm = { ...state.rm, status: 'Erro', at: state.rm.at || (preview() ? '16/10/2026, 10:00:00' : state.created), message: state.rm.message || 'Não foi possível concluir o envio dos documentos.', error: state.rm.error || 'O serviço de documentos do RM não respondeu. Confira o retorno e solicite novo processamento.' };
    return rmSummary(rm) + decision('tratamento');
  }
  function signatureContent(tae, readonly = false) {
    const complete = signed(tae);
    const status = complete ? 'Assinado' : tae.documents.find(doc => ['Rejeitado', 'Cancelado', 'Erro'].includes(doc.status))?.status || (['Erro', 'Rejeitado', 'Cancelado', 'Não enviado', 'Em processamento'].includes(tae.status) ? tae.status : 'Pendente');
    return fieldset('Envio para Assinatura Fluig / TAE', 'paper-plane', readGrid([['Origem dos Documentos', 'Fluig'], ['Plataforma de Assinatura', 'TAE'], ['Data de Envio', tae.sentAt], ['Responsável pelo Acompanhamento', 'Juliana Costa'], ['Status dos Documentos', status]], 'lx-signing-summary-grid lx-signing-overview-grid'), readonly) + tae.documents.map(doc => fieldset(doc.name, 'file-signature', readGrid([['Documento', doc.file.name], ['Plataforma', 'TAE'], ['Protocolo do Documento', doc.protocol], ['Data do Envio', doc.sentAt], ['Última Atualização', doc.updatedAt || doc.completedAt || doc.sentAt], ['Status do Documento', doc.status === 'Assinado' ? 'Assinado' : ['Rejeitado', 'Cancelado', 'Erro', 'Não enviado'].includes(doc.status) ? doc.status : 'Pendente']], 'lx-signing-summary-grid') + '<div class="lx-signature-tracking">' + doc.signers.map(signer => '<article class="lx-signing-person"><div class="lx-admission-child-head"><strong>' + esc(signer.role) + '</strong><span class="lx-signing-status' + (signer.status === 'Assinado' ? ' is-signed' : '') + '">' + icon(signer.status === 'Assinado' ? 'circle-check' : 'clock') + ' ' + esc(signer.status) + '</span></div>' + readGrid([['Nome', signer.name], ['E-mail', signer.email], ['Assinou o Documento?', signer.status === 'Assinado' ? 'Sim' : 'Não'], ['Data da Assinatura', signer.date || 'Aguardando assinatura']], 'lx-signing-person-grid') + '</article>').join('') + '</div>' + attachments('tae-' + doc.id, false, [doc.file]), readonly)).join('') + fieldset('Observações do Acompanhamento', 'comment-dots', readonly ? readGrid([['Observações', tae.observation, true]]) : field({ key: 'observation', label: 'Observações', type: 'textarea', wide: true }, 'tae'), readonly);
  }
  function effectiveTAE() { return preview() ? { ...clone(state.tae), status: 'Enviado', sentAt: '16/10/2026, 10:00:00', documents: A.documentSignatures(state.form, state.files, params.get('cenario') === 'assinado' || ['integracao', 'tratamento', 'validacao_rm', 'notificacao_ti', 'tratamento_ti', 'finalizada'].includes(stage)) } : state.tae; }
  function signatures() { return signatureContent(effectiveTAE()) + decision('assinaturas'); }
  function taeSummary(tae = state.tae, readonly = false) { return fieldset('Envio de Documentos — Fluig / TAE', 'paper-plane', readGrid([['Origem dos Documentos', 'Fluig'], ['Plataforma de Assinatura', 'TAE'], ['Status do Envio', tae.status], ['Data / Hora', tae.attemptedAt || tae.sentAt || state.created], ['Mensagem do Envio', tae.message || 'Não foi possível concluir o envio dos documentos para assinatura no TAE.', true], ...(tae.error ? [['Detalhes do Erro', tae.error, true]] : [])]), readonly); }
  function sendSignatures() {
    const tae = preview() && stage === 'tratamento_tae' ? { ...state.tae, status: 'Erro', attemptedAt: state.tae.attemptedAt || '16/10/2026, 10:00:00', message: 'Não foi possível concluir o envio dos documentos para assinatura no TAE.', error: 'A plataforma TAE não confirmou o recebimento dos documentos.' } : state.tae;
    return taeSummary(tae) + decision(stage);
  }
  function rmEmployee(form, rm, readonly = false) {
    const data = rm.returnedData || form;
    return fieldset('Conferência do Cadastro no RM', 'user-check', readGrid([['Colaborador', data.nome], ['Chapa', rm.chapa], ['Data de Admissão', A.date(data.admissao)], ['Cargo', data.cargo], ['Função', data.funcao], ['Nível / Step', data.nivel], ['Setor / Seção', data.secao], ['Centro de Custo', data.centro], ['Descrição do Cargo', data.cargoDescricao || form.cargoDescricao, true]], 'lx-admission-rm-grid') + readGrid([['Sexo', data.sexo], ['Pessoa com Deficiência', data.pcd || form.pcd], ['Tipo de Contrato', data.contrato], ['Escala', data.escala], ['Horário', data.horario]], 'lx-admission-rm-details'), readonly);
  }
  function rmValidation() { return rmEmployee(state.form, effectiveRM()) + decision('validacao_rm'); }
  function notificationSummary(data = state.notification, readonly = false, infra = state.infrastructure, form = state.form) {
    return fieldset('Notificação de Infraestrutura à TI', 'envelope', readGrid([['Status do Envio', data.status], ['Destinatário', data.to], ['Data do Envio', data.at], ['Protocolo', data.protocol], ['Colaborador', form.nome], ['Cargo / Função', form.cargo + ' / ' + form.funcao], ['Área', form.secao], ['Gestor', form.gestor], ['Data Prevista de Início', A.date(form.admissao)], ['Equipamentos Previstos', (infra.equipamentos || []).map(item => item.quantidade + ' × ' + item.tipo + (item.observacoes ? ' — ' + item.observacoes : '')).join('; '), true], ['Observações', infra.observacoes, true], ...(data.error ? [['Detalhes do Erro', data.error, true]] : [])]), readonly);
  }
  function notificationView() {
    const data = preview() && stage === 'tratamento_ti' ? { ...state.notification, status: 'Erro', error: 'O serviço de e-mail não confirmou o envio da notificação à TI.' } : state.notification;
    return notificationSummary(data) + decision(stage);
  }
  function cancellationForm() { return fieldset('Cancelamento da Admissão', 'ban', field({ key: 'motivo', label: 'Motivo do Cancelamento', required: true, options: ['Candidato desistiu', 'Inapto no exame admissional', 'Contratação cancelada', 'Inconsistência impeditiva', 'Decisão do RH / DP'] }, 'cancellation') + field({ key: 'justificativa', label: 'Justificativa', required: true, type: 'textarea' }, 'cancellation')); }
  function ending(cancelled = false) {
    if (cancelled) {
      const cancellation = state.current === 'cancelada' ? state.cancellation : { motivo: 'Inapto no exame admissional', justificativa: 'O resultado Inapto registrado pelo SESMT impede a continuidade da contratação.', responsible: A.owners.sesmt, date: state.created };
      return '<div class="lx-history-stage lx-history-stage-red">Solicitação de admissão encerrada como cancelada. ' + esc(cancellation.justificativa || cancellation.motivo) + '</div>';
    }
    const rm = effectiveRM();
    return '<div class="lx-history-stage lx-history-stage-green">Admissão de <strong>' + esc(state.form.nome) + '</strong> concluída após a conferência dos dados, do exame admissional, da integração com o TOTVS RM e das assinaturas. Chapa <strong>' + esc(rm.chapa || '—') + '</strong>.</div>';
  }
  function correctionContext() {
    if (state.returnRequest?.target === stage && state.returnRequest.returnTo && ['coleta', 'sesmt'].includes(stage)) return state.returnRequest;
    if (!state.started && stage === 'coleta' && params.get('cenario') === 'correcao-rm') return { from: 'tratamento', target: 'coleta', returnTo: 'tratamento', note: 'Conferir a seção e os documentos complementares antes de reprocessar a integração com o TOTVS RM.', responsible: A.owners.tratamento, date: state.created };
    return null;
  }
  function correctionPanel() {
    const context = correctionContext(); if (!context) return '';
    return fieldset('Correção da Solicitação', 'rotate-left', readGrid([['Etapa que Solicitou a Correção', meta(context.from).title], ['Responsável', context.responsible || A.owners[context.from]], ['Data da Devolução', context.date], ['Observação', context.note, true]]) + field({ key: 'adjustments', label: 'Descreva os Ajustes Realizados', required: true, type: 'textarea', wide: true }, 'correction', state.correction || { adjustments: '' }));
  }
  function previousStages(key) {
    const base = [state.form.origem === 'Manual' ? 'solicitacao' : 'preparacao', 'coleta', 'validacao', 'sesmt', 'validacao_final', 'enviar_assinatura', 'assinaturas', 'integracao', 'validacao_rm'];
    if (stage === 'tratamento_ti' || state.infrastructure.necessita === 'Sim' && state.infrastructure.equipamentos.length) base.push('notificacao_ti');
    if (key === 'coleta' && correctionContext()) return base.slice(0, base.indexOf('integracao') + 1).concat('tratamento');
    if (key === 'complementacao') return base.slice(0, base.indexOf(state.correction?.returnTo || 'validacao') + 1);
    if (key === 'tratamento') return base.slice(0, base.indexOf('integracao') + 1);
    if (key === 'tratamento_tae') return base.slice(0, base.indexOf('enviar_assinatura') + 1);
    if (key === 'tratamento_ti') return base;
    if (key === 'finalizada') return base;
    if (key === 'cancelada') return state.started ? [] : base.slice(0, base.indexOf('sesmt') + 1);
    return base.slice(0, Math.max(0, base.indexOf(key)));
  }
  function exampleRecord(key) {
    const data = { form: clone(state.form), files: clone(state.files), infrastructure: clone(state.infrastructure), notification: { ...clone(state.notification), status: 'Enviada', at: state.created, protocol: 'TI-ADM-2026-0043' }, medical: { ...clone(state.medical), approved: true }, rm: { ...effectiveRM(), status: 'Integrada com sucesso', employeeId: 'RM-001475', chapa: '001475', attempts: 1, message: 'Admissão integrada com sucesso.', at: state.created }, tae: { ...clone(state.tae), status: 'Enviado', sentAt: state.created, documents: A.documentSignatures(state.form, state.files, true) }, decision: { value: 'approve', note: 'Etapa aprovada sem ressalvas.' } };
    if (stage === 'tratamento_tae' && key === 'enviar_assinatura') Object.assign(data.tae, { status: 'Erro', error: 'A plataforma TAE não confirmou o recebimento dos documentos.' });
    if (stage === 'tratamento_ti' && key === 'notificacao_ti') Object.assign(data.notification, { status: 'Erro', error: 'O serviço de e-mail não confirmou o envio.' });
    if (key === 'preparacao') data.decision.note = 'Etapa aprovada sem ressalvas.';
    if (stage === 'complementacao' && key === (state.correction?.returnTo || 'validacao')) data.decision = { value: 'return', note: 'Complementar o comprovante de residência e confirmar os dados bancários antes de reenviar.' };
    if (stage === 'cancelada' && key === 'sesmt') { data.medical.resultado = 'Inapto'; data.medical.observacao = 'Resultado Inapto informado no ASO. Admissão encerrada pelo SESMT.'; }
    if (stage === 'tratamento' && key === 'integracao') Object.assign(data.rm, { status: 'Erro', employeeId: '', chapa: '', error: 'O serviço de documentos do RM não respondeu.', message: 'Não foi possível concluir o envio dos documentos.' });
    if (correctionContext() && ['integracao', 'tratamento'].includes(key)) { Object.assign(data.rm, { status: 'Erro', message: 'Não foi possível concluir o envio dos documentos.', error: correctionContext().note }); if (key === 'tratamento') data.decision = { value: 'return_coleta', note: correctionContext().note }; }
    return { id: 'exemplo-' + key, area: key, action: data.decision.value.startsWith('return') ? 'Correção solicitada' : 'Atividade concluída', responsible: A.owners[key], date: state.created, revision: state.revision, data };
  }
  function recordBody(record) {
    const d = record.data;
    const evidence = { ...d, decision: d.decision || { value: record.action.includes('cancelad') ? 'cancel' : record.action.includes('correção') ? 'return' : 'approve', note: record.note || 'Etapa aprovada sem ressalvas.' } };
    switch (record.area) {
      case 'solicitacao': return preparation(true, d.form, d.files, 'solicitacao', d.infrastructure || { origem: 'Não informada', necessita: 'Não', equipamentos: [] });
      case 'preparacao': return preparation(true, d.form, d.files, 'preparacao', d.infrastructure || { origem: 'Não informada', necessita: 'Não', equipamentos: [] }) + decision('preparacao', true, { ...d, decision: d.decision || { value: 'approve', note: record.note || 'Etapa aprovada sem ressalvas.' } }, record.responsible);
      case 'coleta': case 'complementacao': return (record.note ? fieldset('Ajustes Realizados', 'comment-dots', readGrid([['Observações', record.note, true]]), true) : '') + collection(true, d.form, d.files, record.area === 'complementacao' || d.returnRequest?.target === 'coleta', 'history-' + record.id, d.infrastructure) + (record.area === 'coleta' ? decision('coleta', true, evidence, record.responsible) : '');
      case 'validacao': return decision(record.area, true, evidence, record.responsible);
      case 'validacao_final': return (d.functional?.active ? fieldset('Ajustes da Validação Final', 'rotate-left', readGrid([['Inconsistência Identificada', d.functional.note, true], ['Ajustes Realizados', d.functional.adjustments, true]]), true) + preparation(true, d.form, d.files, record.area, d.infrastructure) + collection(true, d.form, d.files, false, 'history-' + record.id) : '') + decision(record.area, true, evidence, record.responsible);
      case 'sesmt': return exam(true, d.medical, d.files);
      case 'integracao': return rmSummary(d.rm, true);
      case 'tratamento': return rmSummary(d.rm, true) + decision(record.area, true, evidence, record.responsible);
      case 'assinaturas': return signatureContent(d.tae, true) + decision('assinaturas', true, evidence, record.responsible);
      case 'enviar_assinatura': return taeSummary(d.tae, true);
      case 'tratamento_tae': return taeSummary(d.tae, true) + decision(record.area, true, evidence, record.responsible);
      case 'validacao_rm': return rmEmployee(d.form, d.rm, true) + decision(record.area, true, evidence, record.responsible);
      case 'notificacao_ti': case 'tratamento_ti': return notificationSummary(d.notification, true, d.infrastructure, d.form);
      default: return readGrid([['Movimentação', record.action], ['Observações', record.note || '—', true]]);
    }
  }
  function renderHistory() {
    if (stage === 'solicitacao' && !state.started) return '';
    const previous = previousStages(stage);
    const records = state.started ? state.history.filter(record => stage === state.current || ['finalizada', 'cancelada'].includes(stage) || previous.includes(record.area)) : previous.map(key => exampleRecord(key));
    return records.filter(record => record.area !== 'nova_validacao' && !record.area.startsWith('tratamento') && (!meta(record.area).automatic || record.area === 'notificacao_ti') && !(record.area === 'solicitacao' && state.form.origem !== 'Manual') && !(record.area === 'preparacao' && state.form.origem === 'Manual')).map(record => panel(record.area, recordBody(record), true, record.date + ' - ' + record.responsible + ' - ' + (record.area === 'sesmt' ? 'SESMT' : meta(record.area).automatic ? 'Automática' : 'RH / DP') + ' · ' + record.action, 'history-' + record.id)).join('');
  }
  function render() {
    views.length = 0;
    fieldSequence = 0;
    if (app && meta(stage).automatic && (!state.started || state.current !== stage)) {
      stage = ({ integracao: 'validacao_rm', enviar_assinatura: 'assinaturas', notificacao_ti: 'finalizada' })[stage];
      history.replaceState(null, '', href(stage));
    }
    document.getElementById('statusLabel').textContent = stage === 'finalizada' ? 'Admitido' : stage === 'cancelada' ? 'Admissão Cancelada' : stage === 'solicitacao' && !state.started ? 'Em Preenchimento' : A.status(state);
    if (!app) {
      const entries = A.stages.filter(item => item.key !== 'complementacao' && !item.automatic).flatMap(item => item.key === 'coleta' ? [item, { ...item, title: 'Correção de Admissão', icon: 'rotate-left', tone: 'orange', scenario: 'correcao-rm', description: 'Corrigir os dados após devolução pelo Tratamento da Integração TOTVS RM.' }] : [item]);
      document.getElementById('stageNav').innerHTML = entries.map(item => '<a class="lx-stage-card" href="' + href(item.key, item.key === 'solicitacao' ? '&origem=manual' : item.key === 'preparacao' ? '&origem=selecao' : item.scenario ? '&cenario=' + item.scenario : '') + '"><span class="lx-stage-icon lx-dot-' + item.tone + '">' + icon(item.icon) + '</span><div><h3>' + esc(item.navTitle || item.title) + '</h3><p>' + esc(item.description) + '</p></div></a>').join('');
      return;
    }
    let body = '';
    const returned = state.returnRequest?.target === stage ? '<div class="lx-alert">' + icon('rotate-left') + '<div><strong>Correção solicitada em ' + esc(meta(state.returnRequest.from).title) + '</strong><p>' + esc(state.returnRequest.note) + '</p></div></div>' : '';
    if (stage === 'solicitacao') body = returned + preparation() + actions('submit-request', 'Encaminhar para Coleta e Preenchimento');
    if (stage === 'preparacao') body = returned + preparation() + decision('preparacao');
    if (stage === 'coleta') body = correctionPanel() + collection(false, state.form, state.files, !!correctionContext()) + decision('coleta');
    if (stage === 'complementacao') {
      state.correction ??= { returnTo: 'validacao', note: 'Complementar o comprovante de residência e confirmar os dados bancários.', adjustments: 'Comprovante atualizado e dados bancários conferidos com o candidato.', before: clone(state.form) };
      body = fieldset('Pendência para Complementação', 'comment-dots', readGrid([['Etapa que Solicitou', meta(state.correction.returnTo).title], ['Parecer / Observação', state.correction.note, true]])) + collection(false, state.form, state.files, true) + fieldset('Ajustes Realizados', 'pen-to-square', field({ key: 'adjustments', label: 'Descreva a Complementação', required: true, type: 'textarea', wide: true }, 'correction')) + actions('correct', 'Reenviar para Validação');
    }
    if (['validacao', 'validacao_final'].includes(stage)) body = returned + validation(stage);
    if (stage === 'sesmt') body = correctionPanel() + exam();
    if (stage === 'tratamento') body = returned + treatment();
    if (stage === 'assinaturas') body = signatures();
    if (stage === 'tratamento_tae') body = returned + sendSignatures();
    if (stage === 'validacao_rm') body = rmValidation();
    if (stage === 'tratamento_ti') body = notificationView();
    if (stage === 'finalizada') body = ending();
    if (stage === 'cancelada') body = ending(true);
    app.innerHTML = renderHistory() + (meta(stage).automatic ? '<p class="lx-admission-block-description" role="status">Processando o encaminhamento da admissão...</p>' : panel(stage, body));
    applyErrors();
    if (state.current === 'integracao' && state.started && (state.rm.authorized || state.rm.status === 'Em processamento')) queueIntegration();
    if (state.started && state.current === 'enviar_assinatura' && (state.tae.authorized || state.tae.status === 'Em processamento')) queueTAE();
    if (state.started && state.current === 'notificacao_ti' && (state.notification.authorized || state.notification.status === 'Em processamento')) queueNotification();
  }
  function snapshot() { return clone({ form: state.form, files: state.files, infrastructure: state.infrastructure, notification: state.notification, functional: state.functional, rmReview: state.rmReview, fileEvents: state.fileEvents || [], medical: state.medical, rm: state.rm, tae: state.tae, validation: state.validation, cancellation: state.cancellation, correction: state.correction, returnRequest: state.returnRequest }); }
  function log(area, action, note = '', decisionValue = null) {
    const data = snapshot(); if (decisionValue) data.decision = clone(decisionValue);
    state.history.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), area, action, note, responsible: A.owners[area] || A.owners.coleta, date: A.now(), revision: state.revision, data });
  }
  function allowed() {
    if (editable()) return true;
    feedback('Conclua a atividade atual: ' + meta(state.current).title + '.', true); return false;
  }
  function adoptPreview() {
    const context = correctionContext();
    if (!state.started && stage !== 'solicitacao') {
      previousStages(stage).forEach(key => state.history.push(exampleRecord(key)));
      const order = previousStages(stage);
      if (order.includes('validacao')) state.validation.dados = true;
      if (order.includes('sesmt')) state.medical.approved = true;
      if (order.includes('validacao_final')) state.validation.final = true;
      if (order.includes('enviar_assinatura') && !context) {
        state.tae = clone(effectiveTAE());
        state.tae.documents.forEach(doc => { doc.fingerprint = documentFingerprint(doc.id); });
      }
      if (order.includes('integracao') && !['tratamento', 'coleta'].includes(stage)) { state.rm = clone(effectiveRM()); state.rm.payloadFingerprint = JSON.stringify(integrationPayload()); }
      if (order.includes('validacao_rm') && stage !== 'coleta') state.validation.rm = true;
      if (stage === 'tratamento' && state.rm.status === 'Não iniciada') Object.assign(state.rm, { status: 'Erro', attempts: 1, at: state.created, message: 'Não foi possível concluir o envio dos documentos.', error: 'O serviço de documentos do RM não respondeu.' });
      if (context) { state.returnRequest = clone(context); state.validation.dados = true; state.validation.final = true; state.medical.approved = true; state.rm.status = 'Erro'; state.rm.error = context.note; }
    }
    state.started = true;
  }
  function requireField(def, prefix = 'form') {
    const path = prefix + '.' + def.key;
    const value = String(get(path) ?? '').trim();
    if (def.required && !value) errors[path] = 'Campo obrigatório.';
    if (value && def.options && !def.options.includes(value)) errors[path] = 'Selecione um valor da lista.';
    if (value && def.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[path] = 'Informe um e-mail válido.';
    if (value && (def.mask === 'cpf' || def.key === 'cpf') && value.replace(/\D/g, '').length !== 11) errors[path] = 'Informe o CPF com 11 dígitos.';
    if (value && def.type === 'money' && (!A.money(value) || Number(A.money(value).replace(/[^\d,]/g, '').replace(',', '.')) <= 0)) errors[path] = 'Informe um valor maior que zero.';
    if (value && def.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) <= 0)) errors[path] = 'Informe um número maior que zero.';
    if (value && def.integer && !Number.isInteger(Number(value))) errors[path] = 'Informe uma quantidade inteira maior que zero.';
  }
  function validatePreparation() {
    [...A.definitions.identity, ...A.definitions.hiring].forEach(def => requireField(def));
    ['vaga', 'requisicao', 'selecao', ...(state.form.origem === 'Manual' ? [] : ['candidato'])].forEach(key => requireField(simple(key, key)));
    if (state.form.origem === 'Manual') requireField(simple('vagaSelecionada', 'Vagas em Aberto', true, 'text', A.vacancies.map(item => item.id)));
    if (state.infrastructure.necessita === 'Sim') {
      if (!state.infrastructure.equipamentos.length) errors['infrastructure.equipamentos'] = 'Adicione ao menos um equipamento.';
      state.infrastructure.equipamentos.forEach((item, index) => ['tipo', 'quantidade'].forEach(key => requireField(simple(key, key, true, key === 'quantidade' ? 'number' : 'text'), 'infrastructure.equipamentos.' + index)));
    }
  }
  function validateCollection() {
    validatePreparation();
    if (state.rm.employeeId && state.rm.identityCpf && state.form.cpf.replace(/\D/g, '') !== state.rm.identityCpf.replace(/\D/g, '')) errors['form.cpf'] = 'O RM já retornou um cadastro para esta admissão. Mantenha a identificação do candidato para reprocessar.';
    collectionSections(state.form).forEach(section => section.defs.forEach(def => requireField(def)));
    for (const [flag, scope] of [['temDependentes', 'dependentes'], ['transporte', 'transportes'], ['seguro', 'beneficiarios']]) {
      if (state.form[flag] !== 'Sim') continue;
      if (!state.form[scope].length) errors['form.' + scope] = 'Adicione ao menos um item.';
      state.form[scope].forEach((item, index) => childDefinitions(scope).forEach(def => requireField(def, 'form.' + scope + '.' + index)));
      if (scope === 'dependentes') state.form.dependentes.forEach(item => { if (!state.files['dependente-' + item.id]?.length) errors['files.dependente-' + item.id] = 'Anexe o documento do dependente.'; });
      if (scope === 'beneficiarios' && Math.abs(state.form.beneficiarios.reduce((total, item) => total + Number(item.percentual || 0), 0) - 100) > 0.01) errors['form.beneficiarios'] = 'A participação dos beneficiários deve totalizar 100%.';
    }
    state.form.beneficios.forEach((item, index) => childDefinitions('beneficios').filter(def => item.optante === 'Sim' || def.key === 'beneficio').forEach(def => requireField(def, 'form.beneficios.' + index)));
    A.documents.forEach(doc => { if (!state.files[doc.group]?.length) errors['files.' + doc.group] = 'Anexe o documento recebido do candidato.'; });
    if (!state.form.documentosAssinatura.length) errors['form.documentosAssinatura'] = 'Adicione ao menos um documento para assinatura.';
    state.form.documentosAssinatura.forEach((doc, index) => {
      const prefix = 'form.documentosAssinatura.' + index;
      requireField(simple('nome', 'Nome do Documento'), prefix);
      if (!state.files['assinatura-' + doc.id]?.length) errors['files.assinatura-' + doc.id] = 'Anexe o documento para assinatura.';
      if (!doc.signatarios.length) errors[prefix + '.signatarios'] = 'Adicione ao menos um signatário.';
      doc.signatarios.forEach((person, personIndex) => [simple('nome', 'Nome'), simple('email', 'E-mail', true, 'email'), { ...simple('cpf', 'CPF'), mask: 'cpf' }].forEach(def => requireField(def, prefix + '.signatarios.' + personIndex)));
    });
  }
  function validateMedical() {
    ['encaminhamento', 'prevista', 'realizacao', 'resultado', 'observacao'].forEach(path => requireField(simple(path, path), 'medical'));
    requireField(simple('utilizaEpi', 'Necessita EPI?', true, 'text', ['Sim', 'Não']), 'medical');
    if (!state.files.aso?.length) errors['files.aso'] = 'Anexe o ASO com o resultado do exame admissional.';
    if (state.medical.realizacao < state.medical.encaminhamento) errors['medical.realizacao'] = 'A realização deve ser igual ou posterior ao encaminhamento.';
    if (state.medical.utilizaEpi === 'Sim') {
      if (!state.medical.epis.length) errors['medical.epis'] = 'Adicione ao menos um EPI.';
      state.medical.epis.forEach((item, index) => childDefinitions('epis').forEach(def => requireField(def, 'medical.epis.' + index)));
    }
  }
  function applyErrors() {
    const current = app?.querySelector('.lx-view-shell:not(.lx-view-shell-history)');
    if (!current) return;
    current.querySelectorAll('.lx-error-message').forEach(node => node.remove());
    current.querySelectorAll('.lx-error').forEach(node => node.classList.remove('lx-error'));
    current.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
    Object.entries(errors).forEach(([key, message]) => {
      current.querySelectorAll('[data-wrap="' + key + '"]').forEach((wrap, index) => {
        wrap.classList.add('lx-error');
        const error = document.createElement('small'); error.className = 'lx-error-message'; error.id = 'error-' + slug(key) + '-' + index; error.textContent = message; error.setAttribute('role', 'alert'); wrap.append(error);
        wrap.querySelectorAll('input, textarea, select').forEach(control => { control.setAttribute('aria-invalid', 'true'); control.setAttribute('aria-describedby', error.id); });
      });
    });
  }
  function fail() {
    if (!Object.keys(errors).length) return false;
    applyErrors();
    const first = app.querySelector('.lx-view-shell:not(.lx-view-shell-history) .lx-error');
    if (first) {
      const block = first.closest('[data-collection-block]'); if (block) selectCollectionTab(block.dataset.collectionBlock, block.closest('[data-collection-id]'));
      let parent = first.parentElement; while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const control = first.querySelector('input:not([type="hidden"]):not([readonly]), select, textarea:not([readonly]), button'); control?.focus({ preventScroll: true });
    } else feedback(Object.values(errors)[0], true);
    return true;
  }
  function clearError(path) { if (Object.hasOwn(errors, path)) { delete errors[path]; if (app) applyErrors(); } }
  function requestCancellation(reason = '', decisionValue = 'reject') {
    if (reason) state.cancellation.motivo = reason;
    modal('Cancelar Admissão?', cancellationForm(), () => {
      if (!state.cancellation.motivo || !state.cancellation.justificativa.trim()) return;
      adoptPreview(); state.cancellation.responsible = A.owners[stage]; state.cancellation.date = A.now();
      log(stage, decisionValue === 'cancel' ? 'Admissão cancelada' : decisionValue === 'withdraw' ? 'Desistência registrada' : 'Admissão reprovada', state.cancellation.justificativa, { value: decisionValue, note: state.cancellation.justificativa });
      state.current = 'cancelada'; save(); go('cancelada');
    }, 'Cancelar Admissão', 'ban');
  }
  function signed(tae) { return tae.documents.length > 0 && tae.documents.every(doc => doc.status === 'Assinado' && doc.completedAt && doc.signers.length > 0 && doc.signers.every(signer => signer.status === 'Assinado' && signer.date)); }
  function integrationPayload() {
    const form = state.form;
    const definitions = [...A.definitions.identity, ...A.definitions.hiring, ...collectionSections(form).flatMap(section => section.defs)];
    const data = Object.fromEntries(definitions.map(def => [def.key, clone(form[def.key] ?? '')]));
    return { ...data, cargoDescricao: form.cargoDescricao, solicitacao: state.id, revisao: state.revision, origem: form.origem, vaga: form.vaga, requisicao: form.requisicao, selecao: form.selecao, candidato: form.candidato, pcd: form.pcd, primeiroEmprego: form.primeiroEmprego,
      dependentes: form.temDependentes === 'Sim' ? clone(form.dependentes) : [], transportes: form.transporte === 'Sim' ? clone(form.transportes) : [],
      beneficios: form.beneficios.map(item => item.optante === 'Sim' ? clone(item) : { id: item.id, beneficio: item.beneficio, optante: 'Não' }), beneficiariosSeguro: form.seguro === 'Sim' ? clone(form.beneficiarios) : [] };
  }
  function documentFingerprint(id) {
    const payload = integrationPayload();
    ['solicitacao', 'revisao', 'origem', 'vaga', 'requisicao', 'selecao', 'candidato', 'contratacaoObs'].forEach(key => delete payload[key]);
    payload.salario = A.money(payload.salario);
    const select = keys => Object.fromEntries(keys.map(key => [key, payload[key] ?? '']));
    const hiringKeys = A.definitions.hiring.filter(def => def.type !== 'textarea').map(def => def.key);
    const personalKeys = [...A.definitions.personal, ...A.definitions.address, ...A.definitions.term, ...A.definitions.legal].map(def => def.key);
    const doc = state.form.documentosAssinatura.find(item => item.id === id);
    const data = id === 'tae-0' ? select([...new Set([...hiringKeys, ...personalKeys, 'cpf', 'email'])]) : id === 'tae-2' ? select(['nome', 'cpf', 'admissao', 'empresa', 'filial', 'dependentes', 'beneficios', 'transportes', 'beneficiariosSeguro']) : payload;
    return JSON.stringify({ data, nome: doc?.nome || '', signatarios: doc?.signatarios || [], arquivos: (state.files['assinatura-' + id] || []).map(file => ({ id: file.id, name: file.name })) });
  }
  function impactedDocuments() { return state.form.documentosAssinatura.filter(item => { const doc = state.tae.documents.find(doc => doc.id === item.id); return !doc?.fingerprint || doc.fingerprint !== documentFingerprint(item.id); }).map(doc => doc.id); }
  function signatureImpactSummary() { const impacted = impactedDocuments(); return readGrid(state.form.documentosAssinatura.map(doc => [doc.nome, impacted.includes(doc.id) ? 'Regenerar e coletar novas assinaturas' : 'Assinaturas preservadas'])); }
  function signaturesCurrent() { return signed(state.tae) && state.tae.documents.length === state.form.documentosAssinatura.length && !impactedDocuments().length; }
  function admissionReady() { return state.validation.dados && state.validation.final && state.medical.approved && state.medical.resultado === 'Apto' && state.files.aso?.length && (state.medical.utilizaEpi !== 'Sim' || state.medical.epis.length > 0); }
  function queueTAE() {
    if (serviceTimer || state.current !== 'enviar_assinatura' || (!state.tae.authorized && state.tae.status !== 'Em processamento')) return;
    if (!admissionReady()) { feedback('Conclua as validações e o exame admissional antes do envio ao TAE.', true); return; }
    const revision = state.revision;
    if (state.tae.status !== 'Em processamento') {
      Object.assign(state.tae, { status: 'Em processamento', authorized: false, error: '', attemptedAt: A.now(), message: 'Documentos em preparação para envio ao TAE.', attempts: state.tae.attempts + 1 }); save();
    }
    serviceTimer = setTimeout(() => {
      serviceTimer = null;
      if (state.current !== 'enviar_assinatura' || state.revision !== revision || state.tae.status !== 'Em processamento') return;
      try {
        if (state.tae.failNext) { state.tae.failNext = false; throw new Error('A plataforma TAE não confirmou o recebimento dos documentos. Confira o retorno e reprocesse o envio.'); }
        const ledger = JSON.parse(localStorage.getItem(A.TAE_STORE) || '{}');
        const envelopes = ledger[state.id] ||= {};
        const templates = A.documentSignatures(state.form, state.files);
        state.tae.documents = templates.map(template => {
          const doc = state.tae.documents.find(item => item.id === template.id) || template;
          const fingerprint = documentFingerprint(doc.id);
          if (doc.fingerprint === fingerprint && doc.protocol && !['Rejeitado', 'Cancelado', 'Erro', 'Não enviado'].includes(doc.status)) return doc;
          const existing = envelopes[doc.id];
          if (existing?.fingerprint === fingerprint && !['Rejeitado', 'Cancelado', 'Erro'].includes(doc.status) && !['Rejeitado', 'Cancelado', 'Erro'].includes(existing.status)) return clone(existing);
          const stamp = A.now();
          const sent = { ...template, fingerprint, revision, status: 'Em assinatura', protocol: 'TAE-' + state.id + '-' + doc.id + '-R' + revision + '-' + state.tae.attempts, sentAt: stamp, updatedAt: stamp, completedAt: '', signers: template.signers.map(signer => ({ ...signer, status: 'Pendente', date: '' })), file: { ...template.file, date: stamp, by: 'Fluig / TAE' } };
          envelopes[doc.id] = clone(sent); return sent;
        });
        localStorage.setItem(A.TAE_STORE, JSON.stringify(ledger));
        Object.assign(state.tae, { status: 'Enviado', sentAt: A.now(), message: 'Documentos encaminhados diretamente do Fluig para assinatura no TAE.', error: '' });
        log('enviar_assinatura', 'Documentos enviados ao TAE', state.tae.message);
        state.current = 'assinaturas'; state.decisions.assinaturas = { value: 'approve', note: 'Acompanhar o retorno dos signatários no TAE.' }; save(); go(state.current);
      } catch (error) {
        Object.assign(state.tae, { status: 'Erro', authorized: false, message: 'Não foi possível concluir o envio dos documentos para assinatura no TAE.', error: error.message || 'Não foi possível registrar o retorno do TAE.' });
        log('enviar_assinatura', 'Erro no Envio ao TAE', state.tae.error); state.current = 'tratamento_tae'; save(); go(state.current);
      }
    }, 650);
    if (app && stage === 'enviar_assinatura') render();
  }
  function completeAdmission() {
    if (!admissionReady() || !signaturesCurrent() || state.rm.status !== 'Integrada com sucesso' || !state.rm.employeeId || !state.validation.rm || state.rm.payloadFingerprint !== JSON.stringify(integrationPayload()) || (state.infrastructure.necessita === 'Sim' && state.infrastructure.equipamentos.length && state.notification.status !== 'Enviada')) return false;
    state.current = 'finalizada'; state.endedAt = A.now(); state.endedBy = A.owners.finalizada; save(); go(state.current); return true;
  }
  function queueNotification() {
    if (serviceTimer || state.current !== 'notificacao_ti' || (!state.notification.authorized && state.notification.status !== 'Em processamento')) return;
    if (!state.validation.rm || !admissionReady() || !signaturesCurrent() || state.rm.payloadFingerprint !== JSON.stringify(integrationPayload())) { feedback('Valide o cadastro integrado no RM antes de notificar a TI.', true); return; }
    const revision = state.revision;
    if (state.notification.status !== 'Em processamento') Object.assign(state.notification, { status: 'Em processamento', authorized: false, error: '', attempts: state.notification.attempts + 1 });
    save();
    serviceTimer = setTimeout(() => {
      serviceTimer = null;
      if (state.current !== 'notificacao_ti' || state.revision !== revision || state.notification.status !== 'Em processamento') return;
      try {
        if (state.notification.failNext) { state.notification.failNext = false; throw new Error('O serviço de e-mail não confirmou o envio da notificação à TI.'); }
        const outbox = JSON.parse(localStorage.getItem(A.TI_STORE) || '{}');
        const key = state.id + '-R' + revision;
        const delivery = outbox[key] || { protocol: 'TI-' + key, at: A.now(), to: state.notification.to, subject: 'Infraestrutura para admissão — ' + state.form.nome, form: clone(state.form), infrastructure: clone(state.infrastructure), simulated: true };
        outbox[key] = delivery; localStorage.setItem(A.TI_STORE, JSON.stringify(outbox));
        Object.assign(state.notification, { status: 'Enviada', at: delivery.at, protocol: delivery.protocol, error: '' });
        log('notificacao_ti', 'Notificação à TI enviada', 'Equipamentos previstos encaminhados para preparação pela TI.');
        completeAdmission();
      } catch (error) {
        Object.assign(state.notification, { status: 'Erro', error: error.message || 'Não foi possível registrar o envio.' });
        log('notificacao_ti', 'Erro na notificação à TI', state.notification.error); state.current = 'tratamento_ti'; save(); go(state.current);
      }
    }, 650);
    if (app && stage === 'notificacao_ti') render();
  }
  function queueIntegration() {
    if (integrationTimer || state.current !== 'integracao' || (!state.rm.authorized && state.rm.status !== 'Em processamento')) return;
    if (state.rm.status !== 'Em processamento') {
      if (!admissionReady() || !signaturesCurrent()) {
        state.functional.active = true; state.functional.note = 'Conferir as validações, o ASO Apto e as assinaturas dos documentos atualizados antes da integração com o RM.';
        state.validation.final = false; state.rm.authorized = false; state.current = 'validacao_final'; save(); go(state.current); return;
      }
      state.rm.authorized = false; state.rm.status = 'Em processamento'; state.rm.attempts++; state.rm.at = A.now(); state.rm.error = ''; state.rm.message = 'Dados e documentos em processamento.'; save();
    }
    integrationTimer = setTimeout(() => {
      integrationTimer = null;
      if (state.current !== 'integracao' || state.rm.status !== 'Em processamento') return;
      try {
        const ledger = JSON.parse(localStorage.getItem(A.RM_STORE) || '{}');
        if (!admissionReady() || !signaturesCurrent()) throw new Error('Dados alterados após a assinatura. Retorne à Validação Final.');
        let employee = ledger[state.id];
        if (!employee && state.rm.employeeId) employee = { employeeId: state.rm.employeeId, chapa: state.rm.chapa, cpf: state.rm.identityCpf || state.form.cpf, processId: state.id, documents: [] };
        const updating = !!employee;
        const failed = state.rm.failNext || state.rm.failAfterEmployee;
        if (!state.rm.failNext && !employee) {
          const serial = Math.max(1474, ...Object.values(ledger).map(item => Number(item.chapa) || 0)) + 1;
          employee = { employeeId: 'RM-' + String(serial).padStart(6, '0'), chapa: String(serial).padStart(6, '0'), cpf: state.form.cpf, processId: state.id, documents: [] };
          ledger[state.id] = employee; localStorage.setItem(A.RM_STORE, JSON.stringify(ledger));
        }
        if (employee) Object.assign(state.rm, { employeeId: employee.employeeId, chapa: employee.chapa, identityCpf: employee.cpf });
        state.rm.failNext = false; state.rm.failAfterEmployee = false; state.rm.at = A.now();
        if (failed) {
          Object.assign(state.rm, { status: 'Erro', message: 'Não foi possível concluir a integração da admissão.', error: employee ? 'Cadastro localizado no RM. O envio documental não foi concluído. Reprocesse utilizando o identificador retornado.' : 'O serviço de admissão do RM não respondeu. Confira os dados e reprocese a operação.' });
          log('integracao', 'Erro na integração', state.rm.error); state.current = 'tratamento'; save(); go('tratamento');
        } else {
          employee.data = integrationPayload(); employee.documents = state.tae.documents.map(doc => ({ id: doc.file.id, name: doc.file.name, protocol: doc.protocol, revision: doc.revision, status: doc.status, completedAt: doc.completedAt })); ledger[state.id] = employee; localStorage.setItem(A.RM_STORE, JSON.stringify(ledger));
          Object.assign(state.rm, { status: 'Integrada com sucesso', operation: updating ? 'Atualizar colaborador existente e documentos assinados' : 'Incluir colaborador e documentos assinados', message: updating ? 'Cadastro existente atualizado e documentos assinados disponibilizados no TOTVS RM.' : 'Colaborador incluído e documentos assinados disponibilizados no TOTVS RM.', error: '', payloadFingerprint: JSON.stringify(integrationPayload()), returnedData: clone(employee.data) });
          state.validation.rm = false;
          log('integracao', 'Integração concluída', state.rm.message); state.decisions.validacao_rm = { value: 'approve', note: 'Conferir o cadastro incluído ou atualizado no TOTVS RM.' }; state.returnRequest = null; state.current = 'validacao_rm'; save(); go(state.current);
        }
      } catch (_) { Object.assign(state.rm, { status: 'Erro', message: 'Não foi possível concluir a integração da admissão.', error: 'Não foi possível registrar o retorno da integração neste navegador.' }); state.current = 'tratamento'; save(); go('tratamento'); }
    }, 650);
    if (app && stage === 'integracao') render();
  }
  async function action(node) {
    const key = node.dataset.action;
    if (key === 'file' || key === 'download') {
      const file = views[Number(node.dataset.source)]?.files[Number(node.dataset.index)];
      if (file) {
        if (key === 'download') modal('Baixar Anexo', '<p>' + esc(file.name) + '</p>', () => openFile(file, true), 'Baixar', 'download');
        else await openFile(file);
      }
      return;
    }
    if (key === 'draft') { modal('Salvar Rascunho?', '<p>Os dados preenchidos serão mantidos para continuar a atividade.</p>', () => { save(); feedback('Rascunho salvo.'); }, 'Salvar', 'floppy-disk'); return; }
    if (!allowed()) return;
    if (key === 'choose-file') { app.querySelector('[data-upload="' + node.dataset.group + '"]')?.click(); return; }
    if (key === 'delete-file') {
      const source = views[Number(node.dataset.source)], file = source?.files[Number(node.dataset.index)];
      if (file && source.editable) modal('Excluir Anexo?', '<p>' + esc(file.name) + '</p>', () => { state.files[source.group] = state.files[source.group].filter(item => item.id !== file.id); (state.fileEvents ??= []).push({ action: 'Anexo excluído', id: file.id, name: file.name, date: A.now(), responsible: A.owners[stage] }); save(); render(); }, 'Excluir', 'trash');
      return;
    }
    if (key === 'add-child') {
      const scope = node.dataset.scope, defaults = A.fresh('example'), parent = scope === 'epis' ? state.medical : scope === 'equipamentos' ? state.infrastructure : state.form, item = clone((scope === 'epis' ? defaults.medical : scope === 'equipamentos' ? defaults.infrastructure : defaults.form)[scope][0]); item.id = 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      (parent[scope] ??= []).push(item); if (scope === 'dependentes') state.files['dependente-' + item.id] = [A.fixed('documento-dependente.pdf', 'Juliana Costa', item.id)]; save(); render();
      const added = app.querySelector('.lx-view-shell:not(.lx-view-shell-history) [data-child-id="' + item.id + '"]');
      added?.scrollIntoView({ behavior: 'smooth', block: 'center' }); added?.querySelector('input:not([type="hidden"]):not([readonly]), select, textarea')?.focus({ preventScroll: true });
      return;
    }
    if (key === 'remove-child') { const scope = node.dataset.scope; modal('Remover Item?', '<p>Confirme a remoção deste registro.</p>', () => { (scope === 'epis' ? state.medical : scope === 'equipamentos' ? state.infrastructure : state.form)[scope].splice(Number(node.dataset.index), 1); save(); render(); }, 'Remover', 'trash'); return; }
    if (key === 'add-signature-document') {
      const doc = clone(A.fresh('example').form.documentosAssinatura[0]); doc.id = 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6); doc.nome = 'Documento Complementar de Admissão';
      doc.signatarios[0] = { id: 'candidato-' + doc.id, nome: state.form.nome, email: state.form.email, cpf: state.form.cpf };
      state.form.documentosAssinatura.push(doc); state.files['assinatura-' + doc.id] = [A.fixed('documento-admissional-1.pdf', 'Juliana Costa', doc.id)]; save(); render(); return;
    }
    if (key === 'add-signer') {
      const doc = state.form.documentosAssinatura[Number(node.dataset.document)];
      doc.signatarios.push({ id: 'signer-' + Date.now(), nome: 'Eduardo Martins', email: 'eduardo.martins@exemplo.com', cpf: '123.456.789-09' }); save(); render(); return;
    }
    if (['remove-signature-document', 'remove-signer'].includes(key)) {
      modal('Remover Registro?', '<p>Confirme a remoção deste registro.</p>', () => { const index = Number(node.dataset.document); if (key === 'remove-signer') state.form.documentosAssinatura[index].signatarios.splice(Number(node.dataset.person), 1); else state.form.documentosAssinatura.splice(index, 1); save(); render(); }, 'Remover', 'trash'); return;
    }
    if (key === 'cancel') { requestCancellation(); return; }
    errors = {};
    if (key === 'submit-request') {
      validatePreparation(); if (fail()) return;
      modal('Encaminhar Solicitação?', '<p>A admissão manual seguirá diretamente para Coleta e Preenchimento.</p>', () => {
        adoptPreview(); log('solicitacao', state.returnRequest ? 'Solicitação corrigida' : 'Solicitação registrada', state.form.solicitacaoObs);
        state.returnRequest = null; state.current = 'coleta'; state.decisions.coleta = { value: 'approve', note: 'Dados recebidos para coleta e preenchimento.' }; save(); go(state.current);
      }, 'Encaminhar', 'paper-plane'); return;
    }
    if (key === 'correct') {
      const context = { returnTo: state.correction?.returnTo || 'validacao' };
      validateCollection(); requireField(simple('adjustments', 'Descreva os Ajustes Realizados'), 'correction'); if (fail()) return;
      const target = ['integracao', 'tratamento'].includes(context.returnTo) && impactedDocuments().length ? 'validacao_final' : context.returnTo;
      modal('Reenviar Correção?', '<p>A solicitação retornará para ' + esc(meta(target).title) + '.</p>', () => {
        adoptPreview(); state.revision++; log(stage, 'Correção registrada', state.correction.adjustments, { value: 'approve', note: state.correction.adjustments });
        state.returnRequest = null; state.correction = null; state.decisions[target] = { value: 'approve', note: 'Ajustes recebidos para conferência.' };
        state.current = target; if (target === 'validacao_final') state.validation.final = false;
        if (target === 'validacao') { state.validation.dados = false; state.validation.final = false; state.validation.rm = false; state.rm.authorized = false; }
        if (target === 'integracao') Object.assign(state.rm, { status: 'Não iniciada', authorized: true });
        save(); go(target);
      }, 'Reenviar', 'paper-plane'); return;
    }
    if (key === 'exam') {
      if (state.medical.resultado === 'Desistência') {
        requireField(simple('observacao', 'Justificativa da Desistência'), 'medical'); if (fail()) return;
        state.cancellation.justificativa = state.medical.observacao; requestCancellation('Candidato desistiu', 'withdraw'); return;
      }
      const context = correctionContext(); validateMedical();
      if (context) requireField(simple('adjustments', 'Descreva os Ajustes Realizados'), 'correction');
      if (!preview() && !state.validation.dados) errors['medical.resultado'] = 'Valide os dados e documentos antes da análise do SESMT.';
      if (fail()) return;
      modal('Enviar Análise do SESMT?', '<p>' + (state.medical.resultado === 'Inapto' ? 'O resultado Inapto encerrará a admissão.' : 'A admissão seguirá para Validação Final do RH / DP.') + '</p>', () => {
        adoptPreview(); state.medical.approved = state.medical.resultado === 'Apto'; log('sesmt', context ? 'Exame corrigido — ' + state.medical.resultado : 'Resultado ' + state.medical.resultado, state.medical.observacao);
        if (!state.medical.approved) { state.cancellation = { motivo: 'Inapto no exame admissional', justificativa: state.medical.observacao, responsible: A.owners.sesmt, date: A.now() }; state.current = 'cancelada'; }
        else state.current = context ? context.returnTo : 'validacao_final';
        if (context) { state.returnRequest = null; state.correction = null; state.decisions[context.returnTo] = { value: 'approve', note: 'Exame, ASO e EPIs corrigidos pelo SESMT.' }; }
        save(); go(state.current);
      }, 'Enviar Análise', 'paper-plane'); return;
    }
    if (!['prepare', 'collect', 'review', 'review-rm', 'retry-tae', 'retry-ti', 'retry', 'finish'].includes(key)) return;
    const source = stage, d = clone(decisionData(source));
    if (!decisionOptions(source).some(option => option[0] === d.value)) errors['decision.' + source] = 'Selecione uma decisão.';
    if (!['approve', 'retry'].includes(d.value) && !d.note?.trim()) errors['decisions.' + source + '.note'] = 'Informe a observação.';
    if (['reject', 'withdraw', 'cancel'].includes(d.value) && !(source === 'validacao_rm' && d.value === 'reject')) {
      if (fail()) return; state.cancellation.justificativa = d.note;
      requestCancellation(d.value === 'withdraw' ? 'Candidato desistiu' : 'Contratação cancelada', d.value); return;
    }
    const target = decisionTarget(source, d.value);
    if (target) {
      if (fail()) return;
      modal('Retornar para Correção?', '<p>A admissão seguirá para ' + esc(meta(target).title) + '.</p>', () => {
        if (state.started && state.current !== source) return;
        adoptPreview(); log(source, 'Correção solicitada', d.note, d);
        state.revision++; state.validation.rm = false; state.rm.authorized = false;
        const returnTo = source === 'tratamento_tae' && target === 'sesmt' ? 'validacao_final' : source;
        state.returnRequest = { from: source, target, returnTo, note: d.note, responsible: A.owners[source], date: A.now() };
        state.correction = { returnTo, note: d.note, adjustments: '', before: clone(state.form) };
        if (['coleta', 'sesmt', 'validacao', 'validacao_final', 'solicitacao', 'preparacao'].includes(target)) state.validation.final = false;
        if (target === 'sesmt') state.medical.approved = false;
        if (target === 'validacao') state.validation.dados = false;
        if (target === 'coleta' && source === 'validacao') state.validation.dados = false;
        if (target === 'validacao_final') { state.functional.active = true; state.functional.note = d.note; state.returnRequest = null; state.correction = null; }
        state.decisions[target] = { value: 'approve', note: 'Conferir os ajustes solicitados: ' + d.note }; state.current = target; save(); go(target);
      }, 'Retornar para Correção', 'rotate-left'); return;
    }
    if (['prepare', 'collect', 'review', 'retry-tae', 'retry'].includes(key)) {
      if (key === 'prepare') validatePreparation(); else validateCollection();
    }
    if (key === 'collect' && correctionContext()) requireField(simple('adjustments', 'Descreva os Ajustes Realizados'), 'correction');
    if (key === 'review' && source === 'validacao_final') {
      if (state.functional.active) requireField(simple('adjustments', 'Ajustes Realizados'), 'functional');
      if (!preview() && (!state.validation.dados || !state.medical.approved || state.medical.resultado !== 'Apto' || !state.files.aso?.length)) errors['decision.' + source] = 'A validação final exige dados validados e ASO com resultado Apto.';
    }
    if (['retry-tae', 'retry'].includes(key) && !preview() && !admissionReady()) errors['decision.' + source] = 'Confira as validações e o ASO Apto antes do reprocessamento.';
    if (key === 'retry' && !preview() && !signaturesCurrent()) errors['decision.' + source] = 'Conclua as assinaturas dos documentos atualizados antes da integração com o RM.';
    if (key === 'finish') {
      if (!signed(effectiveTAE())) errors['tae.observation'] = 'Aguarde a conclusão das assinaturas de todos os documentos no TAE.';
      else if (!preview() && (!admissionReady() || !signaturesCurrent())) errors['tae.observation'] = 'Confira as validações, o ASO Apto e as assinaturas dos documentos atualizados.';
    }
    if (key === 'review-rm' && !preview() && (state.rm.status !== 'Integrada com sucesso' || !state.rm.employeeId || state.rm.payloadFingerprint !== JSON.stringify(integrationPayload()) || !signaturesCurrent())) errors['decision.' + source] = 'Confira a integração dos dados atuais e as assinaturas antes de aprovar o cadastro.';
    if (key === 'retry-ti' && !preview() && (!state.validation.rm || !signaturesCurrent() || state.rm.payloadFingerprint !== JSON.stringify(integrationPayload()))) errors['decision.' + source] = 'Valide o cadastro atual no RM antes de notificar a TI.';
    if (fail()) return;
    const description = decisionOptions(source).find(option => option[0] === d.value)?.[2] || 'Confirmar o encaminhamento.';
    modal('Enviar Decisão?', '<p>' + esc(description) + '</p>', () => {
      if (state.started && state.current !== source) return;
      const correctingCollection = key === 'collect' && !!correctionContext();
      adoptPreview();
      if (correctingCollection) state.revision++;
      log(source, correctingCollection ? 'Correção registrada' : d.value === 'retry' ? 'Reintegração solicitada' : key === 'finish' ? 'Assinaturas conferidas' : 'Solicitação aprovada', correctingCollection ? state.correction.adjustments : d.note, d);
      state.returnRequest = null; state.correction = null;
      if (key === 'prepare') state.current = 'coleta';
      if (key === 'collect') { state.validation.dados = false; state.validation.final = false; state.validation.rm = false; state.rm.authorized = false; state.current = 'validacao'; }
      if (key === 'review') {
        if (source === 'validacao') { state.validation.dados = true; state.current = 'sesmt'; }
        else {
          state.validation.final = true; state.validation.rm = false; state.functional.active = false;
          state.current = signaturesCurrent() ? 'integracao' : 'enviar_assinatura';
          if (state.current === 'integracao') Object.assign(state.rm, { status: 'Não iniciada', authorized: true });
          else Object.assign(state.tae, { status: 'Não enviado', authorized: true });
        }
      }
      if (key === 'finish' || key === 'retry') { state.current = 'integracao'; state.validation.rm = false; Object.assign(state.rm, { status: 'Não iniciada', authorized: true }); }
      if (key === 'retry-tae') { state.current = 'enviar_assinatura'; Object.assign(state.tae, { status: 'Não enviado', authorized: true }); }
      if (key === 'review-rm') {
        state.validation.rm = true; state.functional.active = false;
        if (state.infrastructure.necessita === 'Sim' && state.infrastructure.equipamentos.length) { state.current = 'notificacao_ti'; Object.assign(state.notification, { status: 'Não enviada', authorized: true }); }
        else { completeAdmission(); return; }
      }
      if (key === 'retry-ti') { state.current = 'notificacao_ti'; Object.assign(state.notification, { status: 'Não enviada', authorized: true }); }
      if (!['enviar_assinatura', 'integracao', 'notificacao_ti', 'finalizada'].includes(state.current)) state.decisions[state.current] = { value: 'approve', note: 'Dados recebidos para conferência.' };
      save(); go(state.current);
    }, 'Confirmar', 'paper-plane');
  }
  function openCollectionBlock(key) {
    selectCollectionTab(key, app?.querySelector('[data-collection-id="current"]'));
  }
  function selectCollectionTab(key, root) {
    if (!root?.querySelector('[data-collection-tab="' + key + '"]')) return;
    collectionTabs.set(root.dataset.collectionId, key);
    root.querySelectorAll('[data-collection-tab]').forEach(node => {
      const active = node.dataset.collectionTab === key;
      node.classList.toggle('is-active', active); node.setAttribute('aria-selected', String(active)); node.tabIndex = active ? 0 : -1;
    });
    root.querySelectorAll('[role="tabpanel"][data-collection-block]').forEach(node => { node.hidden = node.dataset.collectionBlock !== key; });
  }
  function mask(value, kind) {
    const digits = value.replace(/\D/g, '');
    if (kind === 'cpf') return digits.slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    if (kind === 'cep') return digits.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
    if (kind === 'phone') return digits.slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    return value;
  }
  const conditionalKeys = ['form.pcd', 'form.nacionalidade', 'form.primeiroEmprego', 'form.ctpsTipo', 'form.cnh', 'form.titulo', 'form.militar', 'form.classe', 'form.temDependentes', 'form.transporte', 'form.seguro', 'form.prazo', 'form.representante', 'form.contrato', 'medical.resultado', 'medical.utilizaEpi', 'infrastructure.necessita'];
  function update(event) {
    const input = event.target;
    if (input.readOnly || input.disabled) return;
    if (input.dataset.field && input.dataset.field.startsWith('cancellation.')) { set(input.dataset.field, input.value); save(); return; }
    if (!editable()) return;
    if (input.dataset.field) {
      const path = input.dataset.field;
      if (path === 'form.vagaSelecionada') {
        const vacancy = A.vacancies.find(item => item.id === input.value);
        Object.assign(state.form, { vagaSelecionada: input.value, vaga: vacancy?.id || '', requisicao: vacancy?.requisicao || '', selecao: vacancy?.selecao || '', candidato: vacancy?.candidato || '' });
        clearError(path); save(); render(); return;
      }
      if (path === 'form.origem') { state.origin = input.value; state.form.origem = input.value; errors = {}; save(); render(); return; }
      if (input.dataset.mask) input.value = mask(input.value, input.dataset.mask);
      set(path, input.value); clearError(path);
      app.querySelectorAll('[data-field="' + path + '"]').forEach(other => { if (other !== input && !other.readOnly && !other.matches('[type="radio"], [type="checkbox"]')) other.value = input.value; });
      if (path === 'form.contrato') { state.form.prazo = input.value === 'Prazo indeterminado' ? 'Não' : 'Sim'; state.form.prazoTipo = A.definitions.term.find(def => def.key === 'prazoTipo').options.includes(input.value) ? input.value : 'Experiência'; if (input.value === 'Estágio') state.form.contratoFim = state.form.estagioFim; }
      if (event.type === 'change' && (conditionalKeys.includes(path) || path.endsWith('.optante'))) { save(); render(); }
    }
    if (input.dataset.decision) {
      const key = input.dataset.decision; state.decisions[key] = { ...state.decisions[key], value: input.value, target: state.decisions[key]?.target || 'sesmt', note: state.decisions[key]?.note ?? (key === 'validacao_final' ? state.form.finais : 'Dados e documentos conferidos pelo RH / DP.') }; save(); render();
    }
    const impact = app?.querySelector('[data-signature-impact]'); if (impact) impact.innerHTML = signatureImpactSummary();
    const finalOption = app?.querySelector('.lx-view-shell:not(.lx-view-shell-history) [data-decision="validacao_final"][value="approve"]');
    if (finalOption) finalOption.closest('.lx-decision-option').querySelector('p').textContent = decisionOptions('validacao_final')[0][2];
    save();
  }
  let dbPromise;
  function fileDB() {
    return dbPromise ??= new Promise((resolve, reject) => { const request = indexedDB.open('lonax-admissao-files-v1', 1); request.onupgradeneeded = () => request.result.createObjectStore('files'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
  }
  async function fileRequest(mode, operation) {
    const db = await fileDB();
    return new Promise((resolve, reject) => { const tx = db.transaction('files', mode); const request = operation(tx.objectStore('files')); tx.oncomplete = () => resolve(request.result); tx.onerror = () => reject(tx.error); });
  }
  async function upload(group, files) {
    if (!allowed()) return;
    for (const file of (group.startsWith('assinatura-') ? Array.from(files).slice(0, 1) : Array.from(files))) {
      if (file.size > 10 * 1024 * 1024) { feedback('Use arquivos de até 10 MB.', true); continue; }
      if (group !== 'coletaOutros' && !group.startsWith('assinatura-') && !['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { feedback('Use arquivos PDF ou imagem de até 10 MB.', true); continue; }
      try {
        const id = Date.now() + '-' + Math.random().toString(36).slice(2); await fileRequest('readwrite', store => store.put(file, id));
        if (group.startsWith('assinatura-')) state.files[group] = [];
        (state.files[group] ??= []).push({ id, name: file.name, size: file.size, type: file.type, by: A.owners[stage] || A.owners.coleta, date: A.now(), origin: stage === 'sesmt' ? 'SESMT' : 'RH / DP' });
        state.fileEvents ??= []; state.fileEvents.push({ action: 'Anexo incluído', id, name: file.name, date: A.now(), responsible: A.owners[stage] });
      } catch (_) { feedback('Não foi possível salvar o anexo neste navegador.', true); }
    }
    delete errors['files.' + group]; save(); render();
  }
  async function openFile(file, download = false) {
    let url;
    try {
      if (file.url) url = encodeURI(file.url);
      else { const blob = await fileRequest('readonly', store => store.get(file.id)); if (!blob) throw new Error('missing'); url = URL.createObjectURL(blob); }
      if (download) { const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); if (!file.url) setTimeout(() => URL.revokeObjectURL(url), 1000); }
      else {
        const content = file.type === 'application/pdf' ? '<iframe class="lx-attachment-frame" title="Visualização do Anexo" src="' + esc(url) + '"></iframe>' : (file.type || '').startsWith('image/') ? '<img class="lx-file-image" alt="' + esc(file.name) + '" src="' + esc(url) + '" />' : readGrid([['Arquivo', file.name], ['Tipo', file.type || 'Não informado'], ['Tamanho', Math.ceil(file.size / 1024) + ' KB']]) + '<p>Pré-visualização indisponível para este formato. Utilize o botão de download do anexo.</p>';
        modal(file.name, '<div class="lx-attachment-preview">' + content + '</div>', null, 'Fechar', 'eye', true); if (!file.url) previewURL = url;
      }
    } catch (_) { feedback('Anexo indisponível neste navegador.', true); }
  }
  document.addEventListener('click', event => {
    const toggle = event.target.closest('[data-collapse]'); if (toggle) { expanded[toggle.dataset.collapse] = !expanded[toggle.dataset.collapse]; render(); return; }
    const tabButton = event.target.closest('[data-collection-tab]'); if (tabButton) { selectCollectionTab(tabButton.dataset.collectionTab, tabButton.closest('[data-collection-id]')); return; }
    const selector = event.target.closest('[data-selector]');
    document.querySelectorAll('.lx-select-list').forEach(list => { if (list.parentElement !== selector) list.classList.add('lx-hidden'); });
    const clear = event.target.closest('[data-clear]');
    const option = event.target.closest('[data-option]');
    if ((clear || option) && editable()) { const path = selector.dataset.selector; set(path, clear ? '' : option.dataset.option); clearError(path); save(); render(); if (clear) { const search = app.querySelector('[data-selector="' + path + '"] [data-search]'); search?.focus(); search?.closest('[data-selector]').querySelector('.lx-select-list').classList.remove('lx-hidden'); } return; }
    if (selector && event.target.closest('.lx-single-select-control')) selector.querySelector('.lx-select-list').classList.toggle('lx-hidden');
    const date = event.target.closest('input[type="date"]'); if (date?.showPicker && !date.readOnly) { try { date.showPicker(); } catch (_) { /* Seleção pelo controle nativo. */ } }
    const actionNode = event.target.closest('[data-action]'); if (actionNode) Promise.resolve(action(actionNode)).catch(() => feedback('Não foi possível concluir a ação.', true));
    const zone = event.target.closest('[data-drop]'); if (zone && !actionNode && !event.target.matches('input[type="file"]')) zone.querySelector('input[type="file"]').click();
  });
  document.addEventListener('input', event => {
    if (event.target.matches('[data-search]')) {
      const selector = event.target.closest('[data-selector]'); selector.querySelector('.lx-select-list').classList.remove('lx-hidden');
      selector.querySelectorAll('[data-option]').forEach(option => { option.hidden = !option.textContent.toLocaleLowerCase('pt-BR').includes(event.target.value.toLocaleLowerCase('pt-BR')); }); return;
    }
    if (!event.target.matches('input[type="radio"], input[type="checkbox"], select')) update(event);
    const counter = app?.querySelector('[data-count="' + event.target.dataset.field + '"]'); if (counter) counter.textContent = event.target.value.length;
  });
  document.addEventListener('change', event => {
    if (event.target.dataset.upload) { upload(event.target.dataset.upload, event.target.files); return; }
    if (event.target.matches('input[type="radio"], input[type="checkbox"], select')) update(event);
  });
  document.addEventListener('focusout', event => { const input = event.target; if (input.hasAttribute('data-money') && !input.readOnly) { const value = A.money(input.value); input.value = value; set(input.dataset.field, value); save(); } });
  document.addEventListener('toggle', event => {
    if (!event.target.isConnected) return;
    if (event.target.dataset?.group) groupsOpen[event.target.dataset.group] = event.target.open;
  }, true);
  document.addEventListener('dragover', event => { if (event.target.closest('[data-drop]')) event.preventDefault(); });
  document.addEventListener('drop', event => { const zone = event.target.closest('[data-drop]'); if (zone) { event.preventDefault(); upload(zone.dataset.drop, event.dataTransfer.files); } });
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalConfirm').addEventListener('click', () => {
    if (dialog.querySelector('[data-field="cancellation.justificativa"]') && (!state.cancellation.motivo || !state.cancellation.justificativa.trim())) { feedback('Informe o motivo e a justificativa do cancelamento.', true); return; }
    const callback = modalAction; closeModal(); if (callback) Promise.resolve(callback()).catch(() => feedback('Não foi possível confirmar a ação.', true));
  });
  modalBox.addEventListener('click', event => { if (event.target === modalBox) closeModal(); });
  document.addEventListener('keydown', event => {
    if (!modalBox.classList.contains('lx-hidden')) {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
      if (event.key === 'Tab') { const nodes = Array.from(dialog.querySelectorAll('button, input, textarea, select, [tabindex="0"]')).filter(node => node.getClientRects().length); const first = nodes[0], last = nodes.at(-1); if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
      return;
    }
    if (event.key === 'Escape') document.querySelectorAll('.lx-select-list').forEach(node => node.classList.add('lx-hidden'));
    if (event.target.matches('[data-search]') && event.key === 'Enter') { event.preventDefault(); event.target.closest('[data-selector]').querySelector('[data-option]:not([hidden])')?.click(); }
    if (event.target.matches('[data-collection-tab]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const root = event.target.closest('[data-collection-id]'); const nodes = Array.from(root.querySelectorAll('[data-collection-tab]')); let index = nodes.indexOf(event.target); index = event.key === 'Home' ? 0 : event.key === 'End' ? nodes.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + nodes.length) % nodes.length; selectCollectionTab(nodes[index].dataset.collectionTab, root); nodes[index].focus();
    }
  });
  window.addEventListener('popstate', () => { stage = new URLSearchParams(location.search).get('etapa') || 'preparacao'; errors = {}; render(); });
  window.addEventListener('storage', event => { if (event.key === A.STORE) { const incoming = A.read().processes[state.id]; if (incoming) { state = incoming; completeDefaults(); render(); } } });
  completeDefaults(); restoreEquipmentExamples(); if (params.get('etapa') === 'nova_validacao') history.replaceState(null, '', href(stage)); save(); render();
})();

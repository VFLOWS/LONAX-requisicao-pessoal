(function () {
  'use strict';

  // Dados ilustrativos. Nenhuma chamada ao TOTVS RM é executada neste protótipo.
  const STORAGE = 'lonax.desligamento.v1';
  const employees = [
    { chapa: '000731', nome: 'Carlos Pereira', cargo: 'Operador de Produção', funcao: 'Operador de Extrusora', admissao: '2019-03-14', sexo: 'Masculino', pcd: 'Não', contrato: 'Prazo indeterminado', filial: 'Matriz — Sarzedo/MG' },
    { chapa: '000918', nome: 'Fernanda Lima', cargo: 'Assistente Administrativo', funcao: 'Assistente Administrativo', admissao: '2021-08-22', sexo: 'Feminino', pcd: 'Não', contrato: 'Prazo indeterminado', filial: 'Matriz — Sarzedo/MG' },
    { chapa: '001042', nome: 'Rafael Souza', cargo: 'Técnico de Manutenção', funcao: 'Técnico de Manutenção Industrial', admissao: '2020-06-08', sexo: 'Masculino', pcd: 'Sim', contrato: 'Prazo indeterminado', filial: 'Matriz — Sarzedo/MG' }
  ];
  const employeeDetails = {
    '000731': { nivel: 'Operacional - Step 2', secao: 'Produção', centro: 'IND.PRO.001', descricao: 'Operar máquinas de extrusão, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.', escala: '6x1', horario: '06:00 às 14:00' },
    '000918': { nivel: 'Administrativo - Step 1', secao: 'Administração', centro: 'ADM.GER.002', descricao: 'Executar rotinas administrativas, controlar documentos, apoiar lançamentos e organizar informações da área.', escala: '5x1', horario: '08:00 às 17:48' },
    '001042': { nivel: 'Técnico - Step 1', secao: 'Manutenção', centro: 'IND.MAN.005', descricao: 'Executar manutenção preventiva e corretiva em máquinas e equipamentos industriais, registrar intervenções e apoiar a disponibilidade da linha de produção.', escala: '5x1', horario: '08:00 às 17:48' }
  };
  employees.forEach(e => Object.assign(e, employeeDetails[e.chapa]));
  const stabilityExamples = {
    '000731': [
      { tipo: 'CIPA', informado: 'Sim', inicio: '2026-01-01', fim: '2026-12-31', detalhes: [['Representação', 'Titular'], ['Data da Eleição', '2025-12-15']], descricao: 'Representante dos empregados na CIPA. Mandato informado no cadastro do colaborador.' },
      { tipo: 'Afastamento', informado: 'Não', inicio: '', fim: '', descricao: 'Sem afastamento informado no cadastro.' },
      { tipo: 'Maternidade', informado: 'Não', inicio: '', fim: '', descricao: 'Sem informação de maternidade no cadastro.' }
    ],
    '000918': [
      { tipo: 'CIPA', informado: 'Não', inicio: '', fim: '', descricao: 'Sem participação na CIPA informada no cadastro.' },
      { tipo: 'Afastamento', informado: 'Não', inicio: '', fim: '', descricao: 'Sem outro afastamento informado no cadastro.' },
      { tipo: 'Maternidade', informado: 'Sim', inicio: '2026-09-01', fim: '2027-02-28', detalhes: [['Tipo de licença', 'Licença-maternidade'], ['Retorno previsto', '2027-03-01']], descricao: 'Licença-maternidade informada no cadastro da colaboradora.' }
    ],
    '001042': [
      { tipo: 'CIPA', informado: 'Sim', inicio: '2025-11-01', fim: '2026-10-31', detalhes: [['Representação', 'Suplente'], ['Data da Eleição', '2025-10-15']], descricao: 'Participação na CIPA informada no cadastro do colaborador.' },
      { tipo: 'Afastamento', informado: 'Sim', inicio: '2026-10-01', fim: '2026-10-31', detalhes: [['Motivo', 'Saúde'], ['Retorno previsto', '2026-11-03']], descricao: 'Afastamento por motivo de saúde informado no cadastro do colaborador.' },
      { tipo: 'Maternidade', informado: 'Não', inicio: '', fim: '', descricao: 'Sem informação de maternidade no cadastro.' }
    ]
  };
  const equipmentTypes = ['Notebook / Computador', 'Monitor', 'Telefone', 'Celular', 'Veículo', 'Outros'];
  const epiTypes = ['Capacete de segurança', 'Óculos de proteção', 'Protetor auricular', 'Luva de proteção', 'Calçado de segurança', 'Máscara de proteção', 'Cinto de segurança', 'Avental de proteção', 'Outros'];
  function requestExamples() {
    return {
      tipo: 'Dispensa sem justa por iniciativa do empregado', justificativa: 'Desligamento solicitado em razão da reorganização da equipe de produção.', prevista: '2026-10-30', infraestrutura: 'Sim', epi: 'Sim',
      infraObs: 'Equipamentos informados pelo gestor para conferência e devolução à TI.',
      epiObs: 'EPIs utilizados na rotina da produção para avaliação de devolução pelo SESMT.',
      infraItems: [
        { tipo: 'Notebook / Computador', quantidade: '1', descricao: 'Notebook utilizado no acompanhamento da produção.', devolver: 'Sim', parecer: 'Conferir a devolução do notebook, carregador e acessórios à TI.' },
        { tipo: 'Monitor', quantidade: '1', descricao: 'Monitor de apoio utilizado na área de produção.', devolver: 'Sim', parecer: 'Receber o monitor com a base e os cabos utilizados pelo colaborador.' }
      ],
      epiItems: [
        { tipo: 'Capacete de segurança', quantidade: '1', descricao: 'Capacete utilizado na área industrial.', devolver: 'Sim', parecer: 'Recolher o capacete e conferir seu estado de conservação no desligamento.' },
        { tipo: 'Óculos de proteção', quantidade: '1', descricao: 'Óculos de proteção utilizados na operação.', devolver: 'Sim', parecer: 'Conferir os óculos de proteção e registrar a devolução ao SESMT.' },
        { tipo: 'Protetor auricular', quantidade: '2', descricao: 'Protetores auriculares entregues ao colaborador.', devolver: 'Sim', parecer: 'Conferir as duas unidades informadas e registrar a destinação pelo SESMT.' }
      ]
    };
  }
  function requestSnapshotExamples(source) {
    const f = JSON.parse(JSON.stringify(source || {}));
    const examples = requestExamples();
    const empty = value => value == null || (typeof value === 'string' && (!value.trim() || ['—', '-'].includes(value.trim())));
    f.tipo = normalizeTerminationType(f.tipo);
    ['tipo', 'prevista', 'justificativa'].forEach(key => { if (empty(f[key])) f[key] = examples[key]; });
    if (empty(f.employee)) f.employee = employees[0].chapa;
    [['infraestrutura', 'infraItems', 'infraObs'], ['epi', 'epiItems', 'epiObs']].forEach(([choice, scope, observation]) => {
      if (!['Sim', 'Não'].includes(f[choice])) f[choice] = 'Sim';
      if (!Array.isArray(f[scope])) f[scope] = [];
      if (f[choice] === 'Não') {
        if (empty(f[observation])) f[observation] = scope === 'infraItems' ? 'Colaborador não utiliza equipamentos.' : 'Colaborador não utiliza EPIs.';
        return;
      }
      if (!f[scope].length) f[scope] = examples[scope];
      f[scope] = f[scope].map((item, index) => {
        const row = item && typeof item === 'object' ? item : {};
        if (empty(row.tipo)) row.tipo = examples[scope][index % examples[scope].length].tipo;
        const example = examples[scope].find(entry => entry.tipo === row.tipo);
        if (empty(row.quantidade)) row.quantidade = example?.quantidade || '1';
        if (empty(row.descricao)) row.descricao = example?.descricao || (scope === 'infraItems' ? 'Equipamento informado para conferência da devolução à TI.' : 'EPI informado para conferência da devolução ao SESMT.');
        if (empty(row.devolver)) row.devolver = 'Sim';
        if (empty(row.parecer)) row.parecer = example?.parecer || 'Conferir a devolução do item e registrar as condições de recebimento.';
        return row;
      });
      if (empty(f[observation])) f[observation] = examples[observation];
    });
    return f;
  }
  const terminationTypes = ['Dispensa sem justa por iniciativa do empregado', 'Dispensa sem justa por iniciativa do empregador', 'Dispensa por justa causa', 'Término de contrato', 'Acordo entre as partes'];
  function normalizeTerminationType(value) {
    return ['Dispensa sem justa causa', 'Pedido de demissão'].includes(value) ? terminationTypes[0] : value;
  }
  const stages = [
    ['solicitacao', 'Solicitar Desligamento', 'user-pen', 'blue', 'Encarregado / Gestor: colaborador, justificativa, infraestrutura e EPI.'],
    ['diretoria', 'Aprovação da Diretoria', 'building-user', 'purple', 'Aprovar, reprovar ou devolver ao solicitante para correção.'],
    ['rh', 'Aprovação do RH', 'users-gear', 'teal', 'Conferência da solicitação, análise de estabilidade e aprovação da continuidade.'],
    ['paralelo', 'Aguardar Análises do SESMT e TI', 'clock', 'orange', 'Acompanhar o retorno das duas análises e seguir para o documento de desligamento.'],
    ['sesmt', 'Análise do SESMT', 'helmet-safety', 'orange', 'Exame demissional, devolução de EPI e termos. Em paralelo à TI.'],
    ['ti', 'Análise da TI', 'laptop', 'blue', 'Infraestrutura, itens a devolver e termo de responsabilidade. Em paralelo ao SESMT.'],
    ['documento', 'Documento de Desligamento', 'file-lines', 'purple', 'Consultar o documento de desligamento e encaminhar para assinaturas.'],
    ['assinaturas', 'Encaminhar para Assinatura', 'file-signature', 'teal', 'Gerar e enviar para assinatura eletrônica ou anexar o documento assinado presencialmente.'],
    ['validacao_assinaturas', 'Acompanhar Assinaturas', 'file-signature', 'teal', 'Acompanhar o status das assinaturas. Após o recebimento do documento assinado, o processo segue automaticamente para o DP.'],
    ['dp', 'DP — Checklist da Rescisão', 'list-check', 'orange', 'Dados da rescisão e conferência manual dos itens aplicáveis.'],
    ['correcao', 'Correção da Solicitação', 'rotate-left', 'slate', 'Dados preservados, parecer da devolução e registro dos ajustes.'],
    ['reprovada', 'Desligamento Reprovado', 'ban', 'red', 'Decisão e histórico do encerramento por reprovação.'],
    ['finalizada', 'Desligamento Finalizado', 'circle-check', 'green', 'Desligamento aprovado e concluído pelo Departamento Pessoal.']
  ].map(([key, title, icon, tone, desc]) => ({ key, title, icon, tone, desc }));
  const owners = { solicitacao: 'Eduardo Martins', diretoria: 'Roberto Siqueira', rh: 'Ricardo Nunes', paralelo: 'Ricardo Nunes', sesmt: 'Marcos Oliveira', ti: 'Patrícia Almeida', documento: 'Ricardo Nunes', assinaturas: 'Ricardo Nunes', validacao_assinaturas: 'Sistema', dp: 'Juliana Costa' };
  const checklistGroups = [
    ['proventos', 'Descontos / Proventos', ['Plano de Saúde', 'Coparticipação', 'Odontológico', 'Alimentação', 'Adicional Noturno', 'Art. 73 — Hora Ficta', 'Faltas', 'Atrasos', 'Comissões', 'Periculosidade / Insalubridade', 'Desconto Vale-Transporte', 'Desconto Combustível', 'Pensão', 'FGTS do Mês Anterior', 'Farmácia', 'Bazar / Feira da Família', 'Uniforme', 'Banco de Horas', 'Cesta Básica', 'Fretado', 'EPI', 'E-Consignado', 'Insuficiência de Saldo do Mês Anterior', 'Conferência de Gozo de Férias']],
    ['cancelamentos', 'Cancelamentos', ['Plano de Saúde', 'Odontológico', 'Farmácia', 'Tangerino', 'CTRL ID']],
    ['documentos', 'Documentos / Providências', ['PPP', 'TRCT', 'Folha de Ponto', 'Extrato FGTS', 'GRRF', 'Ficha de Registro', 'Seguro', 'ASO Demissional', 'Aviso Assinado', 'Lançamento Financeiro', 'Arquivo Bancário', 'Lançamento do Líquido', 'Total TRCT', 'Total GRRF', 'Envio do Evento S-2299 ao eSocial']]
  ];
  const labels = { solicitacao: 'Em preenchimento', diretoria: 'Aguardando Diretoria', rh: 'Aguardando RH', paralelo: 'Aguardando SESMT e TI', documento: 'Aguardando documento', assinaturas: 'Aguardando encaminhamento para assinatura', validacao_assinaturas: 'Aguardando Assinaturas', dp: 'Checklist do DP', correcao: 'Em correção', retomada: 'Aguardando regra de retomada', reprovada: 'Reprovado', finalizada: 'Finalizado' };

  function exampleAttachments() {
    return [1, 2, 3].map(index => ({ id: 'exemplo-solicitacao-' + index, name: 'teste ' + index + '.pdf', url: 'anexos/teste ' + index + '.pdf', type: 'application/pdf', size: 25834, origin: 'Solicitante', by: owners.solicitacao, date: '16/10/2026 10:00', revision: 1 }));
  }
  function analysisAttachments() {
    return Object.fromEntries([
      ['guia', 'guia-exame-demissional.pdf', 'sesmt'],
      ['termoEpi', 'termo-de-epi.pdf', 'sesmt'],
      ['termoInfra', 'termo-de-infraestrutura.pdf', 'ti']
    ].map(([group, name, area]) => [group, [{ id: 'exemplo-' + group + '-1', name, url: 'anexos/' + name, type: 'application/pdf', size: 25834, origin: area.toUpperCase(), by: owners[area], date: '16/10/2026 10:00', revision: 1 }]]));
  }
  function documentAttachments(revision = 1) {
    return Object.fromEntries(['documento', 'paraAssinatura', 'assinado'].map(group => {
      const name = group === 'assinado' ? 'documento-de-desligamento-assinado.pdf' : 'documento-de-desligamento.pdf';
      return [group, [{ id: 'exemplo-' + group + '-' + revision, name, url: 'anexos/' + name, type: 'application/pdf', size: group === 'assinado' ? 2857 : 2621, origin: attachmentOrigin(group), by: owners.documento, date: '16/10/2026 10:00', revision }]];
    }));
  }
  function fillDocumentExamples(target) {
    const examples = documentAttachments(target.revision);
    Object.keys(examples).forEach(group => {
      if (!target.files[group]?.length) target.files[group] = examples[group];
    });
    target.documentDemoVersion = 1;
  }
  function fillAnalysisExamples(target) {
    const examples = requestExamples();
    const files = analysisAttachments();
    [['sesmt', 'epiItems', ['guia', 'termoEpi']], ['ti', 'infraItems', ['termoInfra']]].forEach(([area, scope, groups]) => {
      if (area === 'sesmt') {
        target.form.exame ||= 'Sim';
        target.form.exameObs ||= 'Encaminhar o colaborador para o exame demissional conforme a guia anexada e conferir a devolução dos EPIs.';
      }
      target.form[scope].forEach(item => {
        const example = examples[scope].find(row => row.tipo === item.tipo);
        item.devolver ||= 'Sim';
        item.parecer ||= example?.parecer || 'Conferir a devolução do item e registrar as condições de recebimento.';
      });
      const d = target.decisions[area] || (target.decisions[area] = { value: 'approve', note: '' });
      d.note ||= area === 'sesmt' ? 'Necessidade de exame avaliada, guia anexada e devolução dos EPIs indicada para conferência pelo SESMT.' : 'Equipamentos e termo de responsabilidade conferidos. Recolher os itens indicados e registrar a devolução à TI.';
      groups.forEach(group => {
        const list = target.files[group] || (target.files[group] = []);
        files[group].forEach(file => { if (!list.some(item => item.id === file.id || item.name === file.name)) list.push(file); });
      });
    });
    target.reviewDemoVersion = 1;
  }
  const checklistExampleDate = '16/10/2026';
  function dpExamples(completed = false) {
    const date = checklistExampleDate;
    const notes = { proventos: 'Valor e incidência conferidos na memória de cálculo da rescisão.', cancelamentos: 'Cancelamento conferido com a área responsável.', documentos: 'Documento e lançamento conferidos na pasta da rescisão.' };
    return {
      form: { cpf: '123.456.789-09', pis: '123.45678.90-1', saldoFgts: '18450.75', homologacao: 'Sindicato — Sarzedo/MG', demissao: '2026-10-30', projecaoAviso: '2026-11-29', checklistConcluido: 'Sim', finais: 'Documentação conferida, devoluções acompanhadas e checklist da rescisão concluído.' },
      checks: Object.fromEntries(checklistGroups.flatMap(([group, , items]) => items.map((name, index) => {
        const status = completed ? (index % 2 ? 'na' : 'conferido') : '';
        return [group + '-' + index, { status, note: completed ? (status === 'na' ? 'O item ' + name + ' não se aplica a esta rescisão, conforme conferência do Departamento Pessoal.' : notes[group]) : 'Aguardando conferência pelo Departamento Pessoal.', by: completed ? owners.dp : '', date: completed ? date : '' }];
      })))
    };
  }
  function fillDPExamples(target) {
    const examples = dpExamples();
    Object.entries(examples.form).forEach(([key, value]) => { if (!target.form[key]) target.form[key] = value; });
    Object.entries(examples.checks).forEach(([key, value]) => {
      if (!Object.hasOwn(target.checks, key)) target.checks[key] = value;
      else if (target.dpDemoVersion === 1) Object.assign(target.checks[key], { status: '', by: '', date: '' });
    });
    target.dpDemoVersion = 2;
  }

  function freshState() {
    const fresh = {
      current: 'solicitacao', revision: 1, created: now(), history: [], decisions: {}, files: { solicitacao: exampleAttachments() }, checks: {}, correction: null, document: null, electronicSigning: null, exampleAttachmentsVersion: 1,
      requestDemoVersion: 3, signatureDemoVersion: 1,
      form: Object.assign({ employee: '000731', modalidade: 'Eletrônica', assinaturaColaborador: '', assinaturaGestor: '', cpf: '', pis: '', saldoFgts: '', homologacao: '', demissao: '', projecaoAviso: '', checklistConcluido: '', finais: '' }, requestExamples())
    };
    fillAnalysisExamples(fresh);
    fillDocumentExamples(fresh);
    fillDPExamples(fresh);
    return fresh;
  }
  let storageOK = true;
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE)); } catch (_) { storageOK = false; }
  if (!state || !state.form || !state.history) state = freshState();
  if (!state.exampleAttachmentsVersion) {
    const files = state.files.solicitacao || (state.files.solicitacao = []);
    exampleAttachments().forEach(file => { if (!files.some(item => item.id === file.id || item.url === file.url)) files.push(file); });
    state.exampleAttachmentsVersion = 1;
  }
  if (!state.requestDemoVersion || state.requestDemoVersion < 3) {
    // Completa o formulário antigo uma vez; os registros do histórico não são alterados.
    state.form = requestSnapshotExamples(state.form);
    state.requestDemoVersion = 3;
  }
  state.form.tipo = normalizeTerminationType(state.form.tipo);
  if (!state.reviewDemoVersion) fillAnalysisExamples(state);
  if (!state.documentDemoVersion) fillDocumentExamples(state);
  if (!state.dpDemoVersion || state.dpDemoVersion < 2) fillDPExamples(state);
  Object.values(state.checks).forEach(item => {
    if (['conferido', 'na'].includes(item?.status) && item.date == null) item.date = checklistExampleDate;
  });
  const equipmentExamples = requestExamples();
  // Restaura somente nomes vazios ao abrir a página, sem recriar itens removidos.
  ['infraItems', 'epiItems'].forEach(scope => state.form[scope].forEach((item, index) => {
    if (item.quantidade == null) item.quantidade = '1';
    if (!String(item.tipo ?? '').trim()) item.tipo = equipmentExamples[scope][index % equipmentExamples[scope].length].tipo;
  }));
  if (!Array.isArray(state.form.rmStability)) state.form.rmStability = JSON.parse(JSON.stringify(stabilityExamples[state.form.employee] || []));
  // Acrescenta os detalhes dos exemplos a rascunhos existentes, preservando os registros do histórico.
  state.form.rmStability.forEach(record => {
    const example = (stabilityExamples[state.form.employee] || []).find(item => item.tipo === record.tipo && item.informado === record.informado && item.inicio === record.inicio && item.fim === record.fim);
    if (!Array.isArray(record.detalhes)) record.detalhes = JSON.parse(JSON.stringify(example?.detalhes || []));
  });
  const stageKey = locationStage();
  let page = prepareStage(stageKey);
  let errors = [];
  let fieldErrors = {};
  let dbPromise;
  let modalAction = null;
  let modalValidation = null;
  let previousFocus;
  let previewURL;
  let summaryOpen = false;
  let correctionExample;
  const openApprovals = {};
  const openChecklists = {};
  const displayedFiles = [];
  const view = document.getElementById('appView');
  const backdrop = document.getElementById('modalBackdrop');
  const dialog = document.getElementById('modalDialog');
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function now() { return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }); }
  function date(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : value || '—'; }
  function checkDate(value) {
    const text = String(value || '');
    return /^\d{4}-\d{2}-\d{2}/.test(text) ? date(text.slice(0, 10)) : text.match(/^\d{2}\/\d{2}\/\d{4}/)?.[0] || '';
  }
  function employee() { return employees.find(e => e.chapa === state.form.employee); }
  function title(key) { return (stages.find(s => s.key === key) || {}).title || labels[key] || key; }
  function locationStage() { return new URLSearchParams(location.search).get('etapa') || (location.pathname.endsWith('/espera_paralelo.html') ? 'paralelo' : 'solicitacao'); }
  function url(key) { return 'etapa.html?etapa=' + encodeURIComponent(key); }
  function prepareStage(key) {
    const stage = stages.find(item => item.key === key) || stages[0];
    // A apresentação da validação é exclusiva do cenário de assinatura eletrônica.
    if (stage.key === 'validacao_assinaturas') {
      state.form.modalidade = 'Eletrônica';
      if (!state.signatureDemoVersion) {
        if (state.electronicSigning) Object.assign(state.electronicSigning, { signers: electronicSigningExample('partial').signers, signedDocument: null, validatedAt: '' });
        state.signatureDemoVersion = 1;
      }
    }
    return stage;
  }
  function save() {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); return true; }
    catch (_) { storageOK = false; feedback('Não foi possível salvar no navegador. Mantenha esta página aberta.', true); return false; }
  }
  function log(area, action, note, extra) {
    state.history.push(Object.assign({ area, action, note: note || '', responsible: owners[area] || owners.solicitacao, date: now(), revision: state.revision }, extra || {}));
  }
  function historyEvidence() {
    return JSON.parse(JSON.stringify({ snapshot: state.form, files: state.files, document: state.document, electronicSigning: state.electronicSigning || null }));
  }
  function go(key) {
    page = prepareStage(key); save(); errors = []; fieldErrors = {};
    if (!view) { location.href = url(key); return; }
    history.pushState(null, '', url(key)); render(); window.scrollTo(0, 0);
  }
  function active(key) { return state.current === key || (state.current === 'paralelo' && ['sesmt', 'ti'].includes(key) && !state.decisions[key]?.completed); }
  function completed(key) { return !!state.decisions[key]?.completed; }
  function isChecklistEditor(control) {
    return page.key === 'dp' && control.matches('[data-check], [data-na], [data-pending], input[data-check-date], [data-check-note], [data-field="checklistConcluido"], [data-field="finais"]');
  }
  function canInteract(key) {
    if (key === 'correcao' && !isCurrentCorrection()) return true;
    if (key === 'validacao_assinaturas') return false;
    // Permite apresentar as assinaturas mesmo quando outra etapa anterior está aberta.
    if (key === 'assinaturas' && ['solicitacao', 'diretoria', 'rh', 'paralelo', 'documento', 'assinaturas'].includes(state.current)) return true;
    // As atividades abertas diretamente também podem ser demonstradas no rascunho.
    return active(key) || (state.current === 'solicitacao' && ['diretoria', 'rh', 'sesmt', 'ti', 'documento', 'assinaturas', 'dp'].includes(key) && !completed(key));
  }
  function feedback(message, bad) {
    const box = document.getElementById('feedback'); box.textContent = message; box.className = 'lx-feedback' + (bad ? ' lx-feedback-error' : '');
    clearTimeout(feedback.timer); feedback.timer = setTimeout(() => { box.className = ''; box.textContent = ''; }, 6000);
  }
  function modal(heading, body, action, confirmText, icon = 'circle-question', validate = null) {
    previousFocus = document.activeElement; document.getElementById('modalTitle').textContent = heading;
    document.getElementById('modalIcon').innerHTML = '<i class="fa-solid fa-' + icon + '" aria-hidden="true"></i>';
    document.getElementById('modalMessage').innerHTML = body;
    document.getElementById('modalConfirm').textContent = confirmText || 'Confirmar';
    document.getElementById('modalCancel').classList.toggle('lx-hidden', !action);
    modalAction = action; modalValidation = validate; backdrop.classList.remove('lx-hidden'); dialog.focus();
  }
  function closeModal() { backdrop.classList.add('lx-hidden'); dialog.classList.remove('lx-modal-wide'); modalAction = null; modalValidation = null; document.getElementById('modalMessage').innerHTML = ''; if (previewURL) { URL.revokeObjectURL(previewURL); previewURL = null; } previousFocus?.focus(); }
  function notice(text, tone = '') { return '<div class="lx-alert ' + tone + '"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><div>' + text + '</div></div>'; }
  function button(action, text, style = 'primary', attrs = '') { return '<button type="button" class="lx-btn lx-btn-' + style + '" data-action="' + action + '" ' + attrs + '>' + text + '</button>'; }
  function actions(primary, key) { return '<div class="lx-actions">' + button('draft', '<i class="fa-solid fa-save"></i> Salvar Rascunho', 'secondary') + button(primary, '<i class="fa-solid fa-paper-plane"></i> ' + key) + '</div>'; }
  function grid(content, columns = 3) { return '<div class="lx-grid-' + columns + '">' + content.join('') + '</div>'; }
  function fieldset(heading, icon, body) { return '<fieldset class="lx-fieldset"><legend><i class="fa-solid fa-' + icon + '" aria-hidden="true"></i> ' + heading + '</legend>' + body + '</fieldset>'; }
  function section(heading, icon, body) { return '<section class="lx-section"><div class="lx-section-head"><div><span class="lx-section-icon"><i class="fa-solid fa-' + icon + '"></i></span><h2>' + heading + '</h2></div></div><div class="lx-view-body">' + body + '</div></section>'; }
  function input(label, key, options = {}) {
    const value = options.value ?? state.form[key] ?? '';
    const required = options.required ? ' <b>*</b>' : '';
    const attrs = ' data-field="' + key + '"' + (options.readonly ? ' readonly' : '') + (options.required ? ' aria-required="true"' : '');
    const control = options.textarea ? '<textarea' + attrs + ' rows="3">' + escape(value) + '</textarea>' : '<input' + attrs + ' type="' + (options.type || 'text') + '" value="' + escape(value) + '"' + (options.min != null ? ' min="' + options.min + '" step="0.01"' : '') + ' />';
    return '<label class="lx-field lx-field-name-' + key + '"><span>' + label + required + '</span>' + control + '</label>';
  }
  function select(label, key, options, required = false, value = state.form[key]) {
    return '<label class="lx-field"><span>' + label + (required ? ' <b>*</b>' : '') + '</span><select data-field="' + key + '"' + (required ? ' aria-required="true"' : '') + '><option value="">Selecione...</option>' + options.map(o => {
      const [v, text] = Array.isArray(o) ? o : [o, o];
      return '<option value="' + escape(v) + '"' + (value === v ? ' selected' : '') + '>' + escape(text) + '</option>';
    }).join('') + '</select></label>';
  }
  function singleSelect(label, key, options, required = false, value = state.form[key], itemAttrs = '') {
    const normalized = options.map(o => Array.isArray(o) ? o : [o, o]);
    const text = normalized.find(([v]) => v === value)?.[1] || value || '';
    return '<div class="lx-field lx-field-name-' + key + '"><span>' + label + (required ? ' <b>*</b>' : '') + '</span><div class="lx-single-select' + (value ? ' has-value' : '') + '" data-single-select data-key="' + key + '"><input type="hidden" ' + (itemAttrs || 'data-field="' + key + '"') + ' value="' + escape(value || '') + '" /><div class="lx-single-select-control"><span class="lx-tag">' + escape(text) + ' <button type="button" data-clear-select aria-label="Remover ' + escape(label) + '">x</button></span><input data-select-input aria-label="Pesquisar ' + escape(label) + '" placeholder="Pesquisar ' + escape(label.toLowerCase()) + '..." /></div><div class="lx-select-list lx-hidden">' + normalized.map(([v, text]) => '<button type="button" data-select-option="' + escape(v) + '">' + escape(text) + '</button>').join('') + '</div></div></div>';
  }
  function radios(label, key, values, value = state.form[key]) {
    return '<div class="lx-field lx-radio-field lx-field-name-' + key + '"><span>' + label + ' <b>*</b></span><div class="lx-radio-options">' + values.map(v => '<label class="lx-radio-option' + (value === v ? ' lx-radio-option-selected' : '') + '"><input type="radio" name="' + key + '" data-field="' + key + '" value="' + escape(v) + '"' + (value === v ? ' checked' : '') + ' /><strong>' + escape(v) + '</strong></label>').join('') + '</div></div>';
  }
  function readGrid(rows, className = '') {
    return '<div class="lx-history-stage-grid ' + className + '">' + rows.map(([label, value]) => '<div class="lx-history-stage-item lx-readonly-item-' + String(label).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '"><span>' + escape(label) + '</span><strong>' + escape(value || '—') + '</strong></div>').join('') + '</div>';
  }
  function historyCustomSection(heading, icon, tone, content) {
    return '<fieldset class="lx-history-fieldset lx-history-fieldset-' + tone + '"><legend><i class="fa-solid fa-' + icon + '"></i> ' + heading + '</legend><div class="lx-history-stage lx-history-stage-' + tone + '">' + content + '</div></fieldset>';
  }
  function historySection(heading, icon, tone, rows, className = '') {
    return historyCustomSection(heading, icon, tone, readGrid(rows, className));
  }
  function panel(heading, desc, body, meta = page) {
    return '<div class="lx-view-frame"><div class="lx-view-rail"></div><div class="lx-timeline-dot lx-dot-' + meta.tone + '"><i class="fa-solid fa-' + meta.icon + '"></i></div><section class="lx-view-shell"><div class="lx-view-head"><div><h2>' + escape(heading) + '</h2><p>' + escape(desc) + '</p></div>' + (meta.key ? '<span class="lx-pill">' + escape(displayStatus()) + '</span>' : '') + '</div><div class="lx-view-body">' + body + '</div></section></div>';
  }
  function displayStatus() {
    if (['reprovada', 'finalizada'].includes(page.key)) return labels[page.key];
    if (page.key === 'correcao' && !isCurrentCorrection()) return labels.correcao;
    if (page.key === 'dp' && state.current === 'solicitacao') return labels.dp;
    return labels[state.current] || state.current;
  }
  function renderStatus() {
    document.getElementById('statusLabel').textContent = document.getElementById('stageNav') ? labels[state.current] || state.current : displayStatus();
  }
  function render() {
    if (advanceSignatureTracking() && view && page.key === 'validacao_assinaturas') { go('dp'); return; }
    displayedFiles.length = 0;
    renderStatus();
    const nav = document.getElementById('stageNav');
    if (nav) {
      nav.innerHTML = stages.filter(s => !['paralelo', 'documento'].includes(s.key)).map(s => '<a class="lx-stage-card" href="' + (s.key === 'paralelo' ? 'espera_paralelo.html' : url(s.key)) + '"><span class="lx-stage-icon lx-dot-' + s.tone + '"><i class="fa-solid fa-' + s.icon + '"></i></span><div><h3>' + escape(s.title) + '</h3><p>' + escape(s.desc) + '</p></div></a>').join('');
      return;
    }
    let body = '';
    if (page.key === 'solicitacao' || page.key === 'correcao') body = renderRequest(page.key === 'correcao');
    if (['diretoria', 'rh', 'sesmt', 'ti'].includes(page.key)) body = renderReview(page.key);
    if (page.key === 'paralelo') body = renderParallelWait();
    if (page.key === 'documento') body = renderDocument();
    if (page.key === 'assinaturas') body = renderSignatures();
    if (page.key === 'validacao_assinaturas') body = renderSignatureTracking();
    if (page.key === 'dp') body = renderDP();
    if (['finalizada', 'reprovada'].includes(page.key)) body = renderEnding();
    const errorHtml = errors.length && !Object.keys(fieldErrors).length ? '<div class="lx-validation" role="alert" tabindex="-1"><strong>Revise os campos antes de continuar:</strong><ul>' + errors.map(e => '<li>' + escape(e) + '</li>').join('') + '</ul></div>' : '';
    view.innerHTML = (page.key === 'solicitacao' ? '' : renderSummary()) + (page.key === 'solicitacao' ? '' : renderProcessHistory()) + panel(page.title, page.desc, errorHtml + body);
    applyFieldErrors();
    if (!canInteract(page.key)) {
      view.querySelectorAll('input, select, textarea, button').forEach(node => {
        if (node.readOnly && node.closest('[data-dp-reference]')) return;
        if (node.matches('[data-decision], [data-note]') || isChecklistEditor(node)) return;
        if (state.current === 'retomada' && page.key === 'correcao' && (node.dataset.field === 'resumeArea' || node.dataset.action === 'resume')) return;
        if (['file', 'download-file', 'draft'].includes(node.dataset.action) || node.hasAttribute('data-collapse')) return;
        node.disabled = true;
      });
    }
  }
  function renderRequest(correction) {
    const context = correction ? correctionContext() : null;
    if (correction && state.current === 'retomada') {
      return notice('Correção registrada e dados preservados. A regra BPM de retomada ainda será definida. O protótipo aguarda uma escolha explícita para demonstrar a reanálise.') + readGrid([['Área que devolveu', title(state.correction.origin)], ['Parecer', state.correction.note], ['Ajustes Realizados', state.correction.changes]]) + select('Área para Reanálise (Somente Simulação)', 'resumeArea', ['diretoria', 'rh', 'sesmt', 'ti'].map(k => [k, title(k)]), true, state.form.resumeArea || state.correction.origin) + '<div class="lx-actions">' + button('resume', 'Simular Retomada pela Área Selecionada') + '</div>';
    }
    return (correction ? '<div class="lx-alert"><i class="fa-solid fa-rotate-left"></i><div><strong>Solicitação devolvida para correção pelo ' + escape(context.origin === 'rh' ? 'RH' : title(context.origin)) + '.</strong><br>' + escape(context.note) + '</div></div>' : '') +
      renderRequester(correction) +
      section('Dados de Desligamento', 'user-minus',
      renderEmployee() +
      fieldset('Parâmetros de Desligamento', 'user-minus', grid([singleSelect('Tipo de Desligamento', 'tipo', terminationTypes, true), input('Data Prevista de Desligamento', 'prevista', { type: 'date', required: true })], 2)) +
      renderStability(state.form) +
      fieldset('Infraestrutura do Colaborador', 'laptop', radios('Colaborador Utiliza Equipamentos Atualmente?', 'infraestrutura', ['Sim', 'Não']) + (state.form.infraestrutura === 'Sim' ? renderItems('infraItems', true) + input('Observações da Infraestrutura', 'infraObs', { textarea: true }) : '')) +
      fieldset('Equipamentos de Proteção Individual — EPI', 'helmet-safety', radios('Colaborador Utiliza EPIs Atualmente?', 'epi', ['Sim', 'Não']) + (state.form.epi === 'Sim' ? renderItems('epiItems', true) + input('Observações de EPI', 'epiObs', { textarea: true }) : '')) +
      fieldset('Upload de Arquivos', 'paperclip', attachments('solicitacao', '', true)) +
      fieldset('Justificativa', 'comment-dots', input('Justificativa de Desligamento', 'justificativa', { textarea: true, required: true })) +
      (correction ? input('Descreva os Ajustes Realizados', 'changes', { textarea: true, required: true, value: state.form.changes ?? 'Data prevista e justificativa revisadas conforme orientação do RH.' }) : '') +
      actions(correction ? 'correct' : 'submit', correction ? 'Registrar Correção' : 'Enviar para Diretoria'));
  }
  function renderRequester(correction) {
    const fields = [
      input('Data/Hora', 'requesterDate', { value: state.created, readonly: true }),
      input('Solicitante', 'requesterName', { value: owners.solicitacao, readonly: true }),
      input('Filial', 'requesterBranch', { value: 'Matriz - Sarzedo/MG', readonly: true }),
      input('Gerência', 'requesterArea', { value: 'Gerência Industrial', readonly: true }),
      input('Gestor Imediato', 'requesterManager', { value: owners.solicitacao, readonly: true }),
      input('Área Diretoria', 'requesterBoard', { value: 'Diretoria Industrial', readonly: true })
    ];
    if (correction) fields.splice(1, 0, input('Número Solicitação', 'requesterNumber', { value: 'DES-2026-0042', readonly: true }));
    return section('Dados do Solicitante', 'user', grid(fields, 4));
  }
  function renderEmployee() {
    const e = employee() || {};
    const field = (label, key) => input(label, 'rm_' + key, { value: key === 'admissao' ? date(e[key]) : e[key] || '', readonly: true, required: true, textarea: key === 'descricao' });
    return '<div class="lx-movement-current-grid lx-dismissal-current-grid">' + [
      singleSelect('Colaborador', 'employee', employees.map(e => [e.chapa, e.nome]), true),
      field('Chapa', 'chapa'), field('Data de Admissão', 'admissao'),
      field('Cargo Atual', 'cargo'), field('Função Atual', 'funcao'), field('Nível / Step Atual', 'nivel'),
      field('Setor / Seção Atual', 'secao'), field('Centro de Custo Origem', 'centro'),
      field('Descrição do Cargo Atual', 'descricao'), field('Escala', 'escala'), field('Horário', 'horario'),
      field('Pessoa com Deficiência', 'pcd'), field('Tipo de Contrato', 'contrato'), field('Sexo', 'sexo')
    ].join('') + '</div>';
  }
  function renderStability(f, history = false) {
    const records = Array.isArray(f.rmStability) ? f.rmStability : stabilityExamples[f.employee] || [];
    if (!records.length) return '';
    const content = '<div class="lx-stability-list">' + records.map(record => {
      const rows = record.informado === 'Sim' ? [['Data Inicial', date(record.inicio)], ['Data Final', date(record.fim)]] : [];
      (record.detalhes || []).forEach(([label, value]) => rows.push([label, date(value)]));
      return '<article class="lx-stability-record" data-stability-type="' + escape(record.tipo) + '" aria-label="' + escape(record.tipo) + '">' +
        '<div class="lx-stability-record-head"><h3>' + escape(record.tipo) + '</h3>' +
        '<span class="lx-stability-status' + (record.informado === 'Sim' ? ' has-record' : '') + '" data-label="Registro informado"><span>Registro informado:</span> <strong>' + escape(record.informado || '—') + '</strong></span></div>' +
        (rows.length ? readGrid(rows, 'lx-stability-record-grid') : '') +
        '<div class="lx-history-note"><span>Observações</span><strong>' + escape(record.descricao || '—') + '</strong></div></article>';
    }).join('') + '</div>';
    return history ? historyCustomSection('Informações de Estabilidade', 'shield-halved', 'orange', content) : fieldset('Informações de Estabilidade', 'shield-halved', content);
  }
  function renderItems(scope, editable, reviewArea) {
    const rows = state.form[scope];
    const epi = scope === 'epiItems';
    const itemName = epi ? 'EPI' : 'Equipamento';
    const add = editable ? button('add-item', '<i class="fa-solid fa-plus"></i> Adicionar ' + (epi ? 'EPI' : 'Equipamento'), 'primary', 'data-scope="' + scope + '"') : '';
    if (!editable && !rows.length) return '<p class="lx-empty-list">Nenhum item informado pelo solicitante.</p>';
    return '<div class="' + (editable ? 'lx-child-table lx-origin-equipment-table' : 'lx-dismissal-review-items') + '">' + add + rows.map((item, i) => {
      const attrs = ' data-item="' + scope + '" data-index="' + i + '"';
      if (editable) {
        return '<div class="lx-child-row lx-origin-equipment-row lx-dismissal-origin-row">' +
          '<label class="lx-field"><span>' + itemName + ' <b>*</b></span><input type="text"' + attrs + ' data-prop="tipo" value="' + escape(item.tipo || '') + '" /></label>' +
          '<label class="lx-field"><span>Quantidade <b>*</b></span><input type="number" min="1" step="1"' + attrs + ' data-prop="quantidade" value="' + escape(item.quantidade || '') + '" /></label>' +
          '<label class="lx-field lx-item-observation"><span>Observação</span><textarea' + attrs + ' data-prop="descricao">' + escape(item.descricao) + '</textarea></label>' +
          '<button type="button" class="lx-btn-icon lx-btn-danger" data-action="delete-item" data-scope="' + scope + '" data-index="' + i + '" aria-label="Excluir ' + (epi ? 'EPI' : 'equipamento') + ' ' + (i + 1) + '"><i class="fa-solid fa-trash"></i></button></div>';
      }
      const review = reviewArea ? '<label class="lx-field"><span>Deve Ser Devolvido? <b>*</b></span><select' + attrs + ' data-prop="devolver"><option value="">Selecione...</option>' + ['Sim', 'Não'].map(v => '<option' + (item.devolver === v ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></label><label class="lx-field"><span>Observação da Análise</span><textarea' + attrs + ' data-prop="parecer" rows="3">' + escape(item.parecer || '') + '</textarea></label>' : '';
      return '<div class="lx-child-row lx-dismissal-item-row">' + readGrid([[itemName, item.tipo], ['Quantidade', item.quantidade], ['Observação', item.descricao]]) + review + '</div>';
    }).join('') + '</div>';
  }
  function renderItemsSnapshot(f, scope) {
    const epi = scope === 'epiItems';
    const choice = f[epi ? 'epi' : 'infraestrutura'];
    const rows = f[scope] || [];
    let html;
    if (choice !== 'Sim') html = readGrid([[epi ? 'Utiliza EPIs?' : 'Utiliza Equipamentos?', choice]]);
    else if (!rows.length) html = '<div class="lx-empty-list">Nenhum item informado.</div>';
    else html = '<div class="lx-read-table lx-read-table-origin"><div class="lx-read-head"><span>' + (epi ? 'EPI' : 'Equipamento') + '</span><span>Quantidade</span><span>Observação</span></div>' + rows.map(item => '<div class="lx-read-row"><strong>' + escape(item.tipo || '—') + '</strong><strong>' + escape(item.quantidade || '—') + '</strong><strong>' + escape(item.descricao || '—') + '</strong></div>').join('') + '</div>';
    return html + '<div class="lx-history-note"><span>' + (epi ? 'Observações de EPI' : 'Observações da Infraestrutura') + '</span><strong>' + escape(f[epi ? 'epiObs' : 'infraObs'] || '—') + '</strong></div>';
  }
  function renderRequestSnapshot(f, includeAttachments = false, extra = '', files) {
    f = requestSnapshotExamples(f);
    const e = employees.find(item => item.chapa === f.employee) || {};
    return '<div class="lx-dismissal-history">' +
      historySection('Dados do Solicitante', 'user', 'blue', [['Data/Hora', state.created], ['Número Solicitação', 'DES-2026-0042'], ['Solicitante', owners.solicitacao], ['Gerência', 'Gerência Industrial'], ['Filial', 'Matriz - Sarzedo/MG'], ['Gestor Imediato', owners.solicitacao], ['Área Diretoria', 'Diretoria Industrial']]) +
      historySection('Dados de Desligamento', 'user-minus', 'green', [['Colaborador', e.nome], ['Chapa', e.chapa], ['Data de Admissão', date(e.admissao)], ['Cargo Atual', e.cargo], ['Função Atual', e.funcao], ['Nível / Step Atual', e.nivel], ['Setor / Seção Atual', e.secao], ['Centro de Custo Origem', e.centro], ['Descrição do Cargo Atual', e.descricao], ['Sexo', e.sexo], ['Pessoa com Deficiência', e.pcd], ['Tipo de Contrato', e.contrato], ['Escala', e.escala], ['Horário', e.horario]], 'lx-readonly-request-grid lx-dismissal-history-grid') +
      historySection('Parâmetros de Desligamento', 'user-minus', 'blue', [['Tipo de Desligamento', f.tipo], ['Data Prevista de Desligamento', date(f.prevista)]]) +
      renderStability(f, true) +
      historyCustomSection('Infraestrutura do Colaborador', 'laptop', 'purple', renderItemsSnapshot(f, 'infraItems')) +
      historyCustomSection('Equipamentos de Proteção Individual — EPI', 'helmet-safety', 'purple', renderItemsSnapshot(f, 'epiItems')) +
      (includeAttachments ? historyCustomSection('Upload de Arquivos', 'paperclip', 'purple', attachments('solicitacao', '', false, files?.solicitacao)) : '') + extra +
      historyCustomSection('Justificativa de Desligamento', 'comment-dots', 'teal', '<div class="lx-history-text">' + escape(f.justificativa || '—') + '</div>') + '</div>';
  }
  function historyPanel(heading, description, body, key, icon, tone = 'green') {
    const open = key === 'request' ? summaryOpen : !!openApprovals[key];
    return '<div class="lx-view-frame"><div class="lx-view-rail"></div><div class="lx-timeline-dot lx-dot-' + tone + '"><i class="fa-solid fa-' + icon + '"></i></div><section class="lx-view-shell lx-view-shell-history' + (open ? '' : ' lx-view-shell-collapsed') + '"><div class="lx-view-head"><div><h2><button type="button" class="lx-collapse-title" data-collapse="' + key + '" aria-expanded="' + open + '"><span>' + escape(heading) + '</span><i class="fa-solid fa-chevron-down lx-collapse-chevron' + (open ? ' lx-collapse-chevron-open' : '') + '"></i></button></h2><p>' + escape(description) + '</p></div></div><div class="lx-view-body">' + body + '</div></section></div>';
  }
  function isCurrentCorrection() { return !!state.correction && ['correcao', 'retomada'].includes(state.current); }
  function correctionContext() {
    if (isCurrentCorrection()) return state.correction;
    if (!correctionExample || correctionExample.revision !== state.revision) correctionExample = state.correctionExample?.revision === state.revision ? state.correctionExample : { origin: 'rh', note: 'Revisar a data prevista de desligamento e complementar a justificativa antes de reenviar a solicitação.', date: state.created, revision: state.revision, before: JSON.parse(JSON.stringify(state.form)), files: JSON.parse(JSON.stringify(state.files)) };
    state.correctionExample = correctionExample;
    return correctionExample;
  }
  function renderSummary() {
    const context = page.key === 'correcao' ? correctionContext() : null;
    const returned = context && isCurrentCorrection() && state.history.findLast(record => record.action === 'Devolução para correção');
    return historyPanel('Dados de Desligamento', state.created + ' - ' + owners.solicitacao + ' - Gerência Industrial', renderRequestSnapshot(context?.before || state.form, true, '', context?.files || returned?.files), 'request', 'user-pen');
  }
  function previousStages(key) {
    const approvals = ['diretoria', 'rh'];
    const waiting = approvals.concat('paralelo');
    const technical = waiting.concat('sesmt', 'ti');
    const signing = technical.concat('documento', 'assinaturas');
    const signed = state.form.modalidade === 'Presencial' ? signing : signing.concat('validacao_assinaturas');
    if (key === 'correcao' || key === 'reprovada') {
      const action = key === 'correcao' ? 'Devolução para correção' : 'Reprovado';
      const actual = key === 'correcao' ? isCurrentCorrection() : state.current === 'reprovada';
      const source = (actual && state.history.findLast(record => record.action === action)?.area) || (key === 'correcao' ? correctionContext().origin : 'rh');
      return ({ diretoria: ['diretoria'], rh: approvals, sesmt: waiting.concat('sesmt'), ti: waiting.concat('ti'), dp: signed.concat('dp') })[source] || approvals;
    }
    return ({ diretoria: [], rh: ['diretoria'], paralelo: approvals, sesmt: waiting, ti: waiting, documento: technical, assinaturas: technical.concat('documento'), validacao_assinaturas: signing, dp: signed, finalizada: signed.concat('dp') })[key] || [];
  }
  function exampleHistoryRecord(area) {
    const f = requestSnapshotExamples(page.key === 'correcao' ? correctionContext().before : state.form);
    const files = {};
    const exampleFile = (group, name, index) => {
      files[group] = [Object.assign({}, exampleAttachments()[index], { id: 'historico-exemplo-' + group, name, origin: attachmentOrigin(group), date: state.created })];
    };
    if (area === 'rh') {
      f.estabilidade ||= 'Sim'; f.prosseguir ||= 'Sim';
      f.motivoEstabilidade ||= 'Informações de estabilidade do RM avaliadas pelo RH neste cenário.';
    }
    if (area === 'sesmt' || area === 'ti') {
      const epi = area === 'sesmt';
      const scope = epi ? 'epiItems' : 'infraItems';
      f[scope].forEach(item => { item.devolver ||= 'Sim'; item.parecer ||= 'Devolução a conferir pela área responsável.'; });
      if (epi) {
        f.exame ||= 'Sim'; f.exameObs ||= 'Encaminhamento para exame demissional avaliado pelo SESMT.';
        if (f.exame === 'Sim') exampleFile('guia', 'guia-exame-demissional.pdf', 0);
        if (f.epi === 'Sim') exampleFile('termoEpi', 'termo-de-epi.pdf', 1);
      } else if (f.infraestrutura === 'Sim') exampleFile('termoInfra', 'termo-de-infraestrutura.pdf', 2);
    }
    let electronicSigning = null;
    if (area === 'assinaturas' || area === 'validacao_assinaturas') {
      if (f.modalidade === 'Presencial') files.assinado = documentAttachments(state.revision).assinado;
      else {
        electronicSigning = electronicSigningExample(area === 'validacao_assinaturas' ? 'completed' : 'pending', f);
        files.paraAssinatura = [electronicSigning.document];
        if (electronicSigning.signedDocument) files.assinado = [electronicSigning.signedDocument];
      }
    }
    if (area === 'documento') files.documento = documentAttachments(state.revision).documento;
    let snapshot = f;
    if (area === 'dp') {
      const examples = dpExamples(true);
      Object.entries(examples.form).forEach(([key, value]) => { if (!f[key]) f[key] = value; });
      snapshot = { referencia: f, checklist: examples.checks };
    }
    const returned = page.key === 'correcao' && area === correctionContext().origin;
    const rejected = page.key === 'reprovada' && area === previousStages('reprovada').at(-1);
    if (returned && correctionContext().files) Object.assign(files, JSON.parse(JSON.stringify(correctionContext().files)));
    if (rejected && area === 'rh') { f.estabilidade = 'Sim'; f.prosseguir = 'Não'; f.motivoEstabilidade = 'Mandato de representante dos empregados na CIPA informado no cadastro do colaborador.'; }
    return { area, action: returned ? 'Devolução para correção' : rejected ? 'Reprovado' : 'Análise concluída', responsible: owners[area], date: state.created, revision: state.revision, note: returned ? correctionContext().note : rejected ? 'Continuidade do desligamento impedida pelo RH após análise das informações de estabilidade do colaborador.' : 'Etapa aprovada sem ressalvas.', snapshot, files,
      electronicSigning, document: area === 'documento' ? state.document || { date: state.created, by: owners.documento, revision: state.revision } : null };
  }
  function processHistoryEntries() {
    const conditional = ['correcao', 'reprovada'].includes(page.key);
    const previous = previousStages(page.key);
    const sibling = page.key === 'sesmt' ? 'ti' : page.key === 'ti' ? 'sesmt' : '';
    const action = page.key === 'correcao' ? 'Devolução para correção' : 'Reprovado';
    const actual = page.key === 'correcao' ? isCurrentCorrection() : state.current === 'reprovada';
    let cutoff = conditional && actual ? state.history.findLastIndex(record => record.action === action) : -1;
    if (page.key === 'correcao' && state.current === 'retomada') cutoff = state.history.findLastIndex(record => record.action === 'Correção registrada');
    const entries = state.history.map((record, index) => {
      const area = record.action === 'Correção registrada' ? 'correcao' : record.area;
      return { record: Object.assign({}, record, { area }), key: (['diretoria', 'rh', 'sesmt', 'ti'].includes(area) ? 'approval-' : 'history-' + area + '-') + index };
    }).filter(({ record }, index) => {
      const milestone = ['Análise concluída', 'Análises paralelas concluídas', 'Devolução para correção', 'Reprovado', 'Correção registrada', 'Encaminhado para assinaturas', 'Documento enviado para assinatura eletrônica', 'Assinaturas validadas', 'Documento assinado conferido', 'Checklist concluído e processo encerrado'].includes(record.action);
      const generated = record.action === 'Minuta demonstrativa gerada' && !state.history.slice(index + 1).some(next => next.area === 'documento' && next.revision === record.revision && ['Minuta demonstrativa gerada', 'Encaminhado para assinaturas'].includes(next.action));
      if (!milestone && !generated) return false;
      if (conditional) return cutoff >= 0 && index <= cutoff;
      if (page.key === 'paralelo' && ['sesmt', 'ti', 'paralelo', 'documento', 'assinaturas', 'validacao_assinaturas', 'dp'].includes(record.area)) return false;
      const pastRevision = (record.revision || 1) < state.revision;
      return conditional || pastRevision || record.area === 'correcao' || previous.includes(record.area) || (record.area === sibling && record.action === 'Análise concluída');
    });
    // Os exemplos completam somente as etapas anteriores da tela; nunca são gravados como decisões.
    previous.forEach(area => {
      if (!conditional && ['correcao', 'retomada', 'reprovada'].includes(state.current)) return;
      if (entries.some(({ record }) => record.area === area)) return;
      const example = { record: exampleHistoryRecord(area), key: ['diretoria', 'rh', 'sesmt', 'ti'].includes(area) ? 'approval-' + area : 'history-' + area };
      const ranks = { diretoria: 0, rh: 1, paralelo: 2, sesmt: 3, ti: 3, documento: 4, assinaturas: 5, validacao_assinaturas: 6, dp: 7 };
      const next = entries.findIndex(({ record }) => ranks[record.area] > ranks[area]);
      if (next < 0) entries.push(example); else entries.splice(next, 0, example);
    });
    // A espera abre o paralelo: seu componente precede os retornos da mesma revisão.
    entries.filter(({ record }) => record.area === 'paralelo').forEach(entry => {
      const index = entries.indexOf(entry);
      const firstAnalysis = entries.findIndex(({ record }) => ['sesmt', 'ti'].includes(record.area) && (record.revision || 1) === (entry.record.revision || 1));
      if (firstAnalysis >= 0 && firstAnalysis < index) {
        entries.splice(index, 1); entries.splice(firstAnalysis, 0, entry);
      }
    });
    // A espera permanece no fluxo e nos registros, sem um componente no histórico.
    return entries.filter(({ record }) => record.area !== 'paralelo');
  }
  function historyFiles(record, group) {
    return record.files ? record.files[group] || [] : (state.files[group] || []).filter(file => (file.revision || 1) === (record.revision || 1));
  }
  function renderReviewHistory(record) {
    const returned = record.action === 'Devolução para correção';
    const rejected = record.action === 'Reprovado';
    const tone = returned ? 'orange' : rejected ? 'red' : 'green';
    const label = returned ? 'Solicitação devolvida para correção' : rejected ? 'Solicitação reprovada' : ['diretoria', 'rh'].includes(record.area) ? 'Solicitação aprovada' : 'Análise concluída';
    const f = requestSnapshotExamples(record.snapshot);
    let body = historySection('Decisão sobre a Solicitação', 'list-check', tone, [['Decisão', label], ['Responsável', record.responsible], ['Observação', record.note || 'Etapa aprovada sem ressalvas.']]);
    if (record.area === 'rh') body += renderStability(f, true) + historySection('Análise de Estabilidade', 'shield-halved', 'teal', [['Possui Estabilidade?', f.estabilidade], ['Tipo / Motivo da Estabilidade', f.motivoEstabilidade], ['Pode Prosseguir?', f.prosseguir]]);
    if (record.area === 'sesmt') body += historyCustomSection('Exame Demissional', 'stethoscope', 'blue', readGrid([['Necessita Exame Demissional?', f.exame], ['Observações', f.exameObs]]) + (f.exame === 'Sim' ? attachments('guia', 'Guia de encaminhamento para exame', false, historyFiles(record, 'guia')) : ''));
    if (record.area === 'sesmt' || record.area === 'ti') {
      const epi = record.area === 'sesmt';
      const scope = epi ? 'epiItems' : 'infraItems';
      const choice = epi ? 'epi' : 'infraestrutura';
      const group = epi ? 'termoEpi' : 'termoInfra';
      const rows = f[choice] === 'Sim' ? (f[scope] || []).map(item => '<div class="lx-dismissal-review-items">' + readGrid([[epi ? 'EPI' : 'Equipamento', item.tipo], ['Quantidade', item.quantidade], ['Deve Ser Devolvido?', item.devolver], ['Observação do Item', item.descricao], ['Observação da Análise', item.parecer]], 'lx-review-item-history-grid') + '</div>').join('') : '';
      body += historyCustomSection(epi ? 'Avaliação de EPI' : 'Avaliação de Infraestrutura', epi ? 'helmet-safety' : 'laptop', 'purple', readGrid([[epi ? 'Possui EPI Informado?' : 'Possui Infraestrutura Informada?', f[choice]]]) + rows + (f[choice] === 'Sim' ? attachments(group, epi ? 'Termo de EPI' : 'Termo de infraestrutura', false, historyFiles(record, group)) : ''));
    }
    return { body, tone };
  }
  function renderProcessHistory() {
    return processHistoryEntries().map(({ record, key }) => {
      const stage = stages.find(item => item.key === record.area);
      const f = record.snapshot?.referencia || record.snapshot || state.form;
      let body = '', tone = 'green';
      if (['diretoria', 'rh', 'sesmt', 'ti'].includes(record.area)) ({ body, tone } = renderReviewHistory(record));
      if (record.area === 'paralelo') {
        const done = record.action === 'Análises paralelas concluídas' || !['sesmt', 'ti'].includes(page.key);
        body = historySection('Acompanhamento das Análises', 'list-check', 'blue', [['SESMT', done || completed('sesmt') ? 'Aprovado' : 'Pendente'], ['TI', done || completed('ti') ? 'Aprovado' : 'Pendente'], ['Próxima atividade', 'Documento de Desligamento']]);
      }
      if (record.area === 'correcao') body = historySection('Ajustes Realizados', 'rotate-left', 'blue', [['Responsável', record.responsible], ['Observações', record.note]]) + renderRequestSnapshot(f, true, '', record.files);
      if (record.area === 'documento') {
        body = historyCustomSection('Documento de Desligamento', 'file-lines', 'blue', attachments('documento', '', false, historyFiles(record, 'documento').length ? historyFiles(record, 'documento') : documentAttachments(record.revision).documento));
      }
      if (record.area === 'assinaturas') {
        const electronic = f.modalidade === 'Eletrônica';
        body = historySection('Modalidade de Assinatura', 'pen-nib', 'teal', [['Modalidade', f.modalidade]]) + (electronic ?
          historyCustomSection('Envio para Assinatura Eletrônica', 'paper-plane', 'blue', signingSummary(record.electronicSigning || electronicSigningExample('pending', f, record.revision))) :
          historyCustomSection('Documento Assinado', 'paperclip', 'purple', attachments('assinado', '', false, historyFiles(record, 'assinado'))));
      }
      if (record.area === 'validacao_assinaturas') {
        const signing = record.electronicSigning || electronicSigningExample('completed', f, record.revision);
        body = historyCustomSection('Envio para Assinatura Eletrônica', 'paper-plane', 'blue', signingSummary(signing)) +
          historyCustomSection('Acompanhamento das Assinaturas', 'file-signature', 'teal', signingStatus(signing)) +
          historyCustomSection('Documento Assinado', 'paperclip', 'purple', attachments('assinado', '', false, historyFiles(record, 'assinado')));
      }
      if (record.area === 'dp') {
        const e = employees.find(item => item.chapa === f.employee) || {};
        const returned = record.action === 'Devolução para correção';
        if (returned) tone = 'orange';
        body = historySection('Dados da Rescisão', 'id-card', 'blue', dpReferenceRows(f, e)) + renderChecklists(true, record.snapshot?.checklist || {}) +
          (returned ? historySection('Decisão sobre a Solicitação', 'clipboard-check', 'orange', [['Decisão', 'Solicitação devolvida para correção'], ['Responsável', record.responsible], ['Data da Análise', record.date], ['Observações Finais', record.note]], 'lx-dp-conclusion-history-grid') :
            historySection('Conclusão pelo Departamento Pessoal', 'clipboard-check', 'teal', [['Checklist Concluído?', f.checklistConcluido], ['Responsável', record.responsible], ['Data da Conclusão', record.date], ['Observações Finais', f.finais]], 'lx-dp-conclusion-history-grid'));
      }
      const department = { diretoria: 'Diretoria Industrial', rh: 'Recursos Humanos', paralelo: 'Recursos Humanos', sesmt: 'Segurança do Trabalho', ti: 'Tecnologia da Informação', documento: 'Recursos Humanos', assinaturas: 'Recursos Humanos', validacao_assinaturas: 'Sistema', dp: 'Departamento Pessoal', correcao: 'Gerência Industrial' }[record.area];
      return historyPanel(stage.title, record.date + ' - ' + record.responsible + ' - ' + department, body, key, stage.icon, tone);
    }).join('');
  }
  function decision(key) { return state.decisions[key] || (state.decisions[key] = { value: '', note: '' }); }
  function decisionFields(key) {
    const d = decision(key);
    if (!d.value) d.value = 'approve';
    const options = key === 'diretoria' ? [['approve', 'Aprovar Solicitação', 'A solicitação seguirá para aprovação do RH.'], ['return', 'Devolver para Correção', 'A solicitação retornará ao solicitante para ajustes.'], ['reject', 'Reprovar Solicitação', 'A solicitação será encerrada como reprovada.']] : key === 'rh' ? [['approve', 'Aprovar Continuidade', 'Abrir SESMT e TI em paralelo.'], ['return', 'Devolver para Correção', 'A solicitação retornará ao solicitante para ajustes.'], ['reject', 'Impedir Continuidade', 'Encerrar conforme o parecer do RH.']] : [['approve', 'Concluir Análise', 'Aguardar a conclusão da outra atividade paralela.'], ['return', 'Devolver para Correção', 'A solicitação retornará ao solicitante para ajustes.']];
    const hidden = key === 'diretoria' && d.value === 'approve';
    const noteLabel = key === 'diretoria' ? 'Justificativa' : 'Parecer do ' + key.toUpperCase();
    return fieldset('Decisão de Aprovação', 'list-check', '<div class="lx-current-decision" data-approval="' + key + '">' + options.map(([value, label, text]) => '<label class="lx-decision-option lx-decision-' + (value === 'approve' ? 'approve' : value === 'return' ? 'return' : 'reject') + (value === d.value ? ' lx-decision-option-selected' : '') + '"><input type="radio" name="decision" data-decision="' + key + '" value="' + value + '"' + (value === d.value ? ' checked' : '') + ' /><div><span>' + label + '</span><p>' + text + '</p></div></label>').join('') + '<label class="lx-field' + (hidden ? ' lx-hidden' : '') + '" data-approval-justification><span>' + noteLabel + ' <b>*</b></span><textarea data-note="' + key + '" rows="3" placeholder="' + (key === 'diretoria' ? 'Informe o motivo da devolução ou reprovação...' : 'Informe o parecer da área...') + '">' + escape(d.note) + '</textarea></label>' + actions('decide', 'Enviar Decisão') + '</div>');
  }
  function renderReview(key) {
    let content = '';
    if (key === 'rh') content = renderStability(state.form) + fieldset('Análise de Estabilidade', 'shield-halved', grid([radios('Possui Estabilidade?', 'estabilidade', ['Sim', 'Não']), radios('Pode Prosseguir com o Desligamento?', 'prosseguir', ['Sim', 'Não'])], 2) + input('Tipo / Motivo da Estabilidade', 'motivoEstabilidade', { textarea: true, required: state.form.estabilidade === 'Sim' }));
    if (['sesmt', 'ti'].includes(key)) {
      if (key === 'sesmt') content += fieldset('Exame Demissional', 'stethoscope', radios('Necessita Exame Demissional?', 'exame', ['Sim', 'Não']) + (state.form.exame === 'Sim' ? attachments('guia', 'Guia de encaminhamento para exame', true) : '') + input('Observações sobre o Exame', 'exameObs', { textarea: true }));
      const epi = key === 'sesmt'; const scope = epi ? 'epiItems' : 'infraItems';
      content += fieldset(epi ? 'Avaliação de EPI' : 'Avaliação de Infraestrutura', epi ? 'helmet-safety' : 'laptop', readGrid([[epi ? 'Possui EPI Informado?' : 'Possui Infraestrutura Informada?', state.form[epi ? 'epi' : 'infraestrutura']]]) + (state.form[epi ? 'epi' : 'infraestrutura'] === 'Sim' ? renderItems(scope, false, key) : '<p class="lx-help">Nenhum item declarado pelo solicitante. A área pode devolver para complementação.</p>') + attachments(epi ? 'termoEpi' : 'termoInfra', epi ? 'Termo de EPI assinado na admissão' : 'Termo de responsabilidade / entrega assinado na admissão', true));
    }
    return content + decisionFields(key);
  }
  function parallelStatus() {
    return '<div class="lx-parallel">' + ['sesmt', 'ti'].map(k => '<a href="' + url(k) + '" class="lx-parallel-card ' + (completed(k) ? 'is-done' : '') + '"><i class="fa-solid fa-' + (k === 'sesmt' ? 'helmet-safety' : 'laptop') + '"></i><strong>' + k.toUpperCase() + '</strong><span>' + (completed(k) ? 'Aprovado' : 'Pendente') + '</span></a>').join('') + '</div>' + notice('SESMT e TI realizam suas análises ao mesmo tempo. Aguarde a aprovação das duas áreas para seguir para o Documento de Desligamento.', 'lx-info');
  }
  function renderParallelWait() {
    const ready = completed('sesmt') && completed('ti');
    return parallelStatus() + '<div class="lx-actions">' + button('continue-parallel', '<i class="fa-solid fa-paper-plane"></i> Seguir para Documento de Desligamento', 'primary', ready ? '' : 'disabled') + '</div>';
  }
  function attachmentButton(action, icon, label, group, index, danger = false, source) {
    return '<button type="button" class="lx-btn-icon lx-btn-' + (danger ? 'danger' : 'secondary') + '" data-action="' + action + '" data-group="' + group + '" data-index="' + index + '" data-file-source="' + source + '" aria-label="' + label + '"><i class="fa-solid fa-' + icon + '"></i></button>';
  }
  function attachmentOrigin(group) {
    return { solicitacao: 'Solicitante', guia: 'SESMT', termoEpi: 'SESMT', termoInfra: 'TI', documento: 'RH', paraAssinatura: 'RH', assinado: 'Colaborador / Gestor' }[group] || 'Anexo';
  }
  function attachments(group, label, editable, files = state.files[group] || []) {
    const source = displayedFiles.push(files) - 1;
    return '<div class="lx-upload" data-file-group="' + group + '">' + (label ? '<strong>' + label + '</strong>' : '') + (editable ? '<div class="lx-dropzone" data-drop="' + group + '"><i class="fa-solid fa-cloud-arrow-up"></i><p>Arraste e solte seus arquivos aqui</p><span>ou</span><button type="button" class="lx-btn-outline" data-action="choose-file" data-group="' + group + '">Escolher Arquivo</button><input class="lx-file-input" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" data-upload="' + group + '" multiple /></div>' : '') + '<div class="lx-attachment-list">' + (files.length ? files.map((f, i) => '<div class="lx-attachment-row"><div class="lx-attachment-info"><i class="fa-solid fa-file-lines"></i><div><strong>' + escape(f.name) + '</strong><span>' + Math.ceil(f.size / 1024) + ' KB - ' + escape(f.origin || attachmentOrigin(group)) + '</span></div></div><div class="lx-attachment-actions">' + attachmentButton('file', 'eye', 'Visualizar Anexo', group, i, false, source) + attachmentButton('download-file', 'download', 'Baixar Anexo', group, i, false, source) + (editable ? attachmentButton('delete-file', 'trash', 'Excluir Anexo', group, i, true, source) : '') + '</div></div>').join('') : '<div class="lx-empty-list">Nenhum arquivo anexado.</div>') + '</div></div>';
  }
  function renderDocument() {
    return fieldset('Documento de Desligamento', 'file-lines', attachments('documento', '', false)) + actions('send-signatures', 'Encaminhar para Assinatura');
  }
  function renderSignatures() {
    const electronic = state.form.modalidade === 'Eletrônica';
    return fieldset('Modalidade de Assinatura', 'pen-nib', radios('Como o Documento Será Assinado?', 'modalidade', ['Eletrônica', 'Presencial'])) +
      (electronic ? notice('O documento será gerado automaticamente e enviado à plataforma digital.') :
        fieldset('Documento Assinado', 'paperclip', attachments('assinado', '', true))) + actions('finish-signatures', electronic ? 'Gerar e Enviar para Assinatura' : 'Encaminhar documento assinado ao DP');
  }
  function automaticDocument(group, revision, timestamp) {
    return Object.assign({}, documentAttachments(revision)[group][0], { id: 'automatico-' + group + '-' + revision, origin: group === 'assinado' ? 'Plataforma digital' : 'Gerado automaticamente', by: 'Sistema', date: timestamp });
  }
  function electronicSigningExample(status = 'partial', form = state.form, revision = state.revision) {
    const e = employees.find(item => item.chapa === form.employee) || employees[0];
    const timestamp = state.created;
    const signers = [
      { role: 'Colaborador', name: e.nome, email: ({ '000731': 'carlos.pereira', '000918': 'fernanda.lima', '001042': 'rafael.souza' }[e.chapa]) + '@exemplo.com' },
      { role: 'Gestor', name: owners.solicitacao, email: 'eduardo.martins@exemplo.com' }
    ].map((signer, index) => Object.assign(signer, { status: status === 'completed' || (status === 'partial' && index === 0) ? 'Assinado' : 'Pendente', signedAt: status === 'completed' || (status === 'partial' && index === 0) ? timestamp : '' }));
    return { revision, employee: e.chapa, provider: 'Plataforma digital', protocol: 'DESL-' + e.chapa + '-R' + revision, sentAt: timestamp, updatedAt: timestamp, signers,
      document: automaticDocument('paraAssinatura', revision, timestamp), signedDocument: status === 'completed' ? automaticDocument('assinado', revision, timestamp) : null, validatedAt: status === 'completed' ? timestamp : '' };
  }
  function electronicSignaturesComplete(signing) {
    return !!signing && signing.revision === state.revision && signing.employee === state.form.employee &&
      ['Colaborador', 'Gestor'].every(role => signing.signers?.some(signer => signer.role === role && signer.status === 'Assinado' && signer.signedAt));
  }
  function electronicDocumentReady(signing) {
    return electronicSignaturesComplete(signing) && signing.signedDocument?.revision === state.revision &&
      state.files.assinado?.some(file => file.id === signing.signedDocument.id && file.revision === state.revision);
  }
  function advanceSignatureTracking() {
    if (state.current !== 'validacao_assinaturas' || state.form.modalidade !== 'Eletrônica' || !electronicDocumentReady(state.electronicSigning)) return false;
    state.electronicSigning.validatedAt = now();
    state.current = 'dp';
    log('validacao_assinaturas', 'Assinaturas validadas', 'Assinaturas eletrônicas concluídas e documento assinado recebido. Encaminhamento automático ao DP.', historyEvidence());
    save();
    return true;
  }
  function signingSummary(signing) {
    const signed = signing.signers.length > 0 && signing.signers.every(signer => signer.status === 'Assinado');
    return readGrid([['Documento', signing.document?.name || 'documento-de-desligamento.pdf'], ['Plataforma', signing.provider], ['Protocolo do Documento', signing.protocol], ['Data do Envio', signing.sentAt], ['Última Atualização', signing.updatedAt], ['Status do Documento', signed ? 'Assinado' : 'Pendente']], 'lx-signing-summary-grid');
  }
  function signingStatus(signing, current = false) {
    return '<div class="lx-signature-tracking"' + (current ? ' data-signature-tracking' : '') + '>' + signing.signers.map(signer =>
      '<article class="lx-signing-person" data-signer="' + escape(signer.role) + '"><div class="lx-stability-record-head"><h3>' + escape(signer.role) + '</h3><span class="lx-signing-status' + (signer.status === 'Assinado' ? ' is-signed' : '') + '"><i class="fa-solid fa-' + (signer.status === 'Assinado' ? 'circle-check' : 'clock') + '"></i> ' + escape(signer.status) + '</span></div>' + readGrid([['Nome', signer.name], ['E-mail', signer.email], ['Assinou o Documento?', signer.status === 'Assinado' ? 'Sim' : 'Não'], ['Data da Assinatura', signer.signedAt || 'Aguardando assinatura']], 'lx-signing-person-grid') + '</article>'
    ).join('') + '</div>';
  }
  function renderSignatureTracking() {
    const signing = state.electronicSigning || electronicSigningExample();
    const signed = !!signing.signedDocument;
    const document = signing.signedDocument || signing.document || automaticDocument('paraAssinatura', signing.revision || state.revision, signing.sentAt || state.created);
    return fieldset('Envio para Assinatura Eletrônica', 'paper-plane', signingSummary(signing)) +
      fieldset('Acompanhamento das Assinaturas', 'file-signature', signingStatus(signing, true)) +
      fieldset(signed ? 'Documento Assinado' : 'Documento para Assinatura', signed ? 'file-circle-check' : 'file-lines', attachments(signed ? 'assinado' : 'paraAssinatura', '', false, [document]));
  }
  function signatureCard(role, name, key, form = state.form, readonly = false) {
    const image = form[key + 'Imagem'];
    const signed = !!form[key];
    return '<div class="lx-signature-card' + (signed ? ' is-signed' : '') + '"><div class="lx-signature-head"><div><strong>' + role + '</strong><p>' + escape(name) + '</p></div><span class="lx-signature-status"><i class="fa-solid fa-' + (signed ? 'circle-check' : 'clock') + '"></i> ' + (signed ? 'Assinado' : 'Pendente') + '</span></div><div class="lx-signature-preview">' + (image ? '<img src="' + escape(image) + '" alt="Assinatura de ' + escape(name) + '" />' : '<i class="fa-solid fa-signature" aria-hidden="true"></i><span>' + (signed ? 'Assinatura registrada' : 'Aguardando assinatura') + '</span>') + '</div>' + (signed ? '<span>Assinado em ' + escape(form[key]) + '</span>' : '') + (readonly ? '' : button('sign', '<i class="fa-solid fa-pen-nib"></i> Assinatura Eletrônica', 'secondary', 'data-sign="' + key + '"')) + '</div>';
  }
  function openSignature(key) {
    if (!['assinaturaColaborador', 'assinaturaGestor'].includes(key) || state.form.modalidade !== 'Eletrônica') return;
    const name = key === 'assinaturaColaborador' ? employee()?.nome : owners.solicitacao;
    let canvas, hasInk = false;
    modal('Assinatura Eletrônica', '<p class="lx-signature-signer"><strong>' + escape(name) + '</strong></p><p id="signatureInstructions">Assine no espaço abaixo usando o mouse ou o toque.</p><div class="lx-signature-pad"><canvas id="signatureCanvas" width="1000" height="300" role="img" aria-label="Área para desenhar a assinatura de ' + escape(name) + '" aria-describedby="signatureInstructions"></canvas></div><div class="lx-signature-toolbar"><span id="signatureError" class="lx-error-message" role="alert"></span><button type="button" class="lx-btn lx-btn-secondary" id="clearSignature"><i class="fa-solid fa-eraser"></i> Limpar assinatura</button></div>', () => {
      state.form[key] = now(); state.form[key + 'Imagem'] = canvas.toDataURL('image/png');
      delete fieldErrors['sign.' + key]; errors = Object.values(fieldErrors);
      log('assinaturas', 'Assinatura eletrônica registrada', (key === 'assinaturaColaborador' ? 'Colaborador: ' : 'Gestor: ') + name);
      save(); render();
    }, 'Confirmar Assinatura', 'pen-nib', () => {
      if (hasInk) return true;
      document.getElementById('signatureError').textContent = 'Desenhe a assinatura antes de confirmar.';
      document.querySelector('.lx-signature-pad').classList.add('lx-error'); return false;
    });
    dialog.classList.add('lx-modal-wide');
    canvas = document.getElementById('signatureCanvas');
    const bounds = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(bounds.width * ratio); canvas.height = Math.round(bounds.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#163a63'; ctx.fillStyle = '#163a63'; ctx.lineWidth = 2.4 * ratio; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let pointer = null;
    const point = event => { const r = canvas.getBoundingClientRect(); return [(event.clientX - r.left) * canvas.width / r.width, (event.clientY - r.top) * canvas.height / r.height]; };
    canvas.addEventListener('pointerdown', event => {
      if (pointer !== null || event.button !== 0) return;
      event.preventDefault(); pointer = event.pointerId; canvas.setPointerCapture(pointer);
      const [x, y] = point(event); ctx.beginPath(); ctx.arc(x, y, 1.2 * ratio, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y); hasInk = true;
      document.getElementById('signatureError').textContent = ''; canvas.parentElement.classList.remove('lx-error');
    });
    canvas.addEventListener('pointermove', event => { if (pointer !== event.pointerId) return; event.preventDefault(); ctx.lineTo(...point(event)); ctx.stroke(); });
    const stop = event => { if (event.pointerId === pointer) pointer = null; };
    canvas.addEventListener('pointerup', stop); canvas.addEventListener('pointercancel', stop);
    document.getElementById('clearSignature').addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); hasInk = false; });
  }
  function clearElectronicSignatures() {
    ['assinaturaColaborador', 'assinaturaGestor'].forEach(key => { state.form[key] = ''; delete state.form[key + 'Imagem']; });
  }
  function signaturesReady() {
    if (state.form.modalidade === 'Presencial') return !!state.files.assinado?.some(file => (file.revision || 1) === state.revision);
    const signing = state.electronicSigning;
    if (signing) return electronicDocumentReady(signing) && !!signing.validatedAt;
    // Preserva conclusões registradas pela versão anterior, sem liberar novos envios.
    return state.history.some(record => record.area === 'assinaturas' && record.action === 'Documento assinado conferido' && record.revision === state.revision && record.snapshot?.modalidade === 'Eletrônica');
  }
  function allCheckIds() { return checklistGroups.flatMap(([group, , items]) => items.map((_, i) => group + '-' + i)); }
  function checkDone(id, checks = state.checks) { return ['conferido', 'na'].includes(checks[id]?.status); }
  function money(value) {
    if (value == null || value === '') return '—';
    const raw = String(value).replace(/[^0-9,.-]/g, '');
    const amount = Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw);
    return Number.isFinite(amount) ? amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ') : '—';
  }
  function dpReferenceRows(f, e) {
    return [['Nome', e.nome, 'dp_nome'], ['Chapa', e.chapa, 'dp_chapa'], ['CPF', f.cpf, 'cpf'], ['PIS', f.pis, 'pis'], ['Data de Admissão', date(e.admissao), 'dp_admissao'], ['Saldo FGTS (R$)', money(f.saldoFgts), 'saldoFgts'], ['Homologação', f.homologacao, 'homologacao'], ['Data de Demissão', date(f.demissao), 'demissao'], ['Tipo de Demissão', normalizeTerminationType(f.tipo), 'tipo'], ['Projeção de Aviso', date(f.projecaoAviso), 'projecaoAviso'], ['Filial', e.filial, 'dp_filial']];
  }
  function renderChecklists(readonly = false, checks = state.checks) {
    const ids = allCheckIds();
    const count = ids.filter(id => checkDone(id, checks)).length;
    const percent = Math.round(count / ids.length * 100);
    const progress = '<div class="lx-check-progress"><div class="lx-check-progress-title"><span class="lx-section-icon"><i class="fa-solid fa-list-check"></i></span><div><strong>Checklist da Rescisão</strong><p>' + (readonly ? 'Conferência registrada pelo Departamento Pessoal.' : 'Preencha o checklist linha a linha, conforme a conferência dos documentos e lançamentos da rescisão.') + '</p></div></div><div class="lx-check-progress-summary"><span><b' + (readonly ? '' : ' id="checkCount"') + '>' + count + '</b> de ' + ids.length + ' concluídos</span><div class="lx-check-progress-meter"><progress' + (readonly ? '' : ' id="checkProgress"') + ' value="' + count + '" max="' + ids.length + '" aria-label="Progresso do checklist"></progress><strong data-check-percent>' + percent + '%</strong></div></div></div>';
    return progress + checklistGroups.map(([group, heading, items]) => {
      const done = items.filter((_, index) => checkDone(group + '-' + index, checks)).length;
      const open = readonly || openChecklists[group] !== false;
      const rows = items.map((name, index) => {
        const id = group + '-' + index;
        const item = checks[id] || {};
        const status = checkDone(id, checks) ? item.status : '';
        const markedDate = checkDate(item.date) || (status && item.date == null ? checklistExampleDate : '');
        const isoDate = markedDate.split('/').reverse().join('-');
        const dateField = readonly ? '<div class="lx-check-date-box"><i class="fa-regular fa-calendar" aria-hidden="true"></i>' + (markedDate ? '<time class="lx-check-date" data-check-date="' + id + '" datetime="' + isoDate + '">' + markedDate + '</time>' : '<span class="lx-check-date-placeholder">—</span>') + '</div>' : '<label class="lx-field lx-check-date-field"><span class="lx-check-sr-only">Data da marcação de ' + escape(name) + '</span><input type="date" lang="pt-BR" data-check-date="' + id + '" value="' + isoDate + '" /></label>';
        const choices = [['conferido', 'Conferido', 'circle-check', 'check'], ['', 'Pendente', 'clock', 'pending'], ['na', 'Não se aplica', 'ban', 'na']];
        const statusContent = readonly ? '<span class="lx-check-status-badge is-' + (status || 'pending') + '">' + choices.find(choice => choice[0] === status)[1] + '</span>' : '<div class="lx-check-options" role="group" aria-label="Status de ' + escape(name) + '">' + choices.map(([value, label, icon, attr]) => '<label class="lx-check-choice is-' + (value || 'pending') + (status === value ? ' is-selected' : '') + '"><input type="radio" name="check-' + id + '" data-' + attr + '="' + id + '" value="' + value + '"' + (status === value ? ' checked' : '') + ' /><span><i class="fa-solid fa-' + icon + '" aria-hidden="true"></i> ' + label + '</span></label>').join('') + '</div>';
        const note = escape(item.note || '');
        const observation = readonly ? '<span class="lx-check-readonly-note">' + note + '</span>' : '<label class="lx-field lx-check-observation"><span class="lx-check-sr-only">Observação de ' + escape(name) + '</span><input type="text" data-check-note="' + id + '" value="' + note + '" maxlength="500" aria-describedby="check-note-count-' + id + '" placeholder="Digite a observação..." /><small class="lx-check-note-count" id="check-note-count-' + id + '"><span data-note-count="' + id + '">' + (item.note || '').length + '</span>/500</small></label>';
        return '<tr class="lx-check-row' + (readonly ? '' : ' lx-check-row-editor') + '"><td class="lx-check-number" data-label="#">' + (index + 1) + '</td><th scope="row" class="lx-check-item">' + escape(name) + '</th><td data-label="Status">' + statusContent + '</td><td data-label="Data da marcação">' + dateField + '</td><td data-label="Observação">' + observation + '</td></tr>';
      }).join('');
      return '<details class="lx-check-group" data-check-group="' + group + '"' + (readonly ? '' : ' data-check-editor') + (open ? ' open' : '') + '><summary><i class="fa-solid fa-chevron-down lx-check-chevron" aria-hidden="true"></i><strong>' + heading + '</strong><span class="lx-check-group-badge">' + items.length + ' itens</span><span class="lx-check-group-count">' + done + ' de ' + items.length + ' concluídos</span></summary><div class="lx-check-table-scroll"><table class="lx-check-table"><colgroup><col class="lx-check-col-number"><col class="lx-check-col-item"><col class="lx-check-col-status"><col class="lx-check-col-date"><col class="lx-check-col-note"></colgroup><thead><tr><th scope="col">#</th><th scope="col">Item</th><th scope="col">Status</th><th scope="col">Data da Marcação</th><th scope="col">Observação</th></tr></thead><tbody>' + rows + '</tbody></table></div></details>';
    }).join('');
  }
  function renderDP() {
    const e = employee() || {};
    const fields = dpReferenceRows(state.form, e).map(([label, value, key]) => input(label, key, { value: value || '—', readonly: true })).join('');
    return fieldset('Dados de Referência da Rescisão', 'address-card', '<div class="lx-grid-3 lx-dp-reference-grid" data-dp-reference>' + fields + '</div>') + renderChecklists() + renderDPConclusion();
  }
  function renderDPConclusion() {
    const correction = state.form.checklistConcluido === 'Não';
    const options = [
      ['Sim', 'Concluir Checklist', 'Confirmar a conferência dos itens aplicáveis e encerrar o processo.', 'approve'],
      ['Não', 'Enviar para Correção', 'Retornar para Correção da Solicitação com a observação do Departamento Pessoal.', 'return']
    ];
    return fieldset('Decisão de Aprovação', 'list-check', '<div class="lx-current-decision" data-approval="dp">' + options.map(([value, label, text, tone]) =>
      '<label class="lx-decision-option lx-decision-' + tone + (state.form.checklistConcluido === value ? ' lx-decision-option-selected' : '') + '"><input type="radio" name="checklistConcluido" data-field="checklistConcluido" value="' + value + '"' + (state.form.checklistConcluido === value ? ' checked' : '') + ' /><div><span>' + label + '</span><p>' + text + '</p></div></label>'
    ).join('') + input('Observações Finais', 'finais', { textarea: true, required: correction }) + actions('finish', correction ? 'Enviar para Correção' : 'Concluir Checklist e Encerrar Processo') + '</div>');
  }
  function renderEnding() {
    const ended = page.key === 'finalizada';
    const rejection = state.current === 'reprovada' && state.history.findLast(record => record.action === 'Reprovado');
    const source = rejection?.area || 'rh';
    return '<div class="lx-history-stage lx-history-stage-' + (ended ? 'green' : 'red') + '">' + (ended ? 'Desligamento finalizado após a conferência do documento assinado e a conclusão do checklist pelo Departamento Pessoal.' : 'Solicitação de desligamento encerrada como reprovada após decisão ' + (source === 'rh' ? 'do RH' : 'da Diretoria') + '.') + '</div>';
  }
  function invalid(key, message = 'Campo obrigatório.') {
    fieldErrors[key] = message;
    errors = Object.values(fieldErrors);
  }
  function errorTarget(key) {
    const parts = key.split('.');
    if (['infraItems', 'epiItems'].includes(parts[0])) return view.querySelector('[data-item="' + parts[0] + '"][data-index="' + parts[1] + '"][data-prop="' + parts[2] + '"]')?.closest('.lx-field');
    if (parts[0] === 'files') return view.querySelector('[data-upload="' + parts[1] + '"]')?.closest('.lx-upload');
    if (parts[0] === 'sign') return view.querySelector('[data-sign="' + parts[1] + '"]')?.closest('.lx-signature-card');
    if (parts[0] === 'check') return view.querySelector('[data-check="' + parts[1] + '"]')?.closest('.lx-check-row');
    if (parts[0] === 'checkNote') return view.querySelector('[data-check-note="' + parts[1] + '"]')?.closest('.lx-field');
    if (key === 'decision') return view.querySelector('.lx-current-decision');
    if (key === 'note') return view.querySelector('[data-note]')?.closest('.lx-field');
    if (key === 'checklist') return view.querySelector('.lx-check-progress');
    if (key === 'checklistConcluido') return view.querySelector('[data-approval="dp"]');
    if (key === 'electronicSigning') return view.querySelector('[data-signature-tracking]');
    if (key === 'document') return view.querySelector('.lx-view-shell:last-of-type .lx-fieldset');
    return view.querySelector('[data-field="' + key + '"]')?.closest('.lx-field');
  }
  function applyFieldErrors() {
    Object.entries(fieldErrors).forEach(([key, message]) => {
      const wrap = errorTarget(key);
      if (!wrap) return;
      wrap.classList.add('lx-error'); wrap.dataset.errorKey = key;
      const node = document.createElement('small');
      node.className = 'lx-error-message'; node.id = 'error-' + key.replace(/[^a-zA-Z0-9_-]/g, '-'); node.textContent = message; node.setAttribute('role', 'alert');
      wrap.appendChild(node);
      wrap.querySelectorAll('input, select, textarea, [data-sign]').forEach(control => {
        control.setAttribute('aria-invalid', 'true'); control.setAttribute('aria-describedby', node.id);
      });
    });
  }
  function clearFieldError(control) {
    const wrap = control.closest('[data-error-key]');
    if (!wrap) return;
    delete fieldErrors[wrap.dataset.errorKey]; errors = Object.values(fieldErrors);
    wrap.classList.remove('lx-error'); delete wrap.dataset.errorKey;
    wrap.querySelectorAll('.lx-error-message').forEach(node => node.remove());
    wrap.querySelectorAll('[aria-invalid]').forEach(node => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
  }
  function validateRequest() {
    if (!employee()) invalid('employee');
    if (!terminationTypes.includes(state.form.tipo)) invalid('tipo');
    if (!state.form.justificativa.trim()) invalid('justificativa');
    if (!state.form.prevista) invalid('prevista');
    [['infraestrutura', 'infraItems', 'equipamento'], ['epi', 'epiItems', 'EPI']].forEach(([choice, scope, label]) => {
      if (!['Sim', 'Não'].includes(state.form[choice])) invalid(choice);
      if (state.form[choice] !== 'Sim') return;
      if (!state.form[scope].length) invalid(choice, 'Informe ao menos um ' + label + '.');
      state.form[scope].forEach((item, index) => {
        if (!item.tipo.trim()) invalid(scope + '.' + index + '.tipo');
        if (item.tipo === 'Outros' && !item.descricao.trim()) invalid(scope + '.' + index + '.descricao');
        if (!Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) < 1) invalid(scope + '.' + index + '.quantidade', 'Quantidade inválida.');
      });
    });
  }
  function validateReview(key) {
    const d = decision(key);
    if (!d.value) invalid('decision', 'Selecione uma decisão.');
    if (!(key === 'diretoria' && d.value === 'approve') && !d.note.trim()) invalid('note');
    if (d.value === 'return' || (key === 'diretoria' && d.value === 'reject')) return;
    if (key === 'rh') {
      if (!state.form.estabilidade) invalid('estabilidade');
      if (state.form.estabilidade === 'Sim' && !state.form.motivoEstabilidade?.trim()) invalid('motivoEstabilidade');
      if (!state.form.prosseguir) invalid('prosseguir');
      if (d.value === 'approve' && state.form.prosseguir !== 'Sim') invalid('prosseguir', 'A continuidade só pode ser aprovada com parecer que permita prosseguir.');
      if (d.value === 'reject' && state.form.prosseguir !== 'Não') invalid('prosseguir', 'Para impedir a continuidade, indique que o desligamento não pode prosseguir.');
    }
    if (key === 'sesmt' && d.value === 'approve') {
      if (!state.form.exame) invalid('exame');
      if (state.form.exame === 'Sim' && !state.files.guia?.length) invalid('files.guia', 'Anexe a guia de encaminhamento para exame.');
    }
    if (['sesmt', 'ti'].includes(key) && d.value === 'approve') {
      const scope = key === 'sesmt' ? 'epiItems' : 'infraItems';
      const choice = key === 'sesmt' ? 'epi' : 'infraestrutura';
      const group = key === 'sesmt' ? 'termoEpi' : 'termoInfra';
      if (state.form[choice] === 'Sim') {
        state.form[scope].forEach((item, index) => { if (!item.devolver) invalid(scope + '.' + index + '.devolver'); });
        if (!state.files[group]?.length) invalid('files.' + group, 'Anexe o termo assinado na admissão referente aos itens informados.');
      }
    }
  }
  function fail() {
    if (!errors.length) return false;
    render();
    window.requestAnimationFrame(() => {
      const first = view.querySelector('.lx-error');
      if (!first) return;
      const group = first.closest('details');
      if (group) group.open = true;
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = Array.from(first.querySelectorAll('input:not([readonly]):not([type="hidden"]), select, textarea:not([readonly]), button')).find(node => !node.disabled && node.getClientRects().length);
      focusable?.focus({ preventScroll: true });
      closeSelects();
    });
    return true;
  }
  function guard(key = page.key) {
    if (canInteract(key)) return true;
    feedback('Conclua a atividade atual antes de movimentar esta etapa: ' + labels[state.current] + '.', true); return false;
  }
  function approveReview(key) {
    const d = decision(key); d.date = now(); d.responsible = owners[key];
    const evidence = historyEvidence();
    const snapshot = evidence.snapshot;
    if (d.value === 'return') {
      state.correction = { origin: key, note: d.note, before: snapshot, date: d.date };
      log(key, 'Devolução para correção', d.note, evidence); state.current = 'correcao'; go('correcao'); return;
    }
    if (d.value === 'reject') {
      log(key, 'Reprovado', d.note, evidence); state.current = 'reprovada'; state.endedAt = d.date; state.endedBy = owners[key]; state.endNote = d.note; go('reprovada'); return;
    }
    d.completed = true; log(key, 'Análise concluída', d.note, evidence);
    if (key === 'diretoria') { state.current = 'rh'; go('rh'); }
    else { state.current = 'paralelo'; go('paralelo'); }
  }
  function handleAction(node) {
    const action = node.dataset.action;
    if (['submit', 'correct', 'decide', 'finish', 'finish-signatures', 'add-item', 'delete-item'].includes(action)) { errors = []; fieldErrors = {}; }
    if (action === 'draft') {
      modal('Salvar Rascunho', '<p>Deseja salvar os dados preenchidos até o momento?</p>', () => { if (save()) feedback('Rascunho salvo neste navegador.'); }, 'Salvar', 'save'); return;
    }
    if (action === 'reset') { modal('Reiniciar Simulação?', '<p>Os dados e arquivos deste protótipo serão removidos deste navegador.</p>', async () => {
      try { const db = await openDB(); await dbRequest(db, 'readwrite', store => store.clear()); } catch (_) { /* The form can be reset even if IndexedDB is unavailable. */ }
      state = freshState(); correctionExample = undefined; save(); if (view) go('solicitacao'); else render();
    }, 'Reiniciar', 'rotate-left'); return; }
    if (action === 'download-file') {
      const file = displayedFiles[+node.dataset.fileSource]?.[+node.dataset.index];
      if (file) modal('Baixar Anexo', '<p>' + escape(file.name) + '</p>', () => openFile(file, true), 'Baixar', 'download');
      return;
    }
    if (action === 'file') { openFile(displayedFiles[+node.dataset.fileSource]?.[+node.dataset.index]); return; }
    if (action === 'choose-file') { if (guard()) document.querySelector('[data-upload="' + node.dataset.group + '"]').click(); return; }
    if (action === 'resume') {
      if (state.current !== 'retomada') return;
      const target = state.form.resumeArea || state.correction.origin;
      modal('Simular Reanálise?', '<p>A regra BPM definitiva permanece pendente. Esta escolha serve apenas para demonstrar a reanálise por ' + escape(title(target)) + '.</p><p>As análises a partir da área selecionada serão refeitas. Os registros anteriores permanecem no histórico.</p>', () => {
        const clear = target === 'diretoria' ? ['diretoria', 'rh', 'sesmt', 'ti'] : target === 'rh' ? ['rh', 'sesmt', 'ti'] : ['sesmt', 'ti'];
        clear.forEach(k => { delete state.decisions[k]; });
        state.files.anteriores = (state.files.anteriores || []).concat(state.files.assinado || []);
        state.document = null; state.electronicSigning = null; state.form.assinaturaColaborador = ''; state.form.assinaturaGestor = ''; delete state.form.assinaturaColaboradorImagem; delete state.form.assinaturaGestorImagem; Object.assign(state.files, documentAttachments(state.revision)); state.checks = dpExamples().checks; state.form.checklistConcluido = 'Sim';
        state.current = ['sesmt', 'ti'].includes(target) ? 'paralelo' : target;
        log('solicitacao', 'Retomada simulada', 'Escolha explícita para demonstração: ' + title(target) + '. Regra BPM pendente.'); go(state.current === 'paralelo' ? 'paralelo' : target);
      }, 'Simular Reanálise', 'rotate-left'); return;
    }
    if (!guard()) return;
    if (action === 'continue-parallel') {
      if (page.key !== 'paralelo' || !completed('sesmt') || !completed('ti')) { feedback('Aguarde a conclusão das análises do SESMT e da TI.', true); return; }
      log('paralelo', 'Análises paralelas concluídas', 'SESMT e TI concluídos. Solicitação encaminhada para o documento de desligamento.', historyEvidence());
      state.current = 'documento'; go('documento'); return;
    }
    if (action === 'add-item') { state.form[node.dataset.scope].push({ tipo: '', quantidade: '1', descricao: '', devolver: '', parecer: '' }); save(); render(); }
    if (action === 'delete-item') modal('Excluir Item?', '<p>Deseja remover este item da solicitação?</p>', () => { state.form[node.dataset.scope].splice(+node.dataset.index, 1); save(); render(); }, 'Excluir', 'trash');
    if (action === 'delete-file') modal('Excluir Anexo?', '<p>Deseja remover este arquivo?</p>', async () => {
      try {
        const files = state.files[node.dataset.group]; const file = files[+node.dataset.index];
        const preserved = state.history.some(record => Object.values(record.files || {}).some(list => list.some(item => item.id === file.id))) || Object.values(state.correctionExample?.files || {}).some(list => list.some(item => item.id === file.id));
        if (!file.url && !preserved) { const db = await openDB(); await dbRequest(db, 'readwrite', store => store.delete(file.id)); }
        files.splice(+node.dataset.index, 1); if (node.dataset.group === 'paraAssinatura') clearElectronicSignatures(); log(page.key, 'Anexo removido', file.name); save(); render();
      } catch (_) { feedback('Não foi possível remover o arquivo.', true); }
    }, 'Excluir', 'trash');
    if (action === 'submit' || action === 'correct') {
      if (action === 'correct') state.form.changes = view.querySelector('[data-field="changes"]').value;
      validateRequest();
      if (action === 'correct' && !state.form.changes?.trim()) invalid('changes');
      if (fail()) return;
      modal(action === 'submit' ? 'Enviar solicitação?' : 'Registrar correção?', '<p>' + (action === 'submit' ? 'A solicitação seguirá para aprovação da Diretoria.' : 'Os ajustes serão preservados. A retomada dependerá da regra BPM ainda a definir.') + '</p>', () => {
        if (action === 'submit') { log('solicitacao', 'Solicitação enviada', state.form.justificativa, historyEvidence()); state.current = 'diretoria'; go('diretoria'); }
        else {
          if (!isCurrentCorrection()) {
            const context = correctionContext();
            if (!state.history.some(record => record.area === 'diretoria' && record.revision === state.revision)) state.history.push(exampleHistoryRecord('diretoria'));
            state.history.push(exampleHistoryRecord('rh'));
            state.correction = JSON.parse(JSON.stringify(context));
          }
          state.revision++; state.correction.changes = state.form.changes;
          log('solicitacao', 'Correção registrada', state.form.changes, historyEvidence()); state.current = 'retomada'; go('correcao');
        }
      }, action === 'submit' ? 'Enviar' : 'Registrar', 'paper-plane');
    }
    if (action === 'decide') {
      validateReview(page.key); if (fail()) return;
      const key = page.key;
      modal('Confirmar Decisão?', '<p>' + escape({ approve: 'Registrar a conclusão desta análise.', return: 'Devolver a solicitação ao Encarregado / Gestor.', reject: 'Encerrar a solicitação como reprovada.' }[decision(key).value]) + '</p>', () => approveReview(key), 'Registrar', 'paper-plane');
    }
    if (action === 'send-signatures') {
      if (!state.files.documento?.length) { feedback('O documento de desligamento deve estar anexado.', true); return; }
      state.document = { date: now(), by: owners.documento, revision: state.revision };
      state.current = 'assinaturas'; log('documento', 'Encaminhado para assinaturas', '', historyEvidence()); go('assinaturas');
    }
    if (action === 'sign') openSignature(node.dataset.sign);
    if (action === 'finish-signatures') {
      if (state.form.modalidade === 'Eletrônica') {
        modal('Gerar e Enviar para Assinatura?', '<p>O documento será gerado automaticamente e enviado à plataforma digital para assinatura do Colaborador e do Gestor. A próxima etapa permitirá acompanhar e validar as assinaturas.</p>', () => {
          const timestamp = now();
          const signing = electronicSigningExample('partial');
          signing.sentAt = timestamp; signing.updatedAt = timestamp;
          signing.signers.find(signer => signer.role === 'Colaborador').signedAt = timestamp;
          signing.document = automaticDocument('paraAssinatura', state.revision, timestamp);
          state.electronicSigning = signing;
          state.document = { date: timestamp, by: 'Sistema', revision: state.revision };
          state.files.paraAssinatura = [signing.document];
          state.files.anteriores = (state.files.anteriores || []).concat(state.files.assinado || []);
          state.files.assinado = [];
          state.current = 'validacao_assinaturas';
          log('assinaturas', 'Documento enviado para assinatura eletrônica', 'Documento gerado automaticamente e enviado à plataforma digital.', historyEvidence()); go('validacao_assinaturas');
        }, 'Gerar e Enviar', 'paper-plane'); return;
      }
      if (!state.files.assinado?.some(file => (file.revision || 1) === state.revision)) invalid('files.assinado', 'Anexe o documento assinado pelo Colaborador e pelo Gestor.');
      if (fail()) return;
      modal('Encaminhar ao DP?', '<p>Confirme que o arquivo anexado contém as assinaturas presenciais do Colaborador e do Gestor.</p>', () => {
        state.document ||= { date: now(), by: owners.documento, revision: state.revision };
        state.electronicSigning = null;
        state.current = 'dp'; log('assinaturas', 'Documento assinado conferido', 'Modalidade ' + state.form.modalidade + '; Colaborador e Gestor.', historyEvidence()); go('dp');
      }, 'Encaminhar', 'file-signature');
    }
    if (action === 'finish') {
      if (state.form.checklistConcluido === 'Não') {
        if (!state.form.finais?.trim()) invalid('finais', 'Informe os ajustes necessários para a correção.');
        if (fail()) return;
        modal('Enviar para Correção?', '<p>A solicitação retornará para Correção da Solicitação. Os itens do checklist e a observação do Departamento Pessoal serão preservados no histórico.</p>', () => {
          const evidence = historyEvidence();
          state.correction = { origin: 'dp', note: state.form.finais, before: evidence.snapshot, files: evidence.files, date: now() };
          state.form.resumeArea = 'rh';
          log('dp', 'Devolução para correção', state.form.finais, Object.assign(evidence, { snapshot: { referencia: evidence.snapshot, checklist: JSON.parse(JSON.stringify(state.checks)) } }));
          state.current = 'correcao'; go('correcao');
        }, 'Enviar para Correção', 'rotate-left'); return;
      }
      const pending = allCheckIds().filter(id => !checkDone(id));
      const unjustified = allCheckIds().filter(id => state.checks[id]?.status === 'na' && !state.checks[id].note?.trim());
      if (pending.length) invalid('checklist', 'Há ' + pending.length + ' item(ns) pendente(s) no checklist. Confira os aplicáveis e indique os que não se aplicam.');
      unjustified.forEach(id => invalid('checkNote.' + id, 'Justifique a opção Não se aplica.'));
      if (state.form.checklistConcluido !== 'Sim') invalid('checklistConcluido', 'Selecione Concluir checklist para encerrar o processo.');
      if (state.current !== 'solicitacao' && !signaturesReady()) invalid('checklistConcluido', state.form.modalidade === 'Presencial' ? 'Anexe o documento assinado presencialmente pelos dois signatários.' : 'As assinaturas eletrônicas e o documento assinado devem ser validados antes da conclusão pelo DP.');
      if (fail()) return;
      modal('Encerrar Processo de Desligamento?', '<p>O DP confirma a conferência manual dos itens aplicáveis e conclui o Checklist da Rescisão. Esta é a última atividade do workflow.</p>', () => {
        if (state.current === 'solicitacao') {
          const signatures = exampleHistoryRecord('assinaturas');
          state.form.assinaturaColaborador = signatures.snapshot.assinaturaColaborador; state.form.assinaturaGestor = signatures.snapshot.assinaturaGestor;
          state.document = { date: now(), by: owners.documento, revision: state.revision };
        }
        state.current = 'finalizada'; state.endedAt = now(); state.endedBy = owners.dp; state.endNote = state.form.finais;
        log('dp', 'Checklist concluído e processo encerrado', state.form.finais, Object.assign(historyEvidence(), { snapshot: JSON.parse(JSON.stringify({ referencia: state.form, checklist: state.checks })) })); go('finalizada');
      }, 'Concluir e Encerrar', 'clipboard-check');
    }
  }
  function update(event) {
    const el = event.target;
    const isField = el.matches('[data-field], [data-item], [data-decision], [data-note], [data-check], [data-na], [data-pending], input[data-check-date], [data-check-note]');
    if (!isField || el.readOnly) return;
    if (!(canInteract(page.key) || isChecklistEditor(el) || el.matches('[data-decision], [data-note]') || (page.key === 'correcao' && state.current === 'retomada' && el.dataset.field === 'resumeArea'))) { render(); feedback('Esta etapa está em visualização. Abra a atividade atual para editar.', true); return; }
    clearFieldError(el);
    if (el.dataset.field) {
      const key = el.dataset.field;
      const previous = state.form[key]; state.form[key] = el.value;
      if (key === 'modalidade' && previous !== el.value) {
        log('assinaturas', 'Modalidade alterada', el.value);
      }
      if (key === 'employee' && previous !== el.value) {
        clearElectronicSignatures();
        state.electronicSigning = null;
        state.form.rmStability = JSON.parse(JSON.stringify(stabilityExamples[el.value] || []));
        const examples = analysisAttachments();
        ['guia', 'termoEpi', 'termoInfra'].forEach(group => { state.files.anteriores = (state.files.anteriores || []).concat(state.files[group] || []); state.files[group] = examples[group].map(file => Object.assign({}, file, { revision: state.revision })); });
        const request = requestExamples();
        ['infraItems', 'epiItems', 'infraestrutura', 'epi', 'infraObs', 'epiObs'].forEach(field => { state.form[field] = request[field]; });
      }
      if (event.type === 'change' && ['employee', 'infraestrutura', 'epi', 'estabilidade', 'exame', 'modalidade', 'checklistConcluido'].includes(key)) { save(); render(); }
    }
    if (el.dataset.item) state.form[el.dataset.item][+el.dataset.index][el.dataset.prop] = el.value;
    if (el.dataset.decision) { decision(el.dataset.decision).value = el.value; save(); render(); }
    if (el.dataset.note) decision(el.dataset.note).note = el.value;
    if (el.dataset.check || el.dataset.na || el.dataset.pending) {
      const id = el.dataset.check || el.dataset.na || el.dataset.pending;
      const item = state.checks[id] || (state.checks[id] = {});
      item.status = el.checked && !el.dataset.pending ? (el.dataset.na ? 'na' : 'conferido') : '';
      item.by = owners.dp; item.date = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }); save(); render();
    }
    if (el.dataset.checkDate) {
      const item = state.checks[el.dataset.checkDate] || (state.checks[el.dataset.checkDate] = {});
      item.date = checkDate(el.value); item.by = owners.dp;
    }
    if (el.dataset.checkNote) {
      (state.checks[el.dataset.checkNote] || (state.checks[el.dataset.checkNote] = {})).note = el.value;
      const counter = el.closest('.lx-check-observation')?.querySelector('[data-note-count]');
      if (counter) counter.textContent = el.value.length;
    }
    save();
  }
  function openDB() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('lonax-desligamento-files-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('files');
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }
  function dbRequest(db, mode, run) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', mode); let request;
      try { request = run(tx.objectStore('files')); } catch (error) { reject(error); return; }
      tx.oncomplete = () => resolve(request?.result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  }
  async function upload(group, files) {
    if (!guard()) return;
    const accepted = Array.from(files); let changed = false;
    for (const file of accepted) {
      if (file.size > 10 * 1024 * 1024 || !['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { feedback('Arquivo não aceito: ' + file.name + '. Use PDF ou imagem até 10 MB.', true); continue; }
      try {
        const db = await openDB();
        const id = Date.now() + '-' + Math.random().toString(36).slice(2);
        await dbRequest(db, 'readwrite', store => store.put(file, id));
        (state.files[group] || (state.files[group] = [])).push({ id, name: file.name, size: file.size, type: file.type, origin: attachmentOrigin(group), by: owners[page.key] || owners.solicitacao, date: now(), revision: state.revision });
        log(page.key, 'Anexo incluído', file.name); changed = true;
      } catch (_) { feedback('Não foi possível salvar o arquivo neste navegador. Tente servir o protótipo via HTTP local.', true); }
    }
    if (changed) { if (group === 'paraAssinatura') clearElectronicSignatures(); delete fieldErrors['files.' + group]; errors = Object.values(fieldErrors); save(); render(); }
  }
  async function openFile(meta, downloadOnly = false) {
    if (!meta) return;
    if (meta.url) {
      const url = encodeURI(meta.url);
      if (downloadOnly) { const link = document.createElement('a'); link.href = url; link.download = meta.name; link.click(); return; }
      modal(meta.name, '<div class="lx-attachment-preview"><iframe class="lx-attachment-frame" title="Visualização do anexo" src="' + escape(url) + '"></iframe></div>', null, 'Fechar', 'eye');
      dialog.classList.add('lx-modal-wide'); return;
    }
    try {
      const db = await openDB(); const file = await dbRequest(db, 'readonly', store => store.get(meta.id));
      if (!file) throw new Error('missing');
      if (downloadOnly) { download(file, meta.name); return; }
      const objectURL = URL.createObjectURL(file);
      modal(meta.name, '<div class="lx-attachment-preview">' + (meta.type === 'application/pdf' ? '<iframe class="lx-attachment-frame" title="Visualização do anexo" src="' + objectURL + '"></iframe>' : '<img class="lx-file-image" alt="' + escape(meta.name) + '" src="' + objectURL + '" />') + '</div>', null, 'Fechar', 'eye');
      dialog.classList.add('lx-modal-wide');
      previewURL = objectURL;
    } catch (_) { feedback('Arquivo indisponível no armazenamento deste navegador. Anexe novamente na etapa responsável.', true); }
  }
  function download(blob, name) {
    const link = document.createElement('a'); const objectURL = URL.createObjectURL(blob);
    link.href = objectURL; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
  }
  function closeSelects(except) {
    document.querySelectorAll('[data-single-select]').forEach(node => { if (node !== except) node.querySelector('.lx-select-list').classList.add('lx-hidden'); });
  }
  function chooseOption(node, value) {
    if (!guard()) return;
    const field = node.querySelector('input[type="hidden"]');
    field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); render();
  }
  document.addEventListener('toggle', event => {
    const group = event.target;
    if (group.matches('details[data-check-editor]') && group.isConnected) openChecklists[group.dataset.checkGroup] = group.open;
  }, true);
  document.addEventListener('click', event => {
    const checkDateInput = event.target.closest('input[data-check-date]');
    if (checkDateInput && !checkDateInput.disabled && !checkDateInput.readOnly && checkDateInput.showPicker) {
      try { checkDateInput.showPicker(); } catch (_) { /* O seletor nativo continua disponível pelo ícone do campo. */ }
    }
    const collapse = event.target.closest('[data-collapse]');
    if (collapse) { const key = collapse.dataset.collapse; if (key === 'request') summaryOpen = !summaryOpen; else openApprovals[key] = !openApprovals[key]; render(); return; }
    const selector = event.target.closest('[data-single-select]');
    if (event.target.closest('[data-clear-select]')) { chooseOption(selector, ''); return; }
    const option = event.target.closest('[data-select-option]');
    if (option) { chooseOption(selector, option.dataset.selectOption); return; }
    closeSelects(selector);
    if (selector && event.target.closest('.lx-single-select-control') && !selector.querySelector('[data-select-input]').disabled) selector.querySelector('.lx-select-list').classList.remove('lx-hidden');
    const node = event.target.closest('[data-action]');
    if (node) handleAction(node);
    else if (event.target.closest('[data-drop]') && !event.target.matches('input[type="file"]') && guard()) event.target.closest('[data-drop]').querySelector('input[type="file"]').click();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.matches('[data-select-input]')) return;
    const selector = event.target.closest('[data-single-select]'); closeSelects(selector); selector.querySelector('.lx-select-list').classList.remove('lx-hidden');
  });
  document.addEventListener('input', event => {
    if (!event.target.matches('[data-select-input]')) return;
    const term = event.target.value.toLocaleLowerCase('pt-BR');
    event.target.closest('[data-single-select]').querySelectorAll('[data-select-option]').forEach(option => { option.hidden = !option.textContent.toLocaleLowerCase('pt-BR').includes(term); });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSelects();
    if (event.key === 'Enter' && event.target.matches('[data-select-input]')) { event.preventDefault(); event.target.closest('[data-single-select]').querySelector('[data-select-option]:not([hidden])')?.click(); }
  });
  document.addEventListener('input', event => { if (!event.target.matches('input[type="checkbox"], input[type="radio"], select')) update(event); });
  document.addEventListener('change', event => {
    if (event.target.dataset.upload) upload(event.target.dataset.upload, event.target.files);
    else if (event.target.matches('input[type="checkbox"], input[type="radio"], select')) update(event);
  });
  document.addEventListener('dragover', event => { const zone = event.target.closest('[data-drop]'); if (zone) { event.preventDefault(); zone.classList.add('lx-drag-over'); } });
  document.addEventListener('dragleave', event => event.target.closest('[data-drop]')?.classList.remove('lx-drag-over'));
  document.addEventListener('drop', event => { const zone = event.target.closest('[data-drop]'); if (zone) { event.preventDefault(); zone.classList.remove('lx-drag-over'); upload(zone.dataset.drop, event.dataTransfer.files); } });
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalConfirm').addEventListener('click', () => { if (modalValidation && !modalValidation()) return; const action = modalAction; closeModal(); dialog.classList.remove('lx-modal-wide'); if (action) Promise.resolve(action()).catch(() => feedback('Não foi possível concluir esta ação.', true)); });
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
  document.addEventListener('keydown', event => {
    if (backdrop.classList.contains('lx-hidden')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      const nodes = Array.from(dialog.querySelectorAll('button:not(.lx-hidden), a[href], iframe')).filter(n => !n.disabled);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first?.focus(); }
    }
  });
  window.addEventListener('popstate', () => { page = prepareStage(locationStage()); save(); errors = []; fieldErrors = {}; render(); });
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE || !event.newValue) return;
    try { state = JSON.parse(event.newValue); errors = []; fieldErrors = {}; render(); } catch (_) { /* Ignore malformed external storage updates. */ }
  });
  save();
  render();
}());

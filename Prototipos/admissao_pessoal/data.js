(function (global) {
  'use strict';
  const STORE = 'lonax.admissao.processos.v1';
  const RM_STORE = 'lonax.admissao.rm.v1';
  const TAE_STORE = 'lonax.admissao.tae.v1';
  const TI_STORE = 'lonax.admissao.notificacoes.v1';
  const owners = { solicitacao: 'Juliana Costa', preparacao: 'Juliana Costa', coleta: 'Juliana Costa', validacao: 'Ricardo Nunes', complementacao: 'Juliana Costa', sesmt: 'Marcos Oliveira', validacao_final: 'Ricardo Nunes', integracao: 'Juliana Costa', tratamento: 'Juliana Costa', assinaturas: 'Juliana Costa', finalizada: 'Juliana Costa', cancelada: 'Juliana Costa' };
  const stages = [
    ['solicitacao', 'Solicitação de Admissão', 'file-pen', 'blue', 'Selecionar a vaga e encaminhar a admissão manual para coleta e preenchimento.'],
    ['preparacao', 'Preparação da Admissão', 'user-plus', 'blue', 'Identificar a origem e confirmar os dados da contratação.'],
    ['coleta', 'Coleta e Preenchimento', 'address-card', 'blue', 'Registrar as informações e os documentos recebidos pelo RH / DP.'],
    ['validacao', 'Validação de Dados e Documentos', 'clipboard-check', 'purple', 'Conferir os dados e documentos antes do exame admissional.'],
    ['complementacao', 'Complementação de Dados e Documentos', 'rotate-left', 'orange', 'Consultar a pendência e complementar o formulário da admissão.'],
    ['sesmt', 'Exame Admissional — SESMT', 'helmet-safety', 'orange', 'Registrar o encaminhamento, a realização do exame e o ASO.'],
    ['validacao_final', 'Validação Final do RH / DP', 'user-check', 'teal', 'Conferir a admissão e os documentos que seguirão para assinatura.'],
    ['enviar_assinatura', 'Enviar Documentos para Assinatura', 'paper-plane', 'blue', 'Gerar os documentos e encaminhar do Fluig ao TAE.'],
    ['tratamento_tae', 'Tratamento do Envio ao TAE', 'triangle-exclamation', 'orange', 'Conferir o erro e reprocessar o envio dos documentos para assinatura.'],
    ['assinaturas', 'Acompanhamento das Assinaturas', 'file-signature', 'teal', 'Acompanhar os documentos enviados pelo Fluig para assinatura no TAE.'],
    ['integracao', 'Integrar Colaborador — TOTVS RM', 'arrows-rotate', 'blue', 'Incluir ou atualizar o colaborador e os documentos assinados no TOTVS RM.'],
    ['tratamento', 'Tratamento da Integração TOTVS RM', 'triangle-exclamation', 'orange', 'Analisar o retorno, solicitar correção e decidir sobre o reprocessamento.'],
    ['validacao_rm', 'Validar Inclusão / Atualização no TOTVS RM', 'user-check', 'teal', 'Conferir o cadastro integrado e registrar a validação do RH / DP.'],
    ['notificacao_ti', 'Notificar TI sobre Infraestrutura', 'envelope', 'blue', 'Enviar os equipamentos previstos após a validação do cadastro no RM.'],
    ['tratamento_ti', 'Tratamento da Notificação à TI', 'triangle-exclamation', 'orange', 'Conferir o erro e reprocessar o envio da notificação.'],
    ['finalizada', 'Admissão Concluída', 'circle-check', 'green', 'Processo concluído após as validações e a conferência das assinaturas.'],
    ['cancelada', 'Admissão Cancelada', 'ban', 'red', 'Solicitação encerrada com a decisão e o motivo preservados no histórico.']
  ].map(([key, title, icon, tone, description]) => ({ key, title, icon, tone, description }));
  stages[0].navTitle = 'Admissão Manual';
  stages.forEach(stage => { stage.automatic = ['enviar_assinatura', 'integracao', 'notificacao_ti'].includes(stage.key); });
  owners.integracao = 'Fluig';
  stages.forEach(stage => { owners[stage.key] ||= ['enviar_assinatura', 'notificacao_ti'].includes(stage.key) ? 'Fluig' : 'Juliana Costa'; });
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : value || '—';
  const money = value => {
    const text = String(value ?? '').replace(/[^\d,.-]/g, '');
    if (!text) return '';
    const number = Number(text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text);
    return Number.isFinite(number) ? number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ') : '';
  };
  const catalog = {
    epi: ['Capacete de segurança', 'Óculos de proteção', 'Protetor auricular', 'Luva de proteção', 'Calçado de segurança', 'Máscara de proteção', 'Outros'],
    empresa: ['01 — Lonax Indústria e Comércio Ltda.'], filial: ['01 — Matriz — Sarzedo/MG', '02 — Unidade Contagem/MG'],
    secao: ['01.01 — Produção', '01.02 — Administração', '01.03 — Controle de Qualidade'], centro: ['IND.PRO.001', 'ADM.GER.002', 'IND.QUA.004'],
    cargo: ['Operador de Máquinas', 'Auxiliar Administrativo', 'Analista de Qualidade'], funcao: ['Operador de Produção', 'Assistente Administrativo', 'Analista de Qualidade'],
    nivel: ['Operacional - Step 2', 'Júnior - Step 1', 'Pleno - Step 2'], faixa: ['Faixa Operacional II', 'Faixa Administrativa I', 'Faixa Técnica II'],
    escala: ['6x1', '5x1', '5x2'], horario: ['06:00 às 14:00', '08:00 às 17:48', '14:00 às 22:00'], sindicato: ['Sindicato — Sarzedo/MG', 'Sindicato — Contagem/MG'],
    gestor: ['Eduardo Martins', 'Carla Mendes', 'Patrícia Almeida'], banco: ['001 — Banco do Brasil', '104 — Caixa Econômica Federal', '341 — Itaú']
  };
  const vacancies = [
    { id: 'VG-001', label: 'VG-001 — Operador de Máquinas — Produção', requisicao: 'REQ-2026-0184', selecao: '5003', candidato: 'ana-beatriz' },
    { id: 'VG-002', label: 'VG-002 — Auxiliar Administrativo — Administração', requisicao: 'REQ-2026-0185', selecao: '5004', candidato: 'bruno-santos' },
    { id: 'VG-003', label: 'VG-003 — Analista de Qualidade — Qualidade', requisicao: 'REQ-2026-0186', selecao: '5005', candidato: 'mariana-lima' }
  ];
  const f = (key, label, value, extra = {}) => ({ key, label, value, ...extra });
  const required = { required: true };
  const rm = key => ({ required: true, options: catalog[key], searchable: true });
  const hiring = [
    f('tipoAdmissao', 'Tipo de Admissão', 'Admissão', { ...required, options: ['Admissão', 'Readmissão'] }), f('filial', 'Filial / Unidade', catalog.filial[1], rm('filial')),
    f('admissao', 'Data Prevista de Admissão', '2026-11-03', { ...required, type: 'date' }),
    f('empresa', 'Empresa / Coligada', catalog.empresa[0], rm('empresa')),
    f('contrato', 'Tipo de Contrato', 'Experiência', { ...required, options: ['Prazo indeterminado', 'Experiência', 'Prazo determinado', 'Estágio', 'Aprendiz'] }),
    f('secao', 'Seção', catalog.secao[0], rm('secao')), f('centro', 'Centro de Custo', catalog.centro[0], rm('centro')),
    f('cargo', 'Cargo', catalog.cargo[0], rm('cargo')), f('funcao', 'Função', catalog.funcao[0], rm('funcao')), f('nivel', 'Nível / Step', catalog.nivel[0], rm('nivel')),
    f('faixa', 'Faixa Salarial', catalog.faixa[0], rm('faixa')), f('salario', 'Salário (R$)', '2450.00', { ...required, type: 'money' }),
    f('pagamento', 'Tipo de Pagamento', 'Mensalista', { ...required, options: ['Mensalista', 'Horista'] }),
    f('horasMes', 'Horas Mensais', '220', { ...required, type: 'number' }), f('horasSemana', 'Horas Semanais', '44', { ...required, type: 'number' }),
    f('escala', 'Escala', catalog.escala[1], rm('escala')), f('horario', 'Horário de Trabalho', catalog.horario[0], rm('horario')),
    f('sindicato', 'Sindicato', catalog.sindicato[0], rm('sindicato')), f('gestor', 'Gestor Responsável', catalog.gestor[0], rm('gestor')),
    f('contratacaoObs', 'Observações da Contratação', 'Contratação para a linha industrial, conforme aprovação da vaga.', { type: 'textarea', wide: true })
  ];
  const identity = [f('nome', 'Nome Completo', 'Ana Beatriz', required), f('cpf', 'CPF', '229.118.440-55', { ...required, mask: 'cpf' }), f('email', 'E-mail', 'ana.beatriz@exemplo.com', { ...required, type: 'email' }), f('celular', 'Celular', '(31) 98840-7710', { ...required, mask: 'phone' }), f('telefone', 'Telefone Alternativo', '(31) 3522-1045', { mask: 'phone' })];
  const personal = [identity[0], identity[1], f('nomeSocial', 'Nome Social', 'Não informado'), f('nascimento', 'Data de Nascimento', '1996-12-11', { ...required, type: 'date' }), f('sexo', 'Sexo', 'Feminino', { ...required, options: ['Feminino', 'Masculino', 'Não informado'] }), f('cor', 'Raça / Cor', 'Parda', { ...required, options: ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Não informada'] }), f('estadoCivil', 'Estado Civil', 'Casada', { ...required, options: ['Solteira', 'Casada', 'Divorciada', 'Viúva', 'União estável'] }), f('nacionalidade', 'Nacionalidade', 'Brasileira', { ...required, options: ['Brasileira', 'Estrangeira'] }), f('ufNascimento', 'Estado de Nascimento', 'MG', required), f('cidadeNascimento', 'Município de Nascimento', 'Sarzedo', required), f('escolaridade', 'Escolaridade', 'Ensino médio completo', { ...required, options: ['Ensino fundamental completo', 'Ensino médio completo', 'Ensino superior em andamento', 'Ensino superior completo'] }), f('sangue', 'Tipo Sanguíneo', 'O+', { options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não informado'] })];
  const address = [f('cep', 'CEP', '32450-000', { ...required, mask: 'cep' }), f('logradouroTipo', 'Tipo de Logradouro', 'Rua', { ...required, options: ['Rua', 'Avenida', 'Alameda', 'Praça'] }), f('logradouro', 'Logradouro', 'das Flores', required), f('numero', 'Número', '125', required), f('complemento', 'Complemento', 'Casa'), f('bairro', 'Bairro', 'Centro', required), f('uf', 'Estado', 'MG', required), f('municipio', 'Município', 'Sarzedo', required), f('pais', 'País', 'Brasil', required)];
  const rg = [f('rg', 'Número do Documento de Identidade', 'MG-18.452.760', required), f('rgData', 'Data de Emissão', '2015-03-12', { ...required, type: 'date' }), f('rgUf', 'UF', 'MG', required), f('rgOrgao', 'Órgão Emissor', 'SSP', required)];
  const ctps = [f('ctpsTipo', 'Tipo / Condição da CTPS', 'Digital', { ...required, options: ['Digital', 'Física'] })];
  const ctpsPhysical = [f('ctpsNumero', 'Número da CTPS', '452760', required), f('ctpsSerie', 'Série', '0012', required), f('ctpsUf', 'UF da CTPS', 'MG', required), f('ctpsData', 'Data de Emissão da CTPS', '2015-04-15', { ...required, type: 'date' })];
  const license = [f('cnhNumero', 'Número da CNH', '07345276012', required), f('cnhOrgao', 'Órgão Emissor', 'DETRAN', required), f('cnhData', 'Data de Emissão', '2025-04-15', { ...required, type: 'date' }), f('cnhPrimeira', 'Data da Primeira Habilitação', '2015-04-15', { ...required, type: 'date' }), f('cnhVencimento', 'Data de Vencimento', '2035-04-15', { ...required, type: 'date' }), f('cnhCategoria', 'Categoria', 'B', { ...required, options: ['A', 'B', 'AB', 'C', 'D', 'E'] }), f('cnhUf', 'UF', 'MG', required)];
  const voting = [f('tituloNumero', 'Número do Título', '123456780124', required), f('tituloZona', 'Zona', '122', required), f('tituloSecao', 'Seção', '0156', required), f('tituloData', 'Data de Emissão', '2015-05-12', { type: 'date' }), f('tituloUf', 'UF', 'MG', required)];
  const military = [f('militarNumero', 'Número do Documento Militar', '123456789012', required), f('militarCategoria', 'Categoria', 'Dispensa'), f('militarRegiao', 'Região / Circunscrição', '4ª Região Militar'), f('militarData', 'Data de Emissão', '2015-07-10', { type: 'date' }), f('militarOrgao', 'Órgão de Expedição', 'Ministério da Defesa'), f('militarSituacao', 'Situação Militar', 'Dispensado', required)];
  const professional = [f('classeOrgao', 'Órgão de Classe', 'CRT', required), f('classeUf', 'UF', 'MG', required), f('classeNumero', 'Número do Registro', '12345678', required), f('classeData', 'Data de Emissão', '2020-03-02', { type: 'date' })];
  const foreign = [f('estrangeiroPais', 'País de Origem', 'Argentina', required), f('estrangeiroDocumento', 'Documento Migratório / CRNM', 'F123456A', required), f('estrangeiroValidade', 'Validade do Documento', '2030-05-10', { ...required, type: 'date' })];
  const bank = [f('banco', 'Banco', catalog.banco[0], rm('banco')), f('agencia', 'Agência', '1234-5', required), f('conta', 'Conta', '24567-8', required), f('contaTipo', 'Tipo de Conta', 'Conta corrente', { ...required, options: ['Conta corrente', 'Conta salário', 'Poupança'] }), f('operacao', 'Operação Bancária', '001')];
  const term = [
    f('experiencia1', 'Vencimento da Primeira Experiência', '2026-12-17', { type: 'date' }),
    f('experiencia2', 'Vencimento da Segunda Experiência', '2027-01-31', { type: 'date' }),
    f('contratoFim', 'Data de Término do Contrato', '2027-01-31', { ...required, type: 'date' }),
    f('prazoTipo', 'Tipo de Contrato por Prazo Determinado', 'Experiência', { ...required, options: ['Experiência', 'Prazo determinado', 'Estágio', 'Aprendiz'] }),
    f('prazoMotivo', 'Motivo da Contratação', 'Avaliação de adaptação às atividades da função.', { ...required, type: 'textarea', wide: true })
  ];
  const internship = [f('estagioNatureza', 'Natureza do Estágio', 'Não obrigatório', { ...required, options: ['Obrigatório', 'Não obrigatório'] }), f('estagioNivel', 'Nível de Estágio', 'Técnico', required), f('estagioArea', 'Área de Atuação', 'Produção', required), f('estagioApolice', 'Número de Apólice', 'AP-2026-00184', required), f('estagioFim', 'Data Fim do Estágio', '2027-11-02', { ...required, type: 'date' }), f('estagioInstituicao', 'Instituição de Ensino', 'Centro de Educação Técnica de Sarzedo', required), f('estagioAgente', 'Agente de Integração', 'CIEE', required), f('estagioCoordenador', 'Coordenador / Responsável', 'Paulo Mendes', required), f('estagioCpf', 'CPF do Coordenador', '529.982.247-25', { mask: 'cpf' })];
  const apprentice = [f('aprendizEntidade', 'Entidade Qualificadora', 'SENAI', required), f('aprendizCnpj', 'CNPJ', '03.773.700/0001-07', required), f('aprendizEstabelecimento', 'Estabelecimento de Atividades Práticas', catalog.filial[0], required), f('aprendizModalidade', 'Modalidade de Contratação', 'Aprendizagem profissional', required)];
  const legal = [f('legalNome', 'Nome do Representante Legal', 'Roberto Santos', required), f('legalCpf', 'CPF do Representante Legal', '529.982.247-25', { ...required, mask: 'cpf' }), f('legalTelefone', 'Telefone', '(31) 98811-2244', { ...required, mask: 'phone' }), f('legalRelacao', 'Relação / Observação', 'Responsável legal informado para a contratação.', { type: 'textarea', wide: true })];
  const definitions = { hiring, identity, personal, address, rg, ctps, ctpsPhysical, license, voting, military, professional, foreign, bank, term, internship, apprentice, legal };
  const documents = [['identidade', 'Documento de Identidade'], ['cpf', 'CPF'], ['residencia', 'Comprovante de Residência'], ['escolaridade', 'Comprovante de Escolaridade'], ['bancario', 'Comprovante Bancário'], ['ctps', 'CTPS']].map(([key, label]) => ({ key, label, group: 'doc-' + key }));
  function fixed(name, by = 'Juliana Costa', id = name) { return { id: 'exemplo-' + id, name, url: 'anexos/' + name, type: 'application/pdf', size: 2048, by, date: '16/10/2026 10:00', origin: by === 'Marcos Oliveira' ? 'SESMT' : 'RH / DP' }; }
  function defaultForm(origin) {
    const form = Object.fromEntries(Object.values(definitions).flat().map(item => [item.key, item.value]));
    return { ...form, origem: origin, vagaSelecionada: 'VG-001', vaga: 'VG-001', requisicao: 'REQ-2026-0184', selecao: '5003', candidato: 'ana-beatriz', cargoDescricao: 'Operar máquinas de produção, acompanhar parâmetros produtivos, registrar ocorrências e apoiar a organização da área industrial.', solicitacaoObs: 'Solicitação registrada com os dados da vaga e da candidata para coleta e preenchimento.', preparacaoObs: 'Dados da contratação conferidos. Prosseguir com a coleta das informações e documentos admissionais.', coletaObs: 'Informações recebidas da candidata e documentos anexados para validação do RH / DP.', mae: 'Maria Aparecida Santos', pai: 'Roberto Santos', pcd: 'Não', pcdObs: 'Deficiência auditiva parcial informada para avaliação cadastral.', primeiroEmprego: 'Não', pis: '123.45678.90-1', cnh: 'Sim', titulo: 'Sim', militar: 'Não', classe: 'Não', representante: 'Sim', prazo: 'Sim', temDependentes: 'Sim', transporte: 'Sim', seguro: 'Sim', finais: 'Dados, documentos e ASO conferidos para efetivação da admissão.',
      documentosAssinatura: ['Contrato de Trabalho', 'Ficha de Registro', 'Termo de Benefícios'].map((nome, index) => ({ id: 'tae-' + index, nome, signatarios: [{ id: 'candidato-' + index, nome: form.nome, email: form.email, cpf: form.cpf }, { id: 'empresa-' + index, nome: 'Ricardo Nunes', email: 'ricardo.nunes@exemplo.com', cpf: '529.982.247-25' }] })),
      dependentes: [{ id: 'dep-1', nome: 'Laura Santos', cpf: '123.456.789-09', nascimento: '2018-05-20', parentesco: 'Filha', ir: 'Sim', familia: 'Não', medica: 'Sim', odontologica: 'Sim', pensao: 'Não', observacoes: 'Dependente informado para inclusão nos benefícios.' }],
      transportes: [{ id: 'vt-1', destino: 'Residência / Trabalho', linhaNumero: '305', linhaNome: 'Sarzedo / Distrito Industrial', empresa: 'Viação Sarzedo', cartao: 'VT-004381', tarifa: '6.50', viagens: '2', observacoes: 'Utilização nos dias de trabalho presencial.' }],
      beneficios: [{ id: 'ben-1', beneficio: 'Assistência médica', optante: 'Sim', plano: 'Plano enfermaria', beneficiarios: 'Ana Beatriz e Laura Santos', observacoes: 'Inclusão da titular e da dependente.' }, { id: 'ben-2', beneficio: 'Assistência odontológica', optante: 'Sim', plano: 'Plano básico', beneficiarios: 'Ana Beatriz e Laura Santos', observacoes: 'Adesão conforme informações recebidas pelo RH / DP.' }],
      beneficiarios: [{ id: 'seg-1', nome: 'Laura Santos', nascimento: '2018-05-20', parentesco: 'Filha', percentual: '100' }]
    };
  }
  function signatures(complete = false, candidateName = 'Ana Beatriz') {
    return ['Contrato de Trabalho', 'Ficha de Registro', 'Termo de Benefícios'].map((name, index) => ({ id: 'tae-' + index, name, status: complete || index === 1 ? 'Assinado' : 'Em assinatura', sentAt: '16/10/2026, 10:00:00', updatedAt: '16/10/2026, 11:35:00', completedAt: complete || index === 1 ? '16/10/2026, 11:35:00' : '', revision: 1, protocol: 'TAE-2026-00' + (index + 41), file: fixed('documento-admissional-' + (index + 1) + '.pdf', 'Fluig / TAE'), signers: [{ role: 'Colaborador(a)', name: candidateName, email: 'ana.beatriz@exemplo.com', status: complete || index === 1 ? 'Assinado' : 'Pendente', date: complete || index === 1 ? '16/10/2026, 11:32:00' : '' }, { role: 'Representante da Empresa', name: 'Ricardo Nunes', email: 'ricardo.nunes@exemplo.com', status: 'Assinado', date: '16/10/2026, 10:47:00' }] }));
  }
  function documentSignatures(form, files, complete = false) {
    return (form.documentosAssinatura || []).map((doc, index) => ({ id: doc.id, name: doc.nome, status: complete ? 'Assinado' : 'Em assinatura', revision: 1, protocol: 'TAE-2026-' + String(41 + index).padStart(4, '0'), sentAt: '16/10/2026, 10:00:00', updatedAt: '16/10/2026, 11:35:00', completedAt: complete ? '16/10/2026, 11:35:00' : '', file: clone(files['assinatura-' + doc.id]?.[0] || fixed('documento-admissional-1.pdf')), signers: doc.signatarios.map((person, position) => ({ role: position === 0 ? 'Colaborador(a)' : 'Signatário', name: person.nome, email: person.email, cpf: person.cpf, status: complete || position > 0 ? 'Assinado' : 'Pendente', date: complete || position > 0 ? '16/10/2026, 11:32:00' : '' })) }));
  }
  function fresh(id, origin = 'Processo Seletivo') {
    const files = Object.fromEntries(documents.map(doc => [doc.group, [fixed(doc.key + '.pdf')]]));
    files['dependente-dep-1'] = [fixed('documento-dependente.pdf')];
    files.guia = [fixed('guia-exame-admissional.pdf', 'Marcos Oliveira')]; files.aso = [fixed('aso-admissional.pdf', 'Marcos Oliveira')];
    files.solicitacao = [fixed('documento-admissional-1.pdf')];
    files.preparacao = [fixed('documento-admissional-2.pdf')];
    files.coleta = [fixed('documento-admissional-3.pdf')];
    files.coletaOutros = ['curriculo-candidata.pdf', 'carta-apresentacao.pdf', 'declaracao-complementar.pdf'].map(name => fixed(name));
    files.epi = [fixed('termo-entrega-epi.pdf', 'Marcos Oliveira')];
    ['tae-0', 'tae-1', 'tae-2'].forEach((key, index) => { files['assinatura-' + key] = [fixed('documento-admissional-' + (index + 1) + '.pdf')]; });
    return { id, created: now(), origin, current: origin === 'Manual' ? 'solicitacao' : 'preparacao', started: false, revision: 1, exampleVersion: 3, form: defaultForm(origin), files, history: [], decisions: {}, reviews: {}, correction: null,
      medical: { encaminhamento: '2026-10-19', prevista: '2026-10-20', realizacao: '2026-10-20', resultado: 'Apto', observacao: 'Exame admissional realizado e ASO anexado para conferência do RH / DP.', approved: false, utilizaEpi: 'Sim', epiObs: 'EPIs definidos pelo SESMT para as atividades na área de produção.', epis: [
        { id: 'epi-1', tipo: 'Capacete de segurança', quantidade: '1', observacoes: 'Proteção da cabeça nas atividades da área industrial.' },
        { id: 'epi-2', tipo: 'Óculos de proteção', quantidade: '1', observacoes: 'Proteção dos olhos durante as atividades da produção.' },
        { id: 'epi-3', tipo: 'Protetor auricular', quantidade: '2', observacoes: 'Utilização nas áreas sinalizadas com exposição a ruído.' }
      ] },
      infrastructure: { origem: origin === 'Manual' ? 'Sem vaga vinculada' : 'REQ-2026-0184 / VG-001', necessita: origin === 'Manual' ? 'Não' : 'Sim', observacoes: origin === 'Manual' ? 'Nenhum equipamento informado para esta admissão.' : 'Equipamentos previstos para o acompanhamento da produção, conforme a vaga.', equipamentos: origin === 'Manual' ? [] : [{ id: 'infra-1', tipo: 'Notebook', quantidade: '1', observacoes: 'Notebook com carregador e acesso aos sistemas da produção.' }, { id: 'infra-2', tipo: 'Monitor', quantidade: '1', observacoes: 'Monitor de apoio para o posto de trabalho.' }] },
      rm: { status: 'Não iniciada', attempts: 0, authorized: false, employeeId: '', chapa: '', message: '', at: '', operation: 'Incluir colaborador e documentos assinados', error: '', failNext: false, failAfterEmployee: false },
      tae: { status: 'Não enviado', authorized: false, attempts: 0, attemptedAt: '', error: '', message: '', failNext: false, documents: signatures(false).map(doc => ({ ...doc, status: 'Não enviado', protocol: '', sentAt: '', completedAt: '', signers: doc.signers.map(signer => ({ ...signer, status: 'Pendente', date: '' })) })), sentAt: '', observation: 'Acompanhamento dos documentos encaminhados pelo Fluig ao TAE.' },
      notification: { status: 'Não enviada', authorized: false, failNext: false, attempts: 0, to: 'ti@lonax.exemplo.com', at: '', protocol: '', error: '' },
      validation: { dados: false, final: false, rm: false }, rmReview: { note: 'Cadastro conferido com os dados e documentos enviados na admissão.' }, functional: { active: false, note: '', adjustments: 'Informações corrigidas conforme a inconsistência identificada no cadastro do RM.' }, cancellation: { motivo: 'Contratação cancelada', justificativa: 'Contratação cancelada por decisão do RH / DP.', responsible: '', date: '' }
    };
  }
  function read() { try { return JSON.parse(localStorage.getItem(STORE)) || { selected: '', processes: {} }; } catch (_) { return { selected: '', processes: {} }; } }
  function save(process) { const db = read(); db.processes[process.id] = clone(process); db.selected = process.id; localStorage.setItem(STORE, JSON.stringify(db)); }
  function start(origin = 'Processo Seletivo') {
    const db = read();
    const previous = Object.values(db.processes).find(process => process.origin === origin && (origin === 'Manual' || (process.form.candidato === 'ana-beatriz' && process.form.vaga === 'VG-001')));
    if (previous) return previous;
    const last = Math.max(42, ...Object.keys(db.processes).map(id => Number(id.split('-').at(-1)) || 0));
    const process = fresh('ADM-2026-' + String(last + 1).padStart(4, '0'), origin); save(process); return process;
  }
  function status(process) { return ({ solicitacao: 'Em Preenchimento', preparacao: 'Em Admissão', coleta: 'Em Admissão', validacao: 'Em Admissão', complementacao: 'Pendência', sesmt: 'Exame Admissional', validacao_final: 'Em Admissão', enviar_assinatura: 'Envio ao TAE', tratamento_tae: 'Erro no Envio ao TAE', integracao: 'Integração RM', tratamento: 'Erro de Integração RM', assinaturas: 'Aguardando Assinaturas', validacao_rm: 'Validação do Cadastro RM', notificacao_ti: 'Notificação à TI', tratamento_ti: 'Erro na Notificação à TI', finalizada: 'Admitido', cancelada: 'Admissão Cancelada' })[process.current] || 'Em Admissão'; }
  function selection(vacancy = 'VG-001', candidate = 'ana-beatriz') { return Object.values(read().processes).find(process => process.origin === 'Processo Seletivo' && process.form.vaga === vacancy && process.form.candidato === candidate) || null; }
  global.LonaxAdmission = { STORE, RM_STORE, TAE_STORE, TI_STORE, owners, stages, catalog, vacancies, definitions, documents, clone, now, date, money, fixed, signatures, documentSignatures, fresh, read, save, start, status, selection };
})(window);

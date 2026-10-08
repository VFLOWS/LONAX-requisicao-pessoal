(function () {
  var SL = window.SLComponents;
  var savedCode = new URLSearchParams(window.location.search).get("vaga");

  var vacancy = {
    title: "Operador de Máquinas - Linha Industrial",
    period: "Publicação 31/07/2026 - Fechamento 14/08/2026",
    status: "Em seleção",
    statusClass: "sl-status-neutral",
    meta: [
      { icon: "fa-location-dot", text: "Av. das Indústrias, 1450 - Sarzedo/MG" },
      { icon: "fa-building", text: "Presencial" },
      { icon: "fa-medal", text: "Operacional - Step 2" },
      { icon: "fa-dollar-sign", text: "R$ 2.450,00" }
    ],
    metrics: [
      { icon: "fa-file-signature", className: "sl-vagas-kpi-blue", label: "Requisição de origem", value: "REQ-2026-0184" },
      { icon: "fa-id-badge", className: "sl-vagas-kpi-green", label: "Tipo de contratação", value: "Efetivo" },
      { icon: "fa-users-gear", className: "sl-vagas-kpi-orange", label: "Quantidade de posições", value: "1" },
      { icon: "fa-link", className: "sl-vagas-kpi-red", label: "Referência Sólides", value: "895022" }
    ],
    responsibles: [
      { initials: "CM", name: "Carla Mendes" },
      { initials: "RS", name: "Renato Silva" }
    ],
    linkHref: "https://lonax.vagas.solides.com.br/vaga/895022",
    linkText: "lonax.vagas.solides.com.br/vaga/895022"
  };

  var candidates = [
    {
      slug: "marina-oliveira",
      initials: "MO",
      name: "Marina Oliveira",
      email: "marina.oliveira@email.com",
      cpf: "123.456.789-10",
      profile: ["Comunicador", "Executor"],
      workflow: "5001",
      activity: "Triagem RH",
      status: "Em processo",
      statusClass: "sl-status-neutral",
      sla: "No prazo",
      responsible: "Carla Mendes",
      score: "82%",
      nextAction: "Concluir a triagem do currículo e confirmar disponibilidade para a escala 6x1."
    },
    {
      slug: "caio-henrique",
      initials: "CH",
      name: "Caio Henrique",
      email: "caio.henrique@email.com",
      cpf: "987.654.321-00",
      profile: ["Planejador", "Analista"],
      workflow: "5002",
      activity: "Avaliação do Gestor",
      status: "Em processo",
      statusClass: "sl-status-neutral",
      sla: "No prazo",
      responsible: "Eduardo Martins",
      score: "76%",
      nextAction: "Realizar entrevista técnica e registrar o parecer do gestor."
    },
    {
      slug: "ana-beatriz",
      initials: "AB",
      name: "Ana Beatriz",
      email: "ana.beatriz@email.com",
      cpf: "229.118.440-55",
      profile: ["Executor"],
      workflow: "5003",
      activity: "Admissão Digital",
      status: "Aprovado",
      statusClass: "sl-status-success",
      sla: "No prazo",
      responsible: "Renato Silva",
      score: "91%",
      nextAction: "Conferir o comprovante de escolaridade e concluir a análise documental."
    }
  ];

  function profileTags(profile) {
    return '<div class="sl-profile-tags">' + profile.map(function (item) {
      var initial = String(item || "?").trim().charAt(0).toUpperCase();
      return '<span class="sl-profile-badge sl-profile-' + initial.toLowerCase() + '" data-profile="' + SL.escapeHtml(item) + '" title="' + SL.escapeHtml(item) + '">' + SL.escapeHtml(initial) + "</span>";
    }).join("") + "</div>";
  }

  function statusPill(text, className) {
    return '<span class="sl-status-pill ' + className + '">' + SL.escapeHtml(text) + "</span>";
  }

  function candidateName(candidate) {
    return '<a class="sl-candidate-name sl-candidate-link" href="detalhe-candidato.html?candidato=' + encodeURIComponent(candidate.slug) + '"><span class="sl-avatar-sm">' + candidate.initials + "</span>" + SL.escapeHtml(candidate.name) + "</a>";
  }

  function sectionHeader(title, description, icon, actionHtml) {
    return [
      '<div class="sl-detail-subsection-head">',
      '<div><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid ' + icon + '"></i></span><div>',
      "<h3>" + SL.escapeHtml(title) + "</h3>",
      description ? "<p>" + SL.escapeHtml(description) + "</p>" : "",
      "</div></div>",
      actionHtml ? '<div class="sl-panel-actions">' + actionHtml + "</div>" : "",
      "</div>"
    ].join("");
  }

  function renderCandidateRows() {
    return candidates.map(function (candidate) {
      return [
        candidateName(candidate),
        candidate.email,
        candidate.cpf,
        profileTags(candidate.profile),
        candidate.workflow,
        candidate.activity,
        statusPill(candidate.status, candidate.statusClass),
        candidate.sla
      ];
    });
  }

  function renderDetail() {
    var detailTabs = SL.tabs({
      label: "Detalhe da vaga",
      items: [
        { label: "Resumo", icon: "fa-chart-column", active: true, attrs: { "data-detail-tab": "resumo" } },
        { label: "Candidatos", icon: "fa-users", attrs: { "data-detail-tab": "candidatos" } },
        { label: "Dados da Vaga", icon: "fa-file-lines", attrs: { "data-detail-tab": "dados" } },
        { label: "Histórico", icon: "fa-clock-rotate-left", attrs: { "data-detail-tab": "historico" } },
        { label: "Admissões", icon: "fa-file-contract", attrs: { "data-detail-tab": "admissoes" } }
      ]
    });

    var tabsContent = [
      '<div class="sl-detail-section" id="tabResumo">',
      SL.kpiGrid([
        { className: "sl-vagas-kpi-blue", icon: "fa-briefcase", label: "Posições", value: "1" },
        { className: "sl-vagas-kpi-green", icon: "fa-users", label: "Candidatos", value: "12" },
        { className: "sl-vagas-kpi-orange", icon: "fa-user-check", label: "Aprovados", value: "1" },
        { className: "sl-vagas-kpi-red", icon: "fa-triangle-exclamation", label: "Fora do SLA", value: "0" }
      ]),
      SL.infoSection({ title: "Resumo gerencial", icon: "fa-briefcase", tone: "blue", columns: 4, items: [
        { label: "Código da Vaga", value: "VG-001" },
        { label: "Requisição de origem", value: "REQ-2026-0184" },
        { label: "Status da vaga", value: "Em seleção" },
        { label: "Previsão de início", value: "20/10/2026" },
        { label: "Área / Gerência", value: "Produção / Gerência Industrial" },
        { label: "Gestor", value: "Eduardo Martins" },
        { label: "Unidade / Filial", value: "Matriz - Sarzedo/MG" },
        { label: "Centro de custo", value: "IND.PRO.001" },
        { label: "Posições disponíveis", value: "1 de 1" },
        { label: "Posições preenchidas", value: "0" },
        { label: "Responsável pelo recrutamento", value: "Carla Mendes" },
        { label: "Responsável pela admissão", value: "Renato Silva" }
      ] }),
      SL.infoSection({ title: "Perfil da posição", icon: "fa-address-card", tone: "purple", columns: 4, items: [
        { label: "Cargo", value: "Operador de Máquinas" },
        { label: "Nível / Step", value: "Operacional - Step 2" },
        { label: "Tipo de necessidade", value: "Substituto" },
        { label: "Escolaridade", value: "Ensino médio completo" },
        { label: "Tipo de contrato", value: "Efetivo" },
        { label: "Salário proposto", value: "R$ 2.450,00" },
        { label: "Escala", value: "6x1" },
        { label: "Horário", value: "06:00 às 14:00" },
        { label: "Principais responsabilidades", value: "Operar máquinas da linha industrial, acompanhar parâmetros de produção, registrar ocorrências e apoiar a organização e a segurança da área.", wide: true },
        { label: "Requisitos prioritários", value: "Experiência na operação de máquinas industriais e disponibilidade para trabalho presencial em Sarzedo/MG, na escala 6x1.", wide: true }
      ] }),
      SL.infoSection({ title: "Situação da seleção e próximos passos", icon: "fa-list-check", tone: "green", columns: 4, items: [
        { label: "Candidato aprovado", value: "Ana Beatriz" },
        { label: "Situação da admissão", value: "Documentação em análise" },
        { label: "Pendência para contratação", value: "Comprovante de escolaridade" },
        { label: "Responsável pela pendência", value: "Renato Silva" },
        { label: "Última movimentação", value: "06/08/2026 08:45 - Conferência de documentação" },
        { label: "Entrevista técnica", value: "Caio Henrique - Avaliação do Gestor" },
        { label: "Triagem em andamento", value: "Marina Oliveira - Triagem RH" },
        { label: "Preenchimento da posição", value: "Aguardando conclusão da admissão" }
      ] }),
      sectionHeader("Candidatos em destaque", "Etapa, responsável e próxima ação dos candidatos acompanhados nesta vaga.", "fa-users", SL.button({ className: "sl-secondary-button", icon: "fa-users", label: "Ver candidatos", attrs: { "data-detail-open": "candidatos" } })),
      SL.table({
        className: "sl-summary-candidates-table",
        columns: ["Candidato", "Etapa atual", "Perfil", "Aderência", "Responsável", "Próxima ação"],
        rows: candidates.slice().sort(function (a, b) {
          return Number(b.status === "Aprovado") - Number(a.status === "Aprovado");
        }).map(function (candidate) {
          return [candidateName(candidate), SL.escapeHtml(candidate.activity), profileTags(candidate.profile), SL.escapeHtml(candidate.score), SL.escapeHtml(candidate.responsible), SL.escapeHtml(candidate.nextAction)];
        })
      }),
      "</div>",
      '<div class="sl-detail-section sl-hidden" id="tabCandidatos">',
      sectionHeader("Lista de candidatos", "Acompanhamento da solicitação Fluig de cada candidato.", "fa-users", '<a class="sl-secondary-button" href="index.html"><i class="fa-solid fa-file-import"></i> Gerenciar candidatos</a>'),
      SL.table({
        className: "sl-candidates-table",
        columns: ["Candidato", "E-mail", "CPF", "Perfil", "Solicitação Fluig", "Atividade atual", "Status", "SLA"],
        rows: renderCandidateRows()
      }),
      "</div>",
      '<div class="sl-detail-section sl-hidden" id="tabDados">',
      SL.infoSection({ title: "Dados da Requisição de Pessoal", icon: "fa-file-lines", tone: "blue", columns: 4, items: [
        { label: "Número da Requisição", value: "REQ-2026-0184" },
        { label: "Código da Vaga", value: "VG-001" },
        { label: "Solicitante", value: "Eduardo Martins" },
        { label: "Cargo", value: "Operador de Máquinas" },
        { label: "Nível / Step", value: "Operacional - Step 2" },
        { label: "Setor / Seção", value: "Produção" },
        { label: "Centro de custo", value: "IND.PRO.001" },
        { label: "Descrição do cargo", value: "Operar máquinas da linha industrial, acompanhar parâmetros de produção, registrar ocorrências e apoiar a organização e a segurança da área.", wide: true },
        { label: "Área / Gerência", value: "Gerência Industrial" },
        { label: "Gestor responsável", value: "Eduardo Martins" },
        { label: "Unidade / Filial", value: "Matriz - Sarzedo/MG" },
        { label: "Quantidade de posições", value: "1" },
        { label: "Tipo de necessidade", value: "Substituto" },
        { label: "Tipo de contrato", value: "Efetivo" },
        { label: "Salário proposto", value: "R$ 2.450,00" },
        { label: "Data desejada para contratação", value: "20/10/2026" },
        { label: "Escala", value: "6x1" },
        { label: "Horário", value: "06:00 às 14:00" },
        { label: "Data de abertura", value: "31/07/2026" },
        { label: "Escolaridade", value: "Ensino médio completo" }
      ] }),
      SL.infoSection({ title: "Recrutamento e publicação", icon: "fa-bullhorn", tone: "green", columns: 4, items: [
        { label: "Referência Sólides", value: "895022" },
        { label: "Data de publicação", value: "31/07/2026" },
        { label: "Data de fechamento", value: "14/08/2026" },
        { label: "Status de publicação", value: "Publicada" },
        { label: "Modalidade", value: "Presencial" },
        { label: "Local de trabalho", value: "Sarzedo/MG" },
        { label: "Responsável pelo recrutamento", value: "Carla Mendes" },
        { label: "Responsável pela admissão", value: "Renato Silva" }
      ] }),
      SL.infoSection({ title: "Justificativa e observações", icon: "fa-comment-dots", tone: "purple", items: [
        { label: "Justificativa", value: "Reposição operacional para reforçar a linha industrial diante do aumento de demanda produtiva.", wide: true },
        { label: "Observações para a vaga", value: "Priorizar candidatos com experiência na operação de máquinas industriais e disponibilidade para a escala 6x1.", wide: true }
      ] }),
      '<div class="sl-vaga-link-card"><span><i class="fa-solid fa-arrow-up-right-from-square"></i></span><div><small>Link da vaga na Sólides</small><a href="' + vacancy.linkHref + '" target="_blank" rel="noopener noreferrer">' + vacancy.linkText + "</a></div></div>",
      "</div>",
      '<div class="sl-detail-section sl-hidden" id="tabHistorico">',
      sectionHeader("Histórico da vaga", "Eventos e movimentações realizadas no processo seletivo.", "fa-clock-rotate-left"),
      renderHistory(),
      "</div>",
      '<div class="sl-detail-section sl-hidden" id="tabAdmissoes">',
      sectionHeader("Admissões", "Candidatos aprovados e seus processos de contratação.", "fa-file-contract"),
      SL.table({
        className: "sl-admission-table",
        columns: ["Candidato", "Solicitação Fluig", "Etapa", "Responsável", "Status", "Previsão de início"],
        rows: [
          [candidateName(candidates[2]), "5003", "Documentação", "Equipe de Admissão", statusPill("Em análise", "sl-status-neutral"), "20/10/2026"]
        ]
      }),
      "</div>"
    ];

    document.getElementById("detailApp").innerHTML = SL.pageSection({
      title: "Detalhe da vaga",
      description: "Resumo, dados, histórico e acompanhamento da posição.",
      icon: "fa-briefcase",
      iconClass: "sl-section-icon-candidates",
      actionsHtml: '<a class="sl-secondary-button" href="index.html"><i class="fa-solid fa-users"></i> Processo seletivo</a>',
      bodyHtml: [
        SL.jobSummary(vacancy),
        '<div class="sl-detail-viewbar">' + detailTabs + "</div>",
        tabsContent.join("")
      ].join("")
    });
  }

  function renderHistory() {
    return SL.historyTimeline([
      { date: "2026-07-31T09:12:00", title: "Abertura da vaga", icon: "fa-folder-plus", responsible: "Eduardo Martins", department: "Gerência Industrial", description: "Vaga criada após a aprovação da Requisição de Pessoal.", items: [{ label: "Requisição de origem", value: "REQ-2026-0184" }, { label: "Código da vaga", value: "VG-001" }, { label: "Posições autorizadas", value: "1" }] },
      { date: "2026-07-31T10:40:00", title: "Publicação na Sólides", icon: "fa-bullhorn", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Publicação realizada com prazo de recebimento de currículos até 14/08/2026.", items: [{ label: "Referência Sólides", value: "895022" }, { label: "Status", value: "Publicada" }, { label: "Modalidade", value: "Presencial" }] },
      { date: "2026-08-02T15:20:00", title: "Importação de candidatos", icon: "fa-file-import", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Planilha da Sólides conferida e candidatos vinculados à vaga, com solicitações individuais no Fluig.", items: [{ label: "Candidatos importados", value: "12" }, { label: "Origem", value: "Planilha Sólides" }, { label: "Resultado", value: "Importação concluída" }] },
      { date: "2026-08-03T09:10:00", title: "Triagem de candidatos", icon: "fa-list-check", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Currículos revisados considerando experiência operacional, disponibilidade e perfil da posição.", items: [{ label: "Em processo", value: "7" }, { label: "Reprovados na triagem", value: "3" }, { label: "Próxima etapa", value: "Avaliação do Gestor" }] },
      { date: "2026-08-04T14:30:00", title: "Avaliação do Gestor", icon: "fa-user-tie", responsible: "Eduardo Martins", department: "Gerência Industrial", description: "Entrevista técnica realizada com Ana Beatriz. Experiência e disponibilidade compatíveis com a vaga.", items: [{ label: "Candidato", value: "Ana Beatriz" }, { label: "Solicitação Fluig", value: "5003" }, { label: "Decisão", value: "Aprovada" }], tone: "green" },
      { date: "2026-08-05T11:35:00", title: "Encaminhamento para admissão", icon: "fa-user-check", responsible: "Renato Silva", department: "Departamento Pessoal", description: "Ana Beatriz encaminhada para conferência de documentos. Preenchimento da posição depende da conclusão da admissão.", items: [{ label: "Candidato", value: "Ana Beatriz" }, { label: "Solicitação Fluig", value: "5003" }, { label: "Previsão de início", value: "20/10/2026" }], tone: "green" },
      { date: "2026-08-06T08:45:00", title: "Conferência de documentação", icon: "fa-file-contract", responsible: "Renato Silva", department: "Departamento Pessoal", description: "Documentos recebidos e em análise. Aguardando comprovante de escolaridade para prosseguir com a admissão.", items: [{ label: "Candidato", value: "Ana Beatriz" }, { label: "Etapa", value: "Documentação" }, { label: "Situação", value: "Em análise" }], tone: "purple" }
    ]);
  }

  function renderRegisteredDetail(record) {
    if (!record) {
      document.getElementById("detailApp").innerHTML = SL.pageSection({
        title: "Vaga não encontrada", icon: "fa-briefcase",
        description: "O registro não está disponível neste navegador.",
        bodyHtml: '<a class="sl-secondary-button" href="dashboard.html">Voltar ao painel</a>'
      });
      return false;
    }
    var origin = record.requisition;
    function date(value) { return value ? value.split("-").reverse().join("/") : "Não informada"; }
    function person(name) { return { name: name, initials: name.split(" ").slice(0, 2).map(function (part) { return part.charAt(0); }).join("") }; }
    var originItems = [
      { label: "Requisição de origem", value: origin.number },
      { label: "Código da vaga", value: record.code }, { label: "Solicitante", value: origin.requester },
      { label: "Cargo", value: origin.role }, { label: "Nível / Step", value: origin.level },
      { label: "Setor / Seção", value: origin.area }, { label: "Centro de custo", value: origin.costCenter },
      { label: "Descrição do cargo", value: origin.description, wide: true },
      { label: "Área / Gerência", value: origin.department }, { label: "Gestor", value: origin.manager },
      { label: "Unidade / Filial", value: origin.unit }, { label: "Quantidade de posições", value: String(origin.positions) },
      { label: "Tipo de contrato", value: origin.contract }, { label: "Salário proposto", value: origin.salary },
      { label: "Escala", value: origin.schedule }, { label: "Horário", value: origin.hours },
      { label: "Tipo de necessidade", value: origin.need }, { label: "Data desejada de início", value: date(origin.desiredDate) },
      { label: "Escolaridade", value: origin.education }, { label: "Data de abertura", value: date(record.openingDate) },
      { label: "Justificativa", value: origin.justification, wide: true }, { label: "Observações para a vaga", value: origin.notes, wide: true }
    ];
    var recruitmentItems = [
      { label: "Responsável pelo recrutamento", value: record.recruiter }, { label: "Responsável pela admissão", value: record.admissionOwner },
      { label: "Modalidade", value: record.modality }, { label: "Local de trabalho", value: record.address || "Não informado" },
      { label: "Status da vaga", value: record.status }, { label: "Referência Sólides", value: record.reference || "Não vinculada" },
      { label: "Data de publicação", value: date(record.publicationDate) }, { label: "Publicação", value: record.published ? "Registrada" : "Aguardando publicação" },
      { label: "Etapas de seleção", value: window.SLVagas.activeSelectionSteps(record).map(function (step) { return step.title; }).join(" → "), wide: true },
      { label: "Observações do recrutamento", value: record.notes || "Sem observações.", wide: true },
      { label: "Observação da publicação", value: record.publicationNotes || "Sem observações.", wide: true }
    ];
    var history = [{ date: record.createdAt, title: "Cadastro da vaga", icon: "fa-folder-plus", responsible: record.recruiter, department: "Recursos Humanos", description: "Registro da vaga criado a partir de uma Requisição de Pessoal aprovada.", items: [{ label: "Código", value: record.code }, { label: "Requisição", value: origin.number }, { label: "Posições", value: String(origin.positions) }] }];
    if (record.updatedAt !== record.createdAt) history.push({ date: record.updatedAt, title: "Atualização do cadastro", icon: "fa-pen-to-square", responsible: record.recruiter, department: "Recursos Humanos", description: "Dados do recrutamento e configuração da seleção atualizados.", items: [{ label: "Status da vaga", value: record.status }, { label: "Referência Sólides", value: record.reference || "Não vinculada" }] });
    document.getElementById("detailApp").innerHTML = SL.pageSection({
      title: "Detalhe da vaga", description: "Resumo, dados, histórico e acompanhamento da posição.",
      icon: "fa-briefcase", iconClass: "sl-section-icon-candidates",
      actionsHtml: '<a class="sl-secondary-button" href="cadastro-vaga.html?vaga=' + encodeURIComponent(record.code) + '"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Editar cadastro</a>',
      bodyHtml: [
        SL.jobSummary({ title: record.title, period: "Abertura " + date(record.openingDate), status: record.status, statusClass: "sl-status-neutral", meta: [
          { icon: "fa-location-dot", text: record.address || origin.unit }, { icon: "fa-building", text: record.modality },
          { icon: "fa-medal", text: origin.level }, { icon: "fa-dollar-sign", text: origin.salary }
        ], metrics: [
          { icon: "fa-file-signature", className: "sl-vagas-kpi-blue", label: "Requisição de origem", value: origin.number },
          { icon: "fa-id-badge", className: "sl-vagas-kpi-green", label: "Tipo de contratação", value: origin.contract },
          { icon: "fa-users-gear", className: "sl-vagas-kpi-orange", label: "Quantidade de posições", value: String(origin.positions) },
          { icon: "fa-link", className: "sl-vagas-kpi-red", label: "Referência Sólides", value: record.reference || "Não vinculada" }
        ], responsibles: [person(record.recruiter), person(record.admissionOwner)], linkHref: record.published ? record.url : "", linkText: record.url }),
        '<div class="sl-detail-viewbar">' + SL.tabs({ label: "Detalhe da vaga", items: [
          { label: "Resumo", icon: "fa-chart-column", active: true, attrs: { "data-detail-tab": "resumo" } },
          { label: "Candidatos", icon: "fa-users", attrs: { "data-detail-tab": "candidatos" } },
          { label: "Dados da Vaga", icon: "fa-file-lines", attrs: { "data-detail-tab": "dados" } },
          { label: "Histórico", icon: "fa-clock-rotate-left", attrs: { "data-detail-tab": "historico" } },
          { label: "Admissões", icon: "fa-file-contract", attrs: { "data-detail-tab": "admissoes" } }
        ] }) + '</div>',
        '<div class="sl-detail-section" id="tabResumo">',
        SL.infoSection({ title: "Resumo gerencial", icon: "fa-briefcase", columns: 4, items: [
          { label: "Código da vaga", value: record.code }, { label: "Status", value: record.status },
          { label: "Gestor", value: origin.manager }, { label: "Previsão de início", value: date(origin.desiredDate) },
          { label: "Posições disponíveis", value: String(origin.positions) }, { label: "Posições preenchidas", value: "0" },
          { label: "Candidatos vinculados", value: "0" }, { label: "Situação da admissão", value: "Não iniciada" }
        ] }),
        SL.infoSection({ title: "Perfil da posição", icon: "fa-address-card", tone: "purple", columns: 4, items: originItems.slice(3, 7).concat([{ label: "Responsabilidades", value: origin.description, wide: true }, { label: "Requisitos prioritários", value: origin.notes, wide: true }]) }),
        SL.infoSection({ title: "Recrutamento", icon: "fa-users", tone: "green", columns: 4, items: recruitmentItems.slice(0, -2) }),
        '</div>',
        '<div class="sl-detail-section sl-hidden" id="tabCandidatos"><p class="sl-empty-state"><i class="fa-solid fa-users"></i> Nenhum candidato vinculado a esta vaga.</p></div>',
        '<div class="sl-detail-section sl-hidden" id="tabDados">',
        SL.infoSection({ title: "Dados da Requisição de Pessoal", icon: "fa-file-lines", columns: 4, items: originItems }),
        SL.infoSection({ title: "Recrutamento e publicação", icon: "fa-bullhorn", tone: "green", columns: 4, items: recruitmentItems.filter(function (item) { return item.label !== "Etapas de seleção"; }) }),
        SL.infoSection({ title: "Configuração do processo seletivo", icon: "fa-diagram-project", bodyHtml: SL.selectionRoute(window.SLVagas.activeSelectionSteps(record)) }),
        '</div>',
        '<div class="sl-detail-section sl-hidden" id="tabHistorico">' + SL.historyTimeline(history) + '</div>',
        '<div class="sl-detail-section sl-hidden" id="tabAdmissoes"><p class="sl-empty-state"><i class="fa-solid fa-file-contract"></i> Nenhuma admissão iniciada para esta vaga.</p></div>'
      ].join("")
    });
    return true;
  }

  function bindDetailTabs() {
    document.querySelectorAll("[data-detail-open]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelector('.sl-tab[data-detail-tab="' + button.getAttribute("data-detail-open") + '"]').click();
      });
    });
    document.querySelectorAll("[data-detail-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        var tab = button.getAttribute("data-detail-tab");
        document.querySelectorAll("[data-detail-tab]").forEach(function (item) {
          item.classList.toggle("sl-tab-active", item === button);
        });
        ["resumo", "candidatos", "dados", "historico", "admissoes"].forEach(function (name) {
          document.getElementById("tab" + name.charAt(0).toUpperCase() + name.slice(1)).classList.toggle("sl-hidden", name !== tab);
        });
      });
    });
  }

  if (!savedCode) {
    renderDetail();
    bindDetailTabs();
  } else if (renderRegisteredDetail(window.SLVagas.find(savedCode))) {
    bindDetailTabs();
  }
}());

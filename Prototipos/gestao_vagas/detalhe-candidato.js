(function () {
  var SL = window.SLComponents;
  var candidateData = window.SLCandidatos;

  // Exemplos fictícios do protótipo; o retorno da Sólides é tratado separadamente.
  var candidates = {
    "marina-oliveira": {
      initials: "MO",
      name: "Marina Oliveira",
      email: "marina.oliveira@email.com",
      cpf: "123.456.789-10",
      phone: "(62) 99921-3388",
      birthDate: "18/04/1999",
      gender: "Feminino",
      address: "Aparecida de Goiânia/GO",
      addressDetails: {
        zipCode: "74900-000", streetName: "Rua das Palmeiras", number: "85", additionalInformation: "Apartamento 202",
        neighborhood: "Jardim Central", countryAcronym: "BR", city: { name: "Aparecida de Goiânia", state: { initials: "GO" } }
      },
      profile: ["Comunicador", "Executor"],
      workflow: "5001",
      activity: "Triagem RH",
      status: "Em processo",
      statusClass: "sl-status-neutral",
      sla: "No prazo",
      origin: "Sólides",
      salary: "R$ 2.450,00",
      score: "82%",
      admission: "Não iniciada"
    },
    "caio-henrique": {
      initials: "CH",
      name: "Caio Henrique",
      email: "caio.henrique@email.com",
      cpf: "987.654.321-00",
      phone: "(62) 98810-2211",
      birthDate: "02/09/1998",
      gender: "Masculino",
      address: "Goiânia/GO",
      addressDetails: {
        zipCode: "74000-000", streetName: "Rua dos Lírios", number: "310", additionalInformation: "Casa",
        neighborhood: "Setor Central", countryAcronym: "BR", city: { name: "Goiânia", state: { initials: "GO" } }
      },
      profile: ["Planejador", "Analista"],
      workflow: "5002",
      activity: "Avaliação do Gestor",
      status: "Em processo",
      statusClass: "sl-status-neutral",
      sla: "No prazo",
      origin: "Sólides",
      salary: "R$ 2.450,00",
      score: "76%",
      admission: "Não iniciada"
    },
    "ana-beatriz": {
      initials: "AB",
      name: "Ana Beatriz",
      email: "ana.beatriz@email.com",
      cpf: "229.118.440-55",
      phone: "(31) 98840-7710",
      birthDate: "11/12/1996",
      gender: "Feminino",
      address: "Sarzedo/MG",
      addressDetails: {
        zipCode: "32450-000", streetName: "Rua das Flores", number: "125", additionalInformation: "Casa",
        neighborhood: "Centro", countryAcronym: "BR", city: { name: "Sarzedo", state: { initials: "MG" } }
      },
      profile: ["Executor"],
      workflow: "5003",
      activity: "Admissão Digital",
      status: "Aprovado",
      statusClass: "sl-status-success",
      sla: "No prazo",
      origin: "Cadastro manual",
      salary: "R$ 2.450,00",
      score: "91%",
      admission: "Documentação"
    },
    "bruno-ferreira": {
      initials: "BF",
      name: "Bruno Ferreira",
      email: "bruno.ferreira@email.com",
      cpf: "452.771.638-40",
      phone: "(31) 98844-1020",
      birthDate: "12/05/1997",
      gender: "Masculino",
      address: "Sarzedo/MG",
      addressDetails: {
        zipCode: "32450-000", streetName: "Rua das Acácias", number: "42", additionalInformation: "Casa 2",
        neighborhood: "Jardim Industrial", countryAcronym: "BR", city: { name: "Sarzedo", state: { initials: "MG" } }
      },
      profile: ["Planejador", "Executor"],
      workflow: "5101",
      activity: "Triagem RH",
      status: "Solicitação iniciada",
      statusClass: "sl-status-success",
      sla: "No prazo",
      origin: "Cadastro manual",
      salary: "R$ 2.450,00",
      score: "84%",
      admission: "Não iniciada"
    }
  };

  function formatDate(value) {
    if (!value) return "Não informado";
    var iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return iso ? iso[3] + "/" + iso[2] + "/" + iso[1] : String(value);
  }

  function formatCpf(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length === 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : value || "Não informado";
  }

  function formatPhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11) return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
    if (digits.length === 10) return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    return value || "Não informado";
  }

  function dateOrder(value) {
    var parts = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (parts) return Date.UTC(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
    var iso = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return iso ? Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : 0;
  }

  function linkedInUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (error) { return ""; }
  }

  function loadCandidate(key) {
    var context = candidateData.read(key);
    var base = Object.assign({}, candidates[key] || {}, context || {});
    var source = candidateData.sourceFor(base);
    if (!base.name && (key === candidateData.exampleSlug || key === String(candidateData.example.id))) {
      source = candidateData.example;
    }
    if (!base.name && !source) return null;
    var name = base.name || source.fullName;
    var expectation = source && source.salary_expectation;
    var salary = expectation !== null && expectation !== undefined && expectation !== "" && Number.isFinite(Number(expectation))
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(expectation)) : base.salary || "Não informada";
    return Object.assign(base, {
      key: key,
      name: name,
      fullName: source ? source.fullName : name,
      initials: base.initials || name.split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase(),
      email: source ? source.mainEmail : base.email,
      secondaryEmail: source ? source.secondaryEmail : "",
      cpf: formatCpf(source ? source.idNumber : base.cpf),
      phone: formatPhone(source ? source.phone : base.phone),
      mobile: source && source.mobile ? formatPhone(source.mobile) : "",
      birthDate: formatDate(source ? source.birthDate : base.birthDate),
      gender: (source ? source.gender : base.gender) || "Não informado",
      profile: Array.isArray(base.profile) ? base.profile : [],
      status: base.status || "Não iniciada",
      statusClass: base.statusClass || (base.status === "Solicitação iniciada" ? "sl-status-success" : "sl-status-neutral"),
      activity: base.activity || "Aguardando início",
      origin: base.origin || "Sólides",
      salary: salary,
      source: source,
      addressDetails: source && source.address || (context && context.registeredAt ? context.addressDetails || null : base.addressDetails || null),
      admission: base.admission === "Documentação" ? "Conferência de documentos" : base.admission || "Não iniciada"
    });
  }

  function renderContactActions(candidate) {
    var linkedin = linkedInUrl(candidate.source && candidate.source.linkedin);
    return linkedin ? '<div class="sl-candidate-contact-actions"><a class="sl-secondary-button" href="' + SL.escapeHtml(linkedin) + '" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin" aria-hidden="true"></i> LinkedIn</a></div>' : "";
  }

  function addressFields(candidate) {
    var address = candidate.addressDetails;
    var fields = address ? [
      { label: "CEP", value: address.zipCode || "Não informado" },
      { label: "Logradouro", value: address.streetName || "Não informado" },
      { label: "Número", value: address.number == null || address.number === "" ? "Não informado" : String(address.number) },
      { label: "Complemento", value: address.additionalInformation || "Não informado" },
      { label: "Bairro", value: address.neighborhood || "Não informado" },
      { label: "Cidade", value: address.city && address.city.name || address.foreign_city || "Não informado" },
      { label: "UF", value: address.city && address.city.state && address.city.state.initials || address.stateAcronym || "Não informado" },
      { label: "País", value: address.countryAcronym === "BR" ? "Brasil" : address.countryAcronym || "Não informado" }
    ] : [{ label: "Localidade informada", value: candidate.address || "Não informado", wide: true }];
    return fields;
  }

  function professionalFields(candidate) {
    var source = candidate.source;
    var fields = [{ label: "Pretensão salarial", value: candidate.salary }];
    if (source) {
      var levels = { management: "Gestão", junior: "Júnior", middle: "Pleno", senior: "Sênior" };
      fields.push({ label: "Senioridade informada", value: levels[source.seniority] || source.seniority || "Não informada" });
      var license = String(source.drivers_license);
      fields.push({ label: "Possui CNH?", value: license === "1" || license === "true" ? "Sim" : license === "0" || license === "false" ? "Não" : "Não informado" });
      if (source.drivers_license_category && (license === "1" || license === "true")) fields.push({ label: "Categoria da CNH", value: source.drivers_license_category });
    }
    return fields;
  }

  function renderCandidateData(candidate) {
    var fields = [
      { label: "Nome completo", value: candidate.fullName },
      { label: "CPF", value: candidate.cpf },
      { label: "Data de nascimento", value: candidate.birthDate },
      { label: "Gênero", value: candidate.gender },
      { label: "E-mail principal", value: candidate.email || "Não informado" }
    ];
    if (candidate.secondaryEmail) fields.push({ label: "E-mail alternativo", value: candidate.secondaryEmail });
    fields.push({ label: "Telefone", value: candidate.phone });
    if (candidate.mobile) fields.push({ label: "Celular", value: candidate.mobile });
    fields = fields.concat(professionalFields(candidate), addressFields(candidate));
    return SL.infoSection({ title: "Dados do candidato", icon: "fa-address-card", tone: "blue", bodyHtml: SL.infoGrid(fields, 3) + renderContactActions(candidate) });
  }

  function renderExperiences(candidate) {
    var experiences = candidate.source && Array.isArray(candidate.source.professionalExperiences) ? candidate.source.professionalExperiences : [];
    if (!experiences.length) return "";
    var timeline = '<div class="sl-record-timeline sl-experience-timeline">' + experiences.slice().sort(function (a, b) { return dateOrder(b.startDate) - dateOrder(a.startDate); }).map(function (entry, index) {
      var period = formatDate(entry.startDate) + " a " + (entry.endDate ? formatDate(entry.endDate) : "Término não informado");
      return '<article class="sl-record-event"><span class="sl-record-event-dot"><i class="fa-solid fa-briefcase" aria-hidden="true"></i></span><details class="sl-record-collapse"' + (index === 0 ? ' open' : '') + '><summary><div><h3>' + SL.escapeHtml(entry.position || "Cargo não informado") + '</h3><p>' + SL.escapeHtml(entry.company || "Empresa não informada") + ' - ' + SL.escapeHtml(period) + '</p></div><i class="fa-solid fa-chevron-down sl-record-chevron" aria-hidden="true"></i></summary><div class="sl-record-event-body"><div class="sl-experience-description"><span>Atividades desempenhadas</span><p>' + SL.escapeHtml((entry.activitiesDescription || "Atividades não informadas.").trim()) + '</p></div></div></details></article>';
    }).join("") + '</div>';
    return SL.infoSection({ title: "Experiência profissional", icon: "fa-briefcase", tone: "green", bodyHtml: timeline });
  }

  function renderBehaviorProfile(candidate) {
    if (!candidate.profile.length) return "";
    return SL.infoSection({ title: "Perfil comportamental", icon: "fa-chart-simple", tone: "purple", bodyHtml: SL.behaviorProfileCards(candidate.profile) });
  }

  function queryCandidate() {
    var params = new URLSearchParams(window.location.search);
    return params.get("candidato") || "marina-oliveira";
  }

  function statusPill(text, className) {
    return '<span class="sl-status-pill ' + className + '">' + SL.escapeHtml(text) + "</span>";
  }

  function renderCandidateHeader(candidate) {
    return [
      '<div class="sl-candidate-profile-card">',
      '<div class="sl-candidate-profile-main">',
      '<span class="sl-candidate-profile-avatar">' + SL.escapeHtml(candidate.initials) + "</span>",
      "<div>",
      "<h2>" + SL.escapeHtml(candidate.name) + "</h2>",
      "<p>Operador de Máquinas - Linha Industrial</p>",
      '<div class="sl-candidate-profile-tags">' + statusPill(candidate.status, candidate.statusClass) + (candidate.sla ? statusPill(candidate.sla, "sl-status-neutral") : "") + (candidate.source ? '<span class="sl-candidate-source-reference"><i class="fa-solid fa-link" aria-hidden="true"></i> Sólides ' + SL.escapeHtml(candidate.source.id) + '</span>' : '') + "</div>",
      "</div>",
      "</div>",
      '<div class="sl-candidate-profile-actions">',
      '<a class="sl-secondary-button" href="detalhe-vaga.html"><i class="fa-solid fa-briefcase" aria-hidden="true"></i> Detalhe da vaga</a>',
      '<a class="sl-primary-button" href="index.html"><i class="fa-solid fa-users" aria-hidden="true"></i> Lista de candidatos</a>',
      "</div>",
      "</div>"
    ].join("");
  }

  function renderDetail() {
    var candidate = loadCandidate(queryCandidate());
    if (!candidate) {
      document.getElementById("candidateDetailApp").innerHTML = SL.pageSection({ title: "Candidato não encontrado", icon: "fa-user", description: "O registro não está disponível nesta consulta.", bodyHtml: '<a class="sl-secondary-button" href="index.html">Voltar para candidatos</a>' });
      return;
    }

    document.getElementById("candidateDetailApp").innerHTML = SL.pageSection({
      title: "Detalhe do candidato",
      description: "Consulta individual do candidato, perfil e andamento da solicitação Fluig.",
      icon: "fa-user",
      iconClass: "sl-section-icon-candidates",
      bodyHtml: [
        renderCandidateHeader(candidate),
        SL.kpiGrid([
          { className: "sl-vagas-kpi-blue", icon: "fa-file-signature", label: "Solicitação Fluig", value: candidate.workflow || "Não iniciada" },
          { className: "sl-vagas-kpi-green", icon: "fa-list-check", label: "Atividade atual", value: candidate.activity },
          { className: "sl-vagas-kpi-orange", icon: "fa-dollar-sign", label: "Pretensão salarial", value: candidate.salary },
          { className: "sl-vagas-kpi-red", icon: "fa-file-contract", label: "Situação da admissão", value: candidate.admission }
        ]),
        renderCandidateData(candidate),
        renderExperiences(candidate),
        renderBehaviorProfile(candidate),
        SL.infoSection({ title: "Solicitação Fluig", icon: "fa-file-signature", tone: "green", bodyHtml: candidate.workflow ? SL.table({
          className: "sl-candidate-workflow-table",
          columns: ["Solicitação", "Atividade atual", "Responsável", "Status", "SLA"],
          rows: [
            [candidate.workflow, candidate.activity, candidate.activity === "Avaliação do Gestor" ? "Eduardo Martins" : candidate.activity === "Admissão Digital" ? "Renato Silva" : "Carla Mendes", statusPill(candidate.status, candidate.statusClass), candidate.sla]
          ]
        }) : '<p class="sl-candidate-empty">Nenhuma solicitação iniciada para este candidato.</p>' }),
        '<div class="sl-detail-subsection-head"><div><span class="sl-section-icon sl-section-icon-candidates"><i class="fa-solid fa-clock-rotate-left"></i></span><div><h3>Histórico do candidato</h3><p>Movimentações e decisões nesta vaga.</p></div></div></div>',
        renderHistory(candidate)
      ].join("")
    });
  }

  function renderHistory(candidate) {
    if (candidate.registeredAt || !candidates[candidate.key]) {
      if (!candidate.workflow || !candidate.registeredAt) return '<p class="sl-candidate-empty">Não há movimentações registradas para este candidato.</p>';
      return SL.historyTimeline([
        { date: candidate.registeredAt, title: "Vínculo com a vaga", icon: "fa-user-plus", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Candidato vinculado à vaga Operador de Máquinas - Linha Industrial.", items: [{ label: "Candidato", value: candidate.name }, { label: "Origem", value: candidate.origin }, { label: "Vaga", value: "VG-001" }] },
        { date: candidate.registeredAt, title: "Abertura da Solicitação Fluig", icon: "fa-file-signature", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Solicitação individual iniciada para acompanhamento das avaliações do candidato.", items: [{ label: "Solicitação Fluig", value: candidate.workflow }, { label: "Etapa atual", value: candidate.activity }, { label: "Status", value: candidate.status }] }
      ]);
    }
    var events = [
      { date: "2026-08-02T15:20:00", title: "Vínculo com a vaga", icon: "fa-user-plus", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Dados conferidos e candidato vinculado à vaga Operador de Máquinas - Linha Industrial.", items: [{ label: "Candidato", value: candidate.name }, { label: "Origem", value: candidate.origin }, { label: "Vaga", value: "VG-001" }] },
      { date: "2026-08-02T15:23:00", title: "Abertura da Solicitação Fluig", icon: "fa-file-signature", responsible: "Carla Mendes", department: "Recursos Humanos", description: "Solicitação individual iniciada para registrar as avaliações e decisões do processo seletivo.", items: [{ label: "Solicitação Fluig", value: candidate.workflow }, { label: "Etapa inicial", value: "Triagem RH" }, { label: "Status", value: "Solicitação iniciada" }] }
    ];
    if (candidate.status !== "Solicitação iniciada") {
      events.push({ date: "2026-08-03T09:10:00", title: "Triagem RH", icon: "fa-list-check", responsible: "Carla Mendes", department: "Recursos Humanos", description: candidate.activity === "Triagem RH" ? "Currículo e disponibilidade recebidos. A avaliação de aderência aos requisitos da vaga está em andamento." : "Currículo compatível com os requisitos. Candidato encaminhado para avaliação técnica do gestor.", items: [{ label: "Situação", value: candidate.activity === "Triagem RH" ? "Em análise" : "Aprovado na triagem" }, { label: "Perfis identificados", value: candidate.profile.join(" / ") }, { label: "Aderência", value: candidate.score }], tone: "green" });
    }
    if (candidate.activity === "Avaliação do Gestor" || candidate.status === "Aprovado") {
      events.push({ date: "2026-08-04T14:30:00", title: "Avaliação do Gestor", icon: "fa-user-tie", responsible: "Eduardo Martins", department: "Gerência Industrial", description: candidate.status === "Aprovado" ? "Entrevista técnica concluída. Experiência operacional e disponibilidade compatíveis com a posição." : "Entrevista técnica agendada para avaliação da experiência em máquinas industriais e disponibilidade de horário.", items: [{ label: "Decisão", value: candidate.status === "Aprovado" ? "Aprovado" : "Em avaliação" }, { label: "Cargo", value: "Operador de Máquinas" }, { label: "Solicitação Fluig", value: candidate.workflow }], tone: "green" });
    }
    if (candidate.status === "Aprovado") {
      events.push({ date: "2026-08-05T11:35:00", title: "Encaminhamento para admissão", icon: "fa-user-check", responsible: "Renato Silva", department: "Departamento Pessoal", description: "Candidato aprovado e encaminhado para envio dos documentos necessários à contratação.", items: [{ label: "Decisão", value: "Aprovado" }, { label: "Previsão de início", value: "20/10/2026" }, { label: "Admissão", value: candidate.admission }], tone: "green" });
      events.push({ date: "2026-08-06T08:45:00", title: "Conferência de documentação", icon: "fa-file-contract", responsible: "Renato Silva", department: "Departamento Pessoal", description: "Documentação recebida e em análise. Aguardando comprovante de escolaridade para concluir a conferência.", items: [{ label: "Etapa", value: "Admissão Digital" }, { label: "Situação", value: "Em análise" }, { label: "Pendência", value: "Comprovante de escolaridade" }], tone: "purple" });
    }
    return SL.historyTimeline(events);
  }

  renderDetail();
}());

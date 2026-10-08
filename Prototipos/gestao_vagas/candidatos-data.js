(function (global) {
  var example = {
  "id": 20287766,
  "fullName": "A LEXA NDER HA UBRICHS DE",
  "mainEmail": "alexandeer181@gmail.com",
  "secondaryEmail": "nedved_elband@hotmail.com",
  "idNumber": "15590970784",
  "drivers_license": "1",
  "drivers_license_category": "B",
  "gender": "Masculino",
  "phone": "21980910707",
  "mobile": null,
  "birthDate": "1992-10-25",
  "seniority": "management",
  "linkedin": "https://www.linkedin.com/in/alexander-haubrichs/",
  "salary_expectation": "3500.0",
  "origin": "JOBS API",
  "address": {
    "zipCode": "21550-570",
    "streetName": "Rua Acapu",
    "additionalInformation": null,
    "number": null,
    "neighborhood": "Marechal Hermes",
    "countryAcronym": "BR",
    "stateAcronym": "Rio de Janeiro",
    "foreign_city": "Rio de Janeiro",
    "city": {
      "name": "Rio de Janeiro",
      "state": {
        "name": "Rio de Janeiro",
        "initials": "RJ"
      }
    }
  },
  "languages": [],
  "professionalExperiences": [
    {
      "position": "Gestor de Tráfego Pleno",
      "company": "Chesslab",
      "startDate": "01/02/2026",
      "endDate": "01/08/2026",
      "activitiesDescription": "- Planejar, configurar e otimizar campanhas em Meta Ads e Google Ads.\n- Monitorar métricas no Looker e GA4 diariamente e aplicar otimizações contínuas além de criar relatório semanais e mensais.\n- Enviar relatórios semanais para os clientes"
    },
    {
      "position": "Gestor de Tráfego Pleno",
      "company": "Turbo Partners",
      "startDate": "01/06/2025",
      "endDate": "01/12/2025",
      "activitiesDescription": "- Planejar, configurar e otimizar campanhas em Meta Ads e Google Ads.\n- Monitorar métricas no Looker e GA4 diariamente e aplicar otimizações contínuas além de criar relatório semanais e mensais."
    },
    {
      "position": "Analista de Projetos",
      "company": "L0gik Tecnologia",
      "startDate": "01/04/2024",
      "endDate": "01/01/2025",
      "activitiesDescription": "- Apoiar na elaboração e atualização dos planos de projeto, cronogramas e orçamentos;\n- Monitorar a execução das atividades do projeto;\n- Auxiliar na preparação de documentos e materiais para reuniões de diretoria;"
    },
    {
      "position": "Analista de Performance Pleno",
      "company": "Bradesco Seguros",
      "startDate": "01/08/2022",
      "endDate": "01/02/2024",
      "activitiesDescription": "- Criação de docs em Data Layer\n- Tagueamento dos portais de seguro do Bradesco Seguros\n- Criação de dashboards dos portais no Looker\n- Validação dos itens tagueados\n- Ajustes de SEO On-Page"
    },
    {
      "position": "Analista de Inbound Marketing",
      "company": "DIWE",
      "startDate": "01/02/2022",
      "endDate": "01/06/2022",
      "activitiesDescription": "\n\n- Planejamento estratégico de inbound e régua de e-mails\n- Gerir a implementação e mensuração de todos os canais digitais;\n- Análise de SEO do site e blogs dos clientes\n- Gerir disparos de e-mail marketing através do RD STATION e demais plataformas;\n- Desenvolver e implementar melhorias nas landing pages e e-mails;\n-  Adicionar pop ups no site e blog dos clientes\n- Analisar entrada de leads e apresentar resultados mensais"
    },
    {
      "position": "Analista de Growth",
      "company": "Seazone",
      "startDate": "01/07/2021",
      "endDate": "01/01/2022",
      "activitiesDescription": "- Criação de estratégias para campanhas de Face Ads e Google Ads\n- Estratégias de Aquisição de usuários\n- Gatilhos de Ativação e Retenção de usuários\n- Criação de estratégias para campanhas de e-mail marketing\n- Configuração de e-mails marketing e funis nas plataformas (RD e SendPulse)\n- Criação de estratégias e configuração de testes A/B na plataforma VWO\n- Gerenciamento de Backlog e Roadmap\n- Criação, alimentação e gerencimento do Dashboard via Looker Studio e demais dados do Analytics"
    },
    {
      "position": "Analista de Marketing Digital Pleno",
      "company": "Agência DOA COMM",
      "startDate": "01/01/2021",
      "endDate": "01/06/2021",
      "activitiesDescription": "\n\n- Planejamento estratégico e cronogramas de mídia digital de performance;\n- Gerir a implementação e mensuração de todos os canais digitais;\n- Realimentar e otimizar programas de anúncios nas plataformas (Google Ads, Facebook Business Manager, LinkedIn Ads);\n- Gerir calendário e Estratégias das mídias sociais junto com Criação e Marketing;\n- Gerir disparos de e-mail marketing através do RD STATION e demais plataformas;\n- Desenvolver e ajustar código para alterações nas landing pages e e-mails;\n- Realizar ajustes na automação do CRM e nos fluxos entre marketing e comercial.\n- Atendimento de múltiplas contas, cerca de 20 clientes simultâneos;\n- Planejamento, implementação, monitoramento e otimização de campanha de Google Ads/Youtube Ads e Facebook/Instagram Ads;"
    }
  ]
};
  var contextKey = "lonax.gestaoVagas.candidatos.contexto.v1";

  function slug(name) {
    return String(name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function contexts() {
    try {
      var records = JSON.parse(global.sessionStorage.getItem(contextKey));
      return records && typeof records === "object" ? records : {};
    } catch (error) { return {}; }
  }

  global.SLCandidatos = {
    example: example,
    exampleSlug: "alexander-haubrichs-de",
    slug: slug,
    remember: function (candidate) {
      var key = slug(candidate.name);
      try {
        var records = contexts();
        records[key] = candidate;
        global.sessionStorage.setItem(contextKey, JSON.stringify(records));
      } catch (error) { /* The candidate link remains available. */ }
      return key;
    },
    read: function (key) { return contexts()[key] || null; },
    sourceFor: function (candidate) {
      var cpf = String(candidate.cpf || "").replace(/\D/g, "");
      var email = String(candidate.email || "").trim().toLowerCase();
      return cpf && cpf === example.idNumber || email && email === example.mainEmail.toLowerCase() ? example : null;
    }
  };
}(window));

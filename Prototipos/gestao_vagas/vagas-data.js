(function (global) {
  var recordsKey = "lonax.gestaoVagas.registros.v1";
  var draftKey = "lonax.gestaoVagas.rascunho.v1";

  var requisitions = [
    {
      number: "REQ-2026-0241", process: "8041", approvedAt: "2026-10-05", approvedBy: "Ricardo Nunes",
      requester: "Eduardo Martins", role: "Operador de Máquinas", level: "Operacional - Step 2",
      description: "Operar máquinas da linha industrial, acompanhar parâmetros de produção, registrar ocorrências e apoiar a organização e a segurança da área.",
      area: "Produção", department: "Gerência Industrial", costCenter: "IND.PRO.001",
      manager: "Eduardo Martins", unit: "Matriz - Sarzedo/MG", positions: 1,
      contract: "Efetivo", salary: "R$ 2.450,00", schedule: "6x1", hours: "06:00 às 14:00",
      desiredDate: "2026-10-20", need: "Substituto", education: "Ensino médio completo",
      justification: "Reposição de colaborador da linha industrial para manter a capacidade produtiva da área.",
      notes: "Priorizar experiência na operação de máquinas industriais e disponibilidade para a escala 6x1."
    },
    {
      number: "REQ-2026-0242", process: "8042", approvedAt: "2026-10-06", approvedBy: "Ricardo Nunes",
      requester: "Patrícia Almeida", role: "Analista de Qualidade", level: "Pleno - Step 2",
      description: "Executar inspeções de qualidade em produtos e processos, registrar não conformidades e acompanhar indicadores da área industrial.",
      area: "Controle de Qualidade", department: "Gerência de Qualidade", costCenter: "IND.QUA.004",
      manager: "Patrícia Almeida", unit: "Matriz - Sarzedo/MG", positions: 2,
      contract: "Efetivo", salary: "R$ 4.800,00", schedule: "5x1", hours: "08:00 às 17:48",
      desiredDate: "2026-11-03", need: "Aumento de quadro", education: "Ensino superior completo",
      justification: "Reforço da equipe de qualidade para atender ao aumento de demanda da linha industrial.",
      notes: "Experiência com inspeção de processos e análise de indicadores de qualidade."
    },
    {
      number: "REQ-2026-0243", process: "8043", approvedAt: "2026-10-07", approvedBy: "Ricardo Nunes",
      requester: "Carla Mendes", role: "Auxiliar Administrativo", level: "Júnior - Step 1",
      description: "Apoiar rotinas administrativas, organizar documentos, atualizar controles e atender solicitações internas.",
      area: "Administração", department: "Gerência Administrativa", costCenter: "ADM.GER.002",
      manager: "Carla Mendes", unit: "Unidade Contagem/MG", positions: 1,
      contract: "Efetivo", salary: "R$ 2.100,00", schedule: "5x1", hours: "08:00 às 17:48",
      desiredDate: "2026-11-10", need: "Substituto", education: "Ensino médio completo",
      justification: "Reposição de posição administrativa para continuidade dos controles e atendimento interno.",
      notes: "Conhecimento de planilhas e organização de documentos."
    }
  ];

  function read(key, fallback) {
    try {
      return JSON.parse(global.localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function list() {
    var records = read(recordsKey, []);
    return Array.isArray(records) ? records.filter(function (record) { return record && record.code && record.requisition; }) : [];
  }

  function find(code) {
    return list().find(function (record) { return record.code === code; });
  }

  function save(record) {
    var records = list();
    var duplicate = records.find(function (item) { return item.requisition.number === record.requisition.number && item.code !== record.code; });
    if (duplicate) throw new Error("Esta requisição já possui a vaga " + duplicate.code + " cadastrada.");
    if (!record.code) {
      var last = records.reduce(function (value, item) { return Math.max(value, Number(item.code.replace("VG-", "")) || 0); }, 3);
      record.code = "VG-" + String(last + 1).padStart(3, "0");
    }
    var index = records.findIndex(function (item) { return item.code === record.code; });
    if (index === -1) records.push(record);
    else records[index] = record;
    global.localStorage.setItem(recordsKey, JSON.stringify(records));
    return record;
  }

  function today() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }

  global.SLVagas = {
    statuses: ["Aguardando publicação", "Em recrutamento", "Em seleção", "Em admissão"],
    selectionSteps: [
      { id: "triagem", title: "Triagem RH", icon: "fa-list-check" },
      { id: "avaliacao", title: "Avaliação do Gestor", icon: "fa-user-tie" },
      { id: "entrevistaRh", title: "Entrevista RH", icon: "fa-comments" },
      { id: "entrevistaGestor", title: "Entrevista Gestor", icon: "fa-people-arrows" },
      { id: "teste", title: "Teste / Avaliação complementar", icon: "fa-clipboard-check" },
      { id: "parecer", title: "Parecer final", icon: "fa-user-check" }
    ],
    requisitions: requisitions,
    activeSelectionSteps: function (record) {
      var definitions = record.selectionStages || global.SLVagas.selectionSteps;
      return (record.steps || []).map(function (id) {
        return definitions.find(function (step) { return step.id === id; });
      }).filter(Boolean);
    },
    list: list,
    find: find,
    save: save,
    today: today,
    readDraft: function () { return read(draftKey, null); },
    saveDraft: function (draft) { global.localStorage.setItem(draftKey, JSON.stringify(draft)); },
    clearDraft: function () { global.localStorage.removeItem(draftKey); }
  };
}(window));

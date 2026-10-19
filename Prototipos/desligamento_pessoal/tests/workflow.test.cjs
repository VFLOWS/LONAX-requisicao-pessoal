const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

let chromium;
try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (_) { /* Optional browser QA dependency. */ }
const executablePath = [process.env.CHROME_BIN, '/usr/bin/brave-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(p => p && fs.existsSync(p));
const root = path.resolve(__dirname, '../..');
const storageKey = 'lonax.desligamento.v1';
const parallelTitle = 'Aguardar Análises do SESMT e TI';
let server, browser, origin;
const skip = !chromium || !executablePath ? 'Requer Playwright e CHROME_BIN (veja README).' : false;
const image = { name: 'evidencia.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') };

before(async () => {
  if (skip) return;
  server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf' })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); if (server) await new Promise(resolve => server.close(resolve)); });

async function session(fn) {
  const context = await browser.newContext();
  // External branding assets do not affect workflow assertions.
  await context.route(/^https:\/\//, route => route.abort());
  const page = await context.newPage();
  const failures = []; page.on('pageerror', error => failures.push(error.message));
  try { await fn(page); assert.deepEqual(failures, [], 'Nenhum erro de execução no navegador'); }
  finally { await context.close(); }
}
async function load(page, stage) { await page.goto(origin + '/desligamento_pessoal/etapa.html?etapa=' + stage); }
async function validationText(page) { return (await page.locator('.lx-error-message').allTextContents()).join(' '); }
async function state(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey); }
function stageOf(page) { const url = new URL(page.url()); return url.searchParams.get('etapa') || (url.pathname.endsWith('/espera_paralelo.html') ? 'paralelo' : 'solicitacao'); }
async function historyTitles(page) { return page.locator('.lx-collapse-title > span').allTextContents(); }
function stabilityRecord(scope, type) { return scope.locator('[data-stability-type="' + type + '"]'); }
async function click(page, action) { await page.locator('[data-action="' + action + '"]').click(); }
async function confirm(page) { await page.locator('#modalConfirm').click(); }
async function radio(page, field, value) { await page.locator('[data-field="' + field + '"][value="' + value + '"]').check(); }
async function review(page, area, value = 'approve', note = 'Dados conferidos pela área responsável.') {
  if (stageOf(page) === 'paralelo' && ['sesmt', 'ti'].includes(area)) {
    await page.locator('.lx-parallel-card[href="etapa.html?etapa=' + area + '"]').click();
  }
  await page.locator('[data-decision="' + area + '"][value="' + value + '"]').check();
  const noteField = page.locator('[data-note="' + area + '"]');
  if (await noteField.isVisible()) await noteField.fill(note);
  await click(page, 'decide'); await confirm(page);
}
async function pick(page, key, value) {
  const control = page.locator('[data-single-select][data-key="' + key + '"]');
  await control.locator('.lx-single-select-control').click();
  await control.locator('[data-select-option="' + value + '"]').click();
}
async function request(page, items = false) {
  await load(page, 'solicitacao');
  await pick(page, 'tipo', 'Dispensa sem justa por iniciativa do empregado');
  await page.locator('[data-field="prevista"]').fill('2026-10-30');
  await page.locator('[data-field="justificativa"]').fill('Reorganização da equipe para o cenário demonstrativo.');
  await radio(page, 'infraestrutura', items ? 'Sim' : 'Não');
  if (items) {
    await pick(page, 'item-infraItems-0', 'Notebook / Computador');
    await page.locator('[data-item="infraItems"][data-prop="descricao"]').first().fill('Notebook informado pelo gestor');
  }
  await radio(page, 'epi', items ? 'Sim' : 'Não');
  if (items) {
    await pick(page, 'item-epiItems-0', 'Capacete de segurança');
  }
  await click(page, 'submit'); await confirm(page);
}
async function untilParallel(page, items = false) {
  await request(page, items); await review(page, 'diretoria');
  await radio(page, 'estabilidade', 'Não'); await radio(page, 'prosseguir', 'Sim');
  await review(page, 'rh');
  assert.equal(stageOf(page), 'paralelo');
  await page.locator('.lx-parallel-card[href="etapa.html?etapa=sesmt"]').click();
  await page.locator('[data-decision="sesmt"]').first().waitFor();
}
async function upload(page, group) {
  const count = (await state(page)).files[group]?.length || 0;
  await page.locator('[data-upload="' + group + '"]').setInputFiles(image);
  await page.waitForFunction(({ key, group, count }) => JSON.parse(localStorage.getItem(key)).files[group]?.length > count, { key: storageKey, group, count });
}
async function receiveSignatures(page, roles = ['Colaborador', 'Gestor']) {
  // Retorno de exemplo da plataforma, recebido independentemente de ações na interface.
  await page.evaluate(({ key, roles }) => {
    const saved = JSON.parse(localStorage.getItem(key));
    const timestamp = saved.created;
    const signing = saved.electronicSigning || {
      revision: saved.revision, employee: saved.form.employee, provider: 'Plataforma digital', protocol: 'DESL-' + saved.form.employee + '-R' + saved.revision,
      sentAt: timestamp, document: saved.files.paraAssinatura[0], validatedAt: '', signedDocument: null,
      signers: [
        { role: 'Colaborador', name: 'Carlos Pereira', email: 'carlos.pereira@exemplo.com', status: 'Assinado', signedAt: timestamp },
        { role: 'Gestor', name: 'Eduardo Martins', email: 'eduardo.martins@exemplo.com', status: 'Pendente', signedAt: '' }
      ]
    };
    signing.signers.forEach(signer => { if (roles.includes(signer.role)) { signer.status = 'Assinado'; signer.signedAt = timestamp; } });
    signing.updatedAt = timestamp;
    if (signing.signers.every(signer => signer.status === 'Assinado')) {
      signing.signedDocument = { id: 'retorno-assinado-' + saved.revision, name: 'documento-de-desligamento-assinado.pdf', url: 'anexos/documento-de-desligamento-assinado.pdf', type: 'application/pdf', size: 2857, revision: saved.revision, origin: 'Plataforma digital', by: 'Sistema', date: timestamp };
      saved.files.assinado = [signing.signedDocument];
    }
    saved.electronicSigning = signing;
    const updated = JSON.stringify(saved);
    localStorage.setItem(key, updated);
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: updated }));
  }, { key: storageKey, roles });
}

test('fluxo completo: TI primeiro, SESMT, anexos, assinaturas e 44 checks manuais do DP', { skip }, async () => session(async page => {
  await load(page, 'solicitacao'); await page.locator('[data-key="tipo"] [data-clear-select]').click(); await click(page, 'submit');
  assert.match(await validationText(page), /Campo obrigatório/);
  assert.equal(await page.locator('.lx-field-name-tipo.lx-error').count(), 1);
  await untilParallel(page, true);
  assert.equal((await state(page)).current, 'paralelo');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  await load(page, 'documento');
  assert.equal(await page.locator('[data-action="send-signatures"]').isDisabled(), true);
  await load(page, 'ti');
  for (const row of await page.locator('[data-item="infraItems"][data-prop="devolver"]').all()) await row.selectOption('Sim');
  await upload(page, 'termoInfra'); await review(page, 'ti');
  assert.equal((await state(page)).current, 'paralelo');
  assert.equal((await state(page)).decisions.sesmt?.completed || false, false);
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  assert.equal(await page.locator('[data-action="continue-parallel"]').isDisabled(), true);
  await page.locator('.lx-parallel-card[href="etapa.html?etapa=sesmt"]').click();
  await radio(page, 'exame', 'Sim');
  await page.locator('[data-action="delete-file"][data-group="guia"]').click(); await confirm(page);
  for (const row of await page.locator('[data-item="epiItems"][data-prop="devolver"]').all()) await row.selectOption('Sim');
  await page.locator('[data-decision="sesmt"][value="approve"]').check();
  await page.locator('[data-note="sesmt"]').fill('Análise técnica realizada.'); await click(page, 'decide');
  assert.match(await validationText(page), /guia de encaminhamento/);
  await upload(page, 'guia'); await upload(page, 'termoEpi'); await review(page, 'sesmt');
  assert.equal((await state(page)).current, 'paralelo');
  assert.equal(await page.locator('[data-action="continue-parallel"]').isEnabled(), true);
  await click(page, 'continue-parallel');
  assert.equal((await state(page)).current, 'documento');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH', 'Análise da TI', 'Análise do SESMT']);
  assert.ok((await state(page)).history.some(record => record.area === 'paralelo'), 'A espera continua registrada no processo');
  assert.equal(await page.locator('[data-file-group="documento"]:visible .lx-attachment-row').count(), 1);
  assert.equal(await page.locator('[data-file-group="documento"]:visible [data-upload]').count(), 0);
  await click(page, 'send-signatures');
  assert.equal((await historyTitles(page)).at(-1), 'Documento de Desligamento');
  assert.equal(await page.locator('[data-upload]').count(), 0, 'A assinatura eletrônica dispensa anexação manual');
  assert.equal(await page.locator('.lx-signature-card, [data-sign]').count(), 0);
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key)); saved.files.paraAssinatura = []; saved.files.assinado = []; localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  await page.reload();
  await click(page, 'finish-signatures'); await confirm(page);
  assert.equal((await state(page)).current, 'validacao_assinaturas');
  assert.equal(stageOf(page), 'validacao_assinaturas');
  assert.equal((await state(page)).files.paraAssinatura[0].origin, 'Gerado automaticamente');
  assert.equal((await state(page)).files.assinado.length, 0);
  assert.deepEqual(await page.locator('[data-signature-tracking] [data-signer] .lx-signing-status').allTextContents(), [' Assinado', ' Pendente']);
  assert.equal(await page.locator('[data-document-signing-status]').innerText(), 'Parcialmente assinado');
  await click(page, 'validate-signatures');
  assert.match(await validationText(page), /Aguarde a assinatura/);
  assert.equal(await page.locator('[data-signature-tracking].lx-error').count(), 1);
  assert.match(await page.locator('[data-signature-tracking] .lx-signing-count').innerText(), /1 de 2/);
  await page.reload();
  await click(page, 'validate-signatures');
  assert.match(await validationText(page), /Aguarde a assinatura/);
  await receiveSignatures(page);
  assert.match(await page.locator('[data-signature-tracking] .lx-signing-count').innerText(), /2 de 2/);
  assert.equal((await state(page)).electronicSigning.validatedAt, '');
  assert.equal((await state(page)).current, 'validacao_assinaturas');
  await click(page, 'validate-signatures'); await confirm(page);
  assert.equal((await state(page)).current, 'dp');
  assert.deepEqual((await historyTitles(page)).slice(-3), ['Documento de Desligamento', 'Encaminhar para Assinatura', 'Validar Assinaturas']);
  const signedRecord = (await state(page)).history.find(row => row.action === 'Assinaturas validadas');
  assert.equal(signedRecord.files.assinado[0].name, 'documento-de-desligamento-assinado.pdf');
  assert.ok(signedRecord.electronicSigning.validatedAt);
  const sentRecord = (await state(page)).history.find(row => row.action === 'Documento enviado para assinatura eletrônica');
  assert.deepEqual(sentRecord.electronicSigning.signers.map(signer => signer.status), ['Assinado', 'Pendente'], 'O histórico do envio preserva o cenário original');
  assert.equal(signedRecord.snapshot.assinaturaColaborador, '');
  assert.equal(signedRecord.snapshot.assinaturaGestor, '');
  assert.equal(await page.locator('[data-check]').count(), 44);
  assert.equal(await page.locator('[data-check]:checked').count(), 44);
  await page.evaluate(() => Array.from(document.querySelectorAll('[data-check]'), node => node.dataset.check).forEach(id => document.querySelector('[data-check="' + id + '"]').click()));
  await click(page, 'finish'); assert.match(await validationText(page), /44 item/);
  await radio(page, 'checklistConcluido', 'Sim');
  await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[data-check]'), n => n.dataset.check);
    ids.forEach(id => document.querySelector('[data-check="' + id + '"]').click());
  });
  assert.equal(await page.locator('#checkCount').innerText(), '44');
  await click(page, 'finish'); await confirm(page);
  assert.equal((await state(page)).current, 'finalizada');
  assert.equal((await state(page)).endedBy, 'Juliana Costa');
  assert.equal((await historyTitles(page)).at(-1), 'DP — Checklist da Rescisão');
  await page.reload(); assert.match(await page.locator('#statusLabel').innerText(), /Finalizado/);
  await page.getByRole('button', { name: 'Validar Assinaturas', exact: true }).click();
  await page.locator('[data-action="file"]:visible').first().click();
  await page.locator('#modalMessage iframe').waitFor(); await confirm(page);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Sem rolagem horizontal no celular');
  await load(page, 'rh');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria'], 'Reabrir uma etapa anterior não antecipa o histórico de etapas posteriores');
}));

for (const area of ['diretoria', 'rh', 'sesmt', 'ti']) {
  test('devolução por ' + area + ': preserva dados e exige retomada explícita para simulação', { skip }, async () => session(async page => {
    if (['sesmt', 'ti'].includes(area)) { await untilParallel(page); await load(page, area); }
    else { await request(page); if (area === 'rh') await review(page, 'diretoria'); }
    await review(page, area, 'return', 'Complementar a justificativa da solicitação.');
    const before = await state(page); assert.equal(before.current, 'correcao');
    assert.equal(before.correction.before.employee, '000731');
    await page.locator('[data-field="justificativa"]').fill('Justificativa corrigida pelo solicitante.');
    await page.locator('[data-field="changes"]').fill('Justificativa complementada.');
    await click(page, 'correct'); await confirm(page);
    assert.equal((await state(page)).current, 'retomada');
    assert.equal((await state(page)).revision, 2);
    assert.equal((await state(page)).history.some(h => h.action === 'Devolução para correção'), true);
    await click(page, 'resume'); await confirm(page);
    assert.equal((await state(page)).current, ['sesmt', 'ti'].includes(area) ? 'paralelo' : area);
    assert.equal((await state(page)).form.justificativa, 'Justificativa corrigida pelo solicitante.');
    assert.equal((await state(page)).document, null);
    assert.ok((await historyTitles(page)).includes('Correção da Solicitação'), 'Os ajustes enviados continuam no histórico após a retomada');
  }));
}

test('RH impede continuidade; reprovação encerra sem gerar documento', { skip }, async () => session(async page => {
  await request(page); await review(page, 'diretoria');
  await radio(page, 'estabilidade', 'Sim');
  await page.locator('[data-field="motivoEstabilidade"]').fill('Parecer demonstrativo de estabilidade.');
  await radio(page, 'prosseguir', 'Não');
  await page.locator('[data-decision="rh"][value="approve"]').check();
  await page.locator('[data-note="rh"]').fill('Não é possível prosseguir neste cenário.'); await click(page, 'decide');
  assert.match(await validationText(page), /permita prosseguir/);
  await review(page, 'rh', 'reject', 'Continuidade impedida pelo RH.');
  assert.equal((await state(page)).current, 'reprovada'); assert.equal((await state(page)).document, null);
}));

test('SESMT primeiro e assinatura presencial também liberam DP sem ordem de assinatura', { skip }, async () => session(async page => {
  await untilParallel(page); await radio(page, 'exame', 'Não'); await review(page, 'sesmt');
  assert.equal((await state(page)).current, 'paralelo');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  await review(page, 'ti');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  await click(page, 'continue-parallel');
  await click(page, 'send-signatures');
  await radio(page, 'modalidade', 'Presencial');
  assert.equal(await page.locator('[data-sign]').count(), 0);
  assert.equal(await page.locator('[data-file-group="assinado"]:visible .lx-attachment-row').count(), 1);
  await upload(page, 'assinado'); await click(page, 'finish-signatures'); await confirm(page);
  assert.equal((await state(page)).current, 'dp');
  await page.locator('[data-na="proventos-0"]').check();
  await page.locator('[data-check-note="proventos-0"]').fill('');
  await click(page, 'finish'); assert.match(await validationText(page), /Justifique/);
  await page.locator('[data-check="proventos-0"]').check();
  assert.equal(await page.locator('[data-na="proventos-0"]').isChecked(), false);
}));

test('dados do RM somente leitura, troca de colaborador e navegação sem pular etapas', { skip }, async () => session(async page => {
  await load(page, 'solicitacao');
  await pick(page, 'employee', '000918');
  assert.match(await page.locator('[data-key="employee"] .lx-tag').innerText(), /Fernanda Lima/);
  assert.equal(await page.locator('[data-field="rm_cargo"]').getAttribute('readonly'), '');
  assert.equal(await page.locator('[data-field="rm_centro"]').inputValue(), 'ADM.GER.002');
  assert.match(await page.locator('#appView').innerText(), /Informações de Estabilidade/);
  assert.equal(await stabilityRecord(page, 'Maternidade').locator('[data-label="Registro informado"] strong').innerText(), 'Sim');
  assert.match(await stabilityRecord(page, 'Maternidade').locator('.lx-history-note strong').innerText(), /Licença-maternidade/);
  assert.equal(await stabilityRecord(page, 'Maternidade').locator('.lx-readonly-item-retorno-previsto strong').innerText(), '01/03/2027');
  assert.doesNotMatch(await page.locator('#appView').innerText(), /Histórico da Solicitação/);
  await radio(page, 'infraestrutura', 'Sim');
  await page.locator('[data-action="add-item"][data-scope="infraItems"]').click();
  await pick(page, 'employee', '001042');
  assert.equal((await state(page)).form.infraItems.length, 2);
  assert.equal((await state(page)).form.epiItems.length, 3);
  for (const field of await page.locator('[data-item]').all()) assert.ok(await field.inputValue(), 'A troca de colaborador mantém os itens de exemplo preenchidos');
  assert.equal(await page.locator('[data-field="rm_centro"]').inputValue(), 'IND.MAN.005');
  for (const group of ['guia', 'termoEpi', 'termoInfra']) assert.ok((await state(page)).files[group][0].url.endsWith('.pdf'), 'O novo cenário mantém os anexos fixos de ' + group);
  assert.equal(await stabilityRecord(page, 'CIPA').locator('[data-label="Registro informado"] strong').innerText(), 'Sim');
  assert.equal(await stabilityRecord(page, 'Afastamento').locator('[data-label="Registro informado"] strong').innerText(), 'Sim');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await load(page, 'dp'); assert.equal(await page.locator('[data-action="finish"]').isEnabled(), true);
  assert.equal((await state(page)).current, 'solicitacao');
  await page.goto(origin + '/index.html');
  assert.equal(await page.locator('a[href="./desligamento_pessoal/index.html"]').count(), 1);
}));

test('SESMT e TI em abas distintas preservam as duas conclusões', { skip }, async () => session(async page => {
  await untilParallel(page);
  const ti = await page.context().newPage();
  await load(ti, 'ti'); await review(ti, 'ti');
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).decisions.ti.completed, storageKey);
  await radio(page, 'exame', 'Não'); await review(page, 'sesmt');
  const current = await state(page);
  assert.equal(current.current, 'paralelo');
  assert.equal(current.decisions.sesmt.completed, true);
  assert.equal(current.decisions.ti.completed, true);
  await ti.waitForFunction(() => !document.querySelector('[data-action="continue-parallel"]').disabled);
  await click(page, 'continue-parallel');
  assert.equal((await state(page)).current, 'documento');
  await ti.waitForFunction(() => document.getElementById('statusLabel').textContent === 'Aguardando documento');
  assert.equal(await ti.locator('[data-action="continue-parallel"]').isDisabled(), true);
}));

test('abertura mantém exemplos, Sim/Não próximos, anexos e justificativa única no final', { skip }, async () => session(async page => {
  await load(page, 'solicitacao');
  await click(page, 'draft');
  assert.equal(await page.locator('#modalIcon .fa-save').count(), 1);
  assert.equal(await page.locator('#modalTitle').innerText(), 'Salvar rascunho');
  await confirm(page);
  for (const scope of ['infraItems', 'epiItems']) {
    const values = await page.locator('[data-item="' + scope + '"]').evaluateAll(nodes => nodes.map(node => node.value));
    assert.ok(values.length && values.every(Boolean), 'Itens, quantidades e observações já preenchidos');
  }
  for (const field of ['infraestrutura', 'epi']) {
    const options = await page.locator('.lx-field-name-' + field + ' .lx-radio-option').evaluateAll(nodes => nodes.map(node => {
      const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top };
    }));
    assert.equal(options[1].left - options[0].right, 28);
    assert.equal(options[1].top, options[0].top);
  }
  assert.equal(await page.locator('[data-field="justificativa"]').count(), 1);
  assert.match(await page.locator('.lx-fieldset').last().innerText(), /Justificativa de desligamento/);
  assert.equal(await page.locator('[data-drop="solicitacao"]').evaluate(node => getComputedStyle(node).display), 'block');
  assert.equal(await page.locator('[data-file-group="solicitacao"] .lx-attachment-row').count(), 3);
  await page.locator('[data-action="file"][data-group="solicitacao"]').first().click();
  assert.equal(await page.locator('#modalIcon .fa-eye').count(), 1);
  assert.equal(await page.locator('#modalMessage a').count(), 0);
  assert.match(await page.locator('#modalMessage iframe').getAttribute('src'), /anexos\/teste%201.pdf/);
  await confirm(page);
  const sampleDownload = page.waitForEvent('download');
  await page.locator('[data-action="download-file"][data-group="solicitacao"]').first().click();
  assert.equal(await page.locator('#modalIcon .fa-download').count(), 1);
  assert.equal(await page.locator('#modalMessage a').count(), 0);
  await confirm(page);
  assert.equal((await sampleDownload).suggestedFilename(), 'teste 1.pdf');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('[data-action="choose-file"][data-group="solicitacao"]').click();
  await (await chooser).setFiles(image);
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).files.solicitacao?.length === 4, storageKey);
  await page.reload();
  await page.locator('[data-action="file"][data-group="solicitacao"]').last().click();
  await page.locator('.lx-file-image').waitFor();
  assert.equal(await page.locator('#modalIcon .fa-eye').count(), 1);
  assert.equal(await page.locator('#modalMessage a').count(), 0);
  await confirm(page);
  const download = page.waitForEvent('download');
  await page.locator('[data-action="download-file"][data-group="solicitacao"]').last().click();
  assert.equal(await page.locator('#modalIcon .fa-download').count(), 1);
  await confirm(page);
  assert.equal((await download).suggestedFilename(), image.name);
  await page.locator('[data-action="delete-file"][data-group="solicitacao"]').last().click();
  assert.equal(await page.locator('#modalIcon .fa-trash').count(), 1);
  await confirm(page);
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).files.solicitacao.length === 3, storageKey);
  await upload(page, 'solicitacao');
  await click(page, 'submit');
  assert.equal(await page.locator('#modalIcon .fa-paper-plane').count(), 1);
  await confirm(page);
  await page.locator('[data-collapse="request"]').click();
  const evidence = page.locator('[data-file-group="solicitacao"]').first();
  assert.equal(await evidence.locator('.lx-attachment-row').count(), 4, 'Anexos preservados no resumo após envio');
  assert.equal(await evidence.locator('[data-action="delete-file"]').count(), 0);
  await load(page, 'solicitacao');
  assert.equal(await page.locator('[data-action="download-file"][data-group="solicitacao"]').first().isEnabled(), true);
  assert.equal(await page.locator('[data-action="delete-file"][data-group="solicitacao"]').first().isDisabled(), true);
}));

test('validação pinta o campo, mostra mensagem, rola até ele e remove o erro ao editar', { skip }, async () => session(async page => {
  await load(page, 'solicitacao');
  await page.locator('[data-field="justificativa"]').fill('');
  await page.evaluate(() => { scrollTo(0, 0); document.querySelector('[data-action="submit"]').click(); });
  const field = page.locator('.lx-field-name-justificativa');
  await field.locator('.lx-error-message').waitFor();
  assert.equal(await field.locator('textarea').getAttribute('aria-invalid'), 'true');
  assert.equal(await field.locator('textarea').evaluate(node => getComputedStyle(node).borderTopColor), 'rgb(225, 66, 66)');
  assert.equal(await field.locator('.lx-error-message').innerText(), 'Campo obrigatório.');
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-field="justificativa"]');
    const r = node.getBoundingClientRect(); return scrollY > 0 && r.top >= 0 && r.bottom <= innerHeight && document.activeElement === node;
  });
  await field.locator('textarea').fill('Justificativa complementada.');
  assert.equal(await field.locator('.lx-error-message').count(), 0);
  assert.equal(await field.locator('textarea').getAttribute('aria-invalid'), null);
  await page.locator('[data-item="epiItems"][data-index="0"][data-prop="quantidade"]').fill('0');
  await click(page, 'submit');
  assert.equal(await page.locator('[data-item="epiItems"][data-index="0"][data-prop="quantidade"]').getAttribute('aria-invalid'), 'true');
  assert.match(await validationText(page), /Quantidade inválida/);
  await page.locator('[data-key="tipo"] [data-clear-select]').click();
  await click(page, 'submit');
  await page.waitForFunction(() => document.activeElement === document.querySelector('[data-key="tipo"] [data-select-input]'));
  assert.equal(await page.locator('[data-key="tipo"] .lx-select-list').isVisible(), false, 'Lista fechada mantém a mensagem de erro visível');
}));

test('aprovação aberta diretamente permite alternar decisões e escrever a justificativa', { skip }, async () => session(async page => {
  await load(page, 'diretoria');
  assert.equal((await state(page)).current, 'solicitacao');
  assert.equal(await page.locator('[data-action="decide"]').isEnabled(), true);
  for (const value of ['return', 'reject', 'approve', 'return']) {
    const radio = page.locator('[data-decision="diretoria"][value="' + value + '"]');
    assert.equal(await radio.isEnabled(), true);
    await radio.check();
    assert.equal(await page.locator('[data-decision="diretoria"][value="' + value + '"]').isChecked(), true);
    assert.equal(await page.locator('[data-note="diretoria"]').isVisible(), value !== 'approve');
    if (value !== 'approve') {
      assert.equal(await page.locator('[data-note="diretoria"]').isEnabled(), true);
      await page.locator('[data-note="diretoria"]').fill('Justificativa de demonstração para ' + value);
    }
  }
  await page.reload();
  assert.equal(await page.locator('[data-decision="diretoria"][value="return"]').isChecked(), true);
  assert.match(await page.locator('[data-note="diretoria"]').inputValue(), /Justificativa de demonstração/);
  for (const area of ['rh', 'sesmt', 'ti']) {
    await load(page, area);
    for (const radio of await page.locator('[data-decision]').all()) assert.equal(await radio.isEnabled(), true);
    assert.equal(await page.locator('[data-action="decide"]').isEnabled(), true);
  }
}));

test('envio do RH aberto diretamente valida os campos, permite cancelar e registra a decisão confirmada', { skip }, async () => session(async page => {
  await load(page, 'rh');
  assert.equal(await page.locator('[data-action="decide"]').isEnabled(), true);
  await click(page, 'decide');
  assert.equal(await page.locator('#modalBackdrop').isVisible(), false);
  assert.equal(await page.locator('.lx-field-name-estabilidade.lx-error').count(), 1);
  assert.equal(await page.locator('.lx-field-name-prosseguir.lx-error').count(), 1);
  assert.equal((await state(page)).current, 'solicitacao');

  await radio(page, 'estabilidade', 'Sim');
  await page.locator('[data-field="motivoEstabilidade"]').fill('Mandato da CIPA avaliado pelo RH neste cenário.');
  await radio(page, 'prosseguir', 'Sim');
  await page.locator('[data-note="rh"]').fill('Continuidade analisada e aprovada pelo RH.');
  await click(page, 'decide');
  assert.equal(await page.locator('#modalBackdrop').isVisible(), true);
  await page.locator('#modalCancel').click();
  assert.equal((await state(page)).current, 'solicitacao');
  assert.equal((await state(page)).history.length, 0, 'Cancelar preserva o processo sem registrar uma decisão');

  await click(page, 'decide'); await confirm(page);
  const saved = await state(page);
  assert.equal(saved.current, 'paralelo');
  assert.equal(saved.decisions.rh.completed, true);
  const approval = saved.history.find(row => row.area === 'rh');
  assert.equal(approval.note, 'Continuidade analisada e aprovada pelo RH.');
  assert.equal(approval.snapshot.estabilidade, 'Sim');
  assert.equal(approval.snapshot.prosseguir, 'Sim');
  assert.equal(saved.history.some(row => row.area === 'diretoria'), false, 'O envio não inventa decisões das outras áreas');
  await load(page, 'rh');
  assert.equal(await page.locator('[data-action="decide"]').isDisabled(), true, 'A aprovação concluída permanece em consulta');
}));

test('Aprovação do RH exibe o histórico recolhível da Diretoria na navegação direta e no fluxo', { skip }, async () => session(async page => {
  await load(page, 'rh');
  assert.deepEqual(await page.locator('.lx-view-head h2').allTextContents(), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  const toggle = page.getByRole('button', { name: 'Aprovação da Diretoria', exact: true });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await toggle.click();
  const record = toggle.locator('xpath=ancestor::section[1]');
  assert.match(await record.locator('legend').innerText(), /Decisão sobre a Solicitação/);
  assert.equal(await record.locator('.lx-readonly-item-decisao strong').innerText(), 'Solicitação aprovada');
  assert.equal(await record.locator('.lx-readonly-item-responsavel strong').innerText(), 'Roberto Siqueira');
  assert.equal(await record.locator('.lx-readonly-item-observacao strong').innerText(), 'Etapa aprovada sem ressalvas.');
  assert.match(await record.locator('.lx-view-head p').innerText(), /Roberto Siqueira - Diretoria Industrial/);
  assert.equal((await state(page)).current, 'solicitacao', 'Consultar o exemplo não aprova nem movimenta a solicitação');
  assert.equal((await state(page)).history.length, 0, 'O exemplo não é salvo como histórico efetivo');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');

  await request(page); await review(page, 'diretoria');
  assert.equal((await state(page)).current, 'rh');
  assert.equal(await toggle.count(), 1, 'O registro efetivo substitui o exemplo, sem duplicação');
  assert.match(await toggle.getAttribute('data-collapse'), /^approval-\d+$/);
  await toggle.click();
  const approval = (await state(page)).history.find(row => row.area === 'diretoria');
  assert.match(await record.locator('.lx-view-head p').innerText(), new RegExp(approval.date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(await record.locator('.lx-readonly-item-responsavel strong').innerText(), approval.responsible);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.goto(origin + '/desligamento_pessoal/index.html');
  assert.equal(await page.getByRole('heading', { name: 'Aprovação do RH', exact: true }).count(), 1);
  assert.doesNotMatch(await page.locator('body').innerText(), /Análise do RH e Estabilidade/);
}));

test('CIPA, afastamento e maternidade aparecem na solicitação e no histórico sem decidir pelo RH', { skip }, async () => session(async page => {
  await load(page, 'solicitacao');
  const list = page.locator('.lx-stability-list');
  assert.equal(await list.locator('article').count(), 3);
  assert.equal(await list.locator('input, textarea, select, fieldset, table, [role="table"], .lx-read-table').count(), 0, 'Consulta somente leitura em blocos sem tabela ou fieldsets individuais');
  assert.match(await list.evaluate(node => node.closest('fieldset').previousElementSibling.querySelector('legend').textContent), /Parâmetros de Desligamento/);
  assert.deepEqual(await list.locator('.lx-history-note > span').allTextContents(), ['Observações', 'Observações', 'Observações']);
  assert.equal(await stabilityRecord(page, 'CIPA').locator('[data-label="Registro informado"] strong').innerText(), 'Sim');
  assert.equal(await stabilityRecord(page, 'Afastamento').locator('[data-label="Registro informado"] strong').innerText(), 'Não');
  assert.equal(await stabilityRecord(page, 'Maternidade').locator('[data-label="Registro informado"] strong').innerText(), 'Não');
  assert.match(await stabilityRecord(page, 'CIPA').innerText(), /Titular/);
  assert.equal((await state(page)).form.estabilidade, undefined, 'O retorno do RM não define o parecer do RH');
  await pick(page, 'employee', '001042');
  await radio(page, 'infraestrutura', 'Não'); await radio(page, 'epi', 'Não');
  await click(page, 'submit'); await confirm(page);
  await page.locator('[data-collapse="request"]').click();
  const summary = page.locator('.lx-view-shell-history').first();
  assert.match(await summary.locator('.lx-stability-list').evaluate(node => node.closest('fieldset').previousElementSibling.querySelector('legend').textContent), /Parâmetros de Desligamento/);
  const cipa = stabilityRecord(summary, 'CIPA');
  assert.equal(await cipa.locator('[data-label="Registro informado"] strong').innerText(), 'Sim');
  assert.match(await cipa.innerText(), /01\/11\/2025/);
  assert.match(await cipa.innerText(), /Suplente/);
  await review(page, 'diretoria');
  await radio(page, 'estabilidade', 'Sim');
  await page.locator('[data-field="motivoEstabilidade"]').fill('CIPA e afastamento: informações avaliadas pelo RH.');
  await radio(page, 'prosseguir', 'Sim'); await review(page, 'rh');
  const toggle = page.locator('[data-collapse^="approval-"]').filter({ hasText: 'Aprovação do RH' });
  await toggle.click();
  const record = toggle.locator('xpath=ancestor::section[1]');
  assert.match(await record.innerText(), /Informações de Estabilidade/);
  assert.match(await record.innerText(), /Afastamento por motivo de saúde/);
  assert.match(await stabilityRecord(record, 'Afastamento').innerText(), /Retorno previsto\s*03\/11\/2026/);
  assert.equal((await state(page)).history.find(row => row.area === 'rh').snapshot.rmStability[1].informado, 'Sim');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}));

test('todas as telas mostram seus predecessores e exemplos de histórico sem avançar o processo', { skip }, async () => session(async page => {
  const approvals = ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH'];
  const technical = approvals.concat('Análise do SESMT', 'Análise da TI');
  const cases = [
    ['solicitacao', []],
    ['diretoria', approvals.slice(0, 1)],
    ['rh', approvals.slice(0, 2)],
    ['paralelo', approvals],
    ['sesmt', approvals],
    ['ti', approvals],
    ['documento', technical],
    ['assinaturas', technical.concat('Documento de Desligamento')],
    ['validacao_assinaturas', technical.concat('Documento de Desligamento', 'Encaminhar para Assinatura')],
    ['dp', technical.concat('Documento de Desligamento', 'Encaminhar para Assinatura', 'Validar Assinaturas')],
    ['finalizada', technical.concat('Documento de Desligamento', 'Encaminhar para Assinatura', 'Validar Assinaturas', 'DP — Checklist da Rescisão')]
  ];
  for (const [stage, expected] of cases) {
    await load(page, stage);
    assert.deepEqual(await historyTitles(page), expected, 'Histórico da tela ' + stage);
    const saved = await state(page);
    assert.equal(saved.current, 'solicitacao');
    assert.equal(saved.history.length, 0);
    assert.equal(Object.keys(saved.checks).length, 44);
    assert.ok(Object.values(saved.checks).every(item => item.status === 'conferido'));
    assert.equal(saved.document, null);
    assert.equal(saved.form.assinaturaColaborador, '');
    assert.equal(saved.form.estabilidade, undefined);
  }
  await load(page, 'sesmt');
  await page.getByRole('button', { name: 'Aprovação do RH', exact: true }).click();
  assert.equal(await page.locator('.lx-history-fieldset-teal .lx-readonly-item-pode-prosseguir strong').innerText(), 'Sim');
  assert.equal(await page.getByRole('button', { name: 'Análise da TI', exact: true }).count(), 0, 'A atividade paralela pendente não aparece como etapa anterior concluída');

  await load(page, 'dp');
  const toggle = page.getByRole('button', { name: 'Validar Assinaturas', exact: true });
  await toggle.click();
  const record = toggle.locator('xpath=ancestor::section[1]');
  await record.getByRole('button', { name: 'Visualizar anexo', exact: true }).click();
  assert.equal(await page.locator('#modalTitle').innerText(), 'documento-de-desligamento-assinado.pdf');
  assert.equal(await page.locator('#modalIcon .fa-eye').count(), 1);
  await confirm(page);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}));

test('histórico do SESMT preserva itens, parecer e arquivo após correção e remoção do anexo atual', { skip }, async () => session(async page => {
  await untilParallel(page, true);
  await radio(page, 'exame', 'Não');
  for (const row of await page.locator('[data-item="epiItems"][data-prop="devolver"]').all()) await row.selectOption('Sim');
  await page.locator('[data-item="epiItems"][data-prop="parecer"]').first().fill('Conferência original do capacete.');
  await page.locator('[data-action="delete-file"][data-group="termoEpi"]').click(); await confirm(page);
  await upload(page, 'termoEpi');
  await review(page, 'sesmt', 'approve', 'EPIs avaliados pelo SESMT.');
  const original = (await state(page)).history.find(row => row.area === 'sesmt' && row.action === 'Análise concluída');
  const description = original.snapshot.epiItems[0].descricao;
  await review(page, 'ti', 'return', 'Complementar informações para a TI.');
  await page.locator('[data-item="epiItems"][data-prop="descricao"]').first().fill('Descrição alterada na correção.');
  await page.locator('[data-field="changes"]').fill('Descrição do EPI complementada pelo solicitante.');
  await click(page, 'correct'); await confirm(page);
  await click(page, 'resume'); await confirm(page);
  await load(page, 'sesmt');
  await page.locator('[data-action="delete-file"][data-group="termoEpi"]').click(); await confirm(page);
  assert.equal((await state(page)).files.termoEpi.length, 0);

  const toggle = page.getByRole('button', { name: 'Análise do SESMT', exact: true });
  await toggle.click();
  const record = toggle.locator('xpath=ancestor::section[1]');
  assert.match(await record.innerText(), /EPIs avaliados pelo SESMT/);
  assert.match(await record.innerText(), /Conferência original do capacete/);
  assert.ok((await record.innerText()).includes(description));
  assert.doesNotMatch(await record.innerText(), /Descrição alterada na correção/);
  assert.equal(await record.locator('input, textarea, select').count(), 0, 'Registro anterior somente leitura');
  await record.getByRole('button', { name: 'Visualizar anexo', exact: true }).click();
  await page.locator('.lx-file-image').waitFor();
  assert.equal(await page.locator('#modalTitle').innerText(), 'evidencia.png');
  await confirm(page);
  const preserved = (await state(page)).history.find(row => row.area === 'sesmt' && row.action === 'Análise concluída');
  assert.equal(preserved.files.termoEpi[0].id, original.files.termoEpi[0].id);
  assert.equal(preserved.snapshot.epiItems[0].descricao, description);
}));

test('análises abrem preenchidas, com observações em textarea e PDFs fixos disponíveis', { skip }, async () => session(async page => {
  for (const [area, scope, groups] of [['sesmt', 'epiItems', ['guia', 'termoEpi']], ['ti', 'infraItems', ['termoInfra']]]) {
    await load(page, area);
    const observations = page.locator('textarea[data-item="' + scope + '"][data-prop="parecer"]');
    assert.equal(await observations.count(), area === 'sesmt' ? 3 : 2);
    for (const field of await observations.all()) assert.ok((await field.inputValue()).trim());
    for (const select of await page.locator('select[data-item="' + scope + '"][data-prop="devolver"]').all()) assert.equal(await select.inputValue(), 'Sim');
    assert.ok((await page.locator('[data-note="' + area + '"]').inputValue()).trim());
    for (const group of groups) {
      const file = (await state(page)).files[group][0];
      assert.ok(file.url.endsWith('.pdf'));
      const component = page.locator('[data-file-group="' + group + '"]');
      assert.equal(await component.locator('.lx-attachment-row').count(), 1);
      await component.getByRole('button', { name: 'Visualizar anexo', exact: true }).click();
      assert.equal(await page.locator('#modalTitle').innerText(), file.name);
      assert.equal(await page.locator('#modalIcon .fa-eye').count(), 1);
      await confirm(page);
      const download = page.waitForEvent('download');
      await component.getByRole('button', { name: 'Baixar anexo', exact: true }).click(); await confirm(page);
      const downloaded = await download;
      assert.equal(downloaded.suggestedFilename(), file.name);
      assert.equal(fs.readFileSync(await downloaded.path()).subarray(0, 4).toString(), '%PDF');
    }
    const edited = 'Conferência editada pela área.\nRegistrar a devolução do item.';
    await observations.first().fill(edited); await page.reload();
    assert.equal(await observations.first().inputValue(), edited);
    assert.equal((await state(page)).decisions[area].completed || false, false);
  }

  // Atualiza um estado de versão anterior sem alterar os pareceres ou registros já preservados.
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key));
    delete saved.reviewDemoVersion;
    saved.form.exame = 'Não';
    saved.form.epiItems[1].parecer = '';
    saved.decisions.ti.completed = true;
    saved.decisions.ti.note = 'Parecer já registrado pela TI.';
    saved.history.push({ area: 'ti', action: 'Análise concluída', revision: 1, date: saved.created, responsible: 'Patrícia Almeida', note: saved.decisions.ti.note, snapshot: JSON.parse(JSON.stringify(saved.form)), files: JSON.parse(JSON.stringify(saved.files)) });
    saved.files.termoInfra = [];
    localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  const oldSnapshot = (await state(page)).history.at(-1).snapshot;
  await page.reload();
  const migrated = await state(page);
  assert.equal(migrated.form.exame, 'Não');
  assert.ok(migrated.form.epiItems[1].parecer.trim());
  assert.equal(migrated.decisions.ti.note, 'Parecer já registrado pela TI.');
  assert.equal(migrated.files.termoInfra[0].name, 'termo-de-infraestrutura.pdf');
  assert.deepEqual(migrated.history.at(-1).snapshot, oldSnapshot);
}));

test('apresentação da espera mantém histórico até o RH e cartões navegáveis Pendente / Aprovado', { skip }, async () => session(async page => {
  await page.goto(origin + '/desligamento_pessoal/index.html');
  assert.equal(await page.locator('#stageNav .lx-stage-card').count(), 11);
  assert.equal(await page.locator('#stageNav a[href="espera_paralelo.html"], #stageNav a[href="etapa.html?etapa=paralelo"], #stageNav a[href="etapa.html?etapa=documento"]').count(), 0);
  assert.equal(await page.locator('#stageNav a[href="etapa.html?etapa=assinaturas"]').count(), 1);
  assert.equal(await page.locator('#stageNav a[href="etapa.html?etapa=assinaturas"] h3').innerText(), 'Encaminhar para Assinatura');
  await page.goto(origin + '/desligamento_pessoal/espera_paralelo.html');
  await page.getByRole('heading', { name: parallelTitle, exact: true }).waitFor();
  const history = ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH'];
  assert.deepEqual(await historyTitles(page), history);
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Pendente', 'Pendente']);
  assert.equal((await state(page)).history.length, 0);
  assert.equal(await page.locator('[data-action="continue-parallel"]').isDisabled(), true);

  await page.locator('.lx-parallel-card[href="etapa.html?etapa=sesmt"]').click();
  await page.locator('textarea[data-item="epiItems"][data-prop="parecer"]').first().waitFor();
  await click(page, 'decide'); await confirm(page);
  assert.equal(stageOf(page), 'paralelo');
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Aprovado', 'Pendente']);
  assert.deepEqual(await historyTitles(page), history);
  assert.equal(await page.locator('[data-action="continue-parallel"]').isDisabled(), true);

  await page.locator('.lx-parallel-card[href="etapa.html?etapa=sesmt"]').click();
  assert.equal(await page.locator('textarea[data-item="epiItems"][data-prop="parecer"]').first().isDisabled(), true);
  await page.goBack();
  await page.getByRole('heading', { name: parallelTitle, exact: true }).waitFor();
  await page.locator('.lx-parallel-card[href="etapa.html?etapa=ti"]').click();
  await page.locator('textarea[data-item="infraItems"][data-prop="parecer"]').first().waitFor();
  assert.deepEqual(await historyTitles(page), history.concat('Análise do SESMT'), 'As aprovações anteriores vêm antes do retorno da área paralela');
  await click(page, 'decide'); await confirm(page);
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Aprovado', 'Aprovado']);
  assert.deepEqual(await historyTitles(page), history);
  assert.equal((await state(page)).current, 'paralelo');
  assert.equal(await page.locator('[data-action="continue-parallel"]').isEnabled(), true);
  await page.reload();
  assert.equal(stageOf(page), 'paralelo');
  assert.deepEqual(await historyTitles(page), history);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await click(page, 'continue-parallel');
  assert.equal((await state(page)).current, 'documento');
}));

test('apresentação aberta por arquivo preserva o estado ao acessar análises e retornar à espera', { skip }, async () => session(async page => {
  await page.goto(pathToFileURL(path.join(root, 'desligamento_pessoal/espera_paralelo.html')).href);
  await page.getByRole('heading', { name: parallelTitle, exact: true }).waitFor();
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Pendente', 'Pendente']);
  await review(page, 'sesmt');
  assert.equal(stageOf(page), 'paralelo');
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Aprovado', 'Pendente']);
  await page.reload();
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Aprovado', 'Pendente']);
  await review(page, 'ti');
  assert.deepEqual(await page.locator('.lx-parallel-card span').allTextContents(), ['Aprovado', 'Aprovado']);
  await click(page, 'continue-parallel');
  assert.equal((await state(page)).current, 'documento');
  assert.equal(page.url().startsWith('file:'), true);
}));

test('histórico omite a espera e mantém as duas observações em uma linha própria', { skip }, async () => session(async page => {
  await load(page, 'documento');
  const titles = await historyTitles(page);
  assert.equal(titles.includes(parallelTitle), false);
  for (const title of ['Análise do SESMT', 'Análise da TI']) {
    const toggle = page.getByRole('button', { name: title, exact: true });
    await toggle.click();
    const record = toggle.locator('xpath=ancestor::section[1]');
    const rows = record.locator('.lx-review-item-history-grid');
    for (const row of await rows.all()) {
      const boxes = await row.locator('.lx-history-stage-item').evaluateAll(nodes => nodes.map(node => {
        const r = node.getBoundingClientRect(); return { top:r.top, left:r.left, width:r.width };
      }));
      assert.equal(boxes.length, 5);
      assert.equal(boxes[0].top, boxes[1].top); assert.equal(boxes[1].top, boxes[2].top);
      assert.ok(boxes[3].top > boxes[0].top);
      assert.equal(boxes[3].top, boxes[4].top);
      assert.ok(Math.abs(boxes[3].width - boxes[4].width) < 0.1);
      assert.ok(boxes[4].left > boxes[3].left);
    }
  }
  await page.screenshot({ path:'/tmp/desligamento-historico-observacoes.png', fullPage:true });
  await page.setViewportSize({ width:390, height:844 });
  for (const row of await page.locator('.lx-review-item-history-grid:visible').all()) {
    const item = await row.locator('.lx-readonly-item-observacao-do-item').boundingBox();
    const analysis = await row.locator('.lx-readonly-item-observacao-da-analise').boundingBox();
    assert.equal(item.x, analysis.x); assert.ok(analysis.y > item.y);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}));

test('documento de desligamento usa o mesmo PDF anexado na atividade e no histórico, sem upload', { skip }, async () => session(async page => {
  await load(page, 'documento');
  const current = page.locator('[data-file-group="documento"]:visible');
  assert.equal(await current.locator('.lx-attachment-row').count(), 1);
  assert.equal(await current.locator('[data-upload], [data-drop], [data-action="delete-file"]').count(), 0);
  assert.equal(await page.locator('.lx-document, [data-action="generate"]').count(), 0);
  assert.equal(await page.locator('[data-action="send-signatures"]').isEnabled(), true);
  const name = await current.locator('.lx-attachment-info strong').innerText();
  await current.getByRole('button', { name:'Visualizar anexo', exact:true }).click();
  assert.equal(await page.locator('#modalTitle').innerText(), name);
  const source = await page.locator('#modalMessage iframe').getAttribute('src');
  await confirm(page);
  const downloaded = page.waitForEvent('download');
  await current.getByRole('button', { name:'Baixar anexo', exact:true }).click(); await confirm(page);
  const file = await downloaded;
  assert.equal(fs.readFileSync(await file.path()).subarray(0,4).toString(), '%PDF');
  await click(page, 'send-signatures');
  const toggle = page.getByRole('button', { name:'Documento de Desligamento', exact:true });
  await toggle.click();
  const historical = toggle.locator('xpath=ancestor::section[1]').locator('[data-file-group="documento"]');
  assert.equal(await historical.locator('.lx-attachment-info strong').innerText(), name);
  assert.equal(await historical.locator('[data-upload], [data-drop], [data-action="delete-file"]').count(), 0);
  await historical.getByRole('button', { name:'Visualizar anexo', exact:true }).click();
  assert.equal(await page.locator('#modalMessage iframe').getAttribute('src'), source);
  await confirm(page);
}));

test('encaminhamento eletrônico dispensa upload e presencial exige documento assinado, sem validação digital', { skip }, async () => session(async page => {
  await load(page, 'assinaturas');
  const current = page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  assert.match(await current.locator('.lx-fieldset legend').first().innerText(), /Modalidade de Assinatura/);
  assert.equal(await page.locator('[data-action="finish-signatures"]').isEnabled(), true);
  assert.equal(await page.locator('[data-upload], [data-file-group="paraAssinatura"]').count(), 0);
  assert.equal(await page.locator('[data-upload="assinado"]').count(), 0);
  assert.equal(await current.locator('.lx-alert').innerText(), 'O documento será gerado automaticamente e enviado à plataforma digital.');
  assert.doesNotMatch(await current.innerText(), /Simular assinatura|Os registros abaixo|Não há envio|mecanismo de assinatura/);
  const options = await page.locator('.lx-field-name-modalidade .lx-radio-option').evaluateAll(nodes => nodes.map(node => {
    const r=node.getBoundingClientRect(); return { left:r.left,right:r.right,top:r.top };
  }));
  assert.equal(options[1].left-options[0].right, 28); assert.equal(options[0].top, options[1].top);

  assert.equal(await current.locator('.lx-fieldset').count(),1);
  assert.equal(await page.locator('.lx-signature-card, [data-sign]').count(),0);
  assert.equal(await current.locator('legend').filter({hasText:'Assinatura Eletrônica'}).count(),0);
  await click(page,'finish-signatures'); await page.locator('#modalCancel').click();
  assert.equal((await state(page)).current,'solicitacao');
  assert.equal((await state(page)).electronicSigning, null, 'Cancelar o envio não gera uma solicitação de assinatura');

  // Um estado anterior já salvo também permite apresentar a tela de assinaturas.
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key)); saved.current = 'paralelo'; localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  await page.reload();
  assert.equal(await page.locator('[data-action="finish-signatures"]').isEnabled(), true);
  await radio(page,'modalidade','Presencial');
  assert.equal(await page.locator('[data-upload="paraAssinatura"], [data-sign]').count(),0);
  assert.equal(await current.locator('.lx-fieldset').count(),2);
  assert.equal(await page.locator('[data-file-group="assinado"]:visible .lx-attachment-row').count(),1);
  await page.locator('[data-action="delete-file"][data-group="assinado"]').click(); await confirm(page);
  await click(page,'finish-signatures');
  assert.match(await validationText(page),/Anexe o documento assinado/);
  assert.equal(await page.locator('[data-file-group="assinado"].lx-error').count(),1);
  await upload(page,'assinado'); await page.reload();
  await click(page,'finish-signatures'); await page.locator('#modalCancel').click();
  assert.equal((await state(page)).current,'paralelo');
  await click(page,'finish-signatures'); await confirm(page);
  assert.equal((await state(page)).current,'dp');
  assert.equal((await state(page)).electronicSigning,null);
  assert.equal((await historyTitles(page)).includes('Validar Assinaturas'),false);
  const snapshot=(await state(page)).history.find(record=>record.action==='Documento assinado conferido').snapshot;
  assert.equal(snapshot.modalidade,'Presencial');
  assert.equal(snapshot.assinaturaColaborador,'');
}));

test('validar assinaturas apresenta o retorno digital e abre sempre com o cenário eletrônico ativo', { skip }, async () => session(async page => {
  await load(page, 'validacao_assinaturas');
  const current = page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  assert.equal(await page.locator('[data-upload], [data-sign]').count(), 0);
  assert.match(await current.innerText(), /DESL-000731-R1/);
  assert.match(await current.innerText(), /1 de 2 assinaturas recebidas/);
  assert.equal(await current.locator('[data-document-signing-status]').innerText(), 'Parcialmente assinado');
  assert.equal(await current.locator('.lx-readonly-item-assinado-por strong').innerText(), 'Carlos Pereira');
  assert.equal(await current.locator('.lx-readonly-item-aguardando-assinatura-de strong').innerText(), 'Eduardo Martins');
  const collaborator = current.locator('[data-signer="Colaborador"]');
  const manager = current.locator('[data-signer="Gestor"]');
  assert.equal(await collaborator.locator('.lx-signing-status').innerText(), 'Assinado');
  assert.equal(await collaborator.locator('.lx-readonly-item-assinou-o-documento strong').innerText(), 'Sim');
  assert.match(await collaborator.locator('.lx-readonly-item-data-da-assinatura strong').innerText(), /\d{2}\/\d{2}\/\d{4}/);
  assert.equal(await manager.locator('.lx-signing-status').innerText(), 'Pendente');
  assert.equal(await manager.locator('.lx-readonly-item-assinou-o-documento strong').innerText(), 'Não');
  assert.equal(await manager.locator('.lx-readonly-item-data-da-assinatura strong').innerText(), 'Aguardando assinatura');
  assert.equal(await current.locator('.lx-readonly-item-documento strong').innerText(), 'documento-de-desligamento.pdf');
  await current.screenshot({ path: '/tmp/desligamento-acompanhamento-assinaturas.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await current.screenshot({ path: '/tmp/desligamento-acompanhamento-assinaturas-mobile.png' });
  await page.setViewportSize({ width: 1280, height: 720 });
  assert.equal((await state(page)).electronicSigning, null, 'A apresentação direta não registra um envio nem uma conclusão');
  await click(page, 'validate-signatures');
  assert.match(await validationText(page), /Aguarde a assinatura/);
  await receiveSignatures(page);
  assert.equal((await state(page)).current, 'solicitacao');
  assert.equal((await state(page)).electronicSigning.validatedAt, '');
  assert.match(await current.innerText(), /2 de 2 assinaturas recebidas/);
  assert.equal(await current.locator('[data-document-signing-status]').innerText(), 'Assinado');
  assert.equal(await current.locator('.lx-readonly-item-assinado-por strong').innerText(), 'Carlos Pereira, Eduardo Martins');
  assert.equal(await current.locator('.lx-readonly-item-aguardando-assinatura-de strong').innerText(), 'Nenhuma assinatura pendente');
  assert.equal(await manager.locator('.lx-readonly-item-assinou-o-documento strong').innerText(), 'Sim');
  assert.equal(await current.locator('[data-file-group="assinado"] .lx-attachment-row').count(), 1);
  await page.reload();
  assert.match(await current.innerText(), /2 de 2 assinaturas recebidas/);
  assert.equal(await current.locator('[data-upload]').count(), 0);
  await page.screenshot({ path: '/tmp/desligamento-validar-assinaturas.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: '/tmp/desligamento-validar-assinaturas-mobile.png', fullPage: true });
  await click(page, 'validate-signatures'); await page.locator('#modalCancel').click();
  assert.equal((await state(page)).current, 'solicitacao');
  await click(page, 'validate-signatures'); await confirm(page);
  assert.equal((await state(page)).current, 'dp');
  await page.getByRole('button', { name: 'Validar Assinaturas', exact: true }).click();
  const historical = page.locator('.lx-view-shell-history').filter({ has: page.getByRole('button', { name: 'Validar Assinaturas', exact: true }) });
  assert.equal(await historical.locator('[data-action="refresh-signatures"], [data-action="validate-signatures"], [data-upload]').count(), 0);
  assert.match(await historical.innerText(), /Assinaturas validadas/);
  assert.equal(await historical.locator('[data-document-signing-status]').innerText(), 'Assinado');
  assert.equal(await historical.locator('.lx-readonly-item-assinado-por strong').innerText(), 'Carlos Pereira, Eduardo Martins');

  const recordedHistory = (await state(page)).history;
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key)); saved.form.modalidade = 'Presencial'; saved.current = 'dp'; delete saved.signatureDemoVersion; localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  await load(page, 'validacao_assinaturas');
  assert.equal((await state(page)).form.modalidade, 'Eletrônica');
  assert.equal((await state(page)).current, 'dp', 'Abrir o cenário eletrônico não movimenta o processo');
  assert.equal(await current.locator('[data-signature-tracking]').count(), 1);
  assert.equal(await current.locator('[data-document-signing-status]').innerText(), 'Parcialmente assinado');
  assert.deepEqual((await state(page)).electronicSigning.signers.map(signer => signer.status), ['Assinado', 'Pendente']);
  assert.deepEqual((await state(page)).history, recordedHistory, 'O ajuste do exemplo mantém os registros anteriores preservados');
  assert.equal(await page.getByRole('button', { name: 'Atualizar status das assinaturas', exact: true }).count(), 0);
  assert.equal(await current.locator('[data-action="validate-signatures"]').isEnabled(), true);
  assert.doesNotMatch(await current.innerText(), /O documento foi assinado presencialmente/);
  await click(page, 'validate-signatures');
  assert.match(await validationText(page), /Aguarde a assinatura/);
  await receiveSignatures(page);
  assert.equal(await current.locator('[data-document-signing-status]').innerText(), 'Assinado');
  await page.reload();
  assert.equal((await state(page)).form.modalidade, 'Eletrônica');
  assert.equal(await current.locator('[data-document-signing-status]').innerText(), 'Assinado');
}));

test('arquivo avulso, assinatura pendente ou de outra revisão não liberam a validação digital nem a conclusão do DP', { skip }, async () => session(async page => {
  await load(page, 'assinaturas');
  await click(page, 'finish-signatures'); await confirm(page);
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key));
    saved.files.assinado = [Object.assign({}, saved.files.paraAssinatura[0], { id: 'arquivo-avulso', name: 'arquivo-avulso.pdf' })];
    localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  await page.reload(); // Um arquivo isolado não comprova o retorno das assinaturas.
  await click(page, 'validate-signatures');
  assert.match(await validationText(page), /Aguarde a assinatura/);
  await receiveSignatures(page);
  const completed = await state(page);
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key)); saved.electronicSigning.revision = saved.revision - 1; localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  await page.reload();
  await click(page, 'validate-signatures');
  assert.match(await validationText(page), /Aguarde a assinatura/);
  await page.evaluate(({ key, completed }) => {
    completed.current = 'dp'; localStorage.setItem(key, JSON.stringify(completed));
  }, { key: storageKey, completed });
  await load(page, 'dp');
  await click(page, 'finish');
  assert.match(await validationText(page), /devem ser validados/);
  assert.equal((await state(page)).current, 'dp');
}));

test('correção aberta diretamente traz devolução do RH, formulário completo e resumo original preservado', { skip }, async () => session(async page => {
  await load(page, 'solicitacao');
  const original = (await state(page)).form;
  await load(page, 'correcao');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  assert.equal(await page.locator('#statusLabel').innerText(), 'Em correção');
  const form = page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  assert.equal(await form.locator('[data-action="correct"]').isEnabled(), true);
  for (const key of ['tipo', 'employee', 'prevista', 'justificativa', 'infraObs', 'epiObs']) assert.equal(await form.locator('[data-field="' + key + '"]').inputValue(), original[key]);
  for (const scope of ['infraItems', 'epiItems']) {
    const values = await form.locator('[data-item="' + scope + '"]').evaluateAll(nodes => nodes.map(node => node.value));
    assert.ok(values.length && values.every(Boolean), 'Equipamentos e EPIs preenchidos');
  }
  assert.equal(await form.locator('[data-file-group="solicitacao"] .lx-attachment-row').count(), 3);
  assert.ok(await form.locator('[data-field="changes"]').inputValue());
  const rh = page.getByRole('button', { name: 'Aprovação do RH', exact: true });
  await rh.click();
  const record = rh.locator('xpath=ancestor::section[1]');
  assert.equal(await record.locator('.lx-readonly-item-decisao strong').innerText(), 'Solicitação devolvida para correção');
  assert.equal(await record.locator('.lx-history-fieldset-orange').count(), 2);
  assert.equal((await state(page)).history.length, 0, 'Consultar o exemplo não registra a devolução');
  await form.locator('[data-action="delete-file"][data-group="solicitacao"]').first().click(); await confirm(page);
  await form.locator('[data-field="justificativa"]').fill('Justificativa ajustada no formulário de correção.');
  await form.locator('[data-field="prevista"]').fill('2026-11-05');
  await page.reload();
  assert.equal(await form.locator('[data-field="justificativa"]').inputValue(), 'Justificativa ajustada no formulário de correção.');
  await page.locator('[data-collapse="request"]').click();
  const summary = page.locator('.lx-view-shell-history').first();
  assert.equal(await summary.locator('.lx-history-text').innerText(), original.justificativa);
  assert.equal(await summary.locator('[data-file-group="solicitacao"] .lx-attachment-row').count(), 3);
  assert.equal(await form.locator('[data-file-group="solicitacao"] .lx-attachment-row').count(), 2);
  assert.equal(await summary.locator('input, textarea, select').count(), 0);
  await click(page, 'correct'); await page.locator('#modalCancel').click();
  assert.equal((await state(page)).current, 'solicitacao'); assert.equal((await state(page)).revision, 1);
  await click(page, 'correct'); await confirm(page);
  assert.equal((await state(page)).current, 'retomada');
  assert.equal((await state(page)).correction.origin, 'rh');
  assert.equal((await state(page)).correction.before.justificativa, original.justificativa);
  assert.equal((await state(page)).history.find(row => row.action === 'Devolução para correção').files.solicitacao.length, 3);
  assert.equal((await state(page)).history.find(row => row.action === 'Devolução para correção').snapshot.justificativa, original.justificativa);
  await click(page, 'resume'); await confirm(page);
  assert.equal((await state(page)).current, 'rh');
  assert.equal((await state(page)).form.prevista, '2026-11-05');
}));

test('reprovação de exemplo termina no RH e usa o cartão vermelho dos protótipos de referência', { skip }, async () => session(async page => {
  await load(page, 'reprovada');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento', 'Aprovação da Diretoria', 'Aprovação do RH']);
  const card = page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  assert.equal(await card.locator('.lx-pill').innerText(), 'Reprovado');
  assert.match(await card.locator('.lx-history-stage-red').innerText(), /após decisão do RH/);
  assert.equal(await card.locator('fieldset, input, textarea, .lx-upload').count(), 0);
  await page.getByRole('button', { name:'Aprovação do RH', exact:true }).click();
  const rh = page.getByRole('button', { name:'Aprovação do RH', exact:true }).locator('xpath=ancestor::section[1]');
  assert.equal(await rh.locator('.lx-readonly-item-decisao strong').innerText(), 'Solicitação reprovada');
  assert.equal(await rh.locator('.lx-readonly-item-pode-prosseguir strong').innerText(), 'Não');
  assert.equal((await state(page)).current, 'solicitacao'); assert.equal((await state(page)).history.length, 0);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}));

test('reprovação efetiva na Diretoria preserva o limite do histórico e seu responsável', { skip }, async () => session(async page => {
  await request(page);
  await review(page,'diretoria','reject','Desligamento fora do planejamento da área.');
  assert.deepEqual(await historyTitles(page), ['Dados de Desligamento','Aprovação da Diretoria']);
  assert.equal(await page.getByRole('button',{name:'Aprovação do RH',exact:true}).count(),0);
  await page.getByRole('button',{name:'Aprovação da Diretoria',exact:true}).click();
  const record=page.getByRole('button',{name:'Aprovação da Diretoria',exact:true}).locator('xpath=ancestor::section[1]');
  assert.equal(await record.locator('.lx-readonly-item-responsavel strong').innerText(),'Roberto Siqueira');
  assert.equal(await record.locator('.lx-readonly-item-observacao strong').innerText(),'Desligamento fora do planejamento da área.');
  assert.match(await page.locator('.lx-view-shell:not(.lx-view-shell-history) .lx-history-stage-red').innerText(),/da Diretoria/);
}));

test('DP abre preenchido com 44 checks, preserva edições e conclui no cartão verde sem duplicar o checklist', { skip }, async () => session(async page => {
  await page.clock.setFixedTime(new Date('2026-10-19T12:00:00.000Z'));
  await load(page,'dp');
  const form=page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  const empty=await form.locator('input[data-field]:not([type="radio"]), textarea[data-field], [data-check-note]').evaluateAll(nodes=>nodes.filter(node=>!node.value.trim()).map(node=>node.dataset.field || node.dataset.checkNote));
  assert.deepEqual(empty,[]);
  assert.equal(await form.locator('[data-check]:checked').count(),44);
  assert.equal(await form.locator('textarea[data-check-note]').count(),44);
  assert.deepEqual(await form.locator('[data-check-date]').allTextContents(),Array(44).fill('16/10/2026'));
  assert.equal(await form.locator('input[data-check-note], [data-field="rmEfetivado"], [data-field="rmObs"], .lx-readonly-item-responsavel, .lx-readonly-item-data-da-conclusao').count(),0);
  assert.doesNotMatch(await form.innerText(), /Efetivação Manual no TOTVS RM|Registrada ao concluir a atividade/);
  for (const width of [1280,390]) {
    await page.setViewportSize({width,height:844});
    const options=await form.locator('.lx-check-options').first().locator('label').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,height:r.height};}));
    assert.equal(options[0].x,options[1].x); assert.ok(options[1].y>=options[0].y+options[0].height);
    const datePosition=await form.locator('.lx-check-marked-date').first().boundingBox();
    assert.equal(datePosition.x,options[0].x);
    assert.ok(datePosition.y>=options[1].y+options[1].height,'A data fica abaixo das opções');
    assert.equal(await form.locator('.lx-check-options time').count(),0);
    const conclusionOptions=await form.locator('.lx-field-name-checklistConcluido .lx-radio-option').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top};}));
    assert.equal(conclusionOptions[1].left-conclusionOptions[0].right,28);
    assert.equal(conclusionOptions[0].top,conclusionOptions[1].top);
    await form.locator('.lx-check-row-editor').first().screenshot({path:'/tmp/desligamento-check-date-'+width+'.png'});
  }
  await page.setViewportSize({width:1280,height:844});
  const observation='Plano de saúde conferido.\nConferência complementar realizada pelo DP.';
  await form.locator('[data-check-note="proventos-0"]').fill(observation);
  assert.equal(await form.locator('[data-check-date="proventos-0"]').innerText(),'16/10/2026','Editar a observação preserva a data de marcação');
  assert.equal(await page.locator('#checkCount').innerText(),'44');
  assert.equal(await form.locator('[data-action="finish"]').isEnabled(),true);
  await form.locator('[data-check="proventos-0"]').uncheck();
  assert.equal(await form.locator('[data-check-date="proventos-0"]').count(),0,'Item desmarcado não apresenta data de marcação');
  assert.equal((await state(page)).checks['proventos-0'].date,'19/10/2026');
  await form.locator('[data-field="cpf"]').fill('987.654.321-00');
  await page.reload();
  assert.equal(await form.locator('[data-check]:checked').count(),43);
  assert.equal(await form.locator('[data-field="cpf"]').inputValue(),'987.654.321-00');
  assert.equal(await form.locator('[data-check-note="proventos-0"]').inputValue(),observation);
  await click(page,'finish'); assert.match(await validationText(page),/1 item/);
  await page.clock.setFixedTime(new Date('2026-10-20T01:00:00.000Z'));
  await form.locator('[data-na="proventos-0"]').check();
  assert.equal(await form.locator('[data-check-date="proventos-0"]').innerText(),'19/10/2026','A data segue o fuso de São Paulo');
  assert.equal(await form.locator('[data-check-date="proventos-0"]').locator('..').locator('span').innerText(),'Data da marcação');
  await page.clock.setFixedTime(new Date('2026-10-20T03:15:00.000Z'));
  await form.locator('[data-check="proventos-0"]').check();
  assert.equal((await state(page)).checks['proventos-0'].date,'20/10/2026');
  assert.equal(await form.locator('[data-check-date="proventos-0"]').innerText(),'20/10/2026');
  assert.equal(await form.locator('[data-check-date="proventos-0"]').getAttribute('datetime'),'2026-10-20');
  await click(page,'finish'); await page.locator('#modalCancel').click();
  assert.equal((await state(page)).current,'solicitacao');
  await click(page,'finish'); await confirm(page);
  assert.equal((await state(page)).current,'finalizada');
  assert.equal(await page.locator('#statusLabel').innerText(),'Finalizado');
  const final=page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  assert.equal(await final.locator('h2').innerText(),'Desligamento Finalizado');
  assert.match(await final.locator('.lx-history-stage-green').innerText(),/Departamento Pessoal/);
  assert.equal(await final.locator('fieldset, .lx-check-progress, .lx-check-row, .lx-upload').count(),0);
  const toggle=page.getByRole('button',{name:'DP — Checklist da Rescisão',exact:true}); await toggle.click();
  const dp=toggle.locator('xpath=ancestor::section[1]');
  assert.equal(await dp.locator('.lx-check-row').count(),44);
  assert.equal(await dp.locator('.lx-readonly-item-cpf strong').innerText(),'987.654.321-00');
  assert.equal(await dp.locator('input, textarea, select').count(),0);
  assert.equal(await page.locator('.lx-signature-card').count(),0);
  assert.equal(await dp.locator('.lx-readonly-item-responsavel strong').innerText(),'Juliana Costa');
  const completed=(await state(page)).history.find(record=>record.action==='Checklist concluído e processo encerrado');
  assert.equal(await dp.locator('.lx-readonly-item-data-da-conclusao strong').innerText(),completed.date);
  assert.equal(await dp.locator('.lx-check-row').first().locator('span').last().innerText(),observation);
  assert.equal(await dp.locator('[data-check-date="proventos-0"]').innerText(),'20/10/2026');
  assert.doesNotMatch(await dp.innerText(),/Desligamento efetivado manualmente no RM|Observações da efetivação manual/);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await load(page,'dp');
  await page.clock.setFixedTime(new Date('2026-10-21T12:00:00.000Z'));
  await form.locator('[data-na="proventos-0"]').check();
  await form.locator('[data-check-note="proventos-0"]').fill('Observação editada após a conclusão.');
  assert.equal((await state(page)).checks['proventos-0'].status,'na');
  assert.equal(await form.locator('[data-check-date="proventos-0"]').innerText(),'21/10/2026');
  assert.deepEqual((await state(page)).history.find(record=>record.action==='Checklist concluído e processo encerrado'),completed,'Editar o checklist mantém o registro da conclusão preservado');
}));

test('checklists e conclusão do DP permanecem editáveis e persistem em qualquer etapa do processo', { skip }, async () => session(async page => {
  await load(page,'dp');
  const form=page.locator('.lx-view-shell:not(.lx-view-shell-history)');
  for (const current of ['solicitacao','diretoria','rh','paralelo','documento','assinaturas','validacao_assinaturas','dp','correcao','retomada','reprovada','finalizada']) {
    await page.evaluate(({key,current})=>{
      const saved=JSON.parse(localStorage.getItem(key));saved.current=current;localStorage.setItem(key,JSON.stringify(saved));
    },{key:storageKey,current});
    await page.reload();
    assert.equal(await form.locator('[data-check], [data-na], [data-check-note]').count(),132);
    assert.equal(await form.locator('[data-check]:disabled, [data-na]:disabled, [data-check-note]:disabled, [data-field="checklistConcluido"]:disabled, [data-field="finais"]:disabled').count(),0,'Campos habilitados durante '+current);
    await form.locator('[data-na="proventos-0"]').check();
    const note='Conferência editada durante '+current;
    await form.locator('[data-check-note="proventos-0"]').fill(note);
    await radio(page,'checklistConcluido','Não');
    await form.locator('[data-field="finais"]').fill(note);
    await page.reload();
    assert.equal(await form.locator('[data-na="proventos-0"]').isChecked(),true);
    assert.equal(await form.locator('[data-check-note="proventos-0"]').inputValue(),note);
    assert.equal((await state(page)).form.checklistConcluido,'Não');
    assert.equal((await state(page)).form.finais,note);
    await form.locator('[data-check="proventos-0"]').check();
    await radio(page,'checklistConcluido','Sim');
    assert.equal(await form.locator('[data-na="proventos-0"]').isChecked(),false);
    assert.equal((await state(page)).current,current,'A edição não movimenta o processo');
  }
}));

test('preenchimento do DP atualiza estados antigos e preserva os campos e checks já editados', { skip }, async () => session(async page => {
  await load(page,'solicitacao');
  await page.evaluate(key=>{
    const saved=JSON.parse(localStorage.getItem(key));delete saved.dpDemoVersion;
    saved.form.cpf='987.654.321-00';saved.form.pis='';
    saved.checks={'proventos-0':{status:'na',note:'Sem plano de saúde.',date:'15/10/2026 10:00'},'proventos-1':{status:'conferido',note:'Valor conferido.',date:'2026-10-14T10:00:00'},'proventos-2':{status:'conferido',note:'Conferência anterior.'},'documentos-0':{status:'',note:'Aguardando conferência.'}};
    localStorage.setItem(key,JSON.stringify(saved));
  },storageKey);
  await load(page,'dp');
  const saved=await state(page);
  assert.equal(saved.form.cpf,'987.654.321-00');assert.ok(saved.form.pis);
  assert.equal(Object.keys(saved.checks).length,44);
  assert.equal(saved.checks['proventos-0'].status,'na');
  assert.equal(saved.checks['proventos-0'].note,'Sem plano de saúde.');
  assert.equal(await page.locator('[data-check-date="proventos-0"]').innerText(),'15/10/2026');
  assert.equal(await page.locator('[data-check-date="proventos-1"]').innerText(),'14/10/2026');
  assert.equal(await page.locator('[data-check-date="proventos-2"]').innerText(),'16/10/2026');
  assert.equal(saved.checks['proventos-0'].date,'15/10/2026 10:00','A apresentação mantém a data original armazenada');
  assert.equal(saved.checks['proventos-2'].date,'16/10/2026');
  assert.equal(await page.locator('[data-check-date="documentos-0"]').count(),0);
  assert.equal(saved.checks['documentos-0'].status,'');
  assert.equal(saved.checks['documentos-0'].note,'Aguardando conferência.');
  assert.equal(await page.locator('[data-check]:checked').count(),42);
  assert.equal(saved.history.length,0);
}));

test('histórico completa parâmetros, equipamentos e EPIs de estados antigos sem alterar os registros preservados', { skip }, async () => session(async page => {
  await load(page,'solicitacao');
  await page.evaluate(key=>{
    const saved=JSON.parse(localStorage.getItem(key));
    saved.current='paralelo';saved.requestDemoVersion=2;
    saved.form.tipo='';saved.form.infraestrutura='';saved.form.epi='';
    saved.form.infraItems=[];saved.form.epiItems=[];saved.form.infraObs='';saved.form.epiObs='';
    saved.history=[{area:'solicitacao',action:'Correção registrada',revision:1,date:saved.created,responsible:'Eduardo Martins',note:'Dados revisados.',snapshot:JSON.parse(JSON.stringify(saved.form)),files:JSON.parse(JSON.stringify(saved.files))}];
    localStorage.setItem(key,JSON.stringify(saved));
  },storageKey);
  const preserved=(await state(page)).history;
  await load(page,'sesmt');
  await page.locator('[data-collapse="request"]').click();
  const summary=page.locator('.lx-view-shell-history').first();
  assert.equal(await summary.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),'Dispensa sem justa por iniciativa do empregado');
  assert.equal(await summary.locator('.lx-readonly-item-data-prevista-de-desligamento strong').innerText(),'30/10/2026');
  assert.equal(await summary.locator('.lx-read-table-origin .lx-read-row').count(),5);
  assert.match(await summary.innerText(),/Notebook \/ Computador/);
  assert.match(await summary.innerText(),/Monitor/);
  assert.match(await summary.innerText(),/Capacete de segurança/);
  assert.match(await summary.innerText(),/Óculos de proteção/);
  assert.match(await summary.innerText(),/Protetor auricular/);
  assert.match(await summary.innerText(),/Equipamentos informados pelo gestor/);
  assert.match(await summary.innerText(),/EPIs utilizados na rotina/);
  await page.getByRole('button',{name:'Correção da Solicitação',exact:true}).click();
  const correction=page.getByRole('button',{name:'Correção da Solicitação',exact:true}).locator('xpath=ancestor::section[1]');
  assert.equal(await correction.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),'Dispensa sem justa por iniciativa do empregado');
  assert.equal(await correction.locator('.lx-read-table-origin .lx-read-row').count(),5);
  assert.deepEqual((await state(page)).history,preserved,'Os registros salvos permanecem intactos');
  await page.reload();
  assert.equal((await state(page)).form.infraItems.length,2);
  assert.equal((await state(page)).form.epiItems.length,3);
}));

test('histórico da correção completa o exemplo original vazio e preserva os valores informados', { skip }, async () => session(async page => {
  await load(page,'solicitacao');
  await page.evaluate(key=>{
    const saved=JSON.parse(localStorage.getItem(key));
    saved.current='correcao';
    saved.correction={origin:'rh',note:'Complementar os dados.',date:saved.created,before:{employee:'000731',tipo:'',prevista:'2026-11-05',infraestrutura:'',infraItems:[],infraObs:'',epi:'',epiItems:[],epiObs:''}};
    localStorage.setItem(key,JSON.stringify(saved));
  },storageKey);
  const original=(await state(page)).correction.before;
  await load(page,'correcao');
  await page.locator('[data-collapse="request"]').click();
  const summary=page.locator('.lx-view-shell-history').first();
  assert.equal(await summary.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),'Dispensa sem justa por iniciativa do empregado');
  assert.equal(await summary.locator('.lx-readonly-item-data-prevista-de-desligamento strong').innerText(),'05/11/2026');
  assert.equal(await summary.locator('.lx-read-table-origin .lx-read-row').count(),5);
  assert.deepEqual((await state(page)).correction.before,original);
}));

test('reparo dos exemplos preserva parâmetros personalizados, itens editados e a opção Não', { skip }, async () => session(async page => {
  await load(page,'solicitacao');
  await page.evaluate(key=>{
    const saved=JSON.parse(localStorage.getItem(key));saved.requestDemoVersion=1;saved.current='paralelo';
    Object.assign(saved.form,{tipo:'Acordo entre as partes',prevista:'2026-11-12',justificativa:'Pedido apresentado pelo colaborador.',infraestrutura:'Sim',infraObs:'Veículo a conferir com a TI.',infraItems:[{tipo:'Veículo',quantidade:'2',descricao:'Veículos da equipe.',devolver:'Não',parecer:'Itens já devolvidos à área.'}],epi:'Não',epiItems:[],epiObs:'Atividade sem utilização de EPIs.'});
    localStorage.setItem(key,JSON.stringify(saved));
  },storageKey);
  const before=(await state(page)).form;
  await load(page,'ti');await page.locator('[data-collapse="request"]').click();
  const summary=page.locator('.lx-view-shell-history').first();
  assert.equal(await summary.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),'Acordo entre as partes');
  assert.equal(await summary.locator('.lx-readonly-item-data-prevista-de-desligamento strong').innerText(),'12/11/2026');
  assert.equal(await summary.locator('.lx-read-table-origin .lx-read-row').count(),1);
  assert.match(await summary.innerText(),/Veículos da equipe/);
  assert.equal(await summary.locator('.lx-readonly-item-utiliza-epis strong').innerText(),'Não');
  for(const key of ['tipo','prevista','justificativa','infraestrutura','infraItems','infraObs','epi','epiItems','epiObs']) assert.deepEqual((await state(page)).form[key],before[key]);
}));

test('recarregar um rascunho atual não repõe um parâmetro removido para validação', { skip }, async () => session(async page => {
  await load(page,'solicitacao');await page.locator('[data-key="tipo"] [data-clear-select]').click();
  await page.reload();assert.equal(await page.locator('[data-field="tipo"]').inputValue(),'');
  await click(page,'submit');assert.match(await validationText(page),/Campo obrigatório/);
  assert.equal((await state(page)).current,'solicitacao');
}));

test('catálogo de desligamento usa os novos tipos, Chapa e infraestrutura do colaborador', { skip }, async () => session(async page => {
  await load(page,'solicitacao');
  const employeeType='Dispensa sem justa por iniciativa do empregado';
  const employerType='Dispensa sem justa por iniciativa do empregador';
  const types=await page.locator('[data-key="tipo"] [data-select-option]').evaluateAll(nodes=>nodes.map(node=>node.dataset.selectOption));
  assert.deepEqual(types,[employeeType,employerType,'Dispensa por justa causa','Término de contrato','Acordo entre as partes']);
  assert.match(await page.locator('[data-field="rm_chapa"]').locator('xpath=..').innerText(),/Chapa/);
  assert.equal(await page.locator('[data-field="rm_filial"]').count(),0);
  assert.equal(await page.locator('[data-field="requesterBranch"]').count(),1);
  assert.equal(await page.locator('legend').filter({hasText:'Infraestrutura do colaborador'}).count(),1);
  assert.match(await page.locator('[data-field="infraObs"]').locator('xpath=..').innerText(),/Observações da infraestrutura/);
  await pick(page,'tipo',employerType);await page.reload();
  assert.equal((await state(page)).form.tipo,employerType);
  await click(page,'submit');await confirm(page);
  await page.locator('[data-collapse="request"]').click();
  const summary=page.locator('.lx-view-shell-history').first();
  const employee=summary.locator('fieldset').filter({has:page.locator('legend').filter({hasText:/^\s*Dados de Desligamento\s*$/})});
  assert.equal(await employee.locator('.lx-readonly-item-chapa strong').innerText(),'000731');
  assert.equal(await employee.locator('.lx-readonly-item-filial').count(),0);
  assert.equal(await summary.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),employerType);
  assert.equal(await summary.locator('legend').filter({hasText:'Infraestrutura do colaborador'}).count(),1);
  assert.match(await summary.innerText(),/Observações da infraestrutura/);
  assert.doesNotMatch(await summary.innerText(),/Matrícula|Infraestrutura da Origem|Equipamentos da Origem|Observações da Origem/);
}));

test('tipos antigos são apresentados com a nomenclatura atual e os registros anteriores permanecem preservados', { skip }, async () => session(async page => {
  for(const previousType of ['Dispensa sem justa causa','Pedido de demissão']) {
    await load(page,'solicitacao');
    await page.evaluate(({key,previousType})=>{
      const saved=JSON.parse(localStorage.getItem(key));saved.form.tipo=previousType;
      saved.history=[{area:'solicitacao',action:'Correção registrada',date:saved.created,responsible:'Eduardo Martins',revision:1,note:'Registro anterior.',snapshot:JSON.parse(JSON.stringify(saved.form)),files:JSON.parse(JSON.stringify(saved.files))}];
      localStorage.setItem(key,JSON.stringify(saved));
    },{key:storageKey,previousType});
    const preserved=(await state(page)).history;
    await load(page,'rh');await page.locator('[data-collapse="request"]').click();
    assert.equal((await state(page)).form.tipo,'Dispensa sem justa por iniciativa do empregado');
    const summary=page.locator('.lx-view-shell-history').first();
    assert.equal(await summary.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),'Dispensa sem justa por iniciativa do empregado');
    await page.getByRole('button',{name:'Correção da Solicitação',exact:true}).click();
    const record=page.getByRole('button',{name:'Correção da Solicitação',exact:true}).locator('xpath=ancestor::section[1]');
    assert.equal(await record.locator('.lx-readonly-item-tipo-de-desligamento strong').innerText(),'Dispensa sem justa por iniciativa do empregado');
    assert.deepEqual((await state(page)).history,preserved);
  }
}));

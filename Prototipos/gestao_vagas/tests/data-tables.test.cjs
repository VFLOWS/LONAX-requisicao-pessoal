const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const browser = [process.env.CHROME_BIN, '/usr/bin/brave-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(file => file && fs.existsSync(file));

test('DataTables com jQuery pagina, ordena datas, pesquisa perfis e preserva a seleção após atualizações', { skip: !browser && 'Defina CHROME_BIN para executar no navegador.' }, () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lonax-tables-'));
  try {
    const scripts = ['vendor/jquery.min.js', 'vendor/datatables.min.js', 'components.js', 'vendor/datatables-column-control.min.js', 'table-layout.js', 'table-column-filters.js', 'data-tables.js'];
    const styles = ['vendor/datatables.min.css', 'vendor/datatables-column-control.min.css', 'style.css', 'data-tables.css'];
    const html = `<!doctype html><meta charset="utf-8">
${styles.map(file => '<link rel="stylesheet" href="' + pathToFileURL(path.join(root, file)).href + '">').join('')}
<main class="sl-page" id="fixture"></main><pre id="result">PENDING</pre>
${scripts.map(file => '<script src="' + pathToFileURL(path.join(root, file)).href + '"></script>').join('')}
<script>
var rows = Array.from({length: 31}, function (_, i) {
  return ['<input type="checkbox" data-id="'+i+'">', 'Pessoa '+i,
    '<span data-profile="'+(i % 2 ? 'Executor' : 'Comunicador')+'">'+(i % 2 ? 'E' : 'C')+'</span>', i % 2 ? '05/08/2026' : '31/07/2026'];
});
fixture.innerHTML = SLComponents.table({id:'list', columns:['','Nome','Perfil','Abertura'], rows:rows}) +
  SLComponents.table({id:'compact', compact:true, columns:['Solicitação'], rows:[['5001']]});
document.addEventListener('DOMContentLoaded', async function () { try {
  function check(condition, message) { if (!condition) throw new Error(message); }
  check(jQuery.fn.jquery === '3.7.1' && jQuery.fn.dataTable.version === '3.1.4', 'Bibliotecas inesperadas');
  var table = document.querySelector('#list table'), body = table.tBodies[0], api = jQuery(table).DataTable();
  check(api.rows().count() === 31 && api.page.info().pages === 3, 'Paginação incorreta');
  check(!api.column(0).orderable(), 'Seleção não pode ordenar pela caixa de marcação');
  check(table.querySelectorAll('.dtcc-button_dropdown').length === 3, 'Filtros de coluna ausentes ou presentes na seleção');
  var filterButton = api.column(1).header().querySelector('.dtcc-button_dropdown');
  filterButton.click(); await new Promise(resolve => setTimeout(resolve, 10));
  var menu = document.querySelector('.sl-column-filter-menu');
  check(menu && menu.parentElement === document.body, 'Filtro deve escapar da região rolável');
  check(menu.querySelectorAll('.dtcc-list-buttons button').length === 31, 'Opções precisam incluir todas as páginas');
  var choices = menu.querySelectorAll('.dtcc-list-buttons button');
  choices[0].click(); choices[1].click();
  check(menu.isConnected && filterButton.getAttribute('aria-expanded') === 'true', 'Multisseleção fechou o menu');
  check(api.page.info().recordsDisplay === 2, 'Seleções não foram combinadas por OU');
  var listSearch = menu.querySelector('input');
  listSearch.value = 'Pessoa 30'; listSearch.dispatchEvent(new Event('input', {bubbles:true}));
  check([...menu.querySelectorAll('.dtcc-list-buttons button')].filter(button => button.getClientRects().length).length === 1, 'Pesquisa no filtro não localizou a opção de outra página');
  listSearch.value = 'zzz'; listSearch.dispatchEvent(new Event('input', {bubbles:true}));
  check(!menu.querySelector('.sl-column-filter-empty').hidden, 'Pesquisa sem resultado não apresentou mensagem');
  listSearch.value = ''; listSearch.dispatchEvent(new Event('input', {bubbles:true}));

  var escape = new KeyboardEvent('keydown', {key:'Escape',bubbles:true,cancelable:true}); document.dispatchEvent(escape);
  check(!menu.isConnected && escape.defaultPrevented && document.activeElement === filterButton, 'Escape precisa fechar só o filtro e devolver o foco');
  SLTables.clearFilters(table);
  check(api.page.info().recordsDisplay === 31, 'Limpar filtros não restaurou todos os registros');
  var handle = api.column(1).header().querySelector('.sl-column-resize-handle');
  var initialWidth = api.column(1).header().getBoundingClientRect().width;
  handle.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true,cancelable:true}));
  check(Math.abs(api.column(1).header().getBoundingClientRect().width - initialWidth - 10) < 2, 'Redimensionamento por teclado não ajustou a largura');
  check(api.order().length === 0, 'Redimensionar não pode ordenar a coluna');
  var changedWidth = api.column(1).header().getBoundingClientRect().width;

  api.order([3,'asc']).draw();
  check(api.rows({order:'applied'}).data().toArray()[0][3] === '31/07/2026', 'Datas brasileiras não foram ordenadas cronologicamente');
  api.search('comunicador').draw();
  check(api.page.info().recordsDisplay === 16, 'Pesquisa deve considerar o nome completo do perfil');
  api.search('').order([]).draw();
  api.page(1).draw('page');
  var selected = body.querySelector('input'); selected.checked = true; selected.setAttribute('checked', '');
  var selectedId = selected.dataset.id;
  api.page(0).draw('page'); api.page(1).draw('page');
  check(body.querySelector('[data-id="'+selectedId+'"]').checked, 'Paginação perdeu a seleção');
  var next = Array.from(api.rows().nodes()).map(function(row){return row.outerHTML;}).join('');
  SLTables.replace(body, next+'<tr><td><input type="checkbox"></td><td>Nova Pessoa</td><td>Analista</td><td>01/09/2026</td></tr>');
  check(Math.abs(api.column(1).header().getBoundingClientRect().width - changedWidth) < 2, 'Atualização perdeu a largura ajustada');
  check(api.rows().count() === 32 && api.page.info().page === 1, 'Atualização perdeu a página ou o novo registro');
  check(table.tBodies[0] === body && body.querySelector('[data-id="'+selectedId+'"]').checked, 'Atualização perdeu o tbody ou a seleção');
  filterButton.click(); await new Promise(resolve => setTimeout(resolve, 10));
  var updatedMenu = document.querySelector('.sl-column-filter-menu');
  [...updatedMenu.querySelectorAll('.dtcc-list-buttons button')].find(button => button.textContent.trim() === 'Nova Pessoa').click();
  check(api.page.info().recordsDisplay === 1, 'Filtro não encontrou um registro recém-adicionado');
  document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape',bubbles:true,cancelable:true}));
  SLTables.replace(body, next+'<tr><td><input type="checkbox"></td><td>Nova Pessoa</td><td>Analista</td><td>01/09/2026</td></tr>');
  check(api.page.info().recordsDisplay === 1, 'Atualização removeu o filtro da coluna');
  SLTables.clearFilters(table);
  api.search('Pessoa 30').draw();
  check(api.page.info().recordsDisplay === 1, 'Busca não aplicada');
  SLTables.replace(body, '<tr><td></td><td>Reposição</td><td>Analista</td><td>01/09/2026</td></tr>', true);
  api.column(1).header().querySelector('.dtcc-button_dropdown').click(); await new Promise(resolve => setTimeout(resolve, 10));
  var refreshedMenu = document.querySelector('.sl-column-filter-menu');
  check(refreshedMenu.querySelector('.dtcc-list-buttons').textContent.includes('Reposição') && !refreshedMenu.querySelector('.dtcc-list-buttons').textContent.includes('Pessoa 30'), 'Opções não acompanharam a atualização das linhas');
  document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape',bubbles:true,cancelable:true}));
  check(api.search() === '' && api.rows().count() === 1 && api.page.info().page === 0, 'Nova consulta não limpou a busca e a página');
  SLTables.replace(body, '', true);
  check(table.textContent.includes('Nenhum registro disponível.'), 'Tabela vazia não apresentou mensagem');
  var compact = document.querySelector('#compact');
  check(jQuery.fn.dataTable.isDataTable(compact.querySelector('table')), 'Tabela compacta não usa DataTables');
  check(!compact.querySelector('.dt-search,.dt-length,.dt-paging,.dt-info'), 'Tabela de conferência recebeu controles desnecessários');
  SLTables.mount(fixture); SLTables.mount(fixture);
  check(fixture.querySelectorAll('.dt-container').length === 2, 'Inicialização duplicou componentes');
  SLTables.destroy(fixture);
  check(!document.querySelector('.sl-column-filter-menu,.sl-column-resize-handle,.sl-table-horizontal-scroll'), 'Desmontagem deixou menus ou controles órfãos');
  check(fixture.querySelectorAll('.dt-container').length === 0, 'Desmontagem deixou componentes antigos');
  SLTables.mount(fixture);
  check(fixture.querySelectorAll('.dt-container').length === 2, 'Remontagem falhou');
  result.textContent = 'PASS';
} catch (error) { result.textContent = 'FAIL: '+error.message; } });
</script>`;
    const file = path.join(directory, 'index.html');
    fs.writeFileSync(file, html);
    const output = execFileSync(browser, ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--dump-dom', '--virtual-time-budget=2500', pathToFileURL(file).href], { encoding: 'utf8', timeout: 25000, stdio: ['ignore', 'pipe', 'pipe'] });
    assert.equal(/<pre id="result">([^<]*)<\/pre>/.exec(output)?.[1], 'PASS');
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

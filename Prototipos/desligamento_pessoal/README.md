# Protótipo de Desligamento de Colaborador

Abra `index.html` nesta pasta ou acesse o cartão **Desligamento de Colaborador** na central de protótipos. Para testar os anexos com armazenamento no navegador, recomenda-se servir a pasta `Prototipos` por HTTP:

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000/desligamento_pessoal/index.html`.

## Análise dos protótipos de referência

Foram analisados os arquivos HTML, CSS e JavaScript de `movimentacao_carreira`, `movimentacao_pessoal` e `requisicao_pessoal`.

| Padrão observado | Aplicação no desligamento |
| --- | --- |
| Cabeçalho com marca Lonax, gradiente azul e status simulado | Mesmo cabeçalho e variáveis visuais |
| `index.html` com cartões e `etapa.html?etapa=...` com a atividade | Mesma organização de navegação |
| Arial, largura de 1120 px, bordas suaves, ícones e cores por área | Mesma base CSS de Movimentação de Pessoal, importada com componentes específicos do desligamento |
| Formulários agrupados, dados de origem somente leitura e itens repetíveis | RM simulado somente leitura; infraestrutura e EPI separados e manuais |
| Linha do tempo, resumo da solicitação e pareceres anteriores | Resumo recolhível e histórico com responsável, data e dados preservados |
| Aprovação, devolução e reprovação destacadas por cor | Decisões de Diretoria, RH, SESMT e TI |
| Confirmações em modal, validações e tratamento de anexos | Mesma linguagem de interação, com arquivos persistidos no navegador |

O novo processo tem estado persistente e valida suas transições. Enquanto a solicitação está em preenchimento, as telas de Diretoria, RH, SESMT, TI, Documento, Assinaturas e DP abertas diretamente permitem preencher os campos e enviar a decisão para demonstrar a atividade escolhida. O envio valida os campos obrigatórios e solicita confirmação antes de registrar a decisão e avançar. Depois de iniciado o fluxo, a edição e o envio seguem a atividade atual; etapas concluídas ficam disponíveis para consulta.

As opções de decisão e o campo de justificativa podem ser usados ao abrir uma aprovação diretamente. Apenas selecionar a decisão ou preencher os campos preserva a atividade atual; o avanço ocorre ao confirmar o envio. Na Diretoria, a justificativa aparece ao devolver ou reprovar e fica oculta ao aprovar.

O histórico usa os mesmos cartões recolhíveis das demais telas de aprovação, com data, responsável, área, decisão e observação. Cada tela apresenta as etapas anteriores previstas no fluxo:

| Tela | Componentes anteriores ao formulário atual |
| --- | --- |
| Diretoria | Dados da solicitação |
| RH | Dados da solicitação e Diretoria |
| Aguardar Análises do SESMT e TI | Dados da solicitação, Diretoria e RH; os retornos das áreas aparecem nos cartões Pendente / Aprovado |
| SESMT ou TI | Dados da solicitação, Diretoria, RH e acompanhamento da espera; a análise da outra área paralela aparece quando concluída |
| Documento | Solicitação, Diretoria, RH, espera das análises e retornos de SESMT e TI |
| Assinaturas | Etapas anteriores e Documento de Desligamento |
| DP | Etapas anteriores, documento e assinaturas com sua evidência |
| Conclusão | Etapas anteriores e checklist concluído pelo DP |
| Correção | Resumo da solicitação, Diretoria e RH devolvendo para correção; depois, o mesmo formulário completo e editável da abertura |
| Reprovação | Resumo da solicitação, Diretoria e RH reprovando; depois, o cartão vermelho de encerramento |

Ao abrir uma tela diretamente, exemplos completam seus componentes anteriores, sem movimentar o processo ou registrar decisões automaticamente. Registros efetivos substituem esses exemplos. SESMT e TI mantêm o mesmo conjunto de predecessores, sem criar dependência entre as duas áreas. As revisões anteriores permanecem agrupadas; o componente de espera precede os retornos de SESMT e TI da mesma revisão; os componentes também preservam os dados, anexos, documento e assinaturas registrados no momento da conclusão. Os exemplos de histórico não registram decisões. Os dados de referência do DP, as observações e os 44 checks já vêm preenchidos para a apresentação, conforme solicitado.

O identificador do colaborador é apresentado como **Chapa**. O catálogo inclui **Dispensa sem justa por iniciativa do empregado** e **Dispensa sem justa por iniciativa do empregador**, além dos outros tipos mantidos; **Pedido de demissão** foi retirado. Rascunhos antigos e visualizações do histórico usam os novos nomes, preservando os registros já salvos. O grupo de equipamentos se chama **Infraestrutura do colaborador**, com **Observações da infraestrutura**. A filial foi retirada do bloco de dados do colaborador.

O histórico mantém os exemplos de **Parâmetros de Desligamento**, equipamentos e EPIs, inclusive quando há dados vazios salvos por uma versão anterior. O formulário antigo recebe os valores ausentes uma vez; os registros preservados são completados apenas na apresentação, sem alterar seu conteúdo armazenado. Tipos, datas, itens, quantidades e observações já informados continuam sendo exibidos, assim como a opção explícita **Não**. A troca de colaborador carrega novamente os dois equipamentos e os três EPIs de exemplo, com quantidades, observações e avaliações preenchidas.

As **Informações de Estabilidade** aparecem logo após **Parâmetros de Desligamento**, em blocos de leitura para CIPA, afastamento e maternidade, separados por linhas suaves dentro de um único fieldset. Cada bloco destaca o tipo e a indicação de registro, com datas e detalhes abaixo e **Observações** ao final. Os exemplos incluem representação e data da eleição na CIPA, motivo do afastamento e retorno previsto de afastamento ou licença-maternidade. Carlos exemplifica CIPA; Fernanda, maternidade; Rafael, CIPA e afastamento. Esses dados são somente leitura, acompanham a seleção do colaborador e aparecem na solicitação, no resumo e no histórico da análise do RH. O registro preserva os dados consultados naquele momento. Não há cálculo automático de estabilidade nem decisão automática de continuidade.

No histórico técnico, EPI ou equipamento, quantidade e devolução ocupam a primeira linha. **Observação do item** e **Observação da análise** ficam na linha seguinte, lado a lado no computador e empilhadas no celular.

Na abertura, Sim/Não segue o espaçamento de 28 px dos demais protótipos. O componente de anexos permite inclusão, visualização, download e exclusão; os arquivos seguem disponíveis no resumo e no histórico. A justificativa aparece uma única vez, ao final, como **Justificativa de desligamento**. Campos inválidos usam a borda vermelha e a mensagem junto ao componente, com rolagem e foco no primeiro erro; o destaque é removido ao editar o campo.

Os três PDFs de teste da pasta `anexos/` já aparecem na solicitação, seguindo o padrão dos demais protótipos. Arquivos incluídos pelo usuário continuam armazenados no `IndexedDB`. A exclusão de um exemplo no formulário remove sua referência da solicitação, preservando o arquivo da pasta.

SESMT e TI já abrem com os campos de análise preenchidos: devolução por item, **Observação da análise** em textarea e parecer da área. No SESMT, a necessidade de exame inicia em Sim, com observações e guia anexada. Os PDFs fixos `guia-exame-demissional.pdf`, `termo-de-epi.pdf` e `termo-de-infraestrutura.pdf` acompanham os respectivos componentes de anexo. Os exemplos são incluídos uma vez; edições e exclusões posteriores permanecem preservadas. Ao trocar o colaborador, o novo cenário recebe novamente os PDFs fixos e os anexos anteriores são preservados no armazenamento e no histórico.

A apresentação da espera está em **`espera_paralelo.html`**, acessível pelo cartão **Aguardar Análises do SESMT e TI** na central. Esse arquivo abre a rota compartilhada `etapa.html?etapa=paralelo`, preservando o armazenamento e a navegação também ao abrir os arquivos diretamente no navegador. A apresentação usa os mesmos componentes da atividade e mostra o histórico até a aprovação do RH. Os cartões clicáveis **SESMT** e **TI** exibem **Pendente** ou **Aprovado** conforme a decisão confirmada de cada área, sem aprovar atividades pelo preenchimento dos exemplos.

## Fluxo representado

1. Encarregado / Gestor seleciona um colaborador fictício, consulta os dados demonstrativos completos do RM e informa os parâmetros de desligamento, infraestrutura e EPI. A abertura já contém exemplos preenchidos, com quantidade e observação por equipamento ou EPI. A análise de estabilidade fica no RH e o histórico aparece a partir das demais etapas.
2. Diretoria aprova, reprova ou devolve ao solicitante.
3. RH registra estabilidade, motivo, possibilidade de continuidade e parecer; pode aprovar, impedir a continuidade ou devolver.
4. A aprovação do RH abre **Aguardar Análises do SESMT e TI**, que concentra os links e os status das duas atividades paralelas. SESMT avalia exame, guia e EPI; TI avalia infraestrutura. Cada área indica devoluções, inclui o termo aplicável e conclui ou devolve. Ao concluir, retorna à atividade de espera. Uma retomada pelas áreas técnicas também abre essa atividade.
5. O botão **Seguir para Documento de Desligamento** fica disponível quando SESMT e TI estiverem concluídos. Ao acioná-lo, o processo registra o retorno das análises e segue para a apresentação do documento de desligamento. Os cartões de navegação e o aviso do paralelismo aparecem somente na atividade de espera. O Sim/Não do exame usa o espaçamento de 28 px dos demais campos.
6. O documento de desligamento aparece como PDF fixo, apenas com visualização e download, tanto na atividade quanto no histórico. Em Assinaturas, a modalidade aparece primeiro, com opções próximas e interativas. A opção **Eletrônica** mostra o upload com o PDF de exemplo e cartões independentes de Colaborador e Gestor. **Assinatura Eletrônica** abre a área de desenho com mouse ou toque, limpeza, confirmação e prévia do traço salvo. A opção **Presencial** mostra apenas o upload de **Documento Assinado**, com um exemplo já anexado. O encaminhamento ao DP valida os campos da modalidade selecionada e solicita confirmação. As duas telas permitem demonstração direta enquanto a solicitação está em rascunho, sem exigir a geração prévia de uma minuta em texto. Assinaturas também permanece interativa quando uma etapa anterior ainda está aberta, para permitir a apresentação das duas modalidades sem depender do estado anterior salvo; os cartões do histórico seguem somente leitura.
7. DP apresenta dados de referência, observações e **44 itens** já preenchidos e marcados como Conferido, todos editáveis na atividade: 24 de descontos / proventos, 5 de cancelamentos e 15 de documentos / providências. Os dados de referência não são checks.
8. O workflow encerra após a conclusão do checklist pelo DP. Responsável e data da conclusão são registrados no histórico. Não há atividade do Financeiro.

Os 44 itens do checklist iniciam em **Conferido**, com observações de exemplo e progresso de 44/44. Os checkboxes **Conferido** e **Não se aplica** ficam abaixo do nome de cada item, um abaixo do outro. A observação ocupa toda a largura restante à direita; no celular, passa para a linha seguinte com largura completa. Cada observação usa textarea e preserva as quebras de linha na edição e no histórico. O DP pode desmarcar um item ou escolher **Não se aplica**, com justificativa. As alterações persistem ao recarregar, sem nova marcação automática. Estados anteriores recebem os dados ausentes uma vez, preservando valores, justificativas e status já editados. Nenhum item é concluído por integração. O S-2299 continua sendo um item de conferência de operação manual no RM. A conclusão exige confirmação e, no fluxo percorrido, mantém a validação das assinaturas. A atividade aberta diretamente no rascunho também permite demonstrar o encerramento. O formulário não possui uma confirmação adicional de efetivação no RM: o escopo prevê essa operação manual, sem definir esses campos como condição de conclusão do checklist. Responsável e data aparecem apenas no histórico, com os valores registrados na conclusão.

## Correções e rastreabilidade

As quatro áreas podem devolver ao Encarregado / Gestor. A tela de Correção mostra o resumo original e o histórico até a área que devolveu, seguidos de todos os campos da solicitação para edição, com equipamentos, EPIs, observações e anexos. Na apresentação direta, o exemplo termina em **Aprovação do RH**, com a decisão de devolução. O resumo original permanece preservado ao editar e recarregar. Os exemplos só passam a compor o registro quando o usuário confirma o envio da correção.

Na Reprovação, a apresentação direta também mostra o histórico até o RH, com a decisão e o motivo em vermelho. Uma reprovação efetivamente registrada preserva sua etapa e seu responsável, sem antecipar aprovações posteriores.

**Desligamento Finalizado** segue o cartão verde simples dos protótipos de movimentação e requisição. Documento, assinaturas e checklist completo ficam nos componentes anteriores do histórico; o encerramento não repete esses componentes.

A correção fica em **Aguardando regra de retomada**: nenhuma regra BPM definitiva foi presumida. Para continuar a demonstração, escolha uma área e clique em **Simular retomada pela área selecionada**. Essa ação explicita uma convenção de demonstração: refazer as análises a partir da área escolhida; nas áreas técnicas, refazer SESMT e TI. Os registros anteriores permanecem no histórico. Documentos, assinaturas e checklist da revisão anterior não liberam a nova revisão; evidências assinadas anteriores são preservadas separadamente.

## Limites e definições pendentes

- Dados de colaboradores e catálogo de tipos são fictícios. Não existem chamadas ao RM, DataServers, REST, WebServices ou datasets reais.
- A origem dos tipos, os dados de estabilidade efetivamente disponíveis, os serviços de consulta e os perfis de acesso dependem do detalhamento técnico.
- A espera pela realização / resultado do exame demissional continua pendente. A análise do SESMT não representa resultado do exame.
- Os PDFs `documento-de-desligamento.pdf` e `documento-de-desligamento-assinado.pdf` são exemplos fixos. Modelo definitivo e mapeamento de campos ainda serão definidos. O arquivo da atividade Documento é o mesmo apresentado no seu histórico.
- As assinaturas desenhadas são preservadas como imagens no formulário e no registro da etapa, junto ao documento de origem. A inclusão dos traços no PDF e a integração com um provedor ficam para uma próxima implementação. Alterar o documento de origem limpa os traços atuais; os registros já enviados continuam preservados. O documento presencial é um anexo conferido manualmente. Os exemplos são incluídos uma vez e exclusões posteriores permanecem salvas.
- Os dados de referência exibidos no DP dependem de validação. CPF, PIS, saldo do FGTS e demais dados preenchidos são exemplos fictícios para a apresentação.
- Efetivação no RM, S-2299 e demais lançamentos permanecem manuais. O pagamento pelo Financeiro está fora deste workflow.
- Estado e histórico ficam no `localStorage`; arquivos ficam no `IndexedDB`, no mesmo navegador e origem. Isso serve à validação do protótipo e não substitui a rastreabilidade do Fluig em produção. Abas da mesma origem recebem atualizações do estado.
- Logotipo e Font Awesome seguem as fontes externas utilizadas nos protótipos existentes.

## Verificação

```bash
node --check desligamento_pessoal/app.js
```

Os testes de navegador usam `node:test`, Playwright e um navegador Chromium instalado. O servidor HTTP temporário é criado e encerrado pelos próprios testes. Se as dependências estiverem fora do projeto, informe o caminho do módulo e do navegador:

```bash
PLAYWRIGHT_MODULE=/caminho/node_modules/playwright CHROME_BIN=/usr/bin/brave-browser \
  node --test desligamento_pessoal/tests/workflow.test.cjs
```

A suíte cobre o fluxo completo, ambas as ordens das análises paralelas, arquivos persistidos, as duas modalidades de assinatura, 44 checks manuais, devoluções das quatro áreas, reprovação, estabilidade, dados somente leitura, prevenção de avanço indevido, ordem e layout do histórico, desenho e limpeza da assinatura, documentos fixos, correção e reprovação de exemplo até o RH, formulário completo de correção, preenchimento e edição do DP, cartão final e largura de celular. Sem Playwright ou Chromium, os testes são explicitamente marcados como ignorados.

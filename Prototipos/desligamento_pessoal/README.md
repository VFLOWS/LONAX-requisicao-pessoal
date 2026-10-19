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

O novo processo tem estado persistente e valida suas transições. Enquanto a solicitação está em preenchimento, as telas de Diretoria, RH, SESMT, TI, Documento, Encaminhar para Assinatura, Validação das Assinaturas e DP abertas diretamente permitem preencher os campos e enviar a decisão para demonstrar a atividade escolhida. O envio valida os campos obrigatórios e solicita confirmação antes de registrar a decisão e avançar. Depois de iniciado o fluxo, a edição e o envio seguem a atividade atual; etapas concluídas ficam disponíveis para consulta.

As opções de decisão e o campo de justificativa podem ser usados ao abrir uma aprovação diretamente. Apenas selecionar a decisão ou preencher os campos preserva a atividade atual; o avanço ocorre ao confirmar o envio. Na Diretoria, a justificativa aparece ao devolver ou reprovar e fica oculta ao aprovar.

O histórico usa os mesmos cartões recolhíveis das demais telas de aprovação, com data, responsável, área, decisão e observação. Cada tela apresenta as etapas anteriores previstas no fluxo:

| Tela | Componentes anteriores ao formulário atual |
| --- | --- |
| Diretoria | Dados da solicitação |
| RH | Dados da solicitação e Diretoria |
| Aguardar Análises do SESMT e TI | Dados da solicitação, Diretoria e RH; os retornos das áreas aparecem nos cartões Pendente / Aprovado |
| SESMT ou TI | Dados da solicitação, Diretoria e RH; a análise da outra área paralela aparece quando concluída |
| Documento | Solicitação, Diretoria, RH e retornos de SESMT e TI |
| Encaminhar para Assinatura | Etapas anteriores e Documento de Desligamento |
| Validação das Assinaturas | Etapas anteriores e encaminhamento eletrônico; exclusiva da modalidade eletrônica |
| DP | Etapas anteriores e documento assinado; inclui Validação das Assinaturas somente na modalidade eletrônica |
| Conclusão | Etapas anteriores e checklist concluído pelo DP |
| Correção | Resumo da solicitação, Diretoria e RH devolvendo para correção; depois, o mesmo formulário completo e editável da abertura |
| Reprovação | Resumo da solicitação, Diretoria e RH reprovando; depois, o cartão vermelho de encerramento |

Ao abrir uma tela diretamente, exemplos completam seus componentes anteriores, sem movimentar o processo ou registrar decisões automaticamente. Registros efetivos substituem esses exemplos. SESMT e TI mantêm o mesmo conjunto de predecessores, sem criar dependência entre as duas áreas. As revisões anteriores permanecem agrupadas; a atividade de espera não aparece como componente do histórico, inclusive na tela do Documento de Desligamento. Os componentes preservam os dados, anexos, documento e assinaturas registrados no momento da conclusão. Os exemplos de histórico não registram decisões. Os dados de referência do DP, as observações e os 44 checks já vêm preenchidos para a apresentação, conforme solicitado.

O identificador do colaborador é apresentado como **Chapa**. O catálogo inclui **Dispensa sem justa por iniciativa do empregado** e **Dispensa sem justa por iniciativa do empregador**, além dos outros tipos mantidos; **Pedido de demissão** foi retirado. Rascunhos antigos e visualizações do histórico usam os novos nomes, preservando os registros já salvos. O grupo de equipamentos se chama **Infraestrutura do colaborador**, com **Observações da infraestrutura**. A filial foi retirada do bloco de dados do colaborador.

O histórico mantém os exemplos de **Parâmetros de Desligamento**, equipamentos e EPIs, inclusive quando há dados vazios salvos por uma versão anterior. O formulário antigo recebe os valores ausentes uma vez; os registros preservados são completados apenas na apresentação, sem alterar seu conteúdo armazenado. Tipos, datas, itens, quantidades e observações já informados continuam sendo exibidos, assim como a opção explícita **Não**. A troca de colaborador carrega novamente os dois equipamentos e os três EPIs de exemplo, com quantidades, observações e avaliações preenchidas.

As **Informações de Estabilidade** aparecem logo após **Parâmetros de Desligamento**, em blocos de leitura para CIPA, afastamento e maternidade, separados por linhas suaves dentro de um único fieldset. Cada bloco destaca o tipo e a indicação de registro, com datas e detalhes abaixo e **Observações** ao final. Os exemplos incluem representação e data da eleição na CIPA, motivo do afastamento e retorno previsto de afastamento ou licença-maternidade. Carlos exemplifica CIPA; Fernanda, maternidade; Rafael, CIPA e afastamento. Esses dados são somente leitura, acompanham a seleção do colaborador e aparecem na solicitação, no resumo e no histórico da análise do RH. O registro preserva os dados consultados naquele momento. Não há cálculo automático de estabilidade nem decisão automática de continuidade.

No histórico técnico, EPI ou equipamento, quantidade e devolução ocupam a primeira linha. **Observação do item** e **Observação da análise** ficam na linha seguinte, lado a lado no computador e empilhadas no celular.

Na abertura, Sim/Não segue o espaçamento de 28 px dos demais protótipos. O componente de anexos permite inclusão, visualização, download e exclusão; os arquivos seguem disponíveis no resumo e no histórico. A justificativa aparece uma única vez, ao final, como **Justificativa de desligamento**. Campos inválidos usam a borda vermelha e a mensagem junto ao componente, com rolagem e foco no primeiro erro; o destaque é removido ao editar o campo.

Os três PDFs de teste da pasta `anexos/` já aparecem na solicitação, seguindo o padrão dos demais protótipos. Arquivos incluídos pelo usuário continuam armazenados no `IndexedDB`. A exclusão de um exemplo no formulário remove sua referência da solicitação, preservando o arquivo da pasta.

SESMT e TI já abrem com os campos de análise preenchidos: devolução por item, **Observação da análise** em textarea e parecer da área. No SESMT, a necessidade de exame inicia em Sim, com observações e guia anexada. Os PDFs fixos `guia-exame-demissional.pdf`, `termo-de-epi.pdf` e `termo-de-infraestrutura.pdf` acompanham os respectivos componentes de anexo. Os exemplos são incluídos uma vez; edições e exclusões posteriores permanecem preservadas. Ao trocar o colaborador, o novo cenário recebe novamente os PDFs fixos e os anexos anteriores são preservados no armazenamento e no histórico.

Os cartões **Aguardar Análises do SESMT e TI** e **Documento de Desligamento** ficam ocultos na lista de etapas da central. A espera também fica oculta nos históricos; o documento continua disponível nos componentes anteriores das etapas seguintes. Suas rotas, arquivos, registros e participação no fluxo permanecem disponíveis. A etapa **Assinaturas** passa a se chamar **Encaminhar para Assinatura** na central, na atividade e no histórico. A apresentação da espera está em **`espera_paralelo.html`**, aberta pelo fluxo ou diretamente pela URL. Esse arquivo abre a rota compartilhada `etapa.html?etapa=paralelo`, preservando o armazenamento e a navegação também ao abrir os arquivos diretamente no navegador. A apresentação usa os mesmos componentes da atividade e mostra o histórico até a aprovação do RH. Os cartões clicáveis **SESMT** e **TI** exibem **Pendente** ou **Aprovado** conforme a decisão confirmada de cada área, sem aprovar atividades pelo preenchimento dos exemplos.

## Fluxo representado

1. Encarregado / Gestor seleciona um colaborador fictício, consulta os dados demonstrativos completos do RM e informa os parâmetros de desligamento, infraestrutura e EPI. A abertura já contém exemplos preenchidos, com quantidade e observação por equipamento ou EPI. A análise de estabilidade fica no RH e o histórico aparece a partir das demais etapas.
2. Diretoria aprova, reprova ou devolve ao solicitante.
3. RH registra estabilidade, motivo, possibilidade de continuidade e parecer; pode aprovar, impedir a continuidade ou devolver.
4. A aprovação do RH abre **Aguardar Análises do SESMT e TI**, que concentra os links e os status das duas atividades paralelas. SESMT avalia exame, guia e EPI; TI avalia infraestrutura. Cada área indica devoluções, inclui o termo aplicável e conclui ou devolve. Ao concluir, retorna à atividade de espera. Uma retomada pelas áreas técnicas também abre essa atividade.
5. O botão **Seguir para Documento de Desligamento** fica disponível quando SESMT e TI estiverem concluídos. Ao acioná-lo, o processo registra o retorno das análises e segue para a apresentação do documento de desligamento. Os cartões de navegação e o aviso do paralelismo aparecem somente na atividade de espera. O Sim/Não do exame usa o espaçamento de 28 px dos demais campos.
6. O documento de desligamento aparece como PDF fixo, apenas com visualização e download, tanto na atividade quanto no histórico. Em **Encaminhar para Assinatura**, a modalidade aparece primeiro, com opções próximas e interativas. Na opção **Eletrônica**, não existe upload: **Gerar e enviar para assinatura** confirma a geração automática e o envio à plataforma digital, registra o protocolo e abre **Validação das Assinaturas**. O PDF fixo representa o documento gerado pelo sistema no protótipo.
7. **Validação das Assinaturas** apresenta documento, plataforma, protocolo, envio e última atualização. O fieldset **Envio para Assinatura Eletrônica** reúne os dados do envio e o campo **Status do documento**, com **Assinado** ou **Pendente**, na mesma linha no computador. Não há resumo adicional de contagem ou lista de assinantes. Cada signatário aparece em um cartão com fundo azul claro, mostrando nome, e-mail, status, **Assinou o documento? Sim/Não** e data da assinatura. O histórico apresenta esses cartões e o documento, sem repetir o bloco de situação, responsável e data da validação; responsável e data continuam registrados no cabeçalho e nos dados preservados. Os status representam os retornos demonstrativos da plataforma. O acompanhamento não possui botão de atualização manual. O documento enviado à plataforma permanece disponível para visualização e download enquanto há assinaturas pendentes, sem upload ou exclusão. Após as duas assinaturas, o componente passa a apresentar o documento assinado retornado pela plataforma. A validação exige as assinaturas e o documento da revisão atual; a confirmação encaminha ao DP. Ao abrir a atividade, a modalidade eletrônica fica ativa por padrão, inclusive quando havia uma escolha presencial salva. O acompanhamento e suas ações ficam disponíveis para apresentação em qualquer estado do processo. O exemplo inicial mostra o Colaborador assinado e o Gestor pendente, tanto na apresentação direta quanto após o envio eletrônico. Cenários salvos por versões anteriores recebem esse exemplo uma vez ao abrir a validação, preservando os registros do histórico. O histórico do envio conserva seu estado original; o da validação conserva os status, datas e documento concluídos, somente para leitura.
8. Na opção **Presencial**, **Encaminhar para Assinatura** mostra apenas o upload de **Documento Assinado**, com um exemplo já anexado. O arquivo é obrigatório e o encaminhamento confirmado segue diretamente ao DP, sem passar pela validação digital ou incluir essa etapa no histórico da modalidade. A atividade continua disponível para apresentação direta enquanto uma etapa anterior está aberta.
9. DP apresenta dados de referência, observações e **44 itens** já preenchidos e marcados como Conferido, todos editáveis na atividade: 24 de descontos / proventos, 5 de cancelamentos e 15 de documentos / providências. Os dados de referência não são checks.
10. O processo encerra após a conclusão do checklist pelo DP. Responsável e data da conclusão são registrados no histórico. Não há atividade do Financeiro.

Os 44 itens do checklist iniciam em **Conferido**, com observações e datas de exemplo, e progresso de 44/44. Os três grupos **Descontos / Proventos**, **Cancelamentos** e **Documentos / Providências** são recolhíveis e indicam a quantidade de itens e de conclusões. As linhas seguem as colunas **#**, **Item**, **Status**, **Data da marcação** e **Observação**, com apresentação empilhada no celular. Cada item tem uma única opção entre **Conferido**, **Pendente** e **Não se aplica**, com cor e ícone por status. A seleção atualiza a data em **dd/mm/aaaa**, conforme o fuso de São Paulo; o campo permite escolher outra data pelo calendário ao clicar e preserva a escolha após recarregar. As observações usam inputs de uma linha, com a mesma altura das datas e limite de 500 caracteres. O contador atualiza durante a digitação e aparece abaixo do input, no canto direito. Editar a observação preserva a data, e todas as alterações persistem ao recarregar. Os grupos conservam sua abertura ao editar outros itens; a validação abre o grupo que contém o primeiro erro.

Os 11 **Dados de Referência da Rescisão** aparecem em inputs somente para leitura, inclusive CPF, PIS, datas e valores. O **Saldo FGTS (R$)** é formatado como moeda brasileira, por exemplo **R$ 18.450,75**, também no histórico. O checklist, as observações e a decisão continuam editáveis no protótipo em qualquer estado do processo. A conclusão usa o componente **Decisão de Aprovação**, com **Concluir checklist** e **Manter em conferência**. O encerramento valida os itens, a justificativa dos que não se aplicam e o documento da modalidade selecionada. Os registros anteriores permanecem preservados, e o histórico dos checklists apresenta os grupos recolhíveis somente para leitura. Nenhum item é concluído por integração; efetivação no RM e envio do S-2299 permanecem manuais.

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
- A modalidade eletrônica representa geração, envio e consultas de status com dados demonstrativos, sem chamar Clicksign, Certisign ou outro serviço. A escolha e a integração do provedor permanecem pendentes. O PDF assinado representa o retorno automático da plataforma. A presencial usa um anexo conferido manualmente. Registros de versões anteriores permanecem preservados; conclusões já registradas pela versão anterior continuam disponíveis.
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

A suíte cobre o fluxo completo, ambas as ordens das análises paralelas, arquivos persistidos, as duas modalidades de assinatura, 44 checks manuais, devoluções das quatro áreas, reprovação, estabilidade, dados somente leitura, prevenção de avanço indevido, ordem e layout do histórico, envio eletrônico sem upload, validação digital, retornos parciais, bloqueio de assinaturas pendentes ou de outra revisão, caminho presencial direto ao DP, cartões ocultos na central, documentos fixos, correção e reprovação de exemplo até o RH, formulário completo de correção, preenchimento e edição do DP, cartão final e largura de celular. Sem Playwright ou Chromium, os testes são explicitamente marcados como ignorados.

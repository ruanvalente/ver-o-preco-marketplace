# Auditoria e Evolução do Sistema de Busca — Full-Text Search

Atue como um **Senior Full Stack Engineer especialista em React, Next.js, TypeScript, Supabase, PostgreSQL, arquitetura de busca e sistemas de marketplace**, com experiência em mecanismos de pesquisa semelhantes aos utilizados por grandes marketplaces como Mercado Livre, OLX e Amazon.

Sua responsabilidade é realizar uma **auditoria completa do sistema de busca existente no projeto**, utilizando o **MCP do Supabase** e skills dentro do projeto para investigar a implementação real no banco de dados, queries, funções, índices, RPCs, views, triggers e demais recursos relacionados à pesquisa.

## Objetivo principal

Verificar se a busca por produtos e todas as demais buscas relevantes do projeto estão utilizando adequadamente **Full-Text Search (FTS)** ou algum mecanismo equivalente de busca semântica/relevante.

A busca não deve ser avaliada apenas com base na existência de correspondência literal de texto.

O objetivo é proporcionar uma experiência semelhante à de grandes marketplaces, onde uma pesquisa como:

> "Telefone"

não deve retornar somente registros que contenham literalmente a palavra `telefone`, mas deve conseguir encontrar resultados **relevantes, relacionados e semanticamente próximos**, considerando o contexto disponível nos dados.

Exemplos esperados:

- telefone
- celular
- smartphone
- aparelho celular
- telefone usado
- telefone Samsung
- telefone iPhone
- celular Android
- smartphone 5G
- produtos cujo título, descrição, categoria ou outros campos relevantes tenham relação com a busca

A implementação deve priorizar **relevância dos resultados**, e não simplesmente existência da palavra pesquisada. Mantendo a perfomance e confiabilidade dos dados e também a melhor experiência possivel para o usuário.

---

# FASE 1 — Auditoria e investigação

Antes de modificar qualquer coisa, faça uma análise completa da codebase e da estrutura do Supabase.

## 1. Mapear todas as funcionalidades de busca

Identifique todas as buscas existentes no projeto, incluindo:

- busca de produtos;
- busca por nome/título;
- busca por descrição;
- busca por categorias;
- busca por usuários;
- busca por vendedores;
- busca por favoritos;
- busca no chat;
- filtros que utilizem texto;
- autocomplete;
- sugestões;
- pesquisas combinadas;
- queries relacionadas;
- endpoints/API routes;
- Server Actions;
- hooks;
- services;
- repositories;
- RPCs do Supabase;
- queries diretamente executadas pelo frontend;
- queries executadas pelo backend.

Para cada busca encontrada, documente:

- localização do código;
- tabela utilizada;
- campos pesquisados;
- estratégia atual;
- filtros aplicados;
- ordenação;
- paginação;
- índices existentes;
- RPCs envolvidas;
- impacto/performance;
- possíveis problemas.

---

# FASE 2 — Auditoria utilizando MCP do Supabase e Skills correspodentes

Utilize o MCP do Supabase e skills correspodentes para verificar a implementação real no banco.

Investigue, quando aplicável:

### PostgreSQL

- tabelas;
- colunas;
- tipos;
- constraints;
- índices;
- views;
- materialized views;
- functions;
- RPCs;
- triggers;
- extensions;
- policies relevantes para a busca.

### Full-Text Search

Verifique se existe utilização de recursos como:

- `tsvector`;
- `tsquery`;
- `to_tsvector`;
- `to_tsquery`;
- `plainto_tsquery`;
- `websearch_to_tsquery`;
- `ts_rank`;
- `ts_rank_cd`;
- índices `GIN`;
- configuração de linguagem;
- stemming;
- stop words;
- normalização de termos.

Também identifique se existem implementações equivalentes utilizando:

- `ILIKE`;
- `LIKE`;
- `LOWER`;
- `unaccent`;
- trigram;
- `pg_trgm`;
- similarity;
- fuzzy search;
- busca por prefixo;
- busca por aproximação;
- outras estratégias.

Não presuma que FTS está implementado. **Comprove através da estrutura real do banco e da implementação existente.**

---

# FASE 3 — Avaliar a experiência de busca

Avalie se a implementação atual é capaz de produzir resultados semelhantes à experiência de grandes marketplaces.

Considere exemplos como:

### Pesquisa literal

`telefone`

Deve encontrar produtos relacionados a telefone.

### Variações

`telefones`

Deve conseguir encontrar resultados relevantes relacionados a `telefone`.

### Termos relacionados

`celular`

Deve encontrar produtos que fazem sentido para essa intenção, mesmo quando o título não contém exatamente `celular`.

### Termos compostos

`telefone samsung`

Deve priorizar produtos que correspondam aos dois conceitos.

### Busca parcial

`iph`

Deve avaliar se existe suporte para autocomplete/prefix matching quando essa funcionalidade fizer sentido.

### Erros de digitação

`iphnoe`

Avalie se existe ou deveria existir algum mecanismo de tolerância a erros.

### Acentuação

`celular`, `célular` ou outras variações devem ser avaliadas conforme o idioma e os dados existentes.

### Singular/plural

Avaliar:

- telefone / telefones;
- celular / celulares;
- notebook / notebooks;
- computador / computadores.

### Termos relacionados

Avaliar se o domínio possui necessidade de:

- sinônimos;
- aliases;
- categorias relacionadas;
- marcas;
- atributos;
- tags;
- termos equivalentes.

---

# FASE 4 — Avaliação de relevância

Não considere suficiente simplesmente "encontrar o registro".

Analise como os resultados são ordenados.

A busca deve, quando aplicável, utilizar uma estratégia de relevância semelhante a:

1. correspondência no título;
2. correspondência em campos de maior importância;
3. correspondência em descrição;
4. categoria;
5. marca;
6. tags/atributos;
7. termos relacionados;
8. popularidade;
9. disponibilidade;
10. outros sinais relevantes existentes no domínio.

Avalie a possibilidade de utilizar pesos diferentes para diferentes campos.

Por exemplo:

```text
Título       → maior peso
Categoria    → peso alto
Marca        → peso alto
Tags         → peso médio
Descrição    → peso menor
```

Não implemente esses pesos automaticamente. Primeiro avalie se fazem sentido para o modelo de dados atual.

---

# FASE 5 — Avaliar FTS x busca semântica

Diferencie claramente:

### Full-Text Search

Busca baseada em termos, stemming, ranking e relevância textual.

### Fuzzy Search

Busca tolerante a pequenas diferenças ou erros de digitação.

### Semantic Search

Busca baseada no significado/intenção do texto, normalmente utilizando embeddings/vector search.

Determine qual abordagem é realmente necessária para o projeto.

Não proponha embeddings ou IA apenas porque são tecnologias modernas.

A solução deve seguir o princípio:

> utilizar a solução mais simples capaz de proporcionar a experiência de busca necessária.

Se FTS + ranking + normalização + sinônimos forem suficientes, priorize essa solução.

Caso FTS não seja suficiente para determinados casos, documente claramente onde uma abordagem híbrida poderia ser utilizada.

---

# FASE 6 — Performance

Avalie o impacto da estratégia atual.

Verifique:

- existência de índices;
- utilização de índices;
- queries potencialmente lentas;
- uso inadequado de `ILIKE '%texto%'`;
- full table scans;
- quantidade de registros;
- paginação;
- ordenação;
- custo das funções;
- RPCs;
- possíveis N+1 queries;
- impacto no Supabase/PostgreSQL.

Sempre que possível, utilize informações reais do Supabase para embasar a análise.

Não recomende criação de índices sem verificar se eles realmente são necessários.

---

# FASE 7 — Compatibilidade com a arquitetura atual

Analise como uma possível melhoria de busca se encaixaria na arquitetura atual.

Verifique:

- frontend;
- backend;
- Supabase;
- repositories;
- services;
- hooks;
- API;
- componentes;
- filtros;
- paginação;
- cache;
- testes.

A solução deve minimizar alterações desnecessárias.

Evite introduzir uma nova arquitetura quando a atual puder suportar a melhoria.

---

# FASE 8 — Produzir o PLANO antes de qualquer alteração

Depois da investigação, **NÃO MODIFIQUE O CÓDIGO, BANCO, WORKFLOW OU GITHUB**.

Primeiro apresente um plano detalhado para aprovação.

O plano deve conter:

## 1. Diagnóstico

- como a busca funciona atualmente;
- quais estratégias são utilizadas;
- onde existe FTS;
- onde não existe;
- problemas encontrados;
- limitações.

## 2. Problemas identificados

Classifique cada problema como:

- Critical
- High
- Medium
- Low

## 3. Solução proposta

Descreva:

- estratégia de busca;
- alterações no PostgreSQL;
- alterações no Supabase;
- índices;
- funções/RPCs;
- alterações no frontend/backend;
- ranking;
- normalização;
- stemming;
- fuzzy search;
- sinônimos;
- semantic search, caso realmente necessário.

## 4. Estratégia de relevância

Explique como os resultados serão classificados.

## 5. Performance

Explique:

- índices;
- impacto esperado;
- paginação;
- possíveis riscos.

## 6. Testes

Defina casos de teste como:

```text
telefone
telefones
celular
smartphone
telefone samsung
iphone
iphnoe
notebook
notebooks
```

Inclua também casos específicos derivados dos dados reais encontrados no projeto.

## 7. Critérios de aceite

Defina objetivamente quando a implementação poderá ser considerada concluída.

## 8. Arquivos e componentes impactados

Liste os arquivos, módulos, migrations, funções e componentes que provavelmente serão alterados.

---

# FASE 9 — Workflow do projeto

Antes de criar qualquer Issue ou realizar qualquer alteração, analise os arquivos de workflow/documentação do projeto.

Procure especialmente por:

- `AGENTS.md`;
- `CONTRIBUTING.md`;
- documentação de desenvolvimento;
- workflows;
- guidelines;
- regras de GitHub;
- convenções de Issues;
- convenções de Pull Requests;
- arquivos relacionados a agentes de IA;
- regras de commits;
- regras de branch;
- regras de revisão.

Determine:

1. Qual workflow deve ser seguido.
2. Como uma Issue deve ser criada.
3. Como um PR deve ser criado.
4. Quais labels devem ser utilizadas.
5. Como deve ser feita a assinatura/autoria do usuário.
6. Quais validações são obrigatórias.
7. Se existe alguma etapa obrigatória de aprovação.

---

# FASE 10 — Assinatura do usuário

Verifique se o workflow define explicitamente como identificar o usuário responsável pela Issue/PR.

A criação deverá utilizar o **nome/username real do usuário no GitHub**, obtido através das ferramentas disponíveis, e nunca inventado.

Se o workflow ainda não possuir uma regra para:

- assinatura do usuário;
- autoria da Issue;
- identificação do responsável;
- atribuição do usuário;
- padrão de assinatura;

então isso deve ser identificado como uma lacuna do workflow.

---

# FASE 11 — Labels do GitHub

Antes de criar a Issue, verifique as labels existentes no repositório.

Mapeie as labels necessárias de acordo com a natureza da tarefa.

Por exemplo:

- bug;
- enhancement;
- feature;
- performance;
- database;
- search;
- supabase;
- frontend;
- backend;
- technical-debt;
- priority;
- etc.

**Não crie labels desnecessárias.**

Se uma label necessária não existir, o workflow deverá definir que ela deve ser criada.

Se o processo atual não possuir nenhuma regra para criação de labels ausentes, documente essa lacuna no workflow antes de prosseguir.

---

# FASE 12 — Aprovação obrigatória

Depois de apresentar o plano:

**PARE E AGUARDE MINHA APROVAÇÃO.**

Não:

- altere código;
- crie migration;
- altere banco;
- crie Issue;
- crie PR;
- crie labels;
- altere workflow.

Somente prossiga após eu aprovar explicitamente o plano.

---

# FASE 13 — Após aprovação

Depois que o plano for aprovado:

1. siga exatamente o plano aprovado;
2. siga o workflow do projeto;
3. atualize o workflow caso exista alguma lacuna identificada;
4. crie as labels necessárias que não existirem;
5. crie a Issue no GitHub;
6. utilize o username/nome real do usuário do GitHub;
7. atribua a Issue ao usuário quando o workflow determinar isso;
8. aplique todas as labels necessárias;
9. descreva detalhadamente o problema;
10. inclua contexto técnico;
11. inclua comportamento atual;
12. inclua comportamento esperado;
13. inclua diagnóstico;
14. inclua solução proposta;
15. inclua critérios de aceite;
16. inclua plano de testes;
17. inclua arquivos/áreas afetadas;
18. inclua riscos e observações relevantes.

A Issue deve ser suficientemente detalhada para que outro desenvolvedor consiga compreender o problema e executar a implementação sem precisar repetir toda a investigação.

---

# Formato obrigatório da Issue

Quando aprovada, utilize uma estrutura semelhante a:

## Contexto

Descrição do problema e motivação.

## Problema identificado

Descrição técnica baseada na auditoria.

## Comportamento atual

O que acontece atualmente.

## Comportamento esperado

Como a busca deve funcionar.

## Análise técnica

Detalhamento da implementação atual e limitações encontradas.

## Solução proposta

Descrição objetiva da implementação aprovada.

## Estratégia de busca

Detalhamento de FTS, ranking, normalização, fuzzy search, sinônimos ou outras técnicas aprovadas.

## Impacto no Supabase/PostgreSQL

- tabelas;
- índices;
- functions;
- RPCs;
- migrations;
- configurações.

## Impacto na aplicação

- frontend;
- backend;
- hooks;
- services;
- componentes;
- APIs.

## Critérios de aceite

Checklist objetivo.

## Testes

Checklist dos cenários que devem ser validados.

## Performance

Critérios relacionados à performance da busca.

## Riscos

Possíveis impactos ou pontos de atenção.

## Referências

Arquivos, migrations, functions, RPCs e demais referências relevantes.

## Responsável

Identificação do usuário do GitHub conforme definido no workflow.

---

# Regra final

Durante toda a execução, siga esta ordem obrigatória:

```text
AUDITAR
   ↓
INVESTIGAR SUPABASE
   ↓
ANALISAR CODEBASE
   ↓
ANALISAR WORKFLOW
   ↓
IDENTIFICAR LACUNAS
   ↓
PROPOR PLANO
   ↓
AGUARDAR APROVAÇÃO
   ↓
EXECUTAR PLANO APROVADO
   ↓
ATUALIZAR WORKFLOW SE NECESSÁRIO
   ↓
CRIAR LABELS AUSENTES
   ↓
CRIAR ISSUE
   ↓
ATRIBUIR/ASSINAR USUÁRIO
   ↓
VALIDAR RESULTADO
```

**A aprovação do plano é obrigatória e representa uma barreira entre investigação e execução.**

Não execute alterações antes dessa aprovação.

---

# RESOLUÇÃO (2026-11-20)

Plano aprovado pelo usuário e registrado em `docs/plans/016-full-text-search.md`. Issue de acompanhamento: #56 (`audit`, `enhancement`, `P1`), atribuída a `ruanvalente` e assinada por Ruan Valente.

Implementação entregue: `migrations/0013_full_text_search.sql` (extensão `unaccent`, coluna gerada `search_vector` com pesos A/C, índice GIN, tabela `product_search_synonyms` com RLS, helper `build_product_search_query` e RPCs `search_products`/`search_owner_listings` como `SECURITY INVOKER`), mapeamento nos serviços de `products` e `listings`, opção `relevance` como padrão quando há `q`, testes Vitest atualizados.

Validação local: `typecheck`, `lint`, `test` e `build` aprovados. A migration foi aplicada manualmente pelo usuário; após a revisão ela foi refinada (ordenação `recent` do vendedor, busca por cidade/bairro/categoria, total paginado, validação de linhas e least-privilege), portanto precisa ser **reaplicada** na versão final antes da validação em produção. Em seguida, validar com `EXPLAIN` e executar a bateria de termos descrita no plano.

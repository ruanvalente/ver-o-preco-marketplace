Quero que você implemente uma busca inteligente de produtos usando Full-Text Search nativo do PostgreSQL/Supabase.

**IMPORTANTE:** Use a skill do Supabase para toda a implementação (criação de migrations, funções RPC, índices, testes de query, etc.). Não invente soluções genéricas de PostgreSQL sem validar com a skill do Supabase.

### Contexto do Projeto

Estou construindo um marketplace (estilo OLX) com as seguintes tabelas:

- `public.products` (id, seller_id, category_id, title, description, price, condition, city, neighborhood, status, created_at, updated_at)
- `public.categories` (id, slug, name, sort_order)
- `public.product_images` (id, product_id, storage_path, alt_text, sort_order, is_primary)
- `public.profiles` (id, display_name, ...)

Verifique a pasta `migrations` onde consta a tabela de produto com seu respectivo sql.

Regras importantes:

- Apenas produtos com `status = 'active'` devem aparecer na busca pública
- Já existe a extensão `pg_trgm` habilitada
- Já existem índices GIN com `gin_trgm_ops` em `title` e `description`
- O banco está em português brasileiro

### Objetivo da Busca Inteligente

Quando o usuário digitar um termo de busca, o sistema deve ser inteligente o suficiente para entender a intenção. Exemplos:

| Termo digitado | Deve retornar também                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| celular        | smartphone, iphone, galaxy, redmi, xiaomi, motorola, capinha, película, carregador, fone |
| iphone         | priorizar produtos com "iphone" no título + acessórios de iPhone                         |
| capinha        | capinhas + celulares (pois são relacionados)                                             |
| notebook       | laptop, macbook, dell, lenovo, etc.                                                      |
| sofá           | sofá, sofa, poltrona, sofá-cama                                                          |

### Requisitos Técnicos Obrigatórios

1. Usar **Full-Text Search** nativo do PostgreSQL (`to_tsvector` + `websearch_to_tsquery` ou `plainto_tsquery`)
2. Configuração de idioma: `'portuguese'`
3. Ranking de relevância usando `ts_rank` ou `ts_rank_cd`
4. Combinar Full-Text Search com `pg_trgm` para melhorar busca parcial/fuzzy quando necessário
5. Criar uma **RPC function** chamada `search_products` com os seguintes parâmetros:
   - `search_term` (text) — termo digitado pelo usuário
   - `category_slug` (text, opcional)
   - `min_price` (numeric, opcional)
   - `max_price` (numeric, opcional)
   - `city` (text, opcional)
   - `condition` (text, opcional)
   - `limit_count` (int, default 20)
   - `offset_count` (int, default 0)

6. A função deve retornar:
   - Dados do produto
   - Nome e slug da categoria
   - URL da imagem principal (`is_primary = true`)
   - Score de relevância (rank)

7. A busca deve funcionar bem mesmo com erros de digitação leves e variações de escrita.

### O que você deve entregar (nessa ordem)

1. **Análise** da estrutura atual e da melhor estratégia de busca
2. **Migration completa** contendo:
   - Coluna `search_vector` (tsvector) gerada na tabela `products` (se fizer sentido)
   - Índices necessários (GIN para full-text)
   - Trigger para manter o `search_vector` atualizado (se usar coluna gerada)
3. **Função RPC** `search_products` completa e otimizada
4. **Exemplos de uso** da RPC via SQL
5. **Exemplo de chamada** no frontend (TypeScript + Supabase JS Client)
6. **Sugestões** de como enriquecer a relevância (dicionário de sinônimos, pesos diferentes para title vs description, etc.)
7. **Testes** com termos reais: "celular", "iphone", "capinha", "notebook", "sofá"

### Critérios de Qualidade

- Performance: a busca deve ser rápida mesmo com milhares de produtos
- Relevância: produtos com o termo no `title` devem ranquear mais alto que os que só têm no `description`
- Segurança: a função deve respeitar RLS (apenas produtos `active` para usuários anônimos)
- Código limpo e bem comentado

Use a skill do Supabase em todas as etapas da implementação.

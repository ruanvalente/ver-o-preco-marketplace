## 1. Objetivo

Implementar o domínio de produtos/listagens como base de leitura do marketplace, permitindo navegação pública, busca, filtros e visualização de detalhes.

## 2. Escopo

- Modelo de produto.
- Categorias.
- Busca.
- Listagem pública.
- Filtros.
- Ordenação.
- Paginação.
- Product card.
- Página de detalhes.
- Galeria de imagens.
- Informações do vendedor.
- Localização.
- Preço.
- Condição.
- Status de publicação.

## 3. Não-objetivos

- Criação/edição completa de anúncio.
- Favoritos.
- Chat.
- Pagamentos.
- Checkout.
- Pedidos.
- Moderação avançada.

## 4. Arquitetura

```text
features/products/
├── components/
│   ├── product-card/
│   ├── product-gallery/
│   ├── product-filters/
│   └── product-list/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

`products` concentra o domínio de leitura e apresentação do item.

A criação e manutenção de anúncios pertence a `listings`.

## 5. Modelo de dados

Modelo conceitual:

```text
products/listings
├── id
├── seller_id
├── title
├── description
├── category_id
├── price
├── condition
├── location
├── status
├── created_at
└── updated_at
```

Imagens devem possuir relação própria conforme o modelo definido em `supabase.md`.

Categorias devem ser estruturadas para permitir expansão.

## 6. Leitura pública

O marketplace deve permitir:

- Página inicial.
- Busca.
- Categorias.
- Filtros.
- Detalhes.

Login não deve ser obrigatório para navegar pelos produtos.

Ações protegidas, como contato com vendedor, devem exigir autenticação.

## 7. UI

### Product card

Hierarquia:

1. Imagem.
2. Título.
3. Preço.
4. Localização.
5. Condição.
6. Favorito quando o módulo estiver disponível.

### Detalhe

1. Galeria.
2. Título.
3. Preço.
4. Condição/localização.
5. Descrição.
6. Informações do vendedor.
7. CTA de contato/chat.
8. Produtos relacionados quando aplicável.

Seguir `DESIGN.md`.

## 8. Busca e filtros

Suportar inicialmente:

- Texto.
- Categoria.
- Faixa de preço.
- Condição.
- Localização quando disponível.
- Ordenação.

Evitar implementar uma camada de busca complexa antes de validar a necessidade real.

## 9. Estados

- Loading/skeleton.
- Lista vazia.
- Nenhum resultado para filtro.
- Erro de carregamento.
- Produto inexistente.
- Produto indisponível/inativo.
- Imagem ausente.
- Paginação/loading incremental.

## 10. Segurança

- Leitura pública somente para produtos publicados/publicáveis.
- RLS deve impedir exposição de registros privados/internos.
- Queries devem selecionar apenas campos necessários.
- Não confiar no status enviado pelo client.
- A autorização de ações protegidas será validada server-side.

## 11. Performance

- Paginação.
- Índices para campos de busca/filtro relevantes.
- Imagens otimizadas.
- Evitar overfetching.
- Server Components para leitura quando apropriado.
- Cache/revalidation somente conforme comportamento desejado do marketplace.

## 12. Testes

- Product card.
- Filtros.
- Busca.
- Ordenação.
- Paginação.
- Produto inexistente.
- Produto inativo.
- RLS/leitura pública.
- Responsividade.
- Acessibilidade.

## 13. Critérios de aceitação

- [ ] Usuário anônimo consegue navegar.
- [ ] Produtos publicados aparecem corretamente.
- [ ] Busca funciona.
- [ ] Filtros funcionam.
- [ ] Paginação funciona.
- [ ] Detalhes funcionam.
- [ ] Dados do vendedor são exibidos corretamente.
- [ ] Produtos privados/inativos não são expostos.
- [ ] Estados de UI estão completos.
- [ ] Testes passam.
- [ ] Performance e acessibilidade são revisadas.

## 14. Dependências

- `001-foundation`
- `002-auth`
- `003-profile`

## 15. Ordem de implementação

1. Schema/migrations.
2. Índices/RLS.
3. Types/schemas.
4. Services/query layer.
5. Product card/list.
6. Search/filter.
7. Detail/gallery.
8. Tests.
9. Performance/accessibility review.

## 1. Objetivo

Permitir que usuários autenticados salvem produtos/listagens de interesse e acessem posteriormente sua coleção de favoritos.

## 2. Escopo

- Adicionar favorito.
- Remover favorito.
- Ver favoritos.
- Estado visual do favorito no product card.
- Estado visual no detalhe.
- Persistência no Supabase.
- RLS.
- Feedback otimista quando seguro.
- Empty state.

## 3. Não-objetivos

- Lista de desejos complexa.
- Compartilhamento de favoritos.
- Notificações de preço.
- Alertas de estoque/disponibilidade.
- Recomendação personalizada.

## 4. Arquitetura

```text
features/favorites/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

O módulo deve integrar com `products`, mas não transferir regras de favoritos para `products`.

## 5. Modelo de dados

Modelo conceitual:

```text
favorites
├── id
├── user_id
├── product_id/listing_id
└── created_at
```

Deve existir uma restrição única para impedir duplicação do mesmo favorito para o mesmo usuário/item.

A referência final deve seguir `docs/architecture/supabase.md`.

## 6. Fluxos

### Adicionar

1. Usuário autenticado aciona favorito.
2. UI atualiza estado.
3. Persistência é realizada.
4. Erro reverte estado quando houver atualização otimista.

### Remover

1. Usuário aciona novamente.
2. Item é removido.
3. UI atualiza.
4. Erro restaura estado quando aplicável.

### Listar

- Buscar somente favoritos do usuário atual.
- Ordenar de maneira previsível.
- Reutilizar product cards.

## 7. UI

O controle de favorito deve:

- Ser reconhecível.
- Ter target de toque adequado.
- Possuir accessible name.
- Indicar estado ativo/inativo sem depender apenas de cor.
- Funcionar no card e detalhe.

Página de favoritos:

- Título.
- Contagem quando disponível.
- Grid/lista responsiva.
- Empty state.
- Loading.
- Error.

## 8. Estados

- Não favoritado.
- Favoritado.
- Salvando.
- Removendo.
- Erro.
- Lista vazia.
- Loading.
- Produto indisponível.

## 9. Segurança

- Favoritos pertencem exclusivamente ao usuário autenticado.
- RLS permite inserir/remover somente o próprio registro.
- Listagem somente dos favoritos do usuário atual.
- Não confiar em `user_id` enviado pelo client.
- Validar item referenciado.
- Evitar duplicidade via constraint no banco.

## 10. Performance

- Índice por usuário.
- Índice/constraint por usuário + item.
- Evitar query individual por item quando possível.
- Ao carregar grids, definir estratégia eficiente para saber quais itens estão favoritados.

## 11. Testes

- Add favorite.
- Remove favorite.
- Duplicate prevention.
- Ownership/RLS.
- Favorite state.
- Favorite list.
- Empty state.
- Error rollback.
- Accessibility.

## 12. Critérios de aceitação

- [ ] Usuário autenticado consegue favoritar.
- [ ] Usuário consegue desfavoritar.
- [ ] Estado visual é consistente.
- [ ] Favoritos persistem entre sessões.
- [ ] Duplicações são impedidas.
- [ ] Usuário não acessa favoritos de outra conta.
- [ ] Empty/error/loading funcionam.
- [ ] Product card continua reutilizável.
- [ ] Testes passam.

## 13. Dependências

- `001-foundation`
- `002-auth`
- `004-products`

## 14. Ordem de implementação

1. Migration/constraint.
2. RLS.
3. Services.
4. Hook/state integration.
5. Favorite button.
6. Favorites page.
7. Tests.
8. Accessibility/performance review.

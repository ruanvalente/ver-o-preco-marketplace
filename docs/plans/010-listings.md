## 1. Objetivo

Implementar o fluxo autenticado de criação, edição, publicação e gerenciamento de anúncios do usuário.

## 2. Escopo

- Criar anúncio.
- Editar anúncio.
- Salvar alterações.
- Upload de imagens.
- Reordenar imagens.
- Definir imagem principal.
- Remover imagens.
- Categoria.
- Título.
- Descrição.
- Preço.
- Condição.
- Localização.
- Preview.
- Publicar/despublicar.
- Gerenciar anúncios próprios.

## 3. Não-objetivos

- Pagamentos.
- Pedidos.
- Entrega.
- Promoção patrocinada.
- Moderação automatizada avançada.
- Sistema de reputação.

## 4. Arquitetura

```text
features/listings/
├── components/
│   ├── listing-form/
│   ├── image-uploader/
│   ├── image-sorter/
│   └── listing-preview/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

`listings` é responsável pelo ciclo de vida de um anúncio pertencente ao usuário.

`products` é responsável pela experiência de consumo/leitura pública.

## 5. Fluxo

1. Usuário autenticado abre novo anúncio.
2. Preenche informações.
3. Faz upload das imagens.
4. Reordena/seleciona imagem principal.
5. Validação.
6. Preview.
7. Salva rascunho/publica conforme fluxo definido.
8. Após publicação, anúncio torna-se elegível para leitura pública.
9. Usuário pode editar ou despublicar posteriormente.

## 6. Modelo de dados

Usar o modelo definido em `docs/architecture/supabase.md`.

Conceitualmente:

```text
listing
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

listing_images
├── id
├── listing_id
├── storage_path
├── sort_order
├── is_primary
└── created_at
```

## 7. Upload de imagens

Requisitos:

- Validar MIME/type.
- Validar tamanho máximo.
- Limitar quantidade.
- Mostrar progresso.
- Permitir reordenação.
- Permitir remoção.
- Definir imagem principal.
- Manter Storage e banco consistentes.
- Limpar arquivos órfãos quando necessário.

## 8. UI

Formulário dividido por grupos:

### Informações básicas

- Título.
- Descrição.
- Categoria.
- Condição.

### Preço

- Preço.
- Formatação monetária.

### Localização

- Localização exibida no anúncio.

### Imagens

- Upload.
- Preview.
- Ordenação.
- Principal.
- Remoção.

### Publicação

- Preview.
- Publicar.
- Salvar alterações.
- Despublicar.

## 9. Validação

Validar:

- Campos obrigatórios.
- Limites de tamanho.
- Preço válido.
- Categoria válida.
- Quantidade de imagens.
- Arquivos permitidos.
- Consistência entre estado do formulário e payload.

A validação do client melhora UX, mas não substitui validação server-side.

## 10. Estados

- Empty form.
- Editing.
- Uploading.
- Upload success.
- Upload error.
- Saving.
- Saved.
- Publishing.
- Published.
- Validation error.
- Permission error.
- Server error.
- Unsaved changes.

## 11. Segurança

- Apenas o proprietário pode editar seu anúncio.
- RLS obrigatório.
- Não aceitar `seller_id` arbitrário do client.
- Associar proprietário a partir da sessão autenticada.
- Validar Storage path.
- Impedir acesso de escrita a arquivos de outro usuário.
- Validar todos os campos server-side.
- Não permitir que o client force status indevido.

## 12. Consistência

Operações que alteram banco e Storage devem considerar falhas parciais.

A implementação deve definir claramente:

- Quando o registro é criado.
- Quando imagens são associadas.
- Como uploads incompletos são tratados.
- Como arquivos órfãos são limpos.
- Como falhas de publicação são recuperadas.

## 13. Testes

- Form validation.
- Create listing.
- Edit listing.
- Ownership.
- RLS.
- Upload.
- Invalid file.
- Image ordering.
- Primary image.
- Publish/unpublish.
- Unsaved changes.
- Error recovery.
- Responsividade.
- Accessibility.

## 14. Critérios de aceitação

- [ ] Usuário autenticado consegue criar anúncio.
- [ ] Usuário consegue editar seus anúncios.
- [ ] Usuário não consegue editar anúncio de outro usuário.
- [ ] Upload funciona com validação.
- [ ] Imagens podem ser ordenadas.
- [ ] Imagem principal pode ser definida.
- [ ] Anúncio pode ser publicado/despublicado.
- [ ] Anúncio publicado aparece no marketplace.
- [ ] Anúncio privado/inativo não aparece publicamente.
- [ ] Falhas de upload/salvamento possuem feedback.
- [ ] Testes passam.
- [ ] Typecheck/lint/build passam.

## 15. Dependências

- `001-foundation`
- `002-auth`
- `003-profile`
- `004-products`

## 16. Ordem de implementação

1. Migrations.
2. RLS.
3. Storage.
4. Schemas.
5. Services.
6. Form.
7. Image uploader.
8. Preview.
9. Publish/manage.
10. Tests.
11. Security/accessibility review.

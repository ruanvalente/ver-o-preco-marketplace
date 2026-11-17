## 1. Objetivo

Implementar comunicação interna entre comprador e vendedor associada a um anúncio, usando Supabase Realtime para atualização em tempo real.

## 2. Escopo

- Conversas relacionadas a anúncios.
- Lista de conversas.
- Chat individual.
- Mensagens de texto.
- Mensagens com imagem.
- Contexto do produto/anúncio.
- Presença online/offline.
- Indicador de digitação.
- Mensagens lidas.
- Atualização realtime.
- Upload de imagens.
- Segurança por participante.

## 3. Não-objetivos

- Áudio/vídeo.
- Ligações.
- Chat em grupo.
- Pagamentos dentro do chat.
- Moderação automatizada avançada.
- Notificações push completas, salvo infraestrutura necessária para evolução futura.

## 4. Arquitetura

```text
features/chat/
├── components/
│   ├── conversation-list/
│   ├── chat-header/
│   ├── message-list/
│   ├── message-composer/
│   └── product-context/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

O módulo deve consumir informações de `products`/`listings` e `profile`, sem duplicar seus modelos.

## 5. Modelo de dados

Modelo conceitual:

```text
conversations
├── id
├── listing_id
├── buyer_id
├── seller_id
├── created_at
└── updated_at

messages
├── id
├── conversation_id
├── sender_id
├── type
├── content
├── attachment_path
├── read_at
└── created_at
```

A estrutura final deve seguir `docs/architecture/supabase.md`.

Deve haver garantia de que uma conversa pertence a participantes válidos e a um anúncio válido.

## 6. Fluxo de criação

1. Usuário autenticado visualiza anúncio.
2. Usuário inicia contato.
3. Sistema verifica/cria conversa para aquele comprador + vendedor + anúncio.
4. Chat é aberto.
5. Mensagens são persistidas.
6. Realtime atualiza participantes.

O vendedor não deve poder iniciar uma conversa com identidade arbitrária.

## 7. Mensagens

Tipos iniciais:

- Text.
- Image.

Cada mensagem deve possuir:

- Autor.
- Timestamp.
- Tipo.
- Conteúdo ou referência ao arquivo.
- Estado de leitura.

Não armazenar conteúdo binário diretamente na tabela.

## 8. Realtime

Usar Supabase Realtime para:

- Novas mensagens.
- Presença.
- Digitação.
- Atualização de leitura quando apropriado.

As subscriptions devem:

- Ser criadas apenas quando necessárias.
- Ser limpas no unmount.
- Evitar listeners duplicados.
- Filtrar pelo contexto da conversa.
- Não expor eventos de conversas de terceiros.

## 9. Presença

Exibir:

- Online.
- Offline.

A presença é informacional e não deve ser tratada como garantia absoluta de disponibilidade do usuário.

## 10. Typing indicator

- Evento temporário.
- Não persistir como mensagem.
- Debounce/throttle para evitar excesso de eventos.
- Limpar estado quando usuário parar de digitar, enviar mensagem ou sair.

## 11. Read state

Ao visualizar mensagens:

- Atualizar estado de leitura de mensagens aplicáveis.
- Não marcar mensagens próprias como não lidas.
- Evitar requests repetitivos.
- Garantir autorização server-side/RLS.

## 12. Upload de imagens

- Validar tipo.
- Validar tamanho.
- Limitar quantidade/tamanho.
- Upload para Storage.
- Persistir apenas referência/path na mensagem.
- Aplicar regras de acesso para participantes.
- Limpar arquivos órfãos quando necessário.

## 13. UI

Estrutura:

```text
Conversation List
└── Conversation Item

Chat
├── Header
├── Product Context
├── Message List
└── Composer
```

Desktop pode utilizar duas colunas.

Mobile deve priorizar uma conversa por vez.

Composer deve suportar:

- Texto.
- Imagem.
- Envio.
- Estado de envio.
- Erro.
- Acessibilidade.

## 14. Estados

### Conversa

- Loading.
- Empty.
- Error.
- Active.
- Reconnecting.

### Mensagem

- Sending.
- Sent.
- Failed.
- Read.
- Image uploading.
- Image failed.

### Chat

- Typing.
- Online/offline.
- No messages.
- Permission denied.

## 15. Segurança

Este é um módulo sensível.

- Somente participantes podem ler a conversa.
- Somente participantes podem inserir mensagens.
- `sender_id` deve derivar da sessão.
- Usuário não pode enviar mensagem em nome de outra pessoa.
- Storage deve restringir arquivos de chat.
- RLS obrigatório em conversas e mensagens.
- Não expor mensagens via queries públicas.
- Validar tamanho/tipo das mensagens.
- Evitar conteúdo HTML arbitrário.
- Arquivos devem ser tratados como não confiáveis.

## 16. Performance

- Paginar histórico.
- Carregar mensagens mais recentes primeiro ou por cursor conforme UX definida.
- Não carregar todo histórico de uma vez.
- Limitar eventos realtime.
- Evitar re-renderização da lista inteira.
- Virtualização somente se volume justificar.

## 17. Testes

- Criação/reutilização de conversa.
- Autorização de participantes.
- Envio de texto.
- Envio de imagem.
- Falha de envio.
- Read state.
- Presence.
- Typing.
- Realtime subscription cleanup.
- RLS.
- Storage security.
- Responsividade.
- Acessibilidade.

## 18. Critérios de aceitação

- [ ] Usuário autenticado consegue iniciar conversa a partir de um anúncio.
- [ ] Conversa está vinculada ao anúncio correto.
- [ ] Comprador e vendedor são os participantes corretos.
- [ ] Mensagens de texto funcionam.
- [ ] Imagens funcionam com validação.
- [ ] Novas mensagens aparecem via realtime.
- [ ] Presença funciona.
- [ ] Typing indicator funciona sem persistência.
- [ ] Read state funciona.
- [ ] Usuários externos não conseguem acessar a conversa.
- [ ] Storage possui proteção adequada.
- [ ] Histórico é paginado.
- [ ] Mobile e desktop funcionam.
- [ ] Testes passam.

## 19. Dependências

- `001-foundation`
- `002-auth`
- `003-profile`
- `004-products`
- `005-listings`

## 20. Ordem de implementação

1. Migrations.
2. Constraints/RLS.
3. Storage.
4. Conversation service.
5. Message service.
6. Conversation list.
7. Chat UI.
8. Realtime.
9. Presence/typing.
10. Read state.
11. Image messages.
12. Tests.
13. Security/performance/accessibility review.

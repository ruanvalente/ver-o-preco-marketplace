## 1. Objetivo

Criar o perfil público e privado do usuário associado à conta autenticada, fornecendo os dados necessários para identificação do vendedor e evolução futura do marketplace.

## 2. Escopo

- Criação/atualização de perfil.
- Nome de exibição.
- Avatar.
- Localização.
- Informações básicas do vendedor.
- Visualização de perfil.
- Estado online/offline quando aplicável.
- Integração com Auth.
- Storage para avatar.
- RLS.

## 3. Não-objetivos

- Sistema completo de reputação.
- Avaliações.
- Verificação de identidade.
- Pagamentos.
- Dados empresariais avançados.
- Chat completo.

## 4. Arquitetura

```text
features/profile/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

O módulo `profile` é responsável por dados de domínio do usuário, enquanto `auth` permanece responsável por credenciais e sessão.

## 5. Modelo de dados

Tabela conceitual:

```text
profiles
├── id
├── display_name
├── avatar_url
├── location
├── created_at
└── updated_at
```

`profiles.id` deve estar relacionado ao usuário autenticado.

A estrutura final deve seguir `docs/architecture/supabase.md` e as migrations existentes.

## 6. Storage

### Bucket de avatar/perfil

Implemente o armazenamento e gerenciamento de avatar/perfil utilizando o **Supabase Storage**, respeitando integralmente as convenções e a arquitetura já existentes no projeto.

#### Bucket

O bucket já foi criado e deve ser utilizado:

`veropreco/avatar/profile`

**Não crie um novo bucket.**

Antes de implementar, analise o projeto para identificar:

- convenções existentes para arquivos e uploads;
- estrutura de serviços/lib/utilitários relacionados ao Supabase;
- padrões de autenticação e autorização;
- convenções de nomenclatura;
- tratamento de erros;
- componentes/hooks existentes que possam ser reutilizados;
- políticas/RLS já utilizadas no Storage;
- padrão utilizado para persistência de URLs ou paths no banco de dados.

#### Supabase

Caso seja necessário consultar, validar ou alterar recursos do Supabase, utilize a **skill do Supabase via CLI** e siga as convenções já adotadas pelo projeto.

Não substitua configurações existentes nem crie uma segunda abordagem para integração com o Supabase.

#### Regras de armazenamento

O avatar deve ser armazenado dentro do bucket existente, seguindo uma estrutura de path consistente e segura por usuário.

Priorize uma estrutura semelhante a:

`<user-id>/avatar.<extensão>`

ou outra convenção equivalente caso o projeto já possua um padrão definido.

Evite utilizar o nome original enviado pelo usuário como parte do path do arquivo.

Considere:

- formatos de imagem suportados;
- tamanho máximo do arquivo;
- validação do MIME type;
- substituição de avatar existente;
- remoção do avatar anterior quando necessário;
- tratamento de upload duplicado;
- nomes de arquivos previsíveis e consistentes;
- segurança e isolamento entre usuários.

#### Segurança

Garanta que um usuário só possa:

- fazer upload do próprio avatar;
- substituir o próprio avatar;
- remover o próprio avatar;
- acessar arquivos conforme as regras de visibilidade definidas pelo projeto.

Não implemente permissões excessivamente abertas apenas para fazer o fluxo funcionar.

Se forem necessárias policies do Supabase Storage, analise primeiro as policies existentes e implemente apenas as alterações necessárias.

#### Integração com o perfil

Analise como o perfil do usuário é persistido atualmente.

Caso o projeto armazene o path/URL do avatar no banco, siga o modelo existente em vez de criar uma nova estrutura.

Evite duplicar informações que possam ser derivadas do Storage.

#### Implementação

Antes de alterar o código:

1. Analise a estrutura atual do projeto.
2. Identifique os pontos responsáveis por autenticação, perfil e Supabase.
3. Identifique as convenções existentes para Storage.
4. Verifique o bucket `veropreco/avatar/profile`.
5. Verifique as policies necessárias.
6. Reutilize abstrações existentes sempre que possível.
7. Implemente a solução seguindo o padrão arquitetural atual.

Após a implementação:

- valide o fluxo de upload;
- valide a substituição do avatar;
- valide a remoção;
- valide os cenários de erro;
- execute os testes existentes relacionados à funcionalidade;
- execute lint/typecheck/build conforme os scripts disponíveis no projeto.

### Critérios de aceite

A implementação será considerada concluída quando:

- [ ] O bucket existente `veropreco/avatar/profile` for utilizado.
- [ ] Nenhum bucket adicional for criado.
- [ ] O path do arquivo seguir a convenção do projeto.
- [ ] O usuário não puder manipular o avatar de outro usuário.
- [ ] Upload, substituição e remoção funcionarem corretamente.
- [ ] Validação de tipo e tamanho do arquivo estiver implementada conforme os padrões do projeto.
- [ ] Policies do Supabase estiverem adequadas ao fluxo.
- [ ] O perfil refletir corretamente o avatar armazenado.
- [ ] Não houver duplicação desnecessária de lógica ou integração com Supabase.
- [ ] Testes, lint, typecheck e build existentes continuarem passando.

**Importante:** não assuma a estrutura do projeto. Primeiro inspecione o código e siga as convenções existentes. Se houver uma implementação semelhante no projeto, use-a como referência antes de criar uma nova abstração.

Regras:

- Usuário só pode modificar seus próprios arquivos.
- Validar tipo e tamanho.
- Evitar nomes de arquivos previsíveis.
- Remover/substituir arquivo antigo quando apropriado.
- Não confiar apenas na extensão.

## 7. UI

### Meu perfil

- Avatar.
- Nome.
- Localização.
- Ações de editar/salvar.
- Feedback de atualização.

### Perfil público

- Avatar.
- Nome.
- Localização.
- Estado online/offline quando suportado.
- Informações públicas relevantes.

Seguir hierarquia e tokens de `DESIGN.md`.

## 8. Estados

- Perfil inexistente/inicialização.
- Carregando.
- Editando.
- Salvando.
- Upload de avatar.
- Upload concluído.
- Erro de upload.
- Erro de atualização.
- Perfil público não encontrado.

## 9. Segurança

- RLS para leitura/escrita.
- Usuário só altera seu próprio perfil.
- Definir explicitamente quais campos são públicos.
- Não expor dados internos do usuário.
- Validar payload no servidor.
- Validar uploads.
- Evitar URLs de Storage inadequadamente abertas.

## 10. Testes

- Criação de perfil.
- Atualização própria.
- Bloqueio de atualização de outro usuário.
- Validação de campos.
- Upload de avatar.
- Rejeição de arquivo inválido.
- Renderização pública.
- Estados de loading/error.
- Acessibilidade.

## 11. Critérios de aceitação

- [ ] Perfil é associado corretamente ao usuário autenticado.
- [ ] Usuário consegue editar os campos permitidos.
- [ ] Usuário consegue atualizar avatar.
- [ ] Perfil público exibe somente dados permitidos.
- [ ] RLS impede alterações indevidas.
- [ ] Upload possui validação.
- [ ] Estados de UI estão completos.
- [ ] Testes passam.
- [ ] Typecheck/lint/build passam.

## 12. Dependências

- `001-foundation`
- `002-auth`

## 13. Ordem de implementação

1. Migration/schema.
2. RLS.
3. Storage.
4. Services.
5. Schemas.
6. UI.
7. Integração Auth.
8. Tests.
9. Security review.

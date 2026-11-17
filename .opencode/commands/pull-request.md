# Descrição

Prepara um Pull Request completo e padronizado, com:

- branch de origem criada a partir da `develop`
- título semântico
- descrição estruturada em inglês
- checklist de testes
- issues relacionadas

### IMPORTANTE

> Título e descrição do PR são sempre em inglês.
> A branch de origem é criada a partir da `develop`.
> O PR sempre aponta para `develop`.
> **Este comando não faz `git push` nem cria o PR automaticamente.** Publicar a branch e criar o PR exigem confirmação explícita do usuário (política em `docs/ai/security.md`).

### Como usar

```bash
/pull-request <branch-name>
```

Exemplo:

```bash
/pull-request feat/user-role-system
```

## Fluxo do agente

### 1. Preparar a branch a partir da develop

```bash
git checkout develop
git pull origin develop
git checkout -b <branch-name> develop
```

Se houver alterações locais do usuário, parar e perguntar antes de trocar de branch.

### 2. Analisar mudanças

Identificar tipo:

- `feat` / `fix` / `refactor` / `docs` / `chore` / etc.

Identificar escopo:

- `auth`, `profile`, `products`, `listings`, `favorites`, `chat`, `dashboard`, `ui`, `api`, `database`, `config`

### 3. Gerar título semântico

Formato:

```text
<type>(<scope>): <description>
```

### 4. Gerar descrição do PR (em inglês)

```markdown
## Summary

...

## Changes

- ...

## Tests

- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] No console errors

## Related Issues

Closes #...
```

### 5. Validar antes de propor

Rodar `bun run typecheck`, `bun run lint`, `bun run test` e `bun run build`. Reportar falhas; não desabilitar gates.

### 6. Mostrar os comandos para o usuário

Exibir o título, a descrição e, **apenas após confirmação explícita**, executar:

```bash
git push -u origin <branch-name>
gh pr create --base develop --head <branch-name> --title "<title>" --body "<body>"
```

Nunca executar `git push`, `--force` ou deploy sem pedido explícito. Se o usuário confirmar apenas o push, não criar o PR; se confirmar apenas o PR, não fazer push.

## Output

Link do Pull Request no GitHub, quando criado. Caso contrário, título e descrição prontos para revisão.

## Regras

- Não escrever PR em português.
- Não gerar título genérico.
- Usar padrão semântico.
- Ser claro e objetivo.
- Branch sempre criada a partir da `develop`.
- PR sempre aponta para `develop`.
- Nenhum push ou criação de PR sem confirmação explícita.

# Guia de Contribuição

- Contribuir para este projeto é bastante fácil. Este documento mostra como começar!

## Geral

- A [Estrutura do Código](./CODEBASE_STRUCTURE.md) contém informações detalhadas sobre como os vários arquivos deste projeto estão estruturados.
- Por favor, certifique-se de que quaisquer alterações que você fizer estejam de acordo com as [Diretrizes de Código](./CODE_GUIDELINES.md) deste repositório.

## Começando a trabalhar

- Faça um fork do repositório
- Clone o repositório forkado
- Crie um novo branch para o seu trabalho baseado no branch develop
- Use um branch por correção/funcionalidade
- Os possíveis tipos de branch são:
  - bugfix
  - feature
  - hotfix
  - release
  - other
- Crie uma pull request para o branch develop

Exemplo:

```bash
git checkout -b bugfix/mudar-algo
```

Se você receber um erro, talvez precise buscar o repositório primeiro usando

```bash
git remote update && git fetch
```

## Atualizando o branch com o desenvolvimento

É altamente recomendado puxar o código de desenvolvimento para o seu branch para se manter atualizado. Use o comando abaixo para realizar essa tarefa.

```bash
git pull origin development
```

Você pode precisar resolver alguns conflitos antes de continuar com o seu código.

## Enviando alterações

- Instale as dependências usando:

  ```bash
  yarn
  ```

- Use este comando para iniciar o commitizen e siga as instruções no console para criar uma ótima mensagem de commit para você

  ```bash
  git commit
  ```

  AVISO: Por favor, mencione o ID do problema no seu commit.

- Faça uma pull request
- Certifique-se de enviar a PR para o branch <code>develop</code>

Se você seguir estas instruções, sua PR estará preparada para o sucesso através do pipeline do projeto.


# Codebase Structure

- .github: contains all the files related to GitHub, such as issue templates, pull request templates, and GitHub Actions
- .husky: git hooks (please do not edit without using Husky CLI)
- .vscode: vscode configuration


## Backend (packages/backend) Structure

- dist: contains the compiled files
- prisma: contains all the files related to the database managed by Prisma
- scripts: contains all the scripts related to the application

- src: contains all the files related to the application
- src/@types: global type definitions

- src/modules: contains parts of the software
- src/modules/<< name >>: contains a part of the software, guided by DDD pattern
- src/modules/<< name >>/types: type, enum and interface files
- src/modules/<< name >>/entities: entities
- src/modules/<< name >>/guards: guards
- src/modules/<< name >>/infra: module infrastructure (http, ws, database, ORM, and others)
- src/modules/<< name >>/repositories: data repositories interfaces for dependency inversion (DDD)
- src/modules/<< name >>/schemas: user input validation schemas
- src/modules/<< name >>/services: service files

- src/common: contains the high level code of the app
- src/common/config: configuration files
- src/common/container: contains the providers to dependency injection
- src/common/container/providers/<< name >>: provider root folder
- src/common/container/providers/<< name >>/implementations: provider implementation
- src/common/container/providers/<< name >>/mocks: fake provider for testing purposes
- src/common/repositories: contains the repositories references
- src/common/errors: controlled/forced exceptions
- src/common/infra/http: contains the app starter, brain of application
- src/common/infra/http/middlewares: global middlewares
- src/common/infra/http/routes: global router which joins all modules into once
- src/common/types: global types and interfaces
- src/common/util: utility functions

## Postgres conf
`docker run -d --name postgres_container -e POSTGRES_PASSWORD=masterkey -p 5432:5432 -v pgdata:/var/lib/postgresql --restart unless-stopped postgres`

```bash
psql -U postgres
\password username
postgres=# CREATE DATABASE node_api;
```

## i18n

O projeto usa a biblioteca i18n para internacionalização das mensagens de erro da API.

Idiomas disponiveis:
- pt-BR (padrao)
- en

Como selecionar idioma:
- Header Accept-Language: en
- Query string: ?lang=en

Exemplo:
- GET /api/users/abc com Accept-Language: en retorna "invalid id"
- GET /api/users/abc com Accept-Language: pt-BR retorna "id invalido"

Configuracao opcional:
- DEFAULT_LOCALE=pt-BR


## Decorators com JavaScript + Babel + TypeORM

O Node.js não executa decorators de classe em JavaScript puro sem transpilar.
Para suportar `@decorators` em arquivos `.js`, o projeto usa Babel no runtime.

### Dependencias usadas

Dev dependencies:

- `@babel/core`
- `@babel/cli`
- `@babel/preset-env`
- `@babel/plugin-proposal-decorators`
- `@babel/plugin-proposal-class-properties`

Dependencias de ORM:

- `typeorm`
- `reflect-metadata`

### Configuracao Babel

Arquivo: `babel.config.json`

Pontos importantes:

- `@babel/plugin-proposal-decorators` com `{ "legacy": true }`
- `@babel/plugin-proposal-class-properties` com `{ "loose": true }`
- ordem dos plugins importa: decorators antes de class properties

### Scripts de execucao

No `package.json`:

- `npm run build` transpila `src` para `dist` via Babel
- `npm run dev` recompila em mudancas e executa `node dist/server.js`
- `npm start` executa build + run em `dist/server.js`
- o projeto roda sem `"type": "module"` para evitar conflitos ESM/CJS no runtime ao usar decorators em JS

### Exemplo de entidade com decorators

```js
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "varchar", nullable: false })
  name;
}

export { User };
```

### Observacoes importantes

- Sem TypeScript, os tipos de coluna devem ser definidos explicitamente (ex.: `type: "int"`, `type: "varchar"`).
- Em relacoes, use `@JoinColumn` e `@JoinTable` conforme necessario.
- Garanta `import "reflect-metadata"` antes da inicializacao do DataSource.
- Neste projeto, sincronizacao de schema fica opt-in via `DB_SYNCHRONIZE=true`.
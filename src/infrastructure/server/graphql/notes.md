# Instalación de dependencias

```sh
npm i graphql apollo-graphql @graphql-tools/load @graphql-tools/graphql-file-loader
npm i -D @graphql-tools/webpack-loader
```

# Gestión de errores

Antes de montar la gestión de errores personalizados, utilizar el endpoint de `login`, eliminando el dominio del email, para ver todo el stack trace que devuelve GQL cuando se produce un error.

```graphql
mutation {
  login (
    username: "trenton.kutch",
    password: "123456"
  ) {
    token
  }
}
```

# Directivas

Directivas por defecto:

- @include
- @skip
- @deprecated
- @specifiedBy
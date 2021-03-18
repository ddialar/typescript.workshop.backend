# TypeScript curso de formación - Backend

<img src="https://img.shields.io/badge/Version-1.0.0-yellow" /> <img src="https://img.shields.io/badge/TypeScript-4.1.2-blue" /> <img src="https://img.shields.io/badge/Webpack-5.6.0-blue" /> <img src="https://img.shields.io/badge/Jest-26.6.3-green" /> <img src="https://img.shields.io/badge/openApi-4.1.5-green" /> <img src="https://img.shields.io/badge/Docker-20.10.2-blue" />

[🇬🇧 Version](https://github.com/ddialar/typescript.workshop.backend/blob/master/README.md)

## 📖 Index

-   [Description](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#description)
-   [Requisitos del sistema](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#requirements)
-   [Visión general del repositorio](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview)
    -   [Variables de entorno](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-environment-variables)
    -   [Arquitectura](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-architecture)
        -   [common](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-architecture-common)
        -   [domain](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-architecture-domain)
        -   [infrastructure](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-architecture-infrastructure)
        -   [test](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-architecture-test)
    -   [Entornos de ejecución](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-environments)
-   [Listado de comandos](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#commands)
    -   [Cambiando la versión de NodeJS](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#commands-switch-node)
    -   [Proceso de instalación de módulos](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#commands-installation)
    -   [Ejecución de los tests](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#commands-tests)
    -   [Ejecución de la aplicación en modo desarrollo](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#commands-dev-mode)
    -   [Compilación de la aplicación](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#commands-pro-mode)
-   [Documentación de la API REST](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#apidoc)
-   [Reconocimientos y agradecimientos](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#credits-and-thanks)
-   [TODO list](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#todo-list)
-   [Elementos a investigar](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#research-list)

## <a id="description"></a>🔍 Descripción

Este repositorio está orientado a proporcionar el backend para el taller de TypeScript al que pertenece.

En esta caso, estamos implementando el backend de una aplicación de Social Media que permite registrar usuarios y que se autentiquen, crear y eliminar posts, crear y eliminar comentarios de posts y dar o quitar 'me gusta' a los posts.

La idea original de esta aplicación está tomada de este interesantísimo taller llamado [Build a Social Media App (MERNG stack)](https://morioh.com/p/07b0be424b5f?f=5ece1a68f0e6056e36305f65), creado por [Classsed](https://www.youtube.com/c/classsed) y publicado por [freecodecamp.org](https://www.freecodecamp.org/).

A diferencia de la versión original, este códigio implementa una API REST para acceder a las funcionalidades del backend.

La mayor parte del código está creada siguiendo el paradigma de la **programación funcional** mientras que la POO ha sido usada únicamente para crear los objetos de error que serán empleados cuando se dispare alguna excepción.

Algunas de las herramientas usadas en este repositorio son las siguientes:

-   📦 `Webpack` para transpilar y empaquetar el código TypeScript.
-   🔒 `JWT` como servicio de tokens.
-   ⚙️ `dotenv` para las variables de entorno.
-   📝 `Swagger` para la documentación de la API REST.
-   💾 `Log4JS` para las tareas de logging.
-   ✅ `Joi` para la validación de los datos de entrada.
-   🧪 `Jest` para el testing unitario, así como `supertest` para los tests de integración de la API.
-   🔍 `ESLint` para la revisión y formateado del código.
-   🐶 `Husky` para la gestión de los Git Hooks.
-   🐳 `Docker` para la gestión de imágenes de contenedores.
-   🌱 `MongoDB` como motor de base de datos.

Además este repositorio está diseñado para trabajar con `NodeJS 14.15.0 LTS`.

Si estás ejecutando versiones diferentes de NodeJS en tu sistema, simplemente ejecuta `nvm use` y éste se cambiará a la versión indicada en el archivo `.nvmrc`.

## <a id="requirements"></a>💻 Requisitos del sistema

Para ejecutar el código en su sistema, necesitas tener cubiertos los siguientes requisitos mínimos:

-   NodeJS 14.15.0
-   npm 6.14.11
-   npx 6.14.11
-   Docker 20.10.2
-   docker-compose 1.27.4

Además de esto, es recomendable que cuentes con lo siguiente:

-   nvm 0.33.0
-   Navegador web (recomendado Google Chrome 88.0)
-   Herramienta de gestión de bases de datos por entorno gráfico (recomendado Robo 3T 1.4.1)
-   Editor de código (recomendado VScode 1.52.1)

## <a id="repository-overview"></a>👀 Visión general del repositorio

### <a id="repository-overview-environment-variables"></a>⚙️ Variables de entorno

Debido a que hemos seleccionado `dotenv` como gestor de variables de entorno, en la raíz del proyecto habrá un direcotrio llamado [`env`](https://github.com/ddialar/typescript.service.boilerplate/blob/master/env).

En este directorio tendrás que definir un mínimo de tres archivos de entorno:

-   `.env` para producción.
-   `.env.dev` para desarrollo.
-   `.env.test` para testing.

Puedes eliminar algunos de estos archivos o añadir otros dependiendo de las necesidades de tu aplicación. Solamente ten en cuenta que necesitarás actualizar o definir la configuración de Webpack en base al entorno en el que vas a estar trabajando.

Los diferentes scripts creados para ejecutar la aplicación en cada entorno están preparados para cargar la configuración correspondiente y aplicarla al código.

Para usar el código con el objetivo de producción, Webpack está configurado para escribir la información de las variables de entorno en el bundle final, así que no necesitarás pensar si tienes que proporcionar o no las variables de entorno en las imágenes de la aplicación.

Los campos base que debes incluir en estos archivos de configuración son los siguientes:

```sh
NODE_ENV="production" | "development" | "test"

# Configura el puerto que mejor se adapte a tu entorno.
SERVER_PORT=4000

# Configura el nivel de logging que mejor se adapte a tu entorno.
LOGGER_LEVEL="off" | "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "all"

# Configura la conexión con la base de datos que mejor se adapte a tu entorno.
MONGO_USER='tstest'
MONGO_PASS='tstest'
MONGO_HOST='localhost'
MONGO_PORT='32023'
MONGO_DB='ts-course-test'

# Configura la encriptación que mejor se adapte a tu entorno.
BCRYPT_SALT=3

# Configura el token como mejor se adapte a tu entorno.
JWT_KEY='testingkey'
JWT_ALGORITHM='HS512'
JWT_EXPIRING_TIME_IN_SECONDS=60

# ⚠️ Sólo para ser incluidas en el archivo '.env.test'.
PLAIN_PASSWORD='123456'
WRONG_PASSWORD='wrongpassword'
# ⚠️ Sólo para ser incluidas en el archivo '.env.test'.

# El resto de variables irán aquí.
```

### <a id="repository-overview-architecture"></a>🏗 Arquitectura

Este repositorio está implementado siguiente la Arquitectura por Capas más sencilla, es decir, **dominio** e **infraestructure**

La estructura completa de directorios es la siguiente:

```
📂 src/
    📂 common/
    |   📂 errors/
    |   📂 logger/
    |   📂 utils/
    📂 domain/
    |   📂 models/
    |   📂 services/
    📂 infrastructure/
    |   📂 authentication/
    |   |   📂 token/
    |   📂 dataSources/
    |   📂 dtos/
    |   📂 mappers/
    |   📂 orm/
    |   |   📂 mongoose/
    |   📂 server/
    |   |   📂 apidoc/
    |   |   📂 middlewares/
    |   |   📂 routes/
    |   |   📂 serverDtos/
    |   📂 types/
    📂 test
        📂 fixtures
```

#### <a id="repository-overview-architecture-common"></a>🔄 common

En esta capa vamos a implementar el conjunto de elementos que son comunes al resto de la aplicación.

Los directorios que usamos en esta sección y su fucnión son los siguientes:

-   `errors`

    Este direcotrio contiene la comfiguración de la gestión de errores para toda la aplicación.

    En esta parte es donde está implementara el único código realizado con POO.

    Los errores están ordenado por funcionalidad. De esta manera, podemos encontrar los directorios específico para agruparlas por: autenticación, posts, usuarios y errores generales.

-   `logger`

    Aquí está la configuración de la herramienta de logging empleada en la aplicación.

-   `utils`

    No hay mucho más que contar sobre el objeto de este directorio 😅

#### <a id="repository-overview-architecture-domain"></a>🎯 domain

Esta capa también es conocida como `entities` o `core` en diferentes arquitecturas.

Esta capa tiene dos funciones principales:

1.  Definir la estructura de datos propia de la aplicación.

    Esto lo hace dentro del directorio `models` donde podemos encontrar varias definiciones acerca de cómo la aplicación maneja la información.

2.  Para implemenar la lógica de negocio espeífica y altamente acoplada a la propia aplicación.

    En este ejemplo tan básico de Arquitectura por Capas, la lógica de negocio está definida dentro de múltiples serivios agrupados por funcionalidad, dentro del directorio `services`.

    Una regla rápida para saber si un código pertenece a la capa `domain` es preguntarnos _"¿mi aplicación es la misma si saco este código del dominio?"_ Si la respuesta es **NO**, entonces ese código debe estar localizado dentro de la capa `domain`.

#### <a id="repository-overview-architecture-infrastructure"></a>🧩 infrastructure

En esta capa implementamos las herramientas necesarias que están fuertemente acoplada a cualquier tipo de tecnología.

La estrategia a seguir para esta capa es tener en mente que si durante el proceso de desarrollo o debido a refactorizaciones futuras, algún elemento de esta capa debe ser reemplazado por otro que proporcione las mismas funcionalidades, nuestra aplicación no debe verse afectada y si esto sucediera eventualmente, los efectos sobre nuestra aplicación serían relativamente insignificantes.

Para alcanzar este objetivo, esta capa se divide en diferentes secciones:

-   `authentication`

    Este directorio contine el sistema de gestión del token de usuario, que en este caso está basado en JWT.

-   `dataSources`

    Esta sección contiene todos los elemenos centrados en proporcionar la funcionalidad de almacenamiento y recuperación de datos.

    El objetivo del código incluido en este directorio es aislar el código del dominio, de las distintas herramientas de acceso a datos que podríamos tener implementadas en la aplicación.

    Una vez definido el contexto de este directorio, su contenido será invocado únicamente por los servicios del dominio.

    De la misma manrea, este códigio sólo invocará funciones definidas dentro de las diferentes implementaciones de las herramientas de acceso a datos.

    Dado que para esta aplicación estamos usando únicamente un ORM, todas las llamdas serán realizadas contra éste.

-   `dtos`

    Los múltiples proveedores de datos que podemos usar en nuestra aplicación, proporcinarán diferentes estructuras de datos.

    Necesitamos tener definidas esas estructuras para poder gestionar esa información.

    La gestión de la información será bidireccional. Esto significa que usaremos estas estructuras para recivir información de las fuentes de datos, así como para enviarla.

    Por esta razón implementamos el patrón DTO (Objeto de Transferencia de Datos).

-   `mappers`

    Cuando se necesita mover información desde la fuente de datos a la aplicación y viceversa, la estructura de datos debe adaptarse desde el DTO al modelo de datos (cuando la aplicación consume información), y desde el modelo de datos al DTO (cuando la aplciación genera información).

    Estas operaciones son realizada a través de funciones específicas, las cuales implementan el patrón `mapper`.

-   `orm`

    Obviamente este es el acceso directo a nuestra persistencia en la base de datos.

    En este caso, estamos utilizando MongoDB como motor de base de datos y Mogoose como ORM, así que toda su configuración y lógica de negocio está realizada en este directorio.

-   `server`

    Este directorio contiene la configuración íntegra de ExpressJS, incluyendo la definición de middlewares así como la documentación de la API.

-   `types`

    Este directorio está específicamente relacionado con el uso de TypeScript en este proyecto.

    En este caso, el directorio `types`, el cual contiene diferentes definiciones de tipos e interfaces, está definido dentro de la capa de infraestructura porque contiene estructuras de datos que sólo son utilizadas en esta capa.

    Si hubiese otros tipos e interfaces definiros que fuese usados en diferentes capas, sería posible crear un nuevo directorio `types` en un nivel supreios, por ejemplo, dentro del directorio `common`.

#### <a id="repository-overview-architecture-test"></a>🧪 test

La estrategia de testing seleccionada en este repositorio, para ambos casos, tests unitarios y de integración, es mantenerlos tan cerca como sea posible del códigio que intentan comprobar.

Por esta razón verás que hay varios directorios `test` dentro de las diferentes secciones de este repositorio.

Webpack está configurado para ignorar estos archivos cuando el códigio es compilado para producción.

Una vez dicho esto, el contenido de este directorio es un conjunto de herramientas comunes usadas a lo largo de todo el código y la parte principal está compuesta por las `fixtures` que nos permiten emular condiciones de funcionamiento reales.

### <a id="repository-overview-environments"></a>🛠 Entornos de ejecución

Mientras creamos una nueva aplicación, normalmente neceistamos un mínimo de dos entornos: `test` y `development`.

Ambos entornos requiren configuraciones específica así como definiciones de la base de datos.

El primer requisito está cubierto por el archivo `.env` específico que configuramos para cada caso.

El segundo está satisfecho en esta caso, por la configuración de diferentes contenedores Docker que se ejecutan en paralelo al códigio. Esto significa que los scripts de sistema (definidos en el archivo `package.json`), están creados para ejecutar la base de datos de `test` o de `development`, dependiendo del entorno que estemos levantando.

Ambos entornos están configurados para que se ejecuten independientemente así que podemos usar ambos al mismo tiempo.

## <a id="commands"></a>🔥 Listado de comandos

### <a id="commands-switch-node"></a>✅ Cambiando la versión de NodeJS

```sh
nvm use
```

### <a id="commands-installation"></a>⬇️ Proceso de instalación de módulos

```sh
npm i
```

### <a id="commands-tests"></a>🧪 Ejecución de los tests

**Archivos requeridos:**

-   `env/.env.test`

```sh
# Tests unitarios y de integración.
npm test
# Tests en modo interactivo.
npm run test:watch
# Cobertura de tests.
npm run test:coverage
```

### <a id="commands-dev-mode"></a>🏭 Ejecución de la aplicación en modo desarrollo

**Archivos requeridos:**

-   `env/.env.dev`

```sh
npm run build:dev
```

### <a id="commands-pro-mode"></a>🚀 Compilación de la aplicación

**Archivos requeridos:**

-   `env/.env`

```sh
npm run build:pro
```

Una vez se haya completado este proceos, el código comprimido estará disponible para ser icluído en la imagen de Docker, desde el directorio `dist`.

## <a id="apidoc"></a>📗 Documentación de la API REST

`http://localhost:3600/__/apidoc`

El puerto de acceso debe ser definido en las variables de entorno. Echa un vistazo a la sección [**variables de entorno**](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md#repository-overview-environment-variables).

## <a id="credits-and-thanks"></a>🙏 Reconocimientos y agradecimientos

Gracias al creador del contenido original:

-   [Classsed](https://www.youtube.com/c/classsed) autor original.
-   [freecodecamp.org](https://www.freecodecamp.org/) publicación del contenido.

Muchísimas gracias por el incalculable apoyo prestado por:

-   [Lissette Luis](https://www.linkedin.com/in/lissetteibnz/)
-   [Iván B. Trujillo](https://www.linkedin.com/in/ivanbtrujillo/)
-   [Adrián Ferrera](https://www.linkedin.com/in/afergon/)
-   [Iru Hernández](https://www.linkedin.com/in/iru-hernandez/)

## <a id="todo-list"></a>📝 TODO list

-   Incluir la configuración para 'producción' para compilar y generar el conenedor de Docker listo para ser desplegado.
-   Incluir peticiones de testing a la API basadas en Postman.
-   Incluir peticiones de testing a la API basadas en Insomnia.
-   Incluir el archivo `manifest.json`.
-   ✅ Incluir [Joi](https://joi.dev/).
-   ✅ Incluir [Husky v5](https://github.com/typicode/husky).
-   ✅ Incluir [Helmet](https://github.com/helmetjs/helmet).

## <a id="research-list"></a>🔬 Elementos a investigar

-   Investigar el uso de [esbuild-loader](https://github.com/privatenumber/esbuild-loader).
-   Investigar los beneficios de usar [Estrella](https://github.com/rsms/estrella) como herramienta de compilación.

# TypeScript training course - Backend

<img src="https://img.shields.io/badge/Version-1.0.0-yellow" /> <img src="https://img.shields.io/badge/TypeScript-4.1.2-blue" /> <img src="https://img.shields.io/badge/Webpack-5.6.0-blue" /> <img src="https://img.shields.io/badge/Jest-26.6.3-green" /> <img src="https://img.shields.io/badge/openApi-4.1.5-green" /> <img src="https://img.shields.io/badge/Docker-20.10.2-blue" />

[🇪🇸 Version](https://github.com/ddialar/typescript.workshop.backend/blob/master/docs/README_ES.md)

## 📖 Index

-   [Description](https://github.com/ddialar/typescript.workshop.backend#description)
-   [System requirements](https://github.com/ddialar/typescript.workshop.backend#requirements)
-   [Repository overview](https://github.com/ddialar/typescript.workshop.backend#repository-overview)
    -   [Environment variables](https://github.com/ddialar/typescript.workshop.backend#repository-overview-environment-variables)
    -   [Architecture](https://github.com/ddialar/typescript.workshop.backend#repository-overview-architecture)
        -   [common](https://github.com/ddialar/typescript.workshop.backend#repository-overview-architecture-common)
        -   [domain](https://github.com/ddialar/typescript.workshop.backend#repository-overview-architecture-domain)
        -   [infrastructure](https://github.com/ddialar/typescript.workshop.backend#repository-overview-architecture-infrastructure)
        -   [test](https://github.com/ddialar/typescript.workshop.backend#repository-overview-architecture-test)
    -   [Execution environments](https://github.com/ddialar/typescript.workshop.backend#repository-overview-environments)
-   [Commands guide](https://github.com/ddialar/typescript.workshop.backend#commands)
    -   [Switch Node version](https://github.com/ddialar/typescript.workshop.backend#commands-switch-node)
    -   [Modules installation process](https://github.com/ddialar/typescript.workshop.backend#commands-installation)
    -   [Run tests](https://github.com/ddialar/typescript.workshop.backend#commands-tests)
    -   [Run development mode](https://github.com/ddialar/typescript.workshop.backend#commands-dev-mode)
    -   [Build application](https://github.com/ddialar/typescript.workshop.backend#commands-pro-mode)
-   [API REST documentation](https://github.com/ddialar/typescript.workshop.backend#apidoc)
-   [Credits and thanks](https://github.com/ddialar/typescript.workshop.backend#credits-and-thanks)
-   [TODO list](https://github.com/ddialar/typescript.workshop.backend#todo-list)
-   [Researching list](https://github.com/ddialar/typescript.workshop.backend#research-list)
-   [Technical debt](https://github.com/ddialar/typescript.workshop.backend#tech-debt)

## <a id="description"></a>🔍 Description

This repository is aimed to provide the backend support for the TypeScript training course which it belongs to.

In this case, we are implementing the backend side of a social media application that allows to register new users and authenticate them, create and delete posts, create and delete comments on posts and like/dislike posts.

The original idea of this application is taken by this really interesting workshop named [Build a Social Media App (MERNG stack)](https://morioh.com/p/07b0be424b5f?f=5ece1a68f0e6056e36305f65), created by [Classsed](https://www.youtube.com/c/classsed) and published by [freecodecamp.org](https://www.freecodecamp.org/).

In opposite to the original version, this code implements an API REST in order to access the backend features.

Most part of this code is created following the **functional programming** paradigm meanwhile OOP has been used only to create the error objects whose will be triggered when an exception appears.

Some tools used on this repository are next:

-   📦 `Webpack` for transpiling and bundling the TypeScript code.
-   🔒 `JWT` as token service.
-   ⚙️ `dotenv` for environment variables.
-   📝 `Swagger` for API REST documentation.
-   💾 `Log4JS` for logging tasks.
-   ✅ `Joi` for validating input data.
-   🧪 `Jest` for unit testing, as well as `supertest` for API enpoints integration tests.
-   🔍 `ESLint` for code linting and formating.
-   🐶 `Husky` for managing the Git Hooks.
-   🐳 `Docker` for container image management.
-   🌱 `MongoDB` as database engine.

Therefore this repository is defined to work with `NodeJS 14.15.0 LTS`.

If you are running differente versions of NodeJS in your system, just run `nvm use` and it will be switched to the version defined in the `.nvmrc` file.

## <a id="requirements"></a>💻 System requirements

To run this code in your system, it must satisfy the next minimum requirements:

-   NodeJS 14.15.0
-   npm 6.14.11
-   npx 6.14.11
-   Docker 20.10.2
-   docker-compose 1.27.4

In addition, it's advisable to have next:

-   nvm 0.33.0
-   Web browser (recomended Google Chrome 88.0)
-   Database UI tool (recomended Robo 3T 1.4.1)
-   Code editor (recomended VScode 1.52.1)

## <a id="repository-overview"></a>👀 Repository overview

### <a id="repository-overview-environment-variables"></a>⚙️ Environment variables

Due to we have selected `dotenv` as environmet variables handler, in the root of the project will be a folder named [`env`](https://github.com/ddialar/typescript.workshop.backend/blob/master/env).

In this folder you have to define a minimum of three differente environment files:

-   `.env` for production.
-   `.env.dev` for development.
-   `.env.test` for testing.

Feel free to remove some of them or including additional ones depending on your application needs. Just keep in mind that you will have to update and set up the Webpack configuration based on the environment you are going to be working on.

The different scripts created for running the application in every environment are prepared to load the configuration and applying it to the code.

For production purpouses, Webpack is already configuered in order to record that information into the final bundled file so we don't need to think about providing environment configurations to the application image.

The most basic fields we must include on these files are next:

```sh
NODE_ENV="production" | "development" | "test"

# Set the port number that best matches for your environment.
SERVER_PORT=4000

# Set the logging level that best matches for your environment.
LOGGER_LEVEL="off" | "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "all"

# Set the database configuration that best matches for your environment.
MONGO_USER='tstest'
MONGO_PASS='tstest'
MONGO_HOST='localhost'
MONGO_PORT='32023'
MONGO_DB='ts-course-test'

# Set the encryption configuration that best matches for your environment.
BCRYPT_SALT=3

# Set the token configuration that best matches for your environment.
JWT_KEY='testingkey'
JWT_ALGORITHM='HS512'
JWT_EXPIRING_TIME_IN_SECONDS=60

# ⚠️ Just for being includedn into '.env.test' file
PLAIN_PASSWORD='123456'
WRONG_PASSWORD='wrongpassword'
# ⚠️ Just for being includedn into '.env.test' file

# Rest of the environment variables here.
```

### <a id="repository-overview-architecture"></a>🏗 Architecture

This repository is implemented following the most basic Layered Architecture, it means, **domain** and **infrastructure**.

The full folders structure is next:

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

On this layer we implement the set of elements that are horizontaly common to the whole application.

The folders used in this section and their targets are next:

-   `errors`

    This folder contains the error handling configuration for the whole application.

    In this part is where there is implemented the only OOP part of the code.

    The errors are sorted by functionality. This way, we can find the specific folders in order to group: authentication, posts, users and common errors.

-   `logger`

    Here is configured the logging tool used in the application.

-   `utils`

    There is not much more to talk about it 😅

#### <a id="repository-overview-architecture-domain"></a>🎯 domain

This layer is also known as `entities` or `core` in different architecture approaches.

This layer has two main goals:

1.  To define application own data structures.

    It's done into the `models` folder where we can find several definitions about how our application manages the information.

2.  To implement specific business logic strongly bound with the application use.

    On this so basic example of layered architecture, the business logic is defined into multiple services grouped by functionality, into the `services` folder.

    A quick rule to know whether a pice of code belongs to the `domain` layer is to ask ourself _"my application is the same if I extract this code from the domain?"_ If the answer is **NO**, then this code must be placed into the `domain` layer.

#### <a id="repository-overview-architecture-infrastructure"></a>🧩 infrastructure

On this layer we implement the needed tools strongly coupled for any kind of technology.

The strategy to follow for this layer is to keep in mind that if during the development process or for future refactors, some element in this layer must be replaced by another one that provides the same or better results, our application can not be affected and even whether it happens, the side effects in our application are really shallow.

To reach that goal, the code included into this layer is divided like that:

-   `authentication`

    This folder contains the user token management system that in this case is based on JWT.

-   `dataSources`

    This section contains the whole elements focused on provide a successful application data persistance and retrieving.

    The target of the code included into this folder is to isolate the domain code from the different data access tools that we could have implemented in our application.

    Once exposed the context of this folder content, it will be invoked only by domain services.

    In the same way, this code will only invoke functions defined into the differente data access tools.

    Due to for this application we are using only a single ORM, the whole calls will be done against it.

-   `dtos`

    The multiple data providers that we can use in our application, will provide different data structures.

    We need to have defined those structure in order to handler that information.

    That information management is bidirectional. It means that we will use those structures in order to receive information from the data sources as well as to send data to them.

    By this reason we implement the DTO (Data Transfer Object) pattern.

-   `mappers`

    When it's needed to move data from the data sources to the application and viceversa, the data structure must be parsed from DTO to Data Model (when our application consumes data) and from Data Model to DTO (when our application generates data).

    These operations are performed via specific functions whose implement the `mapper` pattern.

-   `orm`

    This is obviously the direct access to our data persisted in databases.

    On this case, we are using MongoDB as database engine as well as Mongoose as ORM, so its whole configuration and business logic definition will be done on this folder.

-   `server`

    This folder contains the complete ExpressJS configuration, including middlewares definitions and API documentation.

-   `types`

    This folder is specifically bound to the use of TypeScript on this project.

    On this case, the `types` folder, which contains different types and interfaces definitions, is defined into the `infrastructure` layer because it contains only data structures used on this layer.

    If there were other types and interfaces definitions that were used in differente layers, it would be possible to create a new `types` folder into an upper level, for example, into the `common` folder.

#### <a id="repository-overview-architecture-test"></a>🧪 test

The testing strategy selected in this repository, for both cases for unit and integration tests, is to keep them as close as possible to the code that they are checking.

By this reason, you will find several `test` folders into the different sections of this code.

Webpack is already configured to ignore these files when the code is compiled for production environment.

Once said that, the content of this folder is a set of common tools user along the whole code and the main part are the fixtures used in order to emulate the real running conditions.

### <a id="repository-overview-environments"></a>🛠 Execution environments

Meanwhile we create a new application, we usually need a minimum of two environment: `testing` and `development`.

Both environment require specific configurations as well as database presets.

The first requirement is covered by the specific `.env` files that we configure for every case.

The second one is satisfied in this case by the configuration of different Docker containers that are executed in parallel with the code. It means that the system scrips (defined into the `package.json` file), are created in order to execute the `testing` or `development` database container, depending on the environment we are running.

Both environments are configured in order to be run independently so we can have both up at the same time.

## <a id="commands"></a>🔥 Commands guide

### <a id="commands-switch-node"></a>✅ Switch Node version

```sh
nvm use
```

### <a id="commands-installation"></a>⬇️ Modules installation process

```sh
npm i
```

### <a id="commands-tests"></a>🧪 Run tests

**Required files:**

-   `env/.env.test`

```sh
# Unit and integration tests.
npm test
# Watch mode.
npm run test:watch
# Coverage.
npm run test:coverage
```

### <a id="commands-dev-mode"></a>🏭 Run application in development mode

**Required files:**

-   `env/.env.dev`

```sh
npm run build:dev
```

### <a id="commands-pro-mode"></a>🚀 Build application

**Required files:**

-   `env/.env`

```sh
npm run build:pro
```

Once this process is completed, the bundled code is avilable to be included from the `dist` folder, into the Docker image.

## <a id="apidoc"></a>📗 API REST documentation

`http://localhost:3600/__/apidoc`

The access port must be defined in the environment variables. Take a look to the [**environment variables**](https://github.com/ddialar/typescript.workshop.backend#repository-overview-environment-variables) section.

## <a id="credits-and-thanks"></a>🙏 Credits and thanks

Thank you so much to the content creator:

-   [Classsed](https://www.youtube.com/c/classsed) as original author.
-   [freecodecamp.org](https://www.freecodecamp.org/) as content publisher.

Thanks a lot for a so incredible support to:

-   [Lissette Luis](https://www.linkedin.com/in/lissetteibnz/)
-   [Iván B. Trujillo](https://www.linkedin.com/in/ivanbtrujillo/)
-   [Adrián Ferrera](https://www.linkedin.com/in/afergon/)
-   [Iru Hernández](https://www.linkedin.com/in/iru-hernandez/)

## <a id="todo-list"></a>📝 TODO list

-   Replace [Husky v5](https://github.com/typicode/husky) by [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks).
-   Include production configuration to compile and generate Docker container ready to deploy.
-   Include Postman requests to test the API.
-   Include Insomnia requests to test the API.
-   Include the `manifest.json` file.

## <a id="research-list"></a>🔬 Researching list

-   Investigate the use of [esbuild-loader](https://github.com/privatenumber/esbuild-loader).
-   Investigate the profits of using [Estrella](https://github.com/rsms/estrella) as building tool.

## <a id="tech-debt"></a>🤔 Technical debt

Please, check the [TECH-DEBT.md](https://github.com/ddialar/typescript.workshop.backend/blob/master/TECH-DEBT.md) file in this repository in order to keep up-to-date about this repository technical debt.

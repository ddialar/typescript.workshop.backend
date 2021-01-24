# Environment configuration

## ⚠️ WARNING ⚠️

**THESE FILES MUST NEVER BEEN PUSHED TO ANY KIND OF REPOSITORY DUE TO THEY CAN CONTAIN SENSIBLE INFORATION FOR YOUR PROJECT**

In oreder to work with this project, you are going to need to define tree differente environment files:

-   `.env` for production/deployment code.
-   `.env.dev` for development tasks.
-   `.env.test` for testing tasks.

The basic content of these files must be like the next examples:

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

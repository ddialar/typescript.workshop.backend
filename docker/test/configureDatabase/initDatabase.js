const DATABASE_NAME = 'ts-course-test';

const apiDatabases = [
  {
    dbName: DATABASE_NAME,
    dbUsers: [
      {
        username: 'tstest',
        password: 'tstest',
        roles: [
          {
            role: 'readWrite',
            db: DATABASE_NAME,
          }
        ]
      }
    ],
    dbData: []
  }
]

const createDatabaseUsers = (db, dbName, users) => {
  users.map(({ username, password, roles }) => {
    print(`[TRACE] Creating new user '${username}' into the '${dbName}' database...`)

    db.createUser({
      user: username,
      pwd: password,
      roles
    })

    print(`[INFO ] The user '${username}' has been created successfully.`)
  })
}

try {
  apiDatabases.map(({ dbName, dbUsers }) => {
    db = db.getSiblingDB(dbName)

    print(`[TRACE] Switching to '${dbName}' database...`)
    createDatabaseUsers(db, dbName, dbUsers)
  })
} catch ({ message }) {
  print(`[ERROR ] ${message}`)
}

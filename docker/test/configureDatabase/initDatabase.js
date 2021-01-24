const apiDatabases = [
  {
    dbName: 'ts-course-test',
    dbUsers: [
      {
        username: 'tstest',
        password: 'tstest',
        roles: ['readWrite', 'dbAdmin']
      }
    ],
    dbData: []
  }
]

const createDatabaseUsers = (db, dbName, users) => {
  users.map((dbUserData) => {
    print(`[TRACE] Creating new user '${dbUserData.username}' into the '${dbName}' database...`)

    const roles = dbUserData.roles.reduce((previousValue, role) => {
      const roleDefinition = {
        role,
        db: dbName
      }

      previousValue.push(roleDefinition)
      return previousValue
    }, [])

    db.createUser({
      user: dbUserData.username,
      pwd: dbUserData.password,
      roles
    })

    print(`[INFO ] The user '${dbUserData.username}' has been created successfully.`)
  })
}

try {
  apiDatabases.map((database) => {
    const { dbName, dbUsers } = database

    db = db.getSiblingDB(dbName)

    print(`[TRACE] Switching to '${dbName}' database...`)
    createDatabaseUsers(db, dbName, dbUsers)
  })
} catch ({ message }) {
  print(`[ERROR ] ${message}`)
}

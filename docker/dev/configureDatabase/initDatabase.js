load('/docker-entrypoint-initdb.d/usersDataToBePersisted.js')
load('/docker-entrypoint-initdb.d/postsDataToBePersisted.js')

const apiDatabases = [
  {
    dbName: 'ts-course-dev',
    dbUsers: [
      {
        username: 'tsdev',
        password: 'tsdev',
        roles: ['readWrite', 'dbAdmin']
      }
    ],
    dbData: [
      {
        collection: 'users',
        data: usersDataToBePersisted
      },
      {
        collection: 'posts',
        data: postsDataToBePersisted
      }
    ]
  }
]

const collections = {
  users: (db, userData) => db.users.insert(userData),
  posts: (db, postData) => db.posts.insert(postData)
}

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

const populateDatabase = (db, data) => {
  if (data !== null && data.length > 0) {
    data.map((setOfData) => {
      print(`[TRACE] Persisting data of collection '${setOfData.collection}'...`)
      setOfData.data.map((document) => collections[setOfData.collection](db, document))
    })
  }
}

try {
  apiDatabases.map((database) => {
    const { dbName, dbUsers, dbData } = database

    db = db.getSiblingDB(dbName)

    print(`[TRACE] Switching to '${dbName}' database...`)
    createDatabaseUsers(db, dbName, dbUsers)
    populateDatabase(db, dbData)
  })
} catch ({ message }) {
  print(`[ERROR ] ${message}`)
}

load('/docker-entrypoint-initdb.d/usersDataToBePersisted.js')
load('/docker-entrypoint-initdb.d/postsDataToBePersisted.js')

const DATABASE_NAME = 'ts-course-dev';

const apiDatabases = [
  {
    dbName: DATABASE_NAME,
    dbUsers: [
      {
        username: 'tsdev',
        password: 'tsdev',
        roles: [
          {
            role: 'readWrite',
            db: DATABASE_NAME,
          }
        ]
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

const populateDatabase = (db, data) => {
  if (data !== null && data.length > 0) {
    data.map((setOfData) => {
      print(`[TRACE] Persisting data of collection '${setOfData.collection}'...`)
      setOfData.data.map((document) => collections[setOfData.collection](db, document))
    })
  }
}

try {
  apiDatabases.map(({ dbName, dbUsers, dbData }) => {
    db = db.getSiblingDB(dbName)

    print(`[TRACE] Switching to '${dbName}' database...`)
    createDatabaseUsers(db, dbName, dbUsers)
    populateDatabase(db, dbData)
  })
} catch ({ message }) {
  print(`[ERROR ] ${message}`)
}

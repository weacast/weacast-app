const NeDB = require('nedb')
const path = require('path')
const levelup = require('levelup')
const leveldown = require('leveldown')
const sublevel = require('sublevelup')

export class Database {
  constructor(app) {
    this._adapter = app.get('db').adapter
  }

  get adapter() {
    return this._adapter
  }

  static create(app) {
    switch (app.get('db').adapter) {
      case 'levelup':
        return new LevelupDatabase(app)
      case 'nedb':
      default:
        return new NeDatabase(app)
    }
  }
}

export class LevelupDatabase extends Database {
  constructor(app) {
    super(app)
    this._db = sublevel(levelup(path, {
      valueEncoding: 'json',
      db: leveldown
    }))
  }

  collection(name) {
    // Initializes the `collection` on sublevel `collection`
    return this._db.sublevel(name)
  }
}

export class NeDatabase extends Database {
  constructor(app) {
    super(app)
    this._path = app.get('db').path
  }

  collection(name) {
    // Initializes the `collection` on file `collection`
    return new NeDB({
      filename: path.join(this._path, name + '.db'),
      autoload: true
    })
  }
}


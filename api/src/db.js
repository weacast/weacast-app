import NeDB from 'nedb'
import path from 'path'
import levelup from 'levelup'
import leveldown from 'leveldown'
import sublevel from 'sublevelup'
import mongodb from 'mongodb'
import errors from 'feathers-errors'

export class Database {
  constructor(app) {
    try {
      this._adapter = app.get('db').adapter
    }
    catch (error) {
      throw new errors.GeneralError('Cannot find database adapter configuration in application')
    }
    this._collections = new Map
  }

  get adapter() {
    return this._adapter
  }

  async connect() {
    // Default implementation
    return null
  }

  static create(app) {
    switch (app.get('db').adapter) {
      case 'levelup':
        return new LevelupDatabase(app)
      case 'mongodb':
        return new MongoDatabase(app)
      case 'nedb':
      default:
        return new NeDatabase(app)
    }
  }
}

export class LevelupDatabase extends Database {
  constructor(app) {
    super(app)
    try {
      this._db = sublevel(levelup(app.get('db').path, {
        valueEncoding: 'json',
        db: leveldown
      }))
    }
    catch (error) {
      throw new errors.GeneralError('Cannot find database path configuration in application')
    }
  }

  async connect() {
    return this._db
  }

  collection(name) {
    // Initializes the `collection` on sublevel `collection`
    if (!this._collections.has(name)) {
      this._collections.set(name, this._db.sublevel(name))
    }
    return this._collections.get(name)
  }
}

export class NeDatabase extends Database {
  constructor(app) {
    super(app)
    try {
      this._path = app.get('db').path
    }
    catch (error) {
      throw new errors.GeneralError('Cannot find database path configuration in application')
    }
  }

  async connect() {
    return null
  }

  collection(name) {
    // Initializes the `collection` on file `collection`
    if (!this._collections.has(name)) {
      this._collections.set(name, new NeDB({
        filename: path.join(this._path, name + '.db'),
        autoload: true
      }))
    }
    return this._collections.get(name)
  }
}

export class MongoDatabase extends Database {
  constructor(app) {
    super(app)
    try {
      this._dbUrl = app.get('db').url
    }
    catch (error) {
      throw new errors.GeneralError('Cannot find database connection URL in application')
    }
  }

  async connect() {
    try {
      this._db = await mongodb.connect(this._dbUrl)
    }
    catch (error) {
      logger.error('Could not connect to ' + this.app.get('db').adapter + ' database, please check your configuration')
    }
  }

  collection(name) {
    // Initializes the `collection` on sublevel `collection`
    if (!this._collections.has(name)) {
      this._collections.set(name, this._db.collection(name))
    }
    return this._collections.get(name)
  }
}
import NeDB from 'nedb'
import path from 'path'
import levelup from 'levelup'
import leveldown from 'leveldown'
import sublevel from 'sublevelup'
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


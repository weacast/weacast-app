import fs from 'fs-extra'
import path from 'path'
import logger from 'winston'
import { Server } from './server'

// This will ensure the log directory does exist
fs.ensureDirSync(path.join(__dirname, '..', 'logs'))

let server = new Server()

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.run().then(_ => {
  logger.info('Server started listening')
})

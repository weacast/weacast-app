import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import { Server } from '../src/server'

describe('weacast', () => {
  let server

  before(() => {
    chailint(chai, util)

    server = new Server()
    return server.run()
  })

  it('is CommonJS compatible', () => {
    expect(typeof Server).to.equal('function')
  })

  it('registers the users service', () => {
    let service = server.app.getService('users')
    expect(service).toExist()
  })
})

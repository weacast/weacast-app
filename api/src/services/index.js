import { Service } from '../service'

module.exports = function() {
  const app = this; // eslint-disable-line no-unused-vars

  const users = new Service('users', app)
  const forecasts = new Service('forecasts', app)
};

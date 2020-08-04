const messages = require('./messages.controller');
module.exports = {
  findAll: (table, req, res) => {
    table.findAll()
      .then((result) => messages.success(result, res))
      .catch((error) => messages.error(error, res))
  },
  find: (table, req, res) => {
    table.findByPk(req.params.id)
      .then((result) => messages.success(result, res))
      .catch((error) => messages.error(error, res))
  },
  create: (table, req, res) => {
    table.create(req.body)
      .then((result) => messages.success(result, res))
      .catch((error) => messages.error(error, res))
  },
  update: (table, req, res) => {
    table.update(req.body,
      {
        where: {
          id: req.params.id
        }
      }).then((result) => messages.success(result, res))
      .catch((error) => messages.error(error, res))
  },
  delete: (table, req, res) => {
    console.log(req.params);
    table.destroy({
      where: {
        id: req.params.id
      }
    })
      .then((result) => messages.success(result, res))
      .catch((error) => messages.error(error, res))
  }
}
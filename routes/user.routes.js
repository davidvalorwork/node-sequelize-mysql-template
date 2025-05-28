// routes/user.routes.js
const userController = require('../controllers/user.controller');

module.exports = (router, db) => {
    router.get('/users', (req, res) => userController.listUsers(req, res, db));
    router.get('/users/:id', (req, res) => userController.getUserById(req, res, db));
    router.put('/users/:id', (req, res) => userController.updateUser(req, res, db));
    router.delete('/users/:id', (req, res) => userController.deleteUser(req, res, db));
};

// routes/auth.routes.js
const authLogin = require('../controllers/auth/login.controller');
const authRegistro = require('../controllers/auth/registro.controller');
const route = "/auth"; // This defines the base path for these routes

module.exports = (app, db) => {
    // Mounts POST /auth/login
    app.post(`${route}/login`, (req, res) => authLogin.login(req, res, db));

    // Mounts POST /auth/registro
    app.post(`${route}/registro`, (req, res) => authRegistro.registro(req, res, db));
};

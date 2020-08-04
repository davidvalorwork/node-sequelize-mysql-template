const authLogin = require('../controllers/auth/login.controller');
const authRegistro = require('../controllers/auth/registro.controller');
const route = "/auth";
module.exports = (app,db) => {
    app.post(`${route}/login`,(req,res)=>authLogin.login(req,res,db));
    app.post(`${route}/registro`,(req,res)=>authRegistro.registro(req,res,db));
}
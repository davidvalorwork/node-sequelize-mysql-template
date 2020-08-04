
const express = require("express"),
      jwt = require('jsonwebtoken'),
      config = require('./config/config'),
      db = require("./models"),
      api = require('./routes/index.routes'),
      init = require("./controllers/default/init.controller"),
      app = express(),
      jwtMiddleware = require("./middlewares/jwt");

app.set('llave', config.llave);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("app/public"));

const protegerRutas = jwtMiddleware.protegerRutas(app,express,jwt);
api(app,db,protegerRutas);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

db.sequelize.sync().then(() => {
  app.listen(3001, () => console.log("¡API escuchando en el puerto 3001!"));
  init.verificar(db);
});


const auth = require('./auth.routes');
module.exports = (app,db,protegerRutas) => {
    auth(app,db);
}
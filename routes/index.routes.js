// routes/index.routes.js
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes'); // New user routes

module.exports = (app, db, protectedRouter) => {
    authRoutes(app, db); 
    userRoutes(protectedRouter, db);
    app.use('/api', protectedRouter);
};

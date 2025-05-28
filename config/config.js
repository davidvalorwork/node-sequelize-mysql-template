// config/config.js
module.exports = {
    llave: "miclavejsonwebtokensecreta123*", // Default secret key for JWT
    // Other configurations can be added here
    // e.g., database connection details, port, etc.
    database: {
        host: 'localhost',
        port: 3306,
        username: 'user',
        password: 'password',
        db: 'database_name'
    },
    serverPort: 3000
};

const messages = require('../default/messages.controller');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config'); // Path to config file

module.exports = {
    login: async (req, res, db) => {
        try {
            // Ensure body.correo and body.clave are provided
            if (!req.body.correo || !req.body.clave) {
                return messages.error({ message: 'Correo y clave son requeridos.', status: 400 }, res);
            }

            const result = await db.usuarios.findAll({ where: { correo: req.body.correo, borrado: 0 } });
            if (result.length !== 0) {
                if (bcrypt.compareSync(req.body.clave, result[0].dataValues.clave)) {
                    const payload = {
                        check: true, // Original payload structure
                        id_usuarios: result[0].dataValues.id_usuarios,
                        tipo_usuario: result[0].dataValues.tiposUsuarioIdTiposUsuarios // Name of the foreign key in usuarios table
                    };
                    const token = jwt.sign(payload, config.llave); // Using 'llave' from config object
                    messages.success({ msj: 'Credenciales Validas', token: token, tipo_usuario: result[0].dataValues.tiposUsuarioIdTiposUsuarios }, res);
                } else {
                    messages.error({ message: 'Credenciales Invalidas', status: 401 }, res);
                }
            } else {
                messages.error({ message: 'Usuario no encontrado', status: 404 }, res);
            }
        } catch (err) {
            console.error("Login error:", err); // Log the actual error on the server
            messages.error({ message: "Error interno del servidor durante el login.", status: 500 }, res);
        }
    }
};

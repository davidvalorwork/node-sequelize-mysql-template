const messages = require('../default/messages.controller');
const bcrypt = require('bcrypt-nodejs');

module.exports = {
    registro: async (req, res, db) => {
        try {
            const body = req.body;
            // Basic validation for required fields for registration
            if (!body.correo || !body.clave || !body.usuario || !body.nombres || !body.apellidos || !body.tipo_usuario) {
                 return messages.error({ message: 'Campos requeridos faltantes (correo, clave, usuario, nombres, apellidos, tipo_usuario).', status: 400 }, res);
            }

            const salt = bcrypt.genSaltSync(10);
            const claveEncriptada = bcrypt.hashSync(body.clave, salt);
            
            const usuario = {
                usuario: body.usuario,
                clave: claveEncriptada,
                nombres: body.nombres,
                apellidos: body.apellidos,
                rut: body.rut, // Optional based on original structure
                telefono: body.telefono, // Optional
                correo: body.correo,
                razon_social: body.razon_social, // Optional
                giro: body.giro, // Optional
                nombre_fantasia: body.nombre_fantasia, // Optional
                tiposUsuarioIdTiposUsuarios: body.tipo_usuario, // Foreign key
                borrado: 0
            };
            const result = await db.usuarios.create(usuario);
            // Exclude password from the response
            const { clave, ...userSinClave } = result.get({ plain: true });
            messages.success(userSinClave, res, 201); // Send 201 Created status
        } catch (err) {
            console.error("Registration error:", err); // Log the actual error
            if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
                messages.error({ message: "Error de validación o datos duplicados.", errors: err.errors.map(e => e.message), status: 400 }, res);
            } else {
                messages.error({ message: "Error interno del servidor durante el registro.", status: 500 }, res);
            }
        }
    }
};

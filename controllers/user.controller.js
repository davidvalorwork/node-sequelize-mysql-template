// controllers/user.controller.js
const messages = require('./default/messages.controller');
const { Op } = require('sequelize');

module.exports = {
    listUsers: async (req, res, db) => {
        try {
            const users = await db.usuarios.findAll({
                where: { borrado: 0 },
                attributes: { exclude: ['clave'] }
            });
            messages.success(users, res);
        } catch (error) {
            messages.error(error, res);
        }
    },
    getUserById: async (req, res, db) => {
        const userId = req.params.id;
        try {
            const user = await db.usuarios.findOne({
                where: { id_usuarios: userId, borrado: 0 },
                attributes: { exclude: ['clave'] }
            });
            if (user) {
                messages.success(user, res);
            } else {
                // Assuming messages.error can take an object like this
                // If not, it might need adjustment based on messages.controller's capabilities
                if (typeof messages.error === 'function' && messages.error.length === 2) { // (err, res)
                     messages.error({ message: 'Usuario no encontrado o ha sido eliminado.', status: 404 }, res);
                } else { // Fallback or different structure if messages.error is different
                     res.status(404).json({ message: 'Usuario no encontrado o ha sido eliminado.' });
                }
            }
        } catch (error) {
             if (typeof messages.error === 'function' && messages.error.length === 2) {
                messages.error(error, res);
             } else {
                res.status(500).json({ message: 'Error interno del servidor.' });
             }
        }
    },
    updateUser: async (req, res, db) => {
        const userId = req.params.id;
        const { clave, borrado, id_usuarios, ...updateData } = req.body;
        try {
            const user = await db.usuarios.findOne({
                where: { id_usuarios: userId, borrado: 0 }
            });
            if (!user) {
                if (typeof messages.error === 'function' && messages.error.length === 2) {
                    return messages.error({ message: 'Usuario no encontrado o ha sido eliminado.', status: 404 }, res);
                } else {
                    return res.status(404).json({ message: 'Usuario no encontrado o ha sido eliminado.' });
                }
            }
            await user.update(updateData);
            const updatedUser = await db.usuarios.findOne({
                where: { id_usuarios: userId },
                attributes: { exclude: ['clave'] }
            });
            messages.success(updatedUser, res);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                if (typeof messages.error === 'function' && messages.error.length === 2) {
                    return messages.error({ status: 400, message: "Error de validación", errors: error.errors.map(e => e.message) }, res);
                } else {
                     return res.status(400).json({ message: "Error de validación", errors: error.errors.map(e => e.message) });
                }
            }
            if (typeof messages.error === 'function' && messages.error.length === 2) {
                messages.error(error, res);
            } else {
                res.status(500).json({ message: 'Error interno del servidor.' });
            }
        }
    },
    deleteUser: async (req, res, db) => {
        const userId = req.params.id;
        try {
            const user = await db.usuarios.findOne({
                where: { id_usuarios: userId, borrado: 0 }
            });
            if (!user) {
                 if (typeof messages.error === 'function' && messages.error.length === 2) {
                    return messages.error({ status: 404, message: 'Usuario no encontrado o ya ha sido eliminado.' }, res);
                } else {
                    return res.status(404).json({ message: 'Usuario no encontrado o ya ha sido eliminado.' });
                }
            }
            await user.update({ borrado: 1 });
            messages.success({ message: 'Usuario eliminado correctamente.' }, res);
        } catch (error) {
            if (typeof messages.error === 'function' && messages.error.length === 2) {
                messages.error(error, res);
            } else {
                res.status(500).json({ message: 'Error interno del servidor.' });
            }
        }
    }
};

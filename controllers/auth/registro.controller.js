const messages = require('../default/messages.controller');
const bcrypt = require('bcrypt-nodejs');
const salt = bcrypt.genSaltSync(10);

module.exports = {
    registro:(req,res,db)=>{
        req.body.clave = bcrypt.hashSync(req.body.clave,salt);
        const body = req.body;
        const usuario = {
            usuario: body.usuario,
            clave: body.clave,
            nombres: body.nombres,
            apellidos: body.apellidos,
            rut: body.rut,
            telefono: body.telefono,
            correo: body.correo,
            razon_social: body.razon_social,
            giro: body.giro,
            nombre_fantasia: body.nombre_fantasia,
            tiposUsuarioIdTiposUsuarios:body.tipo_usuario,
            borrado:0
        }
        db.usuarios.create(usuario)
            .then(result=> messages.success(result,res))
            .catch(err=>messages.error(err,res))
    }
}
module.exports = {
    verificar: async(db) => {
        const tipos_usuarios = await db.tipos_usuarios.findAll();
        tipos_usuarios.length===0?inicializar(db):null;
    }
}

const inicializar = (db) => {
    const tipo_usuario = {
        tipo_usuario:'Usuario',
        borrado:0
    }
    const tipo_admin = {
        tipo_usuario: 'Administrador',
        borrado:0
    }
    const usuario_admin={
        usuario: 'admin',
        clave: '$2a$10$a4JzBQ1c/VLBSLgdVJ3X9uo7/oUSFBvnycRiv4GQS1DppK1EGn7KK',
        correo: 'admin',
        tiposUsuarioIdTiposUsuarios:2,
        borrado:0
    }
    db.tipos_usuarios.create(tipo_usuario).then(result=>console.log("Tipo de usuario: Usuario. Insertado"))
        .catch(err=>console.log(err));
    db.tipos_usuarios.create(tipo_admin).then(result=>console.log("Tipo de usuario: Administrador. Insertado"))
        .catch(err=>console.log(err));
    db.usuarios.create(usuario_admin).then(result=>console.log("Usuario admin 12345678 insertado."))
        .catch(err=>console.log(err));
}
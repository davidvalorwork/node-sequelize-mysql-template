module.exports = (sequelize, DataTypes) => {
  const Usuarios = sequelize.define('usuarios', {
    id_usuarios: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario: {
      type: DataTypes.STRING,
    },
    clave: {
      type: DataTypes.STRING,
    },
    nombres: {
      type: DataTypes.STRING,
    },
    apellidos: {
      type: DataTypes.STRING,
    },
    rut: {
      type: DataTypes.STRING,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    correo: {
      type: DataTypes.STRING,
    },
    razon_social: {
      type: DataTypes.STRING,
    },
    giro: {
      type: DataTypes.STRING,
    },
    nombre_fantasia: {
      type: DataTypes.STRING,
    },
    borrado:{
      type: DataTypes.INTEGER,
    },
  },
    {
      freezeTableName: true
    }
  );
  Usuarios.associate = (models) => {
    Usuarios.belongsTo(models.tipos_usuarios);
    Usuarios.hasMany(models.pedidos)
    Usuarios.hasMany(models.direcciones);
    Usuarios.hasMany(models.direcciones_envios);
  };
  return Usuarios;
}

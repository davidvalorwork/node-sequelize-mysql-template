module.exports = (sequelize, DataTypes) => {
    const TiposUsuarios = sequelize.define('tipos_usuarios', {
      id_tipos_usuarios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tipo_usuario: {
        type: DataTypes.STRING,
      },
      borrado: {
        type: DataTypes.INTEGER,
      },
    },
      {
        freezeTableName: true
      }
    );
    TiposUsuarios.associate = (models) => {
      TiposUsuarios.hasMany(models.usuarios);
    };
    return TiposUsuarios;
  }
  
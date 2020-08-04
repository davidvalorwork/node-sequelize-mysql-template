module.exports = (sequelize, DataTypes) => {
    const DireccionesEnvios = sequelize.define('direcciones_envios', {
      id_direcciones_envios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      calle: {
        type: DataTypes.STRING,
      },
      numero: {
        type: DataTypes.STRING,
      },
      complemento: {
        type: DataTypes.STRING,
      },
      comuna: {
        type: DataTypes.STRING,
      },
      region: {
        type: DataTypes.STRING,
      },
      estado: {
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
    DireccionesEnvios.associate = (models) => {
        DireccionesEnvios.belongsTo(models.usuarios);
    };
    return DireccionesEnvios;
  }
  
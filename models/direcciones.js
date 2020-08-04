module.exports = (sequelize, DataTypes) => {
    const Direcciones = sequelize.define('direcciones', {
      id_direcciones: {
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
    Direcciones.associate = (models) => {
        Direcciones.belongsTo(models.usuarios);
    };
    return Direcciones;
  }
  
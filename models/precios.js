module.exports = (sequelize, DataTypes) => {
    const Precios = sequelize.define('precios', {
      id_precios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_precio:{
        type: DataTypes.INTEGER,
      },
      cantidad_desde:{
        type: DataTypes.INTEGER,
      },
      cantidad_hasta:{
        type: DataTypes.INTEGER,
      },
      valor_unitario:{
          type:DataTypes.STRING,
      },
      borrado:{
        type: DataTypes.INTEGER,
      },
    },
      {
        freezeTableName: true
      }
    );
    Precios.associate = (models) => {
        Precios.belongsTo(models.productos);
        Precios.hasMany(models.detalles_pedidos);
    };
    return Precios;
  }
  
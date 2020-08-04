module.exports = (sequelize, DataTypes) => {
    const Pedidos = sequelize.define('pedidos', {
      id_pedidos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha_pedido:{
        type: DataTypes.INTEGER,
      },
      borrado:{
        type: DataTypes.INTEGER,
      },
    },
      {
        freezeTableName: true
      }
    );
    Pedidos.associate = (models) => {
        Pedidos.belongsTo(models.estados_pedidos);
        Pedidos.hasOne(models.detalles_pedidos);
        Pedidos.hasOne(models.pagos);
        Pedidos.belongsTo(models.usuarios);
    };
    return Pedidos;
  }
  
module.exports = (sequelize, DataTypes) => {
    const EstadosPedidos = sequelize.define('estados_pedidos', {
      id_estados_pedidos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_estado_pedido:{
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
    EstadosPedidos.associate = (models) => {
        EstadosPedidos.hasMany(models.pedidos);
    };
    return EstadosPedidos;
  }
  
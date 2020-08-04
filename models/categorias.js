module.exports = (sequelize, DataTypes) => {
    const Categorias = sequelize.define('categorias', {
      id_categorias: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_categoria:{
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
    Categorias.associate = (models) => {
        Categorias.hasMany(models.productos);
    };
    return Categorias;
  }
  
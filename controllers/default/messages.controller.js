module.exports = {
  success: (result, res) => {
    res.status(200).json({
      status: 200,
      message: 'OK',
      payload: result,
    })
  },
  error: (error, res) => {
    if (error.name == "SequelizeUniqueConstraintError")
      res.status(400).json({
        status: 400,
        message: 'El nombre de los campos debe ser único',
        payload: error,
      })
    else
      res.status(500).json({
        status: 500,
        message: 'Algo salió mal.',
        payload: error,
      })
  }
}
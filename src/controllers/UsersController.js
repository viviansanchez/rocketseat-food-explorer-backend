const AppError = require("../utils/AppError")

class UsersController {
  create(req, res) {
    const { name, email, password } = req.body

    if(!name){
      throw new AppError("Nome é obrigatório!")
    }

    if(!email) {
      throw new AppError("E-mail é obrigatório!")
    }

    if(!password) {
      throw new AppError("Senha é obrigatório!")
    }

    if (password.length < 6){
      throw new AppError("É necessário que a senha contenha pelo menos 6 caracteres!")
    }

    res.status(201).json({ name, email, password })
  }
}

module.exports = UsersController
const AppError = require("../utils/AppError")
const sqlConnection = require("../database/sqlite")
const { hash } = require("bcryptjs")

class UsersController {
  async create(req, res) {
    const { name, email, password } = req.body
    const database = await sqlConnection()

    const checkUserExists = await database.get("SELECT * FROM users WHERE email =(?)", [email])

    if(checkUserExists) {
      throw new AppError("Este e-mail já está em uso!")
    }

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

    const hashedPassword = await hash(password, 8)

    await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    )

    return res.status(201).json()
  }
}

module.exports = UsersController
const { Router } = require("express")

const routes = Router()

const usersRouter = require("./users.routes")
const dishesRouter = require("./dishes.routes")

routes.use("/users", usersRouter)
routes.use("/dishes", dishesRouter)

module.exports = routes
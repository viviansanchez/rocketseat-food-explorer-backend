const { Router } = require("express")

const routes = Router()

const usersRouter = require("./users.routes")
const dishesRouter = require("./dishes.routes")
const sessionsRoutes = require("./sessions.routes")

routes.use("/users", usersRouter)
routes.use("/dishes", dishesRouter)
routes.use("/sessions", sessionsRoutes)

module.exports = routes
const knex = require("../database/knex")

class DishesController {
  async create(req, res) {
    const { title, category, price, description, ingredients } = req.body
    const { user_id } = req.params

    const [dish_id] = await knex("dishes").insert({
      title,
      category,
      price,
      description,
      user_id
    })

    const ingredientsInsert = ingredients.map(ingredient => {
      return {
        name: ingredient,
        dish_id,
        user_id
      }
    })

    await knex("ingredients").insert(ingredientsInsert)

    return res.status(201).json()
  }

  // async update(req, res){} atualizar um prato

  // async index(req, res) {} mostrar vários pratos

  // async show(req, res) {} mostrar um prato

  // async this.delete(req, res) {} deletar um prato

}

module.exports = DishesController
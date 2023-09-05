const knex = require("../database/knex")

//on create, delete and update methods there will need to be a check if the user isAdmin in order to proceed i think

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

  async index(req, res) {
    const { search } = req.query 

    let dishes

    if(search){
      const filterSearch = search.split(',').map(tag => tag.trim())

      dishes = await knex("dishes")
      .select([
        "dishes.id",
          "dishes.image",
          "dishes.title",
          "dishes.category",
          "dishes.price",
          "dishes.description"
      ])
      .leftJoin("ingredients", "dishes.id", "ingredients.dish_id")
      .where(function() {
        this.where("dishes.title", "like", `%${filterSearch}%`).orWhere("ingredients.name", "like", `%${filterSearch}%`)
      })
      .groupBy("dishes.id")
      .orderBy("dishes.title")   
    } else {
      dishes = await knex("dishes").orderBy("title")
    }

    return res.json(dishes)
  }

  async show(req, res) {
    const { id } = req.params
    
    const dish = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name")

    return res.json({
      ...dish, 
      ingredients
    })
  }

  async delete(req, res) {
    const { id } = req.params

    await knex("dishes").where({ id }).delete()

    return res.json()
  }
}

module.exports = DishesController
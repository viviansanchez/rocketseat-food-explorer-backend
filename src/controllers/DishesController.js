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

  async index(req, res) {
    const { title, ingredient } = req.query
   
    // como que eu vou diferenciar o que é ingrediente e o que é title?? não existe isso não tem sentido. deve ser uma constante só, que vai ser unificada na real. vai ser tipo 'search'. e ai tem que procurar das duas formas (as que tao no if e no if else) em uma coisa só. Problema bem obvio que na hora que fiz não pensei, preciso resolver asap.  

    let dishes

    if(title) {
      dishes = await knex("dishes").whereLike("title", `%${title}%`).orderBy("title")
    } else if(ingredient){
      dishes = await knex("ingredients")
      .select([
        "dishes.id",
        "dishes.image",
        "dishes.title",
        "dishes.category",
        "dishes.price",
        "dishes.description"
      ])
        .whereLike("name", `%${ingredient}%`)
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
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
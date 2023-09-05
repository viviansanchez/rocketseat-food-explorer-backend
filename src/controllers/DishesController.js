const knex = require("../database/knex")
const AppError = require("../utils/AppError")

//on create, delete and update methods there will need to be a check if the user isAdmin in order to proceed i think --> just an extra check, but technically it wouldnt be needed? not sure, leaving updated comment to think about it later.

class DishesController {
  async create(req, res) {
    const { title, category, price, description, ingredients } = req.body
    const { user_id } = req.params

    const checkUserCredentials = await knex("users").where({ id: user_id }).first()
    if(!checkUserCredentials.isAdmin){
      throw new AppError("Você não possui permissão para acessar esta página")
    }

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

  async update(req, res) {
    let { title, category, price, description, ingredients } = req.body
    const { id } = req.params
    const { user_id } = req.query
    //user_id is coming from query just for now, later will be different

    const checkUserCredentials = await knex("users").where({ id: user_id }).first()
    if(!checkUserCredentials.isAdmin){
      throw new AppError("Você não possui permissão para acessar esta página")
    }

    const dish = await knex("dishes").where({ id }).first()
    if(!dish) {
      throw new AppError("Prato não encontrado!")
    }

    if(title){
      const checkFoodTitle = await knex("dishes").where("title", title).first()
      if(checkFoodTitle && checkFoodTitle.id !== id){
      throw new AppError("Um prato com este nome já está cadastrado!")
      }
    }
    

    if(!title){
      title = dish.title
    }

    if(!category) {
      category = dish.category
    }

    if(!price){
      price = dish.price
    }

    if(!description){
      description = dish.description
    }
    
    await knex("dishes").where("id", id).update({
      title,
      category,
      price,
      description
    }).update("updated_at", knex.fn.now())

    if(ingredients){
      await knex("ingredients").where("dish_id", id).delete()

      const ingredientsInsert = ingredients.map(ingredient => {
        return {
          name: ingredient,
          dish_id: id,
          user_id
        }
      })

      await knex("ingredients").insert(ingredientsInsert)
    }

    return res.json()
  }

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
    const { user_id } = req.query
     //user_id is coming from query just for now, later will be different

    const checkUserCredentials = await knex("users").where({ id: user_id }).first()
    if(!checkUserCredentials.isAdmin){
      throw new AppError("Você não possui permissão para realizar esta ação")
    }


    await knex("dishes").where({ id }).delete()

    return res.json()
  }
}

module.exports = DishesController
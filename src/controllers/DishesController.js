const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
  async create(req, res) {
    const { title, category, price, description, ingredients } = req.body
    const imageFileName = req.file.filename
    const  user_id  = req.user.id

    const diskStorage = new DiskStorage()

    const checkUserCredentials = await knex("users").where({ id: user_id }).first()
    if(!checkUserCredentials.isAdmin){
      throw new AppError("Você não possui permissão para acessar esta página")
    }

    const filename = await diskStorage.saveFile(imageFileName)
    const [dish_id] = await knex("dishes").insert({
      image: filename,
      title,
      category,
      price,
      description,
      user_id
    })

    const ingredientsArray = ingredients.split(",")

    const ingredientsInsert = ingredientsArray.map(ingredient => {
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
    const  user_id  = req.user.id
    const imageFileName = req.file.filename

    const diskStorage = new DiskStorage() 

    const checkUserCredentials = await knex("users").where({ id: user_id }).first()
    if(!checkUserCredentials.isAdmin){
      throw new AppError("Você não possui permissão para acessar esta página")
    }

    const dish = await knex("dishes").where({ id }).first()
    if(!dish) {
      throw new AppError("Prato não encontrado!")
    }

    let filename

    if(!imageFileName){
      filename = dish.image
      //ok i know now that this doesnt work. i gues when testing i forgot to test this part, otherwise i would have realised it sooner (I found out while connecting this to the frontend).  
      //My current workaround is forcing the user to upload the same or a new image --> which is not the best user experience but at least it works. 
      //Leaving this comment here and the code as is bc the best way is to actually separate the image update in a different controller, and I want to be reminded of that.
    }

    if(imageFileName){
      // I am not including a check to see if there is an image in the db because there will be, the admin will not be able to create a dish without an image (at least for now), so there will always be one
      await diskStorage.deleteFile(dish.image) 
      filename = await diskStorage.saveFile(imageFileName)
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
      image: filename,
      title,
      category,
      price,
      description
    }).update("updated_at", knex.fn.now())

    if(ingredients){
      await knex("ingredients").where("dish_id", id).delete()

      const ingredientsArray = ingredients.split(",")

      const ingredientsInsert = ingredientsArray.map(ingredient => {
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

    if(search && search !== ""){
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
    const  user_id  = req.user.id
    const diskStorage = new DiskStorage()

    const checkUserCredentials = await knex("users").where({ id: user_id }).first()

    if(!checkUserCredentials.isAdmin){
      throw new AppError("Você não possui permissão para realizar esta ação")
    }
    
    const dish = await knex("dishes").where({ id }).first()
    
    await diskStorage.deleteFile(dish.image)

    await knex("dishes").where({ id }).delete()

    return res.json()
  }
}

module.exports = DishesController
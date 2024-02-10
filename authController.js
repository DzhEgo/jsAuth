const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const {secret} = require('./config')
//Генерируем токен
const generateToken = (id, roles) =>{
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "8h"})
}
//Создаем класс для нужных нам функций
class authController{
    async registration(req, res){
        try{
            //Отслеживаем ошибки, которые могут появиться, если не выполнить условия регистрации
            const errors = validationResult(req)
            if (!errors.isEmpty()){
                return res.status(400).json({message: 'Ошибка при регистрации!', errors})
            }
            //Получаем данные пользователя и проверяем, есть пользователь в бд
            const {username, password} = req.body
            const person = await User.findOne({username})
            if (person){
                res.status(400).json({message: 'Пользователь с таким именем существует!'})
            }
            //Хэшируем пароль и ставим по дефолту роль USER
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({username, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь зарегистрирован!"})
        } catch (e){
            console.log(e)
            res.status(400).json({message: 'Registration err'})
        }
    }

    async login(req, res){
        try{
            //Получаем данные пользователя и проверяем, есть пользователь в бд
            const {username, password} = req.body
            const user = await User.findOne({username})
            if(!user){
                res.status(400).json({message: `Пользователь ${username} не найден!`})
            }
            //Проверка введеного пароля и пароля в бд
            const validPass = bcrypt.compareSync(password, user.password)
            if (!validPass){
                res.status(400).json({message: `Вы ввели не правильный пароль!`})
            }
            //Генерируем ключ по id и role
            const token = generateToken(user._id, user.roles)
            return res.json({token})
        } catch (e){
            console.log(e)
            res.status(400).json({message: 'Login err'})
        }
    }
    //Гет запрос всех пользователей
    async getUsers(req, res){
        try{
            const users = await User.find()
            res.json(users)
        } catch (e){
            console.log(e)
        }
    }
}

module.exports = new authController()
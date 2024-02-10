const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const {secret} = require('./config')

const generateToken = (id, roles) =>{
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "8h"})
}

class authController{
    async registration(req, res){
        try{
            const errors = validationResult(req)
            if (!errors.isEmpty()){
                return res.status(400).json({message: 'Ошибка при регистрации!', errors})
            }
            const {username, password} = req.body
            const person = await User.findOne({username})
            if (person){
                res.status(400).json({message: 'Пользователь с таким именем существует!'})
            }
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
            const {username, password} = req.body
            const user = await User.findOne({username})
            if(!user){
                res.status(400).json({message: `Пользователь ${username} не найден!`})
            }
            const validPass = bcrypt.compareSync(password, user.password)
            if (!validPass){
                res.status(400).json({message: `Вы ввели не правильный пароль!`})
            }
            const token = generateToken(user._id, user.roles)
            return res.json({token})
        } catch (e){
            console.log(e)
            res.status(400).json({message: 'Login err'})
        }
    }

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
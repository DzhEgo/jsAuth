const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require('express-validator')
const authMiddle = require('./middleware/authMiddle')
const roleMiddle = require('./middleware/roleMiddle')

router.post('/registration', [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль не может быть меньше 4 и больше 8 символов').isLength({min: 4, max: 8})
],controller.registration)
router.post('/login', controller.login)
router.get('/users', roleMiddle(['ADMIN']), controller.getUsers)

module.exports = router
const express = require('express')
const { createUser, editUser, getAllUser, deleteUser, login } = require('../controllers/user.controller')
const router = express.Router()


router.post('/register', createUser)
router.patch('/edituser/:id', editUser)
router.get('/getUsers', getAllUser)
router.delete('/deleteUser/:id', deleteUser)
router.post('/login',login)


module.exports=router
const express = require('express')
const { createUser, editUser } = require('../controllers/user.controller')
const router = express.Router()


router.post('/register', createUser)
router.patch('/edituser/:id', editUser)


module.exports=router
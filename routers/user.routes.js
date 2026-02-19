const express = require('express')
const { createUser, editUser, getAllUser, deleteUser, login, getMe, verifyUser } = require('../controllers/user.controller')
const router = express.Router()


router.post('/register', createUser)
router.patch('/edituser/:id', editUser)
router.get('/getUsers',verifyUser,  getAllUser)
router.delete('/deleteUser/:id', deleteUser)
router.post('/login',login)
router.get('/me',verifyUser,getMe)


module.exports=router
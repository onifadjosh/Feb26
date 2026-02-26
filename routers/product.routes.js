const express = require("express")
const { listProduct, getproducts } = require("../controllers/product.controller")
const { verifyUser } = require("../controllers/user.controller")

const router = express.Router()

router.post("/addProduct",verifyUser, listProduct)
router.get("/products",verifyUser, getproducts)


module.exports = router
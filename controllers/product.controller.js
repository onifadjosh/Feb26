const ProductModel = require("../models/product.model")
const cloudinary = require("cloudinary").v2


cloudinary.config({
    api_key:process.env.CLOUD_KEY,
    cloud_name:process.env.CLOUD_NAME,
    api_secret:process.env.CLOUD_SECRET
})


const listProduct=async(req, res)=>{
    const{productName, productPrice, productQuantity, createdBy, productImage}= req.body

    try {
        let image = await cloudinary.uploader.upload(productImage, (err)=>{
            if(err){
                res.status(500).send({
                    message:"error uploading your files"
                })
                return
            }

            console.log(result);
            


             image = {
                public_id:result.public_id,
                secure_url:result.secure_url
            }

            return image
        })

        const product = await ProductModel.create({
            productName,
            productPrice,
            productQuantity,
            productImage:image,
            createdBy:req.user.id
        })

        res.status(201).send({
            message:"Product added successfully",
            data:product
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message:"Error adding product"
        })
        
    }
}


module.exports= {
    listProduct
}
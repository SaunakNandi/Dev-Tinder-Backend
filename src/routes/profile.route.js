const express=require('express')
const User=require('../models/user')
const jwt=require('jsonwebtoken')
const {userAuth}=require('../middleware/auth')
const profileRouter=express.Router()

profileRouter.get('/profile/view',userAuth, async(req,res)=>{
    const cookies=req.cookies;
    const {token}=cookies
    try {
        if(!token)
            throw new Error("Invalid Token! ")
        const decodedMessage=jwt.verify(token,"MY_SECRET_KEY")
        const {_id}=decodedMessage
        const user=await User.findById(_id)
        if(!user)
            throw new Error("User doesn't exist")
        res.send(user)
    } catch (error) {
        console.log("Error => ",error.message)
    }
})
profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{
    const {emailId,...rest}=req.body
    const userId=req.user._id
    try {
        const user=await User.findByIdAndUpdate(userId,rest,{
            runValidators:true,
            returnDocument:"after"
        })
        console.log("editted user detail ",user)
        await user.save()
        res.status(200).send({message:"Editted the profile",data:user})
    } catch (error) {
        console.log("error in profile")
        res.status(400).send("Error: "+error.message)
    }
})

module.exports=profileRouter
const express=require('express')
const User=require('../models/user')
const bcrypt=require('bcrypt')
const { validateSignUpData } = require('../utils/validation')

const authRouter=express.Router()

authRouter.post('/signup',async(req,res)=>{
    const {firstName,lastName,emailId,password,mobileNo}=req.body
    console.log("Hello")
    try {
        validateSignUpData(req)

        const passwordHash=await bcrypt.hash(password,10)
        const userObj=new User({
            firstName,
            lastName,
            emailId,
            password:passwordHash,
            mobileNo
        })
        await userObj.save();
        res.send("User added successfully")
    } catch (error) {
        res.status(400).send(error.message)
    }
})

authRouter.post('/login',async(req,res)=>{
    try {
        const {emailId,password}=req.body
        const data=await User.find()
        console.log("data at login ",data)
        const user=await User.findOne({emailId})
        if(!user)
            throw new Error("Invalid credentials")
        const isPasswordValid=await user.validatePassword(password)
        if(!isPasswordValid)
            throw new Error("Password is not correct")
        const token=await user.getJWT()
        res.cookie("token",token,{
            httpOnly: true,
            secure: true, // true if HTTPS
            sameSite: "none",
        })
        res.status(200).send({message:"Login Successfully!",data:user})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

authRouter.post('/logout',async(req,res)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now())
    })
    res.status(200).send("logged out successfully")
})
module.exports=authRouter
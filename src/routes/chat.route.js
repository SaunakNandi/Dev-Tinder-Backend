const express=require("express");
const Chat  = require("../models/chat");
const { userAuth } = require("../middleware/auth");
const chatRouter=express.Router()

chatRouter.get("/chat/:targetUserId",userAuth,async(req,res)=>{
    const userId=req.user._id;
    const {targetUserId}=req.params;
    try {
        let chat=await Chat.findOne({
            participants:{$all:[userId,targetUserId]}
        }).populate({
          path:"messages.senderId",
          select:"firstName lastName"
        })
        if(!chat)
        {
          chat=await Chat({
            participants:[userId,targetUserId],
            messages:[]
          })
          await chat.save()
        }
        res.status(200).send({message:"Sending chat details",data:chat})
    } catch (error) {
        console.log("error ",error)
    }
})

module.exports=chatRouter
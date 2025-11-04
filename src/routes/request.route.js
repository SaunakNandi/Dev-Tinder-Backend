const express=require('express')
const requestRouter=express.Router()
const {userAuth}=require('../middleware/auth')
const User = require('../models/user')
const ConnectionRequest = require('../models/connectionRequest')
requestRouter.post("/request/send/:status/:id",userAuth,async(req,res)=>{
    try {
        const fromUserId=req.user._id
        const toUserId=req.params.id
        const status=req.params.status
        if(!["ignored","interested"].includes(status))
            throw new Error("Invalid status")

        const toUser=await User.findById(toUserId)
        if(!toUser)
        {
            return res.status(404).send({message:"User not found"})
        }

        // if there is an existing connection request
        const existingConnectionRequest=await ConnectionRequest.findOne({
            $or:[{fromUserId,
            toUserId},
            {fromUserId:toUserId,toUserId:fromUserId}]
        })
        if(existingConnectionRequest)
            throw new Error("Connection request already sent")
        const connectionRequest=new ConnectionRequest({fromUserId,toUserId,status})
        const data=await connectionRequest.save()
        res.status(200).send({message:"Connection request sent successfully",data})
    } catch (error) {
        res.status(400).send("Error: "+error.message)
    }
})
requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res)=>{
    try {
        const loggedInUser=req.user
        const {status,requestId}=req.params;
        const allowedStatus=["accepted","rejected"];
        if(!allowedStatus.includes(status))
        {
            return res.status(400).json({message:"Status not allowed!"})
        }
        const connectionRequest=await ConnectionRequest.findOne({
            _id:requestId, 
            toUserId:loggedInUser._id,
            status:"interested"
        })
        if(!connectionRequest)
            return res.status(400).send({message:"Connection Request not found"})
        connectionRequest.status=status;
        const data=await connectionRequest.save();
        res.json({message:"Connection Request "+status,data});
    } catch (error) {
        res.status(400).send({message:"Error: "+error.message})
    }
})
module.exports=requestRouter
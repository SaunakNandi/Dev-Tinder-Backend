const express=require('express')
const {userAuth}=require('../middleware/auth')
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')
const userRouter=express.Router()
const USER_REF_DATA=["firstName","lastName","age","photoUrl","gender","about","skills"]
// userRouter.post("/user",async(req,res)=>{
//     const {emailId}=req.body;
//     try {
//         const user=await User.findOne({emailId})
//         res.send(user)
//     } catch (error) {
//         res.status(400).send("Something went wrong")
//     }
// })

// userRouter.delete('/user',userAuth, async(req,res)=>{
//     const userId=req.body.userId
//     try {
//         const user=await User.findByIdAndDelete(userId)
//         res.send("User deleted successfuly")
//     } catch (error) {
//         res.send("User deleted successfuly")
//     }
// })
// userRouter.get('/feed',async(req,res)=>{
//     try {
//         const users=await User.find({})
//         res.send(users)
//     } catch (error) {
//         res.status(400).send("Something went wrong")
//     }
// })

// userRouter.patch("/user/:userId",async(req,res)=>{
//     const userId=req.params?.userId
//     const data=req.body;
//     const {emailId,...rest}=data

//     try {
//         if(data?.skills.length>10)
//             throw new Error("Skills can't be more than 10")
//         const user=await User.findByIdAndUpdate(userId,rest,{
//             runValidators:true,
//             returnDocument:"after"
//         })
//         res.send("User updated successfully")
//     } catch (error) {
//         res.status(400).send("Something went wrong")
//     }
// })

userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
    try {
        const loggedInUser=req.user
        const connectionRequests=await ConnectionRequest.find({
            toUserId:loggedInUser._id,
            status:"interested"
        }).populate("fromUserId",USER_REF_DATA)
        res.status(200).send({message:"Data fetched ",data:connectionRequests })
    } catch (error) {
        res.status(400).send({message:"Error: "+error.message})
    }
})

userRouter.get("/user/connections",userAuth,async(req,res)=>{
    try {
        const loggedInUser=req.user;
        const connectionRequests=await ConnectionRequest.find({
            $or:[
                {toUserId:loggedInUser._id,status:"accepted"},
                {fromUserId:loggedInUser._id,status:"accepted"}
            ]
        }).populate("fromUserId",USER_REF_DATA).populate("toUserId",USER_REF_DATA)
        const data=connectionRequests.map(x=>{
            if(x.fromUserId._id.toString()==loggedInUser._id.toString())
                return x.toUserId
            return x.fromUserId
        })
        res.status(200).send({message:"Success",data})
    } catch (error) {
        res.status(400).send({message:error.message})
    }
})

userRouter.get("/feed",userAuth,async(req,res)=>{
    try {
        const loggedInUser=req.user;
        console.log("loggedInUser ",loggedInUser)
        const page=parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 10;
        limit=limit>50?50:limit
        const skip=(page-1)*limit

        const connectionRequests=await ConnectionRequest.find({
            $or:[
                {toUserId:loggedInUser._id},
                {fromUserId:loggedInUser._id}
            ]
        }).select(["fromUserId","toUserId"])
        const hideUsersFromFeed=new Set()
        connectionRequests.forEach((x,i)=>{
            hideUsersFromFeed.add(x.fromUserId.toString());
            hideUsersFromFeed.add(x.toUserId.toString())
        })
        const users=await User.find({
            $and:[
                {_id:{$ne:loggedInUser._id}},
                {_id:{$nin:Array.from(hideUsersFromFeed)}}
            ]
        }).select(USER_REF_DATA).skip(skip).limit(limit) // pagination
        console.log("Users. value. ",users)
        res.status(200).send({message:"Feed section ",data:users})
    } catch (error) {
        console.log("error ",error)
        res.status(400).json({message:error.message})
    }
})
module.exports=userRouter
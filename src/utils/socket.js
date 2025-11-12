const socket=require('socket.io')
const crypto=require("crypto")
const ConnectionRequest=require('../models/connectionRequest');
const Chat=require("../models/chat")
const getSecretRoomId=(userId,targetUserId)=>{
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
}
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  io.on("connection", (socket) => {
    // handle events

    socket.on('joinChat',({userId,targetUserId})=>{
      const roomId=getSecretRoomId(userId,targetUserId)
      console.log("chat joined ",roomId)
      socket.join(roomId)
    });
    socket.on("sendMessage",async({firstName,lastName,userId,targetUserId,text})=>{
      
      // Save messages to the database
      try {
        const roomId=getSecretRoomId(userId,targetUserId)
        
        // Check if userId & targetUserId are friends or not

        await ConnectionRequest.findOne({
          $or:[
            {fromUserId:userId,toUserId:targetUserId,status:"accepted"},
            {fromUserId:targetUserId,toUserId:userId,status:"accepted"},
          ]
        })
        let chat=await Chat.findOne({
          participants:{
            $all:[userId,targetUserId]
          }
        });
        if(!chat)
        {
          chat=await Chat({
            participants:[userId,targetUserId],
            messages:[]
          })
        }
        chat.messages.push({
          senderId: userId,
          text
        });
      
        await chat.save();
        if(typeof lastName!="undefined")
          io.to(roomId).emit("messageReceived",{firstName,lastName,text}) // we can send timestamp
        else
          io.to(roomId).emit("messageReceived",{firstName,lastName:"",text}) 
      } catch (error) {
        console.log("error at sendMessage"+ error.message)
      }
    });
    socket.on("disconnect",()=>{

    });
  });
};
module.exports=initializeSocket
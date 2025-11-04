const mongoose=require('mongoose')
const connectionRequestSchema=new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    status:{
        type:String,
        enum:{
            values:["ignored","interested","accepted","rejected"],
            message:`{VALUE} is incorrect status type`
        }
    }
},{
    timestamps:true
})

// calling this function before it is saved in the database
connectionRequestSchema.pre("save",function(next){
    const request=this;
    if(request.fromUserId.equals(request.toUserId))
    {
        throw new Error("Can't send connection request to yourself!")
    }
    next(); // since this is also a middleware
})

connectionRequestSchema.index({fromUserId:1,toUserId:1})
const ConnectionRequest=new mongoose.model("ConnectionRequestModel",connectionRequestSchema)
module.exports=ConnectionRequest
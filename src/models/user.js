const mongoose=require('mongoose')
const validator=require('validator')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const userSchema=new mongoose.Schema({
    firstName:{
        type: String,
        required:true,
        // index:true,
        minLength:4,
        maxLength:30
    },
    middleName:{
        type:String
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String
    },
    age:{
        type:String
    },
    gender:{
        type:String,
        enum:{
            values:["male","female","other"],
            message:`{VALUE} is not a valid gender type`
        }
    },
    photoUrl:{
        type:String,
        default:"https://geographyandyou.com/images/user-profile.png",
        validate(value){
            if(!validator.isURL(value))
            {
                throw new Error("Invalid photo url address "+ value)
            }
        }
    },
    about:{
        type:String,
        default:"Hi nice to meet you"
    },
    skills:{
        type:[String]
    }
},
{timestamps:true}
)
userSchema.methods.getJWT=function(){
    const user=this; // point to the current instance
    const token= jwt.sign({_id:user._id},"MY_SECRET_KEY",{expiresIn:'30d'})
    return token    
}
userSchema.methods.validatePassword=async function(password) {
    const user=this
    const hashPassword=user.password
    const isValid=await bcrypt.compare(password,hashPassword)
    return isValid
}
const User=new mongoose.model("User",userSchema);
module.exports=User
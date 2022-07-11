const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
   name:{
    type:String,
    required:[true,"please enter the name"],
    maxLength:[30,"Cant exceed 30 characters"],
    minLength:[5,"Name should have >5"]
   },
   email:{
    type:String,
    required:[true,"Please enter your email"],
    unique:true,
    validate:[validator.isEmail,"Please enter valid email"]

   },
   password:{
    type:String,
    required:[true,"Please enter Password"],
    minLength:[8,"Name should have >8"],
    select:false,
   },
   avatar:{
    
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true,
        }
    
   },
   role:{
    type:String,
    default: "user",
   },
   createdAt:{
    type:Date,
    default:Date.now
   },
   resetPasswordToken: String,
   resetPasswordExpire: Date,
   


});
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10)
})

//JWT Token

userSchema.methods.getJWTToken=function(){
   return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE,
   })
}
//

//compare password
userSchema.methods.comparePassword =  async function(enteredPasswored){
   return await bcrypt.compare(enteredPasswored,this.password
    );
};

//generating and reset token
userSchema.methods.getResetPasswordToken= function(){
  //generatingtoken
  const resetToken = crypto.randomBytes(20).toString("hex");
 //hashing and  adding to user schema
 this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
 this.resetPasswordExpire=Date.now() + 15*60*1000;

 return resetToken;

}

module.exports = mongoose.model("User",userSchema);
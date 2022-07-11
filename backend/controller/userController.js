const ErrorHandeler = require("../utils/errorHandeler");
const catchAsyncErrors =  require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

//register a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

  const mycloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
    folder:"avtars",
    width:150,
    crop:"scale",
  });

  const {name,email,password}= req.body;
  const user = await User.create({
    name,email,password,
    avatar:{
        public_id:mycloud.public_id,
        url:mycloud.secure_url,
    }
  });
  

//   const token = user.getJWTToken();
//   res.status(200).json({
//     success:true,
//     token,
//   })
sendToken(user,201,res);


})
//login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;
    //checking if user has email $ pass
    if(!email || !password){
        return next(new ErrorHandeler("Please enter  email or pass"),400)
    }
    const user =await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandeler("enter vaild email or password"),401)
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new  ErrorHandeler("enter valid email or password"),401)
    }
     sendToken(user,200,res);

});
//Logout user

exports.logOutUser=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });

    res.status(200).json({
        success:true,
        message:"LoggedOut Successfully",
    })

});

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
 const user = await User.findOne({email:req.body.email});
 if(!user){
    return next(new ErrorHandeler("User not found",404));
 }
 //get reset password Token
 const restTokenpass = user.getResetPasswordToken();

 //saving new token 
 await user.save({validateBeforeSave:false});

 const resetPassUrl=`${req.protocol}://${req.get("host")}/password/reset/${restTokenpass}`;

 const message =`Your reset pass token is :-\n\n ${resetPassUrl}\n\n If you dont requested this email then please ignore it\n\n regards(Team Aditya(Full Stack Devoloper))`;

 try {
    await sendEmail({
        email:user.email,
        subject:`Ecommerce password Recover`,
        message,

    });
    res.status(200).json({
        success:true,
        message:`email sent to :${user.email} successfully`
    })

 } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave:false});
    return next(new ErrorHandeler(error.message,500));
    
 }


});
//reset pass
exports.resetPass = catchAsyncErrors(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({resetPasswordToken,resetPasswordExpire:{$gt:Date.now()}});

    if(!user){
        return next(new ErrorHandeler("Reset Password token is invalid and has been expired",400));

    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandeler("Password doesnt match"),400);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
});

exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    });

});
//update userpass
exports.updateUserPass=catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandeler("Old pass is invalid"),400);
    }
    if(req.body.newPassword !==req.body.confirmPassword){
        return next(new ErrorHandeler("Pass doesnt Matched"),400);
    }
    user.password=req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
});

//UpdateProfile
exports.updateUserProfile= catchAsyncErrors(async(req,res,next)=>{
    const  userNewData ={
        name:req.body.name,
    
     
     
     email:req.body.email,
    }
    if(req.body.avatar !== "")
    {  
        const user = await User.findById(req.user.id);
        const imgId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imgId);
        const mycloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avtars",
            width:150,
            crop:"fill",
          });
        userNewData.avatar={
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        }  
    }
    const user= await User.findByIdAndUpdate(req.user.id,userNewData,{
        new:true,
        runValidators:true,
        useFindandModify:false,
    });

    res.status(200).json({
        success:true,
        
    })


});
//get all users
exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    })
});

//get single user
exports.getSingleUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user= await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandeler("User doesnt Found ,try again"),404);
    }
    res.status(200).json({
        success:true,
        user,
    });
});

//UpdateProfile Roles only ADMIN
exports.updateUserRole= catchAsyncErrors(async(req,res,next)=>{
    const  userNewData ={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
    //adding cloudinary later
    const user= User.findByIdAndUpdate(req.params.id,userNewData,{
        new:true,
        runValidators:true,
        useFindandModify:false,
    });

    res.status(200).json({
        success:true,
        
    })


});

//delete USER--ADMIN
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
      return  next(new ErrorHandeler("User not found",404));
    }
    await user.remove();

    res.status(200).json({
        success:true
    })
});

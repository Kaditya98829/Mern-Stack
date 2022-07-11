const ErrorHandeler = require('../utils/errorHandeler');
const catchAsyncErrors = require('./catchAsyncError');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
exports.isAuthUser = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;
    // console.log(token);
    if(!token){
        return next(new ErrorHandeler("Please Login to Access this resource"),401);
    }
   const decodedData = jwt.verify(token,process.env.JWT_SECRET);
   req.user =await User.findById(decodedData.id);
   next();


})

exports.authorizedRoles =(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
          return  next(  new ErrorHandeler(`Access Denied:${req.user.role} is not Allowed`,403));
        }
        next();
    };
};
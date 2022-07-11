const ErrorHandeler = require('../utils/errorHandeler');

module.exports=(err,req,res,next)=>{
    err.statusCode= err.statusCode || 500;
    err.message = err.message || "Internal server error";
   ////mongodb cast error

   if(err.name === "CastError"){
    
    const message = `Resource id is not correct :${err.path}`;
    err = new ErrorHandeler(message,404);
   }
   
//mongoose eroor duplicate key error

if(err.code ===11000){
    const message = `Duplicate :${Object.keys(err.keyValue)} entered`
    err =  new ErrorHandeler(message,400);
}
//wrong JWT
if(err.name==="JsonWebTokenError"){
    const mesg =`Json web token is invalid try again`
    err= new ErrorHandeler(mesg,400);
}
//JWT EXPIRE ERROR
if(err.name==="TokenExpireError"){
    const mesg =`JWT is expired try again`;
    err= new ErrorHandeler(mesg,400);

}
    res.status(err.statusCode).json({
        success:false,
        message: err.message
    });



}
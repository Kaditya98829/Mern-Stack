const app = require('./app');

const connectDatabase = require("./config/database");
const cloudinary = require('cloudinary');

//uncaught error
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down server due to uncaught error`);
    server.close(()=>{
        process.exit(1);
    });
});

//config
if(process.env.NODE_ENV !== "PRODUCTION"){
    require('dotenv').config({path:"backend/config/config.env"});
}

//connect db
connectDatabase();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});


const server=app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
});

//console.log(yt);

//db unhandeled rejection

process.on("unhandledRejection",err=>{
    console.log(`Error:${err.message}`);
    console.log(`Shuting down the error due to unhandeled promise rejection or any cast error maybe there`);
   process.exit(1);
})

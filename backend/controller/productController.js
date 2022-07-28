const Product = require("../models/productModel");
const ErrorHandeler = require("../utils/errorHandeler");
const catchAsyncErrors =  require('../middleware/catchAsyncError');
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary")

//create products--Admin Panel

exports.createProduct= catchAsyncErrors(async(req,res,next)=>{
  let images =[];
  if(typeof req.body.images==="string"){
    images.push(req.body.images);

  }
  else{
   images=req.body.images;
  }
  const imagesLink =[];
  for (let i = 0; i < images.length; i++) {
    const result =await cloudinary.v2.uploader.upload(images[i],
        {
            folder:"products",
        }
        );
        imagesLink.push({
            public_id: result.public_id,
            url:result.secure_url,
        })

    
  }
  req.body.images= imagesLink;
    req.body.user = req.user.id;

        const product = await Product.create(req.body);
        res.status(201).json({
            success:true,
            product
        })
    }
)
//get all products 
exports.getALLProducts=catchAsyncErrors(async(req,res)=>{
    
   const resultperpage =50;
   const productCount = await Product.countDocuments();


    const apifeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter().pagination(resultperpage);

    const products =await apifeature.query;
       res.status(200).json({
        success:true,
        products,
        productCount,
        resultperpage,
       })
    
    })

   //get all products --ADMIN
exports.getAdminProducts=catchAsyncErrors(async(req,res)=>{
    
   const products = await Product.find();
 

        res.status(200).json({
         success:true,
         products,
        
        })
     
     })
 




//updateProduct
exports.updateProduct= catchAsyncErrors(async(req,res,next)=>{
    let update= await Product.findById(req.params.id)
    if(!update){
        return next(new ErrorHandeler("Product not found",404))
  
      }
    update= await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,useFinfAndModify:true,runValidators:true
   })
   res.status(200).json({
       success:true,
       update
   })


})
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    let del= await Product.findById(req.params.id);
    // if(!del){
    //     return res.status(500).json({
    //         success:false,
    //         message:"no product found"
    //     })

    //}
    if(!del){
        return next(new ErrorHandeler("Product not found",404));
  
      }
    await del.remove();

    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
})
//get single product
exports.getProductDetail=catchAsyncErrors(async(req,res,next)=>{
    let product= await Product.findById(req.params.id);
    if(!product){
      return next(new ErrorHandeler("Product not found",404))

    }

    res.status(200).json({
        success:true,
        product,
        
    })
});
//create review rating and comment
exports.createReview = catchAsyncErrors(async(req,res,next)=>{
    const{rating,comment,productId}=req.body;
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,



    };
    const product = await Product.findById(productId);

    const isReviewed =  product.reviews.find(rev=>rev.user.toString()===req.user._id.toString());
    if(isReviewed){
        product.reviews.forEach(rev=>{
            if(rev.user.toString()===req.user._id.toString())
            (rev.rating=rating),(rev.comment = comment)
        })
              
    }
    else{
       product.reviews.push(review);
       product.NumberOfReviews =product.reviews.length;

    }
    //
    let avg=0;
    product.reviews.forEach(rev=>{
        avg=avg+ rev.rating;
    })
    product.ratings=avg/product.reviews.length;

    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    })
});

//to get all reviews of a single product

exports.getProductsReviews=catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
    return next(new ErrorHandeler("NO product Found",404));
    };
    res.status(200).json({
        success:true,
        reviews:product.reviews,
    })


});

//delete review

exports.deleteReviews=catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
    return next(new ErrorHandeler("NO product Found",404));
    };
    const reviews = product.reviews.filter(rev=>rev._id.toString()!==req.query.id.toString());

    let avg=0;
    reviews.forEach(rev=>{
        avg=avg+ rev.rating;
    })
    const ratings=avg/reviews.length;

    const NumberOfReviews=reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{        
        reviews,ratings,NumberOfReviews},{
            new:true,
            runValidators:true,
            useFinfAndModify:false,
        })


    res.status(200).json({
        success:true,
    })


});

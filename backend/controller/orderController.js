const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandeler = require('../utils/errorHandeler');
const catchAsyncErrors = require('../middleware/catchAsyncError');

//createnew order
exports.newOrder= catchAsyncErrors(async(req,res,next)=>{
    const {shippingInfo,
        paymentInfo,
        orderItems,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
                      }= req.body;

    const order = await Order.create({
        shippingInfo,
        paymentInfo,
        orderItems,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user:req.user._id,

    });

  res.status(200).json({
    success:true,
    order,
  });



});

//get single order or order details
exports.getsingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");

     if(!order){
        return next(new ErrorHandeler("No order found"),404);
     }

    res.status(200).json({
        success:true,
        order,
    });
});






//get logged user orders
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.find({user:req.user._id});

    

    res.status(200).json({
        success:true,
        order,
    });
});

//get all orders --admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.find();

    let totalAmount=0;
    order.forEach((order)=>{
        totalAmount += order.totalPrice;
    });

    

    res.status(200).json({
        success:true,
        order,
        totalAmount,
    });
});


//update order status --admin
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);


   if(order.orderStatus==="Delivered"){
    return next(new ErrorHandeler("You have Already delivered"),400);
   }

   order.orderItems.forEach( async(order)=>{
    await updateStock(order.product,order.quantity);
   });

   order.orderStatus =req.body.status;
   if(req.body.status==="Delivered"){
    order.deliveredAt = Date.now();
   };

   await order.save({validateBeforeSave:false});

    

    res.status(200).json({
        success:true,
        order,
        totalAmount,
    });
});
async function updateStock(id,quantity){
     const product = await Product.findById(id);
     product.Stock = product.Stock -quantity;
     await product.save({validateBeforeSave:false});
}
//delete orders
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandeler("No order found"),404);
     }
    
    await order.remove();

    res.status(200).json({
        success:true,
        
    });
});

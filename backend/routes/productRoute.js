const express = require('express');
const  {getALLProducts,createProduct,updateProduct, deleteProduct, getProductDetail,createReview, getProductsReviews, deleteReviews, getAdminProducts}  = require('../controller/productController');
const { isAuthUser,authorizedRoles } = require('../middleware/auth');
const router = express.Router();

router.route("/products").get(getALLProducts);
router.route("/admin/products").get(isAuthUser,authorizedRoles("admin"),getAdminProducts);

router.route("/admin/product/new").post(isAuthUser,authorizedRoles("admin"),createProduct);

router.route("/admin/product/:id").put(isAuthUser,authorizedRoles("admin"),updateProduct).delete(isAuthUser,authorizedRoles("admin"),deleteProduct);
router.route("/product/:id").get(getProductDetail);
router.route("/review").put(isAuthUser,createReview);
router.route("/reviews").get(getProductsReviews).delete(isAuthUser,deleteReviews);
module.exports=router
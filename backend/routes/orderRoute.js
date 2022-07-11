const express = require('express');
const { newOrder, getsingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controller/orderController');
const router = express.Router();
const { isAuthUser,authorizedRoles } = require('../middleware/auth');

router.route("/order/new").post(isAuthUser,newOrder);
router.route("/order/:id").get(isAuthUser,getsingleOrder);
router.route("/orders/me").get(isAuthUser,myOrders);

router.route("/admin/orders").get(isAuthUser,authorizedRoles("admin"),getAllOrders);
router.route("/admin/order/:id").put(isAuthUser,authorizedRoles("admin"),updateOrder)
.delete(isAuthUser,authorizedRoles("admin"),deleteOrder);



module.exports = router;
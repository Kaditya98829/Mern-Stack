const express =  require('express');
const { registerUser, loginUser, logOutUser,forgotPassword,resetPass, getUserDetails, updateUserPass, updateUserProfile, getAllUsers, getSingleUserDetails, updateUserRole, deleteUser} = require('../controller/userController');
const { isAuthUser,authorizedRoles } = require('../middleware/auth');

const router = express.Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logOutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPass);
router.route("/me").get(isAuthUser,getUserDetails);
router.route("/password/update").put(isAuthUser,updateUserPass);
router.route("/me/update").put(isAuthUser,updateUserProfile);
router.route("/admin/users").get(isAuthUser,authorizedRoles("admin"),getAllUsers);
router.route("/admin/user/:id").get(isAuthUser,authorizedRoles("admin"),getSingleUserDetails)
.put(isAuthUser,authorizedRoles("admin"),updateUserRole).delete(isAuthUser,authorizedRoles("admin"),deleteUser);








   
module.exports =router;
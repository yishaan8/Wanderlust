const express=require("express")
const router=express.Router({mergeParams: true});
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapasync");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userController=require("../controllers/users.js")


router.route("/signup")
.get(userController.rendersignupform)
.post(wrapAsync(userController.signup))
 
router.route("/login")
.get(userController.renderloginform)
.post(saveredirectUrl,passport.authenticate
  ("local",{failureRedirect: "/login",
    failureFlash: true}),userController.login);


router.get("/logout",userController.logout)


module.exports=router;
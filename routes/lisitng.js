const express=require("express")
const router=express.Router();
const wrapAsync=require("../utils/wrapasync.js")
const Listing=require("../models/listing.js")
const ExpressError=require("../utils/ExpressError.js")
const {listingSchema}=require("../schema.js");
const { isLoggedin, isOwner } = require("../middleware.js");
const { findById } = require("../models/user.js");
const { populate } = require("../models/reviews.js");
const Listingcontroller=require("../controllers/listings.js")
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")

const upload = multer({ storage })




const validatelisting=(req,res,next)=>{
     let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error)
    }else{
        next();
    }
}

router.route("/")
.get(wrapAsync(Listingcontroller.index))
.post(
    isLoggedin,
    validatelisting,
    upload.single("listing[image]"),
    wrapAsync(Listingcontroller.createroute))

//New Route
router.get("/new",isLoggedin,Listingcontroller.rendernewForm)

router.route("/:id")
.get(wrapAsync(Listingcontroller.showroute))
.put(isLoggedin,isOwner, upload.single("listing[image]"),validatelisting,wrapAsync(Listingcontroller.update))
.delete(isLoggedin,isOwner,wrapAsync(Listingcontroller.deleteroute))

//Edit route
router.get("/:id/edit",isLoggedin,isOwner,wrapAsync(Listingcontroller.editform))

module.exports=router
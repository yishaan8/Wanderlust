const express=require("express")
const router=express.Router({mergeParams: true});
const Review=require("../models/reviews.js")
const Listing=require("../models/listing.js")
const wrapAsync=require("../utils/wrapasync.js")
const ExpressError=require("../utils/ExpressError.js")
const {reviewSchema}=require("../schema.js");
const { isLoggedin, isreviewOwner } = require("../middleware.js");


const validatereview=(req,res,next)=>{
     let {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error)
    }else{
        next();
    }
}

//Reviews
router.post("",isLoggedin,validatereview,wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id)
    let newReview=new Review(req.body.review)
    newReview.author=req.user._id
    listing.reviews.push(newReview)

   await newReview.save();
   await listing.save();
    req.flash("success","New review created!")
   res.redirect(`/listings/${listing._id}`)
}));

//delete review route

router.delete("/:reviewid",isLoggedin,isreviewOwner,wrapAsync(async(req,res)=>{
    let {id,reviewid}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
    await Review.findByIdAndDelete(reviewid)
    req.flash("success","Review deleted!")
    res.redirect(`/listings/${id}`);
}))

module.exports=router;
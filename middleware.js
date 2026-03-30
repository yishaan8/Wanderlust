const Listing=require("./models/listing.js")
const Review=require("./models/reviews.js")

module.exports.isLoggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create Listing")
         return res.redirect("/login")
    }
    next();
};

module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl
    }
    next();
}

module.exports.isOwner=async (req,res,next)=>{
     let {id}=req.params;
    let listing= await Listing.findById(id)
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this Listing")
       return   res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.isreviewOwner=async (req,res,next)=>{
     let {id,reviewid}=req.params;
    let review= await Review.findById(reviewid)
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review")
       return   res.redirect(`/listings/${id}`)
    }
    next()
}
const Listing=require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const maptoken=process.env.MAP_TOKEN


const geocodingClient = mbxGeocoding({ accessToken: maptoken         });

module.exports.index=(async (req,res)=>{
    const alllisting= await Listing.find({})
    res.render("listings/index.ejs",{alllisting})
})

module.exports.rendernewForm=(req,res)=>{
    res.render("listings/new.ejs")
}

module.exports.editform=async(req,res)=>{   
    let{id}=req.params
  const listing= await Listing.findById(id)
  if(!listing){
    req.flash("error","Listing you requested cannot be found!")
    res.redirect("/listings")
  }
  let originalImageurl=listing.image.url;
 originalImageurl= originalImageurl.replace("/upload","upload/h_300,w_250")
  res.render("listings/edit.ejs", {listing,originalImageurl})
}

module.exports.showroute=async (req,res,next)=>{
    let{id}=req.params
  const listing= await Listing.findById(id)
  .populate(
    {path:"reviews",
        populate:{
            path:"author"
        }
    }
)
  .populate("owner")
  if(!listing){
    req.flash("error","Listing not found!")
    res.redirect("/listings")
  }
  res.render("listings/show.ejs",{listing})
}

module.exports.createroute=async(req,res)=>{
   let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()   


    let url=req.file.path;
    let filename=req.file.filename
    const newlisting= new Listing(req.body.listing)
    newlisting.owner=req.user._id;
    newlisting.image={url,filename}
    newlisting.geometry=response.body.features[0].geometry
   let savedListing= await newlisting.save()
   console.log(savedListing)
    req.flash("success","New listing created!")
    res.redirect("/listings")
}

module.exports.update=async(req,res)=>{
     let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing})
    if(typeof req.file !=="undefined"){
         let url=req.file.path;
    let filename=req.file.filename
     listing.image={url,filename}
     await listing.save();    
    }
    req.flash("success","Listing updated!")
    res.redirect("/listings")
}


module.exports.deleteroute=async(req,res)=>{
    let {id}=req.params;
   let deletedlisting= await Listing.findByIdAndDelete(id)
   console.log(deletedlisting)
   req.flash("success","Listing Deleted successfully!")
    res.redirect("/listings")
}
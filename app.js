if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const express=require("express")
const mongoose=require("mongoose")
const app=express()
const path=require("path")
const methodOverride=require("method-override")
const ejsmate=require("ejs-mate")
const ExpressError=require("./utils/ExpressError.js")
const session=require("express-session")
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash")
const passport=require("passport")
const LocalStratergy = require("passport-local").Strategy
const User=require("./models/user.js")
const listingsRouter=require("./routes/lisitng.js")
const userRouter=require("./routes/user.js")
const reviewRouter=require("./routes/review.js")
const { error } = require('console')
app.set("view engine","ejs")
app.engine('ejs', ejsmate);
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

const DbUrl=process.env.ATLASDB_URL


const store = new MongoStore({
    mongoUrl: DbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error",(err)=>{
    console.log("Error in mongo session store",err)
})


const sessionoptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
}
// app.get("/",(req,res)=>{
//     res.send("working")
// })




app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStratergy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


async function main() {
    await mongoose.connect(DbUrl)
}
main().then(()=>{
    console.log("connected sucessfully")
})

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
     res.locals.error=req.flash("error");
     res.locals.currUser=req.user;
    next();
})

app.get("/demoUser",async (req,res)=>{
    let fakeUser= new User({
        email:"student@gmail.com",
        username:"delta-4-student"
    })

   let registeredUser= await User.register(fakeUser,"helloworld")
    res.send(registeredUser)
})

app.use("/listings/:id/reviews",reviewRouter)
app.use("/listings",listingsRouter)
app.use("/",userRouter)


app.use((req, res, next) =>
     {
        next(new ExpressError(404, "Page not found!")); 
     }); 


app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!"}=err
    res.status(statusCode).render("error.ejs",{message})
})

app.listen(5000,()=>{
    console.log(`server is running at ${5000}`)
})
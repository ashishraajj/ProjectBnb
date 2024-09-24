
if(process.env.NODE_ENV  != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ExpressError=require("./utils/ExpressError.js");

const session=require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//for using route
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter = require("./routes/user.js");

//to access the ejs-mate
const ejsMate=require('ejs-mate');
app.engine("ejs", ejsMate);

//to use statice files(css from public folter)
app.use(express.static(path.join(__dirname,"/public")));


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust1";
const dbUrl=process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
};


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); //we use this to pass the all data coming from 'req' in show route as we can see
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",()=>{
  console.log("ERROR in Mongo Session Stor", err);
});





const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitalized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};






// app.get("/", (req, res)=>{
//   res.send("hello im groot!");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
   res.locals.success=req.flash("success");
   res.locals.error=req.flash("error");
   res.locals.currUser=req.user;
   next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "test-student"
//   });
//   let registeredUser = await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// });

//this is how we restrucutred our listings
app.use("/listings", listingRouter);
//this is how we restrucutred our reviews
app.use("/listings/:id/reviews", reviewRouter);

app.use("/",userRouter);






// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     // image: "https://cdn.ebaumsworld.com/mediaFiles/picture/2452130/85386506.jpg",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

// //if we move to undefind path
// app.all("*", (req, res, next)=>{
//   next(new ExpressError(404, "page not found!"));
// })


// app.use((err, req, res, next)=>{
//   let {statuscode=500, message="something went wrong!"}=err;
//   // res.status(statuscode).render("error.ejs", {message});
//   res.status(statuscode).send(message);
// });


//if we move to undefind path
app.all("*", (req, res, next)=>{
  next(new ExpressError(404, "page not found!"));
})



app.use((err, req, res, next)=>{
  let {statuscode=500, message="something went wrong!"}=err;
  res.status(statuscode).render("error.ejs", {message});
  // res.status(statuscode).send(message);
});



app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
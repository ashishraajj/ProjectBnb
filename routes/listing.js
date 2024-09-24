const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
// const { isLoggedIn, isOwner } = require("../middleware.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
// const { fileSizeLimit } = require("../cloudConfig.js"); // Import the fileSizeLimit middleware

const listingController = require("../controllers/listings.js");


//for the multer 
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
// const multer = require('multer');
// const {storage} = require("../cloudConfig.js");
// const upload = multer({storage});

// router.get("/filter/:id",wrapAsync(listingController.filter));
// router.get("/search", wrapAsync(listingController.search));

// const validateListing=(req, res, next)=>{
//     let {error}=listingSchema.validate(req.body);
   
//     if(error){
//         let errMsg=error.details.map((el)=>el.message).join(".");
        
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
//   };







// Index Route
//create Route
// router.route("/")
//  .get(wrapAsync(listingController.index))
//  .post(isLoggedIn, wrapAsync(listingController.createListings));
// .post(upload.single('listing[image][url]'), (req,res)=>{
//   res.send(req.file);
// });


// Index Route
// create Route
router.route("/")
 .get(wrapAsync(listingController.index))
 .post(
  isLoggedIn,
  upload.single('listing[image][url]'),
  wrapAsync(listingController.createListings)
 );


  // //New Route
  router.get("/new", isLoggedIn, listingController.renderNewForm);
  
  
  //Show Route
  //update Route
  //delete Route
router.route("/:id")
  .get(wrapAsync( listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single('listing[image]'), wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync( listingController.destroyListing) );

//Edit Route
  router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( listingController.renderEditForm));
  
module.exports = router;
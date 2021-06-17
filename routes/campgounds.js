const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controller/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
   .get( catchAsync(campgrounds.index))
   .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
   /*.post(upload.single('image'), (req, res)=>{
      console.log(req.body, req.file);
      res.send(req.body,req.file);
   })*/

router.get('/new', isLoggedIn, campgrounds.new);

router.route('/:id')
   .get(catchAsync(campgrounds.showCampground))
   .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
   .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
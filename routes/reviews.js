const express = require('express');
const router = express.Router( {mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controller/reviews');
const { validateReview, isReviewAuthor } = require('../middleware');

 
router.post('/', validateReview, catchAsync(reviews.showReview));

router.delete('/:reviewId', isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
const express = require('express');
const { getPlaces, addPlace ,nearMe ,deletePlace } = require('../controllers/places');

const router = express.Router();

router
  .route('/')
  .get(getPlaces)
  .post(addPlace);

router
  .route('/:id')
  .delete(addPlace);

router
  .route('/near-me')
  .get(nearMe)

module.exports = router;

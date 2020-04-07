const Place = require('../models/Place');

// @desc  Get all place
// @route GET /api/v1/places
// @access Public
exports.getPlaces = async (req, res, next) => {
  try {

    const { q } = req.query;

    const query = {}

    if (q) {
      query.placeId = { $regex: q, $options: 'i' }
    }

    const places = await Place.find(query);

    return res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc  Create a place
// @route POST /api/v1/places
// @access Public
exports.addPlace = async (req, res, next) => {
  try {
    const place = await Place.create(req.body);

    return res.status(201).json({
      success: true,
      data: place
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'This place already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc  place near me
// @route GET /api/v1/places/near-me
// @access Public
exports.nearMe = async (req, res, next) => {
  try {

    const { longitude, latitude } = req.query;

    const place = await Place.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 10 * 1000
        },
      }
    });

    return res.status(201).json({
      success: true,
      data: place
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc  Delete place 
// @route DELETE /api/v1/places
// @access Public
exports.deletePlace = async (req, res, next) => {
  try {

    const { id } = req.params;
  
    if(!id) {
       let err = Error("Id is required")
       err.code = 400;
       throw err
    }

    await Place.remove({_id : id});

    const places = await Place.find();

    return res.status(201).json({
      success: true,
      data: places
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

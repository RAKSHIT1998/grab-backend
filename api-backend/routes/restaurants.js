const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Add menu item with image
router.post('/menu', upload.single('image'), async (req, res) => {
  const { restaurantId, name, price, description, veg, cuisine, available } = req.body;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

  const menuItem = {
    name,
    price,
    available: available !== undefined ? available : true,
    description,
    veg: veg === "false" ? false : true,
    cuisine,
    image: req.file ? `/uploads/${req.file.filename}` : undefined
  };
  restaurant.menu.push(menuItem);
  await restaurant.save();
  res.json(restaurant.menu);
});

// Get restaurant menu
router.get('/menu/:restaurantId', async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
  res.json(restaurant.menu);
});

// POST /api/restaurants/menu
router.post('/menu', upload.single('image'), async (req, res) => {
  try {
    const { restaurantId, name, price, description, veg, cuisine, available } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const menuItem = {
      name,
      price,
      description,
      veg: veg === "false" ? false : true,
      cuisine,
      available: available !== undefined ? available : true,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
    };
    restaurant.menu.push(menuItem);
    await restaurant.save();
    res.json(restaurant.menu);
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item", details: err.message });
  }
});
module.exports = router;
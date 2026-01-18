const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// GET all goals for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query; // MVP: passing via query, should be from JWT
    const goals = await Goal.find({ userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new goal
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, priority, deadline, category } = req.body;
    const newGoal = new Goal({ userId, title, description, priority, deadline, category });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

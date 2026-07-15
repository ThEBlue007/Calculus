const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { generateQuestion, validateAnswer, useAthena, getCorrectAnswer } = require('../data/questions');

// --- SYSTEM APIs --- //
router.get('/health', (req, res) => res.json({ status: 'ok', message: 'API is running' }));

// --- GAME APIs --- //

// Get a random question based on difficulty (easy, medium, hard)
router.get('/question', async (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const count = parseInt(req.query.count, 10) || 1;
  const mode = req.query.mode || 'timeAttack';
  const question = await generateQuestion(difficulty, count, mode);
  
  res.json(question);
});

// Validate an answer
router.post('/validate', async (req, res) => {
  const { id, answerIndex, isTwin } = req.body;
  if (!id || typeof answerIndex !== 'number') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const result = await validateAnswer(id, answerIndex, isTwin);
  if (!result) {
    return res.status(404).json({ error: 'Question not found or expired' });
  }

  res.json({
    correct: result.correct,
    correctAnswerIndex: result.correctAnswerIndex,
    explanation: result.explanation
  });
});

// Use Athena powerup
router.post('/athena', async (req, res) => {
  const { id, isTwin } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing question ID' });

  const disabledIndices = await useAthena(id, isTwin);
  if (disabledIndices) {
    res.json({ disabled: disabledIndices });
  } else {
    res.status(400).json({ error: 'Question not found' });
  }
});

// Use Apollo (reveal answer temporarily without deleting)
router.post('/apollo', async (req, res) => {
  const { id, isTwin } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing question ID' });

  const mongoose = require('mongoose');
  const ActiveQuestion = mongoose.model('ActiveQuestion');

  let q;
  if (isTwin) {
    q = await ActiveQuestion.findOne({ 'twinData.id': id });
  } else {
    q = await ActiveQuestion.findOne({ questionId: id });
  }
  if (q) {
    res.json({ correctIndex: isTwin ? q.twinData.correctIndex : q.correctIndex });
  } else {
    res.status(404).json({ error: 'Question not found' });
  }
});

// Use L'Hôpital or Apollo (reveal answer)
router.post('/lhopital', async (req, res) => {
  const { id, isTwin } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing question ID' });

  const correctIndex = await getCorrectAnswer(id, isTwin);
  if (correctIndex !== null) {
    res.json({ correctIndex });
  } else {
    res.status(404).json({ error: 'Question not found' });
  }
});


// --- USER & ECONOMY APIs --- //

router.post('/user/sync', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    let user = await User.findOne({ username: userId });
    if (!user) {
      user = new User({
        username: userId,
        drachmas: 0,
        upgrades: { athena: 1, chronos: 1, hermes: 1, lhopital: 1 },
        relics: [],
        equippedRelics: []
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/user/reward', async (req, res) => {
  const { userId, score, mode, directDrachmas } = req.body;
  if (!userId) return res.status(400).json({ error: 'Invalid data' });

  try {
    let user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let coins = 0;
    if (directDrachmas) {
      coins = directDrachmas;
    } else if (typeof score === 'number') {
      coins = Math.floor(score / 100);
      if (mode === 'tartarus') coins = Math.floor(coins * 1.5);
      
      const equippedArray = user.equippedRelics || [];
      const hasMidas = equippedArray.includes('midas');
      if (hasMidas) {
        coins = Math.ceil(coins * 1.2);
      }
    }
    
    user.drachmas += coins;
    await user.save();

    res.json({ drachmasEarned: coins, totalDrachmas: user.drachmas });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/user/upgrade', async (req, res) => {
  const { userId, skill } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const isRelic = ['midas', 'aegis', 'sandals'].includes(skill);
  const isSkill = ['athena', 'chronos', 'hermes', 'lhopital'].includes(skill);

  if (!isRelic && !isSkill) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    let user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.relics) user.relics = [];

    if (isRelic) {
      if (user.relics.includes(skill)) return res.status(400).json({ error: 'Relic already owned' });
      const cost = skill === 'aegis' ? 500 : 300;
      if (user.drachmas < cost) return res.status(400).json({ error: 'Not enough Drachmas' });
      user.drachmas -= cost;
      user.relics.push(skill);
    } else {
      const currentLevel = user.upgrades[skill] || 1;
      if (currentLevel >= 2) return res.status(400).json({ error: 'Skill already at max level' });
      const cost = 500;
      if (user.drachmas < cost) return res.status(400).json({ error: 'Not enough Drachmas' });
      user.drachmas -= cost;
      user.upgrades = { ...user.upgrades, [skill]: 2 }; // Trigger mongoose mixed type update
      user.markModified('upgrades');
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/user/equip', async (req, res) => {
  const { userId, relic } = req.body;
  if (!userId || !relic) return res.status(400).json({ error: 'Missing data' });

  try {
    let user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.relics) user.relics = [];
    if (!user.equippedRelics) user.equippedRelics = [];

    if (!user.relics.includes(relic)) {
      return res.status(400).json({ error: 'You do not own this relic' });
    }

    const index = user.equippedRelics.indexOf(relic);
    if (index > -1) {
      // Unequip
      user.equippedRelics.splice(index, 1);
    } else {
      // Equip (limit to 2 active relics)
      if (user.equippedRelics.length >= 2) {
        return res.status(400).json({ error: 'Can only equip 2 relics at a time' });
      }
      user.equippedRelics.push(relic);
    }

    await user.save();
    res.json({ success: true, equippedRelics: user.equippedRelics });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// --- LEADERBOARD APIs --- //

// Submit score
router.post('/score', async (req, res) => {
  const { username, score, mode = 'timeAttack' } = req.body;
  
  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const nameStr = String(username).toUpperCase().substring(0, 12);
  
  try {
    const newEntry = new Leaderboard({
      username: nameStr,
      score: score,
      mode: mode
    });
    await newEntry.save();

    // Get leaderboard for the mode
    const leaderboard = await Leaderboard.find({ mode: mode })
      .sort({ score: -1, createdAt: 1 })
      .lean();

    const top5 = leaderboard.slice(0, 5);
    const playerRank = leaderboard.findIndex(entry => entry._id.toString() === newEntry._id.toString()) + 1;

    res.json({
      success: true,
      top5: top5,
      playerRank: {
        rank: playerRank,
        username: newEntry.username,
        score: newEntry.score,
        mode: newEntry.mode
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  const mode = req.query.mode || 'timeAttack';
  try {
    const top5 = await Leaderboard.find({ mode: mode })
      .sort({ score: -1, createdAt: 1 })
      .limit(5)
      .lean();
    res.json({ top5 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/reset/:token', authController.getRecovery);
router.post('/recovery', authController.postRecovery);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

module.exports = router;
const express = require('express');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();
const {check} = require('express-validator/check');

router.get('/signup', authController.getSignup);
router.post('/signup', [
    check('name', 'Name is required').not().isEmpty(),
    check('email').isEmail().withMessage('Email is not valid')
        .custom(value => {
            return User.findOne({email: value})
                .then(existUser => {
                    if (existUser) {
                        return Promise.reject('This email address was taken');
                    }
                });
        })
        .normalizeEmail()
        .trim(),
    check('password').isLength({min: 5}).trim()
        .withMessage('Password must be at least 5 chars long'),
    check('confirmPassword').trim()
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password must be confirmed')
            }
            return true;
        })
], authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', [
    check('email', 'Email is required and must be valid')
        .not().isEmpty()
        .isEmail()
        .normalizeEmail()
        .trim(),
    check('password', 'Password is required').not().isEmpty(),
], authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/reset/:token', authController.getRecovery);
router.post('/recovery', authController.postRecovery);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

module.exports = router;
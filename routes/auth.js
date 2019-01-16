const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();
const {check} = require('express-validator/check');

router.get('/signup', authController.getSignup);
router.post('/signup', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Email is not valid')
        .custom((value, {req}) => {
            if (value === 'test@mail.com') {
                throw new Error('This email address is forbidden')
            }
            return true;
        }),
    check('password').isLength({min: 5}).withMessage('Password must be at least 5 chars long')
], authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/reset/:token', authController.getRecovery);
router.post('/recovery', authController.postRecovery);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

module.exports = router;
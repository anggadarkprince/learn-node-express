const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();

const {check} = require('express-validator/check');

const productValidation = [
    check('title')
        .not().isEmpty().withMessage('Title is required')
        .isLength({min: 5, max: 100}).withMessage('Title between 5 until 100 characters'),
    check('price', 'Price must be a number and required').not().isEmpty().isNumeric(),
    check('description').trim(),
];

router.get('/products', adminController.getAllProducts);
router.get('/products/add', adminController.getAddProduct);
router.get('/product/edit/:productId', adminController.getEditProduct);
router.post('/product/edit/:productId', productValidation, adminController.postEditProduct);
router.post('/product/delete/:productId', adminController.postDeleteProduct);
router.delete('/product/delete/:productId', adminController.postDeleteProduct);
router.post('/products', productValidation, adminController.postAddProduct);


module.exports = router;
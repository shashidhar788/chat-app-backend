const router = require('express').Router();

const {login, register} = require('../controllers/authController');
const config = require('../config/app');



//using the login and register functions methods from authController.js
router.post('/login',login);


router.post('/register',register);


module.exports = router;
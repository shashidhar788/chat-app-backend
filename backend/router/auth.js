const router = require('express').Router();

const {login, register} = require('../controllers/authController');
const config = require('../config/app');

const { body } = require('express-validator');
const { validate } = require('../validators/validators')
const {rules: registrationRules} = require("../validators/auth/registerValidate")
const { rules: loginRules}  = require('../validators/auth/loginValidator');

//using the login and register functions methods from authController.js
router.post('/login',[loginRules(),validate],login);

//body from validation sent to ./validatrors/validate
router.post('/register',[
    registrationRules(),
    //validator function
    validate,
],
//register req,res function
register);


module.exports = router;
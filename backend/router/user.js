const router = require('express').Router();

const config = require('../config/app');
const { body } = require('express-validator');

const {authToken } = require('../middleware/authToken')
const { updateFunc, searchUsers } = require('../controllers/userController');
const { validate } = require('../validators/validators')

const { rules: updateRules}  = require('../validators/user/userUpdateValidator');

//using the login and register functions methods from authController.js
router.post('/update',[authToken,updateRules(),validate], updateFunc)

//body from validation sent to ./validatrors/validate

router.get('/search',authToken,searchUsers);



module.exports = router;
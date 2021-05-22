const router = require('express').Router();

const config = require('../config/app');


router.use('/',require('./auth'))



module.exports = router;
const router = require('express').Router();

const config = require('../config/app');


router.use('/', require('./auth'))

router.use('/users', require('./user'))




module.exports = router;
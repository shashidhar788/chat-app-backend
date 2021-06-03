const router = require('express').Router();

const config = require('../config/app');
const { body } = require('express-validator');

const {authToken } = require('../middleware/authToken')
const { index,create,getRes } = require('../controllers/chatController');
const { validate } = require('../validators/validators')

// we validate the toke sent by the user and 
router.get('/',[authToken], index)
router.post('/create',[authToken],create);

router.get('/getRes',[authToken],getRes);


module.exports = router;
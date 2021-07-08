const router = require('express').Router();

const config = require('../config/app');
const { body } = require('express-validator');

const {authToken } = require('../middleware/authToken')
const { index,create,getRes,messages, deleteChat, imageUpload } = require('../controllers/chatController');
const { validate } = require('../validators/validators')

const {chatFile, chatFileValidator} = require('../middleware/fileUpload');
// we validate the toke sent by the user and 
router.get('/',[authToken], index)
router.post('/create',[authToken],create);
router.get('/messages',[authToken],messages);
router.get('/getRes',[authToken],getRes);
router.delete('/:id',[authToken],deleteChat);

//handling uplaod images

router.post('/uploadImg',[authToken,chatFileValidator()],imageUpload);


module.exports = router;

const {body} = require('express-validator')
exports.rules = () =>{
    return [
        body('firstname').notEmpty(),
        body('lastname').notEmpty(),
        //body('gender').notEmpty(),
        body('email').isEmail(),
        body('password').optional().isLength(4)

    ]
    
}
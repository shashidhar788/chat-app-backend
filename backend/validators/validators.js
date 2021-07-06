const { validationResult } = require('express-validator')

exports.validate = (req,res,next) =>{
    const errors = validationResult(req)
    
    console.log("validation result of  No errors ? : ", errors.isEmpty());

    if( ! errors.isEmpty() ) {
        return res.status(400).json({"errors" : errors.array()});
    }

    next();
}
//using multipart uplaod middleware: multer for handling file upload

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const getFileType = (file) =>{
    console.log("checking for mime type *******" , file);
    const mimeType = file.mimetype.split('/');
    return mimeType[mimeType.length-1];
}

const generateFileName =(req,file,cb)=>{
    const extension = getFileType(file);

    const filename = Date.now()+ '-' + Math.round(Math.random()* 1E9) + '-' + extension;
    cb(null,file.fieldname +'-'+filename);


}

const fileFilter = (req,file,cb)=>{
    const extension = getFileType(file);

    const allowedTypes = /jpeg|jpg|png/
    const passed = allowedTypes.test(extension)
    if(passed){
        return cb(null,true)
    }
    return cb(null,false);
}

//ref: https://www.npmjs.com/package/multer
exports.chatFileValidator = (req,res,next)=>{
    
    const storage = multer.diskStorage({
        destination: function (req,file,cb){
            const {id} = req.body;
            const dest = `uploads/chat/${id}`
            

            fs.access(dest,(err)=>{

                if(err){
                    return fs.mkdir(dest,(err)=>{
                        cb(err,dest);
                    })
                }else{

                    return cb(null,dest);
                }

            })
        }, filename:generateFileName
    })

    return multer({storage,fileFilter}).single('image');

}

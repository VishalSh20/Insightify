import multer from "multer";
import path from "path";

const directory = "../../public/temp";
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        let subDirectory = '';
        switch(file.mimetype.split('/')[0]){
            case "image":
                subDirectory = "images";
                break;
            case "video":
                subDirectory = "videos";
                break;
            default:
                subDirectory = "others";
        }
        const dest = path.join(directory,subDirectory);
        cb(null,dest);
    },

    filename:(req,file,cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

export const upload = multer({storage});


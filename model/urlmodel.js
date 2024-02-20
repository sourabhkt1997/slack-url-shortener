const mongoose=require("mongoose")

const UrlSchema=mongoose.Schema({
    longurl:{
        type:String,
        unique:true
    },
    shorturl:{
        type:String,
        unique:true
    }
},{
    versionkey:false
})

UrlModel = mongoose.model("shorturl",UrlSchema);

module.exports={ UrlModel }
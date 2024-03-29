require("dotenv").config()
const webhookurl = process.env.webhookurl
const express = require("express")
const { UrlModel } = require("../model/urlmodel")
const crypto = require('crypto');
const axios = require("axios")
const urlRouter = express.Router();


async function emitmessage(message){
  await axios.post(webhookurl,{
    blocks:[
     {
      type:"section",
      text:{
        type:"mrkdwn",
        text:message
      }
    }
   ]  
})
}


// to get the event from slack and emit messages back
urlRouter.post('/slack/events', async(req, res) => {
 
  const challenge = req.body.challenge;
  const event = req.body.event;

   if(event && event.text && !event.subtype){
    const urlRegex = /(http(s)?:\/\/[^\s]+)/;
     
    const containsUrl = urlRegex.test(event.text); //chacking the text is a proper url or not

    if (containsUrl) {
      urlData= await UrlModel.findOne({longurl:event.text})

      // if shortURL is already in databse returning the shortented URL else creating shortURL and add to database
      if(urlData){
        let shorturl=urlData.shorturl
        let message=`Here is your Shortended URL click to redirect: https://slack-url-shortener.onrender.com/${shorturl} `
        emitmessage(message)
        
     }
     else{

        const encodedValue =Math.floor(1000 + Math.random() * 9000) + Date.now();
        
        let newurlData=new UrlModel({
        longurl:event.text,
        shorturl:encodedValue
        })

        await newurlData.save() 
        let message=`Here is your Shortended URL :https://slack-url-shortener.onrender.com/${encodedValue} `
        
        emitmessage(message)

      }
    }
    else{
       // if text is not a url sending the message 
       let message=`Please sent a Proper URL`
       emitmessage(message)
    }

   }
   
  res.status(200).send({ challenge });
});


urlRouter.get('/favicon.ico', (req, res) => res.status(204));


// to get the original longURL from shortURL and redirecting to the original URL
urlRouter.get("/:encoded",async(req,res)=>{
  try {
    const encodedurl=req.params.encoded
 
    let urlData=await UrlModel.findOne({shorturl:encodedurl})
    
    if(urlData){
      let longurl=urlData.longurl

      const angleBracketRegex = /<([^>]*)>/;
      const matches = longurl.match(angleBracketRegex);
      res.status(301).redirect(matches[1])
    }
    else{
      res.status(401).send("url not fount")
    }
  } catch (error) {
    res.status(501).send("server error")
  }
})


//testing
urlRouter.get("/",async(req,res)=>{
  try {
    res.status(200).send("welcome to slack-url-shortner")
  } catch (error) {
    res.status(400).send("error")
  }
})




module.exports={urlRouter}


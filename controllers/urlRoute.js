require("dotenv").config()
const webhookurl = process.env.webhookurl
const express = require("express")
const { UrlModel } = require("../model/urlmodel")
const crypto = require('crypto');
const axios = require("axios")
const urlRouter = express.Router();




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
        await axios.post(webhookurl,{
            blocks:[
             {
              type:"section",
              text:{
                type:"mrkdwn",
                text:`Here is your Shortended URL click to redirect: https://slack-url-shortener.onrender.com/${shorturl} `
              }
            }
           ]  
        })
     }
     else{
       // encoder function
       function encodeUrl(url) {
          const hash = crypto.createHash('sha256');
          hash.update(url);
          return hash.digest('hex').slice(0, 8); 
        }

        const encodedValue = encodeUrl(event.text);
        let newurlData=new UrlModel({
        longurl:event.text,
        shorturl:encodedValue
        })

        await newurlData.save() 
        await axios.post(webhookurl,{
          blocks:[
            {
              type:"section",
              text:{
                type:"mrkdwn",
                text:`Here is your Shortended URL : http://localhost:8700/${encodedValue} `
              }
            }
          ]  
        })
      }
    }
    else{
       // if text is not a url sending the message 
      await axios.post(webhookurl,{
        blocks:[
          {
            type:"section",
            text:{
              type:"mrkdwn",
              text:`Please sent a Proper URL`
            }
          }
        ]  
       })
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


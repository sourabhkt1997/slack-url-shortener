require("dotenv").config
const PORT=process.env.PORT ||8700
const express = require('express');
const { connection } =require("./config/db")
const {urlRouter} =require("./controllers/urlRoute")

const app = express();

app.use(express.json())

app.use("/",urlRouter)

app.listen(PORT, async() => {
  try {
    await connection
    console.log("connected to databse")
    console.log(`Server is running `);
  } catch (error) {
    console.log(error);
  }
  
});









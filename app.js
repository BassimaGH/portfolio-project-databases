const express = require("express")
const app = express()

app.get("/", function(req, res){
    res.send("start page!")
})


app.listen(8080)
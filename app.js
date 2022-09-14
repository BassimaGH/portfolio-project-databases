const express = require("express")
const expressHandlebars = require("express-handlebars")
const app = express()

app.engine("hbs", expressHandlebars.engine({
    defaultLayout: "human.hbs",
}))

app.get("/humans", function(req, res){
    res.render("human.hbs")
})


app.listen(8080)
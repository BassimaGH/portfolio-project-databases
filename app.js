const express = require("express")
const expressHandlebars = require("express-handlebars")
const app = express()

app.engine("hbs", expressHandlebars.engine({
    defaultLayout: "main.hbs",
}))

app.use (
    express.static("public")
)

app.use (
    express.static("style.css")
)

app.get("/", function(req, res){
    res.render("start.hbs")
})

app.get("/about", function(req, res){
    res.render("about.hbs")
})

app.get("/contact", function(req, res){
    res.render("contact.hbs")
})

app.get("/projects", function(req, res){
    res.render("projects.hbs")
})

app.get("/login", function(req, res){
    res.render("login.hbs")
})

app.get("/dashboard", function(req, res){
    res.render("dashboard.hbs", {layout: "admin.hbs"})
})

app.get("/admin_blog", function(req, res){
    res.render("admin_blog.hbs", {layout: "admin.hbs"})
})

app.get("/admin_faq", function(req, res){
    res.render("admin_faq.hbs", {layout: "admin.hbs"})
})

app.get("/admin_projects", function(req, res){
    res.render("admin_projects.hbs", {layout: "admin.hbs"})
})


app.listen(8080)
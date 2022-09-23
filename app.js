const express = require("express")
const expressHandlebars = require("express-handlebars")
const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("projects_database.db")

const project_name_max_chara = 100

db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        project_name TEXT,
        project_sub_headline TEXT,
        project_description TEXT
    )`
)
// is it gonna make it harder for me if i add foreign keys to different tables?
// how to add DATE in a database table.
// how to edit database values inside vscode
// how to add projects to a database table from the website (i have issues with it maybe because of me having a lot of pages?).
// is it possible to add a layout and a data object in a render property.
// can i copy tailwind componenets from the internet (search bar, pagination, etc.).




db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY,
        post_title TEXT,
        post_text TEXT,
        post_date TEXT,
        FOREIGN KEY (id) REFERENCES projects(id)
    )`
)

db.run(`
    CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY,
        post_question TEXT,
        post_answer TEXT,
        post_date TEXT
    )`
)

const app = express()

//sets the default layout to the main.hbs file
app.engine("hbs", expressHandlebars.engine({
    defaultLayout: "main.hbs",
    partialsDir: __dirname + "/views/partials"
}))


app.use (
    express.static("public")
)

app.use(
    express.urlencoded({
        extended: false
    })
)

// RENDERS THE PAGES (USER SIDE)

// home page
app.get("/", function(req, res){
    res.render("start.hbs")
})

// about page
app.get("/about", function(req, res){
    res.render("about.hbs")
})

// contact page
app.get("/contact", function(req, res){
    res.render("contact.hbs")
})

// projects main page
app.get("/projects", function(req, res){

    const query = `SELECT * FROM projects`

    db.all(query, function(error, projects) {
        const model = {
            projects 
        }

        res.render("projects.hbs", model)
    })    
})

// NEED TO ADD PROJECT DETAILS PAGES USING A DATABASE
app.get("/projects/:id", function(req, res){
    const id = req.params.id
    const query = `SELECT * FROM projects WHERE id = ?`
    const values = [id]

    db.get(query, values, function(error, project) {
        const model = {
            project,
        }
        res.render("project_details.hbs", model)
    })
    
})
// login page (only the admin can enter the correct values)
app.get("/login", function(req, res){
    res.render("login.hbs")
})


// RENDERS THE PAGES (ADMIN SIDE)

// In the navigation bar

// home page
app.get("/dashboard", function(req, res){
    res.render("dashboard.hbs", {layout: "admin.hbs"})
})

// projects add page
app.get("/admin_projects", function(req, res){
    res.render("admin_projects.hbs", {layout: "admin.hbs"})
})

app.post("/projects/add", function(req, res){
    const project_name = req.body.project_name
    const project_sub_headline = req.body.project_sub_headline
    const project_description = req.body.project_description

    const errorMessage = []

    if (project_name == "") {
        errorMessage.push("name cant be empty")
    } else if (project_name.length > maxChara) {
        errorMessage.push("name should be less than " + project_name_max_chara + " charachters")
    }

    const query = `
        INSERT INTO projects (project_name, project_sub_headline, project_description) VALUES (?, ?, ?)
    `
    const values = [project_name, project_sub_headline, project_description]

    db.run(query, values, function(error){
        res.redirect("/projects_edit")
    })
})

// blog add page
app.get("/admin_blog", function(req, res){
    res.render("admin_blog.hbs", {layout: "admin.hbs"})
})

// faq add page
app.get("/admin_faq", function(req, res){
    res.render("admin_faq.hbs", {layout: "admin.hbs"})
})

//INSIDE THE MAIN PAGES

//projects (edit, remove)
app.get("/projects_edit", function(req, res){

    const query = `SELECT * FROM projects`

    db.all(query, function(error, projects) {
        const model = {
            projects ,
            layout: "admin.hbs"
        }

        res.render("projects_edit.hbs", model)
    }) 
})

app.get("/projects_remove", function(req, res){
    res.render("projects_remove.hbs", {layout: "admin.hbs"})
})

//blog (edit, remove)
app.get("/blog_edit", function(req, res){
    res.render("blog_edit.hbs", {layout: "admin.hbs"})
})

app.get("/blog_remove", function(req, res){
    res.render("blog_remove.hbs", {layout: "admin.hbs"})
})

//faq (edit, remove)
app.get("/faq_edit", function(req, res){
    res.render("faq_edit.hbs", {layout: "admin.hbs"})
})

app.get("/faq_remove", function(req, res){
    res.render("faq_remove.hbs", {layout: "admin.hbs"})
})


app.listen(8080)
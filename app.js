const express = require("express")
const expressHandlebars = require("express-handlebars")
const sqlite3 = require("sqlite3")
const expressSession = require("express-session")

const project_name_max_chara = 100
const admin_username = "Bassima"
const admin_password = "2003"

const db = new sqlite3.Database("portfolio_database.db")

db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        project_name TEXT,
        project_sub_headline TEXT,
        project_description TEXT
    )`
)

db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY,
        post_title TEXT,
        post_text TEXT,
        post_date TEXT,
        projectid INTEGER,
        FOREIGN KEY (projectid) REFERENCES projects (id)
    )`
)

db.run(`
    CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY,
        post_question TEXT,
        post_answer TEXT,
        post_date TEXT,
        projectid INTEGER,
        FOREIGN KEY (projectid) REFERENCES projects (id)
    )`
)

const app = express()

//sets the default layout to the main.hbs file
app.engine("hbs", expressHandlebars.engine({
    defaultLayout: "main.hbs"
}))


app.use (
    express.static("public")
)

app.use(
    express.urlencoded({
        extended: false
    })
)

app.use(
    expressSession({
        saveUninitialized: false,
        resave: false,
        secret: "bassima2003"
    })
)

// RENDERS THE PAGES (USER SIDE)

// home page
app.get("/", function(req, res){
    const model = {
        session: req.session
    }

    res.render("start.hbs", model)
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

app.get("/projects/:id/project_blog", function(req, res){
    const id = req.params.id
    const query = `SELECT * FROM projects WHERE id = ? `
    const values = [id]

    db.get(query, values, function(error, project) {
        const id = req.params.id
        const query = `SELECT * FROM blogs WHERE projectid = ? `
        const values = [id]

        db.all(query, values, function(error, blogs) {
            const model = {
                project,
                blogs
            }
            res.render("project_blog.hbs", model)
        })
    })
    
})

app.get("/projects/:id/project_faq", function(req, res){
    const id = req.params.id
    const query = `SELECT * FROM projects WHERE id = ? `
    const values = [id]

    db.get(query, values, function(error, project) {
        const id = req.params.id
        const query = `SELECT * FROM faqs WHERE projectid = ? `
        const values = [id]

        db.all(query, values, function(error, faqs) {
            const model = {
                project,
                faqs
            }
            res.render("project_faq.hbs", model)
        })
    })
    
})
// login page (only the admin can enter the correct values)
app.get("/login", function(req, res){
    res.render("login.hbs")
})

app.post("/login", function (req, res) {
    const username = req.body.username
    const password = req.body.password

    if (username == admin_username && password == admin_password) {
        req.session.isLoggedIn = true

        res.redirect("/dashboard")
    } else {
        const model = {
            failed_to_login: true
        }

        res.render("login.hbs", model)
    }
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
    } else if (project_name.length > project_name_max_chara) {
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
app.post("/blogs/add", function(req, res){
    const post_title = req.body.post_title
    const post_text = req.body.post_text
    const post_date = req.body.post_date
    const projectid = req.body.projectid

    const errorMessage = []

    if (post_title == "") {
        errorMessage.push("name cant be empty")
    } else if (post_title.length > project_name_max_chara) {
        errorMessage.push("name should be less than " + project_name_max_chara + " charachters")
    }

    const query = `
        INSERT INTO blogs (post_title, post_text, post_date, projectid) VALUES (?, ?, ?, ?)
    `
    const values = [post_title, post_text, post_date, projectid]

    db.run(query, values, function(error){
        res.redirect("/blog_edit")
    })
})


// faq add page
app.get("/admin_faq", function(req, res){
    res.render("admin_faq.hbs", {layout: "admin.hbs"})
})

app.post("/faqs/add", function(req, res){
    const post_question = req.body.post_question
    const post_answer = req.body.post_answer
    const post_date = req.body.post_date
    const projectid = req.body.projectid

    const errorMessage = []

    if (post_question == "") {
        errorMessage.push("name cant be empty")
    } else if (post_question.length > project_name_max_chara) {
        errorMessage.push("name should be less than " + project_name_max_chara + " charachters")
    }

    const query = `
        INSERT INTO faqs (post_question, post_answer, post_date, projectid) VALUES (?, ?, ?, ?)
    `
    const values = [post_question, post_answer, post_date, projectid]

    db.run(query, values, function(error){
        res.redirect("/faq_edit")
    })
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

app.post("/projects/edit/:id", function(req, res){
    const id = req.params.id
    const project_name = req.body.project_name
    const project_sub_headline = req.body.project_sub_headline
    const project_description = req.body.project_description

    const errorMessage = []

    const query = `
    UPDATE projects SET project_name = ?, project_sub_headline = ?, project_description = ? WHERE id = ?
    `

    const values = [project_name, project_sub_headline, project_description, id]

    db.run(query, values, function(error) {
        if(error) {
            res.redirect("/dashboard")
        } else {
            res.redirect("/admin_projects")
        }

    })
})

app.get("/projects_remove", function(req, res){
    const query = `SELECT * FROM projects`

    db.all(query, function(error, projects) {
        const model = {
            projects ,
            layout: "admin.hbs"
        }

        res.render("projects_remove.hbs", model)
    }) 
})

app.post("/projects/remove/:id", function(req, res){
    const id = req.params.id

    const errorMessage = []

    const query = `
    DELETE FROM projects WHERE id = ?
    `

    const values = [id]

    db.run(query, values, function(error) {
        if(error) {
            res.redirect("/dashboard")
        } else {
            res.redirect("/admin_projects")
        }

    })
})

//blog (edit, remove)
app.get("/blog_edit", function(req, res){
    
    const query = `SELECT * FROM blogs`

    db.all(query, function(error, blogs) {
        const model = {
            blogs,
            layout: "admin.hbs"
        }

        res.render("blog_edit.hbs", model)
    }) 
})

app.post("/blogs/edit/:id", function(req, res){
    const id = req.params.id
    const post_title = req.body.post_title
    const post_text = req.body.post_text
    const post_date = req.body.post_date
    const projectid = req.body.projectid

    const errorMessage = []

    const query = `
    UPDATE blogs SET post_title = ?, post_text = ?, post_date = ?, projectid = ? WHERE id = ?
    `

    const values = [post_title, post_text, post_date, projectid, id]

    db.run(query, values, function(error) {
        if(error) {
            res.redirect("/dashboard")
        } else {
            res.redirect("/admin_blog")
        }

    })
})

app.get("/blog_remove", function(req, res){
    const query = `SELECT * FROM blogs`

    db.all(query, function(error, blogs) {
        const model = {
            blogs,
            layout: "admin.hbs"
        }

        res.render("blog_remove.hbs", model)
    }) 
})

app.post("/blogs/remove/:id", function(req, res){
    const id = req.params.id

    const errorMessage = []

    const query = `
    DELETE FROM blogs WHERE id = ?
    `

    const values = [id]

    db.run(query, values, function(error) {
        if(error) {
            res.redirect("/dashboard")
        } else {
            res.redirect("/admin_blog")
        }

    })
})

//faq (edit, remove)
app.get("/faq_edit", function(req, res){
        
    const query = `SELECT * FROM faqs`

    db.all(query, function(error, faqs) {
        const model = {
            faqs,
            layout: "admin.hbs"
        }

        res.render("faq_edit.hbs", model)
    }) 
})

app.post("/faqs/edit/:id", function(req, res){
    const id = req.params.id
    const post_question = req.body.post_question
    const post_answer = req.body.post_answer
    const post_date = req.body.post_date
    const projectid = req.body.projectid

    const errorMessage = []

    const query = `
    UPDATE faqs SET post_question = ?, post_answer = ?, post_date = ?, projectid = ? WHERE id = ?
    `

    const values = [post_question, post_answer, post_date, projectid, id]

    db.run(query, values, function(error) {
        if(error) {
            res.redirect("/dashboard")
        } else {
            res.redirect("/admin_faq")
        }

    })
})

app.get("/faq_remove", function(req, res){
    const query = `SELECT * FROM faqs`

    db.all(query, function(error, faqs) {
        const model = {
            faqs,
            layout: "admin.hbs"
        }

        res.render("faq_remove.hbs", model)
    }) 
})

app.post("/faqs/remove/:id", function(req, res){
    const id = req.params.id

    const errorMessage = []

    const query = `
    DELETE FROM faqs WHERE id = ?
    `

    const values = [id]

    db.run(query, values, function(error) {
        if(error) {
            res.redirect("/dashboard")
        } else {
            res.redirect("/admin_faq")
        }

    })
})


app.listen(8080)
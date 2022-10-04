// APP MAIN PACKAGES (SETTINGS)
const express = require("express")
const expressHandlebars = require("express-handlebars")
const sqlite3 = require("sqlite3")
const expressSession = require("express-session")

// APP GLOBAL VARIABLES VALUES
// text and numbers character limits
const max_chara_20 = 20
const max_chara_50 = 50
const max_chara_100 = 100

const min_chara_3 = 3
const min_chara_7 = 7
const min_chara_20 = 20

const min_project_id_number = 1

// user name and password values
const admin_username = "Bassima"
const admin_password = "2003"

// DATABASE NAME
const db = new sqlite3.Database("portfolio_database.db")

// PROJECTS TABLE
// (RUNS THE SQL QUERY AND RETURNS A DATABASE OBJECT)
db.run(`
	CREATE TABLE IF NOT EXISTS projects (
		id INTEGER PRIMARY KEY,
		project_name TEXT,
		project_sub_headline TEXT,
		project_description TEXT
	)`
)
// BLOG POSTS TABLE
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
// FAQS TABLE
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

// VARIABLE THAT WILL REPRESENT THE WHOLE APP
const app = express()

// SETS THE DEFAULT LAYOUT TO THE main.hbs FILE
app.engine("hbs", expressHandlebars.engine({
	defaultLayout: "main.hbs"
}))

// ADDS THE STATIC MIDDLEWARE FOR THE public FOLDER (CONTAINS STATIC FILES)
app.use (
	express.static("public")
)

// ADDS A MIDDLEWARE THAT PARSES INCOMING REQUESTS WITH URLENCODED PAYLOADS
app.use(
	express.urlencoded({
		extended: false
	})
)

// ADDS THE SESSION MIDDLEWARE TO THE APP
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

	// THIS QUERY SELECTS ALL FROM A CERTAIN TABLE
	const query = `SELECT * FROM projects`

	db.all(query, function(error, projects) {

		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			projects,
			error_messages 
		}

		res.render("projects.hbs", model)

	})
})

// DISPLAYS A SINGLE PROJECT DETAILS PAGE
app.get("/projects/:id", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM projects WHERE id = ?`
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]

	// (RUNS THE SQL QUERY AND RETURNS A DATABASE OBJECT RESULT ROW) 
	db.get(query, values, function(error, project) {

		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			project,
			error_messages
		}

		res.render("project_details.hbs", model)

	})

})

app.get("/projects/:id/project_blog", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM projects WHERE id = ? `
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]

	// (RUNS THE SQL QUERY AND RETURNS A DATABASE OBJECT RESULT ROW) 
	db.get(query, values, function(error, project) {
		// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
		const id = req.params.id
		// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
		const query = `SELECT * FROM blogs WHERE projectid = ? `
		// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
		const values = [id]

		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		// (RUNS THE SQL QUERY AND RETURNS ALL DATABASE OBJECT RESULT ROWA) 
		db.all(query, values, function(error, blogs) {

			if (error){
				error_messages.push("Internal server error!")
			}
	
			const model = {
				project,
				blogs,
				error_messages 
			}

			res.render("project_blog.hbs", model)
		})
	})
	
})

app.get("/projects/:id/project_faq", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM projects WHERE id = ? `
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]

	db.get(query, values, function(error, project) {
		// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
		const id = req.params.id
		// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
		const query = `SELECT * FROM faqs WHERE projectid = ? `
		// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
		const values = [id]

		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		// (RUNS THE SQL QUERY AND RETURNS ALL DATABASE OBJECT RESULT ROWA) 
		db.all(query, values, function(error, faqs) {

			if (error){
				error_messages.push("Internal server error!")
			}

			const model = {
				project,
				faqs,
				error_messages
			}

			res.render("project_faq.hbs", model)

		})
	})
	
})
// login page (only the admin can enter the correct values)
app.get("/login", function(req, res){
	res.render("login.hbs")
})

app.post("/login", function (req, res){
	// STORES THE KEY-VALUE PAIRS OF DATA (USERNAME, PASSWORD) SUBMITTED IN THE REQUEST BODY IN A VARIABLE
	const username = req.body.username
	const password = req.body.password

	// CHECKS IF THE USER INPUTES THE CORRECT USERNAME AND PASSWORD
	if (username == admin_username && password == admin_password){
		// SETS THE LOGIN SESSION TO TRUE
		req.session.isLoggedIn = true

		res.redirect("/dashboard")
	} else{
		const model = {
			// STORES THE LOGIN SESSION STATUS TO FALSE IN A VARIABLE
			failed_to_login: true
		}

		res.render("login.hbs", model)
	}
})

app.post("/logout", function(req, res) {
	const successfull_messages = []

	req.session.isLoggedIn = false

	if (isLoggedIn = false) {
		successfull_messages.push("Successfully logged out!")
		res.redirect("/")
	}

	if (successfull_messages.length) {
		const model = {
			successfull_messages,
		}
		res.render("/", model)
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
	// STORES THE KEY-VALUE PAIRS OF DATA (project_name, project_sub_headline, project_description) SUBMITTED IN THE REQUEST BODY IN VARIABLES
	const project_name = req.body.project_name
	const project_sub_headline = req.body.project_sub_headline
	const project_description = req.body.project_description

	const error_messages = []

	// CONDITIONS FOR THE PROJECT NAME
	if (project_name == "") {
		error_messages.push("Project name should not be empty")
	} else if (project_name.length > max_chara_20) {
		error_messages.push("Project name should be less than " + max_chara_20 + " characters")
	} else if (project_name.length < min_chara_3) {
		error_messages.push("Project name should be more than " + min_chara_3 + " characters")
	}

	// CONDITIONS FOR THE PROJECT SUB-HEADLINE
	if (project_sub_headline == "") {
		error_messages.push("Project sub-headline should not be empty")
	} else if (project_sub_headline.length > max_chara_50) {
		error_messages.push("Project sub-headline should be less than " + max_chara_50 + " characters")
	} else if (project_sub_headline.length < min_chara_7) {
		error_messages.push("Project sub-headline should be more than " + min_chara_7 + " characters")
	} 

	// CONDITIONS FOR THE PROJECT DESCRIPTION
	if (project_description == "") {
		error_messages.push("Project description should not be empty")
	} else if (project_description.length > max_chara_100) {
		error_messages.push("Project description should be less than " + max_chara_100 + " characters")
	} else if (project_description.length < min_chara_20) {
		error_messages.push("Project description should be more than " + min_chara_20 + " characters")
	}

	if (error_messages.length == 0){
		// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
		const query = `
		INSERT INTO projects (project_name, project_sub_headline, project_description) VALUES (?, ?, ?)
		`
		// STORES THE FETCHED VALUES INTO AN ARRAY
		const values = [project_name, project_sub_headline, project_description]

		db.run(query, values, function(error){
			if (error){

				error_messages.push("Internal server error!")
	
				const model = {
					project_name,
					project_sub_headline,
					project_description,
					error_messages,
					layout: "admin.hbs"
				}
	
				res.render("admin_projects.hbs", model)
			} else{
				res.redirect("/projects_edit")
			}
		})
	} else{
		const model = {
			project_name,
			project_sub_headline,
			project_description,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("admin_projects.hbs", model)
	}
	
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

	const error_messages = []

	if (post_title == "") {
		error_messages.push("Post title should not be empty")
	} else if (post_title.length > max_chara_20) {
		error_messages.push("Post title should be less than " + max_chara_20 + " characters")
	} else if (post_title.length < min_chara_3) {
		error_messages.push("Post title should be more than " + min_chara_3 + " characters")
	}

	if (post_text == "") {
		error_messages.push("Post text should not be empty")
	} else if (post_text.length > max_chara_100) {
		error_messages.push("Post text should be less than " + max_chara_100 + " characters")
	} else if (post_text.length < min_chara_20) {
		error_messages.push("Post text should be more than " + min_chara_20 + " characters")
	}

	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	}

	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	}

	if (error_messages.length == 0) {

		const query = `
			INSERT INTO blogs (post_title, post_text, post_date, projectid) VALUES (?, ?, ?, ?)
		`
		const values = [post_title, post_text, post_date, projectid]

		db.run(query, values, function(error){
			if (error){
				error_messages.push("Internal server error!")

				const model = {
					post_title,
					post_text,
					post_date,
					projectid,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("admin_blog.hbs", model)
			} else{
				res.redirect("/admin_blog")
			}
		})

	} else{
		const model = {
			post_title,
			post_text,
			post_date,
			projectid,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("admin_blog.hbs", model)
	}


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

	const error_messages = []

	if (post_question == "") {
		error_messages.push("Post question should not be empty")
	} else if (post_question.length > max_chara_20) {
		error_messages.push("Post question should be less than " + max_chara_20 + " characters")
	} else if (post_question.length < min_chara_3) {
		error_messages.push("Post question should be more than " + min_chara_3 + " characters")
	}

	if (post_answer == "") {
		error_messages.push("Post answer should not be empty")
	} else if (post_answer.length > max_chara_100) {
		error_messages.push("Post answer should be less than " + max_chara_100 + " characters")
	} else if (post_answer.length < min_chara_20) {
		error_messages.push("Post answer should be more than " + min_chara_20 + " characters")
	}

	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	}

	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	}

	if (error_messages.length == 0) {
		const query = `
			INSERT INTO faqs (post_question, post_answer, post_date, projectid) VALUES (?, ?, ?, ?)
		`
		const values = [post_question, post_answer, post_date, projectid]

		db.run(query, values, function(error){
			if (error){
				error_messages.push("Internal server error!")

				const model = {
					post_question,
					post_answer,
					post_date,
					projectid,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("admin_faq.hbs", model)
			} else{
				res.redirect("/admin_faq")
			}
		})
	} else{
		const model = {
			post_question,
			post_answer,
			post_date,
			projectid,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("admin_faq.hbs", model)
	}

	
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

	const error_messages = []

	// CONDITIONS FOR THE PROJECT NAME
	if (project_name == "") {
		error_messages.push("Project name should not be empty")
	} else if (project_name.length > max_chara_20) {
		error_messages.push("Project name should be less than " + max_chara_20 + " characters")
	} else if (project_name.length < min_chara_3) {
		error_messages.push("Project name should be more than " + min_chara_3 + " characters")
	}

	// CONDITIONS FOR THE PROJECT SUB-HEADLINE
	if (project_sub_headline == "") {
		error_messages.push("Project sub-headline should not be empty")
	} else if (project_sub_headline.length > max_chara_50) {
		error_messages.push("Project sub-headline should be less than " + max_chara_50 + " characters")
	} else if (project_sub_headline.length < min_chara_7) {
		error_messages.push("Project sub-headline should be more than " + min_chara_7 + " characters")
	} 

	// CONDITIONS FOR THE PROJECT DESCRIPTION
	if (project_description == "") {
		error_messages.push("Project description should not be empty")
	} else if (project_description.length > max_chara_100) {
		error_messages.push("Project description should be less than " + max_chara_100 + " characters")
	} else if (project_description.length < min_chara_20) {
		error_messages.push("Project description should be more than " + min_chara_20 + " characters")
	}


	if (error_messages.length == 0) {

		const query = `
			UPDATE projects SET project_name = ?, project_sub_headline = ?, project_description = ? WHERE id = ?
		`

		const values = [project_name, project_sub_headline, project_description, id]

		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					project_name,
					project_sub_headline,
					project_description,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("projects_edit.hbs", model)
			} else {
				res.redirect("/projects_edit")
			}
	
		})
	} else{

		const model = {
			id,
			project_name,
			project_sub_headline,
			project_description,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("projects_edit.hbs", model)
	}
	


	
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
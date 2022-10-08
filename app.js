// APP MAIN PACKAGES (SETTINGS)
const express = require("express")
const expressHandlebars = require("express-handlebars")
const sqlite3 = require("sqlite3")
const expressSession = require("express-session")
const like = require("like")
const multer  = require('multer')

// MIDDLEWARE FOR PICTURES
const storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, './public/images')
	},
	filename(req, file, cb) {
		console.log(file)
		cb(null, file.originalname)
	},
})
const upload = multer({
	storage
})

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

db.run(`PRAGMA foreign_keys = ON`)

// PROJECTS TABLE
// (RUNS THE SQL QUERY AND RETURNS A DATABASE OBJECT)
db.run(`
	CREATE TABLE IF NOT EXISTS projects (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		project_name TEXT,
		project_sub_headline TEXT,
		project_description TEXT
	)`
)
// BLOG POSTS TABLE
db.run(`
	CREATE TABLE IF NOT EXISTS blogs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		post_title TEXT,
		post_text TEXT,
		post_date TEXT,
		projectid INTEGER,
		FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE
	)`
)
// FAQS TABLE
db.run(`
	CREATE TABLE IF NOT EXISTS faqs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		post_question TEXT,
		post_answer TEXT,
		post_date TEXT,
		projectid INTEGER,
		FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE
	)`
)
// PICTURES TABLE
db.run(`
	CREATE TABLE IF NOT EXISTS pictures (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		picture_title TEXT,
		picture_name TEXT,
		projectid INTEGER,
		FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE
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
		secret: "hgkhkhgkshgkhkgjhlsj"
	})
)

// ADDS A MIDDLEWARE THAT CHECKS IF THE ADMIN IS LOGGED IN
app.use(function(req, res, next){
	const isLoggedIn = req.session.isLoggedIn

	res.locals.isLoggedIn = isLoggedIn
	
	next()
})

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

// DISPLAYS A SINGLE PROJECT BLOG PAGE
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

// DISPLAYS A SINGLE PROJECT FAQ PAGE
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

// DISPLAYS A SINGLE PROJECT PICTURES PAGE
app.get("/projects/:id/project_picture", function(req, res){
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
		const query = `SELECT * FROM pictures WHERE projectid = ? `
		// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
		const values = [id]

		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		// (RUNS THE SQL QUERY AND RETURNS ALL DATABASE OBJECT RESULT ROWA) 
		db.all(query, values, function(error, pictures) {

			if (error){
				error_messages.push("Internal server error!")
			}

			const model = {
				project,
				pictures,
				error_messages
			}

			res.render("project_picture.hbs", model)

		})
	})
	
})

// LOGIN PAGE (only the admin can enter the correct values)
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

// LOGOUT GET REQUEST
app.get("/logout", function (req, res){
	req.session.isLoggedIn = false
	res.redirect("/")
})


/*
	THE ADMIN SIDE PAGES
*/

// MAIN ADMIN PAGES (In the navigation bar)

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

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

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

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	// CONDITIONS FOR POST TITLE
	if (post_title == "") {
		error_messages.push("Post title should not be empty")
	} else if (post_title.length > max_chara_20) {
		error_messages.push("Post title should be less than " + max_chara_20 + " characters")
	} else if (post_title.length < min_chara_3) {
		error_messages.push("Post title should be more than " + min_chara_3 + " characters")
	}

	// CONDITIONS FOR POST TEXT
	if (post_text == "") {
		error_messages.push("Post text should not be empty")
	} else if (post_text.length > max_chara_100) {
		error_messages.push("Post text should be less than " + max_chara_100 + " characters")
	} else if (post_text.length < min_chara_20) {
		error_messages.push("Post text should be more than " + min_chara_20 + " characters")
	}

	// CONDITIONS FOR POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	}

	// CONDITIONS FOR PROJECT ID
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
				console.log(error)
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

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	// CONDITIONS FOR THE POST QUESTION
	if (post_question == "") {
		error_messages.push("Post question should not be empty")
	} else if (post_question.length > max_chara_20) {
		error_messages.push("Post question should be less than " + max_chara_20 + " characters")
	} else if (post_question.length < min_chara_3) {
		error_messages.push("Post question should be more than " + min_chara_3 + " characters")
	}

	// CONDITIONS FOR THE POST ANSWER
	if (post_answer == "") {
		error_messages.push("Post answer should not be empty")
	} else if (post_answer.length > max_chara_100) {
		error_messages.push("Post answer should be less than " + max_chara_100 + " characters")
	} else if (post_answer.length < min_chara_20) {
		error_messages.push("Post answer should be more than " + min_chara_20 + " characters")
	}

	// CONDITIONS FOR THE POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	}

	// CONDITIONS FOR THE PROJECT ID
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

// pictures add page
app.get("/admin_pictures", function(req, res){
	res.render("admin_pictures.hbs", {layout: "admin.hbs"})
})

app.post("/pictures/add", upload.single('picture_name'), function(req, res){
	const projectid = req.body.projectid
	const picture_title = req.body.picture_title
	const picture_name = req.file.picture_name

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	// CONDITIONS FOR PICTURE NAME
	if(picture_name == undefined) {
		error_messages.push("Project picture name should not be empty")
	}

	// CONDITIONS FOR THE PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	}

	// CONDITIONS FOR THE PROJECT PICTURE
	if (picture_title == "") {
		error_messages.push("Picture title should not be empty")
	} else if (picture_title.length > max_chara_20) {
		error_messages.push("Picture title should be less than " + max_chara_20 + " characters")
	} else if (picture_title.length < min_chara_3) {
		error_messages.push("Picture title should be more than " + min_chara_3 + " characters")
	}

	if (error_messages.length == 0) {
		const query = `
			INSERT INTO pictures (picture_title, picture_name, projectid) VALUES (?, ?, ?)
		`
		const values = [picture_title, picture_name, projectid]

		db.run(query, values, function(error){
			if (error){
				error_messages.push("Internal server error!")

				const model = {
					picture_title,
					picture_name,
					projectid,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("admin_pictures.hbs", model)
			} else{
				res.redirect("/admin_pictures")
			}
		})
	}else{
		const model = {
			picture_title,
			picture_name,
			projectid,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("admin_pictures.hbs", model)
	}

})

//INSIDE THE MAIN ADMIN PAGES

//projects (edit, remove, edit projects table search)
app.get("/projects_edit", function(req, res){

	const query = `SELECT * FROM projects`

	db.all(query, function(error, projects) {

		const access_error_messages = []

		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}

		if (error){
			access_error_messages.push("Internal server error!")
		}

		const model = {
			projects,
			access_error_messages,
			layout: "admin.hbs"
		}

		res.render("projects_edit.hbs", model)
	}) 

})

app.post("/projects/edit/:id", function(req, res){
	const id = req.params.id
	const editable_project_id = req.body.editable_project_id
	const project_name = req.body.project_name
	const project_sub_headline = req.body.project_sub_headline
	const project_description = req.body.project_description

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

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
			UPDATE projects SET project_name = ?, project_sub_headline = ?, project_description = ?, id = ? WHERE id = ?
		`

		const values = [project_name, project_sub_headline, project_description, editable_project_id, id]

		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					project_name,
					project_sub_headline,
					project_description,
					editable_project_id,
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
			editable_project_id,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("projects_edit.hbs", model)
	}

})

app.get("/projects_remove", function(req, res){
	const query = `SELECT * FROM projects`

	db.all(query, function(error, projects) {
		const access_error_messages = []

		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}

		if (error){
			access_error_messages.push("Internal server error!")
		}

		const model = {
			projects,
			access_error_messages,
			layout: "admin.hbs"
		}

		res.render("projects_remove.hbs", model)
	}) 
})

app.post("/projects/remove/:id", function(req, res){
	const id = req.params.id

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	if (error_messages.length == 0) {

		const query = `
			DELETE FROM projects WHERE id = ?
		`
	
		const values = [id]
	
		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("projects_remove.hbs", model)
			} else {
				res.redirect("/projects_remove")
			}
	
		})
	} else{
		const model = {
			id,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("projects_remove.hbs", model)
	}

})
// PROJECTS TABLE SEARCH FUNCTION
app.get("/projects_edit_search", function(req, res){
	const searched_value = req.query.project_table_search

	const search_error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}

	if (search_error_messages.length == 0 && searched_value) {
		// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
		const query = `
		SELECT * FROM projects WHERE id LIKE ? OR project_name LIKE ? OR project_sub_headline LIKE ? OR project_description LIKE ?
		`
		const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]

		db.all(query, values, function(error, projects){
			if (error){
				search_error_messages.push("Internal server error (related to the search function)!")

				const model = {
					searched_value,
					search_error_messages,
					projects,
					layout: "admin.hbs"
				}

				res.render("projects_edit.hbs", model)
			} else{

				const model = {
					searched_value,
					search_error_messages,
					projects,
					layout: "admin.hbs"
				}
				res.render("projects_edit.hbs", model)
			}
		})
	} else{
		const model = {
			searched_value,
			search_error_messages,
			projects,
			layout: "admin.hbs"
		}

		res.render("projects_edit.hbs", model)
	}

})

//blog (edit, remove, edit blogs table search)
app.get("/blog_edit", function(req, res){
	
	const query = `SELECT * FROM blogs`

	db.all(query, function(error, blogs) {
		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			blogs,
			error_messages,
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

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	// CONDITIONS FOR POST TITLE
	if (post_title == "") {
		error_messages.push("Post title should not be empty")
	} else if (post_title.length > max_chara_20) {
		error_messages.push("Post title should be less than " + max_chara_20 + " characters")
	} else if (post_title.length < min_chara_3) {
		error_messages.push("Post title should be more than " + min_chara_3 + " characters")
	}

	// CONDITIONS FOR POST TEXT
	if (post_text == "") {
		error_messages.push("Post text should not be empty")
	} else if (post_text.length > max_chara_100) {
		error_messages.push("Post text should be less than " + max_chara_100 + " characters")
	} else if (post_text.length < min_chara_20) {
		error_messages.push("Post text should be more than " + min_chara_20 + " characters")
	}

	// CONDITIONS FOR POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	}

	// CONDITIONS FOR PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	}

	if (error_messages.length == 0) {

		const query = `
			UPDATE blogs SET post_title = ?, post_text = ?, post_date = ?, projectid = ? WHERE id = ?
		`

		const values = [post_title, post_text, post_date, projectid, id]

		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					post_title,
					post_text,
					post_date,
					projectid,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("blog_edit.hbs", model)
			} else {
				res.redirect("/blog_edit")
			}

		})

	} else{
		const model = {
			id,
			post_title,
			post_text,
			post_date,
			projectid,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("blog_edit.hbs", model)
	}

})

app.get("/blog_remove", function(req, res){
	const query = `SELECT * FROM blogs`

	db.all(query, function(error, blogs) {
		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			blogs,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("blog_remove.hbs", model)
	}) 
})

app.post("/blogs/remove/:id", function(req, res){
	const id = req.params.id

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	if (error_messages.length == 0) {

		const query = `
			DELETE FROM blogs WHERE id = ?
		`
	
		const values = [id]
	
		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("blog_remove.hbs", model)
			} else {
				res.redirect("/blog_remove")
			}
	
		})
	} else{
		const model = {
			id,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("blog_remove.hbs", model)
	}
})
// BLOGS TABLE EDIT SEARCH FUNCTION
app.get("/blog_edit_search", function(req, res){
	const searched_value = req.query.blog_table_search

	const search_error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}

	if (search_error_messages.length == 0 && searched_value) {
		// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
		const query = `
		SELECT * FROM blogs WHERE post_title LIKE ? OR post_text LIKE ? OR post_date LIKE ? OR projectid LIKE ?
		`
		const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]

		db.all(query, values, function(error, blogs){
			if (error){
				search_error_messages.push("Internal server error (related to the search function)!")

				const model = {
					searched_value,
					search_error_messages,
					blogs,
					layout: "admin.hbs"
				}

				res.render("blog_edit.hbs", model)
			} else{

				const model = {
					searched_value,
					search_error_messages,
					blogs,
					layout: "admin.hbs"
				}
				res.render("blog_edit.hbs", model)
			}
		})
	} else{
		const model = {
			searched_value,
			search_error_messages,
			blogs,
			layout: "admin.hbs"
		}

		res.render("blog_edit.hbs", model)
	}

})

//faq (edit, remove, edit faq table search)
app.get("/faq_edit", function(req, res){
		
	const query = `SELECT * FROM faqs`

	db.all(query, function(error, faqs) {
		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			faqs,
			error_messages,
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

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	// CONDITIONS FOR THE POST QUESTION
	if (post_question == "") {
		error_messages.push("Post question should not be empty")
	} else if (post_question.length > max_chara_20) {
		error_messages.push("Post question should be less than " + max_chara_20 + " characters")
	} else if (post_question.length < min_chara_3) {
		error_messages.push("Post question should be more than " + min_chara_3 + " characters")
	}

	// CONDITIONS FOR THE POST ANSWER
	if (post_answer == "") {
		error_messages.push("Post answer should not be empty")
	} else if (post_answer.length > max_chara_100) {
		error_messages.push("Post answer should be less than " + max_chara_100 + " characters")
	} else if (post_answer.length < min_chara_20) {
		error_messages.push("Post answer should be more than " + min_chara_20 + " characters")
	}

	// CONDITIONS FOR THE POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	}

	// CONDITIONS FOR THE PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	}

	if (error_messages.length == 0) {
		const query = `
			UPDATE faqs SET post_question = ?, post_answer = ?, post_date = ?, projectid = ? WHERE id = ?
		`
	
		const values = [post_question, post_answer, post_date, projectid, id]
	
		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					post_question,
					post_answer,
					post_date,
					projectid,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("faq_edit.hbs", model)
			} else {
				res.redirect("/faq_edit")
			}
	
		})

	} else{
		const model = {
			id,
			post_question,
			post_answer,
			post_date,
			projectid,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("faq_edit.hbs", model)
	}
})

app.get("/faq_remove", function(req, res){
	const query = `SELECT * FROM faqs`

	db.all(query, function(error, faqs) {
		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			faqs,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("faq_remove.hbs", model)
	}) 
})

app.post("/faqs/remove/:id", function(req, res){
	const id = req.params.id

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	if (error_messages.length == 0) {

		const query = `
			DELETE FROM faqs WHERE id = ?
		`
	
		const values = [id]
	
		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("faq_remove.hbs", model)
			} else {
				res.redirect("/faq_remove")
			}
	
		})
	} else{
		const model = {
			id,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("faq_remove.hbs", model)
	}
})
// FAQ TABLE EDIT SEARCH FUNCTION
app.get("/faq_edit_search", function(req, res){
	const searched_value = req.query.faq_table_search

	const search_error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}

	if (search_error_messages.length == 0 && searched_value) {
		// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
		const query = `
		SELECT * FROM faqs WHERE post_question LIKE ? OR post_answer LIKE ? OR post_date LIKE ? OR projectid LIKE ?
		`
		const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]

		db.all(query, values, function(error, faqs){
			if (error){
				search_error_messages.push("Internal server error (related to the search function)!")

				const model = {
					searched_value,
					search_error_messages,
					faqs,
					layout: "admin.hbs"
				}

				res.render("faq_edit.hbs", model)
			} else{

				const model = {
					searched_value,
					search_error_messages,
					faqs,
					layout: "admin.hbs"
				}
				res.render("faq_edit.hbs", model)
			}
		})
	} else{
		const model = {
			searched_value,
			search_error_messages,
			faqs,
			layout: "admin.hbs"
		}

		res.render("faq_edit.hbs", model)
	}

})

//pictures (edit, remove)
app.get("/picture_edit", function(req, res){
	
	const query = `SELECT * FROM pictures`

	db.all(query, function(error, pictures) {
		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			pictures,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("picture_edit.hbs", model)
	}) 
})

app.post("/pictures/edit/:id", function(req, res){
	const id = req.params.id
	const picture_title = req.body.picture_title
	const projectid = req.body.projectid

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	// CONDITIONS FOR THE PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	}

	// CONDITIONS FOR THE PROJECT PICTURE
	if (picture_title == "") {
		error_messages.push("Picture title should not be empty")
	} else if (picture_title.length > max_chara_20) {
		error_messages.push("Picture title should be less than " + max_chara_20 + " characters")
	} else if (picture_title.length < min_chara_3) {
		error_messages.push("Picture title should be more than " + min_chara_3 + " characters")
	}

	if (error_messages.length == 0) {
		const query = `
			UPDATE pictures SET picture_title = ?, projectid = ? WHERE id = ?
		`
	
		const values = [picture_title, projectid, id]
	
		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					picture_title,
					projectid,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("picture_edit.hbs", model)
			} else {
				res.redirect("/picture_edit")
			}
	
		})

	} else{
		const model = {
			id,
			picture_title,
			projectid,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("picture_edit.hbs", model)
	}
})

app.get("/picture_remove", function(req, res){
	const query = `SELECT * FROM pictures`

	db.all(query, function(error, pictures) {
		const error_messages = []

		if (error){
			error_messages.push("Internal server error!")
		}

		const model = {
			pictures,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("picture_remove.hbs", model)
	}) 
})

app.post("/pictures/remove/:id", function(req, res){
	const id = req.params.id

	const error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}

	if (error_messages.length == 0) {

		const query = `
			DELETE FROM pictures WHERE id = ?
		`
	
		const values = [id]
	
		db.run(query, values, function(error) {
			if(error) {
				error_messages.push("Internal server error!")

				const model = {
					id,
					error_messages,
					layout: "admin.hbs"
				}

				res.render("picture_remove.hbs", model)
			} else {
				res.redirect("/picture_remove")
			}
	
		})
	} else{
		const model = {
			id,
			error_messages,
			layout: "admin.hbs"
		}

		res.render("picture_remove.hbs", model)
	}
})
// FAQ TABLE EDIT SEARCH FUNCTION
app.get("/picture_edit_search", function(req, res){
	const searched_value = req.query.picture_table_search

	const search_error_messages = []

	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}

	if (search_error_messages.length == 0 && searched_value) {
		// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
		const query = `
		SELECT * FROM pictures WHERE picture_title LIKE ? OR picture_name LIKE ? OR projectid LIKE ?
		`
		const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]

		db.all(query, values, function(error, pictures){
			if (error){
				search_error_messages.push("Internal server error (related to the search function)!")

				const model = {
					searched_value,
					search_error_messages,
					pictures,
					layout: "admin.hbs"
				}

				res.render("picture_edit.hbs", model)
			} else{

				const model = {
					searched_value,
					search_error_messages,
					pictures,
					layout: "admin.hbs"
				}
				res.render("picture_edit.hbs", model)
			}
		})
	} else{
		const model = {
			searched_value,
			search_error_messages,
			pictures,
			layout: "admin.hbs"
		}

		res.render("picture_edit.hbs", model)
	}

})

// LISTENS TO THE CHOSEN PORT NUMBER
app.listen(8080)
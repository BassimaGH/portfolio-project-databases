// APP MAIN PACKAGES (SETTINGS)
const express = require("express")
const expressHandlebars = require("express-handlebars")
const expressSession = require("express-session")
const like = require("like")
const multer  = require('multer')
const bcrypt = require('bcrypt')
const db = require("./db")
const fs = require("node:fs")

// APP GLOBAL VARIABLES VALUES
// text and numbers character limits
const max_chara_20 = 20
const max_chara_50 = 50
const max_chara_100 = 100

const min_chara_3 = 3
const min_chara_7 = 7
const min_chara_20 = 20

const min_project_id_number = 1

// REGULAR EXPRESSIONS
const numbers_regex = /^[0-9.,-/]+$/
const date_regex = /^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/

// user name and password values
const admin_username = "Bassima"
const admin_password_hash = "$2b$10$ErbFbAUqXYS8JsCHg0PRj.Odi53ib.MnWBrpWdE0aIDMskXA1zTCu"

// VARIABLE THAT WILL REPRESENT THE WHOLE APP
const app = express()

// SETS THE DEFAULT LAYOUT TO THE main.hbs FILE
app.engine("hbs", expressHandlebars.engine({
	defaultLayout: "main.hbs"
}))

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
		secret: "hgkhkhgkshgkhkgjhlsj",
		cookie: {
			expires: 360000
		}
	})
)

// ADDS A MIDDLEWARE THAT CHECKS IF THE ADMIN IS LOGGED IN
app.use(function(req, res, next){
	const isLoggedIn = req.session.isLoggedIn

	if(isLoggedIn) {
		res.locals.isLoggedIn = isLoggedIn
	}

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

// projects main page (ADDED IN THE DB.JS)
app.get("/projects", function(req, res){
	db.get_all_projects(function(error, projects) {
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

// DISPLAYS A SINGLE PROJECT DETAILS PAGE (ADDED IN THE DB.JS)
app.get("/projects/:id", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	// (RUNS THE SQL QUERY AND RETURNS A DATABASE OBJECT RESULT ROW) 
	db.get_project_by_id(id, function(error, project) {
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

// DISPLAYS A SINGLE PROJECT BLOG PAGE (ADDED IN THE DB.JS)
app.get("/projects/:id/project_blog", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	db.get_project_by_id(id, function(error, project) {
		const id = req.params.id
		const error_messages = []
		if (error){
			error_messages.push("Internal server error!")
		}
		db.get_blogs_by_project_id(id, function(error, blogs){
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

// DISPLAYS A SINGLE PROJECT FAQ PAGE (ADDED IN THE DB.JS)
app.get("/projects/:id/project_faq", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	db.get_project_by_id(id, function(error, project) {
		const id = req.params.id
		const error_messages = []
		if (error){
			error_messages.push("Internal server error!")
		}
		db.get_faqs_by_project_id(id, function(error, faqs){
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

// DISPLAYS A SINGLE PROJECT PICTURES PAGE (ADDED IN THE DB.JS)
app.get("/projects/:id/project_picture", function(req, res){
	// REQUESTS THE ID FROM AN OBJECT CONTAINING PROPERTIES MAPPED TO THE NAMED ROUTE “parameters” (GETS THE ID VALUE FROM A URL LIKE "/projects/:id")
	const id = req.params.id
	db.get_project_by_id(id, function(error, project) {
		const id = req.params.id
		const error_messages = []
		if (error){
			error_messages.push("Internal server error!")
		}
		db.get_pictures_by_project_id(id, function(error, pictures){
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
	const correct_password = bcrypt.compareSync(password, admin_password_hash)
	// CHECKS IF THE USER INPUTES THE CORRECT USERNAME AND PASSWORD
	if (username == admin_username && correct_password == true){
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

// projects add page (ADDED IN THE DB.JS)
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
	} else if (numbers_regex.test(project_name)) {
		error_messages.push("Project name should not consist of numbers only")
	}
	// CONDITIONS FOR THE PROJECT SUB-HEADLINE
	if (project_sub_headline == "") {
		error_messages.push("Project sub-headline should not be empty")
	} else if (project_sub_headline.length > max_chara_50) {
		error_messages.push("Project sub-headline should be less than " + max_chara_50 + " characters")
	} else if (project_sub_headline.length < min_chara_7) {
		error_messages.push("Project sub-headline should be more than " + min_chara_7 + " characters")
	} else if (numbers_regex.test(project_sub_headline)) {
		error_messages.push("Project sub-headline should not consist of numbers only")
	}
	// CONDITIONS FOR THE PROJECT DESCRIPTION
	if (project_description == "") {
		error_messages.push("Project description should not be empty")
	} else if (project_description.length > max_chara_100) {
		error_messages.push("Project description should be less than " + max_chara_100 + " characters")
	} else if (project_description.length < min_chara_20) {
		error_messages.push("Project description should be more than " + min_chara_20 + " characters")
	} else if (numbers_regex.test(project_description)) {
		error_messages.push("Project description should not consist of numbers only")
	}
	if (error_messages.length == 0){
		db.add_project(project_name, project_sub_headline, project_description, function(error){
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

// blog add page (ADDED IN THE DB.JS)
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
	} else if (numbers_regex.test(post_title)) {
		error_messages.push("Post title should not consist of numbers only")
	}
	// CONDITIONS FOR POST TEXT
	if (post_text == "") {
		error_messages.push("Post text should not be empty")
	} else if (post_text.length > max_chara_100) {
		error_messages.push("Post text should be less than " + max_chara_100 + " characters")
	} else if (post_text.length < min_chara_20) {
		error_messages.push("Post text should be more than " + min_chara_20 + " characters")
	} else if (numbers_regex.test(post_text)) {
		error_messages.push("Post text should not consist of numbers only")
	}
	// CONDITIONS FOR POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	} else if (!(date_regex.test(post_date))) {
		error_messages.push("Wrong date format")
	}
	// CONDITIONS FOR PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	} else if (isNaN(projectid)) {
		error_messages.push("Project Id should be a number")
	}
	if (error_messages.length == 0) {
		db.add_blog(post_title, post_text, post_date, projectid, function(error){
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
				res.redirect("/blog_edit")
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

// faq add page (ADDED IN THE DB.JS)
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
	} else if (numbers_regex.test(post_question)) {
		error_messages.push("Post question should not consist of numbers only")
	}
	// CONDITIONS FOR THE POST ANSWER
	if (post_answer == "") {
		error_messages.push("Post answer should not be empty")
	} else if (post_answer.length > max_chara_100) {
		error_messages.push("Post answer should be less than " + max_chara_100 + " characters")
	} else if (post_answer.length < min_chara_20) {
		error_messages.push("Post answer should be more than " + min_chara_20 + " characters")
	} else if (numbers_regex.test(post_answer)) {
		error_messages.push("Post answer should not consist of numbers only")
	}
	// CONDITIONS FOR THE POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	} else if (!(date_regex.test(post_date))) {
		error_messages.push("Wrong date format")
	}
	// CONDITIONS FOR THE PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	} else if (isNaN(projectid)) {
		error_messages.push("Project Id should be a number")
	}
	if (error_messages.length == 0) {
		db.add_faq(post_question, post_answer, post_date, projectid, function(error){
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
				res.redirect("/faq_edit")
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

// pictures add page (ADDED IN THE DB.JS)
app.get("/admin_pictures", function(req, res){
	res.render("admin_pictures.hbs", {layout: "admin.hbs"})
})

app.post("/pictures/add", upload.single('picture_name'), function(req, res){
	const projectid = req.body.projectid
	const picture_title = req.body.picture_title
	const image_path = "./public/images/" + req.file.originalname
	let picture_name
	const error_messages = []
	if(req.file) {
		if(req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
			picture_name = req.file.originalname
		} else {
			error_messages.push("Only .png, .jpg and .jpeg are accepted")
			fs.unlink(image_path, (error) => {
				if (error){
					error_messages.push("Only .png, .jpg and .jpeg are accepted")
				}
			})
		}
	} else {
		// CONDITIONS FOR PICTURE NAME
		error_messages.push("You need to add an image!")
	}
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
	console.log(error_messages)
	if (error_messages.length == 0) {
		db.add_picture(picture_title, picture_name, projectid, function(error){
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
				res.redirect("/picture_edit")
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

//projects (edit, remove, edit projects table search) (ADDED IN THE DB.JS)
app.get("/projects_edit", function(req, res){
	db.get_all_projects(function(error, projects) {
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
	} else if (numbers_regex.test(project_name)) {
		error_messages.push("Project name should not consist of numbers only")
	}
	// CONDITIONS FOR THE PROJECT SUB-HEADLINE
	if (project_sub_headline == "") {
		error_messages.push("Project sub-headline should not be empty")
	} else if (project_sub_headline.length > max_chara_50) {
		error_messages.push("Project sub-headline should be less than " + max_chara_50 + " characters")
	} else if (project_sub_headline.length < min_chara_7) {
		error_messages.push("Project sub-headline should be more than " + min_chara_7 + " characters")
	} else if (numbers_regex.test(project_sub_headline)) {
		error_messages.push("Project sub-headline should not consist of numbers only")
	}
	// CONDITIONS FOR THE PROJECT DESCRIPTION
	if (project_description == "") {
		error_messages.push("Project description should not be empty")
	} else if (project_description.length > max_chara_100) {
		error_messages.push("Project description should be less than " + max_chara_100 + " characters")
	} else if (project_description.length < min_chara_20) {
		error_messages.push("Project description should be more than " + min_chara_20 + " characters")
	} else if (numbers_regex.test(project_description)) {
		error_messages.push("Project description should not consist of numbers only")
	}
	if (error_messages.length == 0) {
		db.edit_project(project_name, project_sub_headline, project_description, id, function(error){
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
		db.get_all_projects(function(error, projects) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				error_messages.push("You have to login!")
			}
			if (error){
				error_messages.push("Internal server error!")
			}
			const model = {
				projects,
				error_messages,
				layout: "admin.hbs"
			}
			res.render("projects_edit.hbs", model)
		})
	}
})

app.get("/projects_remove", function(req, res){
	db.get_all_projects(function(error, projects) {
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
		db.remove_project(id, function(error){
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
// PROJECTS TABLE SEARCH FUNCTION (ADDED IN THE DB.JS)
app.get("/projects_edit_search", function(req, res){
	const searched_value = req.query.project_table_search
	const search_error_messages = []
	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}
	if(searched_value.length == 0) {
		search_error_messages.push("You have to enter a value")
	} else if (searched_value.trim() == "") {
		search_error_messages.push("You have to enter a value (not only spaces)")
	} else if (searched_value === null) {
		search_error_messages.push("The value does not exist")
	}
	if (search_error_messages.length == 0 && searched_value !== null) {
		db.search_projects(searched_value, function(error, projects){
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
		db.get_all_projects(function(error, projects) {
			const error_messages = []
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				error_messages.push("You have to login!")
			}
			if (error){
				error_messages.push("Internal server error!")
			}
			const model = {
				projects,
				error_messages,
				layout: "admin.hbs"
			}
			res.render("projects_edit.hbs", model)
		})
	}
})

//blog (edit, remove, edit blogs table search) (ADDED IN THE DB.JS)
app.get("/blog_edit", function(req, res){
	db.get_all_blogs(function(error, blogs) {
		const access_error_messages = []
		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}
		if (error){
			access_error_messages.push("Internal server error!")
		}
		const model = {
			blogs,
			access_error_messages,
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
	} else if (numbers_regex.test(post_title)) {
		error_messages.push("Post title should not consist of numbers only")
	}
	// CONDITIONS FOR POST TEXT
	if (post_text == "") {
		error_messages.push("Post text should not be empty")
	} else if (post_text.length > max_chara_100) {
		error_messages.push("Post text should be less than " + max_chara_100 + " characters")
	} else if (post_text.length < min_chara_20) {
		error_messages.push("Post text should be more than " + min_chara_20 + " characters")
	} else if (numbers_regex.test(post_text)) {
		error_messages.push("Post text should not consist of numbers only")
	}
	// CONDITIONS FOR POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	} else if (!(date_regex.test(post_date))) {
		error_messages.push("Wrong date format")
	}
	// CONDITIONS FOR PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	} else if (isNaN(projectid)) {
		error_messages.push("Project Id should be a number")
	}
	if (error_messages.length == 0) {
		db.edit_blog(post_title, post_text, post_date, projectid, id, function(error){
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
		db.get_all_blogs(function(error, blogs) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				error_messages.push("You have to login!")
			}
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
	}
})

app.get("/blog_remove", function(req, res){
	db.get_all_blogs(function(error, blogs) {
		const access_error_messages = []
		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}
		if (error){
			access_error_messages.push("Internal server error!")
		}
		const model = {
			blogs,
			access_error_messages,
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
		db.remove_blog(id, function(error){
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
// BLOGS TABLE EDIT SEARCH FUNCTION (ADDED IN THE DB.JS)
app.get("/blog_edit_search", function(req, res){
	const searched_value = req.query.blog_table_search
	const search_error_messages = []
	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}
	if(searched_value.length == 0) {
		search_error_messages.push("You have to enter a value")
	} else if (searched_value.trim() == "") {
		search_error_messages.push("You have to enter a value (not only spaces)")
	}
	if (search_error_messages.length == 0 && searched_value) {
		db.search_blogs(searched_value, function(error, blogs){
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
		db.get_all_blogs(function(error, blogs) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				search_error_messages.push("You have to login!")
			}
			if (error){
				search_error_messages.push("Internal server error!")
			}
			const model = {
				blogs,
				search_error_messages,
				layout: "admin.hbs"
			}
			res.render("blog_edit.hbs", model)
		})
	}
})

//faq (edit, remove, edit faq table search) (ADDED IN THE DB.JS)
app.get("/faq_edit", function(req, res){
	db.get_all_faqs(function(error, faqs) {
		const access_error_messages = []
		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}
		if (error){
			access_error_messages.push("Internal server error!")
		}
		const model = {
			faqs,
			access_error_messages,
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
	} else if (numbers_regex.test(post_question)) {
		error_messages.push("Post question should not consist of numbers only")
	}
	// CONDITIONS FOR THE POST ANSWER
	if (post_answer == "") {
		error_messages.push("Post answer should not be empty")
	} else if (post_answer.length > max_chara_100) {
		error_messages.push("Post answer should be less than " + max_chara_100 + " characters")
	} else if (post_answer.length < min_chara_20) {
		error_messages.push("Post answer should be more than " + min_chara_20 + " characters")
	} else if (numbers_regex.test(post_answer)) {
		error_messages.push("Post answer should not consist of numbers only")
	}
	// CONDITIONS FOR THE POST DATE
	if (post_date == "") {
		error_messages.push("Post date should not be empty")
	} else if (!(date_regex.test(post_date))) {
		error_messages.push("Wrong date format")
	}
	// CONDITIONS FOR THE PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	} else if (isNaN(projectid)) {
		error_messages.push("Project Id should be a number")
	}
	if (error_messages.length == 0) {
		db.edit_faq(post_question, post_answer, post_date, projectid, id, function(error){
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
		db.get_all_faqs(function(error, faqs) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				error_messages.push("You have to login!")
			}
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
	}
})

app.get("/faq_remove", function(req, res){
	db.get_all_faqs(function(error, faqs) {
		const access_error_messages = []
		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}
		if (error){
			access_error_messages.push("Internal server error!")
		}
		const model = {
			faqs,
			access_error_messages,
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
		db.remove_faq(id, function(error){
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
// FAQS TABLE EDIT SEARCH FUNCTION (ADDED IN THE DB.JS)
app.get("/faq_edit_search", function(req, res){
	const searched_value = req.query.faq_table_search
	const search_error_messages = []
	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}
	if(searched_value.length == 0) {
		search_error_messages.push("You have to enter a value")
	} else if (searched_value.trim() == "") {
		search_error_messages.push("You have to enter a value (not only spaces)")
	}
	if (search_error_messages.length == 0 && searched_value) {
		db.search_faqs(searched_value, function(error, faqs){
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
		db.get_all_faqs(function(error, faqs) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				search_error_messages.push("You have to login!")
			}
			if (error){
				search_error_messages.push("Internal server error!")
			}
			const model = {
				faqs,
				search_error_messages,
				layout: "admin.hbs"
			}
			res.render("faq_edit.hbs", model)
		})
	}
})

//pictures (edit, remove) (ADDED IN THE DB.JS)
app.get("/picture_edit", function(req, res){
	db.get_all_pictures(function(error, pictures) {
		const access_error_messages = []
		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}
		if (error){
			access_error_messages.push("Internal server error!")
		}
		const model = {
			pictures,
			access_error_messages,
			layout: "admin.hbs"
		}
		res.render("picture_edit.hbs", model)
	})
})

app.post("/pictures/edit/:id", upload.single('picture_name'), function(req, res){
	const id = req.params.id
	const picture_title = req.body.picture_title
	const projectid = req.body.projectid
	const image_path = "./public/images/" + req.file.originalname
	let picture_name
	const error_messages = []
	if(req.file) {
		if(req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
			picture_name = req.file.originalname
		} else {
			error_messages.push("Only .png, .jpg and .jpeg are accepted")
			fs.unlink(image_path, (error) => {
				if (error){
					error_messages.push("Only .png, .jpg and .jpeg are accepted")
				}
			})
		}
	} else {
		error_messages.push("You need to add an image!")
	}
	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		error_messages.push("You have to login!")
	}
	// CONDITIONS FOR THE PROJECT ID
	if (projectid == "") {
		error_messages.push("Project id should not be empty")
	} else if (projectid < min_project_id_number) {
		error_messages.push("Project id should not be less than " + min_project_id_number)
	} else if (isNaN(projectid)) {
		error_messages.push("Project Id should be a number")
	}
	// CONDITIONS FOR THE PROJECT PICTURE
	if (picture_title == "") {
		error_messages.push("Picture title should not be empty")
	} else if (picture_title.length > max_chara_20) {
		error_messages.push("Picture title should be less than " + max_chara_20 + " characters")
	} else if (picture_title.length < min_chara_3) {
		error_messages.push("Picture title should be more than " + min_chara_3 + " characters")
	} else if (numbers_regex.test(picture_title)) {
		error_messages.push("Picture title should not consist of numbers only")
	}
	if (error_messages.length == 0) {
		db.edit_picture(picture_title, projectid, picture_name, id, function(error){
			if(error) {
				error_messages.push("Internal server error!")
				const model = {
					id,
					picture_title,
					projectid,
					picture_name,
					error_messages,
					layout: "admin.hbs"
				}
				res.render("picture_edit.hbs", model)
			} else {
				res.redirect("/picture_edit")
			}
		})
	} else{
		db.get_all_pictures(function(error, pictures) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				error_messages.push("You have to login!")
			}
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
	}
})

app.get("/picture_remove", function(req, res){
	db.get_all_pictures(function(error, pictures) {
		const access_error_messages = []
		// CONDITIONS AGAINST HACKERS
		if(!req.session.isLoggedIn){
			access_error_messages.push("You have to login!")
		}
		if (error){
			access_error_messages.push("Internal server error!")
		}
		const model = {
			pictures,
			access_error_messages,
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
		db.remove_picture(id, function(error){
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
// PICTURES TABLE EDIT SEARCH FUNCTION (ADDED IN THE DB.JS)
app.get("/picture_edit_search", function(req, res){
	const searched_value = req.query.picture_table_search
	const search_error_messages = []
	// CONDITIONS AGAINST HACKERS
	if(!req.session.isLoggedIn){
		search_error_messages.push("You have to login!")
	}
	if(searched_value.length == 0) {
		search_error_messages.push("You have to enter a value")
	} else if (searched_value.trim() == "") {
		search_error_messages.push("You have to enter a value (not only spaces)")
	}
	if (search_error_messages.length == 0 && searched_value) {
		db.search_pictures(searched_value, function(error, pictures){
			if (error){
				search_error_messages.push("Internal server error (related to the search function)!")
				const model = {
					searched_value,
					search_error_messages,
					pictures,
					layout: "admin.hbs"
				}
				res.render("faq_edit.hbs", model)
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
		db.get_all_pictures(function(error, pictures) {
			// CONDITIONS AGAINST HACKERS
			if(!req.session.isLoggedIn){
				search_error_messages.push("You have to login!")
			}
			if (error){
				search_error_messages.push("Internal server error!")
			}
			const model = {
				pictures,
				search_error_messages,
				layout: "admin.hbs"
			}
			res.render("picture_edit.hbs", model)
		})
	}
})

// LISTENS TO THE CHOSEN PORT NUMBER
app.listen(8080)
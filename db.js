const sqlite3 = require("sqlite3")

// DATABASE NAME
const db = new sqlite3.Database("portfolio_database.db")


// (RUNS THE SQL QUERY AND RETURNS A DATABASE OBJECT)
db.run(`PRAGMA foreign_keys = ON`)

// PROJECTS TABLE
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
		FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE
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
		FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE
	)`
)

// PICTURES TABLE
db.run(`
	CREATE TABLE IF NOT EXISTS pictures (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		picture_title TEXT,
		picture_name TEXT,
		projectid INTEGER,
		FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE
	)`
)

/*
	ALL GET REQUESTS
*/

// GETS ALL THE DATA FROM A TABLE
exports.get_all_projects = function(callback){
	// THIS QUERY SELECTS ALL FROM A CERTAIN TABLE
	const query = `SELECT * FROM projects`
	db.all(query, function(error, projects) {
		callback(error, projects)
	})
}
exports.get_all_blogs = function(callback){
	// THIS QUERY SELECTS ALL FROM A CERTAIN TABLE
	const query = `SELECT * FROM blogs`
	db.all(query, function(error, blogs) {
		callback(error, blogs)
	})
}
exports.get_all_faqs = function(callback){
	// THIS QUERY SELECTS ALL FROM A CERTAIN TABLE
	const query = `SELECT * FROM faqs`
	db.all(query, function(error, faqs) {
		callback(error, faqs)
	})
}
exports.get_all_pictures = function(callback){
	// THIS QUERY SELECTS ALL FROM A CERTAIN TABLE
	const query = `SELECT * FROM pictures`
	db.all(query, function(error, pictures) {
		callback(error, pictures)
	})
}

// GETS ALL THE DATA IN A TABLE RELATED TO THE PROJECTS TABLE
exports.get_project_by_id = function(id, callback){
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM projects WHERE id = ?`
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]
	db.get(query, values, function(error, projects) {
		callback(error, projects)
	})
}
exports.get_blogs_by_project_id = function(id, callback){
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM blogs WHERE projectid = ? `
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]
	db.all(query, values, function(error, blogs) {
		callback(error, blogs)
	})
}
exports.get_faqs_by_project_id = function(id, callback){
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM faqs WHERE projectid = ? `
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]
	db.all(query, values, function(error, faqs) {
		callback(error, faqs)
	})
}
exports.get_pictures_by_project_id = function(id, callback){
	// THIS QUERY SELECTS FROM A CERTAIN TABLE WHERE THE ID IS EQUAL TO THE ID REQUESTED
	const query = `SELECT * FROM pictures WHERE projectid = ? `
	// STORE THE VALUE FROM THAT OBJECT TO AN ARRAY
	const values = [id]
	db.all(query, values, function(error, pictures) {
		callback(error, pictures)
	})
}

// GETS AND DISPLAYS THE SEARCHED RESULT
exports.search_projects = function(searched_value, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		SELECT * FROM projects WHERE id LIKE ? OR project_name LIKE ? OR project_sub_headline LIKE ? OR project_description LIKE ?
	`
	const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]
	db.all(query, values, function(error, projects){
		callback(error, projects)
	})
}
exports.search_blogs = function(searched_value, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		SELECT * FROM blogs WHERE post_title LIKE ? OR post_text LIKE ? OR post_date LIKE ? OR projectid LIKE ?
	`
	const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]
	db.all(query, values, function(error, blogs){
		callback(error, blogs)
	})
}
exports.search_faqs = function(searched_value, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		SELECT * FROM faqs WHERE post_question LIKE ? OR post_answer LIKE ? OR post_date LIKE ? OR projectid LIKE ?
	`
	const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]
	db.all(query, values, function(error, faqs){
		callback(error, faqs)
	})
}
exports.search_pictures = function(searched_value, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		SELECT * FROM pictures WHERE picture_title LIKE ? OR picture_name LIKE ? OR projectid LIKE ?
	`
	const values = ["%" + searched_value + "%", "%" + searched_value + "%", "%" + searched_value + "%"]
	db.all(query, values, function(error, pictures){
		callback(error, pictures)
	})
}


/*
	ALL POST REQUESTS
*/


// PROJECTS TABLE
exports.add_project = function(project_name, project_sub_headline, project_description, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		INSERT INTO projects (project_name, project_sub_headline, project_description) VALUES (?, ?, ?)
	`
	// STORES THE FETCHED VALUES INTO AN ARRAY
	const values = [project_name, project_sub_headline, project_description]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.edit_project = function(project_name, project_sub_headline, project_description, id, callback){
	const query = `
		UPDATE projects SET project_name = ?, project_sub_headline = ?, project_description = ? WHERE id = ?
	`
	const values = [project_name, project_sub_headline, project_description, id]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.remove_project = function(id, callback){
	const query = `
		DELETE FROM projects WHERE id = ?
	`
	const values = [id]
	db.run(query, values, function(error){
		callback(error)
	})
}

// BLOGS TABLE
exports.add_blog = function(post_title, post_text, post_date, projectid, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		INSERT INTO blogs (post_title, post_text, post_date, projectid) VALUES (?, ?, ?, ?)
	`
	// STORES THE FETCHED VALUES INTO AN ARRAY
	const values = [post_title, post_text, post_date, projectid]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.edit_blog = function(post_title, post_text, post_date, projectid, id, callback){
	const query = `
		UPDATE blogs SET post_title = ?, post_text = ?, post_date = ?, projectid = ? WHERE id = ?
	`
	const values = [post_title, post_text, post_date, projectid, id]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.remove_blog = function(id, callback){
	const query = `
		DELETE FROM blogs WHERE id = ?
	`
	const values = [id]
	db.run(query, values, function(error){
		callback(error)
	})
}

// FAQS TABLE
exports.add_faq = function(post_question, post_answer, post_date, projectid, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		INSERT INTO faqs (post_question, post_answer, post_date, projectid) VALUES (?, ?, ?, ?)
	`
	// STORES THE FETCHED VALUES INTO AN ARRAY
	const values = [post_question, post_answer, post_date, projectid]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.edit_faq = function(post_question, post_answer, post_date, projectid, id, callback){
	const query = `
		UPDATE faqs SET post_question = ?, post_answer = ?, post_date = ?, projectid = ? WHERE id = ?
	`
	const values = [post_question, post_answer, post_date, projectid, id]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.remove_faq = function(id, callback){
	const query = `
		DELETE FROM faqs WHERE id = ?
	`
	const values = [id]
	db.run(query, values, function(error){
		callback(error)
	})
}

// PICTURES TABLE
exports.add_picture = function(picture_title, picture_name, projectid, callback){
	// THIS QUERY INSERTS VALUES FETCHED FROM THE WEB APPLICATION INTO THE SPECIFIED TABLE
	const query = `
		INSERT INTO pictures (picture_title, picture_name, projectid) VALUES (?, ?, ?)
	`
	// STORES THE FETCHED VALUES INTO AN ARRAY
	const values = [picture_title, picture_name, projectid]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.edit_picture = function(picture_title, picture_name, projectid, id, callback){
	const query = `
		UPDATE pictures SET picture_title = ?, projectid = ?, picture_name = ? WHERE id = ?
	`
	const values = [picture_title, picture_name, projectid, id]
	db.run(query, values, function(error){
		callback(error)
	})
}
exports.remove_picture = function(id, callback){
	const query = `
		DELETE FROM pictures WHERE id = ?
	`
	const values = [id]
	db.run(query, values, function(error){
		callback(error)
	})
}
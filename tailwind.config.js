/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./views/**/*.{html,js,hbs}",
		"./src/**/*.{html,js,hbs}",
		"./src/**/*.js"
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				light_body_bg_color: "#FFF7EF",
				light_nav_body_text_color: "#FFF7EF",
				nav_body_text_color: "#121212",
				primary_color: "#FF6701",
				secondary_color: "#1A3545",
				darker_secondary_color: "#152a37",
				hover_color: "#ff3d01"
			},
			fontSize: {
				"nav_text": "2.5em"
			}
		},
	},
	plugins: [],
}

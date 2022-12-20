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
				light_body_bg_color: "#121212",
				light_nav_body_text_color: "#FFF7EF",
				nav_body_text_color: "#FFF7EF",
				primary_color: "#86112E",
				secondary_color: "#15252f",
				darker_secondary_color: "#152a37",
				hover_color: "#800000",
				form_color: "#000000",
				admin_nav_color: "#1c1c1c"
			},
			fontSize: {
				"nav_text": "2.5em"
			}
		},
		screens: {
			'sm': '640px',
			// => @media (min-width: 640px) { ... }
	  
			'md': '768px',
			// => @media (min-width: 768px) { ... }
	  
			'lg': '1024px',
			// => @media (min-width: 1024px) { ... }
	  
			'xl': '1280px',
			// => @media (min-width: 1280px) { ... }
	  
			'2xl': '1536px',
			// => @media (min-width: 1536px) { ... }
		}
	},
	plugins: [],
}

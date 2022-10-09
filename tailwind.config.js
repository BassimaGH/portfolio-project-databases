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

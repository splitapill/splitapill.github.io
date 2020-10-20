window.addEventListener("load", function() {
	if (window.cookieconsent) {
		window.cookieconsent.initialise({
			"palette": {
				"popup": {
					"background": "#000000",
					"text": "#FFFFFF"
				},
				"button": {
					"background": "#FFFFFF",
					"text": "#000000"
				}
			},
			"theme": "classic",
			"elements": { "message_link": '<span id="cookieconsent:desc" class="cc-message"><span style="display: inline-block; text-align: left; line-height: 30px;">{{cookie_message}}<br/>{{gdpr_message}}</span></span>' },
			"layouts": { "rentec": "{{message_link}}{{close}}" },
			"layout": "rentec",
			"content": {
				"cookie_message": 'This website uses cookies. By continuing to use this website, you consent to the use of cookies.',
				"gdpr_message": 'We have added a privacy policy to implement the European Union\'s General Data Protection Regulation. To view the policy, please <a class="cc-link" href="./Homeca1e.html" style="opacity: 1;" target="_blank">click here</a>.',
				"close": "&#x2A02;"
			}
		});
	}
});
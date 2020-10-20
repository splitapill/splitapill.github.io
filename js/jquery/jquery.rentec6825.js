/**************************************************************************************
 * jQuery Object
 **************************************************************************************/
var j = jQuery.noConflict();
j.ajaxSetup({ timeout: 30000 });

/**************************************************************************************
 * Capture Javascript Errors
 **************************************************************************************/

var ERRORS = [];
var INITIAL_ERROR_CHECK_INTERVAL = 2000; // milliseconds

var submitJavascriptErrors = function() {
	INITIAL_ERROR_CHECK_INTERVAL = null;
	
	if (ERRORS.length > 0) {
		var errorMessages = [];
		for (var i = 0; i < ERRORS.length; i++) {
			var error = ERRORS[i];
			errorMessages.push(
				error.message +
				"\nPage: " + error.uri +
				"\nFile: " + (error.file == error.uri ? "(inline)" : error.file) + ":" + error.lineNumber
				+ "\n" + error.source
			);
		}

		var errorUri = "/";
		var splitUri = window.location.pathname.split("/");
		var depth = splitUri.length - 1;

		if (depth > 1 && splitUri[1] !== "vm") {
			errorUri = "/" + splitUri[1] + "/";
		}
		
		j.post(errorUri + "JavaScriptError.action", { userAgentString: window.navigator.userAgent, errors: errorMessages.join("\n\n") });
	}
};

window.onerror = function(message, url, lineNumber, columnNumber, error) {
	// Browser errors triggered by something environmental (not specific to our code) will typically
	// be thrown with an empty or undefined 'url' and a 'lineNumber' of 0. We will capture those and
	// filter based on message contents so that they are not reported to the server:
	if ((!url || url == "" || url == "undefined") && (!lineNumber || lineNumber == 0)) {
		return false;
	}

	var file = url.substring(url.lastIndexOf("/") + 1, url.length);
	var uri = location.href.substring(location.href.lastIndexOf("/") + 1, location.href.length);

	// Extra error suppressing check for Internet-facing app
	if (file === undefined || (file != uri && file == "")) {
		return false;
	}
	else if (file == uri && lineNumber == 1) {
		return false;
	}

	if (navigator.userAgent.search("Firefox") != -1) {
		if (message === "Error loading script") {
			// Firefox generates this error when leaving a page before all scripts have finished loading:
			return false;
		}
		
		if (file === "aboutSessionRestore.js") {
			// Firefox 12 seems to have some session restore issues that propagate to restored tabs:
			return false;
		}
	}

	try {
		ERRORS.push({ message: message, uri: uri, source: error.stack, file: file, lineNumber: lineNumber });
	}
	catch (e) {
		ERRORS.push({ message: message, uri: uri, source: "Error.stack unsupported by browser", file: file, lineNumber: lineNumber });
	}

	// If no INITIAL_ERROR_CHECK_INTERVAL defined, send the errors as they are encountered:
	if (INITIAL_ERROR_CHECK_INTERVAL === null) {
		submitJavascriptErrors();
	}
	
	// Fire the default event handler (by returning false):
	return false;
};

setTimeout(submitJavascriptErrors, INITIAL_ERROR_CHECK_INTERVAL);

/**************************************************************************************
 * jQuery Helper Functions
 **************************************************************************************/
j.fn.center = function() {
	this.css("position","absolute");
	this.css("top", ((j(window).height() - this.outerHeight()) / 2) + j(window).scrollTop() + "px");
	this.css("left", ((j(window).width() - this.outerWidth()) / 2) + j(window).scrollLeft() + "px");
	return this;
};

j.fn.scrollTo = function(element, options) {
	var options = j.extend({
		top: true,
		left: false,
		duration: 0,
		effect: null,
		topOffset : 0,
		leftOffset : 0
	}, (options || {}));
	var scrollTo = j(element);
	var animateOptions = {};
	
	if (scrollTo.length) {
		if (options.top) {
			animateOptions.scrollTop = scrollTo.offset().top - this.offset().top + this.scrollTop() + options.topOffset;
		}
		
		if (options.left) {
			animateOptions.scrollLeft = scrollTo.offset().left - this.offset().left + this.scrollLeft() + options.leftOffset;
		}
		
		this.stop().animate(animateOptions, options.duration, options.effect);
	}
	
	return this;
};

j.fn.viewportOffset = function() {
	var offset = j(this).offset();
	
	return {
		left: offset.left - j(window).scrollLeft(),
		top: offset.top - j(window).scrollTop()
	};
};

j.fn.clonePosition = function(source, options) {
	var options = j.extend({
		setLeft : true,
		setTop  : true,
		setWidth: false,
		setHeight: false,
		offsetLeft: 0,
		offsetTop: 0
	}, (options || {}));
	
	var source = j(source); // where to position
	var element = j(this); // what to position
	
	var p = source.viewportOffset(), delta = { left: 0, top: 0 }, parent = null;

	if (element.css("position") === "absolute") {
		parent = element.offsetParent();
		delta = parent.viewportOffset();
	}
	
	if (parent && parent.get(0) == document.body) {
		delta.left -= document.body.offsetLeft;
		delta.top -= document.body.offsetTop;
	}

	if (options.setLeft) { 
		element.css("left",(p.left - delta.left + options.offsetLeft) + "px");
	}
	
	if (options.setTop) {
		element.css("top", (p.top - delta.top + options.offsetTop) + "px");
	}
	
	if (options.setWidth) {
		element.width(source.width());
	}
	
	if (options.setHeight) {
		element.height(source.height());
	}
	
	return element;
};

j.fn.enable = function() { return this.prop("disabled", false); };
j.fn.disable = function() { return this.prop("disabled", true); };

j.fn.check = function() { return this.prop("checked", true); };
j.fn.uncheck = function() { return this.prop("checked", false); };

j.fn.exists = function() { return this.length > 0; }

j.fn.serializeObject = function() {
	var object = {};
	var array = this.serializeArray();

	for (var i = 0; i < array.length; i++) {
		var k = array[i].name, v = array[i].value;

		if (k in object) {
			if (!j.isArray(object[k])) {
				object[k] = [object[k]];
			}
			object[k].push(v || "");
		}
		else {
			object[k] = v || "";
		}
	}
	
	return object;
};

/*!
* jQuery Cookie Plugin
* https://github.com/carhartl/jquery-cookie
*
* Copyright 2011, Klaus Hartl
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
*/
j.cookie = function(key, value, options) {
	// key and at least value given, set cookie...
	if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
	options = j.extend({}, options);
	
	if (value === null || value === undefined) {
		options.expires = -1;
	}
	
	if (typeof options.expires === 'number') {
		var days = options.expires, t = options.expires = new Date();
		t.setDate(t.getDate() + days);
	}
	
	value = String(value);
	
	return (document.cookie = [
		encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
			options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
			options.path ? '; path=' + options.path : '',
			options.domain ? '; domain=' + options.domain : '',
			options.secure ? '; secure' : ''
		].join(''));
	}
	
	// key and possibly options given, get cookie...
	options = value || {};
	var decode = options.raw ? function(s) { return s; } : decodeURIComponent;
	
	var pairs = document.cookie.split('; ');
	for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
		if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
	}
	return null;
};
var Rentec = Rentec || {};

Rentec.Common = function() {
	var self = this;
	var origElementHeight = {};
	this.removeInjectedInputs = true;
	
	this.popup = function(url, width, height, scroll) {
		w = width;
		h = height;
		var ref = window.open(url, 'winRef', 'width='+w+',height='+h+',resizable=yes,scrollbars='+scroll+',menubar=0,toolbar=0,location=0,status=0');
		var windowX = (window.screenLeft != null) ? window.screenLeft : window.screenX;
		var windowY = (window.screenTop != null) ? window.screenTop : window.screenY;
		var x = (document.body.clientWidth - w)/2 + windowX;
		var y = (isNaN(window.screenY)) ? (document.body.clientHeight - h)/2 + windowY - 25 : (window.innerHeight - ref.outerHeight)/2 + windowY + (window.outerHeight - window.innerHeight) - 25;
		ref.moveTo(x, y);
		ref.focus();
	};
	
	this.setCurrentDateTime = function(id) { j(id).val((new Date()).toString("yyyy-MM-dd h:mm tt")); }
	
	this.isNumber = function(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
	
	this.parseAmount = function(str) {
		var amount = null;
		if (str) {
			str = str.replace(/[,|$]/g, "");
			if (str.length > 0) {
				amount = parseFloat(str);
				if (isNaN(amount)) {
					amount = null;
				}
			}
		}
		return amount;
	};
	
	this.commify = function(num) {
		num += '';
		x = num.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	};
	
	this.preventEnterKeyFormSubmission = function(formId) {
		j(formId + ' input[type=text]').on('keypress', function(event) {
			if (event.which == 13) {
				event.stopPropagation();
				event.preventDefault();
			}
		});
	};
	
	this.confirmSubmitUrl = function(question, url) { if (confirm(question)) { location.href = url; } };
	
	this.getRadioValue = function(formId, name) {
		// Names will often contain periods and this is unavoidable. They must be escaped before passing into the jQuery selector:
		return j(formId + " input:radio[name=" + escapeSelector(name) + "]:checked").val();
	};
	
	this.changeDisabledState = function(name, id) {
		var inpObj = document.getElementsByName(name);
		try{
			if (!inpObj) { return ""; }
			for (var i = 0; i < inpObj.length; i++) {
				var jQueryElement = j(inpObj[i]);
				if (!(inpObj[i].id == id)) { jQueryElement.disable(); } else { jQueryElement.enable(); }
			}
		}
		catch(e) { }
	};
	
	this.swapOptions = function(form, f, t, sort) {
		from = j(f).get(0);
		to = j(t).get(0);
		
		// Move options to target (to).
		if (!self.hasOptions(from)) { return; }
		for (var i = 0; i < from.options.length; i++) {
			var opt = from.options[i];
			if (opt.selected) {
				var index = self.hasOptions(to) ? to.options.length : 0
				to.options[index] = new Option(opt.text, opt.value, false, false);
			}
		}
		// Delete options from the source (from).
		for (var i = (from.options.length - 1); i >= 0; i--) {
			var opt = from.options[i];
			if (opt.selected) { from.options[i] = null; }
		}
		if ((arguments.length == 4) && sort) {
			self.sortSelect(from);
			self.sortSelect(to);
		}
		from.selectedIndex = -1;
		to.selectedIndex = -1;
	};

	this.hasOptions = function(e) {
		return e != null && e.options != null;
	};

	this.sortSelect = function(element) {
		var e = j(element).get(0);
		var opt = new Array();
		if (!self.hasOptions(e)) { return; }
		for (var i = 0; i < e.options.length; i++) {
			opt[opt.length] = new Option(e.options[i].text, e.options[i].value, e.options[i].defaultSelected, e.options[i].selected);
		}
		if (opt.length == 0) { return; }
		opt = opt.sort(
			function(a, b) {
				if ((a.text + "") < (b.text + "")) { return -1; }
				if ((a.text + "") > (b.text + "")) { return 1; }
				return 0;
			}
		);
		
		for (var i = 0; i < opt.length; i++) {
			e.options[i] = new Option(opt[i].text, opt[i].value, opt[i].defaultSelected, opt[i].selected);
		}
	};

	this.selectAllOptions = function(form, id) {
		j(form).find(id + " option").prop("selected", true);
	};
	
	this.post = function(button, action, prompt) {
		var parentForm = j(button.form);
		var confirmed = true;

		if(prompt) {
			confirmed = confirm(prompt);
		}
		
		if(confirmed) {
			j("._injected_input").remove();
			j("<input>").attr({ "type": "hidden", "class": "_injected_input", "name": action, "value": "true" }).appendTo(parentForm);
			self.removeInjectedInputs = false;
			parentForm.submit();
		}
		
		return confirmed;
	};
	
	this.postToUrl = function(url, prompt) {
		if (prompt && !confirm(prompt)) {
			return false;
		}
		var form = j("<form>").appendTo(j("body"));
		form.attr("action", url);
		form.attr("method", "post");
		if (typeof CSRF_TOKEN !== "undefined") {
			form.append("<input type='hidden' name='csrfToken' value='" + CSRF_TOKEN + "' />");
		}
		form.submit();
	};
	
	this.equalizeElementHeight = function(selectorA, selectorB, params) {
		var options = j.extend({
			store: false,
			revert: false
		}, params);
		var a = j(selectorA), b = j(selectorB);

		if(options.revert &&
			origElementHeight[selectorA] !== undefined && origElementHeight[selectorB] !== undefined) {
			a.css("min-height", origElementHeight[selectorA]);
			b.css("min-height", origElementHeight[selectorB]);
			return;
		}

		if(a.height() > b.height()) {
			b.css("min-height", a.height());
		}
		else {
			a.css("min-height", b.height());
		}
		
		if(options.store) {
			origElementHeight[selectorA] = a.height();
			origElementHeight[selectorB] = b.height();
		}
	};
	
	this.equalizeElementBottom = function(selectorA, selectorB) {
		var a = j(selectorA), b = j(selectorB);
		var aBottom = a.height() + a.position().top, bBottom = b.height() + b.position().top;
		
		if (aBottom > bBottom) {
			b.css("min-height", b.height() + aBottom - bBottom);
		}
		else {
			a.css("min-height", a.height() + bBottom - aBottom);
		}
	};
	
	this.disableAndSubmit = function(formSelector, eventName) {
		j(formSelector + '_eventName').attr('name', eventName);
		j('input[type="button"],input[type="submit"]').disable();
		j(formSelector).submit();
	};

	this.jsonValidate = function(event) {
		var form = j(this).closest("form");
		var handler = j(this).attr("name");
		
		var formData = new FormData(form[0]);
		formData.append(handler, "true");
		formData.append("jsonValidate", "true");
		
		j.ajax(form.attr('action'), {
			async: false,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: function(results) {
				if (Array.isArray(results) && results.length > 0) {
					var modalErrors = form.find(".modal-error:first").empty().append(j("<ul>").addClass("bulleted").css("float", "none")).hide();
					
					j.each(results, function() {
						modalErrors.find("ul").append("<li>" + this + "</li>")
					});
					
					modalErrors.show();
					event.preventDefault();
				}
			}
		});
	};
	
	this.jsonValidateGeneric = function(form, handler, errorContainerElement) {
		var formData = new FormData(j(form)[0]);
		formData.append(handler, "true");
		formData.append("jsonValidate", "true");
		
		var hasErrors = false;
		j.ajax(j(form).attr("action"), {
			async: false,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: function(results) {
				if (results.length > 0) {
					var errors = j(errorContainerElement).empty().append(j("<ul>").addClass("bulleted").css("float", "none")).hide();
					
					j.each(results, function() {
						errors.find("ul").append("<li>" + this + "</li>")
					});
					
					errors.show();
					hasErrors = true;
				}
			}
		});
		
		return !hasErrors;
	};
	
	this.tableToExcel = function(table) {
		var rows = [];
		table.find("tr:visible").each(function() {
			var cells = [];
			j(this).find("td,th").each(function() {
				var cell = j(this);
				
				var celldata = {};
				celldata.style = {};
				celldata.val = cell.text().replace(/^\n|\n$/g, '').replace(/\s+/g, ' ').trim();
				if (cell.is("th")) {
					celldata.style.bold = true;
					celldata.style.backgroundColor = 22;
				}
				celldata.style.halign = cell.css("text-align");
				celldata.width = parseInt(cell.width());
				celldata.height = parseInt(cell.height());
				celldata.colspan = cell.attr("colspan");
				celldata.style.format = cell.data("format");
				
				cells.push(celldata);
			});
			rows.push(cells);
		});
		
		if (!j("#excelForm").exists()) {
			j("body").append(j('<form id="excelForm" action="Excel.action" method="post"><input id="tableJSON" name="tableJSON" type="hidden"/></form>'));
		}
		j("#tableJSON").val(JSON.stringify(rows)).parent().submit();
	};
};

Rentec.Scroller = function() {
	var self = this;
	
	this.sort = function(title, column, formId) {
		var form = j(formId);
		var sortDir = form.find("#sortDir");
		var sortTitle = form.find("#sortTitle");
		var sortCol = form.find("#sortCol");
		
		var direction = "ASC";
		if (sortDir.val() == "ASC" && (sortTitle.val() == title || (sortTitle.val() == "" && sortCol.val() == column))) {
			direction = "DESC";
		}
		
		sortTitle.val(title);
		sortDir.val(direction);
		sortCol.val(column);
		form.submit();
	};
	
	this.sortAndSerializeObject = function(formId, title, column, navParam, navVal) {
		var form = j(formId);
		var sortDir = form.find("#sortDir");
		var sortTitle = form.find("#sortTitle");
		var sortCol = form.find("#sortCol");
		
		if (title != null && column != null) {
			var direction = "ASC";
			if (sortDir.val() == "ASC" && (sortTitle.val() == title || (sortTitle.val() == "" && sortCol.val() == column))) {
				direction = "DESC";
			}
			
			sortTitle.val(title);
			sortDir.val(direction);
			sortCol.val(column);
		}
		
		if (navParam != null) { form.find(navParam).val(navVal); }

		return form.serializeObject();
	};
	
	this.submit = function(formId, parameter, value) {
		j(parameter).val(value);
		j(formId).submit();
	};
};

Rentec.PersistentCheckbox = function() {
	var self = this;
	
	this.toggleAll = function(checkallCheckbox) {
		var checkall = j(checkallCheckbox);
		var checkboxes = j(checkallCheckbox.form).find("input[type=checkbox]");
		
		checkboxes.each(function() {
			var checkbox = j(this);
			if (checkbox.attr("name") != "checkall") {
				if (checkbox.is(":checked") != checkall.is(":checked")) { checkbox.trigger("click"); }
			}
		});
	};
	
	this.toggleHiddenCheckbox = function(id) {
		self.toggleHiddenCheckboxValue(id, 1, 0);
	}

	this.toggleHiddenCheckboxValue = function(id, valueTrue, valueFalse) {
		var element = j(escapeID(id));
		if (element.val() == valueTrue) {
			element.val(valueFalse);
		}
		else {
			element.val(valueTrue);
		}
	}

	this.toggleHiddenCheckboxAndSubmitValue = function(id, formId, valueTrue, valueFalse) {
		self.toggleHiddenCheckboxValue(id, valueTrue, valueFalse);
		j(escapeID(formId)).submit();
	}

	this.toggleHiddenCheckboxAndSubmit = function(id, formId) {
		self.toggleHiddenCheckbox(id);
		j(escapeID(formId)).submit();
	}
};

/*
 * GLOBAL FUNCTIONS
 * -----------------
 * You should rarely, if ever, have a need to define functions here. They are intended to be accessible from a 
 * global, non-namespaced scope. This is generally discouraged for most use-cases.
 */
var escapeSelector = function(id) {
	var current = "", previous = "", newId = "";
	
	// This function is more robust than a simple String#replace because it
	// will only escape special characters if they have not already been escaped.
	// That means you can invoke this function multiple times on a string if necessary.
	for (var i = 0; i < id.length; i++) {
		current = id.charAt(i);
		if (i > 0) { previous = id.charAt(i - 1); }
		
		if ((current == "." || current == ":" || current == "@" || current == "[" || current == "]") && previous != "\\") {
			current = "\\" + current;
		}
		
		newId += current;
	}
	
	return newId;
};

var escapeID = function(id) {
	var newId = escapeSelector(id);
	if (newId.indexOf("#") != 0) { newId = "#" + newId; }
	return newId;
};

/*
 * COMMON OBJECTS
 */
var common = new Rentec.Common();
var scroller = new Rentec.Scroller();
var persistentCheckbox = new Rentec.PersistentCheckbox();

/*
 * DOCUMENT SETUP
 */
j(document).ready(function() {
	j("form").on("submit", function() {
		if (common.removeInjectedInputs) {
			j("._injected_input").remove();
		}
		
		common.removeInjectedInputs = true;
	});

	if (Rentec && Rentec.balloon) {
		new Rentec.balloon("a.user-summary-balloon", {
			source: function(target) {
				return [target.data("source"), { "user.username": target.data("username"), "userSummary": true }];
			}
		});
	}
});

Zepto(function ($) {

	/**
	 * Define variables + Cache DOM in variables
	 */
	var username = 'siamkreative';
	var endpoint = '//api.github.com/users/' + username + '/repos';
	var template = $('#projects-template');
	var list = $('#projects-list');
	var ignore = [31160449, 42847913];
	var data;

	/**
	 * Helper function to sort by Date Descending (latest to oldest)
	 */
	function dateDesc(a, b) {
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	}

	/**
	 * Handlebar Custom Helpers
	 */
	Handlebars.registerHelper('project_home', function (text, url) {
		text = this.name.replace(/-/g, ' ');
		text = Handlebars.Utils.escapeExpression(text);
		url = (!this.homepage) ? this.html_url : this.homepage;
		url = Handlebars.Utils.escapeExpression(url);

		var result = '<a target="_blank" href="' + url + '">' + text + '</a>';

		return new Handlebars.SafeString(result);
	});
	Handlebars.registerHelper('project_version', function (text, url) {
		var endpoint = '//raw.githubusercontent.com/' + username + '/' + this.name + '/master/package.json';
		var version = '';

		$.ajax({
			type: 'GET',
			url: endpoint,
			dataType: 'json',
			timeout: 300,
			success: function (json) {
				console.log(json.version);
				version = json.version;
			},
			error: function (xhr, type) {
				console.log('Ajax error, no package.json found!');
			}
		});

		var result = '<small>' + version + '</small>';

		return new Handlebars.SafeString(result);
	});
	Handlebars.registerHelper('dateFormat', function (context, block) {
		if (window.moment) {
			var f = block.hash.format || 'MMM Do, YYYY';
			return moment(context).format(f);
		} else {
			return context;
		};
	});

	/**
	 * Github API Ajax
	 */
	if (sessionStorage.getItem('siamkreative_gh_repos')) {
		renderProjects();
	} else {
		$.getJSON(endpoint, function (json) {
			sessionStorage.setItem('siamkreative_gh_repos', JSON.stringify(json));
			renderProjects();
		});
	}

	function renderProjects() {
		// Read JSON object from sessionStorage
		data = $.parseJSON(sessionStorage.getItem('siamkreative_gh_repos'));

		// Sort the projects by date (descending order)
		data.sort(dateDesc);

		// Filter the array
		// http://api.jquery.com/jquery.grep/
		data = $.grep(data, function (value, i) {
			// Ignore forks
			if (value.fork == true) {
				return false;
			} else {
				// Ignore specific repos by ID
				for (var i = 0; i < ignore.length; i++) {
					if (value.id == ignore[i]) {
						console.log('Filter matches for Github repository ID: ' + value.id);
						return false
					}
				}
				return true;
			}
		});

		// Render the template (populate data and generate HTML markup)
		var renderTemplate = Handlebars.compile(template.html());
		list.html(renderTemplate(data));
	}

	/**
	 * Check if screenshot exists
	 * http://stackoverflow.com/a/11775226/1414881
	 */
	$('img[data-src]').each(function (index, el) {
		var imgUrl = $(el).attr('data-src');
		$.ajax({
			url: imgUrl,
			type: 'HEAD',
			error: function () {
				$(el).remove();
			},
			success: function () {
				$(el).attr('src', imgUrl);
			}
		});
	});

});
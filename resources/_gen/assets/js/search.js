"use strict";

var siteSearch = (function($, instantsearch) {
	var config = {
		appId: "OOCL76XN6B",
		apiKey: "b726c94489b2a42daacad21aca738d13",
		indexName: "test_index"
	};
	var clearExecuted = false;
	var source = Handlebars.compile($("#hit-template").html());
	var statsTemplate = Handlebars.compile($("#stats-template").html());
	// limit an array to a maximum of elements (from the start)
	Handlebars.registerHelper("limit", function(arr, limit) {
		if (!arr) {
			return [];
		}
		return arr.slice(0, limit);
	});

	function init() {
		var search = instantsearch({
			appId: config.appId,
			apiKey: config.apiKey,
			indexName: config.indexName,
			urlSync: {
				trackedParameters: ["query", "page", "attribute:*"],
				mapping: {
					p: "page",
					q: "search",
					fR: "filter",
					dFR: "by"
				}
			},
			searchFunction: function(helper) {
				if (helper.state.query === "") {
					hideHits();
					return;
				}
				this.once('render', function() {
					showHits();
				});
				helper.search();
				if (!clearExecuted) {
					// run once on init
					clearExecuted = true;
					clearSearch(helper);
				}
			}
		});
		createWidgets(search);
		search.start();
	}
	
	function showHits() {
		document.querySelector('.results').classList.remove('hidden');
	}
	
	function hideHits() {
		document.querySelector('.results').classList.add('hidden');
	}

	function createWidgets(search) {
		search.addWidget(
			instantsearch.widgets.searchBox({
				container: "#search-input",
				placeholder: "Search full-time programs",
				searchOnEnterKeyPressOnly: false,
				queryHook: function(query, search) {
					search(query);
					clearSearch(search);
				}
			})
		);
		search.addWidget(
			instantsearch.widgets.hits({
				container: "#hits",
				hitsPerPage: 600,
				cssClasses: {
					item: "search-item"
				},
				templates: {
					item: function(data) {
						return source(data);
					},
					empty: getTemplate("no-results")
				}
			})
		);
		search.addWidget(
			instantsearch.widgets.stats({
				container: "#stats",
				templates: {
					body: function(data) {
						console.log(data);
						var totalPages = data.nbPages,
							currentPage = data.page + 1,
							perPage = data.hitsPerPage,
							totalResults = data.nbHits,
							numFirst = (currentPage - 1) * perPage + 1,
							numLast = perPage * currentPage;
						if (numLast > totalResults) {
							numLast = totalResults;
						}
						if (totalResults > 1000) {
							totalResults = 1000;
						}
						return statsTemplate({
							numFirst: numFirst,
							numLast: numLast,
							totalResults: totalResults
						});
					}
				}
			})
		);
		search.addWidget(
			instantsearch.widgets.pagination({
				container: "#pagination",
				scrollTo: "#search-input",
				cssClasses: {
					root: "pagination",
					active: "active",
					disabled: "disabled"
				}
			})
		);
	}

	function _clearAlgoliaQuery(algoliaSearch) {
		if (isFunction(algoliaSearch)) {
			algoliaSearch();
		} else if (algoliaSearch) {
			algoliaSearch.state.query = "";
			algoliaSearch.setQuery("");
			algoliaSearch.search("");
		} else {
			throw "Algolia Search not initialized";
		}
	}
	function clearSearch(search) {
		var input = $("#full-search-form").find('.has-clear input[type="text"]'),
			clearControl = $("#full-search-form").find(".form-control-clear");

		// If form element has a form control clear, then show when input has text, and clear on click
		// have to
		input
			.off("input propertychange")
			.on("input propertychange", function() {
				var $this = $(this),
					visible = Boolean($this.val());
				$this
					.parent()
					.siblings(".form-control-clear")
					.toggleClass("hidden", !visible);
			})
			.trigger("propertychange");

		clearControl.off("click").click(function() {
			var $this = $(this),
				visible = Boolean($this.val());
			$this
				.parent(".has-clear")
				.find('input[type="text"]')
				.val("")
				.trigger("propertychange")
				.focus();
			$this.toggleClass("hidden", !visible);
			_clearAlgoliaQuery(search);
		});

		//using e.which as jquery standardizes: http://stackoverflow.com/questions/4471582/javascript-keycode-vs-which
		input.off("keydown").keydown(function(e) {
			if (e.which === 27) {
				// remove search results and clear form field on 'esc' button press
				clearControl
					.parent(".has-clear")
					.find('input[type="text"]')
					.val("")
					.trigger("propertychange")
					.focus();
				_clearAlgoliaQuery(search);
			}
		});

		$("#full-search-form").off("keydown").keydown(function(e) {
			// hide results and focus element 'esc' button press
			if (e.which === 27) {
				clearControl
					.parent(".has-clear")
					.find('input[type="text"]')
					.trigger("propertychange")
					.focus();
				_clearAlgoliaQuery(search);
			}
		});
	}
	//checks if is function
	function isFunction(functionToCheck) {
		var getType = {};
		return (
			functionToCheck &&
			getType.toString.call(functionToCheck) === "[object Function]"
		);
	}
	function getTemplate(templateName) {
		return document.querySelector("#" + templateName + "-template").innerHTML;
	}

	return {
		init: init
	};
})(jQuery, instantsearch);

var searchExpandHelpers = (function($) {
	var searchBtn = $(".search-btn");
	var searchInput = $("#autocomplete-search-input");

	// bind events
	function init() {
		searchBtn.on("click", function(e) {
			_initSearchFn(e);
		});
		searchBtn.on("touchstart", function(e) {
			_initSearchFn(e);
		});
	}
	function _initSearchFn(e) {
		// focus the input
		$(e).parent().find(searchInput).focus();
	}

	return {
		init: init
	};
})(jQuery);

siteSearch.init();
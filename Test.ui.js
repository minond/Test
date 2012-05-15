/**
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Author: Marcos Minond
 * 
 */


"use strict";


(function () {
	var BLOCK = "div";
	var STYLE = "link";
	var SCRIPT = "script";
	var TABLE = "table";
	var ROW = "tr";
	var CELL = "td";
	var css_added = false;

	var node_id = "Test_node"
	var display_toggler = true;


	/**
	 * @name bind_k
	 * @param key_char string character
	 * @param action function
	 * @return void
	 */
	var bind_k = function (key_char, action) {
		document.body.addEventListener("keydown", function (e) {
			if (String.fromCharCode(e.keyCode) === key_char.toUpperCase()) {
				action(e);
			}
		});
	};

	/**
	 * @name node
	 * @param string node type name
	 * @param object additional node properties
	 * @return Node
	 */
	var node = function (type, props) {
		var elem = document.createElement(type);

		if (props) {
			for (var prop in props) {
				elem[ prop ] = props[ prop ];
			}
		}

		return elem;
	};

	/**
	 * @name show
	 * @return void
	 * @see Test.display.summary
	 * 
	 * display test results
	 */
	Test.display.show = function () {
		var style, syntax, holder, results, row, test_case, total, passes, fails;
		var show = false;

		if (!css_added) {
			css_added = true;
			syntax = [];

			style = node(STYLE, {
				rel: "stylesheet",
				type: "text/css",
				href: Test.settings.css_href
			});

			syntax[0] = node(STYLE, {
				rel: "stylesheet",
				type: "text/css",
				href: "/Test/rainbow/tricolore.css"
			});

			syntax[1] = node(SCRIPT, {
				type: "text/javascript",
				src: "/Test/rainbow/rainbow.min.js"
			});

			syntax[2] = node(SCRIPT, {
				type: "text/javascript",
				src: "/Test/rainbow/generic.js"
			});

			document.head.appendChild(style);
			document.head.appendChild(syntax[0]);
			document.head.appendChild(syntax[1]);
			document.head.appendChild(syntax[2]);
		}

		holder = node(BLOCK, {
			className: "Test_holder Test_shadow",
			id: node_id
		});

		// results
		results = node(TABLE);

		// header
		row = node(ROW, {
			className: "Test_header"
		});

		row.appendChild(node(CELL, { className: "Test_number", innerHTML: "Total" }));
		row.appendChild(node(CELL, { className: "Test_number", innerHTML: "Pass" }));
		row.appendChild(node(CELL, { className: "Test_number", innerHTML: "Fail" }));
		row.appendChild(node(CELL, { className: "Test_number", innerHTML: "Time (ms)" }));
		row.appendChild(node(CELL, { innerHTML: "Test Name" }));

		results.appendChild(row);

		// test results
		for (var test in Test.created_tests) {
			show = true;
			total = 0;
			passes = 0;

			for (var i = 0, max = Test.created_tests[ test ].results.length; i < max; i++) {
				test_case = Test.created_tests[ test ].results[ i ];

				total++;
				if (test_case.pass) {
					passes++;
				}
			}

			fails = total - passes;
			row = node(ROW);

			row.appendChild(node(CELL, {
				innerHTML: total,
				className: "Test_total"
			}));

			row.appendChild(node(CELL, {
				innerHTML: passes,
				className: passes ? "Test_pass" : ""
			}));
			
			row.appendChild(node(CELL, {
				innerHTML: fails,
				className: fails ? "Test_fail" : ""
			}));
			
			row.appendChild(node(CELL, {
				innerHTML: Test.created_tests[ test ].total_time
			}));
			
			row.appendChild(node(CELL, {
				innerHTML: test,
				className: "Test_test_name"
			}));

			results.appendChild(row);
		}

		Test.display.show.fails = fails;
		holder.appendChild(results);

		// reset and refresh buttons
		if (Test.settings.show_actions) {
			var action_holder = node(BLOCK, {
				className: "Test_center Test_action_holder"
			});

			action_holder.appendChild(
				node("input", {
					className: "Test_action_button",
					type: "button",
					value: "Reload",
					onclick: Test.try_again
				})
			);

			action_holder.appendChild(
				node("input", {
					className: "Test_action_button",
					type: "button",
					value: "Reset",
					onclick: Test.reset
				})
			);

			action_holder.appendChild(
				node("input", {
					className: "Test_action_button",
					type: "button",
					value: "Stop",
					onclick: Test.display.reset_in.cancel
				})
			);

			holder.appendChild(action_holder);
		}

		if (show) {
			document.body.appendChild(holder);
		}

		// print_r data
		if (this.to_show.length) {
			for (var i = 0, max = this.to_show.length; i < max; i++) {
				var code, print_holder = node(BLOCK, {
					className: "Test_holder Test_shadow"
				});

				print_holder.appendChild(node(BLOCK, {
					innerHTML: this.to_show[ i ].title,
					className: "Test_print_title"
				}));

				code = node("pre", {
					innerHTML: this.to_show[ i ].data_str,
					className: "Test_print_data js",
					name: "code"
				});

				code.dataset.language = "javascript";

				print_holder.appendChild(code);
				document.body.appendChild(print_holder);
			}
		}
	};


	var timer;

	/**
	 * @name reset_in
	 * @param int seconds
	 * @return void
	 * 
	 * reloads the page is all tests have passed
	 */
	Test.display.reset_in = function (seconds) {
		if (!Test.display.show.fails) {
			timer = setTimeout(function () {
				window.location.reload();
			}, seconds * 1000);
		}
	};

	Test.display.reset_in.cancel = function () {
		if (timer) {
			clearTimeout(timer);
		}
	};

	/**
	 * @name print_r
	 * @param string title
	 * @param mixed data
	 * @return void
	 * 
	 * displayes data
	 */
	Test.display.print_r = function (title, data) {
		this.to_show.push({
			title: title, 
			data_str: this.dump(data)
		});
	};


	/**
	 * @name to_show
	 *
	 * holds display data
	 */
	Test.display.to_show = [];

	/**
	 * @name hide
	 * @return void
	 *
	 * hides the test output
	 */
	Test.display.hide = function (show) {
		var nodes = document.querySelectorAll(".Test_holder");

		for (var i = 0, max = nodes.length; i < max; i++) {
			nodes[ i ].style.display = !show ? "none" : "";
		}
	};

	/**
	 * @name bind_keys
	 * 
	 * binds action shortcuts
	 */
	Test.display.bind_keys = function () {
		bind_k("r", Test.reset);
		bind_k("p", Test.display.reset_in.cancel);
		bind_k("c", function () {
			Test.display.hide(display_toggler = !display_toggler);
		});
	};

	Test.settings.css_href = "/Test/Test.ui.css";
	Test.settings.show_actions = true;
})();

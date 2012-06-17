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
 */


"use strict";


(function () {
	/**
	 * @constuctor DomTest
	 * @param String test name
	 *
	 * created a new DomTest instance
	 */
	var DomTest = Test.DomTest = function DomTest (test_name) {
		Test.call(this, test_name);

		// iframe or popup
		this.resource = null;
		this.urlocat = null;
		this.ready = false;
		this.queue = [];
	};

	/**
	 * DomTest "inherits" everything from Test
	 * and should behave just like one.
	 * This allows ui and console outputs
	 * to be re-used. It also allows Test to 
	 * track this instance,
	 */
	DomTest.prototype = Test.prototype;

	var QueueTest = function QueueTest (title, test_type) {};

	/**
	 * @param string verify_url
	 * @return boolean valid url
	 */
	DomTest.verify_url = function (url) {
		return true;
		return url.match(location.origin);
	};

	/**
	 * @param string iframe url
	 * @return Node iframe element
	 */
	DomTest.create_resource = function (url) {
		var elem = document.createElement("iframe");

		document.body.appendChild(elem);
		elem.src = url;

		return elem;
	};

	/**
	 * @param Function action
	 * sets a load event listener on the main resource
	 */
	DomTest.prototype.wait4load = function (action) {
		var loc_this = this;

		this.resource.addEventListener("load", function (ev) {
			action.apply(loc_this, [ this.contentWindow, this.contentDocument, ev ]);
		});
	};

	/**
	 * @param string url
	 * @return boolean valid url
	 */
	DomTest.prototype.open = function (url) {
		var valid = DomTest.verify_url(url);

		if (valid) {
			this.urlocat = url;
			this.resource = DomTest.create_resource(url);
			this.wait4load(function () {
				this.ready = true;
				this.run_ready_queue();
			});
		}

		return valid;
	};

	/**
	 * runs all queued tests
	 */
	DomTest.prototype.run_ready_queue = function () {
		
	};
})();

var start = 5;
var end = 100;

var boolratios = {
	t: 0,
	f: 0
};

// display all failed cases
Test.fail_print();
Test.settings.default_times = 50;


// Numbers and integers: between
var between = new Test("Numbers and integers: between");
between.set_test(Test.check.between(start, end));
between.expect(true).using(Test.arg.number(start, end));
between.expect(true).using(Test.arg.integer(start, end));
between.run(false);

// Numberes and integers: less than/equal
var lessthaneq = new Test("Numberes and integers: less than/equal");
lessthaneq.set_test(Test.check.le);
lessthaneq.expect(true).using(Test.arg.number(end), end);
lessthaneq.expect(true).using(Test.arg.integer(end), end);
lessthaneq.run(false);

// Boolean: proper ratios
/*for (var i = 0; i < 1000000; i++)
	Test.value.bool() ? boolratios.t++ : boolratios.f++;

var ratio = boolratios.f / boolratios.t;
var boolratio = new Test("Boolean: proper ratios");

boolratio.on_pass = function (r) {
	Test.display.print_r("Pass Case (bool checks)", r.parameters[0]);
};

boolratio.set_test(Test.check.between(0.9, 1.1));
boolratio.expect(true).on(ratio);
boolratio.run(false);*/

var uitest = new Test.DomTest("UI Testing");
uitest.open("sample.php");

uitest.wait4load(function (win, doc, eve) {
	console.log(this, arguments);
});

var gt = new Test("The 'toBeGreaterThan' is for mathematical comparisons");
gt.set_test(Test.check.gt);
gt.expect(true).on(Math.PI, Math.E);
gt.expect(false).on(Math.E, Math.PI);
gt.expect(true).using(Math.PI, Test.arg.number(.1, Math.PI + .1));
gt.run(10);



Test.run_all();

// output results
// Test.display.summary();

Test.display.show();
// Test.display.bind_keys();
// Test.display.reset_in(1);
















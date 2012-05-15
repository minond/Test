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
between.expect(true).using(new Test.param(Test.value.number,  [start, end]));
between.expect(true).using(new Test.param(Test.value.integer, [start, end]));

// Numberes and integers: less than/equal
var lessthaneq = new Test("Numberes and integers: less than/equal");
lessthaneq.set_test(Test.check.le);
lessthaneq.expect(true).using(new Test.param(Test.value.number, [end]), end);
lessthaneq.expect(true).using(new Test.param(Test.value.integer, [end]), end);

// Boolean: proper ratios
for (var i = 0; i < 300; i++)
	Test.value.bool() ? boolratios.t++ : boolratios.f++;

var boolratio = new Test("Boolean: proper ratios");
boolratio.set_test(Test.check.between(0.5, 1.5));
boolratio.expect(true).on(boolratios.f / boolratios.t);
boolratio.on_pass = function (r) { Test.display.print_r("Pass Case (bool checks)", r.parameters[0]); };
boolratio.run(1);



// output results
Test.run_all();
Test.display.summary();

Test.display.show();
Test.display.reset_in(1);
Test.display.bind_keys();

var start = 5;
var end = 100;

// display all failed cases
Test.fail_print();
Test.settings.default_times = 500;

// parameter value generators
var param_check = new Test("Numbers and integers: between");
param_check.set_test(Test.check.between(start, end));
param_check.expect(true).using([Test.value.number, [start, end]]);
param_check.expect(true).using([Test.value.integer, [start, end]]);
param_check.run();


// output results
Test.display.output();
Test.display.output_failures();
Test.display.summary();

Test.display.show();
Test.display.reset_in(3000);
Test.display.bind_keys();

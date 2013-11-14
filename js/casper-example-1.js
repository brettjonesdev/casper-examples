
var testCount = 2;
casper.test.begin("Testing Reddit", testCount, function feelingLuckyTest(test) {
    casper.start("http://www.reddit.com/r/programming", function() {
    	test.assertTitleMatch(/programming/, "Title is what we'd expect");
    	
    	//Click "new link"
    	casper.click("a[href*='/programming/new/']");
    	casper.waitForUrl(/\/programming\/new\/$/, function() {
			casper.capture("../images/Reddit programming new.png");
    		test.assertElementCount("p.title", 25, "25 links on first page");
    	});

    }).run(function() {
        test.done();
    });
});
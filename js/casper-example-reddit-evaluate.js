casper.options.viewportSize = {width: 1024, height: 768};
var testCount = 1;
casper.test.begin("Searching Reddit", testCount, function redditSearch(test) {
    casper.start("http://www.reddit.com/r/programming", function() {
    	
    }).run(function() {
        test.done();
    });
});
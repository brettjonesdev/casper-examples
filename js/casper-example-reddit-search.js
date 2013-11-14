casper.options.viewportSize = {width: 1024, height: 768};
var testCount = 1;
casper.test.begin("Searching Reddit", testCount, function redditSearch(test) {
    casper.start("http://www.reddit.com/r/programming", function() {
    	//Search for "javascript"

        casper.fill("form#search", {
            "q": "javascript",
           "restrict_sr": true 
        }, true);

        casper.then(function(){
            test.assertElementCount("p.title", 25, "Found 25 or more results");
            this.capture("../images/Reddit search.png");
        });
        
    }).run(function() {
        test.done();
    });
});
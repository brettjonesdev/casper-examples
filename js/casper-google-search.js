var casper = require("casper").create();

casper.start("http://google.com", function() {
	var submitForm = true;
	casper.fill("form", {
	   q: "CasperJS" //enter "CasperJS in form input[name=q]
	}, submitForm);

	casper.then(function() {
		this.capture("./casper-google-search.png");
	});
});
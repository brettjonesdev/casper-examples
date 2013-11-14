# Front-end Testing for the Lazy Developer with CasperJS 

If you pride yourself on possessing the [3 Virtues of a Great Programmer](http://threevirtues.com/), then you probably hate writing automated test suites.  Writing comprehensive suites of Unit tests flies directly in the face of everything us Great Programmers stand for.  Why would a Lazy, Impatient Developer who Never Makes Mistakes need to waste all that time, anyway?  Most of the time, all you want is an automated way to make sure your application is functioning properly at a high level.  Do you really need to write mountains of Unit tests to do this?  Can Unit tests even achieve this at all?  How do you even write effective tests for front-end behavior?  Fortunately for you, virtuous developer, it's 2013 and there are some awesome tools to help you achieve your testing goals without wanting to pull your hair out or strangle some poor, pontificating TDD extremist.  [CasperJS](http://casperjs.org) is the answer to the prayers you would have prayed if you weren't too lazy and impatient to bother.  But first, a word about Unit Test versus Functional Testing.


## Unit Tests vs. Functional Tests

Let's review.  There are basically 2 kinds of automated tests: Unit and Functional.  Unit Tests are written from the developer's perspective, and typically target a method or a class (did my `sort` method sort properly?) .  Functional Tests (sometimes referred to as Integration Tests) are written from the user's perspective, and usually test the interaction between multiple building blocks of the application (is the user able to log in?).  In a perfect world, your application would have both a comprehensive set of Unit tests as well as a bunch of Functional tests exercising your application's features.  In reality, you've probably got very little to none of either. If you had a full set of Unit and Functioanl Tests, you probably wouldn't be reading an article title "Front-end Testing for the Lazy Developer."  

### Functional Tests > Unit Tests

Let's face it.  Writing Unit Tests just isn't very fun, and despite what the idealist proponents of TDD may say, it can sometimes take just as long to write the test as it did to write the actual code.  And will your users be impressed that you have 90% code coverage and that all of your unit tests are passing when you have pages in your app that show up blank or errors that render your application unusable?  Who gives a shit if your Unit Tests are passing if your application doesn't work?  

**Unit tests make sure you are using quality ingredients.  Functional tests make sure your application *functions* (hence the name).**  Without Functional tests, your Unit tests aren't worth shit.  

Programmers solve big problems by breaking them down into smaller problems.  And as anyone who has ever worked on a non-trivial application knows, **the complexity lies in the interaction between the pieces of your application, not in the pieces themselves** (if that's not true, you need smaller pieces).  You may catch some bugs and catch them early with your Unit test suite.  Good for you.  In my experience, most bugs live in the same place as the complexity in your - in the interaction between the various moving pieces.  


### Especially in the Browser
Unit testing sucks extra in web applications.  Since your JavaScript is mostly concerned with manipulating the DOM, you're going to need some markup to go along with your JS tests.  Unlike on the server, where you can just fire up a JUnit test, instantiate some objects and call some methods, on the client you need to have a special page or pages set up just for your testing.  I find that I usually end up spending more time setting up dependencies for my JS objects and making dummy elements than I do actually writing Unit tests.  So in addition to the downsides and limitations of Unit tests generally, on the front-end you have extra overhead involved in writing time-consuming Unit tests that will *never ensure your application actually works*. 

Functional testing lets you test large swaths of code with considerably less effort and looser coupling.  A Functional test tests that entering username and password into a form and clicking submit results in a successful login.  A Unit test calls a specific method on a specific object and examines the result.  When that method name changes or the object goes away, your test is broken.  Functional tests are far less likely to break when your underlying implementation changes.

Unit testing has its place.  I don't want to discourage you from ever writing unit tests.  It just seems like Unit testing gets all of the attention, when Functional testing provides a far bigger bang for your buck.  Again, ideally you would do both!  But in the real world, most developers barely have time for one kind of automated test, let alone two.  If that describes you, I would strongly encourage you to go with Functional testing. 


## CasperJS and PhantomJS
In web applications, you can't automatically test your front-end without using some sort of tool.  There are a number of options out there, like [Selenium](http://docs.seleniumhq.org/), which has been around forever and has a nice GUI.  If you want something lightweight and simple that you can run from the command line, [CasperJS](http://casperjs.org) may be the right tool for you.  Casper runs on [PhantomJS](http://phantomjs.org/), a headless WebKit browser, and provides a full-featured API that lets you interact with a Phantom instance pointing at your application.  So rather than setting up special test pages that run your Unit tests, you can test your *actual application*.  For a <s>lazy</s> Virtuous developer like me, this is great.  


### Casper API
Casper, like Phantom, runs JavaScript code.  It can be used for web scraping in addition to testing, but we will focus on testing for now.  Casper runs your code from local JS files, but in your code you can also tell Casper to execute JavaScript in the context of the WebKit browser, using the `evaluate` method (more on this later).  To use Casper, you simply write some JS code, save it to a file, then run it from the command line like so: `casperjs my-source.js`.  If you will be running unit tests, you must include the `test` command, like so: `casperjs test my-test.js`.

Casper has a fantastic API full of convenience methods to help you interact with your headless browser.  There are 2 main modules that you can use, the [casper module](http://docs.casperjs.org/en/latest/modules/casper.html) and the [tester module](http://docs.casperjs.org/en/latest/modules/tester.html).  Methods in the tester module are only available when you run Casper with `casperjs test my-test.js`.  Let's first look at what the main `casper` module can do, then we'll look at tests in particular.   To get started, here's how you'd open [http://google.com](http://google.com) and print the page's title:

##### casper-example1.js
```javascript
var casper = require("casper").create();

casper.start("http://google.com", function() {
	this.echo(casper.getTitle());
});

casper.run();
```

Simple enough.  Now let's do a google search and take a snapshot of the results:

##### casper-google-search.js
```javascript
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

casper.run();
```

This fills out the form, entering "CasperJS" in the `<input>` with a name of "q" and then submitting the form.  `casper.then(callback)` executes the callback function once the page has completed the action from the last step.  A lot of Casper's functionality is asynchronous in nature, so you'll end up wrapping lots of your code in `.then()` calls.  In our callback, which is fired once the new page has loaded, we capture the screen and save it to `casper-google-search.png`:

![Google Search Screenshot](/images/casper-google-search.png)

Saving screenshots in this manner can be a great part of your functional tests, and can be hugely helpful when writing your tests.  

### Casper Test API

Now let's look at running a few basic tests.  Let's go to google.com, click "I'm feeling lucky" and then make sure that we have results.  

```javascript
var x;
```


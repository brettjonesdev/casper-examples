# Front-end Testing for the Lazy Developer with CasperJS 

If you pride yourself on possessing the [3 Virtues of a Great Programmer](http://threevirtues.com/), then you probably hate writing automated test suites.  Writing comprehensive suites of Unit tests flies directly in the face of everything us Great Programmers stand for.  Why would a Lazy, Impatient developer who never makes mistakes need to waste all that time, anyway?  Most of the time, all you want is an automated way to make sure your application is functioning properly at a high level.  Do you really need to write mountains of Unit tests to do this?  Can Unit tests even achieve this at all?  How do you even write effective tests for front-end behavior?  Fortunately for you, virtuous developer, it's 2013 and there are some awesome tools to help you achieve your testing goals without wanting to pull your hair out or strangle some poor, pontificating TDD extremist.  [CasperJS](http://casperjs.org) is the answer to the prayers you would have prayed if you weren't too lazy and impatient to bother.  But first, a word about Unit Test versus Functional Testing.


## Unit Tests vs. Functional Tests

Let's review.  There are basically 2 kinds of automated tests: Unit and Functional.  Unit Tests are written from the developer's perspective, and typically target a method or a class (did my `sort` method sort properly?) .  Functional Tests (sometimes referred to as Integration Tests) are written from the user's perspective, and usually test the interaction between multiple building blocks of the application (is the user able to log in?).  In a perfect world, your application would have both a comprehensive set of Unit tests as well as a bunch of Functional tests exercising your application's features.  In reality, you've probably got very little to none of either. If you had a full set of Unit and Functioanl Tests, you probably wouldn't be reading an article title "Front-end Testing for the Lazy Developer."  

### Functional Tests > Unit Tests

Let's face it.  Writing Unit Tests just isn't very fun, and despite what the idealist proponents of TDD may say, it can sometimes take just as long to write the test as it did to write the actual code.  And will your users be impressed that you have 90% code coverage and that all of your unit tests are passing when you have pages in your app that show up blank or errors that render your application unusable?  Who gives a shit if your Unit Tests are passing if your application doesn't work?  

**Unit tests make sure you are using quality ingredients.  Functional tests make sure your application *functions* (hence the name).**  Without Functional tests, your Unit tests aren't worth shit.  

Programmers solve big problems by breaking them down into smaller problems.  And as anyone who has ever worked on a non-trivial application knows, **the complexity lies in the interaction between the pieces of your application, not in the pieces themselves** (if that's not true, you need smaller pieces).  You may catch some bugs and catch them early with your Unit test suite.  Good for you.  But bugs feed off of complexity, which means you'll find them where things are the most complicated - in the interplay of your application's various parts.  Unit tests can't help you there.   

### Especially in the Browser
Unit testing sucks extra in web applications.  Since your JavaScript code is mostly concerned with manipulating the DOM, you're going to need some markup to go along with your JS tests.  Unlike on the server, where you can just fire up a JUnit test, instantiate some objects and call some methods, on the client you need to have a special page or pages set up just for your testing.  I find that I usually end up spending more time setting up dependencies for my JS objects and making dummy elements than I do actually writing Unit tests.  So in addition to the downsides and limitations of Unit tests generally, on the front-end you have extra overhead involved in writing time-consuming Unit tests that will *never ensure your application actually works*. 

Functional testing lets you test large swaths of code with considerably less effort and looser coupling.  A Functional test tests that entering username and password into a form and clicking submit results in a successful login.  A Unit test calls a specific method on a specific object and examines the result.  When that method name changes or the object goes away, your test is broken.  Functional tests are far less likely to break when your underlying implementation changes.

Unit testing has its place.  I don't want to discourage you from ever writing unit tests.  It just seems like Unit testing gets all of the attention, when Functional testing provides a far bigger bang for your buck.  Again, ideally you would do both!  But in the real world, most developers barely have time for one kind of automated test, let alone two.  If that describes you, I would strongly encourage you to go with Functional testing. 


## CasperJS and PhantomJS
In web applications, you can't automatically test your front-end without using some sort of tool.  There are a number of options out there, like [Selenium](http://docs.seleniumhq.org/), which has been around forever and has a nice GUI.  If you want something lightweight and simple that you can run from the command line, [CasperJS](http://casperjs.org) may be the right tool for you.  Casper runs on [PhantomJS](http://phantomjs.org/), a headless WebKit browser, and provides a full-featured API that lets you interact with a Phantom instance pointing at your application.  So rather than setting up special test pages that run your Unit tests, you can test your *actual application*.  For a <s>lazy</s> Virtuous developer like me, this is great.  


### Casper API
Casper, like Phantom, runs JavaScript code.  It can be used for web scraping in addition to testing, but we will focus on testing for now.  Casper runs your code from local JS files, but in your code you can also tell Casper to execute JavaScript in the context of the WebKit browser, using the `evaluate` method (more on this later).  To use Casper, you simply write some JS code, save it to a file, then run it from the command line like so: `casperjs my-source.js`.  If you will be running unit tests, you must include the `test` command, like so: `casperjs test my-test.js`.

*The examples that follow can be downloaded from my* [GitHub Repo](https://github.com/brettjonesdev/casper-examples).

Casper has a fantastic API full of convenience methods to help you interact with your headless browser.  There are 2 main modules that you can use, the [casper module](http://docs.casperjs.org/en/latest/modules/casper.html) and the [tester module](http://docs.casperjs.org/en/latest/modules/tester.html).  Methods in the tester module are only available when you run Casper with `casperjs test my-test.js`.  Let's first look at what the main `casper` module can do, then we'll look at tests in particular.   To get started, let's open [http://www.reddit.com/](http://www.reddit.com/), print the page's title, and take a screenshot.

##### reddit-home.js
```javascript
casper.options.viewportSize = {width: 1024, height: 768};
casper.start("http://www.reddit.com/", function() {
	console.log('Opened page with title \"' + this.getTitle() + '"');
    casper.capture("../images/reddit-home.png");
}).run();
```

Simple enough. the `start()` call opens the page and executes the callback when it's loaded.  We then take a screenshot and save it to a PNG called reddit-home.png.  Here's what it looks like:

![Reddit Screenshot](/images/reddit-home.png)

Saving screenshots in this manner can be a great part of your functional tests, and can be hugely helpful when writing your tests, helping you "see" what's going on in the invisible browser. 


### Casper Test API

Now let's take a look at Casper's test API.  Let's open up the /r/programming subreddit, click the "New" link and confirm that we're on the right page and have the correct content. 

##### reddit-new.js
```javascript
casper.options.viewportSize = {width: 1024, height: 768};
var testCount = 2;
casper.test.begin("Testing Reddit", testCount, function redditTest(test) {
    casper.start("http://www.reddit.com/r/programming", function() {
    	test.assertTitleMatch(/programming/, "Title is what we'd expect");
    	
    	//Click "new link"
    	casper.click("a[href*='/programming/new/']");
    	casper.waitForUrl(/\/programming\/new\/$/, function() {
    		test.assertElementCount("p.title", 25, "25 links on first page");
    		casper.capture("../images/reddit-programming-new.png");
    	});

    }).run(function() {
        test.done();
    });
});
```

Here, after we click the "New" link, we wait for the url to change and a new page to load.  Then we confirm that there are 25 links on the page, the Reddit default.  

One of Casper's strengths is its extensive and powerful API, chock full of useful helper methods like `click()` and `assertElementCount()`.  Let's look at a more complicated utility method, `fill()`.  `fill()` is a convenient way to fill out and (optionally) submit forms on the page.  In this example, let's fill out the search box form and search for "javascript" within the /r/programming subreddit.

#### reddit-search.js
```javascript
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
```

#### Invading the DOM - `casper.evaluate()`
Sometimes, to really test something complicated, you need to somehow jump into the DOM of the browser itself.  One of Casper's greatest strengths is its ability to do just that with the `[evaluate()](http://docs.casperjs.org/en/latest/modules/casper.html#evaluate)` method.  If you find this a bit confusing, they have a nice (diagram)[http://docs.casperjs.org/en/latest/_images/evaluate-diagram.png] to help you picture this.  Here's an example where we will jump into the context of the r/programming page, click on upvote, confirm that the login modal appears, then click on the `.close` backdrop and confirm that the modal disappears.  The results are then returned to the casper environment.  

#### reddit-modal.js
```javascript
casper.options.viewportSize = {width: 1024, height: 768};
var testCount = 1;
casper.test.begin("Testing upvote login", testCount, function upvoteLogin(test) {
    casper.start("http://www.reddit.com/r/programming", function() {
    	var modalOpensAndCloses = casper.evaluate(function(){
            console.log("Now I'm in the DOM!");
            $("div.thing:first .arrow.up").click()
            var modalVisibleAfterClick = $(".popup").is(":visible");
            $(".cover").click()
            var modalClosedAfterClickOff = $(".popup").is(":visible");
            return (modalVisibleAfterClick && !modalClosedAfterClickOff);
        });
        test.assert(modalOpensAndCloses, "Login Modal is displayed when clicking upvote before signing in");
    }).run(function() {
        test.done();
    });
});
```

An important thing to note when using `casper.evaluate()` is that unlike almost any other interaction that occurs with the browser (`click()`, `.fill()`, etc.), `evaluate` is **synchronous**.  Whereas after calling `fill` or '[sendKeys](http://docs.casperjs.org/en/latest/modules/casper.html#sendkeys) you will need to wrap your next interaction in a `casper.then()` callback, `evaluate` happens instantly.  This actually makes it easier to use than some of its asynchronous counterparts, but after a while you get used to asynchronous and have to remind yourself that evaluate is synchronous.  

### Thoughts on using Casper

Casper is probably not the best tool for someone who isn't familiar with JavaScript, and although it is concise and powerful, it has its pain points just like anything.  Here are a few pain points and ideas that you might consider to help you write a clean, concise and maintainable codebase.  
#### Async and `.then()`

Probably the most difficult part of using Casper is dealing with the asynchronous nature of pretty much everything.  It is important to understand that `then()` essentially adds navigation steps to a stack.  So if you call `click()`, you will need to wrap your follow-up code in a `then()` callback in order to see the changes from your click event.  I recommend reading helpful links like this [StackOverflow question](http://stackoverflow.com/questions/11604611/what-does-then-really-mean-in-casperjs) to try to wrap your head around this concept.

#### Code organization
Something I have found helpful in writing medium to large test suites is to make certain to organize code into separate files with specific tests and purposes.  CasperJS runs in the PhantomJS execution environment and allows you to include/import other JS files with CommonJS syntax.  So if you have a utility file my-utils.js, you can import it and use it elsewhere.

#### my-utils.js 
```javascript
exports.sayHello = function() {
	console.log("Hello");
}
```

#### elsewhere.js
```javascript
var myUtils = require("./my-utils");
myUtils.sayHello();
```

This is incredibly helpful, and allows you to organize your app into smaller pieces like you would in a "real" application.  I have found it helpful to organize in these ways:

* test.js - put your initial configuration here, and require() and run your tests here
* my-utils.js - have a common utility class for common actions and helper methods
* navigation.js - separate your navigation (go to this page) from your tests, and make navigation reusable across tests.  For instance, `require('./navigation').homePage();`
* customer.js - test the "customer" section of your application.  Keep this separate from login test and all of the other sections of your application you will be besting.  

Basically, when you are writing your test suites, don't be stupid and immediately disregard all of your hard-won knowledge about good software engineering best practices because your "just" writing tests.  [YAGNI](http://en.wikipedia.org/wiki/You_aren't_gonna_need_it).  [DRY](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself).  You know the drill.  

## Outro
If you've never really written unit or functional tests before, I hope you'll bit the bullet, take an hour and give Casper a shot.  It has a great community, is actively maintained, and makes for a great, lighweight and code-centric solution to a difficult and important problem that gets addressed far too infrequently.  If you're disillusioned with Unit Tests and TDD, don't throw the Functional Testing baby out with the proverbial bathwater.  I think you'll find the ROI for Casper integration testing to be far higher than you ever expected.  

If you'd like more information on Casper, check out these links:

* [Introducing CasperJS](https://nicolas.perriault.net/code/2012/introducing-casperjs-toolkit-phantomjs/)
* [Simpler UI Testing with CasperJS](http://blog.newrelic.com/2013/06/04/simpler-ui-testing-with-casperjs-2/)
* [What Does 'Then' Reqlly Mean in CasperJS](http://stackoverflow.com/questions/11604611/what-does-then-really-mean-in-casperjs)


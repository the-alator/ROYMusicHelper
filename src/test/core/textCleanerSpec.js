describe("Cleaners spec", function () {
   describe("Parentheses cleaner", function () {
       let parenthesesCleaner;
       beforeEach(function () {
           parenthesesCleaner = new ParenthesesCleaner();
       });
       it('should delete square parentheses with content', function () {
           assert.equal(parenthesesCleaner.doClean("q (q)"), "q ");
       });
       it('should delete brace equal parentheses with content', function () {
           assert.equal(parenthesesCleaner.doClean("q [q]"), "q ");
       });
       it('should delete any not equal parentheses with content', function () {
           assert.equal(parenthesesCleaner.doClean("q [q)"), "q ");
       });
       it('should delete any empty parentheses', function () {
           assert.equal(parenthesesCleaner.doClean("q [)"), "q ");
       });
   });
   describe("Case cleaner", function () {
       let caseCleaner;
       beforeEach(function () {
           caseCleaner = new CaseCleaner();
       });
       it('should make string lowercase', function () {
           assert.equal(caseCleaner.doClean("Qq D"), "qq d");
       });
   });
   describe("OtherSymbols cleaner", function () {
       let otherSymbolsCleaner;
       beforeEach(function () {
           otherSymbolsCleaner = new OtherSymbolsCleaner();
       });
       it('should replace double spaces with one space', function () {
           assert.equal(otherSymbolsCleaner.doClean("q  q"), "q q");
       });
       it('should replace ,. -"\'!? with one space', function () {
           assert.equal(otherSymbolsCleaner.doClean("q,. -\"'!?  q"), "q q");
       });
       it('should remove `', function () {
           assert.equal(otherSymbolsCleaner.doClean("q`q"), "qq");
       });
    });

});
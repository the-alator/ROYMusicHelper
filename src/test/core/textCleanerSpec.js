// require("./textCleaners");
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
   }) 
});
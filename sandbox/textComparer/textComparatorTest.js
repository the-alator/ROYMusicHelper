describe("trimText", function() {

    it("простой текст", function() {
        assert.equal(textComparator.trimText("text"), "text");
    });

    it("верхний регистр", function() {
        assert.equal(textComparator.trimText("teXT"), "text");
    });

    it("сторонние символы 1", function() {
        assert.equal(textComparator.trimText("te!!XT."), "te xt");
    });

    it("сторонние символы 2", function() {
        assert.equal(textComparator.trimText("t  e!! XT."), "t e xt");
    });

    it("безобидные скобки", function() {
        assert.equal(textComparator.trimText("teXT(ewqw1D1)"), "text(ewqw1d1)");
    });

    it("плохие скобки", function() {
        assert.equal(textComparator.trimText("teXT(ewqw111)"), "text");
    });
});

mocha.run();
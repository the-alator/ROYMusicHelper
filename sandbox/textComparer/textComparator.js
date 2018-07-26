{
    window.textComparator = {};

    textComparator.sieve = function(array, sample) {

    };

    let trimRegex = /[-._!@#$%^&*=+: ]+/g;
    let numberRegionRegex = /(["'(\[]).*?\d\d.*?(\1|[)\]])/g;
    let originalRegionRegex = /(["'(\[]).*?(origin|оригинал).*?(\1|[)\]])/g;
    textComparator.trimText = function(text){
        text = text.toLowerCase();

        text = text.replace(trimRegex, " ");
        text = text.replace(numberRegionRegex, " ");
        text = text.trim();

        return text;
    };
}
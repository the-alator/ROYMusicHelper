const DEFAULT_SONGS_PART_SIZE = 10;


function getNumberOfDefaultParts(songsList) {
    return getNumberOfParts(songsList, DEFAULT_SONGS_PART_SIZE);
}

function getNumberOfParts(songsList, partSize) {
    return Math.ceil(songsList.length / partSize);
}

function splitListToDefaultParts(songsList) {
    return splitListToParts(songsList, DEFAULT_SONGS_PART_SIZE);
}

function splitListToParts(songsList, partSize) {
    let numberOfParts = getNumberOfParts(songsList, partSize);
    let partsList = [];

    for(let i = 0; i < numberOfParts; i++) {
        partsList.push(songsList.slice(i * partSize, (i + 1) * partSize));
    }

    return partsList;
}

function getMaxSimilaritySongsIndices(songsList) {
    let maxSimilaritySongsIndices = [];

    for (let i = 0; i < songsList.length; i++) {
        if(songsList[i].similarity === 1) {
            maxSimilaritySongsIndices.push(i);
        }
    }

    return maxSimilaritySongsIndices;
}

module.exports.splitListToDefaultParts = splitListToDefaultParts;
module.exports.getNumberOfDefaultParts = getNumberOfDefaultParts;
module.exports.DEFAULT_SONGS_PART_SIZE = DEFAULT_SONGS_PART_SIZE;
module.exports.getMaxSimilaritySongsIndices = getMaxSimilaritySongsIndices;
function getMaxSimilaritySongsIndices(songsList) {
    let maxSimilaritySongsIndices = [];

    for (let i = 0; i < songsList.length; i++) {
        if(songsList[i].similarity === 1) {
            maxSimilaritySongsIndices.push(i);
        }
    }

    return maxSimilaritySongsIndices;
}

function getSublistWithSimilarityMoreThen(minSimilarity, songsList){
    let index = 0;

    for(; index < songsList.length; index++) {
        if(songsList[index].similarity < minSimilarity) {
            break;
        }
    }

    return songsList.slice(0, index);
}

module.exports.getMaxSimilaritySongsIndices = getMaxSimilaritySongsIndices;
module.exports.getSublistWithSimilarityMoreThen = getSublistWithSimilarityMoreThen;
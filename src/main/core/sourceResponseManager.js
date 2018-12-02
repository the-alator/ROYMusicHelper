function SourceResponseManager(title, songsSetsManager) {
    const SUCCESSFUL_RESPONSES_TO_START_PROCESSING = 2;
    let responsesCount = 0;
    let successfulResponses = 0;
    let failResponses = 0;
    let songsSetsList = [];

    this.fail = function () {
        response();
        failResponses++;
    };

    this.success = function (songsList) {
        response();
        successfulResponses++;
        songsSetsList.push(songsList);

        if(successfulResponses >= SUCCESSFUL_RESPONSES_TO_START_PROCESSING) {
            songsSetsManager.process(title, songsSetsList);
        }

    };

    function response(){
        responsesCount++;
    }
}
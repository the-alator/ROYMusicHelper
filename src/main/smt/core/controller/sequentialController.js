function SequentialController(list, cycleBody, cycleFinal){
    this.list = list;
    this.currentIndex = 0;
    this.cycleBody = cycleBody;
    this.next = function(){
        console.log("next is started. CI - " + this.currentIndex + " list.length - " + this.list.length);
        if(this.currentIndex === this.list.length && this.cycleFinal){
            this.cycleFinal();
            return;
        }
        console.log("next is performing");
        this.cycleBody(this.list[this.currentIndex++]);
    }
    this.cycleFinal = cycleFinal;
}
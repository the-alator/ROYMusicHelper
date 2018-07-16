function AsyncCycle(list, cycleBody){
    this.list = list;
    this.currentIndex = 0;
    this.cycleBody = cycleBody;
    this.next = function(){
        if(++currentIndex === list.length){
            return;
        }
        this.cycleBody(this.list[this.currentIndex]);
    }
}
export class Timer{

    constructor(onComplete, onTick){
        this.duration=0;
        this.remaning=0;
        this.intervalId=null;
        this.onComplete=onComplete;
        this.onTick=onTick;
        this.isRunning=false;
    }


    // start timer with duration in minutes
    start(minutes){
        if (minutes <=0) {
            this.stop();
            return ;
        }
        this.duration=minutes*60;
        this.remaning=this.duration;
        this.isRunning=true;
        

        // clear any existing interval 
        if(this.intervalId){
            clearInterval(this.intervalId);
        }

        //update display 
        this.updateDisplay();

        // start countdown/ interval
        this.intervalId=setInterval(()=>{
            this.remaning--;
            this.updateDisplay();

            if(this.remaning<=0){ // check if time is done
               this.complete();
            }
        },1000 );

    }

    //stop timer
    stop(){
        if(this.intervalId){
            clearInterval(this.intervalId);
            this.intervalId=null;
        }

        this.duration=0;
        this.remaning=0;
        this.isRunning=false;
        this.updateDisplay();
    }

    //timer completed
    complete(){
        this.stop();

        if (this.onComplete) {
            this.onComplete();
        }
    }


    //update display
    updateDisplay(){
        const minutes= Math.floor(this.remaning/60);
        const seconds=this.remaning % 60;

        if(this.onTick){
            this.onTick(minutes, seconds);
        }
    }
}
export class Player {
    constructor(name){
        this.name = name;
        this.score = 0;
    }
}

export class Game {
    constructor(){
        this.players={};
        this.diceCount=1;
    }
}
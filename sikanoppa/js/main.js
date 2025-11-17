//import {Game, Player} from "./class.js"; 
var elem={
    playerName: null,
    playerTable: null,
    addPlayer: null,
    startGame: null,
};

var dice = {
    switch: null,
    first: null,
    second: null,
    throwButton: null,
    takeButton: null,
    scoreText: null,
};

var newPlayers=[];

function AddPlayer(){
    let name = elem.playerName.value;
    if (!name || newPlayers.includes(name) || gamePlaying) return;
    elem.playerName.value = "";

    console.log(name);

    let playerFormat = 
    `<th player id="${name}">${name}</th>
    <th><button deletebutton onclick="RemovePlayer(this, '${name}')">-</button></th>
    <th><span playerscore='${name}' style="display: none;">0</span></th>`;

    let newTableRow = document.createElement("tr");
    newTableRow.innerHTML = playerFormat;

    elem.playerTable.appendChild(newTableRow);

    newPlayers.push(name);
}

function RemovePlayer(element, name){
    if (gamePlaying) {return;}
    console.log(name)

    var index = newPlayers.indexOf(name);
    if (index !== -1) {
        newPlayers.splice(index, 1);
    }
    element.parentNode.parentNode.remove()
}

function diceCountChange(){
    if (dice.switch.checked){
        dice.second.style.display = "inline";
    } else {
        dice.second.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    elem.playerName = document.getElementById("playerName");
    elem.playerTable = document.getElementById("playerTable");


    dice.switch = document.getElementById("diceSwitch");
    dice.first = document.querySelectorAll('[dice="1"]')[0];
    dice.second = document.querySelectorAll('[dice="2"]')[0];
    dice.throwButton = document.getElementById("throwDice");
    dice.takeButton = document.getElementById("takeScore");
    dice.scoreText = document.getElementById("diceScore");


    elem.addPlayer = document.getElementById("addPlayer")
    elem.addPlayer.addEventListener("click", AddPlayer);

    elem.startGame = document.getElementById("startGame")
    elem.startGame.addEventListener("click", StartGame);

    dice.switch.addEventListener("click", diceCountChange);

    document.getElementById("playerName").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.key === 'Enter') {
            AddPlayer();
        }
    });

    if (dice.switch.checked){
        dice.second.style.display = "inline";
    } else {
        dice.second.style.display = "none";
    }
});

const diceText=["⚀","⚁","⚂","⚃","⚄","⚅"];

class Player{
    constructor(name){
        this.name = name;
        this.score = 0;
    }
}

class Game{
    constructor(players, diceCount, scoreStreak){
        this.players=[];
        for (let i = 0; i < newPlayers.length; i++) {this.players.push(new Player(newPlayers[i]));}
        console.log(this.players);

        this.boundThrowDice = this.ThrowDice.bind(this);
        this.boundTakeScore = this.TakeScore.bind(this);
        this.boundGameEnd = this.GameEnd.bind(this);

        dice.throwButton.addEventListener("click", this.boundThrowDice);
        dice.takeButton.addEventListener("click", this.boundTakeScore);
        this.diceCount=1 + (1 * dice.switch.checked);

        this.scoreStreak = [];
        this.lastScore = 0;

        this.currentPlayer = 0;

        this.currentPlayerElem = document.getElementById(this.players[this.currentPlayer].name);
        this.currentPlayerElem.style.color = "red";

        elem.startGame.addEventListener("click",this.boundGameEnd);

    }
    GameEnd() {
        dice.throwButton.removeEventListener("click", this.boundThrowDice);
        dice.takeButton.removeEventListener("click", this.boundTakeScore);
        elem.startGame.removeEventListener("click", this.boundGameEnd);
    }
    ThrowDice() {
        dice.takeButton.disabled = false;
        let first = Math.floor(Math.random()*6) + 1;
        let second = Math.floor(Math.random()*6) + 1;

        dice.first.innerHTML = diceText[first-1];
        dice.second.innerHTML = diceText[second-1];

        if (this.diceCount==1){
            if (first==1) {this.LostStreak(); return;}
            this.scoreStreak.push(first);
        } else {
            if (first==1 && first != second || second==1 && second != first) {this.LostStreak(); return;}
            let newScore=0
            if (first == second){
                if (first == 1) {
                    newScore = 25;
                } else {newScore = (first + second)*2;}
            } else {newScore = first + second;}
            this.scoreStreak.push(newScore);
        }
        this.GetScoreText();
    }
    GetScoreText(){
        let scoreText=`${this.scoreStreak[0]}`;
        let totalScore=this.scoreStreak[0];

        if (this.scoreStreak.length>1){
            for (let i=1; i < this.scoreStreak.length; i++){
                totalScore += this.scoreStreak[i];
                scoreText+= ` + ${this.scoreStreak[i]}`;
            }
        }

        scoreText+= ` = ${totalScore}`;
        dice.scoreText.innerHTML = scoreText;
        this.lastScore = totalScore;
    }
    LostStreak(){
        this.scoreStreak=[];
        dice.scoreText.style.color = "red";
        if (this.lastScore == 0){dice.scoreText.innerHTML = `lol`} 
        else {dice.scoreText.innerHTML = `-${this.lastScore}`;}
        dice.throwButton.disabled = true;
        dice.takeButton.disabled = true;
        this.lastScore=0;
        this.NextPlayerTimeout();
    }
    TakeScore(){
        this.scoreStreak=[];
        this.players[this.currentPlayer].score += this.lastScore;
        document.querySelectorAll(`[playerscore=${this.players[this.currentPlayer].name}]`)[0].innerHTML = this.players[this.currentPlayer].score;
        dice.scoreText.style.color = "green";
        dice.scoreText.innerHTML = `+${this.lastScore}`;
        this.lastScore = 0;
        this.NextPlayerTimeout();
    }
    NextPlayerTimeout(){
        dice.throwButton.disabled = true;
        dice.takeButton.disabled = true;

        let that = this; 
        setTimeout(function(){
            that.NextPlayer();
            dice.throwButton.disabled = false;
            dice.scoreText.style.color = "white";
            dice.scoreText.innerHTML = "";
        }, 2000);
    }
    NextPlayer(){
        this.currentPlayerElem.style.color = "white";
        if (this.currentPlayer == this.players.length - 1){
            this.currentPlayer = 0; 
            this.GetAndChangeCurrentPlayerColor()
            return;
        }
        this.currentPlayer++;
        this.GetAndChangeCurrentPlayerColor()
    }
    GetAndChangeCurrentPlayerColor(){
        this.currentPlayerElem = document.getElementById(this.players[this.currentPlayer].name);
        this.currentPlayerElem.style.color = "red";
    }
}

var game = null
var gamePlaying = false;

function StartGame(){
    if (newPlayers.length<1) return;
    gamePlaying = !gamePlaying
    let gameButton = document.getElementById("startGame");
    let addPlayerButton = document.getElementById("addPlayer");
    let diceBox = document.getElementById("dicebox");

    if (gamePlaying){
        dice.scoreText.innerHTML = "";

        gameButton.innerHTML = "Lopeta";
        addPlayerButton.style.display = "none";
        diceBox.style.display = "block";
        dice.switch.disabled = true;

        dice.takeButton.disabled = true;

        let deleteButtons = document.querySelectorAll("[deletebutton]");
        deleteButtons.forEach((x) => x.style.display = "none");

        let playerScores = document.querySelectorAll("[playerscore]");
        playerScores.forEach((x) => x.style.display = "inline");

        let playerNames = document.querySelectorAll("[player]");
        playerNames.forEach((x) => x.style.color = "white");

        elem.playerName.style.display = "none";

        game = new Game()
    } else {
        gameButton.innerHTML = "Aloita";
        addPlayerButton.style.display = "inline";
        diceBox.style.display = "none";
        dice.switch.disabled = false;

        dice.throwButton.disabled = false;

        let deleteButtons = document.querySelectorAll("[deletebutton]");
        deleteButtons.forEach((x) => x.style.display = "inline");

        let playerScores = document.querySelectorAll("[playerscore]");
        playerScores.forEach((x) => x.style.display = "none");
        playerScores.forEach((x) => x.innerHTML = "0");

        let playerNames = document.querySelectorAll("[player]");
        playerNames.forEach((x) => x.style.color = "white");

        elem.playerName.style.display = "inline";
    }
}
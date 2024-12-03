// Initialize pot and player stacks

/*
todo list:

[x] fix call for blinds
[x] fix call for when you have already put money (keep track of how much each player has already put in)
[x] only display buttons for current player
[x] add fold button
[x] add check button to the call button
[x] create add player button
[x] create remove player button
[ ] support removing specific player
[ ] change player names
[ ] add rounds (preflop, flop, turn, river)
[ ] resolve side pots
*/


const SMALL_BLIND = 5;
const BIG_BLIND = 10;
const STARTING_STACK = 1000;

let pot = 0;
let prevBet = 0;
let dealer = 0;
let turn = 1;
let numPlayers = 4;

let playerStacks = {
    player1: STARTING_STACK,
    player2: STARTING_STACK,
    player3: STARTING_STACK,
    player4: STARTING_STACK
};

let alreadyAdded = {
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0
}

let folded = {
    player1: false,
    player2: false,
    player3: false,
    player4: false
}

// Function to add to the pot (deduct from the player's stack)
function raise(playerNum) {
    const player = "player" + playerNum;

    const amount = parseInt(prompt("Raise amount:"));

    // support the cancel button, do not allow bad input
    if (amount == null || amount < 0) return;

    if (playerStacks[player] >= amount) {
        if (amount >= prevBet * 2) {
            prevBet = amount + alreadyAdded[player];
            put(playerNum, amount);
            nextTurn();
           
        } else {
            alert("Minimum bet is " + prevBet * 2);
        }
    } else {
        alert("Not enough chips in the player's stack!");
    }
}

function put(playerNum, amount) {
    const player = "player" + playerNum;

    playerStacks[player] -= amount;
    pot += amount;
    alreadyAdded[player] += amount;

    // Update player's stack
    renderStackandPot(playerNum);
}

function callBet(playerNum) {
    const player = "player" + playerNum;


    let amount = prevBet - alreadyAdded[player];

    put(playerNum, amount);
    nextTurn();
}

function fold(playerNum) {
    folded["player" + playerNum] = true;
    nextTurn();
}

function pay(playerNum) {
    const player = "player" + playerNum;

    playerStacks[player] += pot;
    pot = 0;

    renderStackandPot(playerNum);

    // disable buttons
    removeButtons(turn);
}

function resetRound() {
    for (let i = 1; i <= numPlayers; i++) {
        amountToAdd["player" + i] = 0;
        folded["player" + i] = false;
    }
}

function blinds() {
    // don't start a pot while one's already going
    if (pot != 0) return;

    nextDealer();
    turn = dealer;

    // set initial call value to blind value
    prevBet = BIG_BLIND;

    // if a player is too short stacked, problems will arise

    nextTurn();
    playerNumSmall = turn;

    nextTurn();
    playerNumBig = turn;

    nextTurn();
   
    small = "player" + playerNumSmall;
    big = "player" + playerNumBig;

    put(playerNumSmall, SMALL_BLIND);
    put(playerNumBig, BIG_BLIND);
}


function renderStackandPot(playerNum) {
    document.getElementById("stack" + playerNum).value = playerStacks["player" + playerNum];
    document.getElementById("pot").textContent = pot;
}

function nextTurn() {
    removeButtons(turn);
    turn = turn + 1 > numPlayers ? 1 : turn + 1;
    addButtons(turn);
    if (folded["player" + turn]) nextTurn();
}

function nextDealer() {
    
    const dbutton = document.getElementById("dealer");
    if (dbutton) {
        // Remove the element from the DOM
        dbutton.remove();
        console.log('Dealer button removed successfully.');
      } else {
        console.log('No dealer button found to remove.');
    }

    dealer = dealer + 1 > numPlayers ? 1 : dealer + 1;

    // Create the dealer button
    let dealerButton = document.createElement("div");
    dealerButton.textContent = "D";
    dealerButton.classList.add("dealer-button");
    dealerButton.title = "Dealer Button";
    dealerButton.id = "dealer";

    // Find the player and append the dealer button
    let player = document.getElementById("player" + dealer);
    player.appendChild(dealerButton);

}

function removeButtons(playerNum) {
    // Find the container and append the buttons
    let container = document.getElementById("button-container" + playerNum);
    container.innerHTML = "";
}

// Function to dynamically add the buttons
function addButtons(playerNum) {
    // Create the raise button
    let raiseButton = document.createElement("button");
    raiseButton.textContent = "+";
    raiseButton.onclick = function() {
        raise(playerNum);
    };

    // Create the call/check button
    let callButton = document.createElement("button");
    callButton.textContent = "-";
    callButton.classList.add("callButton");
    callButton.onclick = function() {
        callBet(playerNum);
    };

    // Create the fold button
    let foldButton = document.createElement("button");
    foldButton.textContent = "x";
    foldButton.classList.add("foldButton");
    foldButton.onclick = function() {
        fold(playerNum);
    };

    // Find the container and append the buttons
    let container = document.getElementById("button-container" + playerNum);
    container.appendChild(raiseButton);
    container.appendChild(callButton);
    container.appendChild(foldButton);
  }

  function addPlayer() {
    console.log("Player being added");
    numPlayers++;
    let playerNumber = numPlayers;
    let playerid = `player${playerNumber}`;
    let containerId = "player-container";
    // The dynamic HTML string to be added
    const playerHTML = `
      <div class="player" id="${playerid}">
        <label class="" id="l${playerNumber}">Player ${playerNumber} Stack: $</label>
        <input type="number" id="stack${playerNumber}" value="1000">
        <div class="buttcont" id="button-container${playerNumber}"></div>
      </div>
    `;
  
    // Find the container element by ID
    const container = document.getElementById(containerId);
    if (container) {
        // Append the HTML to the container
        container.insertAdjacentHTML('beforeend', playerHTML);
        console.log(`Player ${playerNumber} HTML added to container with ID: ${containerId}`);
        
        playerStacks[playerid] = STARTING_STACK;
        alreadyAdded[playerid] = 0;
        folded[playerid] = false;


    } else {
        console.error(`Container with ID "${containerId}" not found.`);
    }
  }

function removePlayer() {
    console.log("Player being added");
    
    let playerNumber = numPlayers;
    let playerid = `player${playerNumber}`;
    let containerId = "player-container";
  
    // Find the player element by ID
    const playerHTML = document.getElementById(playerid);
    if (playerHTML) {
        // Append the HTML to the container
        playerHTML.remove();
        console.log(`Player ${playerNumber} HTML removed`);
        
        delete playerStacks[playerid];
        delete alreadyAdded[playerid];
        delete folded[playerid];
        numPlayers--;

    } else {
        console.error(`Player with ID "${playerid}" not found.`);
    }
}
// Initialize pot and player stacks

const SMALL_BLIND = 5;
const BIG_BLIND = 10;
const STARTING_STACK = 1000;

const FULL_RESET = 1;
const NEXT_CARD_RESET = 0;

let pot = 0;
let prevBet = 0;
let raiser = -1;
let dealer = 0;
let turn = 1;
let numPlayers = 1;

let playerStacks = {
    player1: STARTING_STACK
};

let alreadyAdded = {
    player1: 0
}

let folded = {
    player1: false
}

// Function to add to the pot (deduct from the player's stack)
function raise(playerNum) {
    const playerid = "player" + playerNum;

    const amount = parseInt(prompt("Raise amount:"));

    // support the cancel button, do not allow bad input
    if (amount == null || amount < 0) return;

    if (playerStacks[playerid] >= amount) {
        if (amount >= prevBet * 2) {
            // raise goes through
            raiser = playerNum;
            prevBet = amount + alreadyAdded[playerid];
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
    const playerid = getPlayerID(playerNum);


    let amount = prevBet - alreadyAdded[playerid];

    put(playerNum, amount);

    checkForEndOfTurn();
}

function fold(playerNum) {
    folded[getPlayerID(playerNum)] = true;
    
    checkForEndOfTurn();
}

// NEED TO ALLOW FOR THE LAST PERSON TO RAISE
function checkForEndOfTurn() {
    let nextTurnNum = turn + 1 > numPlayers ? 1 : turn + 1;
    console.log(`Turn: ${turn}, Raiser: ${raiser}`);

    if (nextTurnNum == raiser) {
        window.alert("Deal next card(s)!");
        resetRound(NEXT_CARD_RESET);
    } else {
        nextTurn();
    }
    
}

function pay(playerNum) {
    const playerid = getPlayerID(playerNum);

    playerStacks[playerid] += pot;
    pot = 0;

    renderStackandPot(playerNum);

    // disable buttons
    removeButtons(turn);

    // enable add/remove players
    enableAddRemovePlayers();

    resetRound(FULL_RESET);
}

function resetRound(full) {
    prevBet = 0;
    if (full) {
        for (let i = 1; i <= numPlayers; i++) {
            alreadyAdded[getPlayerID(i)] = 0;
            folded[getPlayerID(i)] = false;
        }
    } else {
        // set current turn to dealer + 1
        removeButtons(turn);
        turn = dealer + 1 > numPlayers ? 1 : dealer + 1;
        raiser = dealer;
        addButtons(turn);

        // players have added 0 to the pot so far
        for (let i = 1; i <= numPlayers; i++) {
            alreadyAdded[getPlayerID(i)] = 0;
        }
    }
    
}

function blinds() {
    // don't start a pot while one's already going
    if (pot != 0) return;

    // disable add/remove players
    disableAddRemovePlayers();

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
   
    small = getPlayerID(playerNumSmall);
    big = getPlayerID(playerNumBig);

    raiser = playerNumBig;

    put(playerNumSmall, SMALL_BLIND);
    put(playerNumBig, BIG_BLIND);
}


function renderStackandPot(playerNum) {
    document.getElementById("stack" + playerNum).value = playerStacks[getPlayerID(playerNum)];
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
    let dealerContainer = document.getElementById("dealer-container" + dealer);
    dealerContainer.appendChild(dealerButton);

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
    raiseButton.classList.add("optionButton");
    raiseButton.onclick = function() {
        raise(playerNum);
    };

    // Create the call/check button
    let callButton = document.createElement("button");
    callButton.textContent = "-";
    callButton.classList.add("callButton");
    callButton.classList.add("optionButton");
    callButton.onclick = function() {
        callBet(playerNum);
    };

    // Create the fold button
    let foldButton = document.createElement("button");
    foldButton.textContent = "x";
    foldButton.classList.add("foldButton");
    foldButton.classList.add("optionButton");
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
    if (pot != 0) return;

    console.log("Player being added");
    numPlayers++;
    let playerNum = numPlayers;
    let playerid = getPlayerID(playerNum);
    let containerId = "player-container";
    let payContainerId = "pay-container";
    // The dynamic HTML string to be added
    const playerHTML = `
      <div class="player" id="${playerid}">
        <div class="buttcont" id="dealer-container${playerNum}"></div>
        <label id="l${playerNum}">Player ${playerNum} Stack: $</label>
        <input type="number" id="stack${playerNum}" value="${STARTING_STACK}">
        <div class="buttcont" id="button-container${playerNum}"></div>
      </div>
    `;

    const payButtonHTML = `
        <button id="pay${playerNum}" class="payButton" onclick="pay(${playerNum})">${playerNum}</button>
    `
  
    // Find the container element by ID
    const playerContainer = document.getElementById(containerId);
    const payContainer = document.getElementById(payContainerId);

    if (playerContainer && payContainer) {
        // Append the HTML to the container
        playerContainer.insertAdjacentHTML('beforeend', playerHTML);
        console.log(`Player ${playerNum} HTML added to container with ID: ${containerId}`);
        
        playerStacks[playerid] = STARTING_STACK;
        alreadyAdded[playerid] = 0;
        folded[playerid] = false;

        payContainer.insertAdjacentHTML('beforeend', payButtonHTML);

    } else {
        console.error(`Container with ID "${containerId}" or "${payContainerId}" not found.`);
    }
  }

function removePlayer() {
    if (pot != 0) return;

    console.log("Player being added");
    
    let playerNum = numPlayers;
    let playerid = getPlayerID(playerNum);
    let payid = `pay${playerNum}`;
  
    // Find the player element by ID
    const playerHTML = document.getElementById(playerid);
    const payButtonHTML = document.getElementById(payid);
    if (playerHTML && payButtonHTML) {
        // Append the HTML to the container
        playerHTML.remove();
        payButtonHTML.remove();
        console.log(`Player ${playerNum} HTML removed`);
        
        delete playerStacks[playerid];
        delete alreadyAdded[playerid];
        delete folded[playerid];
        numPlayers--;

    } else {
        console.error(`Player with ID "${playerid}" or "${payid}" not found.`);
    }
}

function enableAddRemovePlayers() {
    const containerid = "add-remove-player-container";
    const container = document.getElementById(containerid);

    if (container) {
        container.innerHTML = `
            <button onclick="addPlayer()">Add Player</button>
            <button class="foldButton" onclick="removePlayer()">Remove Player</button>
        `;
    } else {
        console.error(`Add and Remove container not found`);
    }
}

function disableAddRemovePlayers() {
    const containerid = "add-remove-player-container";
    const container = document.getElementById(containerid);

    if (container) {
        container.innerHTML = "";
    } else {
        console.error(`Add and Remove container not found`);
    }
}

function getPlayerID(playerNum) {
    return `player${playerNum}`;
}
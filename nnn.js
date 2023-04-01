const statusDisplay = document.querySelector('.game--status');

// gameActive is true until someone wins.
let gameActive = true;
// Player 1 moves the "X" pieces.
let currentPlayer = "X";
let gameState = ["X", "O", "X", "", "", "", "O", "X", "O"];
// Dictionary of available options when a user drags a piece.
// For example dragging a piece from cell "1" will offer cell "2" and "4" as potential options.
let availOptions = {
    0: [1, 3],
    1: [0, 2, 4],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4, 8],
    6: [3, 7],
    7: [4, 6, 8],
    8: [5, 7],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 8]
};
// Build default messages.
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;
const winningMessage = () => `Player ${currentPlayer} has won!`;
// Display the current player's turn message.
statusDisplay.innerHTML = currentPlayerTurn();
// All possible winning combinations (each requires a single player's pieces to match one of the below patterns).
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
// This function is called when someone starts dragging a piece.
// "dragPieceEvent" is the div with a class of "piece" (aka Player's Piece) that the player is dragging. 
function handlePieceDrag(dragPieceEvent) {
    // shorten the piece name to just "p".
    const p = dragPieceEvent.target;
    // the "player" attribute is either "X" or "O" and is attached to p.
    const pPlayer = p.getAttribute("player");
    // the "cellid" attribute is the cell that p is currently in.
    const cId = p.getAttribute("cellid");
    // the "id" of p is the Piece number ("X1" to "O3").
    const pId = p.id;
    // If the game is not active (someone already won, need to restart)...
    if (!gameActive) 
    {
        alert("Please restart the game.");
        return;
    } 
    // If the owner of the Piece (pPlayer) doesn't match the Turn's Player (currentPlayer)...
    else if (pPlayer !== currentPlayer)
    {
        alert('Please choose one of your own pieces.');
        return;
    }
    // Game is active and the Player is selecting a valid Piece...
    else if (pPlayer === currentPlayer) 
    {
        // Reset all cell formatting (just in case the player started to drag a different piece but changed their mind).
//        availOptions[9].forEach(resetAvailOptions);
        // Format the cells where a valid move can take place.
        availOptions[cId].forEach(highlightAvailOptions)
        // Pass along the Piece ID so if the player drops it in a valid cell, the cell will know which piece it is.
        dragPieceEvent.dataTransfer.setData('text/plain', pId);
    }
    return;
}
// This function shows the player where they can drop their pieces.
// "cid" is the id of the cell we want to highlight.
function highlightAvailOptions(cid){
    // Use the Cell's ID to get the element (c).
    const c = document.getElementById(cid)
    // The "pieceid" holds the id of the Piece in the cell.
    // If the pieceid is empty, there's no piece here...
    if (c.getAttribute("pieceid") === ""){
        // Add the "move-here" formatting to show the player this is a safe cell to move to.
        c.classList.add("move-here");
        // Update EventListeners for the newly ".move-here" formatted cells.
        // NOTE: we need to force the 'dragover' event from doing anything, not sure why, seems stupid we can't just use "drop".
        c.removeEventListener('drop', handleBadPieceDrop);
        c.addEventListener('drop', handlePieceDrop);
        c.addEventListener('dragover', handleDud);
    }
    else 
    {
        // Otherwise, this cell is occupied already, show the player they can't move here.
        c.classList.add("dont-move-here");
    }
    return;
}
// This function removes both "move-here" and "dont-move-here" formatting.
// "cid" is the id of the cell we want to de-highlight.
function resetAvailOptions(cid){
    // Use the Cell's ID to get the element (c).
    const c = document.getElementById(cid)
    // Update EventListeners for ".move-here" formatted cells.
    if (c.classList.contains("move-here"))
    {
        c.removeEventListener('drop', handlePieceDrop);
        c.addEventListener('drop', handleBadPieceDrop);
        c.removeEventListener('dragover', handleDud);    
        // remove special formatting.
        c.classList.remove("move-here");
    } 
    else if (c.classList.contains("dont-move-here"))
    {
        // remove special formatting.
        c.classList.remove("dont-move-here");
    }
    return;
}
function handleDud(e) {e.preventDefault();return false;}
// This function is called when the player drops their piece on a valid cell.
// "dropCellEvent" contains the div cell where the piece was dropped.
function handlePieceDrop(dropCellEvent) {
    // shorten 'dropCellEvent' to 'c'.
    const c = dropCellEvent.target;
    // Get the Piece's ID from the dropCellEvent's dataTransfer (set in the Drag function).
    const pieceId = dropCellEvent.dataTransfer.getData('text/plain');
    // get the Piece element by its ID.
    const p = document.getElementById(pieceId);
    // get the Prior Cell element using the Piece's "cellid"
    const cOld = document.getElementById(p.getAttribute('cellid'));
    // We need to remove the Piece's ID from the prior cell since it no longer lives there.
    cOld.setAttribute('pieceid',"");
    // Now we need to move the Piece into the new Cell and update their attributes.
    // Put the Piece into the new Cell.
    c.appendChild(document.getElementById(pieceId));
    // Set the "pieceid" attribute to the Piece's ID.
    c.setAttribute('pieceid', pieceId);
    // Set the "cellid" attribute to the Cell's ID.
    p.setAttribute('cellid', c.id);
    // Now we need to adjust the gameState array to show the current board layout.
    // Update the Prior Cell's gamestate placeholder.
    gameState[cOld.id] = "";
    // Update the Current Cell's gamestate placeholder.
    gameState[c.id] = currentPlayer;
    // Call the Result Validation function.
    handleResultValidation();
    return;
}
// This function is called when the player drops their piece on an invalid cell.
// "dropCellEvent" contains the div cell where the piece was dropped.
function handleBadPieceDrop(dropCellEvent) {
    // Clear dataTransfer (id of cell that was being dragged)
    dropCellEvent.dataTransfer.setData('text/plain', "");
    // Remove formatting from all cells!
    availOptions[9].forEach(resetAvailOptions);
    return;
}
// This function is called when a player successfully drops thier Piece into a valid cell.
function handleResultValidation() {
    // We start with the assumption no one has won yet, so set roundWon to false.
    let roundWon = false;
    // Start a for loop to iterate through the winningConditions array.
    for (let i = 0; i <= 7; i++) {
        // set winCondition to be the current iterations of winningConditions lookup cells (ex. [0, 1, 2]).
        const winCondition = winningConditions[i];
        // set a/b/c to the gameState's Cell of the winning condition lookup cell.
        // For example: Where the iteration is "1"
        //      The winConditions lookup cells would be cells 0, 1, and 2
        //      We need to test if all 3 lookup cells have an X or O
        //      In reality 0=X, 1=O, 2=""
        //      So a=value of cell 0 (X), b=value of cell 1 (O), c=value of cell 2 ("")
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        // If any of a/b/c are empty, there's no way this is a winning combintion
        if (a === '' || b === '' || c === '') {
            // iterate to the next winCondition
            continue;
        }
        // a, b, and c are all equal, they have to be either an X or an O, so the game is over.
        if (a === b && b === c) {
            // Set roundWon to True.
            roundWon = true;
            // Leave the loop.
            break
        }
    }
    // We've finished looping, if roundWon is no longer False, someone won the game!
    if (roundWon) {
        // Update the status message with the winner.
        statusDisplay.innerHTML = winningMessage();
        // Turn off the gameActive flag until a player resets the game.
        gameActive = false;
        // Reset all Cell highlighting.
        availOptions[9].forEach(resetAvailOptions);
        return;
    }
    //
    handlePlayerChange();
    return;
}
// This function is called after handleResultValidation (assuming the game is still Active).
function handlePlayerChange() {
    // Change the currentPlayer to the opposite of what it is now.
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    // Update the Current Player message so they know who's turn it is.
    statusDisplay.innerHTML = currentPlayerTurn();
    // Reset all Cell highlighting.
    availOptions[9].forEach(resetAvailOptions);
    return;
}
// This function is called when a player clicks the Restart Game button.
function handleRestartGame() {
    // Reset the gameActive value.
    gameActive = true;
    // Reset the currentPlayer to "X"
    currentPlayer = "X";
    // We need to move the Piece to their original Cells and update their attributes.
    // Put the Pieces into their original Cells.
    document.getElementById("0").appendChild(document.getElementById("X1"));
    document.getElementById("1").appendChild(document.getElementById("O1"));
    document.getElementById("2").appendChild(document.getElementById("X2"));
    document.getElementById("6").appendChild(document.getElementById("O2"));
    document.getElementById("7").appendChild(document.getElementById("X3"));
    document.getElementById("8").appendChild(document.getElementById("O3"));
    // Set the "pieceid" attribute to the Piece's ID.
    document.getElementById("0").setAttribute('pieceid', "X1");
    document.getElementById("1").setAttribute('pieceid', "O1");
    document.getElementById("2").setAttribute('pieceid', "X2");
    document.getElementById("3").setAttribute('pieceid', "");
    document.getElementById("4").setAttribute('pieceid', "");
    document.getElementById("5").setAttribute('pieceid', "");
    document.getElementById("6").setAttribute('pieceid', "O2");
    document.getElementById("7").setAttribute('pieceid', "X3");
    document.getElementById("8").setAttribute('pieceid', "O3");
    // Set the "cellid" attribute to the Cell's ID.
    document.getElementById("X1").setAttribute('cellid', "0");
    document.getElementById("X2").setAttribute('cellid', "2");
    document.getElementById("X3").setAttribute('cellid', "7");
    document.getElementById("O1").setAttribute('cellid', "1");
    document.getElementById("O2").setAttribute('cellid', "6");
    document.getElementById("O3").setAttribute('cellid', "8");
    // Now we need to adjust the gameState array to show the current board layout.
    gameState = ["X", "O", "X", "", "", "", "O", "X", "O"];
    // Update the statusDisplay to show the current Player's turn.
    statusDisplay.innerHTML = currentPlayerTurn();
    return;
}
// Set an EventListener for when the user begins dragging a Piece.
document.querySelectorAll('.piece').forEach(piece => piece.addEventListener('dragstart', handlePieceDrag));
// Set an EventListener for when the user drops a Piece in ANY cell.
// NOTE: This will be overridden by special case/valid cells highlighted during the handlePieceDrag function.
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('drop', handleBadPieceDrop));
// We need to also create a dud function for the "dragover" event.
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('dragover', function(e) {e.preventDefault();return false;}));
// Set an EventListener for when a player clicks "Restart Game" button.
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
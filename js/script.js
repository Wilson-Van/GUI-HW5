// JSON data structure for the tiles provided in the graphics_data zip
const tileData = [
    { letter: 'A', value: 1, amount: 9 },
    { letter: 'B', value: 3, amount: 2 },
    { letter: 'C', value: 3, amount: 2 },
    { letter: 'D', value: 2, amount: 4 },
    { letter: 'E', value: 1, amount: 12 },
    { letter: 'F', value: 4, amount: 2 },
    { letter: 'G', value: 2, amount: 3 },
    { letter: 'H', value: 4, amount: 2 },
    { letter: 'I', value: 1, amount: 9 },
    { letter: 'J', value: 8, amount: 1 },
    { letter: 'K', value: 5, amount: 1 },
    { letter: 'L', value: 1, amount: 4 },
    { letter: 'M', value: 3, amount: 2 },
    { letter: 'N', value: 1, amount: 6 },
    { letter: 'O', value: 1, amount: 8 },
    { letter: 'P', value: 3, amount: 2 },
    { letter: 'Q', value: 10, amount: 1 },
    { letter: 'R', value: 1, amount: 6 },
    { letter: 'S', value: 1, amount: 4 },
    { letter: 'T', value: 1, amount: 6 },
    { letter: 'U', value: 1, amount: 4 },
    { letter: 'V', value: 4, amount: 2 },
    { letter: 'W', value: 4, amount: 2 },
    { letter: 'X', value: 8, amount: 1 },
    { letter: 'Y', value: 4, amount: 2 },
    { letter: 'Z', value: 10, amount: 1 }
];

var tileBag = [];
var currentWord = [];
var totalScore = 0;
var occupiedSlots = [];

// set up the game and giving the player tiles
$(document).ready(() => {
    buildTileBag();
    dealTiles();
    buildBoardRow();

    // when a button is pressed do that function
    $('#submit-word').click(submitWord);
    $('#reset-game').click(resetGame);
});

function buildTileBag() {
    tileBag = [];
    // loop throught the json and put that data in the bag
    for (var i = 0; i < tileData.length; i++) {
        const tile = tileData[i];
        for (var j = 0; j < tile.amount; j++) {
            tileBag.push({ letter: tile.letter, value: tile.value });
        }
    }
}

// function to draw the initial 7 tiles at the beginning of the game
function dealTiles() {
    // make sure the rack is empty
    $('#tile-rack').empty();
    for (var i = 0; i < 7; i++) {
        // get a random index
        const idx = Math.floor(Math.random() * tileBag.length);
        // take the tile out of the bag
        const tile = tileBag.splice(idx, 1)[0];
        // get the image of the specific tile
        const $img = $('<img>', {
            src: `../graphics_data/Scrabble_Tiles/Scrabble_Tile_${tile.letter}.jpg`,
            class: 'tile',
            'data-letter': tile.letter,
            'data-value': tile.value
        });
        // make it draggable
        $img.draggable({revert: 'invalid'});
        // put it at the end of the rack
        $('#tile-rack').append($img);
    }
}

// function to draw only the needed number of tiles after submitting a word
function drawTiles(numTiles) {
    if (tileBag.length === 0 || numTiles <= 0) return;
    
    const tilesToDraw = Math.min(numTiles, tileBag.length);
    
    for (var i = 0; i < tilesToDraw; i++) {
        const idx = Math.floor(Math.random() * tileBag.length);
        const tile = tileBag.splice(idx, 1)[0];
        const $img = $('<img>', {
            src: `../graphics_data/Scrabble_Tiles/Scrabble_Tile_${tile.letter}.jpg`,
            class: 'tile',
            'data-letter': tile.letter,
            'data-value': tile.value
        });
        $img.draggable({revert: 'invalid'});
        $('#tile-rack').append($img);
    }
}

function buildBoardRow() {
    const $row = $('#board-row');
    
    // Define bonus squares based on the image
    const bonusSquares = {
        2: { type: 'double-word', multiplier: 2, text: 'DW' },
        6: { type: 'double-letter', multiplier: 2, text: 'DL' },
        8: { type: 'double-letter', multiplier: 2, text: 'DL' },
        12: { type: 'double-word', multiplier: 2, text: 'DW' }
    };
    
    // loop through each spot
    for (var i = 0; i < 15; i++) {
        let bonusType = 'none';
        let multiplier = 1;
        //check if bonus square
        if (bonusSquares[i]) {
            bonusType = bonusSquares[i].type;
            multiplier = bonusSquares[i].multiplier;
        }
        // create the slot
        const $slot = $('<div>', { 
            class: 'drop-slot', 
            id: `slot-${i}`, 
            'data-index': i,
            'data-bonus-type': bonusType,
            'data-multiplier': multiplier
        });
        
        // Add visual indicator for bonus squares for the first time
        if (bonusSquares[i]) {
            $slot.addClass(bonusSquares[i].type);
            $slot.text(bonusSquares[i].text);
        }
        
        $slot.droppable({
            accept: '.tile',
            // function when tile is dragged to slot
            drop: function(event, ui) {
                const $tile = ui.draggable;
                const letter = $tile.data('letter');
                const value = $tile.data('value');
                const slotIndex = parseInt($(this).data('index'));
                
                // check if the slot is already filled
                if ($(this).find('.tile').length > 0) {
                    // put back in rack if full already
                    returnTileToRack($tile);
                    return;
                }
                
                // check if the row is empty or is next to full
                if (occupiedSlots.length === 0 || isNextToOccupied(slotIndex)) {
                    // valid placement
                    $(this).append($tile);
                    $tile.css({
                        width: '55px',
                        height: '55px',
                        top: '0px',
                        left: '0px',
                        position: 'absolute',
                        zIndex: 'auto'
                    });

                    $tile.draggable('disable');

                    // update both arrays
                    occupiedSlots.push(slotIndex);
                    const bonusType = $(this).data('bonus-type');
                    const multiplier = $(this).data('multiplier');
                    
                    currentWord.push({ 
                        letter, 
                        value, 
                        slot: this.id,
                        bonusType: bonusType,
                        multiplier: multiplier
                    });
                    updateWordDisplay();
                } else {
                    // return to rack if it's not next to something
                    returnTileToRack($tile);
                }
            }
        });
        $row.append($slot);
    }
}

// Helper function to check if a slot is next to any occupied slot
function isNextToOccupied(index) {
    return occupiedSlots.some(slot => Math.abs(slot - index) === 1);
}

// Helper function to properly return tiles to rack
function returnTileToRack($tile) {
    $('#tile-rack').append($tile);
    $tile.css({ 
        position: 'static', 
        width: '55px', 
        height: '55px',
        top: 'auto',
        left: 'auto',
        zIndex: 'auto'
    });
    $tile.draggable('enable');
    $tile.draggable('option', 'revert', 'invalid');
}

function updateWordDisplay() {
    // sort tiles by their slot position to get the word that is on the board
    const sortedWord = currentWord.sort((a, b) => {
        const slotA = parseInt(a.slot.replace('slot-', ''));
        const slotB = parseInt(b.slot.replace('slot-', ''));
        return slotA - slotB;
    });
    
    const word = sortedWord.map(t => t.letter).join('');
    
    // calculate score with bonuses
    var letterScore = 0;
    var wordMultiplier = 1;

    for (let i = 0; i < sortedWord.length; i++) {
        var tile = sortedWord[i];
        var tileValue = tile.value;

        if (tile.bonusType === 'double-letter') {
            tileValue *= tile.multiplier;
        } else if (tile.bonusType === 'double-word') {
            wordMultiplier *= tile.multiplier;
        }

        letterScore += tileValue;
    }

    
    const score = letterScore * wordMultiplier;
    
    $('#current-word').text(`Word: ${word}`);
    $('#score-display').text(`Score: ${score}`);
}

function submitWord() {
    // submitting an empty word does nothing
    if (currentWord.length === 0) return;
    
    // same logic as updateWordDisplay to get word score
    const sortedWord = currentWord.sort((a, b) => {
        const slotA = parseInt(a.slot.replace('slot-', ''));
        const slotB = parseInt(b.slot.replace('slot-', ''));
        return slotA - slotB;
    });
    
    var letterScore = 0;
    var wordMultiplier = 1;
    
    for (let i = 0; i < sortedWord.length; i++) {
        var tile = sortedWord[i];
        var tileValue = tile.value;
    
        if (tile.bonusType === 'double-letter') {
            tileValue *= tile.multiplier;
        } else if (tile.bonusType === 'double-word') {
            wordMultiplier *= tile.multiplier;
        }
    
        letterScore += tileValue;
    }

    
    const wordScore = letterScore * wordMultiplier;
    
    // add the current word score to the total score
    totalScore += wordScore;
    $('#total-score').text(`Total: ${totalScore}`);
    
    // clear the word and board
    currentWord = [];
    occupiedSlots = [];
    $('#current-word').text('Word: ');
    $('#score-display').text('Score: 0');
    $('#board-row .drop-slot').empty();
    
    // draw enough tiles to refill the rack to 7 tiles
    const currentTileCount = $('#tile-rack .tile').length;
    const tilesToDraw = 7 - currentTileCount;
    drawTiles(tilesToDraw);
}

// reset the game
function resetGame() {
    totalScore = 0;
    currentWord = [];
    occupiedSlots = [];
    buildTileBag();
    dealTiles();
    $('#total-score').text('Total: 0');
    $('#score-display').text('Score: 0');
    $('#current-word').text('Word: ');
    $('#board-row .drop-slot').empty();
}
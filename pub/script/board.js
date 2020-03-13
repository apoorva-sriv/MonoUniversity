/* board js */

'use strict';

//==========================================================================
// Global Variables needed
//==========================================================================

// General purpose user class
function userClass(username, password, id)
{
	this.username = username,
	this.password = password,
	this.id = id,
	this.fullname = null,
	this.email = null,
	this.ownedPieces = [],
	this.isAdmin = false
};

let login = new userClass(localStorage.getItem("username"), localStorage.getItem("username"), "0");
login.isAdmin = (/true/i).test(localStorage.getItem("admin"));

let diceRolling = false;

//==========================================================================
// Elements that would normally be stored in an .h file
//==========================================================================

// Some constants needed to construct the board
const maxTiles = 40;
const maxDoubles = 3;
const unbuyableTiles = [0, 2, 4, 7, 10, 17, 20, 22, 30, 33, 36, 38];
const chanceTiles = [7, 22, 36];
const communityTiles = [2, 17, 33];
const taxTiles = [4, 38];
const cornerTiles = [0, 10, 20, 30];
const utilityTiles = [12, 28];
const ttcTiles = [5, 15, 25, 35];

// Flags for the building variable to see which buildings do we have or not
const BUILD_FLAG_1HOUSE = 1;
const BUILD_FLAG_2HOUSE = 2;
const BUILD_FLAG_3HOUSE = 4;
const BUILD_FLAG_4HOUSE = 8;
const BUILD_FLAG_HOTEL = 16;

// Tile Flags
const TILE_FLAG_NORMAL = 0
const TILE_FLAG_GO = 1;
const TILE_FLAG_COMMUNITY = 2;
const TILE_FLAG_CHANCE = 4;
const TILE_FLAG_JAIL = 8;
const TILE_FLAG_FREEPARKING = 16;
const TILE_FLAG_GOTOJAIL = 32;
const TILE_FLAG_TAX = 64;
const TILE_FLAG_UTILITY = 128;
const TILE_FLAG_TTC = 256; 

// Game State Flags
const GAMESTATE_END = 0;
const GAMESTATE_PLAYER_TURN = 1;
const GAMESTATE_PLAYER_ROLL = 2;
const GAMESTATE_PLAYER_MOVE = 4;
const GAMESTATE_PLAYER_DECISION = 8;
const GAMESTATE_AI_TURN = 16;
const GAMESTATE_AI_ROLL = 32;
const GAMESTATE_AI_MOVE = 64;
const GAMESTATE_AI_DECISION = 128;

// Player Colors
const playerColors = [ "magenta", "blue", "green", "orange" ];

// Building codes, building names and descriptions are stored here for convenience
const tileNames = [ ["GO", "GO",],
					["MB","Mining Building"],
					["COMMUNITY","Community"],
					["PB","Pharmacy Building"],
					["TUITION FEES","Tuition Fees"],
					["TTC SOUTH","TTC South"],
					["BA","Bahen Center"],
					["CHANCE","Chance"],
					["ES","Earth Sciences"],
					["SS","Sidney Smith"],
					["AS","Academic Suspension"],
					["IN","Innis"],
					["RL","Robarts Library"],
					["KS","Koeffler Student Center"],
					["LB","Lassonde Building"],
					["TTC WEST","TTC West"],
					["RW","Ramsay Wright Labs"],
					["COMMUNITY","Community"],
					["HH","Hart House"],
					["MP","M-Physics Labs"],
					["AB","Anthropology Building"],
					["AC","Architecture Building"],
					["CHANCE","Chance"],
					["VC","Victoria College"],
					["BC","Bancroft Building"],
					["TTC NORTH","TTC North"],
					["SC","Student Commons"],
					["CA","Sid's Cafe"],
					["CL","Claude T. Bissell Building"],
					["CR","Carr Hall"],
					["PO","Political Offense"],
					["CF","Cardinal Flahiff Building"],
					["WH","Whitney Hall"],
					["COMMUNITY","Community"],
					["CO","Convocation Hall"],
					["TTC EAST","TTC East"],
					["CHANCE","Chance"],
					["EX","Exam Center"],
					["INCOME TAX","Income Tax"],
					["AH","Alumni Hall"]
];

//==========================================================================
// 'Class' definitions
//==========================================================================

// Placeholder for piece class
function pieceClass(id, name, description)
{
	this.name = name,
	this.description = description,
	this.id = id
};

// This is the player class, starts with default money, unjailed and generally null information. Users are players, but not all players are users (AI)
function playerClass()
{
	this.user = null,
	this.piece = null,
	this.color = null,
	this.money = 1500,
	this.jailed = false,
	this.position = 0
};

// This is board class, it contains the tiles, a tracker of player turn, and in which order players play. The game state is also saved here
function boardClass()
{
	this.tiles = [],
	this.players = [],
	this.playerTurns = [],
	this.playerTurn = 0,
	this.gameState = 0,
	this.dice = [ 1, 1 ]
}

// This is where all information pertinent to a tile is stored
function tileClass()
{
	// basic information about the tiles
	this.name = "",
	this.fullname = ""
	this.desc = "",
	this.image = null,
	
	// Do we deal a random community or chance card
	this.tileflags = TILE_FLAG_NORMAL;
	
	// Is this a purchasable property
	this.purchaseable = false, // Can you even buy this
	this.price = 0, // price is used to calculate rent and construction prices as well as tax tile payup and utility/ttc paying computations
	this.owner = null,
	this.buildings = 0
}

//==========================================================================
// Initializing and testing
//==========================================================================

window.addEventListener('load', readyBoard);

// This function populates the board with a tile
function initialzeBoard(board)
{
	// Generate tiles to place in the board
	for (let i = 0; i < maxTiles; i++)
	{
		// Set name, full name, description and image using the const array
		const newTile = new tileClass();
		newTile.name = tileNames[i][0];
		newTile.fullname = tileNames[i][1];
		//newTile.desc = 
		newTile.image = newTile.name + ".png";
		
		// Check if those are corner tiles and apply the necessary properties
		if (cornerTiles.includes(i))
		{
			switch(i)
			{
				case 10:
					newTile.tileflags = TILE_FLAG_JAIL;
					break;			
				case 20:
					newTile.tileflags = TILE_FLAG_FREEPARKING;
					break;			
				case 30:
					newTile.tileflags = TILE_FLAG_GOTOJAIL;
					break;			
				default:
					newTile.tileflags = TILE_FLAG_GO;
					break;
			}
		}
		

		// Check if you can buy said tiles
		if (!unbuyableTiles.includes(i))
		{
			newTile.purchaseable = true;
			// Check if this a utility tile
			if (utilityTiles.includes(i))
			{
				newTile.tileflags = TILE_FLAG_UTILITY;
				newTile.price = 250;
			}
			else if (ttcTiles.includes(i))
			{
				newTile.tileflags = TILE_FLAG_TTC;
				newTile.price = 200;
			}
			else
			{
				newTile.price = 100 + (i - 1) * 20;
			}
		}
		else
		{
			if (taxTiles.includes(i))
			{
				newTile.tileflags = TILE_FLAG_TAX;
				if (i == taxTiles[1])
					newTile.price = 100;
				else
					newTile.price = 200;
			}
		}
		
		// Check if this is a community tile
		if (communityTiles.includes(i))
			newTile.tileflags = TILE_FLAG_COMMUNITY;

		// Check if this a chance tile
		if (chanceTiles.includes(i))
			newTile.tileflags = TILE_FLAG_CHANCE;
		
		
		board.tiles.push(newTile);
		
		// Set the names
		const boardHTML = document.getElementById('board');
		const boardHTMLTile = boardHTML.children[i + 1];
		if (cornerTiles.includes(i))
		{
			//boardHTMLTile.innerHTML = newTile.name;
		}
		else if (communityTiles.includes(i) || chanceTiles.includes(i))
		{
			boardHTMLTile.children[0].innerHTML = newTile.name;
		}
		else if (utilityTiles.includes(i) || ttcTiles.includes(i) || taxTiles.includes(i))
		{
			boardHTMLTile.children[0].innerHTML = newTile.name;
			boardHTMLTile.children[1].innerHTML = '$' + newTile.price;
		}
		else
		{
			boardHTMLTile.children[1].innerHTML = newTile.name;
			boardHTMLTile.children[2].innerHTML = '$' + newTile.price;
		}
		
		// Set the prices
	}
}

// Get the players ready
function initializePlayers(board, numPlayers)
{
	if (numPlayers < 2)
		alert("Insufficent player number.");
	
	if (numPlayers > 4)
		alert("Too many players.");
	
	if (!login)
		alert("No user logged in");
	
	// Add actual player
	const newPlayer = new playerClass()
	newPlayer.user = login;
	board.players.push(newPlayer);
	board.playerTurns.push(0);
	
	// Add AI players
	for (let i = 1; i < numPlayers; i++)
	{
		const newAI = new playerClass();
		board.players.push(newAI)
		board.playerTurns.push(i);
	}
	
	// Get the player pieces in position
	for (let i = 0; i < numPlayers; i++)
	{	
		offsetPiece(i, 0);
	}
	
	// Shuffle playing order
	board.playerTurns.sort(() => Math.random() - 0.5);
	console.log(board.playerTurns);
	
	if (board.players[board.playerTurns[0]].user == null)
	{
		board.gameState = GAMESTATE_AI_TURN;
		setTimeout(aiRollTheDice, 2000);
	}
	else
	{
		board.gameState = GAMESTATE_PLAYER_TURN;
		highlightDice();
	}
	
	console.log('Player ' + board.playerTurns[board.playerTurn] + "'s turn ");
}

// Get the player list prepared. Add a resign button for human player and highlight whoever's turn it is, if human is logged as admin, he can kick other players out
function initializePlayerList(board)
{
	const playerList = document.getElementById("playerList");
	
	// Add the players in descending order of the playerturn list	
	for (let i = 0; i < board.players.length; i++)
	{
		const actualPlayerId = board.playerTurns[i];
		const playerSlot = document.createElement("div");
		playerSlot.setAttribute("id","playerSlot");
		
		if (board.playerTurn == i)
			playerSlot.setAttribute("style","color:red");
		else
			playerSlot.setAttribute("style","color:" + playerColors[actualPlayerId]);
		
		if (board.players[actualPlayerId].user)
		{
			const playerSlotText = document.createTextNode(board.players[actualPlayerId].user.username);
			playerSlot.appendChild(playerSlotText);
		}
		else
		{
			const playerSlotText = document.createTextNode("AI " + actualPlayerId);
			playerSlot.appendChild(playerSlotText);			
		}
		
		if (actualPlayerId == 0)
		{
			const playerResignButton = document.createElement("button");
			playerResignButton.setAttribute("id","resignButton");
			playerResignButton.setAttribute("onclick","playerResign(event)");
			const playerResignButtonText = document.createTextNode("RESIGN");
			playerResignButton.appendChild(playerResignButtonText);
			playerSlot.appendChild(playerResignButton);
		}
		else
		{
			if (login.isAdmin)
			{
				const playerKickButton = document.createElement("button");
				playerKickButton.setAttribute("id","kickButton");
				playerKickButton.setAttribute("onclick","playerKick(event, " + actualPlayerId + ")");
				const playerKickButtonText = document.createTextNode("KICK");	
				playerKickButton.appendChild(playerKickButtonText);
				playerSlot.appendChild(playerKickButton);
			}
		}
		
		playerList.appendChild(playerSlot);
	}
}

// Create an instance of the gameboard, this is essentially where most of the game takes place and where most of the vital information is also kept
const gameBoard = new boardClass();

// Ready the board for testing
function readyBoard()
{
	initialzeBoard(gameBoard);
	initializePlayers(gameBoard, 4);
	initializePlayerList(gameBoard);
}

// Tile information displayed on propertyInfo
function getTileInfo(tile)
{
	switch(tile.tileflags)
	{
		case TILE_FLAG_GO: return "Collect your $200"; break;
		case TILE_FLAG_COMMUNITY: return "Community card!"; break;
		case TILE_FLAG_CHANCE: return "Chance card!"; break;
		case TILE_FLAG_JAIL: return "If you're just visting, stay put. Otherwise, wait three turns, use a Get out of Jail free card or score a double to be freed."; break;
		case TILE_FLAG_FREEPARKING: return "Free parking! Stay put get a bonus $2000 if you landed here with a double."; break;
		case TILE_FLAG_GOTOJAIL: return "You've said or done something politically offensive, get academically suspended."; break;
		case TILE_FLAG_TAX: return "Pay your taxes! $" + tile.price; break;
		case TILE_FLAG_UTILITY: return "Pay the number you rolled times 10% the price of this place. Doubled if the owner has both utilities."; break;
		case TILE_FLAG_TTC: return "Free transportation to the next or previous TTC if owned. Otherwise, pay $25 times the number of TTCs controlled by the owner."; break;
		default: return "Price: $" + tile.price + "\n Rent: 10% + 10% * number of houses or 60% if hotel is built. \n Each house costs 15 of the tile price and a hotel costs 50% to build."; break;
	}
	return "";
}

// Event handler, this purges the property information display and replaces it with up-to-date information from the last clicked tile
function parseInfo(e)
{
	// prevent default form action
	e.preventDefault();
	
	// Setup
	const tile = e.target;
	const boardTile = document.getElementById("board");
	let tileInfo = null;
	let index = 1;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++)
	{
		if (boardTile.children[i] == tile)
		{
			tileInfo = gameBoard.tiles[i - 1];
			index = i - 1;
			break;
		}
	}

	if (tileInfo)
	{
		// Get element and purge its inner contents
		const infoTile = document.getElementById("propertyInfo");
		infoTile.innerHTML = "";
		
		// Set the header
		const infoTileHeader = document.createElement("div")
		if (tile.children[0])
		{
			infoTileHeader.className = "propertyInfoHeader"
			infoTileHeader.style.backgroundColor = window.getComputedStyle(tile.children[0], null).getPropertyValue("background-color");
		}
		else
		{
			infoTileHeader.className = "propertyInfoHeaderNoColor"
		}
		const infoTileHeaderText = document.createTextNode(gameBoard.tiles[index].fullname)
		infoTileHeader.appendChild(infoTileHeaderText)
		infoTile.appendChild(infoTileHeader)
		
		// Set the image
		if (gameBoard.tiles[index].image)
		{
			const infoTileImage = document.createElement("img")
			infoTileImage.className = "propertyInfoImage"
			if (gameBoard.tiles[index].image == "RL.png")
				infoTileImage.setAttribute("src", "./img/" + gameBoard.tiles[index].image)
			else
				infoTileImage.setAttribute("src", "./img/placeholder.png")
			infoTile.appendChild(infoTileImage)
		}
		
		// Set the information
		const infoTileText = document.createElement("div")
		infoTileText.style = "white-space: pre;" // To avoid white space culling and allowing the newline to work
		infoTileText.className = "propertyInfoText"
		const infoTileTextContent = document.createTextNode(getTileInfo(tileInfo));
		infoTileText.appendChild(infoTileTextContent)
		infoTile.appendChild(infoTileText);
		
	}
}

// Event handler for human player
function playerRollTheDice(e)
{
	// Prevent Default
	e.preventDefault();
	
	// If it's not the player's turn do not roll the dice
	if (gameBoard.gameState != GAMESTATE_PLAYER_TURN)
		return;
	
	// Immediately roll the dice for the player
	gameBoard.gameState = GAMESTATE_PLAYER_ROLL;
	startDiceRoll();
	lowlightDice();
	setTimeout(rollTheDice, 2000);
	
}

// AI function for rolling the dice
function aiRollTheDice()
{
	// If it's not the player's turn do not roll the dice
	if (gameBoard.gameState != GAMESTATE_AI_TURN)
		return;
	
	// Roll the dice
	gameBoard.gameState = GAMESTATE_AI_ROLL;
	startDiceRoll();
	setTimeout(rollTheDice, 2000);
}

// Rolling the dice
function rollTheDice()
{
	const currentPlayer = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
		
	// Dice rolling away
	gameBoard.dice[0] = 1 + Math.floor(Math.random() * Math.floor(6));
	gameBoard.dice[1] =  1 + Math.floor(Math.random() * Math.floor(6));
	stopDiceRoll(gameBoard.dice[0], gameBoard.dice[1]);
	
	console.log('Player ' + gameBoard.playerTurns[gameBoard.playerTurn] + ' has rolled ' + gameBoard.dice[0] + ' ' + gameBoard.dice[1]);
	
	// Delay player movement
	setTimeout(playerMove, 1000);
}

// Moving the player
function playerMove()
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	
	if (player.position + gameBoard.dice[0] + gameBoard.dice[1] > maxTiles - 1)
		player.position = player.position + gameBoard.dice[0] + gameBoard.dice[1] - 40;
	else
		player.position = player.position + gameBoard.dice[0] + gameBoard.dice[1];
	
	console.log('Player ' + gameBoard.playerTurns[gameBoard.playerTurn] + ' is now at position ' + player.position);
	
	// Move physical piece for that player
	offsetPiece(gameBoard.playerTurns[gameBoard.playerTurn], player.position);
	
	// Hand the turn to the next player
	setTimeout(nextTurn, 2000);
}

// Giving the dice to the next player
function nextTurn()
{
	// Player keeps his turn if he lands double, so check before incrementing.
	if (gameBoard.dice[0] != gameBoard.dice[1])
	{
		// Start off by turning the original player name back to black
		playerListColor(gameBoard.playerTurn, playerColors[gameBoard.playerTurns[gameBoard.playerTurn]]);
		
		if (gameBoard.playerTurn + 1 >= gameBoard.players.length)
			gameBoard.playerTurn = 0;
		else
			gameBoard.playerTurn += 1;
		
		// Turn the next player's name to red
		playerListColor(gameBoard.playerTurn, "red");
	}
	
	// Check whose turn it is
	if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].user == null)
	{
		gameBoard.gameState = GAMESTATE_AI_TURN;
		setTimeout(aiRollTheDice, 2000);
	}
	else
	{
		gameBoard.gameState = GAMESTATE_PLAYER_TURN
		highlightDice();
	}
	console.log('Player ' + gameBoard.playerTurns[gameBoard.playerTurn] + "'s turn ");
	
}

// Change color of player in player list. Used to indicate whose turn it is
function playerListColor(playerIndex, color)
{
	const playerList = document.getElementById("playerList");
	playerList.children[playerIndex + 1].setAttribute("style","color:" + color);
}

// Kick an AI player
function playerKick(e, id)
{
	// Prevent default
	e.preventDefault();
	
	if (gameBoard.gameState != GAMESTATE_PLAYER_TURN)
		return;
	
	console.log("Kick " + id + ".");
}

// Client resign
function playerResign(e)
{
	// Prevent default
	e.preventDefault();
	
	//if (gameBoard.gameState != GAMESTATE_PLAYER_TURN)
	//	return;
		
	window.location.replace('./newgame.html');
}

//==========================================================================
// Dice rolling animations functions
//==========================================================================

// Start rolling the dice
function startDiceRoll()
{
	// Immediately start and set dice rolling flag to true
	diceRolling = true;
	loopDiceRoll();
}

// Loop through and keep setting it away
function loopDiceRoll()
{
	// Only do this if the dice is rolling
	if (diceRolling)
	{
		const diceSection = document.getElementById("diceDisplay");
		const dice1 = diceSection.children[0];
		const dice2 = diceSection.children[1];
		
		dice1.setAttribute("src", "img/dice" + (1 + Math.floor(Math.random() * Math.floor(6))) + ".png" );
		dice2.setAttribute("src", "img/dice" + (1 + Math.floor(Math.random() * Math.floor(6))) + ".png" );
		
		// Do this every 10th of a second
		setTimeout(loopDiceRoll, 100);
	}
}

// Stop it, freeze with the die set to what the current player rolled
function stopDiceRoll(dice1val, dice2val)
{
	diceRolling = false;
	const diceSection = document.getElementById("diceDisplay");
	const dice1 = diceSection.children[0];
	const dice2 = diceSection.children[1];
	
	dice1.setAttribute("src", "img/dice" + dice1val + ".png" );
	dice2.setAttribute("src", "img/dice" + dice2val + ".png" );
}

//==========================================================================
// Border glowing shift for the Dice when it's the player's turn
//==========================================================================

// When it's the player's turn
function highlightDice()
{
	const diceSection = document.getElementById("diceDisplay");
	diceSection.style.border = "2px solid red";
}

// When it's no longer the player's turn
function lowlightDice()
{
	const diceSection = document.getElementById("diceDisplay");
	diceSection.style.border = "2px solid black";
}


//==========================================================================
// Additional Helper functions
//==========================================================================

// From https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
// Returns the offset of input element
function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

// Get offset for each of the player pieces
function offsetPiece(playerNum, tile)
{
	const physicalBoard = document.getElementById("board");
	const tilePlate = physicalBoard.children[tile + 1];
	const tilePlateOffset = offset(tilePlate);
	
	let leftOffset = 0;
	let topOffset = 0;
	
	switch(playerNum)
	{
		case 1: leftOffset = 40; topOffset = 0; break;
		case 2: leftOffset = 0; topOffset = 40; break;
		case 3: leftOffset = 40; topOffset = 40; break;
		default: leftOffset = 0; topOffset = 0; break;
	}
		
	const playerPiece = document.getElementById("player" + playerNum);
	playerPiece.style.left = (tilePlateOffset.left + (tilePlate.style.width / 2) + leftOffset ) + "px";
	playerPiece.style.top = (tilePlateOffset.top + (tilePlate.style.height / 2) + topOffset ) + "px";
}
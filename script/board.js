/* board js */

'use strict';

let login = null;

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
					["CH","Convocation Hall"],
					["TTC EAST","TTC East"],
					["CHANCE","Chance"],
					["EX","Exam Center"],
					["INCOME TAX","Income Tax"],
					["AH","Alumni Hall"]
];

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
			boardHTMLTile.innerHTML = newTile.name;
		}
		else if (communityTiles.includes(i) || chanceTiles.includes(i))
		{
			boardHTMLTile.children[0].innerHTML = newTile.name;
		}
		else if (utilityTiles.includes(i) || ttcTiles.includes(i) || taxTiles.includes(i))
		{
			boardHTMLTile.children[0].innerHTML = newTile.name;
			boardHTMLTile.children[1].innerHTML = 'PRICE $' + newTile.price;
		}
		else
		{
			boardHTMLTile.children[1].innerHTML = newTile.name;
			boardHTMLTile.children[2].innerHTML = 'PRICE $' + newTile.price;
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
		const playerSlotText = document.createTextNode("Player " + actualPlayerId);
		playerSlot.appendChild(playerSlotText);
		
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
				playerKickButton.setAttribute("onclick","playerKick(event)");
				const playerKickButtonText = document.createTextNode("KICK");	
				playerKickButton.appendChild(playerKickButtonText);
				playerSlot.appendChild(playerKickButton);
			}
		}
		
		playerList.appendChild(playerSlot);
	}
}

// Test to initialize users
const testUser = new userClass("admin", "admin", 1);
testUser.isAdmin = true;
const testUser2 = new userClass("user", "user", 2);
login = testUser;

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
	rollTheDice();
	
}

// AI function for rolling the dice
function aiRollTheDice()
{
	// If it's not the player's turn do not roll the dice
	if (gameBoard.gameState != GAMESTATE_AI_TURN)
		return;
	
	// Roll the dice
	rollTheDice();
}

// Rolling the dice
function rollTheDice()
{
	const currentPlayer = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	
	if (currentPlayer.user == null)
		gameBoard.gameState = GAMESTATE_AI_ROLL;
	else
		gameBoard.gameState = GAMESTATE_PLAYER_ROLL;
	
	// Dice rolling away
	gameBoard.dice[0] = 1 + Math.floor(Math.random() * Math.floor(6));
	gameBoard.dice[1] =  1 + Math.floor(Math.random() * Math.floor(6));
	
	console.log('Player ' + gameBoard.playerTurns[gameBoard.playerTurn] + ' has rolled ' + gameBoard.dice[0] + ' ' + gameBoard.dice[1]);
	
	// Delay player movement
	setTimeout(playerMove, 2000);
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
	
	// Hand the turn to the next player
	setTimeout(nextTurn, 2000);
}

// Giving the dice to the next player
function nextTurn()
{
	// Player keeps his turn if he lands double, so check before incrementing.
	if (gameBoard.dice[0] != gameBoard.dice[1])
	{
		if (gameBoard.playerTurn + 1 >= gameBoard.players.length)
			gameBoard.playerTurn = 0;
		else
			gameBoard.playerTurn += 1;
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
	}
	console.log('Player ' + gameBoard.playerTurns[gameBoard.playerTurn] + "'s turn ");
	
}

function playerKick(e)
{
	// Prevent default
	e.preventDefault();
	
	console.log("Kick me.");
}

function playerResign(e)
{
	// Prevent default
	e.preventDefault();
	
	console.log("Loser.");
}

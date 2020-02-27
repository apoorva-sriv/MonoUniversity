/* board js */

'use strict';

let login = null;

// Some constants needed to construct the board
const maxTiles = 40;
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

// Building codes, building names and descriptions are stored here for convenience
const tileNames = [ ["GO", "GO",],
					["MB","Mining Building"],
					["CM","Community"],
					["PB","Pharmacy Building"],
					["TF","Tuition Fees"],
					["TTCS","TTC South"],
					["BA","Bahen Center"],
					["CH","Chance"],
					["ES","Earth Sciences"],
					["SS","Sidney Smith"],
					["AS","Academic Suspension"],
					["IN","Innis"],
					["RL","Robarts Library"],
					["KS","Koeffler Student Center"],
					["LB","Lassonde Building"],
					["TTCW","TTC West"],
					["RW","Ramsay Wright Labs"],
					["CM","Community"],
					["HH","Hart House"],
					["MP","M-Physics Labs"],
					["AB","Anthropology Building"],
					["AC","Architecture Building"],
					["CH","Chance"],
					["VC","Victoria College"],
					["BC","Bancroft Building"],
					["TTCN","TTC North"],
					["SC","Student Commons"],
					["CA","Sid's Cafe"],
					["CL","Claude T. Bissell Building"],
					["CR","Carr Hall"],
					["PO","Political Offense"],
					["CF","Cardinal Flahiff Building"],
					["WH","Whitney Hall"],
					["CM","Community"],
					["CO","Convocation Hall"],
					["TTCE","TTC East"],
					["CH","Chance"],
					["EX","Exam Center"],
					["IT","Income Tax"],
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
	this.jailed = false
};

// This is board class, it contains the tiles, a tracker of player turn, and in which order players play. The game state is also saved here
function boardClass()
{
	this.tiles = [],
	this.players = [],
	this.playerTurns = [],
	this.playerTurn = 0,
	this.gameState = 0
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
	
	const newPlayer = new playerClass()
	newPlayer.user = login;
	board.players.push(newPlayer)
	
	for (let i = 1; i < numPlayers; i++)
	{
		const newAI = new playerClass();
		board.players.push(newAI)
	}
}

// Test to initialize users
const testUser = new userClass("admin", "admin", 1);
testUser.isAdmin = true;
login = testUser;
const testUser2 = new userClass("user", "user", 2);


// Create an instance of the gameboard, this is essentially where most of the game takes place and where most of the vital information is also kept
const gameBoard = new boardClass();
initialzeBoard(gameBoard);

// Placeholder feature: Clicking on a tile will generate its information on the property information section. Note that not all tiles are properties, but we can still retrieve information from them.
const tile = document.getElementById('tile');
if (tile)
{
	tile.addEventListener('click', parseInfo)
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
	const boardTile = document.getElementsByClassName("board")[0];
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
		const infoTile = document.getElementsByClassName("propertyInfo")[0];
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
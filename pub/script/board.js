/* board js */

"use strict";

//==========================================================================
// Global Variables needed
//==========================================================================

// General purpose user class
function userClass(username, password, id) {
	(this.username = username),
		(this.password = password),
		(this.id = id),
		(this.fullname = null),
		(this.email = null),
		(this.ownedPieces = []),
		(this.isAdmin = false);
}

let login = new userClass(localStorage.getItem("username"), localStorage.getItem("username"), "0");
login.isAdmin = /true/i.test(localStorage.getItem("admin"));

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

// Tile Flags
const TILE_FLAG_NORMAL = 0;
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
const GAMESTATE_PLAYER_INFO = 8;
const GAMESTATE_PLAYER_DECISION = 16;
const GAMESTATE_AI_TURN = 32;
const GAMESTATE_AI_ROLL = 64;
const GAMESTATE_AI_MOVE = 128;
const GAMESTATE_AI_INFO = 256;
const GAMESTATE_AI_DECISION = 512;

// AI Profiles
const AI_PROFILE_TEST = 0; // Only rolls the dice, does nothing else
const AI_PROFILE_RANDOM = 1; // All actions are random whether be it getting out of jail, buying or building.
const AI_PROFILE_AGGRESSIVE = 2; // If an action is possible, always execute it, getting out of jail, buying or building.

// Game Type
const GAME_TYPE_PVE = 0; // Grants no wins, nor currency
const GAME_TYPE_PVEP = 1; // Grants wins but no currency
const GAME_TYPE_PVP = 2; // Grants both currency and wins

// Piece Types
const PIECE_TYPE_DEFAULT = 0; // Default piece, no special abilities
const PIECE_TYPE_COP = 1; // Only get two turns in jail for being sent by a tile, four if by chance or community cards
const PIECE_TYPE_LAWYER = 2; // Earn three times the get out of jail cards, all expenses increased by 10%
const PIECE_TYPE_VETERAN = 3; // Reduction on money spent on normal tiles by 10%, but collect $150 only from GO ($300) for when landing on it.
const PIECE_TYPE_WORKER = 4; // Get $250 by passing go, $500 by landing on it, this includes by cards, tax tiles add $25 and $50 respectively.
const PIECE_TYPE_GENIUS = 5; // Unaffected by Utility and TTC tiles, pays 25% more on tax tiles.
const PIECE_TYPE_BANKER = 6; // Immunity to Tax Tiles, but rents are 5% more expensive.
const PIECE_TYPE_INVESTOR = 7; // You can buy properties early but they cost 50% more early game.

const pieceGraphics = [ "default", "cop", "lawyer", "veteran", "worker", "genuis", "banker", "investor" ];

// Jail Turns
const JAIL_TURN_NONE = 0;
const JAIL_TURN_DEFAULT = 3;
const JAIL_TURN_COP_TILE = 2;
const JAIL_TURN_COP_CARD = 4;

// Player Colors
const playerColors = ["magenta", "blue", "green", "orange"];

// Building codes, building names and descriptions are stored here for convenience
const tileNames = [
	["GO", "GO"],
	["MB", "Mining Building"],
	["COMMUNITY", "Community"],
	["PB", "Pharmacy Building"],
	["TUITION FEES", "Tuition Fees"],
	["TTC SOUTH", "TTC South"],
	["BA", "Bahen Center"],
	["CHANCE", "Chance"],
	["ES", "Earth Sciences"],
	["SS", "Sidney Smith"],
	["AS", "Academic Suspension"],
	["IN", "Innis"],
	["RL", "Robarts Library"],
	["KS", "Koeffler Student Center"],
	["LB", "Lassonde Building"],
	["TTC WEST", "TTC West"],
	["RW", "Ramsay Wright Labs"],
	["COMMUNITY", "Community"],
	["HH", "Hart House"],
	["MP", "M-Physics Labs"],
	["AB", "Anthropology Building"],
	["AC", "Architecture Building"],
	["CHANCE", "Chance"],
	["VC", "Victoria College"],
	["BC", "Bancroft Building"],
	["TTC NORTH", "TTC North"],
	["SC", "Student Commons"],
	["CA", "Sid's Cafe"],
	["CL", "Claude T. Bissell Building"],
	["CR", "Carr Hall"],
	["PO", "Political Offense"],
	["CF", "Cardinal Flahiff Building"],
	["WH", "Whitney Hall"],
	["COMMUNITY", "Community"],
	["CO", "Convocation Hall"],
	["TTC EAST", "TTC East"],
	["CHANCE", "Chance"],
	["EX", "Exam Center"],
	["INCOME TAX", "Income Tax"],
	["AH", "Alumni Hall"],
];

// Used for determining whether or not you own all tiles of the same color
const tileColorGroups = [
	[1, 3],
	[6, 8, 9],
	[11, 13, 14],
	[16, 18, 19],
	[21, 23, 24],
	[26, 27, 29],
	[31, 32, 34],
	[37, 39],
];

const chanceTileImages = { 7: "bottomChance.png", 22: "topChance.png", 36: "rightChance.png" };

// Chance and community cards have specifics effects, each having their own function and description, these functions are defined here
// shuffling these happens at the last card, the counter and shuffle order is stored in the boardClass

const chanceDetails = [
	[ "Advance to Innis. If you pass GO, collect $200.", function(playerNum) { chInnisMove(playerNum) } ],
	[ "Advance token to the nearest TTC and pay the owner the rental to which they are entitled. If TTC is unowned, you may buy it from the Bank.", function(playerNum) { chTTCDouble(playerNum); } ],
	[ "Take a ride on TTC South. If you pass GO, collect $200.", function(playerNum) { chTTCSouth(playerNum); } ],
	[ "Advance to GO. (Collect $400.)", function(playerNum) { chDirectGO(playerNum); } ],
	[ "Your building and loan matures. Collect $150.", function(playerNum) { chLoanMature(playerNum); } ],
	[ "You have been elected President of the UTSU. Pay each player $50.", function(playerNum) { chPayEach(playerNum); } ],
	[ "Go directly to jail. Do not pass GO; do not collect $200.", function(playerNum) { chJail(playerNum); } ],
	[ "Pay poor tax of $15.", function(playerNum) { chPoorTax(playerNum); } ],
	[ "Talk a walk in Alumni Hall. Advance token to Alumni Hall.", function(playerNum) { chAlumniMove(playerNum); } ],
	[ "Make general repairs on all your property. For each building, pay $25.", function(playerNum) { chRepairs(playerNum); } ],
	[ "Advance token to nearest library (RL or CL). If UNOWNED, you may buy it from the Bank.", function (playerNum) { chMoveUtility(playerNum); } ],
	[ "Bank pays you dividend of $50", function(playerNum) { chBankDividend(playerNum); } ],
	[ "Advance to Bancroft Building (BC)", function(playerNum) { chBancroftMove(playerNum); } ],
	[ "Go back 3 tiles.", function(playerNum) { chThreeStepsBack(playerNum); } ],
	[ "Add a get out of jail free card, may be used at any time.", function(playerNum) { chGOOJFC(playerNum); } ],
	[ "Advance token to the nearest TTC and pay the owner the rental to which they are entitled. If TTC is unowned, you may buy it from the Bank.", function(playerNum) { chTTCDouble(playerNum); } ],
];

function chInnisMove(playerNum)
{
	playerMoveTo(playerNum, 11);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);
}

function chTTCDouble(playerNum)
{
	const player = gameBoard.players[playerNum];
	let station_position = 0;
	
	if (player.position == chanceTiles[0])
		station_position = 15;
		
	if (player.position == chanceTiles[1])
		station_position = 25;
		
	if (player.position == chanceTiles[2])
		station_position = 5;
	
	// Movement is directly manipulated in this particular case
	playerMoveTo(playerNum, station_position);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);
		
}

function chTTCSouth(playerNum)
{
	playerMoveTo(playerNum, 5);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);	
}

function chDirectGO(playerNum)
{
	playerMoveTo(playerNum, 0);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);	
}

function chLoanMature(playerNum)
{
	flowFunds(playerNum, 150, true);
}

function chPayEach(playerNum)
{
	let negativeLoot = 0;
	for (let i = 0; i < gameBoard.playerTurns.length; i++)
	{
		if (gameBoard.playerTurns[i] != playerNum)
		{
			flowFunds(gameBoard.playerTurns[i], 50, true);
			negativeLoot += 50;
		}
	}
	flowFunds(playerNum, negativeLoot, false);
}

function chJail(playerNum)
{
	playerSendToJail(playerNum, true);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);		
}

function chPoorTax(playerNum)
{
	flowFunds(playerNum, 15, false);
	gameBoard.tiles[20].price += 15;
	updateOtherInformation();
}

function chAlumniMove(playerNum)
{
	playerMoveTo(playerNum, 39);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);
}

function chRepairs(playerNum)
{
	let repairCost = 0;
	for (let i = 0; i < gameBoard.tiles.length; i++)
	{
		if (gameBoard.tiles[i].tileflags != TILE_FLAG_NORMAL)
			continue;
		
		if (gameBoard.tiles[i].owner != playerNum)
			continue;
		
		if (gameBoard.tiles[i].building != true)
			continue;
		
		repairCost += 25;
	}
	flowFunds(playerNum, repairCost, false);
	gameBoard.tiles[20].price += repairCost;
	updateOtherInformation();
}

function chMoveUtility(playerNum)
{
	const player = gameBoard.players[playerNum];
	let utility_position = 0;
	
	if (player.position == chanceTiles[0] || player.position == chanceTiles[2])
		utility_position = utilityTiles[0];
	else
		utility_position = utilityTiles[1];
	
	// Movement is directly manipulated in this particular case
	playerMoveTo(playerNum, utility_position);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);
}

function chBankDividend(playerNum)
{
	flowFunds(playerNum, 50, true);
}

function chBancroftMove(playerNum)
{
	playerMoveTo(playerNum, 24);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);	
}

function chThreeStepsBack(playerNum)
{
	playerMoveBy(playerNum, -3);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);	
}

function chGOOJFC(playerNum)
{
	gameBoard.players[playerNum].jailcards++;
	
	if (gameBoard.players[playerNum].piece == PIECE_TYPE_LAWYER)
			gameBoard.players[playerNum].jailcards += 2;
	
	updateOtherInformation();
}

const communityChestDetails = [
	[ "Doctor's fee. Pay $50.", function(playerNum) { cmDoctor(playerNum); } ],
	[ "UTSU Fund matures. Collect $100.", function(playerNum) { cmFundMature(playerNum); } ],
	[ "Add a get out of jail free card, may be used at any time.", function(playerNum) { cmGOOJFC(playerNum); } ],
	[ "Skule Nite Opening: Collect $50 from every player for opening night seats.", function(playerNum) { cmSkuleNite(playerNum); } ],
	[ "You inherit $200.", function(playerNum) { cmInherit(playerNum); } ],
	[ "Receive $25 for services.", function(playerNum) { cmServices(playerNum); } ],
	[ "Income tax refund: collect $20.", function(playerNum) { cmTaxRefund(playerNum); } ],
	[ "From sale of stock, you get $45.", function(playerNum) { cmStockSale(playerNum); } ],
	[ "Pay non-opt out ancillary fees of $150.", function(playerNum) { cmNonOpt(playerNum); } ],
	[ "You are assessed for campus repairs: $40 per building.", function(playerNum) { cmRepairs(playerNum); } ],
	[ "Bank error in your favor: collect $250", function(playerNum) { cmBankError(playerNum); } ],
	[ "Advance to GO. (Collect $400.)", function(playerNum) { cmDirectGO(playerNum); } ],
	[ "Life insurance matures: collect $150", function(playerNum) { cmLifeIn(playerNum); } ],
	[ "Pay hospital $100", function(playerNum) { cmHospital(playerNum); } ],
	[ "You have won second prize in Orientation Week. Collect $10.", function(playerNum) { cmSecond(playerNum); } ],
	[ "Go directly to jail. Do not pass GO. Do not collect $200.", function(playerNum) { cmJail(playerNum); } ],
];

function cmDoctor(playerNum)
{
	flowFunds(playerNum, 50, false);
	gameBoard.tiles[20].price += 50;
	updateOtherInformation();
}

function cmFundMature(playerNum)
{
	flowFunds(playerNum, 100, true);
}

function cmGOOJFC(playerNum)
{
	gameBoard.players[playerNum].jailcards++;
	
	if (gameBoard.players[playerNum].piece == PIECE_TYPE_LAWYER)
		gameBoard.players[playerNum].jailcards += 2;
	
	updateOtherInformation();
}

function cmSkuleNite(playerNum)
{
	let loot = 0;
	for (let i = 0; i < gameBoard.playerTurns.length; i++)
	{
		if (gameBoard.playerTurns[i] != playerNum)
		{
			flowFunds(gameBoard.playerTurns[i], 50, false);
			loot += 50;
		}
	}
	flowFunds(playerNum, loot, true);	
}

function cmInherit(playerNum)
{
	flowFunds(playerNum, 200, true);
}

function cmServices(playerNum)
{
	flowFunds(playerNum, 25, true);
}

function cmTaxRefund(playerNum)
{
	flowFunds(playerNum, 20, true);
}

function cmStockSale(playerNum)
{
	flowFunds(playerNum, 45, true);
}

function cmNonOpt(playerNum)
{
	flowFunds(playerNum, 150, false);
	gameBoard.tiles[20].price += 150;
	updateOtherInformation();
}

function cmRepairs(playerNum)
{
	let repairCost = 0;
	for (let i = 0; i < gameBoard.tiles.length; i++)
	{
		if (gameBoard.tiles[i].tileflags != TILE_FLAG_NORMAL)
			continue;
		
		if (gameBoard.tiles[i].building != true)
			continue;
		
		repairCost += 40;
	}
	flowFunds(playerNum, repairCost, false);
	gameBoard.tiles[20].price += repairCost;
	updateOtherInformation();
}

function cmBankError(playerNum)
{
	flowFunds(playerNum, 250, true);
}

function cmDirectGO(playerNum)
{
	playerMoveTo(playerNum, 0);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);
}

function cmLifeIn(playerNum)
{
	flowFunds(playerNum, 150, true);
}

function cmHospital(playerNum)
{
	flowFunds(playerNum, 100, false);
	gameBoard.tiles[20].price += 100;	
	updateOtherInformation();
}

function cmSecond(playerNum)
{
	flowFunds(playerNum, 10, true);
}

function cmJail(playerNum)
{
	playerSendToJail(playerNum, true);
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);	
}

//==========================================================================
// 'Class' definitions
//==========================================================================

// This is the player class, starts with default money, unjailed and generally null information. Users are players, but not all players are users (AI)
function playerClass()
{
	(this.user = null),
		(this.piece = PIECE_TYPE_DEFAULT),
		(this.color = null),
		(this.money = 1500),
		(this.jailed = false),
		(this.jailturns = 0),
		(this.jailcards = 0),
		(this.pastfirst = false),
		(this.passedgo = false),
		(this.gorestrict = false),
		(this.oldposition = 0),
		(this.position = 0),
		(this.aiprofile = 0);
}

// This is board class, it contains the tiles, a tracker of player turn, and in which order players play. The game state is also saved here
function boardClass()
{
		(this.tiles = []),
		(this.players = []),
		(this.playerTurns = []),
		(this.playerTurn = 0),
		(this.gameState = 0),
		(this.dice = [1, 1]),
		(this.infoedTile = null),
		(this.timeOutId = null),
		(this.chanceCards = null),
		(this.communityCards = null),
		(this.chanceCount = -1),
		(this.communityCount = -1),
		(this.gametype = null);
}

// This is where all information pertinent to a tile is stored
function tileClass()
{
	// basic information about the tiles
	(this.name = ""), (this.fullname = "");
	(this.desc = ""),
		(this.image = null),
		// Do we deal a random community or chance card
		(this.tileflags = TILE_FLAG_NORMAL);

	// Is this a purchasable property
	(this.purchaseable = false), // Can you even buy this
		(this.price = 0), // price is used to calculate rent and construction prices as well as tax tile payup and utility/ttc paying computations
		(this.owner = null),
		(this.building = false);
}

//==========================================================================
// Initializing and testing
//==========================================================================

window.addEventListener("load", readyBoard);

// This function populates the board with a tile
function initializeBoard(board) 
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
			switch (i) 
			{
				case 10:
					newTile.tileflags = TILE_FLAG_JAIL;
					newTile.image = "as.png";
					break;
				case 20:
					newTile.tileflags = TILE_FLAG_FREEPARKING;
					newTile.image = "fp.png";
					break;
				case 30:
					newTile.tileflags = TILE_FLAG_GOTOJAIL;
					newTile.image = "go2jail.png";
					break;
				default:
					newTile.tileflags = TILE_FLAG_GO;
					newTile.image = "go4it.png";
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
				newTile.image = "ttc.svg";
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
				{
					newTile.price = 200;
					newTile.image = "specimen.png";
				} 
				else 
				{
					newTile.price = 100;
					newTile.image = "ACORN.png";
				}
			}
		}

		// Check if this is a community tile
		if (communityTiles.includes(i))
		{
			newTile.tileflags = TILE_FLAG_COMMUNITY;
			newTile.image = '/communityChest.gif';
		}

		// Check if this a chance tile
		if (chanceTiles.includes(i))
		{
			newTile.tileflags = TILE_FLAG_CHANCE;
			newTile.image = chanceTileImages[i];
		}

		board.tiles.push(newTile);

		// Set the names
		const boardHTML = document.getElementById("board");
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
			boardHTMLTile.children[1].innerHTML = "$" + newTile.price;
		}
		else {
			boardHTMLTile.children[1].innerHTML = newTile.name;
			boardHTMLTile.children[2].innerHTML = "$" + newTile.price;
		}
	}
	
	// Get the cards ready and shuffle them
	board.chanceCards = chanceDetails;
	board.communityCards = communityChestDetails;
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
	const newPlayer = new playerClass();
	newPlayer.user = login;
	newPlayer.color = playerColors[0];
	board.players.push(newPlayer);
	board.playerTurns.push(0);

	// Add AI players
	for (let i = 1; i < numPlayers; i++)
	{
		const newAI = new playerClass();
		newAI.color = playerColors[i];
		newAI.aiprofile = i - 1;
		newAI.piece = i;
		board.players.push(newAI);
		board.playerTurns.push(i);
	}

	// Shuffle playing order
	board.playerTurns.sort(() => Math.random() - 0.5);

	let physicalBoard = document.querySelector( '#board' );
	// Create the pieces
	for (let i = 0; i < board.playerTurns.length; i++)
	{
		const playerPiece = document.createElement("div");
		playerPiece.setAttribute("id", "player" + board.playerTurns[i]);
		playerPiece.setAttribute("class", "player");
		
		console.log(board.players[board.playerTurns[i]].color);
		let imgPathString = "url('./img/pieces/" + pieceGraphics[board.players[board.playerTurns[i]].piece] + "-" + board.players[board.playerTurns[i]].color + ".png')";
		playerPiece.style.backgroundImage = imgPathString;
		
		physicalBoard.appendChild(playerPiece);
	}

	// Get the player pieces in position
	for (let i = 0; i < numPlayers; i++)
	{
		offsetPiece(i, 0);
	}

	if (board.players[board.playerTurns[0]].user == null)
	{
		board.gameState = GAMESTATE_AI_TURN;
		updatePlayerList();
		board.timeOutId = setTimeout(aiRollTheDice, 2000);
	} 
	else
	{
		board.gameState = GAMESTATE_PLAYER_TURN;
		highlightDice();
		updatePlayerList();
	}

	console.log("Player " + board.playerTurns[board.playerTurn] + "'s turn ");
}

// Get the player list prepared. Add a resign button for human player and highlight whoever's turn it is, if human is logged as admin, he can kick other players out
function initializePlayerList()
{
	updatePlayerList();
}

// Create an instance of the gameboard, this is essentially where most of the game takes place and where most of the vital information is also kept
const gameBoard = new boardClass();

// Ready the board for testing
function readyBoard()
{
	initializeBoard(gameBoard);
	initializePlayers(gameBoard, 4);
	initializePlayerList();
	updateOtherInformation();
}

// Tile information displayed on propertyInfo
function getTileInfo(tile, cardNum)
{
	switch (tile.tileflags)
	{
		case TILE_FLAG_GO:
			return "Collect $200 if you pass and an extra $200 if you land on it.";
			break;
		case TILE_FLAG_COMMUNITY:
			if (cardNum <= -1)
				return "Community Chest Card!";
			else
				return gameBoard.communityCards[cardNum][0];
			break;
		case TILE_FLAG_CHANCE:
			if (cardNum <= -1)
				return "Chance Card!";
			else
				return gameBoard.chanceCards[cardNum][0];
			break;
		case TILE_FLAG_JAIL:
			return "If you're just visiting, stay put. Otherwise, wait three turns, use a Get out of Jail free card or score a double to be freed.";
			break;
		case TILE_FLAG_FREEPARKING:
			return "Free parking! Stay put or get your tax returns if you landed here with a double.";
			break;
		case TILE_FLAG_GOTOJAIL:
			return "You've said or done something politically offensive. Get academically suspended.";
			break;
		case TILE_FLAG_TAX:
			return "Pay your taxes! $" + tile.price;
			break;
		case TILE_FLAG_UTILITY:
			return "Pay 50% of the tile price of every utility the owner has.";
			break;
		case TILE_FLAG_TTC:
			return "Pay $50 for every TTC the owner has.";
			break;
		default:
			return (
				"Price: $" +
				tile.price +
				"<br /> Pay 25% of the buying price,<br />double its color group if owned by a single person,<br />double again if a building is on it."
			);
			break;
	}
	return "";
}

// This is a dummy event handler, as when children's handlers are called, so are their parent's
function dummyClick(e) {
	e.preventDefault();

	// Setup
	const tile = e.target;
	let tileIterate = tile;

	while (tileIterate.getAttribute("onclick") != "parseInfo(event)") {
		tileIterate = tileIterate.parentElement;
	}

	const boardTile = document.getElementById("board");
	let tileInfo = null;
	let index = 1;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++) {
		if (boardTile.children[i] == tileIterate) {
			tileInfo = gameBoard.tiles[i - 1];
			index = i - 1;
			break;
		}
	}

	if (tileInfo) {
		// Get element and purge its inner contents
		const infoTile = document.getElementById("propertyInfo");
		clearTileInfo();

		// Let the board know which tile we're displaying for refreshing purposes
		gameBoard.infoedTile = index;

		// Set the header
		const infoTileHeader = document.createElement("div");
		if (tileIterate.children[0]) {
			infoTileHeader.className = "propertyInfoHeader";
			infoTileHeader.style.backgroundColor = window
				.getComputedStyle(tileIterate.children[0], null)
				.getPropertyValue("background-color");
		} else {
			infoTileHeader.className = "propertyInfoHeaderNoColor";
		}
		const infoTileHeaderText = document.createTextNode(gameBoard.tiles[index].fullname);
		infoTileHeader.appendChild(infoTileHeaderText);
		infoTile.appendChild(infoTileHeader);

		// Set the image
		if (gameBoard.tiles[index].image) {
			const infoTileImage = document.createElement("img");
			infoTileImage.className = "propertyInfoImage";
			if (gameBoard.tiles[index].image)
				infoTileImage.setAttribute("src", "./img/" + gameBoard.tiles[index].image);
			else infoTileImage.setAttribute("src", "./img/placeholder.png");
			infoTile.appendChild(infoTileImage);
		}

		// Set the information
		const infoTileText = document.createElement("div");
		//infoTileText.style = "white-space: pre;" // To avoid white space culling and allowing the newline to work
		infoTileText.className = "propertyInfoText";
		infoTileText.innerHTML = getTileInfo(tileInfo, -1);
		infoTile.appendChild(infoTileText);
		infoTile.style.backgroundColor = window
			.getComputedStyle(boardTile.children[index + 1], null)
			.getPropertyValue("background-color");
	}
}

// Event handler, this purges the property information display and replaces it with up-to-date information from the last clicked tile
function parseInfo(e) {
	// prevent default form action
	e.preventDefault();

	// Setup
	const tile = e.target;
	const boardTile = document.getElementById("board");
	let tileInfo = null;
	let index = 1;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++) {
		if (boardTile.children[i] == tile) {
			tileInfo = gameBoard.tiles[i - 1];
			index = i - 1;
			break;
		}
	}

	if (tileInfo) {
		// Get element and purge its inner contents
		const infoTile = document.getElementById("propertyInfo");
		clearTileInfo();

		// Let the board know which tile we're displaying for refreshing purposes
		gameBoard.infoedTile = index;

		// Set the header
		const infoTileHeader = document.createElement("div");
		if (tile.children[0]) {
			infoTileHeader.className = "propertyInfoHeader";
			infoTileHeader.style.backgroundColor = window
				.getComputedStyle(tile.children[0], null)
				.getPropertyValue("background-color");
		} else {
			infoTileHeader.className = "propertyInfoHeaderNoColor";
		}
		const infoTileHeaderText = document.createTextNode(gameBoard.tiles[index].fullname);
		infoTileHeader.appendChild(infoTileHeaderText);
		infoTile.appendChild(infoTileHeader);

		// Set the image
		if (gameBoard.tiles[index].image) {
			const infoTileImage = document.createElement("img");
			infoTileImage.className = "propertyInfoImage";
			if (gameBoard.tiles[index].image)
				infoTileImage.setAttribute("src", "./img/" + gameBoard.tiles[index].image);
			else infoTileImage.setAttribute("src", "./img/placeholder.png");
			infoTile.appendChild(infoTileImage);
		}

		// Set the information
		const infoTileText = document.createElement("div");
		//infoTileText.style = "white-space: pre;" // To avoid white space culling and allowing the newline to work
		infoTileText.className = "propertyInfoText";
		infoTileText.innerHTML = getTileInfo(tileInfo, -1);
		infoTile.appendChild(infoTileText);
		infoTile.style.backgroundColor = window
			.getComputedStyle(boardTile.children[index + 1], null)
			.getPropertyValue("background-color");

		if (tileInfo.building == true) {
			infoTile.style.backgroundImage = "url('./img/built.png')";
			infoTile.style.backgroundPosition = "bottom center";
			infoTile.style.backgroundSize = "25%";
			infoTile.style.backgroundRepeat = "no-repeat";
		}
	}
}

// Get the information of the tile the last player landed on
function landedTileInfo(playerNum)
{
	// Do not refresh in this case, we are disowning this thing
	if (playerNum < 0)
		return;
	
	const position = gameBoard.players[playerNum].position;
	const player = gameBoard.players[playerNum];
	const boardTile = document.getElementById("board");
	let tileInfo = null;
	let index = 1;
	let tile = null;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++)
	{
		if (i - 1 == position)
		{
			tile = boardTile.children[i];
			tileInfo = gameBoard.tiles[i - 1];
			index = i - 1;
			break;
		}
	}

	if (tileInfo && tile) {
		// Get element and purge its inner contents
		const infoTile = document.getElementById("propertyInfoAlt");
		clearLandedTileInfo();

		// Set the header
		const infoTileHeader = document.createElement("div");
		if (tile.children[0]) {
			infoTileHeader.className = "propertyInfoHeaderAlt";
			infoTileHeader.style.backgroundColor = window
				.getComputedStyle(tile.children[0], null)
				.getPropertyValue("background-color");
		} else {
			infoTileHeader.className = "propertyInfoHeaderNoColorAlt";
		}
		const infoTileHeaderText = document.createTextNode(gameBoard.tiles[index].fullname);
		infoTileHeader.appendChild(infoTileHeaderText);
		infoTile.appendChild(infoTileHeader);

		// Set the image
		if (gameBoard.tiles[index].image) {
			const infoTileImage = document.createElement("img");
			infoTileImage.className = "propertyInfoImageAlt";
			if (gameBoard.tiles[index].image)
				infoTileImage.setAttribute("src", "./img/" + gameBoard.tiles[index].image);
			else infoTileImage.setAttribute("src", "./img/placeholder.png");
			infoTile.appendChild(infoTileImage);
		}

		// Set the information
		const infoTileText = document.createElement("div");
		//infoTileText.style = "white-space: pre;" // To avoid white space culling and allowing the newline to work
		infoTileText.className = "propertyInfoTextAlt";
		
		if (tileInfo.tileflags == TILE_FLAG_COMMUNITY)
			infoTileText.innerHTML = getTileInfo(tileInfo, gameBoard.communityCount);
		else if (tileInfo.tileflags == TILE_FLAG_CHANCE)
			infoTileText.innerHTML = getTileInfo(tileInfo, gameBoard.chanceCount);
		else
			infoTileText.innerHTML = getTileInfo(tileInfo, -1);
		
		infoTile.appendChild(infoTileText);

		// Add the buttons depending on conditions, you can only build or buy in this version of the game to make it fast
		if (gameBoard.tiles[index].purchaseable == true) {
			const infoTileButtonBox = document.createElement("div");
			infoTileButtonBox.setAttribute("id", "propertyInfoButtonBoxAlt");

			// Buy Button
			const infoTileBuyButton = document.createElement("button");

			if (checkCanBuy(playerNum, index) && gameBoard.gameState < GAMESTATE_AI_TURN) {
				infoTileBuyButton.setAttribute("id", "propertyInfoButtonBuy");
				infoTileBuyButton.setAttribute("onclick", "buyTile(event)");
			} else {
				infoTileBuyButton.setAttribute("id", "propertyInfoButtonBuyDisabled");
				infoTileBuyButton.setAttribute("disabled", "");
			}

			const infoTileBuyButtonText = document.createTextNode("BUY");
			infoTileBuyButton.appendChild(infoTileBuyButtonText);
			infoTileButtonBox.appendChild(infoTileBuyButton);

			const infoTileBuildButton = document.createElement("button");

			if (checkCanBuild(playerNum, index) && gameBoard.gameState < GAMESTATE_AI_TURN) {
				infoTileBuildButton.setAttribute("id", "propertyInfoButtonBuild");
				infoTileBuildButton.setAttribute("onclick", "buildTile(event)");
			} else {
				infoTileBuildButton.setAttribute("id", "propertyInfoButtonBuildDisabled");
				infoTileBuildButton.setAttribute("disabled", "");
			}

			const infoTileBuildButtonText = document.createTextNode("BUILD");
			infoTileBuildButton.appendChild(infoTileBuildButtonText);
			infoTileButtonBox.appendChild(infoTileBuildButton);
			infoTile.appendChild(infoTileButtonBox);

			infoTile.style.backgroundColor = window.getComputedStyle(tile, null).getPropertyValue("background-color");

			if (tileInfo.building == true) {
				infoTile.style.backgroundImage = "url('./img/built.png')";
				infoTile.style.backgroundPosition = "bottom center";
				infoTile.style.backgroundSize = "25%";
				infoTile.style.backgroundRepeat = "no-repeat";
			}
		}
	}
}

// Refresh tile info in case the purchase button is pressed, you never know
function refreshTileInfo(tileNum) {
	if (gameBoard.infoedTile == null) {
		clearTileInfo();
		return;
	}

	if (tileNum != gameBoard.infoedTile) return;

	// Setup
	const boardTile = document.getElementById("board");
	let tileInfo = null;
	let tile = null;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++) {
		if (i - 1 == tileNum) {
			tileInfo = gameBoard.tiles[tileNum];
			tile = boardTile.children[i];
			break;
		}
	}

	if (tileInfo && tile) {
		// Get element and purge its inner contents
		const infoTile = document.getElementById("propertyInfo");
		clearTileInfo();

		// Let the board know which tile we're displaying for refreshing purposes
		gameBoard.infoedTile = tileNum;

		// Set the header
		const infoTileHeader = document.createElement("div");
		if (tile.children[0]) {
			infoTileHeader.className = "propertyInfoHeader";
			infoTileHeader.style.backgroundColor = window
				.getComputedStyle(tile.children[0], null)
				.getPropertyValue("background-color");
		} else {
			infoTileHeader.className = "propertyInfoHeaderNoColor";
		}
		const infoTileHeaderText = document.createTextNode(gameBoard.tiles[tileNum].fullname);
		infoTileHeader.appendChild(infoTileHeaderText);
		infoTile.appendChild(infoTileHeader);

		// Set the image
		if (gameBoard.tiles[tileNum].image) {
			const infoTileImage = document.createElement("img");
			infoTileImage.className = "propertyInfoImage";
			if (gameBoard.tiles[tileNum].image)
				infoTileImage.setAttribute("src", "./img/" + gameBoard.tiles[tileNum].image);
			else infoTileImage.setAttribute("src", "./img/placeholder.png");
			infoTile.appendChild(infoTileImage);
		}

		// Set the information
		const infoTileText = document.createElement("div");
		//infoTileText.style = "white-space: pre;" // To avoid white space culling and allowing the newline to work
		infoTileText.className = "propertyInfoText";
		infoTileText.innerHTML = getTileInfo(tileInfo);
		infoTile.appendChild(infoTileText);
		infoTile.style.backgroundColor = window
			.getComputedStyle(boardTile.children[tileNum + 1], null)
			.getPropertyValue("background-color");

		if (tileInfo.building == true) {
			infoTile.style.backgroundImage = "url('./img/built.png')";
			infoTile.style.backgroundPosition = "bottom center";
			infoTile.style.backgroundSize = "25%";
			infoTile.style.backgroundRepeat = "no-repeat";
		}
	}
}

// Clear onclick tile-info
function clearTileInfo()
{
	// Get element and purge its inner contents
	const infoTile = document.getElementById("propertyInfo");
	infoTile.innerHTML = "";
	infoTile.style.backgroundColor = "";
	infoTile.style.backgroundImage = "";
	gameBoard.infoedTile = null;
}

// Clear landed tile info
function clearLandedTileInfo() {
	// Get element and purge its inner contents
	const infoTile = document.getElementById("propertyInfoAlt");
	infoTile.innerHTML = "";
	infoTile.style.backgroundColor = "";
	infoTile.style.backgroundImage = "";
}

// Event handler for human player
function playerRollTheDice(e)
{
	// Prevent Default
	e.preventDefault();

	// If it's not the player's turn do not roll the dice
	if (gameBoard.gameState != GAMESTATE_PLAYER_TURN) return;

	// Immediately roll the dice for the player
	gameBoard.gameState = GAMESTATE_PLAYER_ROLL;
	updatePlayerList();
	startDiceRoll();
	lowlightDice();
	gameBoard.timeOutId = setTimeout(rollTheDice, 2000);
}

// AI function for rolling the dice
function aiRollTheDice()
{
	// If it's not the player's turn do not roll the dice
	if (gameBoard.gameState != GAMESTATE_AI_TURN) return;

	// Roll the dice
	gameBoard.gameState = GAMESTATE_AI_ROLL;
	updatePlayerList();
	startDiceRoll();
	gameBoard.timeOutId = setTimeout(rollTheDice, 2000);
}

// Rolling the dice
function rollTheDice()
{
	const currentPlayer = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];

	// Dice rolling away
	gameBoard.dice[0] = 1 + Math.floor(Math.random() * Math.floor(6));
	gameBoard.dice[1] = 1 + Math.floor(Math.random() * Math.floor(6));
	stopDiceRoll(gameBoard.dice[0], gameBoard.dice[1]);

	console.log(
		"Player " +
		gameBoard.playerTurns[gameBoard.playerTurn] +
		" has rolled " +
		gameBoard.dice[0] +
		" " +
		gameBoard.dice[1]
	);

	// Delay player movement
	gameBoard.timeOutId = setTimeout(playerMove, 1000);
}

// Moving phase
function playerMove()
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	const playerNum = gameBoard.playerTurns[gameBoard.playerTurn];

	if (player.jailed == true)
	{
		if (gameBoard.dice[0] == gameBoard.dice[1]) playerReleaseFromJail(gameBoard.playerTurns[gameBoard.playerTurn]);

		gameBoard.timeOutId = setTimeout(nextTurn, 2000);
		return;
	}

	playerMoveBy(playerNum, gameBoard.dice[0] + gameBoard.dice[1]);

	// Apply effects
	gameBoard.timeOutId = setTimeout(playerEffects, 2000);
}

// Apply tile and movement effects to the player
function playerEffects()
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];

	if (player.user != null)
	{
		gameBoard.gameState = GAMESTATE_PLAYER_INFO;
	} 
	else
	{
		gameBoard.gameState = GAMESTATE_AI_INFO;
	}

	if (player.jailed == true)
		gameBoard.timeOutId = setTimeout(nextTurn, 2000);
	else
		gameBoard.timeOutId = setTimeout(playerDecisionTime, 2000);
	
	// This has to come after thanks to the chance and community cards
	tileLand(gameBoard.playerTurns[gameBoard.playerTurn],gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].position);
	landedTileInfo(gameBoard.playerTurns[gameBoard.playerTurn]);
}

// Give the player some time to make decisions about his purchases
function playerDecisionTime()
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	const playerNum = gameBoard.playerTurns[gameBoard.playerTurn];

	if (player.user)
	{
		gameBoard.gameState = GAMESTATE_PLAYER_DECISION;
	} 
	else
	{
		gameBoard.gameState = GAMESTATE_AI_DECISION;
		
		if (player.aiprofile != AI_PROFILE_TEST)
		{
			// Check if you're on a buyable tile or not
			if (checkCanBuy(playerNum, player.position))
			{
				if (player.aiprofile == AI_PROFILE_AGGRESSIVE || (player.aiprofile == AI_PROFILE_RANDOM && Math.floor(Math.random() * 2) == 1))
					purchaseTile(playerNum, player.position);
			}
			
			// Check if you can build here
			if (checkCanBuild(playerNum, player.position))
			{
				if (player.aiprofile == AI_PROFILE_AGGRESSIVE || (player.aiprofile == AI_PROFILE_RANDOM && Math.floor(Math.random() * 2) == 1))
					constructTile(playerNum, player.position);			
			}
		}
	}

	gameBoard.timeOutId = setTimeout(nextTurn, 2000); // Should be 10000 for ten seconds
}

// Giving the dice to the next player
function nextTurn()
{
	// Clear the information once turn is done
	clearLandedTileInfo();

	let checkPlayer = gameBoard.playerTurns[gameBoard.playerTurn];

	// Player keeps his turn if he lands double, so check before incrementing.
	if (gameBoard.dice[0] != gameBoard.dice[1])
	{
		if (gameBoard.playerTurn + 1 >= gameBoard.playerTurns.length)
			gameBoard.playerTurn = 0;
		else 
			gameBoard.playerTurn += 1;
	}
	
	// Kick check
	if (checkFunds(checkPlayer))
	{
		// Just stop at this point
		if (gameBoard.playerTurns.length <= 1)
			return;
	}

	// Check whose turn it is
	if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].user == null) {
		gameBoard.gameState = GAMESTATE_AI_TURN;
		
		const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
		const playerNum = gameBoard.playerTurns[gameBoard.playerTurn];
		
		if (player.aiprofile != AI_PROFILE_TEST)
		{
			if (canUseGTFO(playerNum))
			{
				if (player.aiprofile == AI_PROFILE_AGGRESSIVE || (player.aiprofile == AI_PROFILE_RANDOM && Math.floor(Math.random() * 2) == 1))
					GTFO(playerNum);
			}
		}
		
		updatePlayerList();
		gameBoard.timeOutId = setTimeout(aiRollTheDice, 2000);
	} 
	else
	{
		gameBoard.gameState = GAMESTATE_PLAYER_TURN;
		updatePlayerList();
		highlightDice();
	}
	console.log("Player " + gameBoard.playerTurns[gameBoard.playerTurn] + "'s turn ");

	// Jailing mechanic
	if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailed)
	{
		if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailturns > 0)
		{
			--gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailturns;
			updateOtherInformation();
		}

		if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailturns <= 0)
			playerReleaseFromJail(gameBoard.playerTurns[gameBoard.playerTurn]);
	}
}

// What happens if the player runs out of funds
function checkFunds(playerNum)
{
	if (gameBoard.players[playerNum].money >= 0)
		return true;

	kickPlayer(playerNum);
	return false;
}

// Function to actually kick player out of the damned game
function kickPlayer(playerNum)
{
	// Can't kick someone that's already kicked
	if (!gameBoard.playerTurns.includes(playerNum))
		return;
	
	// Do not kick if we only have one left
	if (gameBoard.playerTurns.length < 2)
		return;
	
	// Get turn
	const playerTurn = gameBoard.playerTurn;
	const actualPlayerId = gameBoard.playerTurns[playerTurn];
	
	// Get index of the player that's getting yeeted
	let index = 0;
	for (let i = 0; i < gameBoard.playerTurns.length; i++)
	{
		if (gameBoard.playerTurns[i] == playerNum)
		{
			index = i;
			break;
		}
	}
	
	let removingOther = true;
	
	if (index == playerTurn)
		removingOther = false;
	
	// Adjust turn and remove from playerTurns
	if (gameBoard.playerTurns.length == 2)
	{
		gameBoard.playerTurn = 0;
	}
	else
	{
		if (index < playerTurn)
			gameBoard.playerTurn -= 1;
	}
		
	// Reset index to a proper value
	if (gameBoard.playerTurn >= (gameBoard.playerTurns.length - 1))
		gameBoard.playerTurn = 0;
	
	
	// Removal part
	gameBoard.playerTurns.splice(index, 1);
	
	// Disown all property owned by this player, board tiles are updated here
	for (let i = 0; i < gameBoard.tiles.length; i++)
	{
		if (gameBoard.tiles[i].owner == playerNum)
		{
			purchaseTile(-1,i);
		}
	}
	
	// Erase piece from existence
	const tileName = "player" + playerNum;
	let piece = document.querySelector( '#' + tileName );
	piece.parentNode.removeChild( piece );
	
	// Update all displays
	updateOtherInformation();
	updatePlayerList();
	
	const removedPlayer = gameBoard.players[actualPlayerId];
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	
	if (removedPlayer.user)
		lowlightDice();
	
	// Check if the player kicked is the current one playing
	if (removingOther == false)
	{
		if (player.user == null)
		{
			clearTimeout(gameBoard.timeOutId);
			gameBoard.gameState = GAMESTATE_AI_TURN;
			gameBoard.timeOutId = setTimeout(aiRollTheDice, 2000);
		}
		else
		{
			clearTimeout(gameBoard.timeOutId);
			gameBoard.gameState = GAMESTATE_PLAYER_TURN;
		}
	}
	
	// Check for win condition
	if (checkWinCondition())
	{
		console.log("Player " + gameBoard.playerTurns[0] + " wins!" );
		clearTimeout(gameBoard.timeOutId);
		gameBoard.timeOutId = null;
		gameBoard.gameState = GAMESTATE_END;
	}
}

// Check win condition
function checkWinCondition()
{
	if (gameBoard.playerTurns.length <= 1)
		return true;
	
	return false;
}

// What happens if you land on a certain tile
function tileLand(playerNum, tileNum)
{
	const playerPtr = gameBoard.players[playerNum];

	// Check to make sure player has passed go
	if (playerPtr.passedgo == true)
	{
		if (playerPtr.gorestrict == true)
		{
			gorestrict = false;
		}
		else
		{
			let loot = 200;
			
			if (playerPtr.piece == PIECE_TYPE_VETERAN)
				loot -= 50;
			
			if (playerPtr.piece == PIECE_TYPE_WORKER)
				loot += 50;
			
			flowFunds(playerNum, 200, true);
			gameBoard.players[playerNum].passedgo = false;
		}
	}

	const tile = gameBoard.tiles[tileNum];
	const tileFlags = gameBoard.tiles[tileNum].tileflags;

	if (tileFlags == TILE_FLAG_NORMAL || tileFlags == TILE_FLAG_UTILITY || tileFlags == TILE_FLAG_TTC)
	{
		if (tile.owner != playerNum && tile.owner != null)
		{
			console.log("Landed at " + gameBoard.tiles[tileNum].fullname + ".");

			if (tileFlags == TILE_FLAG_UTILITY && playerPtr.piece != PIECE_TYPE_GENIUS)
			{
				let loot = numOwnedUtility(tile.owner) * (tile.price / 2);

				flowFunds(playerNum, loot, false);
				flowFunds(tile.owner, loot, true);
			} 
			else if (tileFlags == TILE_FLAG_TTC && playerPtr.piece != PIECE_TYPE_GENIUS)
			{
				let loot = numOwnedTTC(tile.owner) * (tile.price / 4);

				flowFunds(playerNum, loot, false);
				flowFunds(tile.owner, loot, true);
			} 
			else
			{
				let loot = tile.price / 4;

				if (ownsCorrespondingColorTiles(tile.owner, tileNum))
					loot *= 2;

				if (tile.building == true)
					loot *= 2;

				if (playerPtr.piece == PIECE_TYPE_VETERAN)
					loot *= 0.9;
				
				if (playerPtr.piece == PIECE_TYPE_BANKER)
					loot *= 1.1;
				
				flowFunds(playerNum, loot, false);
				flowFunds(tile.owner, loot, true);
			}
		}
	} 
	else if (tileFlags == TILE_FLAG_TAX && playerPtr.piece != PIECE_TYPE_BANKER)
	{
		let loot = gameBoard.tiles[tileNum].price;
		
		if (playerPtr.piece == PIECE_TYPE_WORKER || playerPtr.piece == PIECE_TYPE_GENIUS)
			loot *= 1.25;
		
		flowFunds(playerNum, loot, false);
		gameBoard.tiles[20].price += loot;
		updateOtherInformation();
		console.log("Paying tax of " + loot + ".");
	} 
	else if (tileFlags == TILE_FLAG_COMMUNITY)
	{
		drawCommunityCard(playerNum);
	} 
	else if (tileFlags == TILE_FLAG_CHANCE)
	{
		drawChanceCard(playerNum);
	} 
	else if (tileFlags == TILE_FLAG_GOTOJAIL)
	{
		playerSendToJail(playerNum, false);
		console.log("Go to jail, scumbag!");
	} 
	else if (tileFlags == TILE_FLAG_FREEPARKING)
	{
		if (gameBoard.dice[0] == gameBoard.dice[1])
		{
			flowFunds(playerNum, gameBoard.tiles[tileNum].price, true);
			gameBoard.tiles[tileNum].price = 0;
			console.log("Nice! You get your tax returns!");
		} 
		else
		{
			console.log("Free parking!");
		}
	} 
	else if (tileFlags == TILE_FLAG_GO)
	{
		let loot = 200;
		
		if (playerPtr.piece == PIECE_TYPE_VETERAN)
			loot -= 50;
		
		if (playerPtr.piece == PIECE_TYPE_WORKER)
			loot += 50;
		
		flowFunds(playerNum, loot, true);
		console.log("Get double salary!");
	}
}

// Does the player have a sufficient amount of funds to perform a certain action
function hasSufficentFunds(playerNum, fundsAmount)
{
	if (gameBoard.players[playerNum].piece == PIECE_TYPE_LAWYER)
		fundsAmount += (fundsAmount / 10);
	
	if (gameBoard.players[playerNum].money < fundsAmount)
		return false;

	return true;
}

// Check if the player can purchase a certain property
function checkCanBuy(playerNum, tileNum)
{
	if (gameBoard.players[playerNum].pastfirst == false && gameBoard.players[playerNum].piece != PIECE_TYPE_INVESTOR)
		return false;

	if (gameBoard.tiles[tileNum].purchaseable == false)
		return false;

	if (gameBoard.tiles[tileNum].owner != null)
		return false;

	if (gameBoard.players[playerNum].piece == PIECE_TYPE_INVESTOR)
	{
		if (!hasSufficentFunds(playerNum, gameBoard.tiles[tileNum].price * 1.5))
			return false;
	}
	else
	{
		if (!hasSufficentFunds(playerNum, gameBoard.tiles[tileNum].price))
			return false;		
	}

	return true;
}

// Check if the player can build on a certain property
function checkCanBuild(playerNum, tileNum)
{
	const tile = gameBoard.tiles[tileNum];

	if (gameBoard.players[playerNum].pastfirst == false)
		return false;

	// If this already has a building, don't bother
	if (tile.building == true) 
		return false;

	// All special tiles can't be built on anyways
	if (tile.tileflags != TILE_FLAG_NORMAL) 
		return false;

	// If this doesn't have an owner or the player in question isn't the owner, you can't build here
	if (tile.owner != playerNum) 
		return false;

	// You must own all tiles of the same color code to build
	if (!ownsCorrespondingColorTiles(playerNum, tileNum)) 
		return false;

	if (!hasSufficentFunds(playerNum, tile.price)) 
		return false;

	return true;
}

// Helper to the above function to see the player owns buildings of corresponding colors, use the const table at the top of the page
function ownsCorrespondingColorTiles(playerNum, tileNum)
{
	let result = false;

	for (let i = 0; i < tileColorGroups.length; i++)
	{
		if (tileColorGroups[i].includes(tileNum))
		{
			let answer = true;
			for (let j = 0; j < tileColorGroups[i].length; j++)
			{
				if (gameBoard.tiles[tileColorGroups[i][j]].owner != playerNum)
				{
					answer = false;
					break;
				}
			}

			if (answer == true) result = true;

			break;
		}
	}

	return result;
}

// Return the number of
function numOwnedTTC(playerNum)
{
	let result = 0;

	for (let i = 0; i < ttcTiles.length; i++)	
	{
		if (gameBoard.tiles[ttcTiles[i]].owner == playerNum)
			result++;
	}

	return result;
}

// Return the number of owned utility tiles
function numOwnedUtility(playerNum)
{
	let result = 0;

	for (let i = 0; i < utilityTiles.length; i++)
	{
		if (gameBoard.tiles[utilityTiles[i]].owner == playerNum)
			result++;
	}

	return result;
}

// This changes a player's money, fundsDirection controls whether it's removed or added
function flowFunds(playerNum, fundsAmount, fundsDirection)
{
	if (fundsDirection)
	{
		gameBoard.players[playerNum].money += fundsAmount;
		console.log("Player " + playerNum + " gains $" + fundsAmount + ".");
	}
	else
	{
		// Check if this is a lawyer
		if (gameBoard.players[playerNum].piece == PIECE_TYPE_LAWYER)
			fundsAmount += (fundsAmount / 10);
		
		gameBoard.players[playerNum].money -= fundsAmount;
		console.log("Player " + playerNum + " loses $" + fundsAmount + ".");
	}

	updatePlayerList();
}

function updatePlayerList()
{
	const playerList = document.getElementById("playerList");
	const diceDisplay = document.getElementById("diceDisplay");
	
	// Purge contents fist
	playerList.innerHTML = "";
	
	playerList.appendChild(document.createTextNode("PLAYERS"));
	playerList.appendChild(diceDisplay);

	// Add the players in descending order of the playerturn list
	for (let i = 0; i < gameBoard.playerTurns.length; i++)
	{	
		const actualPlayerId = gameBoard.playerTurns[i];
		const playerSlot = document.createElement("div");
		playerSlot.setAttribute("id", "playerSlot");

		playerSlot.setAttribute("style", "color:" + gameBoard.players[actualPlayerId].color);

		if (gameBoard.players[actualPlayerId].user) 
		{
			const playerSlotText = document.createTextNode(gameBoard.players[actualPlayerId].user.username + " - $" + gameBoard.players[actualPlayerId].money + " ");
			playerSlot.appendChild(playerSlotText);
		} 
		else 
		{
			const playerSlotText = document.createTextNode("AI " + actualPlayerId + " - $" + gameBoard.players[actualPlayerId].money + " ");
			playerSlot.appendChild(playerSlotText);
		}

		if (actualPlayerId == 0)
		{
			const playerResignButton = document.createElement("button");
			playerResignButton.setAttribute("id", "resignButton");
			playerResignButton.setAttribute("onclick", "playerResign(event)");
			if (gameBoard.playerTurns[gameBoard.playerTurn] != actualPlayerId)
				playerResignButton.setAttribute("disabled","");
			const playerResignButtonText = document.createTextNode("RESIGN");
			playerResignButton.appendChild(playerResignButtonText);
			playerSlot.appendChild(playerResignButton);
		} 
		else 
		{
			if (login.isAdmin) 
			{
				const playerKickButton = document.createElement("button");
				playerKickButton.setAttribute("id", "kickButton");
				playerKickButton.setAttribute("onclick", "playerKick(event, " + actualPlayerId + ")");
				if (gameBoard.playerTurns[gameBoard.playerTurn] != 0)
					playerKickButton.setAttribute("disabled","");
				const playerKickButtonText = document.createTextNode("KICK");
				playerKickButton.appendChild(playerKickButtonText);
				playerSlot.appendChild(playerKickButton);
			}
		}

		playerList.appendChild(playerSlot);
	}
	
	const lineJump = document.createElement("br");
	const curPlayerText = document.createTextNode("CURRENTLY PLAYING:");
	const lineJump2 = document.createElement("br");
	let curPlayer = null;
	if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].user)
		curPlayer = document.createTextNode(gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].user.username);
	else
		curPlayer = document.createTextNode("AI " + gameBoard.playerTurns[gameBoard.playerTurn]);
	
	playerList.appendChild(lineJump);
	playerList.appendChild(curPlayerText);
	playerList.appendChild(lineJump2);
	playerList.appendChild(curPlayer);
}

// Players draws a chance card
function drawChanceCard(playerNum)
{
	// Always increment first, this way you know for sure which card was drawn
	gameBoard.chanceCount++;
	
	if (gameBoard.chanceCount >= gameBoard.chanceCards.length)
	{
		gameBoard.chanceCount = 0;
		shuffleChance(gameBoard);
	}
	console.log("Drawing Chance card!");
	
	// Call the function to apply the effect of the card
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(function() { clearTimeout(gameBoard.timeOutId); gameBoard.timeOutId = setTimeout(nextTurn, 2000); gameBoard.chanceCards[gameBoard.chanceCount][1](playerNum); }, 2000);
	
}

// Player draws a community card
function drawCommunityCard(playerNum)
{
	// Always increment first, this way you know for sure which card was drawn
	gameBoard.communityCount++;
	
	if (gameBoard.communityCount >= gameBoard.communityCards.length)
	{
		gameBoard.communityCount = 0;
		shuffleCommunity(gameBoard);
	}
	console.log("Drawing Community Chest card!");
	
	// Call the function to apply the effect of the card
	clearTimeout(gameBoard.timeOutId);
	gameBoard.timeOutId = setTimeout(function() { clearTimeout(gameBoard.timeOutId); gameBoard.timeOutId = setTimeout(nextTurn, 2000); gameBoard.communityCards[gameBoard.communityCount][1](playerNum); }, 2000);
}

// Shuffle the chance cards
function shuffleChance(board)
{
	board.chanceCards.sort(() => Math.random() - 0.5);
}

// Shuffle the community cards
function shuffleCommunity(board)
{
	board.communityCards.sort(() => Math.random() - 0.5);
}

// Player is sent to jail
function playerSendToJail(playerNum, fromCard)
{
	const player = gameBoard.players[playerNum];
	player.jailed = true;
	
	if (player.piece == PIECE_TYPE_COP)
	{
		if (fromCard == true)
		{
			player.jailturns = JAIL_TURN_COP_CARD;
		}
		else
		{
			player.jailturns = JAIL_TURN_COP_TILE;
		}
	}
	else
	{
		player.jailturns = JAIL_TURN_DEFAULT;
	}

	// Movement is directly manipulated in this particular case
	playerMoveTo(playerNum, 10);
	updateOtherInformation();
}

// Function to move the player, this avoids the hussle of having to repeat this over and over again. This is for numbered moves such as that of die
function playerMoveBy(playerNum, numTiles)
{
	const player = gameBoard.players[playerNum];
	
	// Default behavior
	player.oldposition = player.position;
	
	if (player.position + numTiles > maxTiles - 1)
	{
		if (!playerCheckJailed(playerNum))
		{
			player.passedgo = true;
			player.pastfirst = true;
		}

		player.position = player.position + numTiles - maxTiles;
	} 
	else if (player.position + numTiles < 0)
	{
		player.gorestrict = true;
		player.position = player.position + numTiles + maxTiles;
	}
	else
	{
		player.position = player.position + numTiles;
	}

	console.log("Player " + gameBoard.playerTurns[gameBoard.playerTurn] + " is now at position " + player.position);

	// Move physical piece for that player
	offsetPiece(gameBoard.playerTurns[gameBoard.playerTurn], player.position);
	
}

// Function to move the player, this avoid the hussle of having to repeat this over and over again. This is for direct moves such as card or tile moves
function playerMoveTo(playerNum, tileNum)
{
	const player = gameBoard.players[playerNum];
	
	// Default behavior
	player.oldposition = player.position;
	player.position = tileNum;
	if (player.position < player.oldposition)
	{
		if (!playerCheckJailed(playerNum))
		{
			player.passedgo = true;
			player.pastfirst = true;
		}
	}

	console.log("Player " + gameBoard.playerTurns[gameBoard.playerTurn] + " is now at position " + player.position);

	// Move physical piece for that player
	offsetPiece(gameBoard.playerTurns[gameBoard.playerTurn], player.position);
}

// Method to check if the player is jailed or not
function playerCheckJailed(playerNum) {
	if (gameBoard.players[playerNum].jailed) return true;

	return false;
}

// Release the player from jail, done either through
function playerReleaseFromJail(playerNum) {
	const player = gameBoard.players[playerNum];
	player.jailed = false;
	player.jailturns = JAIL_TURN_NONE;
	updateOtherInformation();
}

// Buy the tile
function buyTile(e)
{
	e.preventDefault();

	purchaseTile(
		gameBoard.playerTurns[gameBoard.playerTurn],
		gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].position
	);
}

// Ditto, shared by both player and AI
function purchaseTile(playerNum, tileNum) {
	// Game logic change

	if (playerNum > -1) 
	{
		gameBoard.tiles[tileNum].owner = playerNum;
		
		if (gameBoard.players[playerNum].piece == PIECE_TYPE_INVESTOR && gameBoard.players[playerNum].pastfirst == false)
			flowFunds(playerNum, gameBoard.tiles[tileNum].price * 1.5, false);
		else
			flowFunds(playerNum, gameBoard.tiles[tileNum].price, false);
	} 
	else
	{
		gameBoard.tiles[tileNum].owner = null;
	}

	// Board display change
	const board = document.getElementById("board");
	let tile = null;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++) {
		if (i - 1 == tileNum) {
			tile = board.children[i];
			break;
		}
	}

	if (tile) {
		const divId = tile.getAttribute("id");
		const divElement = document.getElementById(divId);
		if (playerNum < 0) {
			divElement.style.backgroundColor = "#CEE6D0";
		} else {
			if (gameBoard.players[playerNum].color == "magenta")
				divElement.style.backgroundColor = "rgba(255,0,255,0.2)";
			else if (gameBoard.players[playerNum].color == "blue")
				divElement.style.backgroundColor = "rgba(0,0,255,0.2)";
			else if (gameBoard.players[playerNum].color == "green")
				divElement.style.backgroundColor = "rgba(0,128,0,0.2)";
			else if (gameBoard.players[playerNum].color == "orange")
				divElement.style.backgroundColor = "rgba(255,165,0,0.2)";
		}

		// Refresh the landTileInfo
		landedTileInfo(playerNum);
		refreshTileInfo(tileNum);
	}
}

// Build on the tile
function buildTile(e) {
	e.preventDefault();

	constructTile(
		gameBoard.playerTurns[gameBoard.playerTurn],
		gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].position
	);
	//console.log("Built on it");
}

// Ditto shared by both player and AI
function constructTile(playerNum, tileNum) {
	// Game logic change
	gameBoard.tiles[tileNum].building = true;
	flowFunds(playerNum, gameBoard.tiles[tileNum].price, false);

	// Board display change
	const board = document.getElementById("board");
	let tile = null;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++) {
		if (i - 1 == tileNum) {
			tile = board.children[i];
			break;
		}
	}

	if (tile) {
		const divId = tile.getAttribute("id");
		const divElement = document.getElementById(divId);

		divElement.style.backgroundRepeat = "no-repeat";
		divElement.style.backgroundPosition = "center";

		if (divId.includes("bottomRow") || divId.includes("topRow")) {
			divElement.style.backgroundImage = "url('./img/built.png')";
			divElement.style.backgroundSize = "40%";
		} else if (divId.includes("leftCol")) {
			divElement.style.backgroundImage = "url('./img/built-left.png')";
			divElement.style.backgroundSize = "25%";
		} else if (divId.includes("rightCol")) {
			divElement.style.backgroundImage = "url('./img/built-right.png')";
			divElement.style.backgroundSize = "25%";
		}
	}

	// Refresh the landTileInfo
	landedTileInfo(playerNum);
	refreshTileInfo(tileNum);
}

// Update Status Tile
function updateOtherInformation()
{
	// Purge it, then update it
	clearOtherInformation();
	
	const otherInfo = document.getElementById("otherInformation");
	const taxReturnText = document.createTextNode("AB TAX RETURN");
	const taxReturnLine = document.createElement("br");
	const taxReturnAmount = document.createTextNode("$" + gameBoard.tiles[20].price);
	
	otherInfo.appendChild(taxReturnText);
	otherInfo.appendChild(taxReturnLine);
	otherInfo.appendChild(taxReturnAmount);
	
	otherInfo.appendChild(document.createElement("br"));
	otherInfo.appendChild(document.createTextNode("IN PRISON"));
	
	for (let i = 0; i < gameBoard.playerTurns.length; i++)
	{
		// Only include players that are currently in jail
		if (gameBoard.players[gameBoard.playerTurns[i]].jailed == true)
		{
			const actualPlayerId = gameBoard.playerTurns[i];
			const player = gameBoard.players[actualPlayerId];
			const playerSlot = document.createElement("div");
			playerSlot.setAttribute("id", "playerSlot");
			playerSlot.setAttribute("style", "color:" + player.color);
			
			if (player.user)
			{
				const playerSlotText = document.createTextNode(player.user.username + " - " + player.jailturns + " |" + " (" + player.jailcards + " )");
				playerSlot.appendChild(playerSlotText);
			} 
			else 
			{
				const playerSlotText = document.createTextNode("AI " + actualPlayerId + " - " + player.jailturns + " |" + " (" + player.jailcards + " )");
				playerSlot.appendChild(playerSlotText);
			}
			otherInfo.appendChild(playerSlot);
		}
	}
	
	// Button to get out of jail
	const buttonReturnLine = document.createElement("br");
	const gtfoButton = document.createElement("button");
	const gtfoButtonText = document.createTextNode("GET OUT");
	gtfoButton.appendChild(gtfoButtonText);
	
	if (!canUseGTFO(0))
		gtfoButton.setAttribute("disabled", "");
	else
		gtfoButton.setAttribute("onclick", "freedom(event)");
	
	otherInfo.appendChild(buttonReturnLine);
	otherInfo.appendChild(gtfoButton);
}

// Purge the other information section
function clearOtherInformation()
{
	// Get element and purge its inner contents
	const otherInfo = document.getElementById("otherInformation");
	otherInfo.innerHTML = "";
}

// Check can get out of jail
function canUseGTFO(playerNum)
{
	const player = gameBoard.players[playerNum];
	
	if (!gameBoard.playerTurns.includes(playerNum))
		return false;
	
	if (player.jailed == false)
		return false;
	
	if (player.jailcards < 1)
		return false;
	
	return true;
}

// Function used to get specific player out of jail
function GTFO(playerNum)
{
	const player = gameBoard.players[playerNum];
	
	if (player.jailcards > 0)
	{
		--player.jailcards;
		playerReleaseFromJail(playerNum);
	}
}

function freedom(e)
{
	e.preventDefault();
	GTFO(0);
}

// Kick an AI player
function playerKick(e, id)
{
	// Prevent default
	e.preventDefault();

	if (gameBoard.gameState != GAMESTATE_PLAYER_TURN)
		return;
	
	console.log("Kick " + id + ".");
	kickPlayer(id);
}

// Client resign
function playerResign(e) 
{
	e.preventDefault();

	if (gameBoard.gameState != GAMESTATE_PLAYER_TURN)
		return;

	kickPlayer(0);
		
	//console.log(gameBoard.gameState);
	
	//window.location.replace("./newgame.html");
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
	if (diceRolling) {
		const diceSection = document.getElementById("diceDisplay");
		const dice1 = diceSection.children[0];
		const dice2 = diceSection.children[1];

		dice1.setAttribute("src", "img/dice" + (1 + Math.floor(Math.random() * Math.floor(6))) + ".png");
		dice2.setAttribute("src", "img/dice" + (1 + Math.floor(Math.random() * Math.floor(6))) + ".png");

		// Do this every 10th of a second
		gameBoard.timeOutId = setTimeout(loopDiceRoll, 100);
	}
}

// Stop it, freeze with the die set to what the current player rolled
function stopDiceRoll(dice1val, dice2val)
{
	diceRolling = false;
	const diceSection = document.getElementById("diceDisplay");
	const dice1 = diceSection.children[0];
	const dice2 = diceSection.children[1];

	dice1.setAttribute("src", "img/dice" + dice1val + ".png");
	dice2.setAttribute("src", "img/dice" + dice2val + ".png");
}

//==========================================================================
// Border glowing shift for the Dice when it's the player's turn
//==========================================================================

// When it's the player's turn
function highlightDice()
{
	const diceSection = document.getElementById("diceDisplay");
	diceSection.style.border = "2px solid red";
	diceSection.style.cursor = "pointer";
}

// When it's no longer the player's turn
function lowlightDice()
{
	const diceSection = document.getElementById("diceDisplay");
	diceSection.style.border = "2px solid black";
	diceSection.style.cursor = "";
}

//==========================================================================
// Additional Helper functions
//==========================================================================

// From https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
// Returns the offset of input element
function offset(el)
{
	let rect = el.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

// Get offset for each of the player pieces
function offsetPiece(playerNum, tile)
{
	const physicalBoard = document.getElementById("board");
	const tilePlate = physicalBoard.children[tile + 1];
	const tilePlateOffset = offset(tilePlate);
	const boardOffset = offset(physicalBoard);
	tilePlateOffset.top -= boardOffset.top;
	tilePlateOffset.left -= boardOffset.left;

	let leftOffset = 0;
	let topOffset = 0;

	switch (playerNum)
	{
		case 1:
			leftOffset = 40;
			topOffset = 0;
			break;
		case 2:
			leftOffset = 0;
			topOffset = 40;
			break;
		case 3:
			leftOffset = 40;
			topOffset = 40;
			break;
		default:
			leftOffset = 0;
			topOffset = 0;
			break;
	}

	const playerPiece = document.getElementById("player" + playerNum);
	playerPiece.style.left = tilePlateOffset.left + tilePlate.style.width / 2 + leftOffset + "px";
	playerPiece.style.top = tilePlateOffset.top + tilePlate.style.height / 2 + topOffset + "px";
}
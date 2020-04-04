/* board-logic.js */
'use strict'

//==========================================================================
// Elements that would normally be stored in an .h file
//==========================================================================

// Some constants needed to construct the board
module.exports.maxTiles = 40;
module.exports.maxDoubles = 3;
module.exports.unbuyableTiles = [0, 2, 4, 7, 10, 17, 20, 22, 30, 33, 36, 38];
module.exports.chanceTiles = [7, 22, 36];
module.exports.communityTiles = [2, 17, 33];
module.exports.taxTiles = [4, 38];
module.exports.cornerTiles = [0, 10, 20, 30];
module.exports.utilityTiles = [12, 28];
module.exports.ttcTiles = [5, 15, 25, 35];

// Tile Flags
module.exports.TILE_FLAG_NORMAL = 0;
module.exports.TILE_FLAG_GO = 1;
module.exports.TILE_FLAG_COMMUNITY = 2;
module.exports.TILE_FLAG_CHANCE = 4;
module.exports.TILE_FLAG_JAIL = 8;
module.exports.TILE_FLAG_FREEPARKING = 16;
module.exports.TILE_FLAG_GOTOJAIL = 32;
module.exports.TILE_FLAG_TAX = 64;
module.exports.TILE_FLAG_UTILITY = 128;
module.exports.TILE_FLAG_TTC = 256;

// Game State Flags
module.exports.GAMESTATE_END = 0;
module.exports.GAMESTATE_PLAYER_TURN = 1;
module.exports.GAMESTATE_PLAYER_ROLL = 2;
module.exports.GAMESTATE_PLAYER_MOVE = 4;
module.exports.GAMESTATE_PLAYER_INFO = 8;
module.exports.GAMESTATE_PLAYER_DECISION = 16;
module.exports.GAMESTATE_AI_TURN = 32;
module.exports.GAMESTATE_AI_ROLL = 64;
module.exports.GAMESTATE_AI_MOVE = 128;
module.exports.GAMESTATE_AI_INFO = 256;
module.exports.GAMESTATE_AI_DECISION = 512;

// AI Profiles
module.exports.AI_PROFILE_TEST = 0; // Only rolls the dice, does nothing else
module.exports.AI_PROFILE_RANDOM = 1; // All actions are random whether be it getting out of jail, buying or building.
module.exports.AI_PROFILE_AGGRESSIVE = 2; // If an action is possible, always execute it, getting out of jail, buying or building.

// Game Type
module.exports.GAME_TYPE_PVE = 0; // Grants no wins, nor currency
module.exports.GAME_TYPE_PVEP = 1; // Grants wins but no currency
module.exports.GAME_TYPE_PVP = 2; // Grants both currency and wins

// Piece Types
module.exports.PIECE_TYPE_DEFAULT = 0; // Default piece, no special abilities
module.exports.PIECE_TYPE_COP = 1; // Only get two turns in jail for being sent by a tile, four if by chance or community cards
module.exports.PIECE_TYPE_LAWYER = 2; // Earn three times the get out of jail cards, all expenses increased by 10%
module.exports.PIECE_TYPE_VETERAN = 3; // Reduction on money spent on normal tiles by 10%, but collect $150 only from GO  = function($300) for when landing on it.
module.exports.PIECE_TYPE_WORKER = 4; // Get $250 by passing go, $500 by landing on it, this includes by cards, tax tiles add $25 and $50 respectively.
module.exports.PIECE_TYPE_GENIUS = 5; // Unaffected by Utility and TTC tiles, pays 25% more on tax tiles.
module.exports.PIECE_TYPE_BANKER = 6; // Immunity to Tax Tiles, but rents are 5% more expensive.
module.exports.PIECE_TYPE_INVESTOR = 7; // You can buy properties early but they cost 50% more early game.

module.exports.pieceGraphics = [ "default", "cop", "lawyer", "veteran", "worker", "genuis", "banker", "investor" ];

// Jail Turns
module.exports.JAIL_TURN_NONE = 0;
module.exports.JAIL_TURN_DEFAULT = 3;
module.exports.JAIL_TURN_COP_TILE = 2;
module.exports.JAIL_TURN_COP_CARD = 4;

// Player Colors
module.exports.playerColors = ["magenta", "blue", "green", "orange"];

// Building codes, building names and descriptions are stored here for convenience
module.exports.tileNames = [
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
module.exports.tileColorGroups = [
	[1, 3],
	[6, 8, 9],
	[11, 13, 14],
	[16, 18, 19],
	[21, 23, 24],
	[26, 27, 29],
	[31, 32, 34],
	[37, 39],
];

module.exports.chanceTileImages = { 7: "bottomChance.png", 22: "topChance.png", 36: "rightChance.png" };

// Chance and community cards have specifics effects, each having their own function and description, these functions are defined here
// shuffling these happens at the last card, the counter and shuffle order is stored in the boardClass

module.exports.chanceDetails = [
	[ "Advance to Innis. If you pass GO, collect $200.", 0 ],
	[ "Advance token to the nearest TTC and pay the owner the rental to which they are entitled. If TTC is unowned, you may buy it from the Bank.", 1 ],
	[ "Take a ride on TTC South. If you pass GO, collect $200.", 2 ],
	[ "Advance to GO. (Collect $400.)", 3 ],
	[ "Your building and loan matures. Collect $150.", 4 ],
	[ "You have been elected President of the UTSU. Pay each player $50.", 5 ],
	[ "Go directly to jail. Do not pass GO; do not collect $200.", 6 ],
	[ "Pay poor tax of $15.", 7 ],
	[ "Talk a walk in Alumni Hall. Advance token to Alumni Hall.", 8 ],
	[ "Make general repairs on all your property. For each building, pay $25.", 9 ],
	[ "Advance token to nearest library (RL or CL). If UNOWNED, you may buy it from the Bank.", 10 ],
	[ "Bank pays you dividend of $50", 11 ],
	[ "Advance to Bancroft Building (BC)", 12 ],
	[ "Go back 3 tiles.", 13 ],
	[ "Add a get out of jail free card, may be used at any time.", 14 ],
	[ "Advance token to the nearest TTC and pay the owner the rental to which they are entitled. If TTC is unowned, you may buy it from the Bank.", 1 ],
];

module.exports.chanceFunctions = [
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveTo(gameBoard, playerNum, 11);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		const player = gameBoard.players[playerNum];
		let station_position = 0;
		
		if (player.position == module.exports.chanceTiles[0])
			station_position = 15;
			
		if (player.position == module.exports.chanceTiles[1])
			station_position = 25;
			
		if (player.position == module.exports.chanceTiles[2])
			station_position = 5;
		
		// Movement is directly manipulated in this particular case
		module.exports.playerMoveTo(playerNum, station_position);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveTo(playerNum, 5);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveTo(playerNum, 0);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 150, true);
	},
	function (gameBoard, playerNum)
	{
		let negativeLoot = 0;
		for (let i = 0; i < gameBoard.playerTurns.length; i++)
		{
			if (gameBoard.playerTurns[i] != playerNum)
			{
				module.exports.flowFunds(gameBoard, gameBoard.playerTurns[i], 50, true);
				negativeLoot += 50;
			}
		}
		module.exports.flowFunds(gameBoard, playerNum, negativeLoot, false);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerSendToJail(playerNum, true);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);	
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 15, false);
		gameBoard.tiles[20].price += 15;
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveTo(playerNum, 39);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		let repairCost = 0;
		for (let i = 0; i < gameBoard.tiles.length; i++)
		{
			if (gameBoard.tiles[i].tileflags != module.exports.TILE_FLAG_NORMAL)
				continue;
			
			if (gameBoard.tiles[i].owner != playerNum)
				continue;
			
			if (gameBoard.tiles[i].building != true)
				continue;
			
			repairCost += 25;
		}
		module.exports.flowFunds(gameBoard, gameBoard.playerNum, repairCost, false);
		gameBoard.tiles[20].price += repairCost;
	},
	function (gameBoard, playerNum)
	{
		const player = gameBoard.players[playerNum];
		let utility_position = 0;
		
		if (player.position == module.exports.chanceTiles[0] || player.position == module.exports.chanceTiles[2])
			utility_position = module.exports.utilityTiles[0];
		else
			utility_position = module.exports.utilityTiles[1];
		
		// Movement is directly manipulated in this particular case
		module.exports.playerMoveTo(gameBoard, playerNum, utility_position);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 50, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveTo(playerNum, 24);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveBy(playerNum, -3);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		gameBoard.players[playerNum].jailcards++;
		
		if (gameBoard.players[playerNum].piece == module.exports.PIECE_TYPE_LAWYER)
				gameBoard.players[playerNum].jailcards += 2;
	}
];

module.exports.communityChestDetails = [
	[ "Doctor's fee. Pay $50.", 0 ],
	[ "UTSU Fund matures. Collect $100.", 1],
	[ "Add a get out of jail free card, may be used at any time.", 2 ],
	[ "Skule Nite Opening: Collect $50 from every player for opening night seats.", 3 ],
	[ "You inherit $200.", 4 ],
	[ "Receive $25 for services.", 5 ],
	[ "Income tax refund: collect $20.", 6 ],
	[ "From sale of stock, you get $45.", 7 ],
	[ "Pay non-opt out ancillary fees of $150.", 8 ],
	[ "You are assessed for campus repairs: $40 per building.", 9 ],
	[ "Bank error in your favor: collect $250", 10 ],
	[ "Advance to GO. (Collect $400.)", 11 ],
	[ "Life insurance matures: collect $150", 12 ],
	[ "Pay hospital $100", 13 ],
	[ "You have won second prize in Orientation Week. Collect $10.", 14 ],
	[ "Go directly to jail. Do not pass GO. Do not collect $200.", 15 ],
];

module.exports.communityFunctions = [
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 50, false);
		gameBoard.tiles[20].price += 50;
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 100, true);
	},
	function (gameBoard, playerNum)
	{
		gameBoard.players[playerNum].jailcards++;
		
		if (gameBoard.players[playerNum].piece == module.exports.PIECE_TYPE_LAWYER)
			gameBoard.players[playerNum].jailcards += 2;
		
	},
	function (gameBoard, playerNum)
	{
		let loot = 0;
		for (let i = 0; i < gameBoard.playerTurns.length; i++)
		{
			if (gameBoard.playerTurns[i] != playerNum)
			{
				module.exports.flowFunds(gameBoard, gameBoard.playerTurns[i], 50, false);
				loot += 50;
			}
		}
		module.exports.flowFunds(gameBoard, playerNum, loot, true);	
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 200, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 25, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 20, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 45, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 150, false);
		gameBoard.tiles[20].price += 150;
	},
	function (gameBoard, playerNum)
	{
		let repairCost = 0;
		for (let i = 0; i < gameBoard.tiles.length; i++)
		{
			if (gameBoard.tiles[i].tileflags != module.exports.TILE_FLAG_NORMAL)
				continue;
			
			if (gameBoard.tiles[i].building != true)
				continue;
			
			repairCost += 40;
		}
		module.exports.flowFunds(gameBoard, playerNum, repairCost, false);
		gameBoard.tiles[20].price += repairCost;
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 250, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerMoveTo(gameBoard, playerNum, 0);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 150, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 100, false);
		gameBoard.tiles[20].price += 100;	
	},
	function (gameBoard, playerNum)
	{
		module.exports.flowFunds(gameBoard, playerNum, 10, true);
	},
	function (gameBoard, playerNum)
	{
		module.exports.playerSendToJail(gameBoard, playerNum, true);
		clearTimeout(gameBoard.timeOutId);
		function playEffects()
		{
			module.exports.playerEffects(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(playEffects, 2000);
	}
];

//==========================================================================
// 'Class' definitions  -- SCHEMA
//==========================================================================

// This is the player class, starts with default money, unjailed and generally null information. Users are players, but not all players are users (AI)
module.exports.playerClass = function()
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

// This is where all information pertinent to a tile is stored
module.exports.tileClass = function()
{
	// basic information about the tiles
	(this.name = ""), 
	(this.fullname = ""),
	(this.desc = ""),
	(this.image = null),
	
	// Do we deal a random community or chance card
	(this.tileflags = TILE_FLAG_NORMAL),

	// Is this a purchasable property
	(this.purchaseable = false), // Can you even buy this
	(this.price = 0), // price is used to calculate rent and construction prices as well as tax tile payup and utility/ttc paying computations
	(this.owner = null),
	(this.building = false);
}

//==========================================================================
// Function that setup the board
//==========================================================================

// This function populates the board with a tile
module.exports.initializeBoard = function(gameBoard) 
{
	// Generate tiles to place in the board
	for (let i = 0; i < module.exports.maxTiles; i++)
	{
		// Set name, full name, description and image using the const array
		const newTile = new module.exports.tileClass();
		newTile.name = tileNames[i][0];
		newTile.fullname = tileNames[i][1];
		//newTile.desc =
		newTile.image = newTile.name + ".png";

		// Check if those are corner tiles and apply the necessary properties
		if (module.exports.cornerTiles.includes(i))
		{
			switch (i) 
			{
				case 10:
					newTile.tileflags = module.exports.TILE_FLAG_JAIL;
					newTile.image = "as.png";
					break;
				case 20:
					newTile.tileflags = module.exports.TILE_FLAG_FREEPARKING;
					newTile.image = "fp.png";
					break;
				case 30:
					newTile.tileflags = module.exports.TILE_FLAG_GOTOJAIL;
					newTile.image = "go2jail.png";
					break;
				default:
					newTile.tileflags = module.exports.TILE_FLAG_GO;
					newTile.image = "go4it.png";
					break;
			}
		}

		// Check if you can buy said tiles
		if (!module.exports.unbuyableTiles.includes(i))
		{
			newTile.purchaseable = true;
			// Check if this a utility tile
			if (module.exports.utilityTiles.includes(i))
			{
				newTile.tileflags = module.exports.TILE_FLAG_UTILITY;
				newTile.price = 250;
			} 
			else if (module.exports.ttcTiles.includes(i))
			{
				newTile.tileflags = module.exports.TILE_FLAG_TTC;
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
			if (module.exports.taxTiles.includes(i))
			{
				newTile.tileflags = module.exports.TILE_FLAG_TAX;
				if (i == module.exports.taxTiles[1])
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
		if (module.exports.communityTiles.includes(i))
		{
			newTile.tileflags = module.exports.TILE_FLAG_COMMUNITY;
			newTile.image = '/communityChest.gif';
		}

		// Check if this a chance tile
		if (module.exports.chanceTiles.includes(i))
		{
			newTile.tileflags = module.exports.TILE_FLAG_CHANCE;
			newTile.image = module.exports.chanceTileImages[i];
		}

		gameBoard.tiles.push(newTile);

	}
	
	// Get the cards ready and shuffle them
	gameBoard.chanceCards = chanceDetails;
	gameBoard.communityCards = communityChestDetails;
	
	module.exports.shuffleChance(gameBoard);
	module.exports.shuffleCommunity(gameBoard);
}

// Get the players ready
module.exports.initializePlayers = function(gameBoard, playerList)
{
	let i = 0;
	// Add actual players
	for (let i; i < playerList.length; i++)
	{	
		const newPlayer = new module.exports.playerClass();
		newPlayer.user = login;
		newPlayer.color = playerColors[0];
		gameBoard.players.push(newPlayer);
		gameBoard.playerTurns.push(0);
	}

	// Add AI players
	for (i; i < 4; i++)
	{
		const newAI = new playerClass();
		newAI.color = playerColors[i];
		newAI.aiprofile = i - 1;
		newAI.piece = i;
		gameBoard.players.push(newAI);
		gameBoard.playerTurns.push(i);
	}

	// Shuffle playing order
	gameBoard.playerTurns.sort(() => Math.random() - 0.5);
	
	if (gameBoard.players[gameBoard.playerTurns[0]].user == null)
	{
		gameBoard.gameState = module.exports.GAMESTATE_AI_TURN;
		
		function rtd()
		{
			module.exports.rollTheDice(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(gameBoard, 2000);
	} 
	else
	{
		gameBoard.gameState = module.exports.GAMESTATE_PLAYER_TURN;
	}
}

// Ready the board for testing
module.exports.readyBoard = function(gameBoard, playerList)
{
	module.exports.initializeBoard(gameBoard);
	module.exports.initializePlayers(gameBoard, playerList);
}

//==========================================================================
// Movement logic - Display modifications are now separated
//==========================================================================

// Function to move the player, this avoids the hussle of having to repeat this over and over again. This is for numbered moves such as that of die
module.exports.playerMoveBy = function(gameBoard, playerNum, numTiles)
{
	const player = gameBoard.players[playerNum];
	
	// Default behavior
	player.oldposition = player.position;
	
	if (player.position + numTiles > module.exports.maxTiles - 1)
	{
		if (!module.exports.playerCheckJailed(gameBoard, playerNum))
		{
			player.passedgo = true;
			player.pastfirst = true;
		}

		player.position = player.position + numTiles - module.exports.maxTiles;
	} 
	else if (player.position + numTiles < 0)
	{
		player.gorestrict = true;
		player.position = player.position + numTiles + module.exports.maxTiles;
	}
	else
	{
		player.position = player.position + numTiles;
	}	
}

// Function to move the player, this avoid the hussle of having to repeat this over and over again. This is for direct moves such as card or tile moves
module.exports.playerMoveTo = function(gameBoard, playerNum, tileNum)
{
	const player = gameBoard.players[playerNum];
	
	// Default behavior
	player.oldposition = player.position;
	player.position = tileNum;
	if (player.position < player.oldposition)
	{
		if (!module.exports.playerCheckJailed(gameBoard, playerNum))
		{
			player.passedgo = true;
			player.pastfirst = true;
		}
	}
}

//==========================================================================
// Jail logic - Display modifications are now separated
//==========================================================================

// Method to check if the player is jailed or not
module.exports.playerCheckJailed = function(gameBoard, playerNum)
{
	if (gameBoard.players[playerNum].jailed)
		return true;

	return false;
}

// Release the player from jail, done either through
module.exports.playerReleaseFromJail = function(gameBoard, playerNum)
{
	const player = gameBoard.players[playerNum];
	player.jailed = false;
	player.jailturns = module.exports.JAIL_TURN_NONE;
}

// Check can get out of jail
module.exports.canUseGTFO = function(gameBoard, playerNum)
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
module.exports.GTFO = function(gameBoard, playerNum)
{
	const player = gameBoard.players[playerNum];
	
	if (player.jailcards > 0)
	{
		--player.jailcards;
		module.exports.playerReleaseFromJail(gameBoard, playerNum);
	}
}

//==========================================================================
// Buy & Build - Display modifications are now separated
//==========================================================================

// Buy a tile
module.exports.purchaseTile = function(gameBoard, playerNum, tileNum)
{
	// Game logic change
	if (playerNum > -1) 
	{
		gameBoard.tiles[tileNum].owner = playerNum;
		
		if (gameBoard.players[playerNum].piece == module.exports.PIECE_TYPE_INVESTOR && gameBoard.players[playerNum].pastfirst == false)
			module.exports.flowFunds(gameBoard, playerNum, gameBoard.tiles[tileNum].price * 1.5, false);
		else
			module.exports.flowFunds(gameBoard, playerNum, gameBoard.tiles[tileNum].price, false);
	} 
	else
	{
		gameBoard.tiles[tileNum].owner = null;
	}
}

// Construct a building on this tile
module.exports.constructTile = function(gameBoard, playerNum, tileNum)
{
	gameBoard.tiles[tileNum].building = true;
	module.exports.flowFunds(gameBoard, playerNum, gameBoard.tiles[tileNum].price, false);
}

// Check if the player can purchase a certain property
module.exports.checkCanBuy = function(gameBoard, playerNum, tileNum)
{
	if (gameBoard.players[playerNum].pastfirst == false && gameBoard.players[playerNum].piece != module.exports.PIECE_TYPE_INVESTOR)
		return false;

	if (gameBoard.tiles[tileNum].purchaseable == false)
		return false;

	if (gameBoard.tiles[tileNum].owner != null)
		return false;

	if (gameBoard.players[playerNum].piece == module.exports.PIECE_TYPE_INVESTOR)
	{
		if (!module.exports.hasSufficentFunds(gameBoard, playerNum, gameBoard.tiles[tileNum].price * 1.5))
			return false;
	}
	else
	{
		if (!module.exports.hasSufficentFunds(gameBoard, playerNum, gameBoard.tiles[tileNum].price))
			return false;		
	}

	return true;
}

// Check if the player can build on a certain property
module.exports.checkCanBuild = function(gameBoard, playerNum, tileNum)
{
	const tile = gameBoard.tiles[tileNum];

	if (gameBoard.players[playerNum].pastfirst == false)
		return false;

	// If this already has a building, don't bother
	if (tile.building == true) 
		return false;

	// All special tiles can't be built on anyways
	if (tile.tileflags != module.exports.TILE_FLAG_NORMAL) 
		return false;

	// If this doesn't have an owner or the player in question isn't the owner, you can't build here
	if (tile.owner != playerNum) 
		return false;

	// You must own all tiles of the same color code to build
	if (!module.exports.ownsCorrespondingColorTiles(gameBoard, playerNum, tileNum)) 
		return false;

	if (!module.exports.hasSufficentFunds(gameBoard, playerNum, tile.price)) 
		return false;

	return true;
}

// Helper to the above function to see the player owns buildings of corresponding colors, use the const table at the top of the page
module.exports.ownsCorrespondingColorTiles = function(gameBoard, playerNum, tileNum)
{
	let result = false;

	for (let i = 0; i < module.exports.tileColorGroups.length; i++)
	{
		if (module.exports.tileColorGroups[i].includes(tileNum))
		{
			let answer = true;
			for (let j = 0; j < module.exports.tileColorGroups[i].length; j++)
			{
				if (gameBoard.tiles[module.exports.tileColorGroups[i][j]].owner != playerNum)
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
module.exports.numOwnedTTC = function(gameBoard, playerNum)
{
	let result = 0;

	for (let i = 0; i < module.exports.ttcTiles.length; i++)	
	{
		if (gameBoard.tiles[module.exports.ttcTiles[i]].owner == playerNum)
			result++;
	}

	return result;
}

// Return the number of owned utility tiles
module.exports.numOwnedUtility = function(gameBoard, playerNum)
{
	let result = 0;

	for (let i = 0; i < module.exports.utilityTiles.length; i++)
	{
		if (gameBoard.tiles[module.exports.utilityTiles[i]].owner == playerNum)
			result++;
	}

	return result;
}

//==========================================================================
// Monetary logic - Display modifications are now separated
//==========================================================================

// This changes a player's money, fundsDirection controls whether it's removed or added
module.exports.flowFunds = function(gameBoard, playerNum, fundsAmount, fundsDirection)
{
	if (fundsDirection)
	{
		gameBoard.players[playerNum].money += fundsAmount;
	}
	else
	{
		// Check if this is a lawyer
		if (gameBoard.players[playerNum].piece == module.exports.PIECE_TYPE_LAWYER)
			fundsAmount += (fundsAmount / 10);
		
		gameBoard.players[playerNum].money -= fundsAmount;
	}
}

// Does the player still have funds?
module.exports.checkFunds = function(gameBoard, playerNum)
{
	if (gameBoard.players[playerNum].money >= 0)
		return true;

	return false;
}

//==========================================================================
// Gamestate logic, in other words, gamestate - Display modifications are now separated
//==========================================================================

module.exports.rollTheDice = function(gameBoard)
{
	const currentPlayer = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	
	gameBoard.diceRolling = true;
	
	if (currentPlayer.user != null)
		gameBoard.gameState = module.exports.GAMESTATE_PLAYER_ROLL;
	else
		gameBoard.gameState = module.exports.GAMESTATE_AI_ROLL;
	
	function stopDice()
	{
		stopDiceRoll(gameBoard);
	};
	
	gameBoard.gameState = module.exports.GAMESTATE_PLAYER_ROLL;
	gameBoard.timeOutId = setTimeout(stopDice, 2000);
}

module.exports.stopDiceRoll = function(gameBoard)
{
	gameBoard.diceRolling = false;

	// Dice rolling away
	gameBoard.dice[0] = 1 + Math.floor(Math.random() * Math.floor(6));
	gameBoard.dice[1] = 1 + Math.floor(Math.random() * Math.floor(6));

	function playMove()
	{
		playerMove(gameBoard);
	}

	// Delay player movement
	gameBoard.timeOutId = setTimeout(playMove, 1000);
}

// Moving phase
module.exports.playerMove = function(gameBoard)
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	const playerNum = gameBoard.playerTurns[gameBoard.playerTurn];

	if (player.jailed == true)
	{
		if (gameBoard.dice[0] == gameBoard.dice[1]) module.exports.playerReleaseFromJail(gameBoard.playerTurns[gameBoard.playerTurn]);

		gameBoard.timeOutId = setTimeout(nextTurn, 2000);
		return;
	}

	playerMoveBy(gameBoard, playerNum, gameBoard.dice[0] + gameBoard.dice[1]);

	function playEffects()
	{
		module.exports.playerEffects(gameBoard);
	}

	// Apply effects
	gameBoard.timeOutId = setTimeout(playEffects, 2000);
}

// Apply tile and movement effects to the player
module.exports.playerEffects = function(gameBoard)
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];

	if (player.user != null)
	{
		gameBoard.gameState = module.exports.GAMESTATE_PLAYER_INFO;
	} 
	else
	{
		gameBoard.gameState = module.exports.GAMESTATE_AI_INFO;
	}

	function nextTurner()
	{
		module.exports.nextTurn(gameBoard);
	}
	
	function playDecisionTime()
	{
		module.exports.playerDecisionTime(gameBoard);
	}

	if (player.jailed == true)
		gameBoard.timeOutId = setTimeout(nextTurner, 2000);
	else
		gameBoard.timeOutId = setTimeout(playDecisionTime, 2000);
	
	module.exports.tileLand(gameBoard.playerTurns[gameBoard.playerTurn],gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].position);
}

// Give the player some time to make decisions about his purchases
module.exports.playerDecisionTime = function(gameBoard)
{
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
	const playerNum = gameBoard.playerTurns[gameBoard.playerTurn];

	if (player.user)
	{
		gameBoard.gameState = module.exports.GAMESTATE_PLAYER_DECISION;
	} 
	else
	{
		gameBoard.gameState = module.exports.GAMESTATE_AI_DECISION;
		
		if (player.aiprofile != module.exports.AI_PROFILE_TEST)
		{
			// Check if you're on a buyable tile or not
			if (module.exports.checkCanBuy(gameBoard, playerNum, player.position))
			{
				if (player.aiprofile == module.exports.AI_PROFILE_AGGRESSIVE || (player.aiprofile == module.exports.AI_PROFILE_RANDOM && Math.floor(Math.random() * 2) == 1))
					module.exports.purchaseTile(gameBoard, playerNum, player.position);
			}
			
			// Check if you can build here
			if (module.exports.checkCanBuild(gameBoard, playerNum, player.position))
			{
				if (player.aiprofile == module.exports.AI_PROFILE_AGGRESSIVE || (player.aiprofile == module.exports.AI_PROFILE_RANDOM && Math.floor(Math.random() * 2) == 1))
					module.exports.constructTile(gameBoard, playerNum, player.position);			
			}
		}
	}

	function nextTurner()
	{
		module.exports.nextTurn(gameBoard);
	}

	gameBoard.timeOutId = setTimeout(nextTurner, 2000); // Should be 10000 for ten seconds
}

// Giving the dice to the next player
module.exports.nextTurn = function(gameBoard)
{
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
	if (module.exports.checkFunds(checkPlayer))
	{
		// Just stop at this point
		if (gameBoard.playerTurns.length <= 1)
			return;
	}

	// Check whose turn it is
	if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].user == null) {
		gameBoard.gameState = module.exports.GAMESTATE_AI_TURN;
		
		const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
		const playerNum = gameBoard.playerTurns[gameBoard.playerTurn];
		
		if (player.aiprofile != module.exports.AI_PROFILE_TEST)
		{
			if (module.exports.canUseGTFO(gameBoard, playerNum))
			{
				if (player.aiprofile == module.exports.AI_PROFILE_AGGRESSIVE || (player.aiprofile == module.exports.AI_PROFILE_RANDOM && Math.floor(Math.random() * 2) == 1))
					GTFO(gameBoard, playerNum);
			}
		}
		
		function rtd()
		{
			module.exports.rollTheDice(gameBoard);
		}
		gameBoard.timeOutId = setTimeout(rtd, 2000);
	} 
	else
	{
		gameBoard.gameState = module.exports.GAMESTATE_PLAYER_TURN;
	}

	// Jailing mechanic
	if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailed)
	{
		if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailturns > 0)
		{
			--gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailturns;
		}

		if (gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]].jailturns <= 0)
			module.exports.playerReleaseFromJail(gameBoard, gameBoard.playerTurns[gameBoard.playerTurn]);
	}
}

//==========================================================================
// Tile Logic - Display modifications are now separated
//==========================================================================

// What happens if you land on a certain tile
module.exports.tileLand = function(gameBoard, playerNum, tileNum)
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
			
			if (playerPtr.piece == module.exports.PIECE_TYPE_VETERAN)
				loot -= 50;
			
			if (playerPtr.piece == module.exports.PIECE_TYPE_WORKER)
				loot += 50;
			
			module.exports.flowFunds(gameBoard, playerNum, 200, true);
			gameBoard.players[playerNum].passedgo = false;
		}
	}

	const tile = gameBoard.tiles[tileNum];
	const tileFlags = gameBoard.tiles[tileNum].tileflags;

	if (tileFlags == module.exports.TILE_FLAG_NORMAL || tileFlags == module.exports.TILE_FLAG_UTILITY || tileFlags == module.exports.TILE_FLAG_TTC)
	{
		if (tile.owner != playerNum && tile.owner != null)
		{

			if (tileFlags == module.exports.TILE_FLAG_UTILITY && playerPtr.piece != module.exports.PIECE_TYPE_GENIUS)
			{
				let loot = module.exports.numOwnedUtility(tile.owner) * (tile.price / 2);

				module.exports.flowFunds(gameBoard, playerNum, loot, false);
				module.exports.flowFunds(gameBoard, tile.owner, loot, true);
			} 
			else if (tileFlags == module.exports.TILE_FLAG_TTC && playerPtr.piece != module.exports.PIECE_TYPE_GENIUS)
			{
				let loot = module.exports.numOwnedTTC(tile.owner) * (tile.price / 4);

				module.exports.flowFunds(gameBoard, playerNum, loot, false);
				module.exports.flowFunds(gameBoard, tile.owner, loot, true);
			} 
			else
			{
				let loot = tile.price / 4;

				if (module.exports.ownsCorrespondingColorTiles(gameBoard, tile.owner, tileNum))
					loot *= 2;

				if (tile.building == true)
					loot *= 2;

				if (playerPtr.piece == module.exports.PIECE_TYPE_VETERAN)
					loot *= 0.9;
				
				if (playerPtr.piece == module.exports.PIECE_TYPE_BANKER)
					loot *= 1.1;
				
				module.exports.flowFunds(gameBoard, playerNum, loot, false);
				module.exports.flowFunds(gameBoard, tile.owner, loot, true);
			}
		}
	} 
	else if (tileFlags == module.exports.TILE_FLAG_TAX && playerPtr.piece != module.exports.PIECE_TYPE_BANKER)
	{
		let loot = gameBoard.tiles[tileNum].price;
		
		if (playerPtr.piece == module.exports.PIECE_TYPE_WORKER || playerPtr.piece == module.exports.PIECE_TYPE_GENIUS)
			loot *= 1.25;
		
		module.exports.flowFunds(gameBoard, gameBoard.playerNum, loot, false);
		gameBoard.tiles[20].price += loot;
	} 
	else if (tileFlags == module.exports.TILE_FLAG_COMMUNITY)
	{
		module.exports.drawCommunityCard(gameBoard, playerNum);
	} 
	else if (tileFlags == module.exports.TILE_FLAG_CHANCE)
	{
		module.exports.drawChanceCard(gameBoard, playerNum);
	} 
	else if (tileFlags == module.exports.TILE_FLAG_GOTOJAIL)
	{
		module.exports.playerSendToJail(gameBoard, playerNum, false);
	} 
	else if (tileFlags == module.exports.TILE_FLAG_FREEPARKING)
	{
		if (gameBoard.dice[0] == gameBoard.dice[1])
		{
			module.exports.flowFunds(gameBoard, playerNum, gameBoard.tiles[tileNum].price, true);
			gameBoard.tiles[tileNum].price = 0;
		} 
	} 
	else if (tileFlags == module.exports.TILE_FLAG_GO)
	{
		let loot = 200;
		
		if (playerPtr.piece == module.exports.PIECE_TYPE_VETERAN)
			loot -= 50;
		
		if (playerPtr.piece == module.exports.PIECE_TYPE_WORKER)
			loot += 50;
		
		module.exports.flowFunds(gameBoard.playerNum, loot, true);
	}
}

// Players draws a chance card
module.exports.drawChanceCard = function(gameBoard, playerNum)
{
	// Always increment first, this way you know for sure which card was drawn
	gameBoard.chanceCount++;
	
	if (gameBoard.chanceCount >= gameBoard.chanceCards.length)
	{
		gameBoard.chanceCount = 0;
		module.exports.shuffleChance(gameBoard);
	}
	
	// Call the function to apply the effect of the card
	clearTimeout(gameBoard.timeOutId);
	
	function nextTurner()
	{
		module.exports.nextTurn(gameBoard);
	}
	
	gameBoard.timeOutId = setTimeout(function() {
		clearTimeout(gameBoard.timeOutId);
		gameBoard.timeOutId = setTimeout(nextTurner, 2000);
		module.exports.chanceFunctions[gameBoard.chanceCards[gameBoard.chanceCount][1]](gameBoard, playerNum); 
		}, 2000);
	
}

// Player draws a community card
module.exports.drawCommunityCard = function(gameBoard, playerNum)
{
	// Always increment first, this way you know for sure which card was drawn
	gameBoard.communityCount++;
	
	if (gameBoard.communityCount >= gameBoard.communityCards.length)
	{
		gameBoard.communityCount = 0;
		module.exports.shuffleCommunity(gameBoard);
	}
	
	// Call the function to apply the effect of the card
	clearTimeout(gameBoard.timeOutId);
	
		function nextTurner()
	{
		module.exports.nextTurn(gameBoard);
	}
	
	gameBoard.timeOutId = setTimeout(function() {
		clearTimeout(gameBoard.timeOutId);
		gameBoard.timeOutId = setTimeout(nextTurner, 2000);
		module.exports.communityFunctions[gameBoard.communityCards[gameBoard.communityCount][1]](gameBoard, playerNum); 
		}, 2000);
}

// Shuffle the chance cards
module.exports.shuffleChance = function(gameBoard)
{
	gameBoard.chanceCards.sort(() => Math.random() - 0.5);
}

// Shuffle the community cards
module.exports.shuffleCommunity = function(gameBoard)
{
	gameBoard.communityCards.sort(() => Math.random() - 0.5);
}

//==========================================================================
// Avengers: Endgame Logic - Display modifications are now separated
//==========================================================================

// Function to actually kick player out of the damned game
module.exports.kickPlayer = function(gameBoard, playerNum)
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
			module.exports.purchaseTile(gameBoard, -1, i);
		}
	}
	
	const removedPlayer = gameBoard.players[actualPlayerId];
	const player = gameBoard.players[gameBoard.playerTurns[gameBoard.playerTurn]];
		
	// Check if the player kicked is the current one playing
	if (removingOther == false)
	{
		if (player.user == null)
		{
			clearTimeout(gameBoard.timeOutId);
			gameBoard.gameState = module.exports.GAMESTATE_AI_TURN;
			function rollingStones()
			{
				module.exports.rollTheDice(gameBoard);
			}
			gameBoard.timeOutId = setTimeout(rollingStones, 2000);
		}
		else
		{
			clearTimeout(gameBoard.timeOutId);
			gameBoard.gameState = module.exports.GAMESTATE_PLAYER_TURN;
		}
	}
	
	// Check for win condition
	if (module.exports.checkWinCondition(gameBoard))
	{
		clearTimeout(gameBoard.timeOutId);
		gameBoard.timeOutId = null;
		gameBoard.gameState = module.exports.GAMESTATE_END;
	}
}

// Check win condition
module.exports.checkWinCondition = function(gameBoard)
{
	if (gameBoard.playerTurns.length <= 1)
		return true;
	
	return false;
}

//==========================================================================
// Information Logic - Display modifications are now separated
//==========================================================================

// Tile information displayed on propertyInfo
module.exports.getTileInfo = function(gameBoard, tile, cardNum)
{
	switch (tile.tileflags)
	{
		case module.exports.TILE_FLAG_GO:
			return "Collect $200 if you pass and an extra $200 if you land on it.";
			break;
		case module.exports.TILE_FLAG_COMMUNITY:
			if (cardNum <= -1)
				return "Community Chest Card!";
			else
				return gameBoard.communityCards[cardNum][0];
			break;
		case module.exports.TILE_FLAG_CHANCE:
			if (cardNum <= -1)
				return "Chance Card!";
			else
				return gameBoard.chanceCards[cardNum][0];
			break;
		case module.exports.TILE_FLAG_JAIL:
			return "If you're just visiting, stay put. Otherwise, wait three turns, use a Get out of Jail free card or score a double to be freed.";
			break;
		case module.exports.TILE_FLAG_FREEPARKING:
			return "Free parking! Stay put or get your tax returns if you landed here with a double.";
			break;
		case module.exports.TILE_FLAG_GOTOJAIL:
			return "You've said or done something politically offensive. Get academically suspended.";
			break;
		case module.exports.TILE_FLAG_TAX:
			return "Pay your taxes! $" + tile.price;
			break;
		case module.exports.TILE_FLAG_UTILITY:
			return "Pay 50% of the tile price of every utility the owner has.";
			break;
		case module.exports.TILE_FLAG_TTC:
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

/* board js */

"use strict";

//=============================================================================================
// Heavily modified board front end
//=============================================================================================

const boardL = require('./board-logic.js');

//=============================================================================================
// Refresh function for the board, we refresh every element based on the information gathered
//=============================================================================================

// Board and user information
let board = null;
let user = null

// Client side value, allowing to see which tile is currently being infoed
let infoedTile = null;

// Value on the client-side used to refresh the board information
let intervalId = null;

// Function to fetch json board and convert it into a useable state for the client
function fetchBoard()
{
	// Request board from the server depending on room
}

function refreshBoard(gameBoard)
{
	// Refresh the tiles, this includes general information, color of owner, presence of building
	for (let i = 0; i < boardL.maxTiles; i++)
	{
		const boardHTML = document.getElementById("board");
		const boardHTMLTile = boardHTML.children[i + 1];
		if (boardL.communityTiles.includes(i) || boardL.chanceTiles.includes(i))
		{
			boardHTMLTile.children[0].innerHTML = gameBoard.tiles[i].name;
		}
		else if (boardL.utilityTiles.includes(i) || boardL.ttcTiles.includes(i) || boardL.taxTiles.includes(i))
		{
			boardHTMLTile.children[0].innerHTML = gameBoard.tiles[i].name;
			boardHTMLTile.children[1].innerHTML = "$" + gameBoard.tiles[i].price;
		}
		else
		{
			boardHTMLTile.children[1].innerHTML = gameBoard.tiles[i].name;
			boardHTMLTile.children[2].innerHTML = "$" + gameBoard.tiles[i].price;
		}
		
		// Find corresponding tile
		let tile = null;

		for (let j = 1; j < boardL.maxTiles + 1; j++)
		{
			if (j - 1 == i) 
		{
				tile = boardHTML.children[j];
				break;
			}
		}

		if (tile) 
		{
			const divId = tile.getAttribute("id");
			const divElement = document.getElementById(divId);

			divElement.style.backgroundRepeat = "no-repeat";
			divElement.style.backgroundPosition = "center";
			
			const owner = gameBoard.tiles[i].owner;
			
			// Color based on owner
			if (gameBoard.tiles[i].owner == null) 
			{
				divElement.style.backgroundColor = "#CEE6D0";
			} 
			else 
			{
				if (gameBoard.players[owner].color == "magenta")
					divElement.style.backgroundColor = "rgba(255,0,255,0.2)";
				else if (gameBoard.players[owner].color == "blue")
					divElement.style.backgroundColor = "rgba(0,0,255,0.2)";
				else if (gameBoard.players[owner].color == "green")
					divElement.style.backgroundColor = "rgba(0,128,0,0.2)";
				else if (gameBoard.players[owner].color == "orange")
					divElement.style.backgroundColor = "rgba(255,165,0,0.2)";
			}

			// Presence of a building
			if (gameBoard.tiles[i].building == true)
			{
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
		}

	}
	
	// -----------------------------------
	
	// The tile which we are currently getting info from, this is purely client-sided but the info is acquired from the gameBoard
	const infoTile = document.getElementById("propertyInfo");
	infoTile.innerHTML = "";
	infoTile.style.backgroundColor = "";
	infoTile.style.backgroundImage = "";

	if (infoedTile != null)
	{
		let tileInfo = null;
		let index = 1;

		// Find corresponding tile
		for (let j = 1; j < maxTiles + 1; j++) {
			if (boardHTML.children[i] == tileIterate) {
				tileInfo = gameBoard.tiles[j - 1];
				index = j - 1;
				break;
			}
		}

		if (tileInfo)
		{
			// Get element and purge its inner contents
			const infoTile = document.getElementById("propertyInfo");

			// Set the header
			const infoTileHeader = document.createElement("div");
			if (tileIterate.children[0])
			{
				infoTileHeader.className = "propertyInfoHeader";
				infoTileHeader.style.backgroundColor = window
					.getComputedStyle(tileIterate.children[0], null)
					.getPropertyValue("background-color");
			} 
			else 
			{
				infoTileHeader.className = "propertyInfoHeaderNoColor";
			}
			const infoTileHeaderText = document.createTextNode(gameBoard.tiles[index].fullname);
			infoTileHeader.appendChild(infoTileHeaderText);
			infoTile.appendChild(infoTileHeader);

			// Set the image
			if (gameBoard.tiles[index].image)
			{
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
				.getComputedStyle(boardHTML.children[index + 1], null)
				.getPropertyValue("background-color");
		}
	}
	
	// -----------------------------------
	
	// Info on the tile we are currently landed on
	
	const landTile = document.getElementById("propertyInfoAlt");
	landTile.innerHTML = "";
	landTile.style.backgroundColor = "";
	landTile.style.backgroundImage = "";
	
	if (gameBoard.gameState == boardL.GAMESTATE_PLAYER_INFO || gameBoard.gameState == boardL.GAMESTATE_PLAYER_DECISION 
	|| gameBoard.gameState == boardL.GAMESTATE_AI_INFO || gameBoard.gameState == boardL.GAMESTATE_AI_DECISION )
	{
		const position = gameBoard.players[playerNum].position;
		const player = gameBoard.players[playerNum];
		let tileInfo = null;
		let index = 1;
		let tile = null;

		// Find corresponding tile
		for (let j = 1; j < boardL.maxTiles + 1; j++)
		{
			if (j - 1 == position)
			{
				tile = boardHTML.children[j];
				tileInfo = gameBoard.tiles[j - 1];
				index = j - 1;
				break;
			}
		}

		if (tileInfo && tile) 
		{
			// Set the header
			const infoTileHeader = document.createElement("div");
			if (tile.children[0])
			{
				infoTileHeader.className = "propertyInfoHeaderAlt";
				infoTileHeader.style.backgroundColor = window
					.getComputedStyle(tile.children[0], null)
					.getPropertyValue("background-color");
			}
			else
			{
				infoTileHeader.className = "propertyInfoHeaderNoColorAlt";
			}
			const infoTileHeaderText = document.createTextNode(gameBoard.tiles[index].fullname);
			infoTileHeader.appendChild(infoTileHeaderText);
			landTile.appendChild(infoTileHeader);

			// Set the image
			if (gameBoard.tiles[index].image) 
			{
				const infoTileImage = document.createElement("img");
				infoTileImage.className = "propertyInfoImageAlt";
				if (gameBoard.tiles[index].image)
					infoTileImage.setAttribute("src", "./img/" + gameBoard.tiles[index].image);
				else infoTileImage.setAttribute("src", "./img/placeholder.png");
				landTile.appendChild(infoTileImage);
			}

			// Set the information
			const infoTileText = document.createElement("div");
			//infoTileText.style = "white-space: pre;" // To avoid white space culling and allowing the newline to work
			infoTileText.className = "propertyInfoTextAlt";
			
			if (tileInfo.tileflags == TILE_FLAG_COMMUNITY)
				infoTileText.innerHTML = boardL.getTileInfo(gameBoard, tileInfo, gameBoard.communityCount);
			else if (tileInfo.tileflags == TILE_FLAG_CHANCE)
				infoTileText.innerHTML = boardL.getTileInfo(gameBoard, tileInfo, gameBoard.chanceCount);
			else
				infoTileText.innerHTML = getTileInfo(tileInfo, -1);
			
			landTile.appendChild(infoTileText);

			// Add the buttons depending on conditions, you can only build or buy in this version of the game to make it fast
			if (gameBoard.tiles[index].purchaseable == true) {
				const infoTileButtonBox = document.createElement("div");
				infoTileButtonBox.setAttribute("id", "propertyInfoButtonBoxAlt");

				// Buy Button
				const infoTileBuyButton = document.createElement("button");

				if (boardL.checkCanBuy(playerNum, index) && gameBoard.gameState < boardL.GAMESTATE_AI_TURN) {
					infoTileBuyButton.setAttribute("id", "propertyInfoButtonBuy");
					infoTileBuyButton.setAttribute("onclick", "buyTile(event)");
				}
				else
				{
					infoTileBuyButton.setAttribute("id", "propertyInfoButtonBuyDisabled");
					infoTileBuyButton.setAttribute("disabled", "");
				}

				const infoTileBuyButtonText = document.createTextNode("BUY");
				infoTileBuyButton.appendChild(infoTileBuyButtonText);
				infoTileButtonBox.appendChild(infoTileBuyButton);

				const infoTileBuildButton = document.createElement("button");

				if (checkCanBuild(playerNum, index) && gameBoard.gameState < boardL.GAMESTATE_AI_TURN) {
					infoTileBuildButton.setAttribute("id", "propertyInfoButtonBuild");
					infoTileBuildButton.setAttribute("onclick", "buildTile(event)");
				} else {
					infoTileBuildButton.setAttribute("id", "propertyInfoButtonBuildDisabled");
					infoTileBuildButton.setAttribute("disabled", "");
				}

				const infoTileBuildButtonText = document.createTextNode("BUILD");
				infoTileBuildButton.appendChild(infoTileBuildButtonText);
				infoTileButtonBox.appendChild(infoTileBuildButton);
				landTile.appendChild(infoTileButtonBox);

				landTile.style.backgroundColor = window.getComputedStyle(tile, null).getPropertyValue("background-color");

				if (tileInfo.building == true)
				{
					landTile.style.backgroundImage = "url('./img/built.png')";
					landTile.style.backgroundPosition = "bottom center";
					landTile.style.backgroundSize = "25%";
					landTile.style.backgroundRepeat = "no-repeat";
				}
			}
		}
	}
	
	// -----------------------------------
	
	// Refresh dice display, if rolling, constantly randomize it, otherwise stop at the current display	
	const diceSection = document.getElementById("diceDisplay");
	const dice1 = diceSection.children[0];
	const dice2 = diceSection.children[1];
	
	if (gameBoard.diceRolling)
	{
		dice1.setAttribute("src", "img/dice" + (1 + Math.floor(Math.random() * Math.floor(6))) + ".png");
		dice2.setAttribute("src", "img/dice" + (1 + Math.floor(Math.random() * Math.floor(6))) + ".png");
	}
	else
	{
		if (gameBoard.gameState == boardL.GAMESTATE_PLAYER_TURN && (false) ) // Add condition to check if the current player is the client himself
		{
			diceSection.style.border = "2px solid red";
			diceSection.style.cursor = "pointer";
		}
		else
		{
			diceSection.style.border = "2px solid black";
			diceSection.style.cursor = "";
		}
		
		dice1.setAttribute("src", "img/dice" + gameBoard.dice[0] + ".png");
		dice2.setAttribute("src", "img/dice" + gameBoard.dice[1] + ".png");
	}
	
	// -----------------------------------
	
	// Refresh player list
	const playerList = document.getElementById("playerList");
	
	// Purge contents fist
	playerList.innerHTML = "";
	
	playerList.appendChild(document.createTextNode("PLAYERS"));
	playerList.appendChild(diceSection);

	// Add the players in descending order of the playerturn list
	for (let j = 0; j < gameBoard.playerTurns.length; j++)
	{	
		const actualPlayerId = gameBoard.playerTurns[j];
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

		if (actualPlayerId == 0) // Replace with something that determines whether or not the current user is the client himself
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
			if (login.isAdmin) // Replace with something that determines whether or not the current user is the client himself and an admin
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
	
	// Refresh additional information list
	const otherInfo = document.getElementById("otherInformation");
	otherInfo.innerHTML = "";
	
	const otherInfo = document.getElementById("otherInformation");
	const taxReturnText = document.createTextNode("AB TAX RETURN");
	const taxReturnLine = document.createElement("br");
	const taxReturnAmount = document.createTextNode("$" + gameBoard.tiles[20].price);
	
	otherInfo.appendChild(taxReturnText);
	otherInfo.appendChild(taxReturnLine);
	otherInfo.appendChild(taxReturnAmount);
	
	otherInfo.appendChild(document.createElement("br"));
	otherInfo.appendChild(document.createTextNode("IN PRISON"));
	
	for (let j = 0; j < gameBoard.playerTurns.length; j++)
	{
		// Only include players that are currently in jail
		if (gameBoard.players[gameBoard.playerTurns[j]].jailed == true)
		{
			const actualPlayerId = gameBoard.playerTurns[j];
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
	
	if (!canUseGTFO(0)) // replace with actual playerId of the current client
		gtfoButton.setAttribute("disabled", "");
	else
		gtfoButton.setAttribute("onclick", "freedom(event)");
	
	otherInfo.appendChild(buttonReturnLine);
	otherInfo.appendChild(gtfoButton);
	
	// -----------------------------------
		
	// Refresh player positions, this is for the pieces themselves, if they do not exist, create them, otherwise, refresh their position,
	// be sure to remove pieces that shouldn't belong there anymore
	let physicalBoard = document.querySelector( '#board' );
	
	// Find who is not playing anymore and remove them if their piece is still around
	for (let j = 0; j < gameBoard.players.length; j++)
	{
		const playerName = "player" + playerNum;
		if (!gameBoard.playerTurns.includes(j))
		{
			if (document.querySelector("#" + playerName))
			{
				let piece = document.querySelector( '#' + playerName );
				piece.parentNode.removeChild( piece );
			}
		}
	}
	
	// Check those that are still playing
	for (let j = 0; j < gameBoard.players.length; j++)
	{	
		if (gameBoard.playerTurns.includes(j))
		{
			const playerName = "player" + gameBoard.playerTurns[j];
		
			if (!document.querySelector("#" + playerName))
			{
				const playerPiece = document.createElement("div");
				playerPiece.setAttribute("id", playerName);
				playerPiece.setAttribute("class", "player");
				let imgPathString = "url('./img/pieces/" + pieceGraphics[gameBoard.players[gameBoard.playerTurns[j]].piece] + "-" + gameBoard.players[gameBoard.playerTurns[j]].color + ".png')";
				playerPiece.style.backgroundImage = imgPathString;
				physicalBoard.appendChild(playerPiece);
			}

			// Get them in position
			offsetPiece(gameBoard.playerTurns[j], gameBoard.players[gameBoard.playerTurns[j]].position);
		}
	}
	
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
	let index = 1;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++)
	{
		if (boardTile.children[i] == tileIterate)
		{
			index = i - 1;
			break;
		}
	}

	infoedTile = index;
	refreshBoard();
}

// Event handler, this purges the property information display and replaces it with up-to-date information from the last clicked tile
function parseInfo(e)
{
	// prevent default form action
	e.preventDefault();

	// Setup
	const tile = e.target;
	const boardTile = document.getElementById("board");
	let index = 1;

	// Find corresponding tile
	for (let i = 1; i < maxTiles + 1; i++)
	{
		if (boardTile.children[i] == tile)
		{
			index = i - 1;
			break;
		}
	}

	infoedTile = index;
	refreshBoard();
}

//==========================================================================
// Event handlers
//==========================================================================

// Buy the tile
function buyTile(e)
{
	e.preventDefault();

	// Insert request for buying tile
	
}

// Build on the tile
function buildTile(e) {
	e.preventDefault();

	// Insert request for building on it
}

function freedom(e)
{
	e.preventDefault();
	
	// Insert request for getting out of jail
	GTFO(0);
}

// Kick an AI player
function playerKick(e, id)
{
	// Prevent default
	e.preventDefault();

	if (board.gameState != boardL.GAMESTATE_PLAYER_TURN)
		return;
}

// Client resign
function playerResign(e) 
{
	e.preventDefault();

	if (board.gameState != boardL.GAMESTATE_PLAYER_TURN)
		return;

	// Insert request for kicking self and moving to the newgame window
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

//==========================================================================
// Set interval for board refresh here
//==========================================================================

fetchBoard();
intervalId = setInterval(fetchBoard, 100);
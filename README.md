# TEAM 03's MONO UNIVERSITY

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
<pre>
//=============================================
// MONO UNIVERSITY - TA INSTRUCTION MANUAL
//=============================================

// Table of Contents
	-DESCRIPTION OF THE APPLICATION
		-LOGIN
		-MAIN PAGE
		-CREATE GAME
		-JOIN GAME
		-SHOP
		-LOGOUT
		-BOARD
	-SAMPLE WALKTHROUGH FOR TA

////////// DESCRIPTION OF THE APPLICATION

// LOGIN
The login page for now is simple and straight forward.
On the right of the screen, you will see the information boxes.
To login as an admin, input "admin" as username AND password.
To login as a user, input "user" as username AND password.
Those users are the only hardcoded ones for now and as the signup portion
of this is related to updating the database on the server side, it is not
implemented yet, but will allow new "user" type users. They will have to be
upgraded to admins by the admins on the yet to be implemented admin board later on.

// MAIN PAGE
Once you're logged in, you will have access to the main page. A simple menu will give you
three options. CREATE GAME, SHOP, JOIN GAME and LOGOUT. The profile icon on the top right
has yet to be implemented and will allow for a user to change information about himself.
Clicking on the logo on any of the other pages will redirect you to this main page.

// CREATE GAME
Clicking here will lead you a menu that gives you the option of either going back to the
previous menu or start a game. This will lead you to the board, which is further discussed in the
BOARD section of this file. If logged as a user, the name displayed will be user, otherwise, it will be admin.

// JOIN GAME
This will lead a list of players with the first being that of the user himself.
If logged as a user, the name displayed will be user, otherwise, it will be admin.
Admin will also have kick buttons next to all but themselves.

// SHOP
This is the interface that will allow users to purchase pieces that will grant bonuses in the board.
Users will only be able to purchase one piece.
Admins will be able to purchase all of them.
The price system for users has yet to be implemented.
The button on the bottom will allow to return back to the MAIN PAGE.

// Leader Board
Here we list out players and their number of wins.
No difference for user or admin.
Click the top left logo to leave this page back to main screen

// LOGOUT
This button simply takes you back to the login screen.

// BOARD
The board is the most complex part of this project and although not complete, the basis for a playable game are laid down.
Whenever you enter the board, you will always be facing three AI players. Named AI 1 to 3.
The player will be named 'user' if logged in as a user and 'admin' if logged in as 'admin'.
You will see two main sections of the board, the board and the sidebar.
The sidebar includes the player list, which includes the dice rolling section, and the player list.
The player list includes the names of the players and the color of their pieces. By default, you will be playing as
the magenta bomb.
The list of players is shuffled and is arranged from top to bottom by playing order.
Any player who is currently playing will have their name changed to red. If the user/admin are playing, the same will
happen but they will also get the dice rolling section highlighted in red to indicate they must click on the dice
rolling section to throw the dice.
The AI will automatically roll a dice and move on their own.
All users will be able to click the resign button next to their name to leave the board and return to the main menu.
Admins will have acess to a kick button next to the AI players' names though for now, it does not kick them, simply logs
into the console.

Basic Rules
Getting a double on the die will allow a player to throw the dice again. Players will move by the sum of the number
obtained by the die.

You can click on any tiles to get more information about them on the tile information bar under the player list.

There is no endgame state implemented for now, it is simply an endless dice rolling session and tile moving session
with AI players.

////////// SAMPLE WALKTHROUGH FOR TA

1)Login with the following credentials: Login: user | Password: user

2)Click on SHOP

3)Click on all buttons, only one will be able changed.

4)Leave the SHOP by clicking on the button on the bottom of the page

5)Click on CREATE GAME. Your username should be 'user'

6)Click Start GAME
Roll a few dices with the AI players and click on the resign button when you've had enough.

7)Click on JOIN GAME

8)See if your name is 'user' and if any kick button is visible or not.

9)Click create game to get on the board and resign right after.

10)Click logoff

11)Login with the following credentials: Login: admin | Password: admin

12)Click on SHOP

13)Click on all buy buttons, all buy buttons will change and indicate the item is bought.

14)Leave the SHOP.

15)Click on Join Game

16)See if your name is admin and see if there are kick buttons next to players that aren't yourself.

17)Click start game.

18)See if there are any kick buttons next to AI players.

19)Click on resign

20)Click on logout.

That is our application so far.
</pre>

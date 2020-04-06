# TEAM 03's MONO UNIVERSITY: TA INSTRUCTION MANUAL

LINK TO APPLICATION: https://uoft-csc309-2020w-team3.herokuapp.com/

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Description of the Application

## Login

The login page for now is simple and straight forward.
On the right of the screen, you will see the information boxes.
To login as an admin, input "admin" as username AND password.
To login as a user, input "user" as username AND password.
Unlike the previous version, these usernames are actually part of the database.
The signup button is now operational and described in its own section. Each page also has audio now. The audio is different for each page. You can toggle the audio icon on the top right of each page to mute/unmute the audio.

## Signup

Create a new account, input your username once and password twice, try it, it will be a normal
account by default. If the account already exists you will be given the appropriate error message.
To return to the login screen, press the logo on the bottom left of the screen.

## Main Page

Once you're logged in, you will have access to the main page. A simple menu will give you
three options. NEW GAME, SHOP, LEADERBOARD and LOGOUT. The profile icon on the top right
has yet to be implemented and will allow for a user to change information about himself.
Clicking on the logo on any of the other pages will redirect you to this main page.
Being an admin will also grant you access to the ability to edit other profiles

## New Game

Clicking here will lead you straight to the board to play against three other AI players.
The AI players will have various profiles and the pieces.

## Shop

This is the interface that will allow users to purchase pieces that will grant bonuses in the board gameplay.
Users will be able to purchase pieces with the money they have on their account.
Admins will be able to purchase all of them, regardless of how much money they have.
The button on the bottom will allow to return back to the MAIN PAGE.

## Leaderboard

Here we list out players and their number of wins.
No differences for user and admins, it will display the top 5 players by the number of their wins in descending order..
Click the top left logo to leave this page back to main screen.

## Logout

This button simply takes you back to the login screen.

## Profile

Clicking on the top right icon will lead you to your profile, allowing you to view your details and select among the tokens you have bought.

## Admin

This only appears if you're logged in as admin and allows you to edit the stats (shop money, wins, and points) of every other player in the database.

## Board

The board has been fully implemented and is now a fully functional Monopoly game. You will start playing with the token selected in your Profile page against three other AI players. Admins can kick other players out of the game. To get a list of the game's rules, click on the Rules button.

## Multiplayer

Multiplayer (human vs human) was not implemented in the end, as those who wrote the board had little knowledge of backend,
and those who knew backend did not know how the board worked as it was tightly coupled with the frontend.
However, a lot of code exists from our implementation attempts (using socket.io).

## Overview of Routes

POST `/api/signup` {user: String, password: String} - signup with a username and password

POST `/api/login` {user: String, password: String} - login with a username and password. sets a cookie

GET `/api/logout` - logout. clears the login cookie

GET `/api/room/:id` - Intended for multiplayer. Gets the waiting room by id.

GET `/api/id/:username` - Get a user based on their username

GET `/api/shop` - Get a list of all items in the shop

GET `/api/shop/user` - Get a list of all items in the shop that the user has not purchased

GET `/api/shop/:itemid` - Get an item from the shop by its id

PUT `/api/shop/:itemid` - Buy an item from the shop. Requires authentication.

POST `/api/shop/item` - Add an item to the shop. For development use only. Pretend this doesn't exist.

GET `/api/item/:id` - same as GET `/api/shop/:itemid`

GET `/api/user` - Get the user who is currently logged in. Requires authentication

GET `/api/users` - Get all non-admin users

GET `/api/users/all` - Get all users

PATCH `/api/user` - Update user information

GET `/api/createGame` - Intended for multiplayer, creates a game then redirects the user to a room

PUT `/api/win` - Adds a win to the player's win count and gives them 100 credits

# Sample Walkthrough for TA

1. Login with the following credentials: Login: user | Password: user
2. Click on SHOP
3. Click on all buttons, you're out of funds, you won't be able to buy any pieces
4. Leave the SHOP by clicking on the button on the bottom of the page
5. Click on NEW GAME. Your username should be 'user'
6. Play the game! Chill!
7. Resign or win, depending on how long you wish to spend testing it.
8. Check the leaderboards and exit them by pressing the logo on the upper left corner.
9. Click on your profile and upload a new profile picture, then return to the previous menu.
10. Click logout.
11. Login with the following credentials: Login: admin | Password: admin
12. Click on SHOP
13. Click on all buy buttons, all buy buttons will change and indicate the item is bought.
14. Leave the SHOP.
15. Select your own piece by going into your profile.
16. Click on New Game
17. Play the game with your newly selected.
18. Click on resign to lose if you wish it.
19. Otherwise kick every other player when it's turn to instantly win and have your win counter instantly incremented.
20. Check the leaderboards for updated wins.
21. Click on admin and edit the original user's information. Set his money to 1500, wins to 35 and leave their points as is.
22. Check the leaderboards again.
23. Logout
24. Log back into user
25. Check your profile to see the changes
26. Logout

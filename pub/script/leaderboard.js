/* leaderboard js */

"use strict";

// We do not need to fetch the current user, all we need is to fetch the entire userbase, and display the thing

// Very basic user function to make this happen
function User(username, wins) {
    (this.username = username), (this.wins = wins);
}

// Function to add the user in question to the board
function addLeaderboardMember(user) {
    // Get info from param
    const username = user.username;
    const wins = user.wins;

    // Definitions
    const leaderboardList = document.querySelector("#userList");
    const tableRow = document.createElement("tr");
    const tableUser = document.createElement("td");
    const tableUserText = document.createTextNode(username);
    const tableWins = document.createElement("td");
    const tableWinsText = document.createTextNode(wins);

    // Additions
    tableUser.appendChild(tableUserText);
    tableWins.appendChild(tableWinsText);
    tableRow.appendChild(tableUser);
    tableRow.appendChild(tableWins);
    leaderboardList.appendChild(tableRow);
}

// Compare function to sort the leaderboard list in descending order
function sortLeaderboard(userA, userB) {
    if (userA.wins > userB.wins) return -1;
    if (userB.wins > userA.wins) return 1;
    return 0;
}

// Function to fetch user information and apply everything we need for the leaderboard
function startup() {
    const url = "/api/users/all";

    fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Could not get users");
            }
        })
        .then(user => {
            // Initialize array
            let userArray = [];

            // Get all the users and store them
            for (let i = 0; i < user.length; i++) {
                const newUser = new User(user[i].user, user[i].wins);
                userArray.push(newUser);
            }

            // Sort the array
            userArray.sort(sortLeaderboard);
            // Generate the top 5 people
            for (let i = 0; i < userArray.length && i < 5; i++) {
                addLeaderboardMember(userArray[i]);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

// Start it up to have it be done
startup();

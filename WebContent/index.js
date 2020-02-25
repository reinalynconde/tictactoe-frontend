const BASE_URL = "http://localhost:8080/tictactoe";
var player1Name = "Player1";
var player2Name = "Player2";
var counter = 0;
var board = [
	["-", "-", "-"],
	["-", "-", "-"],
	["-", "-", "-"]
]
var mins = 0;
var seconds = 0;
var intervalId = 0;


function registerPlayers() {
	player1Name = $("#player1NameInput").val().length > 0 ? $("#player1NameInput").val() : "Player 1";
	player2Name = $("#player2NameInput").val().length > 0 ? $("#player2NameInput").val() : "Player 2";
	

	
	//TODO:
	registerToBackend();
	
}

function startGame() {
	$("#gameHolder-div").css("visibility", "visible");
	$("#player1NameInput").attr("disabled", true);
	$("#player2NameInput").attr("disabled", true);
	$("#registerBtn").attr("disabled", true);
	$(".tab").attr("disabled", true);
	
	changeTurnCounter();
	startTimer();
}

function registerToBackend(){
	let players = {
		"player1Name" : player1Name,
		"player2Name" : player2Name
	};
	
	$.ajax({
		url: BASE_URL + "/registerPlayers",
		type: "POST",
		crossDomain: true,
		data: JSON.stringify(players),
		contentType: "application/json",
		success: function(result){
			if(result === "Successfully registered players")
				startGame();
		},
		error: function(error){
			console.log(error);
		}
	});
}

function validateCellNumberInput() {
	setTimeout(function() {
		let cellNumber = $("#cellNumberInput").val();
		$("#enterBtn").attr("disabled", !(cellNumber >= 1 && cellNumber <= 9));
	}, 100);
}

function updateBoard() {
	let cellNumber = parseInt($("#cellNumberInput").val());
	let rowEstimate = cellNumber / 3;
	let row = isInt(rowEstimate) ? rowEstimate : Math.floor(rowEstimate) + 1;
	let col = (cellNumber % 3) != 0 ? cellNumber % 3 : 3;
	let pieceToPlace = counter % 2 != 0 ? "X" : "O";
	
	if(board[row-1][col-1] === "-"){
		board[row-1][col-1] = pieceToPlace;
		$("#gameGrid tbody:nth-child(1) tr:nth-child(" + row + ") td:nth-child(" + col + ")").text(pieceToPlace);
		$("#cellNumberInput").val("");
		validateCellNumberInput();
		changeTurnCounter();
	}
	else{
		alert("Invalid move");
	}
	
	//TODO:
	//sendBoard to java for checking
	//display if there is a winner
	//stop interval if there is a winner
}

function isInt(n) {
	return n % 1 === 0;
}

function changeTurnCounter() {
	let playerToPlay = counter % 2 == 0 ? player1Name : player2Name;
	$("#turnCounter").text(playerToPlay + "'s turn");
	counter += 1;
}

function startTimer(){
	intervalId = setInterval(function(){
		seconds += 1;
		if(seconds > 60){
			seconds = 0;
			mins += 1;
		}
		
		$("#time").text("Time: " + mins + ":" + seconds);
	}, 1000);
}

function changeDisplay(event){
	if(event.target.id === "playTab"){
		$("#playDiv").css("visibility", "visible");
		$("#highscore").css("visibility", "hidden");
	}
	else if(event.target.id === "highscoreTab"){
		$("#highscore").css("visibility", "visible");
		$("#playDiv").css("visibility", "hidden");
	}
}

function displayHighScore(){
	//TODO:
	//display highscore from DB
}

$(document).ready(function() {
	$("#cellNumberInput").on("focus change input", validateCellNumberInput);
	$(".tab").on("click", changeDisplay);
});

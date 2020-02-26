const BASE_URL = "http://localhost:8080/tictactoe";
var player1Name = "Player1";
var player2Name = "Player2";
var counter = 0;
var player2Seconds = 0;
var player2IntervalId = 0;
var board = [
	["1", "2", "3"],
	["4", "5", "6"],
	["7", "8", "9"]
];
var defaultBoard = [
	["1", "2", "3"],
	["4", "5", "6"],
	["7", "8", "9"]
];
var timer = {
	"player1" : {
		"mins" : 0,
		"seconds" : 0,
		"isPaused" : false
	},
	"player2" : {
		"mins" : 0,
		"seconds" : 0,
		"isPaused" : true
	}
};


function registerPlayers() {
	player1Name = $("#player1NameInput").val().length > 0 ? $("#player1NameInput").val() : "Player 1";
	player2Name = $("#player2NameInput").val().length > 0 ? $("#player2NameInput").val() : "Player 2";

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
		url: BASE_URL + "/players",
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
	
	if(parseInt(board[row-1][col-1]) >= 1 && parseInt(board[row-1][col-1]) <= 9){
		board[row-1][col-1] = pieceToPlace;
		$("#gameGrid tbody:nth-child(1) tr:nth-child(" + row + ") td:nth-child(" + col + ")").text(pieceToPlace);
		$("#cellNumberInput").val("");
		validateCellNumberInput();
		sendBoard(row-1, col-1, pieceToPlace);
		changeTurnCounter();
	}
	else{
		alert("Invalid move");
	}	
}

function isInt(n) {
	return n % 1 === 0;
}

function changeTurnCounter() {
	let playerToPlay = "";
	if(counter % 2 == 0){
		playerToPlay = player1Name;
		timer["player1"].isPaused = false;
		timer["player2"].isPaused = true;
	}
	else{
		playerToPlay = player2Name;
		timer["player1"].isPaused = true;
		timer["player2"].isPaused = false;
	}

	$("#turnCounter").text(playerToPlay + "'s turn");
	counter += 1;
}

function startTimer(){
	if(player1IntervalId === 0 && player2IntervalId === 0){
		player1IntervalId = startInterval("player1");
		player2IntervalId = startInterval("player2");
	}
}

function startInterval(player){
	return setInterval(function(){
		if(!timer[player].isPaused){
			timer[player].seconds += 1;
			if(timer[player].seconds > 60){
				timer[player].seconds = 0;
				timer[player].mins += 1;
			}

			$("#" + player + "-time").text("Time: " + get2DigitTime(timer[player].mins) + ":" + get2DigitTime(timer[player].seconds));
		}
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
	$.ajax({
		url : BASE_URL + "/highscores",
		type: "GET",
		crossDomain: true,
		success : function(result){
			appendHighScores(JSON.parse(result));
		},
		error : function(error){
			console.log(error);
		}
	})
}

function sendBoard(row, col, latestMove){
	let boardState = {
		"row" : row,
		"col" : col,
		"latestMove" : latestMove,
		"board" : board,
		"player1Time" : "00:" + get2DigitTime(timer["player1"].mins) + ":" + get2DigitTime(timer["player1"].seconds),
		"player2Time" : "00:" + get2DigitTime(timer["player2"].mins) + ":" + get2DigitTime(timer["player2"].seconds)
	};

	$.ajax({
		url : BASE_URL + "/move",
		type : "POST",
		crossDomain : true,
		data: JSON.stringify(boardState),
		contentType: "application/json",
		success: function(result){
			displayResults(result);
		},
		error: function(error){
			console.log(error);
		}
	})
}

function displayResults(winner){
	if(winner === "-")
		return;
	else if(winner === "draw")
		alert("It's a draw!");
	else if(winner === "X")
		alert(player1Name + " has won!");
	else
		alert(player2Name + " has won!");

	resetVariables();
	resetUI();
}

function resetUI(){
	$("#gameHolder-div").css("visibility", "hidden");
	$("#player1NameInput").attr("disabled", false);
	$("#player2NameInput").attr("disabled", false);
	$("#registerBtn").attr("disabled", false);
	$(".tab").attr("disabled", false);
	$("#player1-time").text("Time: 00:00");
	$("#player2-time").text("Time: 00:00");

	for(let i=0; i<board.length; i++){
		for(let j=0; j<board[i].length; j++){
			$("#gameGrid tbody:nth-child(1) tr:nth-child(" + (i+1) + ") td:nth-child(" + (j+1) + ")").text(board[i][j]);
		}
	}

}

function resetVariables(){
	board = defaultBoard;

	timer = {
		"player1" : {
			"mins" : 0,
			"seconds" : 0,
			"isPaused" : false
		},
		"player2" : {
			"mins" : 0,
			"seconds" : 0,
			"isPaused" : true
		}
	}


	clearInterval(player1IntervalId);
	clearInterval(player2IntervalId);

	player1IntervalId = 0;
	player2IntervalId = 0;
}

function get2DigitTime(timeString){
	return timeString > 9 ? timeString : "0" + timeString;
}

function appendHighScores(highscores){
	let names = Object.keys(highscores);
	let tbody = $("#highscore-table tbody");
	console.log(tbody);

	for(let i=0; i<names.length; i++){
		let tr = $("<tr>", {});
		tr.append($("<td>", {}).text(names[i]));
		tr.append($("<td>", {}).text(highscores[names[i]]));

		tbody.append(tr);
	}
}

$(document).ready(function() {
	$("#cellNumberInput").on("focus change input", validateCellNumberInput);
	$(".tab").on("click", changeDisplay);
});

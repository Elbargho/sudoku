var selected_cell = null;
var playBoard;
var hintsBoard;
var numSolsBoard;
var operations;
var head;
var numSols;
var filledCells;
var inOperationFlag = 0;
var timer = 0;

function htmlBoardCode() {
	var index = -1,
		board = document.getElementById("board"),
		shora, cell, cellid;
	for (var i = 1; i <= 9; i++) {
		shora = document.createElement("div");
		shora.setAttribute("class", "shora-" + i);
		board.appendChild(shora);
		for (var j = 0; j < 9; j++) {
			cell = document.createElement("div");
			cellid = "cell-" + (i - 1) + j;
			cell.setAttribute("id", cellid);
			cell.setAttribute("onclick", "selectCell(" + "'" + cellid + "'" + ")");
			shora.appendChild(cell);
		}
	}
}

htmlBoardCode();

function structsInit() {
	if (selected_cell != null) {
		selected_cell.style.backgroundColor = null;
		selected_cell = null;
	}
	playBoard = [];
	hintsBoard = [];
	numSolsBoard = [];
	operations = [];
	for (var i = 0; i < 9; i++) {
		var innerArr = [];
		for (var j = 0; j < 9; j++) {
			innerArr.push(0);
		}
		playBoard.push(innerArr.slice());
		hintsBoard.push(innerArr.slice());
		numSolsBoard.push(innerArr.slice());
	}
	head = -1;
	filledCells = 0;
}

function copyArr(arr1, arr2) {
	for (var i = 0; i < arr2.length; i++) {
		for (var j = 0; j < arr2[0].length; j++) {
			arr1[i][j] = arr2[i][j];
		}
	}
}

function rand(x, y) {
	return Math.floor(x + Math.random() * (y - x));
}

function startGame(choice) {
	var toFillCells;
	if (choice == 'r')
		toFillCells = rand(10, 31);
	else
		toFillCells = document.getElementById("userInput").value;
	if (isNaN(toFillCells) || toFillCells < 0 || toFillCells > 80) {
		document.getElementById("error").innerHTML = "*Enter a number in the range 0-80";
		document.getElementById("userInput").value = null;
	} else {
		document.getElementById("intro").style.visibility = "hidden";
		document.getElementById("error").innerHTML = null;
		structsInit();
		randBackTrack(0, 0);
		randFillBoard(toFillCells);
		printBoard();
		printStatus();
	}
}

function randFillBoard(toFill) {
	var c = 0,
		x, y;
	while (c < 81 - toFill) {
		y = rand(0, 9);
		x = rand(0, 9);
		if (playBoard[x][y] != 0) {
			playBoard[x][y] = 0;
			c += 1;
		}
	}
	filledCells = parseInt(toFill);
}

function printBoard() {
	var cell, val;
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			val = playBoard[i][j];
			cell = document.getElementById("cell-" + i + j);
			if (val != 0)
				cell.textContent = val;
			else
				cell.textContent = null;
		}
	}
}

function printStatus(clear) {
	var posSols = document.getElementById('posSols');
	if (clear != 0 || numSols < 1000) {
		copyArr(numSolsBoard, playBoard);
		numSols = 0;
		timer = Date.now();
		numSolsBackTrack(0, 0);
		if (numSols > 1000 || Date.now() - timer > 300)
			posSols.innerHTML = '<h3>there are more than <u style="color: red;">' + numSols + '</u> possible solutions</h3>'
		else
			posSols.innerHTML = '<h3>there are <u style="color: red;">' + numSols + '</u> possible solutions</h3>'
	}
}

function validate(x, y, board, value) {
	var n, m, blockR, blockC;
	if (value == 0)
		return 1;
	for (n = 0; n < 9; n++) {
		if (board[x][n] == value || board[n][y] == value)
			return -1;
	}
	blockR = Math.floor(x / 3) * 3;
	blockC = Math.floor(y / 3) * 3;
	for (n = 0; n < 3; n++) {
		for (m = 0; m < 3; m++) {
			if (board[blockR + n][blockC + m] == value)
				return 0;
		}
	}
	return 1;
}

function getPosVals(x, y, board) {
	var v, posVals = [];
	for (v = 1; v <= 9; v++) {
		if (validate(x, y, board, v) == 1)
			posVals.push(v);
	}
	return posVals;
}

function randBackTrack(i, j) {
	var steps, rnd, size, posVals;
	if (i == 9)
		return 1;
	posVals = getPosVals(i, j, playBoard);
	size = posVals.length;
	for (steps = 1; steps <= size; steps++) {
		if (steps > 1)
			posVals.splice(rnd, 1);
		if (posVals.length > 1)
			rnd = rand(0, posVals.length);
		else
			rnd = 0;
		if (validate(i, j, playBoard, posVals[rnd]) == 1) {
			playBoard[i][j] = posVals[rnd];
			if (j == 8) {
				if (randBackTrack(i + 1, 0))
					return 1;
			} else {
				if (randBackTrack(i, j + 1))
					return 1;
			}
		}
	}
	playBoard[i][j] = 0;
	return 0;
}

function numSolsBackTrack(i, j) {
	var steps;
	if (i == 9) {
		numSols += 1;
		if (numSols == 1)
			copyArr(hintsBoard, numSolsBoard);
		return numSols;
	}

	if (playBoard[i][j] != 0) {
		if (j == 8) {
			if (numSolsBackTrack(i + 1, 0) > 999)
				return numSols;
		} else {
			if (numSolsBackTrack(i, j + 1) > 999)
				return numSols;
		}
		return numSols;
	}

	for (steps = 1; steps <= 9; steps++) {
		if (Date.now() - timer > 300)
			return numSols;
		if (validate(i, j, numSolsBoard, steps) == 1) {
			numSolsBoard[i][j] = steps;
			if (j == 8) {
				if (numSolsBackTrack(i + 1, 0) > 999)
					return numSols;
			} else {
				if (numSolsBackTrack(i, j + 1) > 999)
					return numSols;
			}
		}
	}

	numSolsBoard[i][j] = 0;
	return numSols;
}

function selectCell(cellID) {
	var currentCell, currentCellColor;
	if (inOperationFlag == 0) {
		currentCell = document.getElementById(cellID);
		currentCellColor = currentCell.style.backgroundColor;
		if (selected_cell == null || selected_cell == currentCell) {
			if (currentCellColor == "lightgray") {
				currentCell.style.backgroundColor = null;
			} else {
				currentCell.style.backgroundColor = "lightgray";
			}
		} else {
			currentCell.style.backgroundColor = "lightgray";
			selected_cell.style.backgroundColor = null;
		}
		selected_cell = currentCell;
	}
}

function sleep(ms) {
	inOperationFlag = 1;
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function cellBlink(x, y) {
	var c = 0,
		cell;
	inOperationFlag = 1;
	cell = document.getElementById("cell-" + x + y);
	while (c <= 5) {
		if (c % 2 == 0)
			cell.style.backgroundColor = "red";
		else
			cell.style.backgroundColor = null;
		c++;
		if (c != 6)
			await sleep('300');
	}
	selected_cell.style.backgroundColor = "lightgray";
	inOperationFlag = 0;
}

function rowColBlink(x, y) {
	for (var i = 0; i < 9; i++) {
		cellBlink(x, i);
		cellBlink(i, y);
	}
}

async function blockBlink(x, y) {
	var
		i = Math.floor(x / 3) * 3,
		j = Math.floor(y / 3) * 3;
	for (var n = 0; n < 3; n++) {
		for (var m = 0; m < 3; m++) {
			cellBlink(i + n, j + m);
		}
	}
}

async function hint() {
	var c = 0,
		i, j, len;
	if (selected_cell != null) {
		len = selected_cell.id.length;
		i = parseInt(selected_cell.id[len - 2]);
		j = parseInt(selected_cell.id[len - 1]);
		if (selected_cell.style.backgroundColor == "lightgray" && inOperationFlag == 0 && playBoard[i][j] == 0) {
			inOperationFlag = 1;
			selected_cell.style.color = "green";
			while (c <= 5) {
				if (c % 2 == 0) {
					selected_cell.textContent = hintsBoard[i][j];
				} else {
					selected_cell.textContent = null;
				}
				c++;
				if (c != 6)
					await sleep('220');
			}
			selected_cell.style.color = null;
			inOperationFlag = 0;
		}
	}
}

async function cellSetNum(number) {
	var i, j, len;
	if (selected_cell != null && selected_cell.style.backgroundColor == "lightgray" && inOperationFlag == 0) {
		len = selected_cell.id.length;
		i = parseInt(selected_cell.id[len - 2]);
		j = parseInt(selected_cell.id[len - 1]);
		if (number == playBoard[i][j]) {
			selectCell(selected_cell.id);
		} else if (number == 0 || validate(i, j, playBoard, number) == 1) {
			if (number == 0) {
				selected_cell.textContent = null;
				filledCells--;
			} else {
				selected_cell.textContent = number;
				filledCells++;
			}
			selectCell(selected_cell.id);
			checkPuzzleSolved();
			while (head < operations.length - 1)
				operations.pop();
			operations.push([i, j, playBoard[i][j], 1]);
			playBoard[i][j] = parseInt(number);
			operations.push([i, j, playBoard[i][j], 1]);
			head += 2;
			printStatus(number);
		} else {
			if (validate(i, j, playBoard, number) == -1)
				rowColBlink(i, j);
			else
				blockBlink(i, j);
		}
	}
}

async function autoFill() {
	var posVals, cell, autoFilledCells = [],
		len, x, y;
	if (inOperationFlag == 0) {
		inOperationFlag = 1;
		if (selected_cell != null && selected_cell.style.backgroundColor != null)
			selected_cell.style.backgroundColor = null;
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				posVals = getPosVals(i, j, playBoard)
				if (playBoard[i][j] == 0 && posVals.length == 1) {
					playBoard[i][j] = posVals[0];
					cell = document.getElementById("cell-" + i + j);
					autoFilledCells.push("cell-" + i + j);
					cell.style.backgroundColor = "lightgray";
					cell.innerHTML = posVals[0];
					await sleep(100);
					cell.style.backgroundColor = null;
				}
			}
		}
		len = autoFilledCells.length;
		while (head < operations.length - 1)
			operations.pop();
		for (var i = 0; i < len; i++) {
			x = parseInt(autoFilledCells[i][5]), y = parseInt(autoFilledCells[i][6]);
			document.getElementById(autoFilledCells[i]).style.backgroundColor = "lightgray";
			operations.push([x, y, 0, len]);
		}
		if (len > 0) {
			await sleep(1500);
			head += 2 * len;
			filledCells += len;
		}
		for (var i = 0; i < len; i++) {
			x = parseInt(autoFilledCells[i][5]), y = parseInt(autoFilledCells[i][6]);
			document.getElementById(autoFilledCells[i]).style.backgroundColor = null;
			operations.push([x, y, playBoard[x][y], len]);
		}
		inOperationFlag = 0;
		if (len > 0)
			checkPuzzleSolved();
	}
}

function upload() {
	if (inOperationFlag == 0)
		document.getElementById('inputfile').click();
}

document.getElementById('inputfile').addEventListener('change', function () {
	var fr = new FileReader();
	fr.onload = function () {
		checkFile(fr.result);
	}

	fr.readAsText(this.files[0]);
	document.getElementById('inputfile').value = '';
})

function checkFile(data) {
	var posVals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
		f = 0,
		val;
	if (data.length != 81) {
		alert("Please choose a legal saved game file");
	} else {
		for (var i = 0; i < 81; i++) {
			if (!(data[i] in posVals)) {
				f = 1;
				alert("Please choose a legal saved game file");
				break;
			}
		}
		if (f == 0) {
			if (selected_cell != null)
				selected_cell.style.backgroundColor = null;
			structsInit();
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 9; j++) {
					val = parseInt(data[9 * i + j]);
					playBoard[i][j] = val;
					if (val != 0)
						filledCells++;
				}
			}
			document.getElementById("intro").style.visibility = "hidden";
			document.getElementById("error").innerHTML = null;
			printBoard();
			printStatus();
		}
	}
}

function download() {
	if (inOperationFlag == 0) {
		var a = document.getElementById("puzzleContent");
		var puzzleAsStr = "";
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				puzzleAsStr += playBoard[i][j];
			}
		}
		uriContent = "data:application/octet-stream," + encodeURIComponent(puzzleAsStr);
		a.setAttribute("href", uriContent);
		a.click();
	}
}

function moveHead(back) {
	var x, y, v, moves, flag = 0;
	if (back == 0)
		head++;
	moves = operations[head][3];
	for (var i = 0; i < moves; i++) {
		if (back)
			head--;
		else
			head++;
	}
	for (var i = 0; i < moves; i++) {
		flag = 0;
		x = operations[head][0];
		y = operations[head][1];
		v = operations[head][2];
		playBoard[x][y] = v;
		if (v == 0)
			filledCells--;
		else
			filledCells++;
		if (back)
			head--;
		else if (head < operations.length - 1) {
			head++;
			flag = 1;
		}
	}
	if (back == 0 && flag == 1)
		head--;
	printBoard();
	printStatus();
	checkPuzzleSolved();
}

function undo() {
	if (inOperationFlag == 0) {
		if (head <= 0)
			alert("no operation to undo");
		else {
			if (selected_cell != null && selected_cell.style.backgroundColor != null)
				selected_cell.style.backgroundColor = null;
			moveHead(1);
		}
	}
}

function redo() {
	if (inOperationFlag == 0) {
		if (head == operations.length - 1)
			alert("no operation to redo");
		else {
			if (selected_cell != null && selected_cell.style.backgroundColor != null)
				selected_cell.style.backgroundColor = null;
			moveHead(0);
		}
	}
}

async function checkPuzzleSolved() {
	var boardCells;
	if (filledCells == 81) {
		inOperationFlag = 1;
		boardCells = document.getElementById("board");
		await sleep(150);
		for (var i = 0; i < 6; i++) {
			if (i % 2 == 0) {
				boardCells.style.color = "green";
				boardCells.style.backgroundColor = "lightgray";
			} else {
				boardCells.style.color = null;
				boardCells.style.backgroundColor = null;
			}
			if (i != 6)
				await sleep(350);
		}
		alert("Congratulations, you have solved the puzzle!");
		inOperationFlag = 0;
	}
}

function checkRestart() {
	if (filledCells == 0)
		restart();
	else
		document.getElementById("restart").style.visibility = "visible";
}

function restart() {
	document.getElementById('posSols').innerHTML = null;
	structsInit();
	printBoard();
	document.getElementById("restart").style.visibility = "hidden";
	document.getElementById("intro").style.visibility = "visible";
}

function cancel() {
	document.getElementById("restart").style.visibility = "hidden";
}

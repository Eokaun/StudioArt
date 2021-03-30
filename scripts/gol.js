var rows = 400;
var cols = 400;

var playing = false;

var grid = new Array(rows);
var nextGrid = new Array(rows);

var timer; 
var reproductionTime = 100;

var mood = "none";

var moodset = {
    liveColor: "lightseablue",
    deadColorSet: ["lightblue", "lightgreen"],
    speed: 60,
    background : "#C2E1E7"
}

var styleSheet;

function initializeGrids(){
    for(var i = 0; i < rows; i++){
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

function resetGrids(){
    for (var i = 0; i < rows; i++){
        for(var j = 0; j < cols; j++){
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }

    console.log('Reset');
    console.log(grid);
}

function copyAndResetGrid(){
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

// Initialize

function initialize(){
    createTable();
    initializeGrids();
    resetGrids();
    setupControlsButtons();
    setupMoodButtons();
    styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
}

function createTable(){
    var gridContainer = document.getElementById("gridContainer");
    if(!gridContainer){
        console.error("Problem: No div for the drid table!");
    }
    var table = document.createElement("table");

    for(var i = 0; i < rows; i++){
        var tr = document.createElement("tr");
        for(var j = 0; j < cols; j++){
            var cell = document.createElement("td");
            cell.setAttribute("id", i+"_"+j);
            cell.setAttribute("class", "dead");
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
}

function cellClickHandler(){
    var rowcol = this.id.split('_');
    var row = rowcol[0];
    var col = rowcol[1];

    var classes = this.getAttribute("class");
    if(classes.indexOf("live") > -1){
        this.setAttribute("class", "dead");
        grid[row][col] = 0;
    }
    else {
        this.setAttribute("class", "live");
        grid[row][col] = 1;
    }
}

function updateView(){
    for(var i = 0; i < rows; i++){
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i+"_"+j);
            if(grid[i][j]==0){
                cell.setAttribute("class", "dead");
                //const randomElement = moodset.deadColorSet[Math.floor(Math.random() * moodset.deadColorSet.length)];
                //cell.style.backgroundColor = randomElement;
            }
            else{
                cell.setAttribute("class", "live");
                //cell.style.backgroundColor = moodset.liveColor;
            }
        }
    }
}

function setupControlsButtons(){
    var startButton = document.getElementById('start');
    startButton.onclick = startButtonHandler;

    var clearButton = document.getElementById('clear');
    clearButton.onclick = clearButtonHandler;

    var randomButton = document.getElementById('random');
    randomButton.onclick = randomButtonHandler;

}

function randomButtonHandler(){
    if(playing) return;
    clearButtonHandler();
    for(var i = 0; i<rows; i++){
        for(var j = 0; j<cols; j++){
            var isLive = Math.round(Math.random());
            if(isLive == 1){
                var cell = document.getElementById(i+"_"+j);
                cell.setAttribute("class", "live");
                grid[i][j]=1;
            }
        }
    }
}

function clearButtonHandler(){
    console.log('Clear the game: stop playing, clear the grid');

    playing = false;
    var startButton = document.getElementById('start');
    startButton.innerHTML = "Start";
    clearTimeout(timer);
    resetGrids();
    var cellsList = document.getElementsByClassName("live");
    var cells = [];
    for(var i = 0; i<cellsList.length; i++){
        cells.push(cellsList[i]);
    }

    for (var i = 0; i<cells.length; i++){
        cells[i].setAttribute("class", "dead");
    }
    /*
    for(var i = 0; i<rows; i++){
        for(var j = 0; j<cols; j++){
            var cell = document.getElementById(i+"_"+j);
            cell.style.backgroundColor = "white";
        }
    }
    */
    
    
}

function startButtonHandler(){
    if(playing){
        console.log("Pause the game");
        playing = false;
        this.innerHTML = "Continue";
        clearTimeout(timer);
    } else{
        console.log("Continue the game");
        playing = true;
        this.innerHTML = "Pause";
        play();
    }
}

function play(){
    computeNextGen();

    if(playing){
        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen(){
    for(var i=0; i<rows; i++){
        for(var j=0; j<cols; j++){
            applyRules(i, j);
        }
    }

    copyAndResetGrid();
    updateView();
}

function applyMood(){
    document.body.style.backgroundColor = moodset.background;
    document.getElementById
    styleSheet.innerText = " td.live { background-color: " + moodset.liveColor + "};";
    document.head.appendChild(styleSheet);
    reproductionTime = moodset.speed;
}


function setupMoodButtons(){
    var calmButton = document.getElementById('calm');
    calmButton.onclick = calmButtonHandler;

    var nightmareButton = document.getElementById('nightmare');
    nightmareButton.onclick = nightmareButtonHandler;

}

function calmButtonHandler(){
    mood = "calm";
    changeMood();
    
}

function nightmareButtonHandler(){
    mood = "nightmare";
    changeMood();
}

function changeMood(){
    if(mood == "calm"){
        moodset.liveColor = "lightseagreen";
        moodset.deadColorSet = ["lightblue", "lightgreen"];
        moodset.speed = 200;
        moodset.background  = "#C2E1E7";
    }
    else if(mood == "nightmare"){
        moodset.liveColor = "red";
        moodset.deadColorSet = ["lightred", "black"];
        moodset.speed = 60;
        moodset.background  = "#17080B";
    }
    applyMood();
}

// RULES
// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overcrowding.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

function applyRules(row, col) {
    var numNeighbors = countNeighbors(row, col);
    if (grid[row][col] == 1) {
        if (numNeighbors < 2) {
            nextGrid[row][col] = 0;
        } else if (numNeighbors == 2 || numNeighbors == 3) {
            nextGrid[row][col] = 1;
        } else if (numNeighbors > 3) {
            nextGrid[row][col] = 0;
        }
    } else if (grid[row][col] == 0) {
            if (numNeighbors >= 3) {
                nextGrid[row][col] = 1;
            }
        }
    }
    
function countNeighbors(row, col) {
    var count = 0;
    if (row-1 >= 0) {
        if (grid[row-1][col] == 1) count++;
    }
    if (row-1 >= 0 && col-1 >= 0) {
        if (grid[row-1][col-1] == 1) count++;
    }
    if (row-1 >= 0 && col+1 < cols) {
        if (grid[row-1][col+1] == 1) count++;
    }
    if (col-1 >= 0) {
        if (grid[row][col-1] == 1) count++;
    }
    if (col+1 < cols) {
        if (grid[row][col+1] == 1) count++;
    }
    if (row+1 < rows) {
        if (grid[row+1][col] == 1) count++;
    }
    if (row+1 < rows && col-1 >= 0) {
        if (grid[row+1][col-1] == 1) count++;
    }
    if (row+1 < rows && col+1 < cols) {
        if (grid[row+1][col+1] == 1) count++;
    }
    return count;
}


window.onload = initialize;
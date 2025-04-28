let player = { x: 0, y: 0 };
let name = '';
let age = 0;
let maze = [];
let discovered = [];
let corePosition = { x: 0, y: 0 };
let traps = [];
let walls = [];
let bossCode = '';
let bossSuccesses = 0;
let bossTimer;
let bossTimeLeft = 7;

function startGame() {
    name = document.getElementById('nameInput').value;
    age = document.getElementById('ageInput').value;
    if (!name || !age) {
        alert('Please provide valid name and age!');
        return;
    }

    document.getElementById('startupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';

    generateMaze(15, 15);
    drawMaze();

    document.addEventListener('keydown', handleKeyPress);
}

function generateMaze(width, height) {
    maze = [];
    discovered = [];
    traps = [];
    walls = [];

    // Initialize maze with open spaces
    for (let y = 0; y < height; y++) {
        maze[y] = [];
        discovered[y] = [];
        for (let x = 0; x < width; x++) {
            maze[y][x] = ' ';
            discovered[y][x] = false;
        }
    }

    // Set up player start position and core position
    player.x = 0;
    player.y = 0;
    maze[player.y][player.x] = ' ';

    // Set core position to bottom-right (or other random location)
    corePosition = { x: width - 1, y: height - 1 };
    maze[corePosition.y][corePosition.x] = 'C';

    // Add traps and walls randomly, ensuring they don't block the player path
    for (let i = 0; i < 10; i++) {
        addTrapOrWall('T');
    }

    for (let i = 0; i < 20; i++) {
        addTrapOrWall('W');
    }

    // Ensure there is always a valid path from player to core
    createValidPath();
}

function addTrapOrWall(type) {
    let x, y;
    do {
        x = Math.floor(Math.random() * maze[0].length);
        y = Math.floor(Math.random() * maze.length);
    } while (maze[y][x] !== ' ' || (x === player.x && y === player.y) || (x === corePosition.x && y === corePosition.y));

    maze[y][x] = type;
    if (type === 'T') traps.push({ x, y });
    if (type === 'W') walls.push({ x, y });
}

function createValidPath() {
    // A basic algorithm to ensure there's a path from the player to the core
    let openList = [{ x: player.x, y: player.y }];
    let visited = Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false));
    visited[player.y][player.x] = true;

    let directions = [
        { x: 0, y: -1 }, // Up
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }, // Left
        { x: 1, y: 0 }   // Right
    ];

    while (openList.length > 0) {
        let current = openList.shift();

        for (let dir of directions) {
            let newX = current.x + dir.x;
            let newY = current.y + dir.y;

            if (newX >= 0 && newY >= 0 && newX < maze[0].length && newY < maze.length && !visited[newY][newX] && maze[newY][newX] !== 'W') {
                visited[newY][newX] = true;
                openList.push({ x: newX, y: newY });

                if (newX === corePosition.x && newY === corePosition.y) {
                    return; // Path to core is found
                }
            }
        }
    }

    // If no valid path, regenerate maze
    generateMaze(15, 15);
}

function drawMaze() {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';
    mazeContainer.style.gridTemplateColumns = `repeat(${maze[0].length}, 24px)`;

    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            if (x === player.x && y === player.y) {
                cell.classList.add('player');
            } else if (maze[y][x] === 'W') {
                cell.classList.add('wall');
            } else if (maze[y][x] === 'T') {
                cell.classList.add('trap');
            } else if (maze[y][x] === 'C') {
                cell.classList.add('core');
            } else {
                cell.classList.add('hidden');
            }
            mazeContainer.appendChild(cell);
        }
    }
}

function movePlayer(direction) {
    let newX = player.x;
    let newY = player.y;

    if (direction === 'up') newY--;
    if (direction === 'down') newY++;
    if (direction === 'left') newX--;
    if (direction === 'right') newX++;

    if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length) {
        if (maze[newY][newX] !== 'W') {
            player.x = newX;
            player.y = newY;

            if (maze[player.y][player.x] === 'T') {
                alert('You stepped on a trap! Returning to start.');
                player.x = 0;
                player.y = 0;
                generateMaze(15, 15);  // Regenerate the maze
                drawMaze();
            } else if (maze[player.y][player.x] === 'C') {
                startBossBattle();
            }

            discovered[player.y][player.x] = true;
            drawMaze();
        }
    }
}

function handleKeyPress(event) {
    if (event.key === 'w' || event.key === 'W') {
        movePlayer('up');
    } else if (event.key === 's' || event.key === 'S') {
        movePlayer('down');
    } else if (event.key === 'a' || event.key === 'A') {
        movePlayer('left');
    } else if (event.key === 'd' || event.key === 'D') {
        movePlayer('right');
    }
}

function startBossBattle() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('bossBattleScreen').style.display = 'block';
    drawSkullGrid();
    nextBossRound();
}

function drawSkullGrid() {
    const skullPattern = [
        "  ###   ###  ",
        " ##### ##### ",
        "#############",
        "#############",
        "###  ###  ###",
        "###  ###  ###",
        "#############",
        "## ##   ## ##",
        "## ##   ## ##",
        "###       ###"
    ];

    const skullDiv = document.getElementById('skullGrid');
    skullDiv.innerHTML = '';
    skullDiv.style.gridTemplateColumns = `repeat(${skullPattern[0].length}, 20px)`;

    for (let row of skullPattern) {
        for (let char of row) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            if (char === '#') {
                cell.classList.add('wall');
            }
            skullDiv.appendChild(cell);
        }
    }
}

function nextBossRound() {
    bossCode = generateBossCode();
    bossSuccesses = bossSuccesses || 0;
    bossTimeLeft = 7;

    document.getElementById('bossInstruction').innerText = `TYPE: ${bossCode}`;
    document.getElementById('bossInput').value = '';
    document.getElementById('bossInput').focus();

    clearInterval(bossTimer);
    bossTimer = setInterval(updateBossTimer, 1000);
}

function generateBossCode() {
    let code = '';
    for (let i = 0; i < 3; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

function updateBossTimer() {
    bossTimeLeft--;
    document.getElementById('timer').innerText = `Timer: ${bossTimeLeft}`;
    if (bossTimeLeft <= 0) {
        clearInterval(bossTimer);
        failBossBattle();
    }
}

function submitBossCode() {
    const playerInput = document.getElementById('bossInput').value;
    clearInterval(bossTimer);

    if (playerInput === bossCode) {
        bossSuccesses++;
        if (bossSuccesses >= 3) {
            winBossBattle();
        } else {
            nextBossRound();
        }
    } else {
        failBossBattle();
    }
}

function winBossBattle() {
    alert('>> CYBER-SKULL DEFEATED << Mission Successful, Samurai!');
    location.reload(); // Restart game
}

function failBossBattle() {
    alert('>> SYSTEM FAILURE << Initiating new maze...');
    location.reload(); // Restart game
}

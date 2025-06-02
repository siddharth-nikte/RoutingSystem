const grid = document.getElementById("grid");
const coordsDisplay = document.getElementById("coordinates");
const ctx = grid.getContext("2d");
let pointsLocation = [];
const colors = ["#00FFFF", "#32CD32", "#FF4500", "#FFD700", "#00BFFF", "#A020F0"];
const cols = 20, rows = 20;
let cellH, cellW;

function drawGrid() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    cellW = ctx.canvas.width / cols;
    cellH = ctx.canvas.height / rows;

    ctx.strokeStyle = "#909090";
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, ctx.canvas.height);
    }
    for (let i = 0; i <= rows; i++) {
        ctx.moveTo(0, i * cellH);
        ctx.lineTo(ctx.canvas.width, i * cellH);
    }
    ctx.stroke();
}

function drawDot(x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
}


function drawDottedLine(x1, y1, x2, y2, color = "lightgray") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]); 
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]); 
}

function drawLine(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRoute(routeCoords, j){
    for(let i = 0; i < routeCoords.length-1; i++)
    {
        drawLine(routeCoords[i][0]*cellW, routeCoords[i][1]*cellH, routeCoords[i+1][0]*cellW, routeCoords[i+1][1]*cellH, colors[j]);
    }
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function handleMouseMove(event) {
    const pos = getMousePos(grid, event);
    const gridX = (pos.x / cellW).toFixed(2);
    const gridY = (pos.y / cellH).toFixed(2);
    coordsDisplay.textContent = `Coordinates: (${gridX}, ${gridY})`;
}

function handleClick(event) {
    const pos = getMousePos(grid, event);
    const gridX = pos.x / cellW;
    const gridY = pos.y / cellH;
    const clickX = pos.x;
    const clickY = pos.y;

    pointsLocation.push([parseFloat(gridX.toFixed(2)), parseFloat(gridY.toFixed(2))]);
    drawDot(clickX, clickY, "magenta");
}

function resizeCanvas() {
    grid.width = window.innerWidth * 0.9;
    grid.height = window.innerHeight * 0.8;
    drawGrid();
}

function addSource() {
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("addSource");
    var span = document.getElementsByClassName("close")[0];
    btn.onclick = function () {
        modal.style.display = "block";
    }
    span.onclick = function () {
        modal.style.display = "none";
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

async function inputSubmit() {
    const walking = document.getElementById("walk");
}

async function createStops(data) {
    if (!Array.isArray(data) || !data.every(Array.isArray)) {
        document.getElementById('error-message').innerText = "Error: Input data empty";
        console.error("Error: Input data empty");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/cluster-passengers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('Error:', await response.json());
            return;
        }

        const result = await response.json();
        drawDot(10 * cellW, 10 * cellH, "white", "Depot");

        let busStops = [];
        for (let i = 0; i < result.clusterCenters.length; i++) {
            if (result.clusterCenters[i] && result.clusterCenters[i].length >= 2) {
                const pixelX = result.clusterCenters[i][0] * cellW;
                const pixelY = result.clusterCenters[i][1] * cellH;

                drawDot(pixelX, pixelY, "red", `Stop ${i + 1}`);
                busStops.push([pixelX, pixelY]); 
            }
        }

        let j = 0;
        for (let i = 0; i < result.routes.length; i++) {
            const routeCoords = [[10, 10]]; 
            for (let x of result.routes[i]) {
                routeCoords.push(result.clusterCenters[x]);
            }
            routeCoords.push([10, 10]); 
            drawRoute(routeCoords, j);

            j = (j + 1) % colors.length;
        }

        for (let i = 0; i < pointsLocation.length; i++) {
            const passengerX = pointsLocation[i][0] * cellW;
            const passengerY = pointsLocation[i][1] * cellH;

            let closestStop = null;
            let minDistance = Infinity;

            for (let stop of busStops) {
                const dist = Math.sqrt(
                    Math.pow(passengerX - stop[0], 2) + Math.pow(passengerY - stop[1], 2)
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closestStop = stop;
                }
            }

            if (closestStop) {
                drawDottedLine(passengerX, passengerY, closestStop[0], closestStop[1]);
            }
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function sample() {
    pointsLocation = [
        [5, 1],
        [5, 3],

        [16, 1],
        [18, 1],

        [13, 7],
        [12, 6],
        [11, 5],

        [1, 9],
        [2, 12],
        [2, 11],
        [2, 13],
        [1, 10],
        [3, 12],
        [1, 13],
        [3, 9],
        [3, 10],
        [2, 10],
        [3, 11],

        [6, 17],
        [5, 16],
        [4, 17],

        [16, 15],
        [16, 18],
        [17, 14]
    ];
    for (let i = 0; i < pointsLocation.length; i++) {
        drawDot(pointsLocation[i][0] * cellW, pointsLocation[i][1] * cellH, "magenta");
    }
}

window.addEventListener('resize', resizeCanvas);
grid.addEventListener('click', handleClick);
grid.addEventListener('mousemove', handleMouseMove);
resizeCanvas(); 

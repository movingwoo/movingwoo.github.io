// Prim's 알고리즘
async function generatePrim() {
    // 시작점 (0,0)
    const startX = 0;
    const startY = 0;
    maze[startY][startX] = 0;
    drawCell(startX, startY, 'white');

    // 프론티어 셀
    const frontiers = [];
    const frontierSet = new Set();
    addFrontiers(startX, startY, frontiers, frontierSet);

    while (frontiers.length > 0) {
        // 무작위 프론티어 선택
        const randomIndex = Math.floor(Math.random() * frontiers.length);
        const [x, y] = frontiers.splice(randomIndex, 1)[0];
        frontierSet.delete(`${x},${y}`);

        // 인접한 통로 찾기 (경계 포함)
        const neighbors = getNeighbors(x, y);

        if (neighbors.length === 0) {
            // 인접 통로 없으면 무시
            continue; 
        }

        // 무작위 인접 통로 선택
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];

        // 벽 뚫기
        const wallX = (x + nx) / 2;
        const wallY = (y + ny) / 2;
        maze[y][x] = 0;
        maze[wallY][wallX] = 0;
        
        drawCell(x, y, 'white');
        drawCell(wallX, wallY, 'white');

        // 새로운 프론티어 추가
        addFrontiers(x, y, frontiers, frontierSet);
        await sleep(5);
    }
}

// 프론티어 셀 추가 (중복 방지, 경계 포함)
function addFrontiers(x, y, frontiers, frontierSet) {
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    for (let [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1 && !frontierSet.has(key)) {
            frontiers.push([nx, ny]);
            frontierSet.add(key);
        }
    }
}

// 인접한 통로 찾기 (경계 포함)
function getNeighbors(x, y) {
    const neighbors = [];
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    for (let [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
            neighbors.push([nx, ny]);
        }
    }
    return neighbors;
}

async function startPrim() {
    initMaze();
    await generatePrim();
    // 입구 표시
    drawCell(entrance[0], entrance[1], 'lime');

    // 가장 먼 곳이 출구
    const [ex, ey] = findFurthestCell(entrance[0], entrance[1]); 
    exit = [ex, ey];
    // 출구 표시
    drawCell(exit[0], exit[1], 'blue');

    const path = findPathBFS(entrance[0], entrance[1], exit[0], exit[1]);
    await drawPathAnimated(path);
}

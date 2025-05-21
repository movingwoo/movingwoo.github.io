// 배열 섞기
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
  
// 미로 생성(DFS)
async function generateDFS(x = entrance[0], y = entrance[1]) {
    const key = `${x},${y}`;
    visited.add(key);
    maze[y][x] = 0;
    drawCell(x, y, 'white'); // 흰색 길

    // 이동 방향 무작위
    const dirs = shuffle([[0, -2], [2, 0], [0, 2], [-2, 0]]);

    // forEach 사용시 동기화 문제있어서 for of 사용
    for (let [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const betweenX = x + dx / 2;
        const betweenY = y + dy / 2;
        const neighborKey = `${nx},${ny}`;

        // 방문하지 않은 셀을 통로로 만들기
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(neighborKey)) {
            maze[ny][nx] = 0; // 다음 셀도 통로
            maze[betweenY][betweenX] = 0; // 중간 벽 없애기
            drawCell(betweenX, betweenY, 'white');

            await sleep(5);
            await generateDFS(nx, ny);
        }
    }
}
  
// 가장 멀리 떨어진 셀을 출구로 지정(BFS)
function findFurthestCell(sx, sy) {
    const que = [[sx, sy, 0]];
    const visited = new Set();
    let maxDist = -1;
    let furthest = [sx, sy];

    while (que.length) {
        const [x, y, dist] = que.shift();
        const key = `${x},${y}`;

        if (visited.has(key)) {
            continue;
        }

        visited.add(key);

        if (dist > maxDist) {
            maxDist = dist;
            furthest = [x, y];
        }

        for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
                que.push([nx, ny, dist + 1]);
            }
        }
    }

    return furthest;
}
  
  // 탈출 경로 찾기(BFS)
function findPathBFS(sx, sy, ex, ey) {
    const que = [[sx, sy]];
    const visited = new Set();
    const parent = {};

    while (que.length) {
        const [x, y] = que.shift();

        if (x === ex && y === ey) {
            break;
        }
        const key = `${x},${y}`;

        visited.add(key);

        for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            const nx = x + dx, ny = y + dy;
            const nextKey = `${nx},${ny}`;

            // 벽이 아니고 방문하지 않은 길
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0 && !visited.has(nextKey)) {
                que.push([nx, ny]);
                visited.add(nextKey);
                parent[nextKey] = key;
            }
        }
    }

    // 출구에서 역으로 경로 추적
    const path = [];
    let curr = `${ex},${ey}`;

    while (curr !== `${sx},${sy}`) {
        const [x, y] = curr.split(',').map(Number);
        path.push([x, y]);
        curr = parent[curr];
    }

    path.push([sx, sy]);

    return path.reverse();
}
  
// 미로 탈출 경로 그리기
async function drawPathAnimated(path) {
    for (let [x, y] of path) {
        if ((x === entrance[0] && y === entrance[1]) || (x === exit[0] && y === exit[1])) {
            continue;
        }

        // 빨강으로 색칠
        drawCell(x, y, 'red');
        await sleep(10);
    }
}
  
// 전체 실행 
async function startDFS() {
    initMaze(); 
    await generateDFS();

    // 입구 표시
    drawCell(entrance[0], entrance[1], 'lime');
    const [ex, ey] = findFurthestCell(entrance[0], entrance[1])
    exit = [ex, ey];
    // 출구 표시
    drawCell(exit[0], exit[1], 'blue')
    
    const path = findPathBFS(entrance[0], entrance[1], exit[0], exit[1]);
    await drawPathAnimated(path);
}
  
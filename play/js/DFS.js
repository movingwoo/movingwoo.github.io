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
  
  
// 전체 실행 
async function startDFS() {
    initMaze(); 
    await generateDFS();
    await pathFinder();
}
  
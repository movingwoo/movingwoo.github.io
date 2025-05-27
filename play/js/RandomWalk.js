async function startRandomWalk() {
    initMap();
    
    // 시작점 (중앙)
    let x = Math.floor(cols / 2);
    let y = Math.floor(rows / 2);
    
    // 방문한 셀 수를 추적
    let visitedCells = 0;
    const targetCells = Math.floor((cols * rows) * 0.4); // 전체 셀의 40% 채우면 종료
    
    // 4방향 이동 
    const directions = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0]
    ];
    
    // 현재 위치를 통로로 만들고 방문 표시
    map[y][x] = 0;
    drawCell(x, y, 'white');
    visitedCells++;
    
    while (visitedCells < targetCells) {
        // 랜덤한 방향 선택
        const [dx, dy] = directions[Math.floor(Math.random() * 4)];
        const newX = x + dx;
        const newY = y + dy;
        
        // 경계 체크
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
            // 새로운 위치가 벽이면 통로로 만들기
            if (map[newY][newX] === 1) {
                map[newY][newX] = 0;
                drawCell(newX, newY, 'white');
                visitedCells++;
            }
            x = newX;
            y = newY;
        }
        
        await sleep(1);
    }
    
    generateEntrance();
}

async function startCellularAutomata() {
    initMap();
    
    // 초기 랜덤 상태 생성 (약 45%의 벽)
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // 테두리는 벽으로 설정
            if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                map[y][x] = 1;
                drawCell(x, y, 'black');
            } else {
                map[y][x] = Math.random() < 0.45 ? 1 : 0;
                drawCell(x, y, map[y][x] === 1 ? 'black' : 'white');
            }
            await sleep(1);
        }
    }
    
    // Cellular Automata 규칙 적용 (4회 반복)
    for (let generation = 0; generation < 4; generation++) {
        const newMap = Array.from({ length: rows }, () => Array(cols).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // 테두리는 벽 유지
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    newMap[y][x] = 1;
                    continue;
                }
                
                // 주변 8칸의 벽 개수 세기
                let wallCount = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        if (map[y + dy][x + dx] === 1) wallCount++;
                    }
                }
                
                //현재 셀이 벽인데 주변 벽이 4개 이상이면 벽 유지, 그렇지 않으면 통로로 변경
                //현재 셀이 통로인데 주변 벽이 5개 이상이변 벽으로 변경, 그렇지 않으면 통로 유지
                if (map[y][x] === 1) {
                    newMap[y][x] = wallCount >= 4 ? 1 : 0;
                } else {
                    newMap[y][x] = wallCount >= 5 ? 1 : 0;
                }
                
                drawCell(x, y, newMap[y][x] === 1 ? 'black' : 'white');
                await sleep(1);
            }
        }
        
        map = newMap;
    }
    
    generateEntrance();
}

// Sidewinder 알고리즘
// 전통적인 Sidewinder 알고리즘은 북쪽으로 길을 파는데 입구가 0,0이라 남쪽으로 파는 것으로 변경
async function generateSidewinder() {
    // 모든 셀을 벽으로 초기화
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze[y][x] = 1;
            drawCell(x, y, 'black');
        }
    }

    // 각 행을 처리
    for (let y = 0; y < rows; y += 2) {
        let run = []; // 현재 실행 중인 경로 (연속된 동쪽 경로)

        for (let x = 0; x < cols; x += 2) {
            // 현재 셀을 통로로 만들기
            maze[y][x] = 0;
            drawCell(x, y, 'white');
            run.push([x, y]); // 현재 셀을 run에 추가

            // 동쪽으로 갈 수 있는지 확인
            const canGoEast = x + 2 < cols;
            // 남쪽으로 갈 수 있는지 확인
            const canGoSouth = y + 2 < rows;

            // 동쪽으로 계속 진행할지, 남쪽으로 연결할지 결정
            // 1. 동쪽으로 갈 수 없거나
            // 2. 남쪽으로 갈 수 있고 50% 확률로 run을 종료
            const shouldCloseOut = !canGoEast || (canGoSouth && Math.random() < 0.5);

            if (shouldCloseOut) {
                // 현재 run에서 무작위로 선택된 셀을 남쪽과 연결
                const [rx, ry] = run[Math.floor(Math.random() * run.length)];
                if (canGoSouth) {
                    maze[ry + 1][rx] = 0;
                    drawCell(rx, ry + 1, 'white');
                }
                run = []; // run 초기화
            } else {
                // 동쪽으로 계속 진행 (run 확장)
                maze[y][x + 1] = 0;
                drawCell(x + 1, y, 'white');
            }

            await sleep(5);
        }
    }
}

async function startSidewinder() {
    initMaze();
    await generateSidewinder();
    await pathFinder();
}

// Binary Tree 알고리즘
async function generateBinaryTree() {
    // 모든 셀을 벽으로 초기화
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze[y][x] = 1;
            drawCell(x, y, 'black');
        }
    }

    // 각 셀에 대해
    for (let y = 0; y < rows; y += 2) {
        for (let x = 0; x < cols; x += 2) {
            // 현재 셀을 통로로 만들기
            maze[y][x] = 0;
            drawCell(x, y, 'white');

            // 동쪽과 남쪽 중 하나를 무작위로 선택
            const canGoEast = x + 2 < cols;
            const canGoSouth = y + 2 < rows;

            if (canGoEast && canGoSouth) {
                // 둘 다 가능하면 무작위로 선택
                if (Math.random() < 0.5) {
                    // 동쪽으로
                    maze[y][x + 1] = 0;
                    drawCell(x + 1, y, 'white');
                } else {
                    // 남쪽으로
                    maze[y + 1][x] = 0;
                    drawCell(x, y + 1, 'white');
                }
            } else if (canGoEast) {
                // 동쪽만 가능
                maze[y][x + 1] = 0;
                drawCell(x + 1, y, 'white');
            } else if (canGoSouth) {
                // 남쪽만 가능
                maze[y + 1][x] = 0;
                drawCell(x, y + 1, 'white');
            }

            await sleep(5);
        }
    }
}

async function startBinaryTree() {
    initMaze();
    await generateBinaryTree();
    await pathFinder();
}

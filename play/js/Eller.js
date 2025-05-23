// Eller's Algorithm 미로 생성
async function generateEller() {
    // 모든 셀을 벽으로 초기화
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze[y][x] = 1;
            drawCell(x, y, 'black');
        }
    }

    // 각 셀의 집합 번호를 저장할 배열
    let sets = [];
    let nextSet = 1;

    // 첫 번째 행 초기화
    for (let x = 0; x < cols; x += 2) {
        sets[x] = nextSet++;
        maze[0][x] = 0;
        drawCell(x, 0, 'white');
    }

    // 각 행을 처리
    for (let y = 0; y < rows; y += 2) {
        // 1. 오른쪽으로 벽을 뚫을지 결정
        for (let x = 0; x < cols - 2; x += 2) {
            // 같은 집합이 아니고, 랜덤하게 벽을 뚫기로 결정하면
            if (sets[x] !== sets[x + 2] && Math.random() < 0.5) {
                // 벽 뚫기
                maze[y][x + 1] = 0;
                drawCell(x + 1, y, 'white');
                // 집합 병합
                const oldSet = sets[x + 2];
                const newSet = sets[x];
                for (let i = 0; i < cols; i += 2) {
                    if (sets[i] === oldSet) sets[i] = newSet;
                }
            }
        }

        // 마지막 행이 아니면 아래로 벽을 뚫기
        if (y + 2 < rows) {
            // 각 집합별로 아래로 연결할 셀을 최소 1개 이상 선택
            const setCells = {};
            for (let x = 0; x < cols; x += 2) {
                if (!setCells[sets[x]]) setCells[sets[x]] = [];
                setCells[sets[x]].push(x);
            }

            // 아래로 연결
            let newSets = [];
            for (const set in setCells) {
                // 반드시 하나는 아래로 연결
                const cells = setCells[set];
                const shuffled = cells.slice().sort(() => Math.random() - 0.5);
                const downCount = 1 + Math.floor(Math.random() * cells.length);
                for (let i = 0; i < downCount; i++) {
                    const x = shuffled[i];
                    maze[y + 1][x] = 0;
                    drawCell(x, y + 1, 'white');
                    maze[y + 2][x] = 0;
                    drawCell(x, y + 2, 'white');
                    newSets[x] = nextSet++;
                }
            }
            // 나머지 셀은 새로운 집합 번호 부여
            for (let x = 0; x < cols; x += 2) {
                if (!newSets[x]) {
                    maze[y + 2][x] = 0;
                    drawCell(x, y + 2, 'white');
                    newSets[x] = nextSet++;
                }
            }
            sets = newSets;
        }
        await sleep(10);
    }
}

async function startEller() {
    initMaze();
    await generateEller();
    await pathFinder();
}

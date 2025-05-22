// Kruskal's 알고리즘
async function generateKruskal() {
    const sets = new Map();
    const walls = [];

    // 짝수 좌표만 통로로 초기화, 집합 생성
    for (let y = 0; y <= rows; y += 2) {
        for (let x = 0; x <= cols; x += 2) {
            maze[y][x] = 0;
            drawCell(x, y, 'white');
            sets.set(`${x},${y}`, `${x},${y}`);
        }
    }

    // 통로 사이의 벽만 벽 리스트에 추가
    for (let y = 0; y <= rows; y += 2) {
        for (let x = 0; x <= cols; x += 2) {
            if (x + 2 < cols) {
                // 수평 벽
                walls.push([x + 1, y, x, y, x + 2, y]);
            }
            if (y + 2 < rows) {
                // 수직 벽
                walls.push([x, y + 1, x, y, x, y + 2]);
            }
        }
    }

    // 벽을 무작위로 섞기
    for (let i = walls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [walls[i], walls[j]] = [walls[j], walls[i]];
    }

    // 하나씩 꺼내서 뚫기
    for (let [wx, wy, x1, y1, x2, y2] of walls) {
        const set1 = findSet(sets, `${x1},${y1}`);
        const set2 = findSet(sets, `${x2},${y2}`);

        if (set1 !== set2) {
            maze[wy][wx] = 0;
            drawCell(wx, wy, 'white');
            union(sets, set1, set2);
            await sleep(5);
        }
    }
}

// 경로 압축을 위한 집합 찾기
function findSet(sets, key) {
    if (sets.get(key) !== key) {
        sets.set(key, findSet(sets, sets.get(key)));
    }

    return sets.get(key);
}

// 집합 합치기
function union(sets, set1, set2) {
    sets.forEach((v, k) => {
        if (v === set2) {
            sets.set(k, set1);
        }
    });
}

async function startKruskal() {
    initMaze();
    await generateKruskal();
    
    // 입구 표시
    drawCell(entrance[0], entrance[1], 'lime');
    const [ex, ey] = findFurthestCell(entrance[0], entrance[1]);
    exit = [ex, ey];
    // 출구 표시
    drawCell(exit[0], exit[1], 'blue');
    
    const path = findPathBFS(entrance[0], entrance[1], exit[0], exit[1]);
    await drawPathAnimated(path);
}

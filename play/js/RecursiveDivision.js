// Recursive Division 알고리즘
// 완전 미로를 만들기 위한 커스텀
// 분할선 크기 조정 시 방 크기 조정
async function generateRecursiveDivision(x1, y1, x2, y2, orientation) {
    // 방이 너무 작으면 중단
    if (x2 - x1 < 2 || y2 - y1 < 2) {
        return;
    }

    // 수평
    if (orientation === 'horizontal') {
        // 분할선 후보(짝수)
        const possibleYs = [];
        
        for (let y = y1 + 2; y < y2; y += 2) {
            possibleYs.push(y);
        }

        if (possibleYs.length === 0) {
            // 분할선 후보가 없으면 중단
            return; 
        }
        const y = possibleYs[Math.floor(Math.random() * possibleYs.length)];

        // 통로 후보(홀수)
        const possiblePassages = [];
        
        for (let x = x1 + 1; x < x2; x += 2) {
            possiblePassages.push(x);
        }
        
        if (possiblePassages.length === 0) {
            // 통로 후보가 없으면 중단
            return;
        }

        // 반드시 하나는 통로로 만들고, 추가로 통로를 더 만들 확률도 부여
        const passageCount = 1 + Math.floor(Math.random() * Math.max(1, possiblePassages.length / 3));
        const passages = [];
        const passageCandidates = [...possiblePassages];
        while (passages.length < passageCount && passageCandidates.length > 0) {
            const idx = Math.floor(Math.random() * passageCandidates.length);
            const px = passageCandidates.splice(idx, 1)[0];
            passages.push(px);
        }

        // 벽 생성 (통로 제외)
        for (let x = x1; x <= x2; x++) {
            if (!passages.includes(x)) {
                maze[y][x] = 1;
                drawCell(x, y, 'black');
            }
        }
        await sleep(5);

        // 위/아래 영역 재귀 호출
        await generateRecursiveDivision(x1, y1, x2, y - 1, 'vertical');
        await generateRecursiveDivision(x1, y + 1, x2, y2, 'vertical');
    } else { // 수직
        // 분할선 후보(짝수)
        const possibleXs = [];
        
        for (let x = x1 + 2; x < x2; x += 2) {
            possibleXs.push(x);
        }

        if (possibleXs.length === 0) {
            // 분할선 후보가 없으면 중단
            return;
        }

        const x = possibleXs[Math.floor(Math.random() * possibleXs.length)];

        // 통로 후보(홀수)
        const possiblePassages = [];

        for (let y = y1 + 1; y < y2; y += 2) {
            possiblePassages.push(y);
        }

        if (possiblePassages.length === 0) {
            // 통로 후보가 없으면 중단
            return;
        }

        // 반드시 하나는 통로로 만들고, 추가로 통로를 더 만들 확률도 부여
        const passageCount = 1 + Math.floor(Math.random() * Math.max(1, possiblePassages.length / 3));
        const passages = [];
        const passageCandidates = [...possiblePassages];
        while (passages.length < passageCount && passageCandidates.length > 0) {
            const idx = Math.floor(Math.random() * passageCandidates.length);
            const py = passageCandidates.splice(idx, 1)[0];
            passages.push(py);
        }

        // 벽 생성 (통로 제외)
        for (let y = y1; y <= y2; y++) {
            if (!passages.includes(y)) {
                maze[y][x] = 1;
                drawCell(x, y, 'black');
            }
        }
        await sleep(5);

        // 좌/우 영역 재귀 호출
        await generateRecursiveDivision(x1, y1, x - 1, y2, 'horizontal');
        await generateRecursiveDivision(x + 1, y1, x2, y2, 'horizontal');
    }
}

async function startRecursiveDivision() {
    initMaze();
    
    // 모든 셀을 통로로 초기화
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze[y][x] = 0;
            drawCell(x, y, 'white');
        }
    }

    // 재귀적 분할 시작 (무작위 방향으로)
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    await generateRecursiveDivision(0, 0, cols - 1, rows - 1, orientation);
    
    await pathFinder();
}

// 2x2 타일 사전 정의
const tiles = [
    {
        name: "wall", // 전체 벽
        data: [[1, 1], [1, 1]],
        edges: { up: 1, right: 1, down: 1, left: 1 }
    },
    {
        name: "floor", // 전체 통로
        data: [[0, 0], [0, 0]],
        edges: { up: 0, right: 0, down: 0, left: 0 }
    },
    {
        name: "hall_h", // 수평 복도
        data: [[1, 1], [0, 0]],
        edges: { up: 1, right: 0, down: 1, left: 0 }
    },
    {
        name: "hall_v", // 수직 복도
        data: [[1, 0], [1, 0]],
        edges: { up: 0, right: 1, down: 0, left: 1 }
    },
    {
        name: "room_corner_top_left", // 위/왼쪽이 열린 방 구석
        data: [[0, 0], [0, 1]],
        edges: { up: 0, right: 0, down: 1, left: 0 }
    },
    {
        name: "room_corner_bottom_right", // 아래/오른쪽 열린 방 구석
        data: [[1, 0], [0, 0]],
        edges: { up: 1, right: 0, down: 0, left: 0 }
    },
    {
        name: "junction_T_up", // T자 모양 (위쪽 갈래)
        data: [[0, 0], [1, 0]],
        edges: { up: 0, right: 0, down: 1, left: 1 }
    },
    {
        name: "dead_end_left", // 왼쪽에만 열린 막다른길
        data: [[1, 1], [0, 1]],
        edges: { up: 1, right: 1, down: 1, left: 0 }
    }
];
  
// 붙으려는 상대방 타일의 방향을 찾기 위한 반대 방향 매핑
const opposite = {
    up: "down",
    down: "up",
    left: "right",
    right: "left"
};

// 타일 간 인접성 판단
function compatible(tileA, tileB, direction) {
    return tileA.edges[direction] === tileB.edges[opposite[direction]];
}

// 셀 클래스 (1칸마다 타일 1개)
class WFC_TileCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.options = tiles.slice(); // 가능한 타일들
        this.collapsed = false;
    }

    collapse() {
        const pick = this.options[Math.floor(Math.random() * this.options.length)];
        this.options = [pick];
        this.collapsed = true;
        return pick;
    }

    getTile() {
        return this.options[0];
    }
}


async function startWFC() {
    initMap();

    const tileSize = 2; // 2x2 타일
    const tileCols = Math.floor(cols / tileSize);
    const tileRows = Math.floor(rows / tileSize);

    const grid = Array.from({ length: tileRows }, (_, y) =>
        Array.from({ length: tileCols }, (_, x) => new WFC_TileCell(x, y))
    );

    // collapse 루프
    let pending = grid.flat().filter(cell => !cell.collapsed);

    while (pending.length > 0) {
        // 아직 collapse되지 않은 셀 중에서 가능한 옵션이 가장 적은 값 찾기
        let minEntropy = pending.reduce((min, cell) => Math.min(min, cell.options.length), Infinity);
        // 가능한 옵션 수가 최소인 셀들만 필터링
        let choices = pending.filter(c => c.options.length === minEntropy);
        // 그 중 하나를 랜덤 선택
        let cell = choices[Math.floor(Math.random() * choices.length)];

        const tile = cell.collapse();

        // 타일을 실제 맵에 그리기
        for (let dy = 0; dy < tileSize; dy++) {
        for (let dx = 0; dx < tileSize; dx++) {
            const mx = cell.x * tileSize + dx;
            const my = cell.y * tileSize + dy;
            
            if (mx < cols && my < rows) {
                map[my][mx] = tile.data[dy][dx];
                drawCell(mx, my, tile.data[dy][dx] === 1 ? 'black' : 'white');

            // 2x2 타일 이름 표시(디버깅)
            // if (dx === 0 && dy === 0) { 
            //     ctx.fillStyle = 'red';
            //     ctx.font = '10px monospace';
            //     ctx.fillText(tile.name, mx * size + 1, my * size + 10);
            //     }
            // }
            }
        }

        await sleep(5);

        // 주변 셀 옵션 줄이기
        for (const [dir, [dx, dy]] of Object.entries({
            up: [0, -1],
            right: [1, 0],
            down: [0, 1],
            left: [-1, 0]
            })) {
                const nx = cell.x + dx;
                const ny = cell.y + dy;

                if (nx < 0 || ny < 0 || nx >= tileCols || ny >= tileRows) continue;

                const neighbor = grid[ny][nx];
                if (neighbor.collapsed) continue;

                // 현재 셀과 호환되는 타일만 남김
                neighbor.options = neighbor.options.filter(opt =>
                    compatible(tile, opt, dir)
                );
            }

            pending = grid.flat().filter(c => !c.collapsed);
        }
    }

    await generateEntrance();
}

---
title: "미로 생성기 02"
description: "JAVASCRIPT 미로 생성기 프로그램 개발"
date: "2025-05-22 08:00:00 +0900"
last_modified_at: "2025-06-16 10:00:00 +0900"
categories: 
  - one-pan/JavaScript/
tags: [JAVASCRIPT, CANVAS, 미로 생성기, 알고리즘, Prim's, Kruskal's]
author: movingwoo
---
> #### 개요  
---  

Prim's 알고리즘과 Kruskal's 알고리즘의 미로를 추가하기  
  
> #### 구현  
---  
  
시작 전에 공통으로 사용할 함수를 index로 몰아준다.  
  
##### 1. Prim's 알고리즘  
  
DFS와 Prim의 미로는 겉으로는 제법 유사해보이는데 Prim은 탈출 경로가 훨씬 단순해진다.  
DFS는 한 방향으로 쭈욱 파다가 막히면 돌아가서 새로운 길을 찾는데,  
Prim은 미로의 경계에서 새로운 길을 만들기 때문이다.  
  
느낌으로 비교하자면 DFS는 {% include colored_text.html color="orange" text="**'길을 파는 것'**" %}이고 Prim은 {% include colored_text.html color="orange" text="**'벽을 뚫는 것'**" %}이다.  
벽을 뚫는 것이기 때문에 인접한 벽(여기서는 프론티어)을 모아두고 랜덤으로 선택해서 뚫어나간다.  
  
DFS와 마찬가지로 js를 작성하고 기존 html에 스크립트를 추가한다.  
  
```javascript
// Prim's 알고리즘
async function generatePrim() {
    // 시작점 (0,0)
    const startX = 0;
    const startY = 0;
    maze[startY][startX] = 0;
    drawCell(startX, startY, 'white');

    // 프론티어 셀
    const frontiers = [];
    const frontierSet = new Set();
    addFrontiers(startX, startY, frontiers, frontierSet);

    while (frontiers.length > 0) {
        // 무작위 프론티어 선택
        const randomIndex = Math.floor(Math.random() * frontiers.length);
        const [x, y] = frontiers.splice(randomIndex, 1)[0];
        frontierSet.delete(`${x},${y}`);

        // 인접한 통로 찾기 (경계 포함)
        const neighbors = getNeighbors(x, y);

        if (neighbors.length === 0) {
            // 인접 통로 없으면 무시
            continue; 
        }

        // 무작위 인접 통로 선택
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];

        // 벽 뚫기
        const wallX = (x + nx) / 2;
        const wallY = (y + ny) / 2;
        maze[y][x] = 0;
        maze[wallY][wallX] = 0;
        
        drawCell(x, y, 'white');
        drawCell(wallX, wallY, 'white');

        // 새로운 프론티어 추가
        addFrontiers(x, y, frontiers, frontierSet);
        await sleep(5);
    }
}

// 프론티어 셀 추가 (중복 방지, 경계 포함)
function addFrontiers(x, y, frontiers, frontierSet) {
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    for (let [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1 && !frontierSet.has(key)) {
            frontiers.push([nx, ny]);
            frontierSet.add(key);
        }
    }
}

// 인접한 통로 찾기 (경계 포함)
function getNeighbors(x, y) {
    const neighbors = [];
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    for (let [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
            neighbors.push([nx, ny]);
        }
    }
    return neighbors;
}

async function startPrim() {
    initMaze();
    await generatePrim();
    // 입구 표시
    drawCell(entrance[0], entrance[1], 'lime');

    // 가장 먼 곳이 출구
    const [ex, ey] = findFurthestCell(entrance[0], entrance[1]);
    exit = [ex, ey];
    // 출구 표시
    drawCell(exit[0], exit[1], 'blue');

    const path = findPathBFS(entrance[0], entrance[1], exit[0], exit[1]);
    await drawPathAnimated(path);
}
```
  
##### 2. Kruskal's 알고리즘  
  
Kruskal 미로는 벽에 갇힌 통로를 생성해두고 무작위로 벽을 뚫어 통로를 연결하는 방식이다.  
복잡도로 따지면 Prim 보다는 복잡하고 DFS보다는 덜 복잡한 느낌이다.  
  
Prim도 벽을 뚫고 Kruskal도 벽을 뚫는데 차이가 있다면  
Prim은 현재 통로와 인접한 벽만 뚫어서 확장해 나가는 것이고  
Kruskal은 {% include colored_text.html color="oragne" text="**미로 전체 벽에서 무작위로 통로가 합쳐지도록 뚫는 것**" %}이다.  
그러니 Prim보다 더 복잡해 보일 수 밖에.  
  
```javascript
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
```

> #### 완성  
---  
  
Prim's 알고리즘 미로  
  
![img01](/assets/images/posts/one-pan/JavaScript/2025-05-22-Maze Generator 02/img01.gif)  
  

Kruskal's 알고리즘 미로
  
![img02](/assets/images/posts/one-pan/JavaScript/2025-05-22-Maze Generator 02/img02.gif)  
  
> #### 반성  
---  
  
미로 그려지는게 예쁘다.  
가만히 보고 있으면 기분이 좋아진다.  
  
> #### 코드 확인   
---  
  
<a href="{{ '/play/Maze Generator.html' | relative_url }}" target="_blank" rel="noopener noreferrer">
  직접 해보기
</a>
  
Prim's  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-22-Prim.js)  
  
Kruskal's  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-22-Kruskal.js)  
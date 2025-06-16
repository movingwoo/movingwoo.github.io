---
title: "미로 생성기 01"
description: "JAVASCRIPT 미로 생성기 프로그램 개발"
date: "2025-05-21 08:00:00 +0900"
last_modified_at: "2025-05-21 08:00:00 +0900"
categories: 
  - one-pan/JavaScript/
tags: [JAVASCRIPT, CANVAS, 미로 생성기, 알고리즘, DFS]
author: movingwoo
---
> #### 개요  
---  

이전에 DFS 공부한걸 찾아서 미로 만드는데 써봄.  
캔버스로 미로를 자동으로 그리고 추가로 미로를 만들 수 있는 다른 알고리즘도 써보기로 함.  
  
> #### 구현  
---  
  
##### 1. 설계  
  
미로 생성할 수 있는 대표 알고리즘 7종에 대하여 찾아보았다.  
  
| 알고리즘 | 스타일 | 특징 | 용도 |
|:------|:-----|:-----|:------|
| DFS | 꼬불꼬불한 한 줄기 통로, 가지치기 많음 | 재귀 기반, 한 방향으로 깊게 파고들며 되돌아오며 생성 | 일반적인 퍼즐형 미로 |
| Prim's | 불규칙한 가지 형태, 길이 자연스럽게 분산 | Queue 또는 set을 이용, 인접 벽 중 하나씩 랜덤 제거 | 일반적인 퍼즐형 미로 |
| Kruskal's | 큰 방, 높은 통로 복잡도 | Union find 기반, 모든 칸을 연결하되 사이클 제거 | 랜덤하고 복잡한 퍼즐 미로 |
| Binary Tree | 매우 단순하며 위 또는 오른쪽만 뚫음 | 단순하기에 성능이 좋지만 구조가 예측 가능 | 빠른 생성, 규칙적 패턴 |
| Sidewinder | 줄 단위, 수평 위주 통로 | 행 단위로 생성, 각 줄마다 위로 하나 연결하며 수평으로 길어짐 | 빠른 렌더링, 제한된 방향성 |
| Recursive Division | 벽 많은 구조, 사각형 영역 | 전체를 벽으로 채우고 구멍을 뚫어 나눔, 방처럼 보이는 구조 | 방 구성, 던전 형태 |
| Eller's | 일정한 패턴, 세로로 잘 연결됨 | 행 단위로 생성하며 집합 유지, 메모리 효율적 | 모바일, 웹에서 실시간 생성 |
  
목표는 7종 알고리즘을 전부 시뮬레이션해보는 것인데 우선은 DFS만 시뮬레이션 해본다.  
한 html 파일에 몰아넣으면 보기 힘들어지므로, html 파일에는 뼈대와 공통함수만 몰아두고 DFS는 js로 별도 생성한다.  
이후 알고리즘 추가 시 js만 추가해서 바로 사용할 수 있도록 한다.
  
##### 2. 뼈대 작성  
  
Generate 버튼 클릭 시 미로를 생성하는 과정을 애니메이션으로 보여준다.  
그리고 입구부터 출구까지의 경로를 빨간색으로 표시한다.  
그러기 위한 공통변수와 함수를 이곳에 작성.  
  
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Maze Generator</title>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #f2f2f2;
      margin: 0;
      padding: 20px;
    }
    button {
      padding: 8px 16px;
      margin-bottom: 10px;
    }
    #canvas {
      border: 2px solid #333;
    }
  </style>
</head>
<body>

  <!-- DFS 기반 미로 버튼 -->
  <button onclick="startDFS()">DFS Generate</button>
  <!-- 이후 버튼 추가 -->

  <!-- 미로 캔버스 -->
  <canvas id="canvas" width="1020" height="620"></canvas>

  <script>
    // 공통 변수와 함수
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    const size = 20;
    const cols = canvas.width / size;
    const rows = canvas.height / size;

    // 미로 상태
    let maze = [];
    let visited = new Set(); // 방문한 셀 저장용
    let entrance = [0, 0]; // 입구
    let exit = [cols - 2, rows - 2]; // 출구(정의만 해두고 실제 출구는 나중에)

    // 시간 지연 함수 (애니메이션용)
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 셀 색칠
    function drawCell(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x * size, y * size, size, size);
    }

    // 미로 초기화
    function initMaze() {
      maze = Array.from({ length: rows }, () => Array(cols).fill(1)); // 전부 벽
      visited.clear();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 캔버스 전체를 벽으로 색칠
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          drawCell(x, y, 'black');
        }
      }
    }

    initMaze();
  </script>

  <!-- DFS 미로 스크립트 -->
  <script src="./js/DFS.js"></script>

</body>
</html>
```
  
##### 3. DFS 스크립트 작성  
  
DFS 미로 생성하고 길 찾는 부분은 BFS로 구현.  
  
```javascript
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
  
// 가장 멀리 떨어진 셀을 출구로 지정(BFS)
function findFurthestCell(sx, sy) {
  const que = [[sx, sy, 0]];
  const visited = new Set();
  let maxDist = -1;
  let furthest = [sx, sy];

  while (que.length) {
    const [x, y, dist] = que.shift();
    const key = `${x},${y}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    if (dist > maxDist) {
      maxDist = dist;
      furthest = [x, y];
    }

    for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
        que.push([nx, ny, dist + 1]);
      }
    }
  }

  return furthest;
}
  
  // 탈출 경로 찾기(BFS)
function findPathBFS(sx, sy, ex, ey) {
  const que = [[sx, sy]];
  const visited = new Set();
  const parent = {};

  while (que.length) {
    const [x, y] = que.shift();

    if (x === ex && y === ey) {
      break;
    }
    const key = `${x},${y}`;

    visited.add(key);

    for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nx = x + dx, ny = y + dy;
      const nextKey = `${nx},${ny}`;

      // 벽이 아니고 방문하지 않은 길
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0 && !visited.has(nextKey)) {
        que.push([nx, ny]);
        visited.add(nextKey);
        parent[nextKey] = key;
      }
    }
  }

  // 출구에서 역으로 경로 추적
  const path = [];
  let curr = `${ex},${ey}`;

  while (curr !== `${sx},${sy}`) {
    const [x, y] = curr.split(',').map(Number);
    path.push([x, y]);
    curr = parent[curr];
  }

  path.push([sx, sy]);

  return path.reverse();
}
  
// 미로 탈출 경로 그리기
async function drawPathAnimated(path) {
  for (let [x, y] of path) {
    if ((x === entrance[0] && y === entrance[1]) || (x === exit[0] && y === exit[1])) {
      continue;
    }

    // 빨강으로 색칠
    drawCell(x, y, 'red');
    await sleep(10);
  }
}
  
// 전체 실행 
async function startDFS() {
  initMaze(); 
  await generateDFS();

  // 입구 표시
  drawCell(entrance[0], entrance[1], 'lime');
  const [ex, ey] = findFurthestCell(entrance[0], entrance[1])
  exit = [ex, ey];
  // 출구 표시
  drawCell(exit[0], exit[1], 'blue')
  
  const path = findPathBFS(entrance[0], entrance[1], exit[0], exit[1]);
  await drawPathAnimated(path);
}
```
  
> #### 완성  
---  
  
![img01](/assets/images/posts/one-pan/JavaScript/2025-05-21-Maze Generator 01/img01.gif)  
  
> #### 반성  
---  
  
async와 await에 대해 새롭게 배웠다.  
Promise 체인보다 코드가 엄청나게 깔끔해진다.  
좋아좋아 오늘도 하나 배웠어 일일신우일신  
  
> #### 코드 확인   
---  
  
<a href="{{ '/play/Maze Generator.html' | relative_url }}" target="_blank" rel="noopener noreferrer">
  직접 해보기
</a>
  
HTML  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-21-Maze%20Generator%2001.html)  
  
JavaScript  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-21-DFS.js)  
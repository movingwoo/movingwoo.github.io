---
title: "던전 생성기 01"
date: "2025-05-27 11:00:00 +0900"
last_modified_at: "2025-05-27 11:00:00 +0900"
categories: 
  - one-pan/JavaScript/
author: movingwoo
---
> #### 개요  
---  

신나는 던전 맵 생성기  
5종 알고리즘과 함께  
  
> #### 구현  
---  
  
##### 1. 설계  
  
던전 맵 생성 관련 대표 알고리즘에 대해 찾아보았다.  
  
| 알고리즘                       | 스타일              | 특징                      | 용도                     |
| :---------------------------- | :----------------- | :----------------------- | :---------------------- |
| BSP (Binary Space Partitioning) | 직사각형 방 + 복도 | 공간을 재귀적으로 분할, 각 방을 연결 | 방 중심의 던전, 구조적 배치 |
| Random Walk (Drunkard’s Walk) | 유기적 경로, 비정형 | 무작위 방향 이동, 비선형 구조 | 자연 동굴, 탐험 중심 던전 |
| Cellular Automata | 자연 동굴 형태, 굴곡 많음 | 셀 규칙 반복으로 패턴 정제 | 동굴 스타일 던전, 유기적 형태 |
| Delaunay Triangulation + MST | 방 중심 + 경로 연결 | 무작위 방 > 삼각분할 > 최소 연결 | 모든 방 연결 보장, 전략적 맵 |
| Wave Function Collapse (WFC) | 타일 기반, 정교한 제약 | 타일 제약 기반 패턴 구성 | 정교한 던전, 룰 기반 구조 |
  
맵을 그릴 캔버스가 있는 html은 이전 미로 생성기의 것을 그대로 가져와서 사용한다.  
  
##### 2. BSP 알고리즘  
  
BSP 알고리즘을 공간을 재귀적으로 분할한다.  
분할 과정이 이진트리 형태로 표현되며 방 설정을 통해 크기와 개수를 쉽게 조절 가능하다.  
통로는 각 방의 중심을 직선 또는 L자로 적당히 연결한다.  
  
방이 완전히 랜덤한 위치에 생성되기 때문에 방의 중심을 연결하는 통로의 특성 상  
{% include colored_text.html color="orange" text="**통로가 겹치기도 하고 두껍게 이어지기도 한다.**" %}  
  
또 현재 입구 생성을 [0, 0]에서 가장 가까운 셀로 해두었는데  
랜덤하게 생성되어 이어지는 구조 특성 상 통로가 가장 가까운 경우 통로에 입구가 생길 수도 있다.  
강제로 가까운 셀을 껴서 생성시키기에는 BSP의 취지에 맞지 않은 것 같고  
방과 통로를 구분할 수 있게 방 데이터를 가져오려면 공통함수로 쓰기 애매하다.  
그냥 복도에 입구가 생기면 운이 나쁜걸로...  
  
```javascript
// 방 클래스 정의
class Room {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  // 방의 중심 좌표
  center() {
    return [
      Math.floor(this.x + this.w / 2),
      Math.floor(this.y + this.h / 2)
    ];
  }

  // 다른 방과 겹치는지 판정
  intersects(other) {
    return (
      this.x < other.x + other.w &&
      this.x + this.w > other.x &&
      this.y < other.y + other.h &&
      this.y + this.h > other.y
    );
  }
}
  
async function startBSP() {

  const MIN_SIZE = 4; // 방 최소 크기
  const MAX_SIZE = 6; // 방 최대 크기
  const partitions = [{ x: 0, y: 0, w: cols, h: rows }];
  const rooms = []; // 생성된 방 목록

  // 공간을 재귀적으로 분할
  async function splitSpace(space) {
    const { x, y, w, h } = space;
    const horizontal = Math.random() < 0.5; // 분할 방향 랜덤(수평/수직)

    // 더 이상 분할이 불가능할 때(최소 크기 이하)
    if ((horizontal && h <= 2 * MIN_SIZE) || (!horizontal && w <= 2 * MIN_SIZE)) {
      // 방 생성 시도 (겹쳐서 실패할 경우 10회까지 재시도)
      let tryCount = 0;
      let room;
      let overlapped;
      do {
        if (w - 2 < MIN_SIZE || h - 2 < MIN_SIZE) break; // 공간이 너무 작으면 중단

        // 방 크기 랜덤 (MIN_SIZE~MAX_SIZE), 위치도 랜덤(테두리와 1칸 이상 띄움)
        const rw = Math.min(
          Math.floor(Math.random() * (w - 2 - MIN_SIZE + 1)) + MIN_SIZE,
          MAX_SIZE
        );
        const rh = Math.min(
          Math.floor(Math.random() * (h - 2 - MIN_SIZE + 1)) + MIN_SIZE,
          MAX_SIZE
        );
        const rx = Math.floor(Math.random() * (w - 2 - rw + 1)) + x + 1;
        const ry = Math.floor(Math.random() * (h - 2 - rh + 1)) + y + 1;
        room = new Room(rx, ry, rw, rh);
        overlapped = rooms.some(r => room.intersects(r));
        tryCount++;
      } while (overlapped && tryCount < 10);

      // 겹치지 않는 방만 생성
      if (!overlapped && room) {
        rooms.push(room);
        // 방 내부를 흰색칠
        for (let i = room.y; i < room.y + room.h; i++) {
          for (let j = room.x; j < room.x + room.w; j++) {
            map[i][j] = 0;
            drawCell(j, i, 'white');
            await sleep(1);
          }
        }
      }
      return;
    }

    // 분할: 수평 또는 수직으로 영역을 나눔
    if (horizontal) {
      // 수평 분할
      const split = Math.floor(Math.random() * (h - MIN_SIZE * 2) + MIN_SIZE);
      const top = { x, y, w, h: split };
      const bottom = { x, y: y + split, w, h: h - split };
      await splitSpace(top);
      await splitSpace(bottom);
    } else {
      // 수직 분할
      const split = Math.floor(Math.random() * (w - MIN_SIZE * 2) + MIN_SIZE);
      const left = { x, y, w: split, h };
      const right = { x: x + split, y, w: w - split, h };
      await splitSpace(left);
      await splitSpace(right);
    }
  }

  // 터널 뚫는 함수
  async function tunneling(x1, y1, x2, y2) {
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    // x축 방향으로 먼저 이동
    while (x1 !== x2) {
      map[y1][x1] = 0;
      drawCell(x1, y1, 'white');
      x1 += dx;
      await sleep(1);
    }
    // y축 방향으로 이동
    while (y1 !== y2) {
      map[y1][x1] = 0;
      drawCell(x1, y1, 'white');
      y1 += dy;
      await sleep(1);
    }
  }

  await splitSpace(partitions[0]);

  // 생성된 방들의 중심을 순서대로 복도로 연결
  for (let i = 1; i < rooms.length; i++) {
    const [x1, y1] = rooms[i - 1].center();
    const [x2, y2] = rooms[i].center();

    if (Math.random() < 0.5) {
      await tunneling(x1, y1, x2, y1);
      await tunneling(x2, y1, x2, y2);
    } else {
      await tunneling(x1, y1, x1, y2);
      await tunneling(x1, y2, x2, y2);
    }
  }

  // 입출구 생성
  generateEntrance();
}
```
  
##### 3. Random Walk 알고리즘  
  
굉장히 간단한 알고리즘이다.  
이름에서 볼 수 있듯 방향을 랜덤으로 움직이며 길을 채우고  
정해둔 만큼 맵을 채우면 종료한다.  
  
통로나 방이 곡선형으로 잘 생성되는데 랜덤으로 여기저기 쑤시다보니  
통로가 너무 좁을 수 있고 전체적인 구조를 제어하기 힙들다.  
  
```javascript
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
```
  
##### 4. Cellular Automata 알고리즘
  
{% include colored_text.html color="orange" text="**셀의 상태를 바탕으로 다음 상태를 결정해 갱신**" %}하는 알고리즘이다.  
  
규칙은 어떻게 정하느냐에 따라 다르겠지마는  
초기에 랜덤하게 벽을 뚫어두고 4번에 거쳐 다듬어나간다.  
규칙은 아래와 같이 정했다.  
- 현재 셀이 벽인데 주변 벽이 4개 이상이면 벽 유지, 그렇지 않으면 통로로 변경
- 현재 셀이 통로인데 주변 벽이 5개 이상이변 벽으로 변경, 그렇지 않으면 통로 유지
  
위 과정을 거쳐 자연스러운 동굴 형태의 맵이 완성된다.  
엄격한 규칙을 기반으로 다듬어나가기 때문에 뭔가 틀에 박힌 BSP와 자유롭게 칠렐레 팔렐레 뻗은 Random Walk보다 보기 좋다.  
  
이 알고리즘도 고립된 공간이 생길 수 있는데 이는 추가적인 알고리즘을 통해 고립된 방과 통로로 연결하거나 제거하면 된다.  
하지만 이번 구현에서 그 부분은 패스.  
  
```javascript
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
```
  
> #### 완성  
---  
  
BSP  
![img01](/assets/images/posts/one-pan/JavaScript/2025-05-27-Dungeon Generator 01/img01.gif)  
  
Random Walk  
![img02](/assets/images/posts/one-pan/JavaScript/2025-05-27-Dungeon Generator 01/img02.gif)  
  
Cellular Automata  
![img03](/assets/images/posts/one-pan/JavaScript/2025-05-27-Dungeon Generator 01/img03.gif)  
  
> #### 반성  
---  
  
Random Walk 알고리즘과 Cellular Automata 알고리즘을 구현하며 즐거워졌다.  
오래된 피쳐폰게임의 작은 미니맵을 보는 기분이다.  
아 마음이 충만해진다...  
  
> #### 코드 확인   
---  
  
<a href="{{ '/play/Dungeon Generator.html' | relative_url }}" target="_blank" rel="noopener noreferrer">
  직접 해보기
</a>
  
BSP  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-27-BSP.js)  
  
Random Walk  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-27-RandomWalk.js)  
  
Cellular Automata  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-27-CellularAutomata.js)  
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
  
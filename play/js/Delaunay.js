// 점 클래스
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}

// 간선 클래스
class Edge {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.weight = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        );
    }
}

// 삼각형 클래스
class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    // 외접원의 중심과 반지름 계산
    circumcircle() {
        const d = 2 * (this.p1.x * (this.p2.y - this.p3.y) + 
                      this.p2.x * (this.p3.y - this.p1.y) + 
                      this.p3.x * (this.p1.y - this.p2.y));
        const ux = ((this.p1.x * this.p1.x + this.p1.y * this.p1.y) * (this.p2.y - this.p3.y) +
                   (this.p2.x * this.p2.x + this.p2.y * this.p2.y) * (this.p3.y - this.p1.y) +
                   (this.p3.x * this.p3.x + this.p3.y * this.p3.y) * (this.p1.y - this.p2.y)) / d;
        const uy = ((this.p1.x * this.p1.x + this.p1.y * this.p1.y) * (this.p3.x - this.p2.x) +
                   (this.p2.x * this.p2.x + this.p2.y * this.p2.y) * (this.p1.x - this.p3.x) +
                   (this.p3.x * this.p3.x + this.p3.y * this.p3.y) * (this.p2.x - this.p1.x)) / d;
        const center = new Point(ux, uy);
        const radius = Math.sqrt(
            Math.pow(this.p1.x - center.x, 2) + Math.pow(this.p1.y - center.y, 2)
        );
        return { center, radius };
    }

    // 점이 외접원 내부에 있는지 확인
    containsPoint(p) {
        const { center, radius } = this.circumcircle();
        const distance = Math.sqrt(
            Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2)
        );
        return distance < radius;
    }
}

async function startDelaunay() {
    initMap();
    
    // 랜덤 점 생성 (방의 중심점)
    const points = [];
    const numPoints = 20; // 방의 개수
    const roomSize = 2; // 방 크기
    const margin = 2; // 방 사이의 최소 간격
    
    // 방이 겹치는지 확인
    function isOverlapping(x, y, size) {
        for (let dy = -size - margin; dy <= size + margin; dy++) {
            for (let dx = -size - margin; dx <= size + margin; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && map[ny][nx] === 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 안전한 위치 찾기
    function findSafePosition() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            x = Math.floor(Math.random() * (cols - 2 * roomSize)) + roomSize;
            y = Math.floor(Math.random() * (rows - 2 * roomSize)) + roomSize;
            attempts++;
        } while (isOverlapping(x, y, roomSize) && attempts < maxAttempts);
        
        return attempts < maxAttempts ? {x, y} : null;
    }
    
    // 방 생성
    for (let i = 0; i < numPoints; i++) {
        const pos = findSafePosition();
        if (!pos) continue; // 안전한 위치를 찾지 못하면 건너뛰기
        
        points.push(new Point(pos.x, pos.y));
        
        // 방 생성
        for (let dy = -roomSize; dy <= roomSize; dy++) {
            for (let dx = -roomSize; dx <= roomSize; dx++) {
                const nx = pos.x + dx;
                const ny = pos.y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    map[ny][nx] = 0;
                    drawCell(nx, ny, 'white');
                }
            }
        }
        await sleep(50);
    }
    
    const triangles = delaunayTriangulation(points);
    
    // 간선 추출
    const edges = new Set();
    for (const triangle of triangles) {
        edges.add(new Edge(triangle.p1, triangle.p2));
        edges.add(new Edge(triangle.p2, triangle.p3));
        edges.add(new Edge(triangle.p3, triangle.p1));
    }
    
    const mstEdges = kruskalMST(Array.from(edges));
    
    // MST 간선을 따라 통로 생성
    for (const edge of mstEdges) {
        await createCorridor(edge.p1, edge.p2);
    }
    
    generateEntrance();
}

// Delaunay Triangulation 알고리즘
function delaunayTriangulation(points) {
    const triangles = [];
    
    // 슈퍼 삼각형 생성 (모든 점을 포함하는 큰 삼각형)
    // 초기 삼각형이 필요해 생성하며 나중에 제거함
    const superTriangle = new Triangle(
        new Point(-100, -100),
        new Point(100, -100),
        new Point(0, 100)
    );
    triangles.push(superTriangle);
    
    for (const point of points) {
        const badTriangles = [];
        
        // 현재 점을 포함하는 삼각형 찾기
        for (const triangle of triangles) {
            if (triangle.containsPoint(point)) {
                badTriangles.push(triangle);
            }
        }
        
        // 나쁜 삼각형들의 간선 찾기
        // 나쁜 삼각형은 너무 뾰족하거나 한 꼭지점에 너무 몰려 있는 못난 삼각형
        const edges = new Set();
        for (const triangle of badTriangles) {
            edges.add(new Edge(triangle.p1, triangle.p2));
            edges.add(new Edge(triangle.p2, triangle.p3));
            edges.add(new Edge(triangle.p3, triangle.p1));
        }
        
        // 나쁜 삼각형 제거
        for (const triangle of badTriangles) {
            const index = triangles.indexOf(triangle);
            if (index > -1) {
                triangles.splice(index, 1);
            }
        }
        
        // 새로운 삼각형 생성
        for (const edge of edges) {
            triangles.push(new Triangle(edge.p1, edge.p2, point));
        }
    }
    
    // 슈퍼 삼각형과 관련된 삼각형 제거
    return triangles.filter(triangle => 
        !triangle.p1.equals(superTriangle.p1) &&
        !triangle.p1.equals(superTriangle.p2) &&
        !triangle.p1.equals(superTriangle.p3) &&
        !triangle.p2.equals(superTriangle.p1) &&
        !triangle.p2.equals(superTriangle.p2) &&
        !triangle.p2.equals(superTriangle.p3) &&
        !triangle.p3.equals(superTriangle.p1) &&
        !triangle.p3.equals(superTriangle.p2) &&
        !triangle.p3.equals(superTriangle.p3)
    );
}

// Kruskal's MST 알고리즘
function kruskalMST(edges) {
    // 간선을 가중치 순으로 정렬
    edges.sort((a, b) => a.weight - b.weight);
    
    const mst = [];
    const sets = new Map();
    
    // 각 점을 독립적인 집합으로 초기화
    for (const edge of edges) {
        if (!sets.has(edge.p1)) sets.set(edge.p1, new Set([edge.p1]));
        if (!sets.has(edge.p2)) sets.set(edge.p2, new Set([edge.p2]));
    }
    
    // 사이클을 형성하지 않는 간선만 선택
    for (const edge of edges) {
        const set1 = sets.get(edge.p1);
        const set2 = sets.get(edge.p2);
        
        if (set1 !== set2) {
            mst.push(edge);
            
            // 두 집합 합치기
            const union = new Set();
            for (const p of set1) union.add(p);
            for (const p of set2) union.add(p);

            for (const point of union) {
                sets.set(point, union);  // 각 포인트가 새로운 union 집합을 참조하도록 갱신
            }
        }
    }
    
    return mst;
}

// 두 점 사이의 통로 생성
async function createCorridor(p1, p2) {
    const dx = Math.sign(p2.x - p1.x);
    const dy = Math.sign(p2.y - p1.y);
    
    let x = p1.x;
    let y = p1.y;
    
    // x축 방향으로 먼저 이동
    while (x !== p2.x) {
        map[y][x] = 0;
        drawCell(x, y, 'white');
        x += dx;
        await sleep(1);
    }
    
    // y축 방향으로 이동
    while (y !== p2.y) {
        map[y][x] = 0;
        drawCell(x, y, 'white');
        y += dy;
        await sleep(1);
    }
}

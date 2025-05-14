---
title: "플래피 버드"
date: "2025-05-14 07:00:00 +0900"
last_modified_at: "2025-05-14 07:00:00 +0900"
categories: 
  - one-pan/JavaScript/
author: movingwoo
---
> #### 개요  
---  

캔버스로 웹 게임 하나 만들어보기  
  
마우스 클릭 조작만 이용하고 싶기에 고심끝에 {% include colored_text.html color="orange" text="**Flappy Bird**" %}를 구현해보기로 한다.  
그런데 이 게임 한국어로 뭐라고 하지? 그냥 플래피 버드라고 하면 되나?  
  
> #### 구현  
---  
  
##### 1. 설계  
  
필요한 기능을 정리해보자.  
- 마우스 클릭 시 점프  
- 천장, 지면, 장애물 충돌 판정  
- 장애물 높이 랜덤 생성 및 시간이 지날수록 속도 증가  
- 점수 시스템  
  
이를 바탕으로 코드 작성 순서를 정한다.  
- HTML + CANVAS 세팅  
- 새를 그려서 점프와 중력 구현
- 장애물 구현  
- 충돌 판정 구현  
- 점수 등 기타 기능 구현  
  
##### 2. HTML + CANVAS 세팅  
  
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>Flappy Bird</title>
  <style>
    body {
      margin: 0;
      background-color: #FFFFFF;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    canvas {
      border: 2px solid #000;
      background-color: #cceeff;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="640" height="480"></canvas>

  <script>
    const canvas = document.querySelector('#gameCanvas');
    const ctx = canvas.getContext('2d');

    // 이하 코드 작성
  </script>
</body>
</html>
```
  
##### 3. 새를 그려서 점프와 중력 구현  

새라고 하긴 했지만... 일단 동그라미를 그려놓고 새라고 우기자.  
처음에 공중에서 시작했다가 중력을 받아 아래로 떨어진다.  
그리고 클릭하면 공중으로 튀어오른다.  
얼마나 빠르게 떨어지고 민감하게 튀어오를지는 다 만들고 조절하기로 함.
  
```javascript
// 새
const bird = {
  // 중력과 점프력을 추후 조정
  x: 150,
  y: 240,
  radius: 20,
  velocity: 0,
  gravity: 0.5,
  jump: -8
};

let animationFrameId;

canvas.addEventListener('click', () => {
  // 속도에 점프력을 더해 점프
  bird.velocity = bird.jump;
});

// 게임 루프
function run() {
  // 물리 계산
  // 속도는 중력만큼 추가, 속도만큼 y축 조절
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // 화면 지우기
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 새 그리기
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc00';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();

  // 천장 바닥 제한
  if (bird.y + bird.radius > canvas.height) {
    bird.y = canvas.height - bird.radius;
    bird.velocity = 0;
  }
  if (bird.y - bird.radius < 0) {
    bird.y = bird.radius;
    bird.velocity = 0;
  }

  animationFrameId = requestAnimationFrame(run);
}

// 게임 시작
run();
```
  
##### 4. 장애물 구현  
  
오른쪽에서 왼쪽으로 위/아래 배치된 장애물이 다가온다.  
점프를 통해 장애물을 피하는게 목적인 게임이다.  
장애물 위와 아래의 간격(피할 구멍)은 같아야하며, 장애물 크기는 랜덤으로 생성한다.  
  
```javascript
// 장애물은 계속 추가, 제거되기 때문에 새처럼 고정객체로 설정하면 안되고 배열로 설정
// 장애물 너비와 속도 등 추후 조정
const pipeWidth = 20;
const pipeGap = 180; // 위 아래 간격
const pipeSpeed = 5;
const pipeInterval = 90; // 다음 장애물 간격
let frameCount = 0;
let pipes = [];

// 장애물 추가
function addPipe() {
  // 장애물의 최소 높이를 지정 후 나머지 계산
  const minPipeHeight = 50;
  const maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
  const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

  pipes.push({
    x: canvas.width,
    topHeight: topPipeHeight,
    bottomY: topPipeHeight + pipeGap
  });
}

// 장애물 그리기
function drawPipes() {
  ctx.fillStyle = '#228B22';

  for (let pipe of pipes) {
    // 위쪽 장애물
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

    // 아래쪽 장애물
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
  }
}

// 장애물 갱신
function updatePipes() {
  for (let pipe of pipes) {
    // 장애물 속도에 따라 x축 조절
    pipe.x -= pipeSpeed;
  }

  // 화면 밖으로 나간 장애물 제거
  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}
```
  
##### 5. 충돌 판정 구현  
  
새와 장애물이 충돌했을 때 게임오버가 되어야한다.  
장애물 뿐만 아니라 천장이나 바닥에 닿아도 게임오버다.  
  
신나는 수학시간~~  
원과 직사각형 충돌 판정 공식이 존재하므로 사용한다.    
  
```javascript
// 새와 파이프 사이 가장 가까운 점
// 값을 최소값 최대값 사이로 제한
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// 점이 원 안에 들어있는지 확인
// 거리공식 활용 (루트 연산은 성능 떨어져서 굳이 쓸 필요 없음)
function circleCollides(cx, cy, cr, px, py) {
  const dx = cx - px;
  const dy = cy - py;
  return dx * dx + dy * dy <= cr * cr;
}
```
  
공식을 이용해 충돌 여부를 판단하고 충돌 판정 시 게임오버 시킨다.  
천장이나 바닥은 그냥 좌표확인만 하면 끝난다.  

```javascript
// 천장 바닥 충돌 체크
if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
  gameOver();
  return;
}

// 장애물 충돌 체크
for (let pipe of pipes) {
  // 장애물 x축 범위 내 새와 가장 가까운 x 좌표
  const closestX = clamp(bird.x, pipe.x, pipe.x + pipeWidth);

  // 위 장애물과 새의 y좌표 비교
  const topY = clamp(bird.y, 0, pipe.topHeight);

  // 충돌하는지 확인
  if (circleCollides(bird.x, bird.y, bird.radius, closestX, topY)) {
      gameOver();
      return;
  }

  // 아래 장애물과 새의 y좌표 비교
  const bottomY = clamp(bird.y, pipe.bottomY, canvas.height);

  // 충돌하는지 확인
  if (circleCollides(bird.x, bird.y, bird.radius, closestX, bottomY)) {
      gameOver();
      return;
  }
}

// 게임오버
function gameOver() {
  cancelAnimationFrame(animationFrameId);
  ctx.fillStyle = 'red';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
}
```
  
##### 6. 점수 등 기타 기능 구현  
  
장애물 하나를 넘을 때 마다 1점으로 판단한다.  
그리고 시간이 지날수록 속도를 좀 더 빠르게 해서 게임오버를 유도한다.  
  
```javascript
// 점수 판정은 새보다 왼쪽으로 지나간 장애물의 수를 세면 됨
// 장애물 생성 시 점수 판정용 변수를 추가
pipes.push({
  x: canvas.width,
  topHeight: topPipeHeight,
  bottomY: topPipeHeight + pipeGap, 
  scored: false // 점수 판정
});

// 점수 계산
for (let pipe of pipes) {
  // 점수가 매겨지지 않고 새보다 왼쪽에 있는 장애물에 대하여 점수 추가
  if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
    score++;
    pipe.scored = true;
  }
}

// 점수 그리기
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '32px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 20, 40);
}
```  
  
시간이 지날수록 속도 추가는 단순하게 장애물 속도를 계속 늘려가면 된다.  
난이도 곡선을 생각하면 여러 방법이 있을텐데  
- 매 초 속도 추가
- 특정 점수를 넘을 때마다 속도 추가
- 시간이 지날수록 증가하는 속도에 가중치 부여  
등등 고민하다가 10점마다 속도를 증가시키고, 매 증가마다 늘어나는 속도에 가중치를 부여하기로 결정했다.  
  
```javascript
// const 변수를 let으로 바꿔주기
// 장애물 속도 증가 (10점 당 증가하며 초기 속도 5 반영)
pipeSpeed = Math.floor(score / 10) + 5;
```
  
##### 7. 빼먹은 것들  
  
시작하자마자 새가 낙하해서 게임오버 당하는 불상사를 방지하기 위해 start 버튼 선택 시 시작하도록 한다.  
마찬가지로 끝나면 retry 버튼을 추가해 다시 플레이할 수 있도록 한다.  
막상 테스트 해보니 마우스로만 하기 번거로워서 스페이스 입력도 받도록 한다.  
  
```javascript
// 스페이스바 입력
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault(); // 스크롤 방지
    bird.velocity = bird.jump;
  }
});

// start, retry 버튼에 대한 이벤트
// start 버튼 이벤트
document.querySelector('#startBtn').addEventListener('click', () => {
  isPlaying = true;
  resetGame(); // 게임 초기화
  run(); // 게임 시작
  document.querySelector('#startBtn').style.display = 'none';
});

// retry 버튼 이벤트
document.querySelector('#retryBtn').addEventListener('click', () => {
  isPlaying = true;
  resetGame(); // 게임 초기화
  run(); // 게임 시작
  document.querySelector('#retryBtn').style.display = 'none';
});
```  
  
> #### 완성  
---  
  
플레이해보며 난이도를 좀 조절했다.  
  
![img01](/assets/images/posts/one-pan/JavaScript/2025-05-14-Flappy Bird/img01.gif)  
  
> #### 반성  
---  
  
{% include colored_text.html color="orange" text="**난이도 조절의 어려움**" %}  
요 단순한 딸깍 게임 만드는데도 난이도 조정에 많은 고민을 하게 된다.  
심지어 내가 생각하기에 장애물 속도만큼 새의 속도도 고려하는게 밸런스 상 맞지 않나 싶은데...  
갓겜 제작자들은 얼마나 많은 고민을 통해 난이도를 정하게 되었을까?  
  
{% include colored_text.html color="orange" text="**움직이는 배경**" %}  
만약 배경에 구름같은 무늬라도 띄어두고 배경을 장애물 속도에 맞춰 스크롤했으면 더 생동감이 생겼을거다.  
바닥이나 천장도 민짜가 아니라 오돌토돌하게 표시해두고 스크롤하면 엄청난 속도감을 느낄 수 있겠지...  
  
{% include colored_text.html color="orange" text="**스터터링?**" %}  
장애물이 렉걸리는 것 같은데 프레임 기반 이동을 해서 그렇다.  
시간 기반 이동을 사용하면 프레임이 약간 밀려도 부드럽게 보정된다.  
다음 캔버스 게임 만들때는 프레임도 신경쓰면서 만들어봐야겠다.  
  
{% include colored_text.html color="orange" text="**querySelector와 getElementById**" %}  
아무 생각없이 querySelector로 id 요소를 찾아오고 있는데  
역시 css 선택자를 사용하는 querySelector보다 getElementById가 빠르다고 한다.  
그래도 밀리세컨드 단위로 신경 쓸 필요는 없다고...  
  
지금처럼 id 몇개 찾아올때는 getElementById를 써도 될 것 같고  
class도 늘어나고 복잡해지는 경우에는 querySelector를 통해 코드에 통일성을 주는게 좋을 것 같다.  
  
그리고 예전 jquery 쓸때는 js 코드가 지저분해서 쓰는거였는데  
예쁜 querySelector를 안쓸 이유는 또 없잖아?  
계속 쓸거야.  
  
> #### 코드 확인   
---  
  
<a href="{{ '/play/Flappy Bird.html' | relative_url }}" target="_blank" rel="noopener noreferrer">
  직접 해보기
</a>
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-14-Flappy%20Bird.html)


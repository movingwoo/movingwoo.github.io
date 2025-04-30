---
title: "지뢰찾기"
date: "2025-04-30 07:00:00 +0900"
last_modified_at: "2025-04-30 07:00:00 +0900"
categories: 
  - one-pan/JavaScript/
author: movingwoo
---
> #### 탄생 비화  
---  

{% include colored_text.html color="orange" text="**바닐라 JS 재활훈련삼아 투닥투닥 두들겨 봄**" %}  
재활훈련을 마치면 canvas를 이용해 뭐라도 만들어 볼 요량
  
> #### 구현 포인트  
---  

##### 1. 지뢰판 뿌리기  
  
처음에는 그리드로 대충 만들어 뿌렸는데  
뿌려놓고 css가 변경될 경우 리드로우가 일어난다고 한다.  
그래서 DOM을 직접 컨트롤하는건 권장하지 않는다고  
지뢰찾기 몇 칸 넣는데 영향은 없겠지만 연습삼아 fragment를 사용해본다.  

그리고 옛날사람처럼 굴지말고 템플릿 리터럴을 활용하면 더 깔끔해진다.
  
```javascript
// 스타일 설정
mainArea.style.width = '800px';
mainArea.style.display = 'grid';
// 템플릿 리터럴을 사용하지 않으면 보기 지저분하게 + 해가며 써야함
// mainArea.style.gridTemplateColumns = 'repeat(' + col + ', 1fr)';
// mainArea.style.gridTemplateColumns = 'repeat(' + row + ', 1fr)';
mainArea.style.gridTemplateColumns = `repeat(${col}, 1fr)`;
mainArea.style.gridTemplateRows = `repeat(${row}, 1fr)`;
mainArea.style.gap = '1px'; 
			
// fragment 생성
const divFragment = document.createDocumentFragment();

for (let i = 0; i < col * row; i++) {
  const newDiv = document.createElement('div');
  const currentRow = Math.floor(i / col) + 1;
  const currentCol = (i % col) + 1;
  
  // 각 div에는 col과 row로 이루어진 고유 값을 id로 설정한다.
  // col과 row로 고유 id 설정
  newDiv.id = `${currentRow} ${currentCol}`;
  
  // 스타일 설정
  newDiv.style.aspectRatio = '1 / 1';
  newDiv.style.border = '1px solid black';
  newDiv.style.padding = '1px';
  newDiv.style.display = 'flex';
  newDiv.style.alignItems = 'center';
  newDiv.style.justifyContent = 'center';
  newDiv.style.background = 'gray'

  // fragment에 추가
  divFragment.appendChild(newDiv);
}

// DOM에 추가
mainArea.appendChild(divFragment);
```
  
##### 2. 클릭 감지  

좌클릭 우클릭은 간단하지만 지뢰찾기는 동시클릭 시 주변에 지뢰가 있을 가능성이 있는 타일을 표시해준다.  
따라서 동시클릭을 인식하도록 해야한다.  
마우스 좌우를 한 치 오차없이 누르는 건 불가능하기 때문에, 유예시간을 짧게 두고 양쪽이 모두 클릭되어있으면 동시 클릭으로 취급해야한다.  
  
```javascript
/**
마우스 다운 이벤트
*/
function MouseDownHandler(event) {

  if (!startTime) startTime = new Date(); // 첫 클릭 시간 체크

  // 클릭한 타겟의 id와 value 획득
  const targetId = event.target.id;
  const targetValue = event.target.dataset.value;
  if (!targetId || !targetValue) return;

  // 0은 좌클릭, 2는 우클릭
  if (event.button === 0) leftDown = true;
  else if (event.button === 2) rightDown = true;

  if (clickDelay) clearTimeout(clickDelay); // 이전 timeout이 있으면 취소

  clickDelay = setTimeout(() => {
    // 변수 불값으로 판단
    if (leftDown && rightDown) check(event.target);
    else if (leftDown) open(event.target);
    else if (rightDown) flag(event.target);
    
    // 초기화
    clickDelay = null;
  }, 50); // 딜레이 50ms
}
```
  
##### 3. 지뢰 설정  
  
고유의 id를 가지고 있는 판을 만들었으니 지뢰를 배치해야 한다.  
지뢰 주변에는 숫자가 표기되어야 하는데, 구조 상 숫자는 0에서 8까지만 쓸 수 있다.  
따라서 지뢰를 9로 배치하고 나머지 칸엔 주변 지뢰상황을 파악해 숫자를 매긴다.  
  
```javascript
// set을 이용해 무작위 칸에 value 9를 세팅한다.
const divs = document.querySelectorAll('#main_area div');
const mineSet = new Set(); // 중복 방지용 set

while (mineSet.size < mines) {
  // 무작위 인덱스 값 생성
  const randomIdx = Math.floor(Math.random() * col * row);
  
  if (!mineSet.has(randomIdx)) {
    // set에 집어넣으며 지뢰 세팅
    mineSet.add(randomIdx);
    divs[randomIdx].dataset.value = 9;
  }
}

// 전체 div를 탐색하며 9가 아닌 경우 주변 칸이 9인 개수를 세팅한다.
divs.forEach(div => {
  if (div.dataset.value == 9) return;

  // 유효한 인접 div 가져오기
  const validNeighbors = findNeighbors(div.id);

  // 유효 범위 내 지뢰 개수 카운팅
  let mineCount = 0;
  validNeighbors.forEach(([r, c]) => {
      const neighborDiv = document.getElementById(`${r} ${c}`);
      if (neighborDiv && neighborDiv.dataset.value == 9) {
          mineCount++;
      }
  });

  div.dataset.value = mineCount;
});
```
  
지뢰 제외 숫자를 세팅하기위해 특정 div의 주변 div를 탐색하는 함수를 별도로 만들어준다.  
좌클릭으로 칸을 열때, 자동으로 열릴때, 동시클릭 시 등 쓰일 곳이 많은 공통함수이다.  
  
```javascript
/**
인접 div 탐색
*/
function findNeighbors(divId) {

  // id를 파싱해 현재 좌표 확인
  const[currentRow, currentCol] = divId.split(' ').map(Number);

  // 인접한 전체 좌표 확인
  const neighbors = [
      [currentRow - 1, currentCol - 1], [currentRow - 1, currentCol], [currentRow - 1, currentCol + 1],
      [currentRow    , currentCol - 1],         /* 현재 칸 */          [currentRow    , currentCol + 1],
      [currentRow + 1, currentCol - 1], [currentRow + 1, currentCol], [currentRow + 1, currentCol + 1]
  ];

  // 행열 범위를 벗어나면 제외하고 return
  return neighbors.filter(([r, c]) => r >= 1 && r <= row && c >= 1 && c <= col);
}
```
  
##### 4. 지뢰찾기 기능 부여  
  
좌클릭, 우클릭, 동시클릭 이벤트에 실제 게임 로직을 부여한다.  
- 좌클릭  
  - 지뢰(9)인 경우 게임 오버  
  - 지뢰가 아닌 경우  
    - 0인 경우 인접칸을 자동으로 열기  
    - 0이 아닌 경우 해당 칸만 열기  
- 우클릭  
  - 지뢰표시(flag)  
  - 표시된 칸에 다시 우클릭 시 표시 제거  
- 동시클릭  
  - 인접 칸 하이라이팅  
  - 만약 인접 칸 모든 곳에 지뢰가 없는 것이 확실한 경우 자동으로 열기  
  
```javascript
// 닫힌칸은 회색, 열린칸은 흰색, 플래그는 검정색, 하이라이팅은 파란색, 게임오버 시 지뢰 위치는 빨간색

/**
좌클릭 시 open
*/
function open(targetDiv) {

  // 지뢰칸은 즉시 패배처리
  if (targetDiv.dataset.value == 9) {
    youLose();
    return;
  }
  
  targetDiv.style.background = 'white';
  
  // 0인 경우엔 주변 div를 자동으로 열어줌
  if (targetDiv.dataset.value == 0) {
    findNeighbors(targetDiv.id).forEach(([r, c]) => {
      const div = document.getElementById(`${r} ${c}`);
      
      // 재귀 중 꼬이지 않게 열리지 않은 div만 열기
      if (div.style.background == 'gray') open(div);
    });
  } else {
    targetDiv.textContent = targetDiv.dataset.value;
  }
  
}

/**
우클릭 시 flag
*/
function flag(targetDiv) {

  const remainDiv = document.querySelector('#remain');

  // 닫혀있는 div에 플래그를 추가하며, 플래그가 추가된 칸일 경우 플래그 해제
  if (targetDiv.style.background == 'gray') {
    targetDiv.style.background ='black';
    remainDiv.dataset.value = remainDiv.dataset.value - 1;
  } else if (targetDiv.style.background == 'black') {
    targetDiv.style.background ='gray';
    remainDiv.dataset.value = remainDiv.dataset.value - 1 + 2;
  }
  
}

/**
동시클릭 시 check
*/
function check(targetDiv) {

  const neighbors = findNeighbors(targetDiv.id);
  
  // 플래그 수
  let flagCount = 0;
  
  neighbors.forEach(([r, c]) => {
    if (document.getElementById(`${r} ${c}`).style.background == 'black') flagCount++;
  });
  
  // 플래그와 지뢰수가 같으면 open, 아니면 주변 칸 반짝
  // 플래그 잘못 표시하여 자동오픈으로 지뢰 터지는것도 가능함
  neighbors.forEach(([r, c]) => {
    const div = document.getElementById(`${r} ${c}`);
    if (div.style.background == 'gray') {
      if (flagCount == targetDiv.dataset.value) open(div);
      else div.style.background = 'blue'
    }
  });
}
```  
  
##### 5. 승리 및 패배 판정
  
승리 판정은 매 좌클릭 후 체크한다.  
플래그 체크 안하고 클리어할 수 있으므로 판정은 닫혀있는 div 개수가 총 지뢰수와 같으면 승리한 것으로 한다.  
  
```javascript
/**
승리 반별
*/
function checkWin() {
  // 닫혀있는 div 개수 세기
  let closeCount = 0;
  
  document.querySelectorAll('#main_area div').forEach(div => {
    if (div.style.background != 'white') closeCount++;
  });
  
  // 총 지뢰 수와 닫혀있는 div 수가 같으면 승리
  if (closeCount === mines) {
    youWin();
    return;
  }
}

/**
승리 처리
*/
function youWin() {

  const endTime = new Date(); // 종료시간
  const elapsedTime = Math.floor((endTime - startTime) / 1000); // 경과 시간 초 단위
  
  // 승자에 대한 찬사
  alert(`You Win!!\n${Math.floor(elapsedTime / 60)}분 ${elapsedTime % 60}초`);
  
  // 마우스 이벤트 제거
  document.removeEventListener('mousedown', MouseDownHandler);
  document.removeEventListener('mouseup', MouseUpHandler);
}

/**
패배 처리
*/
function youLose() {

  // 패배자에 대한 조롱
  alert('You Lose!!');
  
  // 모든 보드 열기
  document.querySelectorAll('#main_area div').forEach(div => {
    if (div.dataset.value == 9) {
      // 지뢰 위치는 빨간색으로 표시
      div.style.background = 'red';
    } else {
      div.style.background = 'white';
      div.textContent = div.dataset.value;
    }
  });
  
  // 마우스 이벤트 제거
  document.removeEventListener('mousedown', MouseDownHandler);
  document.removeEventListener('mouseup', MouseUpHandler);
}
```
  
> #### 완성  
---  
  
<a href="{{ '/play/Minesweeper.html' | relative_url }}" target="_blank" rel="noopener noreferrer">
  직접 해보기
</a>
  
![img01](/assets/images/posts/one-pan/JavaScript/2025-04-30-Minesweeper/img01.jpg)  
  
이지선다 지옥...  
  
![img02](/assets/images/posts/one-pan/JavaScript/2025-04-30-Minesweeper/img02.jpg)  
  
{% include colored_text.html color="red" text="**크아아아아아아아악**" %}    
  
> #### 반성  
---  
  
1. **DOM 직접 컨트롤 피하기**  
이유는 상술  
  
2. 디자인 및 접근성  
뭔가 더 예쁘고 접근성 좋게 처리할 수 있었을 거란 아쉬움이 남는다  
div 사이 빈 줄도 없앨 수 있었을텐데...  
AI도 잘 되어있는 세상인데...  
  
  
> #### 코드 확인   
---  

[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-04-30-Minesweeper.html)


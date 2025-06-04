---
title: "랜덤 출력기"
date: "2025-05-15 08:00:00 +0900"
last_modified_at: "2025-05-15 08:00:00 +0900"
categories: 
  - one-pan/JavaScript/
author: movingwoo
---
> #### 개요  
---  

백준 랜덤 문제를 랜덤 언어로 푸는 포스팅을 작성하려는데  
랜덤 뽑아내는 기능이 필요해서 자급자족함  
  
> #### 구현  
---  
  
##### 1. 설계  
  
백준에 문제가 몇개나 되지?
현시점 전체 문제는 3만개 이상으로 나온다.  
웹 크롤링을 통해 최대 숫자를 정할 수 있겠으나 굳이 이딴데 크롤링까지?  
최소 1000부터 최대 숫자 지정해서 랜덤 문제 번호를 뽑아내면 되겠다.  
  
언어는 72종 지원한다는데 내가 할 수 있는 언어만 나와야한다.  
대충 java, c++, python 3종으로만 하자.  
  
##### 2. HTML 세팅  
  
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>랜덤 출력기</title>
</head>
<body>
  <h1>랜덤 출력기</h1>

  <label for="maxNumber">최대 숫자 입력 (최소는 1000 고정): </label>
  <input type="number" id="maxNumber" min="1000">
  <button onclick="generateRandomNumbers()">생성하기</button>

  <h3>결과</h3>
  <p>문제 번호: <span id="randomNumber"></span></p>
  <p>언어: <span id="randomLanguage"></span></p>

  <script>
    // 스크립트
    // 언어는 1부터 3까지 랜덤 뽑고 각 숫자에 할당
  </script>
</body>
</html>
```
  
##### 3. 스크립트 작성  
  
```javascript
function generateRandomNumbers() {
  const min = 1000;
  const max = parseInt(document.querySelector('#maxNumber').value);

  // 최대 숫자 예외처리
  if (isNaN(max) || max < min) {
      alert("최소 1000 이상 숫자 입력");
      return;
  }

  // 랜덤 숫자 추출
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  const randomLang = Math.floor(Math.random() * 3) + 1;

  // 결과란에 배치
  document.querySelector('#randomNumber').textContent = randomNum;
  document.querySelector('#randomLanguage').textContent = randomLang === 1 ? 'java' : randomLang === 2 ? 'c++' : 'python';
}
```
  
> #### 완성  
---  
  
![img01](/assets/images/posts/one-pan/JavaScript/2025-05-15-Random Printer/img01.webp)  
  
> #### 반성  
---  
  
딱히?  
  
> #### 코드 확인   
---  
  
<a href="{{ '/play/Random Printer.html' | relative_url }}" target="_blank" rel="noopener noreferrer">
  직접 해보기
</a>
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/JavaScript/2025-05-15-Random%20Printer.html)


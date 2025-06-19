---
title: "코드 시뮬레이터"
description: "PYTHON 코드 시뮬레이터 프로그램 개발"
date: "2025-06-19 16:00:00 +0900"
last_modified_at: "2025-06-19 16:00:00 +0900"
categories: 
  - Development/Python/
tags: [PYTHON, 코드 시뮬레이터, Pyodide]
author: movingwoo
---
> #### 개요  
---  

Jekyll 블로그는 정적이라 뭔가 구현하는데 한계가 좀 많다.  
마개조하고싶은데 뭘 할 수 있을까 고민하다가 떠오른 코드 시뮬레이터.  

원래 구상으론 내가 할 줄 아는 언어들을 전부 집어넣어 기능을 구현하고 싶었는데  
현실적으로 상당한 제약이 있다.  

JS는 손 댈 것도 없다.  
대충 떠올려봐도 {% include colored_text.html color="orange" text="**eval**" %} 박아넣으면 바로 가능하다.  
보안 상 이슈가 있겠지만...  

C++을 실행시키려면 코드를 컴파일해서 결과를 제공해야하는데 이건 {% include colored_text.html color="orange" text="**정적 환경에서는 불가능**" %}하다.  
Java도 브라우저에 {% include colored_text.html color="orange" text="**JVM이 없으므로 불가능**" %}하다.  
Java Applet이 있었지만 보안 이슈로 퇴출되었고 JS로 돌려서 실행시키는 법도 있지만 무슨 의미가 있을까...  

Python은 {% include colored_text.html color="orange" text="**Pyodide**" %}를 이용하면 브라우저에서 실행이 가능하다고 한다.  
그렇다면 Python 코드 시뮬레이터를 만들어보자!  
  
> #### 설계  
---  
  
[Pyodide](https://pyodide.org/en/stable/)  
  
![img01](/assets/images/posts/Development/Python/2025-06-19-Code Simulator/img01.webp)  
  
Pyodide 소개 페이지다.  
브라우저에서 Python을 사용할 수 있다.  
CPython을 Wasm으로 포팅했다고 한다.  
  
적용법은 아주 간단하다.  
  
![img02](/assets/images/posts/Development/Python/2025-06-19-Code Simulator/img02.webp)  
  
CDN 경로에 pyodide.js를 붙이면 정상적으로 로드된다.  
js에 스크립트 태그와 함께 집어넣으면 된다.  
  
```js
<script src="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js"></script>
```
  
> #### 구현  
---  
  
##### 1. html 작성  
  
코드를 입력할 부분과 실행버튼, 결과를 표시할 부분을 작성한다.  
  
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>Code Simulator</title>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js"></script>
  <style>
    body {
      max-width: 1200px;
    }
    h1 {
      color: #000000;
    }
    textarea {
      width: 100%;
      height: 200px;
      font-size: 1em;
      padding: 1rem;
      background: #ffffff;
      border: 1px solid #000000;
      resize: vertical;
    }
    button {
      cursor: pointer;
    }
    pre {
      width: 100%;
      font-size: 1em;
      padding: 1rem;
      background: #ffffff;
      border: 1px solid #000000;
    }
  </style>
</head>
<body>
  <h1>Python Code Simulator</h1>

  <textarea id="code" placeholder="Python 코드 입력">print("Hello World!!")</textarea>
  <br/>
  <button onclick="run()">실행</button>
  <!-- 결과가 깨져서 pre 태그로 처리 -->
  <pre id="output">실행 결과 표시 창</pre>

  <script>
    // 스크립트 작성
  </script>
</body>
</html>
```
  
##### 2. 스크립트 작성  
  
![img03](/assets/images/posts/Development/Python/2025-06-19-Code Simulator/img03.webp)  
  
사용 가이드 페이지를 확인해보면 초기화 방법이 나와있다.  
async 함수를 사용하여 비동기로 초기화한다.  
페이지 로드 시 1회 초기화 하도록 설정하고, 코드를 전달해서 결과를 받아 뿌려준다.  
  
그냥 사용 시 개발자도구 콘솔에 결과를 뿌려주는데  
print를 재정의해서 변수로 저장해 내 마음대로 컨트롤 할 수 있게 한다.  
  
```js
// Pyodide 인스턴스를 전역 변수로 저장
let pyodide = null;
// 광클시 중복실행 방지용
let isRunning = false;

// 초기화 함수
async function load() {
  return loadPyodide();
}

// 페이지 로드 시 Pyodide 초기화
window.onload = async () => {
  pyodide = await load();
}

// 코드 실행 함수
async function run() {

  if (isRunning) return;

  isRunning = true;
  
  const code_value = document.querySelector("#code").value;
  const output_area = document.querySelector("#output");
  
  // 로드되는데 시간이 걸릴 수 있어서 그동안 보여줄 메시지
  output_area.textContent = "실행 중...";

  try {

    // 초기화 되지 않았다면 기다리기
    while (!pyodide) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    let stdout = "";
    
    // 그냥 사용하면 개발자도구 콘솔에 출력됨
    // print를 재정의하여 stdout 변수로 저장
    pyodide.globals.set("print", (...args) => {
      stdout += args.join(" ") + "\n";
    });
    
    let result = await pyodide.runPythonAsync(code_value);
    
    if (stdout) {
      output_area.textContent = stdout;
    } else {
      // stdout이 잘못되었을 경우 Python에서 undefined를 반환했는지 확인 필요
      output_area.textContent = result === undefined ? "undefined" : result;
    }
  } catch (err) {
    output_area.textContent = err;
  } finally{
    isRunning = false;
  }
}
```
  
##### 3. 입력 받기  
  
코드 입력 시 결과 출력은 문제 없는데 input을 직접 받지 못해 오류가 난다.  
print()와 마찬가지로 input()을 재정의해서 사용자 입력을 받을 수 있도록 한다.  
  
실제 대화형 처럼 하려면 너무 복잡해진다.  
그냥 알고리즘 문제 풀 때처럼 입력 한 번 받을 수 있게만 한다.  
지속적으로 입력 받는건 다음에 시간나면 해보기로 하자.  
  
구현은 최대한 간단하게  
input 입력란을 별도로 두고 해당 textarea에 작성된 값을 input으로 삼아 코드를 실행시킨다.  
  
```html
<textarea id="input" placeholder="사용자 입력"></textarea>
```
  
여러 줄을 전송할 경우 전체를 한 번에 받아들여서 오류가 난다.  
한 줄 씩 처리할 수 있도록 줄단위로 나눠줄 필요가 있다.  
  
입력이 input() 요구보다 모자란 경우에 EOF Exception을 던지는 것으로 예외처리한다.  
  
```js
// 여러 줄 전송하기 위해 라인 별 저장
const input_values = document.querySelector("#input").value.split(/\r?\n/);

// ... 중략 ...

let index = 0;
// input을 재정의하여 사용자 입력 값 전달
pyodide.globals.set("input", () => {
  if (index < input_values.length) {
    return input_values[index++];
  } else {
    throw new Error("EOF Exception");
  }
});
```
  
> #### 완성  
---  
  
![img04](/assets/images/posts/Development/Python/2025-06-19-Code Simulator/img04.webp)  
  
{% include colored_text.html color="orange" text="**Hello World!!**" %}  
  
사용자 입력 테스트도 해봐야겠다.  
가장 최근에 파이썬으로 푼 문제인 백준 3655번으로 테스트 해보자.  
위쪽에 내 코드를 넣고, 아래쪽 사용자 입력에 예제를 집어넣는다.  
  
![img05](/assets/images/posts/Development/Python/2025-06-19-Code Simulator/img05.webp)  
  
스무스하게 작동한다.  
  
> #### 반성  
---  
  
파이썬이 웹에서도 동작하는 세상이라니  
누가 감히 알았겠는가  
{% include colored_text.html color="red" text="**이것은 파이썬이 위대한 것인가 JS가 위대한 것인가?**" %}  
  
찾아보니 {% include colored_text.html color="orange" text="**PyScript**" %}를 사용하면 아예 {% include colored_text.html color="orange" text="**py-script**" %} 태그를 통해 파이썬 문법을 그대로 쓰는 방법도 있다고 한다.  
내부에서 Pyodide를 사용하며 동작하는 일종의 프레임워크로 볼 수 있다고 한다.  
그럼 이제 js를 몰라도 파이썬으로 웹 앱을 만들 수 있다는 소리인가?  
기술의 발전은 정말이지 두렵다...  
  
> #### 코드 확인   
---  
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/Development/Python/2025-06-19-Code%20Simulator.html)


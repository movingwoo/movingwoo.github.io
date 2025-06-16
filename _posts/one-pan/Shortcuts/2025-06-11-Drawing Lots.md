---
title: "제비 뽑기"
description: "단축어 제비 뽑기 프로그램 개발"
date: "2025-06-11 11:00:00 +0900"
last_modified_at: "2025-06-11 11:00:00 +0900"
categories: 
  - one-pan/Shortcuts/
tags: [단축어, 제비 뽑기]
author: movingwoo
---
> #### 개요  
---  
  
점심 먹고 커피를 누가 살지, 술 마시고 대표로 누가 결제할지 등  
각종 내기할 때 준비물이 필요 없고 밸런스가 잘 맞는 게임은 가위바위보가 있다.  
좀 더 익스트림한 경험을 원하면 사다리타기나 핀볼을 하기도 한다.  
  
오늘은 단축어로 내기에 쓸 수 있는 제비뽑기를 만들어 볼 것이다.  
js를 사용하지 않으면 GUI가 극적이진 않지만 직접 만들어서 사용하면 제법 재미있다.  
  
단축어 js 연동은 다소 불편하기도 하고...  
  
> #### 설계  
---  
  
입력을 받을 때 인원 수에 따라 항목은 얼마든지 늘어날 수 있게 설정해야한다.  
  
입력 받으면 무작위 셔플 후 각각에 인덱스를 부여해 하나의 제비로 만든다.  
제비 클래스를 구현할 수는 없으므로 {% include colored_text.html color="orange" text="**사전**" %}을 사용하는게 좋겠다.  
  
각 제비는 하나를 선택해 하나씩 열어볼 수 있게하고  
전체를 한 번에 열어볼 수 있게도 만든다.  
  
어떤 단축어 블럭을 사용할지 고민하는게 어렵고 로직 자체는 심플하다.  
  
> #### 구현  
---  
  
##### 1. 목록 입력받아 사전 생성  
  
기본 값으로 당첨 하나와 꽝 2개 총 3개 항목을 설정하고 보여준다.  
당첨과 꽝 문구는 변경할 수 있게 하고 항목을 추가할 수 있게 한다.  
  
필터 블럭으로 제비를 무작위 셔플하고 목록 수 만큼 반복문을 구성한다.  
3가지 작업을 하게 되는데  
- {% include colored_text.html color="orange" text="**인덱스와 셔플된 값으로 사전**" %} 구성
- 목록을 선택할 수 있게 별도 {% include colored_text.html color="orange" text="**인덱스 변수**" %} 구성
- 전체 보기 시 출력할 {% include colored_text.html color="orange" text="**텍스트 변수**" %} 구성
  
전체 보기의 경우 뒤에서 사용하게 될건데  
결과 보기 블럭에 사전을 그냥 넣을 경우 json 형식으로 출력한다.  
보기 불편하기 때문에 결과를 텍스트로 미리 다듬어서 변수로 선언해두고  
전체 보기 할 경우 해당 텍스트 변수를 출력한다.  
  
반복문이 종료되면 사용자에게 보여줄 목록 변수에 '전체 보기' 항목을 넣어서 한 번에 전체를 볼 수 있게 한다.  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img01.webp" alt="img01" width="300" %}  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img02.webp" alt="img02" width="300" %}  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img03.webp" alt="img03" width="300" %}  
  
##### 2. 반복문과 조건문  
  
반복 블럭을 새로 구성해서 인덱스 변수를 목록으로 보여준다.  
  
만약 전체 보기를 선택할 경우에 미리 선언해둔 전체 보기 변수를 출력 후 단축어를 종료한다.  
그렇지 않으면 해당 인덱스의 값을 사전에서 가져와 출력한다.  
사전에서 값을 가져오면 인덱스 변수에서 선택한 값을 필터 블럭으로 제거해 남은 제비만을 다시 보여준다.  
  
모든 제비를 열어보았다면 전체 보기 변수를 출력해 최종 결과를 출력한다.  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img04.webp" alt="img04" width="300" %}  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img05.webp" alt="img05" width="300" %}  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img06.webp" alt="img06" width="300" %}  
  
> #### 완성  
---  
  
{% include colored_text.html color="red" text="**당첨자는 오늘 커피를 산다!!!**" %}  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-11-Drawing Lots/img07.webp" alt="img07" width="300" %}  
  
> #### 반성  
---  
  
ios 판올림할 때마다 단축어도 조금씩 바뀌는데  
원래 반복 블럭에 for each처럼 쓰는게 있었나 기억이 안난다.  
  
사전 값 출력하려고 각각 반복 블럭을 사용해봤는데 예상한대로 동작하지 않아서 기본 반복 블럭을 사용했다.  
개발자 문서를 찾아봐야하나...  
  
단축어의 장점은 제공되는 기본 기능을 자유롭게 확장할 수 있다는 것이며
단축어의 단점은 제공되는 기본 기능만 자유롭게 확장할 수 있다는 것  
  
api 연동까지는 어떻게 편하게 써도 js 엮이는 순간 골치아파지는데  
나중에 포스트로 다뤄볼 기회가 있을 것이다.  
  
> #### 공유  
---  
  
사파리에서 링크 실행  
  
[제비 뽑기 - iCloud Link](https://www.icloud.com/shortcuts/1846ec094ab34bf79d689d4dcbd32a36)  
  
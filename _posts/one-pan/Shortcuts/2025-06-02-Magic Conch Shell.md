---
title: "마법의 소라고둥"
date: "2025-06-02 17:00:00 +0900"
last_modified_at: "2025-06-02 17:00:00 +0900"
categories: 
  - one-pan/Shortcuts/
author: movingwoo
---
> #### 개요  
---  

심심하면 아이폰 단축어로 이것저것 만드는데 제법 재밌다
  
오늘은 스폰지밥 에피소드 중 하나인 {% include colored_text.html color="orange" text="**마법의 소라고둥**" %}을 따라서  
질문에 랜덤으로 소라고둥이 답해주는걸 만들거다.  
  
그런데 소라고동임 소라고둥임?  
애니메이션은 소라고동이라고 하고 표준어는 소라고둥이다.  
고민 끝에 표준어로 간다.  
  
> #### 구현  
---  
  
##### 1. 사진 준비  
  
뭐 외부 API 쓸 거 아니면 단축어 만드는 법은 상당히 단순한 편이다.  
조건문 블럭에만 잘 집어넣으면 돌아간다.  
  
랜덤으로 사진 4장 중 하나를 보여줘야하니 소라고둥 사진 4장을 만든다.  
사진에 글자는 마크업 기능으로 그냥 쓰면 편하다.  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img01.jpg" alt="img01" width="300" %}
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img02.jpg" alt="img02" width="300" %}  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img03.jpg" alt="img03" width="300" %}
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img04.jpg" alt="img04" width="300" %}  
  
##### 2. 사용자 입력 받기  
  
마법의 소라고둥님께 할 질문을 입력받는다.  
오오 고둥님...  
  
물론 로직 상 질문은 그저 형식에 불과하다.  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img05.jpg" alt="img05" width="300" %}  
  
##### 3. 무작위 처리  
  
랜덤으로 사진 중 하나를 뽑아 보여준다.  
사진 이름을 magic_conch_1 부터 4까지 이름을 지어둬서  
무작위 숫자를 뽑아서 문자열 뒤에 붙여주고  
해당 이름을 가진 사진을 찾아서 보여준다.  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img06.jpg" alt="img06" width="300" %}  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img07.jpg" alt="img07" width="300" %}  
  
> #### 완성  
---  
  
고민이 될 때는 소라고둥님을 부르자.  
{% include colored_text.html color="red" text="**마법의 소라고둥님! 이번 주는 진짜 로또가 될 수 있을까요?**" %}  
  
{% include resized_img.html src="/assets/images/posts/one-pan/Shortcuts/2025-06-02-Magic Conch Shell/img08.gif" alt="img08" width="300" %}  
  
> #### 반성  
---  
  
단축어는 마크다운 파일 내 코드로 쓰기 마땅치 않다.  
json 형식으로 작성한다해도 알아보기가 힘들고  
결국 이미지 덕지덕지 붙이는 방법 외에 떠올리지 못했다.  
  
실현 가능한지 몰라 테스트케이스로 이번 포스트를 작성해봤는데  
요 코딱지만한 단축어에 사진이 8개가 나왔다.  
  
이미지 사용을 피할 수 없다면 이미지 사이즈를 줄이고 열화시켜 용량이라도 줄여봐야하나?  
  
코드로 깃에 올려 공유하기 어려운 대신 단축어는 아이클라우드 공유가 가능한데  
소라고둥 단축어는 이미지를 따로 만들어서 공유해도 사용할 수 없다.  
  
가능하면 쓸만한 놈 만든 경우엔 코드 공유 대신 단축어 자체를 공유하도록 해야겠다.  
  
업로드 전 단축어 포스트 단점 하나 더 찾음  
소스코드가 없어서 포스트 내 글자수가 확 줄어들었다!  
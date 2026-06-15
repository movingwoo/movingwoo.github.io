---
title: "모아키 for iOS 구현"
description: "iOS용 모아키 포크 프로젝트"
date: "2026-06-15 17:00:00 +0900"
last_modified_at: "2026-06-15 17:00:00 +0900"
categories: 
  - Development/VibeCoding/
tags: [바이브코딩, CLAUDE, iOS, 모아키]
author: movingwoo
---
> #### 개요  
---  
  
어느샌가 누구나 바이브 코딩을 하고 있다.  
컴퓨터 1도 몰라도 뭔가 뚝딱뚝딱 개발을 한다.  
바이브 코더도 코더인가?  
그딴건 모르겠고 좋은 건 나도 하고 싶다.  
  
일단 난 앱 개발을 잘 모르기 때문에 앱개발을 AI에게 시켜보자.  
무슨 앱을 만들고 싶냐하면 나는 {% include colored_text.html color="orange" text="**모아키**" %}를 만들고 싶다.  
  
모아키는 안드로이드에서 오래전에 출시된 키보드인데  
자음을 밀어서 모음을 합쳐 글자를 완성시키는 키보드이다.  
연속 드래그로 자음과 모음을 결합하기 때문에 익숙해지면 타이핑이 굉장히 빠르다.  
이게 참 편하고 좋은데 아이폰으로 넘어오며 강제로 쿼티를 사용하게 되었다.  
  
그럼 아이폰용 모아키를 개발해보자!!  
    
> #### 맥북병  
---  
  
사소한 문제가 있다.  
아이폰 앱을 개발하기 위해선 xcode가 필요하고  
그러면 맥북이 필요하다.  
그렇다 나는 맥북 병에 걸린 것이다!!  
  
{% include colored_text.html color="red" text="**맥북 병의 치료법은 단 하나, 맥북을 구매하는 것이다.**" %}  
  
![img01](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img01.webp)  
  
요즘 지갑이 좀 아프니 리퍼 제품을 찾아보자...  
지갑이 많이 아프니 프로보다 에어로 가자...  
  
사실 예전에 맥북을 가진 적이 있다.  
그때도 모아키를 직접 만들어보려 했는데 swift 공부하다가 때려쳤다.  
당시 애송이였던 나와 지금의 나는 다르다.  
{% include colored_text.html color="orange" text="**나는 'AI'를 탑재해버렸기 때문이다...**" %}  
덤벼라 swift  
  
> #### 구현  
---  
  
##### 1. Hello Claude  
  
맥 단축키에 적응하는 시간을 좀 갖고 나면 이제 spotlight를 통해 자유자재로 터미널을 열 수 있게 된다.  
터미널만 열리면 익숙한 리눅스다.  
  
클로드코드를 설치한다.  
  
```bash
curl -fsSL https://claude.ai/install.sh | bash
```
  
연결과정 중 22달러를 결제해야하는 사소한 이슈가 있었지만 넘어가자.  
22달러면 대충 26000원쯤 하지 않나?  
가만보자 오늘자 환율이  
  
![img02](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img02.webp)  
  
{% include colored_text.html color="red" text="**이런 시벌**" %}  
  
##### 2. 부모 프로젝트 탐색  
  
클로드코드는 토큰 빨아먹는 양이 어마어마하다고 들었다.  
맨땅에 '해줘' 해도 해주겠지만 참조할만한 부모 프로젝트를 찾아보자.  
  
[ios-moaki](https://github.com/vkehfdl1/ios-moaki)  
  
오리지널 프로젝트를 찾아와 프로젝트를 구성하자.  
  
~~포크해서 프로젝트 구성하는 부분이 있었으나 후술할 사유로 인하여 취소~~
  
준비가 완료되었으면 외친다.  
{% include colored_text.html color="red" text="**클로드야 해줘!!!**" %}  
  
> #### 완성  
---  
  
![img03](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img03.webp)  
  
{% include colored_text.html color="orange" text="**클로드가 다해줬다 나는 아무것도 안했어 구경만 했어**" %}  
  
오리지널 프로젝트와 비교하여 큰 변경점은 세 가지이다.  
첫째로 좌대각선 모음 추가.  
갤럭시 시절 양손으로 타이핑해서 좌대각선으로 'ㅡ' 와 'ㅣ' 입력이 잦았다.  
때문에 좌대각선을 세팅해주었다.  
  
둘째로 민감도 조절  
왼손은 잘 되는데 오른손으로 'ㅗ' 타이핑시 각도가 수직이 아니면 자꾸 'ㅘ'로 틀어져서 민감도 조절 바를 추가했다.  
내가 너무 극단적인 케이스인지 모르겠지만 방향전환 90 흔들림 무시 50 에서 딱 내가 원하는 타이핑이 된다.  
  
마지막으로 지울때 덩어리로 삭제  
이 부분은 갤럭시 시절 기억이 가물가물한데...  
어차피 자모를 조합해서 한번에 쓰는 키보드 특성 상 자음 모음이 따로 지워질 필요는 없어 보인다.  
때문에 삭제 시 한 글자 청크를 한 번에 날리도록 했다.  
  
![img04](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img04.webp)  
  
타이핑에 아무 이상이 없다.  
  
> #### 느낀 점  
---  
  
![img05](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img05.webp)  
  
AI는 신이고 무적이며 인간 시대의 끝은 도래했다.  
인간은 토큰 비용을 채굴해서 AI님께 바치면 된다.  
  
생각보다 토큰이 나가는 속도가 빠르다.  
이 프로젝트 자체가 규모가 크지 않은데 분석, 수정 및 일부 추가에 토큰이 사진만큼 소진되었다.  
규모가 좀 있는 프로젝트를 맨 땅에 시작하면 생각보다 토큰이 부족해질 듯?  
이건 차차 직접 만들어가며 알아볼 부분이다.  
  
추가로, 직접 만든 애플 앱은 7일밖에 사용할 수 없다고 한다.  
- 7일 후 새로 빌드를 하는 방법  
- altstore 또는 sidestore 로 인증을 자동화 하는 방법  
- 애플 개발자 등록 하는 방법 (무려 99달러를 요구한다!!)  
  
이렇게 세가지 방법이 있다.  
우선 7일동안 사용해보고 어떻게 할지 고민해봐야겠다.  
  
마지막으로 요즘 IT회사들이 신입 안뽑는 이유를 알게 되었다.  
진짜 신입 데려와서 교육하는 것 보다 일 좀 치는 사람에 AI 붙여주는게 효율이 훨씬 좋아보인다.  
내 노후가 걱정이 된다.  
  
맥북에 아직 덜 익숙한데 좀 익숙해지면 AI와 함께 재밌는 바이브 코딩의 세계로 빠져야겠다.  
  
그런데 이거 맥북에서 사진 편집 후 업로드 하니 사진 폭이 가득가득 화면을 채운다.  
이것도 어떻게 조절할 방법을 찾아봐야겠다.  
  
> #### 링크를 남기려 했는데  
---  
  
처음에는 포크해서 퍼블릭 레포로 구성하려 했는데 private로 전환했다.  
모아키가 원래는 구글 플레이 스토어에서 다운로드 받는 앱이었는데 어느순간 갤럭시에 내장되었다.  
때문에 현재 모아키의 특허가 삼성에 있다는데  
이거 public 으로다가 MIT 라이선스 달고 오픈해두면 문제가 생길 수 있을 것 같다...  
  
혹시 몰라 AI에게 물어보니 아무리 수익을 창출하지 않는다해도  
public repo 는 특허에 걸릴 수 있다고 한다.  
  
![img07](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img07.webp)  
  
{% include colored_text.html color="orange" text="**따라서 저작권 및 특허권 보호를 위해 깃허브 프로젝트는 비공개로 전환하고 개인 학습용으로만 유지한다.**" %}  
{% include colored_text.html color="orange" text="**권리 관계를 명확히 아는 것도 개발자의 중요한 소양이다.**" %}  
  
![img06](/assets/images/posts/Development/VibeCoding/2026-06-15-Moakey for iOS/img06.webp)  
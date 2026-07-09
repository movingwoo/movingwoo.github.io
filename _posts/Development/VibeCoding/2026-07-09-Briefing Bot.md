---
title: "브리핑 봇 구현"
description: "텔레그램 연동 브리핑 봇 구현"
date: "2026-07-09 10:00:00 +0900"
last_modified_at: "2026-07-09 10:00:00 +0900"
categories: 
  - Development/VibeCoding/
tags: [VIVECODING, CLAUDE, BOT, TELEGRAM]
author: movingwoo
---
> #### 개요  
---  
  
5호기 서버는 뭘 할 수 있을까?  
1기가 메모리는 차치하고 아웃바운드 데이터 제한 1기가가 참 살벌한 제한 조건이다.  
범위 내 안전하게 사용하려면 텍스트 데이터만 주고 받는게 맞을 것 같다.  
이왕 이렇게 된 것, 텔레그램과 연동하여 필요한 정보를 정해진 시간에 브리핑하는 봇을 만든다.  
  
> #### 설계  
---  
  
흐름은 간단하다.  
데이터 수집 및 가공 후 {% include colored_text.html color="orange" text="**텔레그램 봇**" %}을 이용해 폰으로 전송한다.  
  
로직보다 중요한 것은 리소스 절약이다.  
서버가 미니미니 하기 때문에 {% include colored_text.html color="orange" text="**상시 프로세스 구동을 하지 않고 cron으로 정해진 시간에 실행**" %}한다.  
python으로 개발하고 외부 라이브러리는 최소화한다.  
  
우선 기본적으로 {% include colored_text.html color="orange" text="**날씨, 뉴스, 주식**" %} 3가지 브리핑을 받아볼텐데  
API가 변경되거나 기능을 추가, 변경, 삭제하기 쉽게 각 기능을 모듈화한다.  
  
> #### 구현  
---  
  
```markdown
bot/
├── main.py           # 크론 진입점
├── config.yaml       # 설정
├── db.py             # SQLite 공통 래퍼
├── notifier.py       # 텔레그램 전송 유틸
├── key_expiry.py     # API 키 만료 알림
└── modules/
    ├── base.py       # 추상 베이스 클래스
    ├── weather.py    # 날씨 모듈
    ├── news.py       # 뉴스 모듈
    └── stock.py      # 주식 모듈
```
  
디렉토리 구조는 이렇다.  
cron이 main.py로 진입하여 config.yaml에서 설정 및 API 키 확인 후 모듈을 실행한다.  
모듈은 데이터를 수집 후 sqlite에 저장된 이전 스냅샷을 조회, 변화가 있으면 텔레그램으로 전송 후 스냅샷을 갱신한다.  
  
만약 config.yaml에 설정된 API 키가 만료되기 7일 전 부터는  
알림 전송 시 텔레그램으로 만료예정 알림을 함께 보낸다.  
  
크론설정의 경우, 단순 텍스트 전송이라 여유는 있어보이지만 한 달 테스트를 해보기 위해 여유있게 설정한다.  
- 날씨는 매일 오전 7시 1회 전송  
- 뉴스는 매일 오전 8시, 오후 1시, 오후 6시 3회 전송  
- 주식은 평일 오전 9시, 오전 11시, 오후 1시, 오후 3시 30분 4회 전송  
  
> #### 텔레그램 연동  
---  
  
텔레그램 봇을 사용하기 위해 {% include colored_text.html color="orange" text="**token**" %}과 {% include colored_text.html color="orange" text="**chat_id**" %} 정보가 필요하다.  
  
![img01](/assets/images/posts/Development/VibeCoding/2026-07-09-Briefing Bot/img01.webp){: width="40%"}  
  
텔레그램에서 {% include colored_text.html color="orange" text="**BotFather**" %} 검색 후 공식 계정으로 들어간다.  
사용할 수 있는 여러 명령어는 {% include colored_text.html color="orange" text="**/start**" %} 명령어를 통해 확인할 수 있다.  
  
새 봇을 생성하기 위해 {% include colored_text.html color="orange" text="**/newbot**" %} 명령어를 입력 후 토큰을 발급받는다.  
  
![img02](/assets/images/posts/Development/VibeCoding/2026-07-09-Briefing Bot/img02.webp){: width="40%"}  
  
토큰을 잘 챙겨두고 생성한 봇과 대화방을 열어서 아무 메시지나 전송한다.  
그리고 {% include colored_text.html color="orange" text="**https://api.telegram.org/bot{토큰}/getUpdates**" %} 페이지로 접속하면 {% include colored_text.html color="orange" text="**chat_id**" %}를 확인할 수 있다.  
  
![img03](/assets/images/posts/Development/VibeCoding/2026-07-09-Briefing Bot/img03.webp){: width="30%"}  
  
토큰과 챗아이디를 획득했으니 config.yaml에 넣어두고 아무 연동 메시지를 날려서 봇이 메시지를 정상적으로 수신하는지 확인한다.  
  
> #### 프로토타입 완성  
---  
  
![img04](/assets/images/posts/Development/VibeCoding/2026-07-09-Briefing Bot/img04.webp){: width="40%"}  
  
오전 7시에 날씨 알림을 전송해준다.  
우산을 챙겨야할지 알 수 있다.  
  
![img05](/assets/images/posts/Development/VibeCoding/2026-07-09-Briefing Bot/img05.webp){: width="40%"}  
  
시간이 되면 뉴스가 날아온다.  
트럼프가 트럼프 하더니 이란을 다시 터뜨리기 시작했다.  
주식이 위험한 것 같다...  
  
![img06](/assets/images/posts/Development/VibeCoding/2026-07-09-Briefing Bot/img06.webp){: width="40%"}  
  
장 시작 시 주식 알림이 날아온다.  
어? 생각외로 미장이 안떨어졌다?  
  
아무튼 이렇게 필요한 기본 기능은 완성이다.  
텔레그램 봇을 처음 써봤는데 확장의 여지가 많다.  
기능 이것저것 확인해보면서 어떻게 사용하면 좋을지 상상의 나래를 펼쳐야겠다.  
다만 본격적인 기능 추가는 한 달 후 구글 클라우드 사용량 확인 후 조심스럽게 접근할 예정이다.  

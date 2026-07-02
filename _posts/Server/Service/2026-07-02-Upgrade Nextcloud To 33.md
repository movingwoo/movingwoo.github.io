---
title: "넥스트클라우드 33 업그레이드"
description: "넥스트클라우드 31 에서 33 으로 업그레이드"
date: "2026-07-02 10:00:00 +0900"
last_modified_at: "2026-07-02 10:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, DOCKER, NEXTCLOUD, UPGRADE]
author: movingwoo
---
> #### 개요  
---  
  
업그레이드의 시기가 도래했다...  
넥스트클라우드 버전을 {% include colored_text.html color="orange" text="**31에서 33으로**" %} 올려야한다.  
  
넥스트 클라우드 메이저 버전은 계절에 따라 하나씩 올라가는 듯 하다.  
왜이렇게 업데이트를 빠르게 하는거지?  
31버전 잘 쓰고 있었지만 34버전이 나오는 이 시점에 33버전까지는 따라가야겠다.  
  
제발 터지지 마라 기도하면서 {% include colored_text.html color="orange" text="**백업**" %}부터 진행.  
  
> #### 절차 확인  
---  
  
침착하게 절차를 확인하자.  
순서대로 작성해보면 아래와 같다.  
  
- 유지보수 모드 활성화  
- 도커 이미지 교체 및 기동  
- 업그레이드 및 마이그레이션  
- 유지보수 모드 해제  
- 관리자 경고 메시지 확인  
- 기능 테스트  
  
이 절차를 2번 반복한다.  
31 -> 33으로 껑충 건너뛰는 것 보다는  
31 -> 32 -> 33 순차적으로 올라가는게 위험이 덜하다.  
  
> #### 32로 업그레이드  
---  
  
occ로 시작하는 모든 명령어는 php 명령어라 컨테이너 내부에서 실행해야한다.  
우선 유지보수 모드 명령어는 {% include colored_text.html color="orange" text="**occ maintenance:mode --on**" %} 이다.  
  
![img01](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img01.webp){: width="60%"}  
  
docker-compose.yml에서 이미지 버전을 올려준다.  
31-apache 버전이므로 32-apache 버전으로 올린다.  
cron 까지 동작하고 있으므로 2개를 수정해야한다.  
  
![img02](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img02.webp){: width="50%"}  
  
pull 한다음 기동해서 로그를 확인하면 업그레이드 스크립트가 돌아간다.  
  
![img03](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img03.webp){: width="70%"}  
  
일단 오류로그가 안뜬다... 너무 다행이다...  
기동했을 시 업그레이드와 업그레이드 명령어 occ upgrade는 동일하다.  
확실하게 재확인하기 위해 수동으로 {% include colored_text.html color="orange" text="**occ upgrade**" %} 명령어를 실행해서 확인해보자.  
  
![img04](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img04.webp){: width="50%"}  
  
이렇게 되면 자동 업데이트가 잘 된 것으로 보인다.  
아래 명령어들을 실행해 정리를 한다.  
대부분 업그레이드 과정에 문제는 없었지만 재확인을 하는 용도이다.  
  
- {% include colored_text.html color="orange" text="**occ app:update --all**" %}  
- {% include colored_text.html color="orange" text="**occ db:add-missing-indices**" %}  
- {% include colored_text.html color="orange" text="**occ db:add-missing-colums**" %}  
- {% include colored_text.html color="orange" text="**occ db:convert-filecache-bigint**" %}  
- {% include colored_text.html color="orange" text="**occ maintenance:mode --on**" %}  
  
![img05](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img05.webp){: width="70%"}  
    
유지보수 모드를 종료하고 켜보면 32버전 화면이 뜬다.  
이러면 95% 완료된 것과 다름없다.  
관리설정의 경고를 보러가자.  
  
![img06](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img06.webp){: width="70%"}  
  
첫번쨰 경고는 명령어인 {% include colored_text.html color="orange" text="**occ maintenance:repair --include-expensive**" %}를 수행만 하면 된다.  
두번째 경고 헤더 설정은 Caddy에 설정을 추가해주면 된다.  
  
```nginx
header {
    Strict-Transport-Security "max-age=15552000; includeSubDomains"
}
```
  
세번째 경고는 2차인증을 추가하라는건데 지금 당장 필요치 않으니 패스  
이후 기능점검을 진행하는데 오피스가 열리지 않는다...  
넥스트클라우드와 오피스 간 통신은 정상적이나 wopi 요청을 신뢰할 수 없다는 내용이다.  
  
![img07](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img07.webp){: width="40%"}  
  
오피스쪽 설정을 살펴보면 wopi 허용 리스트가 추가된 것 같다.  
아니다 원래 있었나? 잘 모르겠다...  
아무튼 저거때매 문서를 못보니 허용 리스트를 추가해주자.  
의심되는 대역대를 전부 추가해주고 구분자는 , 만 사용하면 된다.  
저장 후 오피스 문서 열리는지 확인하면 끝.  
  
32버전에서 33버전으로 올리는 것도 같은 작업을 반복해주면 된다.  
  
> #### 끝  
---  
  
![img08](/assets/images/posts/Server/Service/2026-07-02-Upgrade Nextcloud To 33/img08.webp){: width="50%"}  
  
새로운 기능!!! 이라고 하는데 사실 크게 달라진 건 느끼기 힘들다.  
아이콘 모양이 바뀌었다 정도?  
그 외 기분탓인지 모르겟지만 속도 개선이 있었다고 해서 속도가 좀 빨라진 것 같다.  
  
메이저 버전 업이 워낙 빠르다보니 큰 변경점이 생기기도 어렵다.  
한동안 33버전 주차하고 내년 이맘때쯤 다시 버전업을 시도해봐야겠다.  
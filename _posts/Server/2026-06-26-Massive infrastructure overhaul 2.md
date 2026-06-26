---
title: "인프라 대공사 2"
description: "기존 인프라 대공사 2"
date: "2026-06-26 14:00:00 +0900"
last_modified_at: "2026-06-26 14:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, INFRASTRUCTURE, NEXTCLOUD, COLLABORA, CADDY, DOCKER]
author: movingwoo
---
> #### 할 일  
---  
  
기존 메인 도메인에 붙어있던 github pages로 구동되던 페이지를 옮겨야한다.  
서브도메인을 하나 달아줘서 이동 시키고  
대표 도메인에는 다른 정적인 페이지를 파서 링크를 달아주는 식으로 바꾸려 한다.  
  
부작용으로 구글 서치콘솔 다 꼬이는 문제가 있긴한데...  
어차피 방문자도 없으니 그냥 무시하고 진행하자.  
  
> #### 기존 도메인 변경  
---  
  
www.movingwoo.com은 CNAME으로 movingwoo.com으로 붙고  
movingwoo.com은 github pages에 붙어서 현재 포스트.... 관리하는 곳으로 넘어온다.  
  
정체성이 뭐지? 블로그라 해야하나?  
서브도메인을 뭘로 붙이지?  
  
그냥 아카이브로 해야겠다.  
archive는 너무 기니까 arc로 하자.  
  
변경 범위를 우선 정리해보면  
- 프로젝트 내 CNAME, README 등 설정 변경  
- github repo 설정 변경  
- 도메인 레코드에 github pages 공식 IP 주소 수정  
  
차근차근 위부터 진행하자.  
  
#### 1. 프로젝트 수정  
  
도메인이 직접 기재된 파일 리스트는 5개로 보인다.  
- CNAME
- _config.yml
- robots.txt
- giscus.html
- README.md
  
단순 수정이니 빠르게 진행.  
_config.yml 보니 수정할게 많이 보인다.  
만든지 꽤 시간이 지나서 테마도 변경하고 싶고...  
우선 현재 작업에만 집중해야지.  
작업을 커밋하고 푸쉬, 다음으로 넘어간다.  
  
#### 2. 깃헙 레포 설정 변경  
  
깃헙에 들어가서 {% include colored_text.html color="orange" text="**Settings**" %} > {% include colored_text.html color="orange" text="**pages**" %} > {% include colored_text.html color="orange" text="**Custom domain**" %} 에 도메인을 수정한다.  
수정해야하는데...  
  
![img01](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img01.webp){: width="70%"}  
  
자동으로 반영이 되어있네?  
음 깃헙 페이지는 똑똑한가부다.  
커밋내용을 그대로 알아서 반영해줬다.  
이것도 우선 패스  
  
#### 3. DNS 레코드 수정  

도메인 제공업체 접속해서 레코드를 수정한다.  
  
![img02](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img02.webp){: width="90%"}  
  
github pages 공식 IP가 설정된 A레코드 4줄을 변경해주고 다시 깃헙 설정으로 돌아가서 상태를 확인한다.  
  
![img03](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img03.webp){: width="70%"}  
  
뭐야 이거 왜 안됨?  
DNS 체크가 설정이 올바르지 않다고 계속해서 실패한다.  
그런데 가만보자 나 이거 저번에 봤던거 같은데...  

[SSL 인증서 오류 해결](https://arc.movingwoo.com/server/2025/12/16/Fixing-SSL-Cert-Error.html)  
  
![img04](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img04.webp){: width="60%"}  
  
앗찻차! 지난번에 쓴 포스트를 보고 깨달았다.  
작년 12월에 SSL 검증 오류를 해결하며 한 번 마주쳤던 상황이다.  
내용대로 github 설정의 저건 현재 검증이 안되는게 정상이다.  
이래서 사람은 기록을 잘 남겨둬야한다.  
  
그럼 다 끝난거니 바뀐 도메인으로 한 번 접속해보자.  
  
![img05](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img05.webp){: width="40%"}  
  
아주 잘 들어가진다 굳  
  
> #### 대표 도메인  
---  
  
이제 대표도메인은 갈 곳이 없어졌다.  
www 서브 도메인은 대표 도메인으로 넘어가고  
대표 도메인은 새로운 링크 페이지로 넘어가게 바꿀 것이다.  
링크 페이지는 새로운 repo 파서 github pages로 기동한다.  
공짜 서버 너무 좋아  
  
일단 간단하게 웹페이지를 작성하자.  
시간이 없으니 하청을 주서 대충 뼈대만 개발 끝내고 새 레포에 푸쉬한다.  
  
![img06](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img06.webp){: width="70%"}  
  
이니셜 커밋 완료.  
movingwoo.github.io는 아카이브가 뺏어가서 쓰고 있기 때문에 대충 hub 정도로 지어준다.  
이렇게 되면 movingwoo.github.io/hub 이런 식으로 접근해야하는데  
어차피 연결 세부사항은 DNS 레코드 설정과 레포 커스텀 도메인 설정에서 알아서 처리해줄거라 별로 상관없다.  
  
![img07](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img07.webp){: width="60%"}  
  
어 그런데 커스텀 도메인이 이렇게 되면 뭐지?  
클라우드플레어에서 arc 서브도메인을 github 페이지로 보내는 중이다.  
그럼 메인도메인은???  
  
아 설정을 잘못했다...  
{% include colored_text.html color="orange" text="**메인 도메인을 github IP로 보내고 서브도메인은 CNAME으로 연결**" %}시키는게 맞겠다...  
  
[GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)  
  
![img08](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img08.webp){: width="60%"}  
  
깃헙의 공식 문서를 보면 표로 이렇게 정리를 해줬다.  
꼭 저렇게 해야하는건 아니겠지만 권장사항대로 하는게 좋겠지.  
따라서 다시 github IP를 메인 도메인에 물려주고 arc 서브도메인용 CNAME을 추가한다.  
  
![img09](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img09.webp){: width="90%"}  
  
그래 이게 맞아...  
임시로 만든 메인페이지 접근 잘 되는지 확인해본다.  
  
![img10](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 2/img09.webp){: width="40%"}  
  
잘 되는구만!  
  
> #### 마무리  
---  
  
아직 메인 도메인 페이지 링크 구성이 안되어있다.  
나중에 링크 개발 마쳐서 커밋해야겠다.  
html과 js로만 구성된 민감정보 한 톨 안담긴 간단한 페이지니 죄다 클로드 하청 맡겨야지!  
  
그건 그거고 고생했으니 좀 쉬어야겠다.  
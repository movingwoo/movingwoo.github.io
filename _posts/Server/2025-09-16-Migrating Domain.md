---
title: "도메인 네임서버 변경"
description: "Cloudflare로 도메인 네임서버 변경"
date: "2025-09-15 17:00:00 +0900"
last_modified_at: "2025-09-15 17:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, 도메인, 네임서버, CLOUDFLARE]
author: movingwoo
---
> #### 머리말  
---  
  
Cloudflare Tunnel 을 사용하기 위한 사전 작업이 있다.  
{% include colored_text.html color="orange" text="**도메인 네임서버를 Cloudflare로 변경**" %}해야한다.  
  
정말 귀찮기 그지없는 작업이지만 일단 해보자.  
  
현재 글을 올리는 movingwoo.com 도메인은 porkbun 에서 구입하여 이용 중이다.  
이 도메인의 네임서버를 cloudflare 로 이전한다.  
  
> #### Cloudflare란?  
---  
  
![img01](/assets/images/posts/Server/2025-09-16-Migrating Domain/img01.webp)  
  
사실 인터넷 좀 해봤으면 cloudflare에 대해 한 번 쯤은 봤을 확률이 높다.  
대충 서버 터졌을때 클라우드플레어 어쩌고 저쩌고 뜬다.  
  
그만큼 많이들 사용하는 인프라 서비스 회사인데, 2010년 설립되었다고 한다.  
생각보다 후발주자이다.  
그래도 무료 플랜 접근성이 좋고 간편하여 빠르게 성장하여 지금의 cloudflare가 되었다고 한다.  
  
무료 플랜이 강력하긴 한데 회사가 커지면서 일부 보안 기능들이 유료화되어가는 추세라는데...  
일단 터널은 무료로 제공해주니 써보자.  
즐길 수 있을때 즐겨야지  
  
> #### 네임서버 변경 작업  
---  
  
[Cloudflare Dashboard](https://dash.cloudflare.com/)  
  
![img02](/assets/images/posts/Server/2025-09-16-Migrating Domain/img02.webp)  
  
가입하면 도메인을 등록하라고 뜬다.  
순서대로 하라는대로 진행하면 된다.  
  
한국어 지원 해주는게 마음에 든다.  
품질도 정말 나쁘지 않다.  
  
![img03](/assets/images/posts/Server/2025-09-16-Migrating Domain/img03.webp)  
  
DNS 레코드 추가는 {% include colored_text.html color="orange" text="**빠른 스캔**" %}으로 진행한다.  
  
![img04](/assets/images/posts/Server/2025-09-16-Migrating Domain/img04.webp)  
  
플랜 선택 화면.  
당연히 {% include colored_text.html color="orange" text="**무료 플랜**" %}을 선택하겠지만, 프로 플랜부터 기능이 매력적이긴하다.  
  
사실 1개월 20딸라면 요즘 AI 구독과 비슷한 가격이다.  
막 접근성이 없진 않은 가격이다.  
  
![img05](/assets/images/posts/Server/2025-09-16-Migrating Domain/img05.webp)  
  
빠른 스캔으로 가져온 DNS 레코드 리스트가 뜬다.  
  
내 경우는 포크번에서 긁어왔는데, 기존 등록되어있는 A 레코드와 TXT 레코드 외에 NS 레코드가 보인다.  
포크번 네임서버 리스트인데 우선은 그대로 가져간다.  
  
NS 레코드는 네임서버 이전이 완료되면 안전하게 삭제하도록 한다.  
사실 잘 모르면 손대지 않고 냅두는게 최고다.  
  
![img06](/assets/images/posts/Server/2025-09-16-Migrating Domain/img06.webp)  
  
![img07](/assets/images/posts/Server/2025-09-16-Migrating Domain/img07.webp)  
  
마지막 단계를 위해 기존 도메인 등록기관, 내 경우 포크번에 로그인이 필요하다.  
{% include colored_text.html color="orange" text="**DNSSEC 기능을 종료**" %} 후, {% include colored_text.html color="orange" text="**네임 서버를 cloudflare에서 제공해주는 값으로 교체**" %}한다.  
  
![img08](/assets/images/posts/Server/2025-09-16-Migrating Domain/img08.webp)  
  
이 부분은 시간이 상당 소요될 수 있는데  
나는 트래픽 쥐꼬리만큼도 없는 싸구려 도메인이라 바로 처리됨...  
  
![img09](/assets/images/posts/Server/2025-09-16-Migrating Domain/img09.webp)  
  
대시보드에서 상태가 {% include colored_text.html color="orange" text="**활성**" %}으로 나오면 끝이다.  
  
> #### 추가 보안 작업  
---  

아까 DDNSEC을 종료했으므로 DDNSEC을 활성화 시켜야하고  
TLS와 같은 기초적인 설정도 마저 진행한다.  
  
![img10](/assets/images/posts/Server/2025-09-16-Migrating Domain/img10.webp)  
  
딸깍으로 SSL/TLS 자동 적용.  
원래 이부분은 포크번도 딸깍으로 했던 것 같다.  
  
![img11](/assets/images/posts/Server/2025-09-16-Migrating Domain/img11.webp)  
  
DNSSEC 활성화를 하려면 {% include colored_text.html color="orange" text="**DS 레코드를 등록기관에 추가**" %}해야한다.  
  
만약 내가 도메인 자체를 클라우드플레어로 이전했다면 이부분은 간단하게 끝났겠지만  
네임서버만 변경한거라 이 작업은 포크번에 직접 해줘야한다.  
  
![img12](/assets/images/posts/Server/2025-09-16-Migrating Domain/img12.webp)  
  
제공해주는 값들을 그대로 입력해주기만 하면 된다.  
  
이것은 간단한 레고조립과 같다.  
아기들 모양 맞춰서 블럭 넣는 장난감과 다름 없다.  
맞는 칸에 넣고 없는 칸은 비우고 등록한다.  
  
![img13](/assets/images/posts/Server/2025-09-16-Migrating Domain/img13.webp)  
  
{% include colored_text.html color="red" text="**잉?**" %}  
  
시간이 지나도 등록이 안되어 문의 결과, keyData 쪽 입력 때문에 검증 실패로 오류가 나는 것이라 한다.  
keyData 제외하고 {% include colored_text.html color="orange" text="**dsData 쪽만 입력**" %}해주면 성공적으로 등록된다...  
  
![img14](/assets/images/posts/Server/2025-09-16-Migrating Domain/img14.webp)  
  
클라우드플레어 대시보드에서도 DNSSEC 적용을 확인할 수 있다.  
  
> #### 꼬리말  
---  
  
이 외 보안 관련 다양한 메뉴들이 있는데 대부분 프로 플랜 이상을 권유하고 있어서 쓰기 힘들다.  
봇 막는 기능 등은 무료인데 굳이 막아야하나 싶기도 하고...  
  
![img15](/assets/images/posts/Server/2025-09-16-Migrating Domain/img15.webp)  
  
제일 안타까운건 이 최대 업로드 크기 부분인데  
100mb 제한이 있고 비즈니스 플랜부터 늘릴 수 있다.  
  
![img16](/assets/images/posts/Server/2025-09-16-Migrating Domain/img16.webp)  
  
이렇게 {% include colored_text.html color="orange" text="**오렌지색 구름 모양**" %}으로 클라우드플레어 프록시를 거치는 경우 저 제한이 적용된다.  
개인 서버라 큰 이슈는 없을 것 같은데 일단 사용해봐야 알 것 같다.  
가늠이 잘 안가는데, 제한 때문에 문제생기면 프록시 풀거나 하면 되겠지.  
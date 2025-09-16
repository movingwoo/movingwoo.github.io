---
title: "Cloudflare Tunnel 설정"
description: "Cloudflare Tunnel 및 추가 보안 설정"
date: "2025-09-16 12:00:00 +0900"
last_modified_at: "2025-09-16 12:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, CLOUDFLARE, TUNNEL, 보안]
author: movingwoo
---
> #### 머리말  
---  
  
테스트를 위해 Cloudflare Tunnel을 적용해보는 시간.  
  
> #### Cloudflare Tunnel이란?  
---  
  
{% include colored_text.html color="orange" text="**Cloudflare Tunnel**" %}은 서버를 인터넷에 안전하게 노출하는 방법 중 하나이다.  
  
서버에 {% include colored_text.html color="orange" text="**cloudflared 클라이언트**" %}를 설치하고, 클라이언트를 통해 cloudflare로 아웃바운드 연결을 맺는다.  
클라이언트와 cloudflare가 직접 통신하는 구조라 {% include colored_text.html color="orange" text="**방화벽이나 IP를 노출할 필요가 없다.**" %}  
덕분에 방화벽은 인바운드를 다 막고 아웃바운드만 허용하면 된다.  
  
{% include colored_text.html color="orange" text="**모든 것을 cloudflare에게 맡기기**" %}  
  
> #### 사전 작업  
---  
  
터널을 설정하는 제로 트러스트 대시보드는 클라우드플레어 대시보드와 별도로 존재한다.  
왜 이렇게 불편한 구조가 되었냐?  
  
원래 출신이 달랐다고 한다.  
Teams/Access 제품군이 별도로 있었는데 Cloudflare가 나중에 인수하여 한 몸이 되었다.  
  
메인 대시보드에 Zero Trust 메뉴로 이동하는 버튼을 달아두긴 했는데  
완전히 합쳐지기에는 시간이 조금 더 필요해보인다.  
  
[Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)  
  
![img01](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img01.webp)  
  
cloudflare 계정으로 진행하면 팀 이름을 선택해야한다.  
제로 트러스트 쪽은 팀 기준으로 운영된다.  
  
![img02](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img02.webp)  

무료 플랜에 보면 50명 사용자 제한이 있다.  
개인 사용에 아무런 문제가 없다.  
  
그 밖에 일부 보안 세부 제한이 있지만 터널은 무료기 때문에 사용에 문제 없다.  
  
![img03](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img03.webp)  
  
로그인 후 터널 설정 메뉴에 접근할 수 있다.  
  
테스트해볼 서버에도 붙어서 사전 작업을 진행한다.  
  
![img04](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img04.webp)  
  
방화벽의 Inbound를 모두 deny하고 SSH를 제외한 포트를 전부 닫는다.  
SSH에도 터널 적용이 가능한데 굳이 그럴 필요가 있나 싶어서 일단 냅둔다.  
  
![img05](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img05.webp)  
  
터널 접속 테스트를 위한 톰캣을 하나 올린다.  
http 8080 기본 포트 하나만 설정했다.  
  
> #### Cloudflare Tunnel 설정  
---  
  
![img06](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img06.webp)  
  
권장 설정인 cloudflared를 선택한다.  
  
![img07](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img07.webp)  
  
서버에 cloudflared 설치하는 방법에 대한 가이드가 나온다.  
안정적인 사용을 위해 repo를 등록하는게 좋다고 한다.  
  
![img08](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img08.webp)  
  
서비스까지 등록되면 systemd 에 cloudflared 가 active 상태인걸 확인할 수 있다.  
  
![img09](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img09.webp)  
  
연결 정책을 설정한다.  
테스트 서브도메인을 설정하고 내부 톰캣 주소인 localhost:8080 과 매핑한다.  
  
![img10](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img10.webp)  
  
설정한 도메인으로 연결 시 클라우드플레어에서 제공해준 TLS 인증서와 함께 내부 톰캣에 접속 가능하다.  
분명 방화벽에서 8080 포트를 열지 않았지만 터널을 통해 접근 가능하다.  
  
{% include colored_text.html color="red" text="**모든 것을 cloudflare에게 맡기기...**" %}  
  
> #### 추가 보안 설정  
---  
  
제로 트러스트 대시보드에서 보안 설정을 확인해보니 Access 정책 설정이 가능했다.  
{% include colored_text.html color="orange" text="**Access > 정책**" %} 메뉴에서 해당 호스트 접근에 대한 추가적인 정책을 걸어둔다.  
  
![img11](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img11.webp)  
  
도메인에 대하여 이메일 인증을 거치도록 설정했다.  
포함, 제외, 필수 등 다양한 방식으로 설정이 가능하다.  
  
![img12](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img12.webp)  
  
도메인 접근 시 사진과 같이 이메일 OTP 인증 화면이 나온다.  
서비스 로그인 화면 이전에 cloudflare에서 자체적인 접근제어를 진행하는 것이다.  
아주 훌륭하다.  
  
이것 외에 cloudflare 대시보드에서 {% include colored_text.html color="orange" text="**보안 > 보안 규칙**" %} 탭에서 추가적인 규칙을 설정할 수 있다.  
  
![img13](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img13.webp)  
  
and or in not 등으로 규칙을 설정할 수 있는데  
로컬 그룹 IP를 제외한 나머지에게 관리 챌린지를 걸어두었다.  
  
관리 챌린지가 대체 무어냐?  
  
![img14](/assets/images/posts/Server/2025-09-16-Setting Cloudflare Tunnel/img14.webp)  
  
휴대폰으로 접속해보았다.  
어디서 많이 본 인증화면이 나온다.  
  
그렇다! 이것이 관리 챌린지였다!  
  
> #### 꼬리말  
---  
  
이게 어디까지가 무료인가?  
그 범위를 파악하며 설정해야하다보니 골치가 아프다.  
  
그래도 무료치고 기능이 엄청나게 좋다.  
이러니 다들 클라우드플레어 쓰지.  
  
굳이 단점을 찾아보자면  
- {% include colored_text.html color="orange" text="**모든 트래픽이 cloudflare를 경유**" %}해서 cloudflare가 터지면 같이 터짐
- cloudflare가 트래픽 내용을 볼 수 있어서 {% include colored_text.html color="orange" text="**프라이버시**" %} 우려가 있음
- cloudflare 계정이나 정책에 이슈가 생기면 접근이 안되기 때문에 백도어 마련 필요
- 대규모 업/다운로드 시 무료 플랜에서 힘들거나 속도 저하가 생길 수 있음
  
이 정둔가?  
아직은 제대로 사용도 안해봤기 때문에 단점을 제대로 느끼려면 롱텀으로 사용해봐야 알 것 같다.  
  
이제 무슨 서비스를 올려볼지 고민해야지.  
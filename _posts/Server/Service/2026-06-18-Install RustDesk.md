---
title: "RustDesk 자체 구축"
description: "RustDesk 최초 자체 구축 및 구성"
date: "2026-06-18 14:00:00 +0900"
last_modified_at: "2026-06-18 14:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, RUSTDESK, DOCKER]
author: movingwoo
---
> #### 개요  
---  
  
윈도우끼리 원격은 뭐 방법 많은데  
윈도우에서 맥을 원격하려고 하면 좀 복잡해진다.  
  
무료로 제일 쉬운 대책은 Chrome Remote Desktop인데  
이거 성능 진짜 좋지 않다.  
좀 키 잘 먹히고 기능 좋은건 TeamViewer나 AnyDesk 이런게 있는데  
예전엔 무료였는데 지금은 무료로 사용하긴 어렵다.  
  
[RustDesk](https://rustdesk.com/)  
  
![img01](/assets/images/posts/Server/Service/2026-06-18-Install RustDesk/img01.webp){: width="80%"}  
  
찾아보니 최근엔 {% include colored_text.html color="orange" text="**RustDesk**" %}가 괜찮다는 말을 들었다.  
러스트데스크의 가장 큰 특징은 오픈소스라는 것이다.  
언젠가 수틀려서 유료전환이 이루어진다해도 공개된 소스가 있기 때문에 안심이다.  
  
그런 연유로 시험삼아 러스트데스크를 단순 인스톨하여 사용해보았다.  
기능은 만족스러우나 구린 노트북에서 원격을 하려니 속도가 좀 시원찮더라...  
중앙 서버를 거치면서 속도 손실이 일어나는 것이라 판단해 직접 구축을 해본다.  
겸사겸사 자가 호스팅을 통해 데이터 유출 우려도 줄어든다.  
  
> #### 구축  
---  
  
[rustdesk-server - docker hub](https://hub.docker.com/r/rustdesk/rustdesk-server)  
  
공식 도커이미지를 찾았다.  
그냥 대충 최신 이미지로 받으면 되려나?  
  
```bash
docker pull rustdesk/rustdesk-server:latest
```  
  
이제 docker-compose.yml을 작성한다.  
{% include colored_text.html color="orange" text="**hbbs**" %}와 {% include colored_text.html color="orange" text="**hbbr**" %} 2개를 작성해야하는데  
hbbs는 브로커, hbbr은 릴레이 서버이다.  
정상적인 원격 제어를 위해선 두개가 구동되어야 한다.  
  
```yaml
networks:
  rustdesk_net:
    external: false

services:
  hbbs:
    image: rustdesk/rustdesk-server:latest
    restart: unless-stopped
    networks:
      - rustdesk_net
    depends_on:
      - hbbr
    command: hbbs -r {IP}:21117
    ports:
      - 21115:21115
      - 21116:21116
      - 21116:21116/udp
    volumes:
      - /app/rustdesk/data:/root

  hbbr:
    image: rustdesk/rustdesk-server:latest
    restart: unless-stopped
    networks:
      - rustdesk_net
    command: hbbr
    ports:
      - 21117:21117
    volumes:
      - /app/rustdesk/data:/root
```
  
전면에 웹서버를 두지 않고 테일스케일 vpn 그룹 내에서 전용 앱으로만 접속할 생각이다.  
때문에 웹 클라이언트용 포트 21118, 21119 2개는 매핑하지 않았다.  
  
대기상태 메모리를 많이 먹지도 않고  
중계할때 데이터를 바로바로 통과시키므로 별도로 메모리 설정은 생략한다.  
  
완료했으면 {% include colored_text.html color="orange" text="**docker compose up -d**" %} 명령어로 기동한다.  
  
![img02](/assets/images/posts/Server/Service/2026-06-18-Install RustDesk/img02.webp){: width="40%"}  
  
기동하면 볼륨 설정한 data 폴더에 키 파일이 생성된다.  
공개키 파일인 {% include colored_text.html color="orange" text="**id_ed25519.pub**" %} 내용을 복사해둔다.  
  
![img03](/assets/images/posts/Server/Service/2026-06-18-Install RustDesk/img03.webp){: width="50%"}  
  
rustdesk 앱을 켜서 설정 > 네트워크 > ID/릴레이 서버에 들어간다.  
  
![img04](/assets/images/posts/Server/Service/2026-06-18-Install RustDesk/img04.webp){: width="60%"}  
  
기동한 서버 IP 작성하고 릴레이서버에는 포트 21117로 잡는다.  
Key에 방금 복사한 공개키 내용을 붙여넣고 확인.  
  
원격지 PC에도 똑같이 설정하고 연결한다.  
  
![img05](/assets/images/posts/Server/Service/2026-06-18-Install RustDesk/img05.webp){: width="80%"}  
  
{% include colored_text.html color="orange" text="**성공!!!**" %}  
중앙서버를 통할때와 비교하면 속도가 차원이 다르고 아주 부드럽다.  
  
> #### 마무리  
---  
  
앞서 말했듯 테일스케일 뒤에서 로컬 원격만 할거라 더 손댈 것은 없어보인다.  
  
하나 해보고 싶은 것은 클라이언트 앱 자체를 직접 빌드하는건데  
오픈소스기 때문에 커스텀해서 온갖 짓을 다 해볼 수 있을거다.  
  
근데 굳이 꼭 할 필요는 없을 것 같기도 하고...  
당장 내 환경만 Windows, Linux, Mac, iOS 4개인데 그걸 각각 만든다고?  
정정한다.  
굳이 꼭 할 필요 없는게 아니라 그냥 안하는게 맞다.  
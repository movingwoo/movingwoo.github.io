---
title: "인프라 대공사 1"
description: "기존 인프라 대공사 1"
date: "2026-06-26 10:00:00 +0900"
last_modified_at: "2026-06-26 10:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, INFRASTRUCTURE, NEXTCLOUD, COLLABORA, CADDY, DOCKER]
author: movingwoo
---
> #### 으악 하기싫어  
---  
  
인프라 대공사가 필요하다.  
정말 하기 싫다.  
하지만 해야한다.  
  
> #### AS_IS 와 TO_BE  
---  
  
현재 NextCloud 서비스는 Cloudflare Tunnel 뒤에 붙어있다.  
터널 뒤에 붙으면서 문제가 있었는데, NextCloud Office 프로그램을 사용하려면 WOPI 프로토콜을 이용해야한다.  
브라우저와 오피스 서버 사이에 웹소켓이 뚫려야하는데 터널이 이를 차단해버린다.  
짱구를 굴리고 굴려서 OnlyOffice라는 대안을 찾아 어떻게든 연결은 했다.  
  
**[ Cloudflare Tunnel ] ──> [ Traefik ] ──┬──> [ NextCloud ]**  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**└──> [ OnlyOffice ]**  
  
대충 이런 느낌이다.  
허나 사설 VPN망이 구축된 시점에 이는 의미 없는 구조라 판단되어 과감히 공사를 진행한다.  
  
목표는 아래와 같다.  
- {% include colored_text.html color="orange" text="**터널 들어내고 VPN망 뒤로 위치**" %}
- {% include colored_text.html color="orange" text="**Traefik을 제거하고 Caddy에서 분배**" %}
- {% include colored_text.html color="orange" text="**OnlyOffice를 없애고 NextCloud Office (Collabora) 로 교체**" %}
  
**[ VPN ] ──> [ Caddy ] ──┬──> [ NextCloud ]**  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**└──> [ NextCloud Office ]**  
  
그리고 하는 김에 31버전 -> 32버전 업데이트도 진행한다.  
이건 인프라 대공사 완료 후 진행이다.  
  
아 어디부터 손대야하지  
{% include colored_text.html color="orange" text="**백업은 선택이 아니라 필수**" %}니까 백업부터 해두자.  
  
> #### CloudFlare Tunnel 제거  
---  
  
먼저 Caddy에 handle 블럭 추가해서 구멍 뚫어주고 터널을 들어낸다.  
하는 김에 80포트를 Caddy에 돌려주고 nextcloud는 8080포트를 줘야지...
  
콘솔에 들어가서 확인하면 {% include colored_text.html color="orange" text="**[액세스 제어]**" %} 쪽에서 확인할 수 있다.  
아니 이거 화면이 또 바뀌었네 한참 찾았다.  
  
![img01](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 1/img01.webp){: width="90%"}  
  
정책은 다른데 쓸 데가 있다.  
저 연결은 이제 안쓸거니 과감하게 삭제 진행  
  
![img02](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 1/img02.webp){: width="50%"}  
  
추가로 DNS 레코드에서 해당 도메인 레코드도 날린다.  
  
![img03](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 1/img03.webp){: width="90%"}  
  
이제 VPN으로만 접근이 가능해졌다.  
  
> #### Office 변경  
---  
  
nextcloud의 docker-compose.yml 대공사가 필요하다.  
- 트래픽 네트워크와 레이블 제거, 관련 depends on 속성 제거
- nextoffice 자체에 포트 추가
- onlyoffice 제거, collabora code 추가
  
office 관련은 아래와 같이 설정하였다.  
  
```yaml
  office:
    container_name: nextcloud-office
    image: collabora/code:latest
    restart: unless-stopped
    networks:
      - nextcloud_net
    ports:
      - 9980:9980
    depends_on:
      - app
    environment:
      - aliasgroup1=https://.*
      - extra_params=--o:ssl.enable=false --o:ssl.termination=true
```
  
{% include colored_text.html color="orange" text="**aliasgroup1**" %}은 명시적으로 도메인 하나를 지정했더니 잘 동작하지 않아서 와일드카드 사용.  
외부 프록시 서버가 있기 때문에 {% include colored_text.html color="orange" text="**ssl.enable**" %}은 false로 설정하고  
{% include colored_text.html color="orange" text="**ssl.termination**" %} 옵션을 true로 해야 내부에서 http 요청이 들어오는 것을 신뢰한다.  
  
평소에 container_name을 잘 설정안했는데 중앙 관리를 위해서 꼭 설정하는게 좋겠다.  
이게 아마 도메인이 여기저기 박혀있을 것 같은데 config도 좀 뒤져보자.  
  
![img04](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 1/img04.webp){: width="70%"}  
  
여기에 붙어있는 도메인 정보도 수정한다.  
trusted_domains도 이 기회에 깔끔하게 정리해주고 trusted_proxies에 사설 IP 대역을 전부 등록해 혹시 모를 오동작을 방지한다.  
  
caddy도 수정이 필요하다.  
  
```nginx
# NextCloud
@nextcloud host domain1
handle @nextcloud {
    reverse_proxy IP:8080 {
        header_up X-Real-IP {remote_host}
    }
}

# collabora
@collabora host domain2
handle @collabora {
    reverse_proxy IP:9980
}
```
  
각각 리버스 프록시를 걸어주는데 nextcloud 쪽에는 {% include colored_text.html color="orange" text="**X-Real-IP**" %} 옵션을 넣어준다.  
요청을 실제로 보낸 원본 클라이언트 IP를 알려주는 용도인데  
이걸 설정하지 않으면 WOPI CheckFileInfo를 막아 {% include colored_text.html color="red" text="**403 Forbbidden 오류**" %}가 발생한다.  
  
기동시켜서 정상 접근이 잘 되는지 확인한다.  
앱 메뉴로 들어가서 OnlyOffice 사용하지 않음 처리하고 NextCloud Office 앱을 다운로드 한다.  
  
![img05](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 1/img05.webp){: width="30%"}  
  
이후 관리자 설정 오피스에 자체서버 호스팅으로 도메인 연결을 진행한다.  
  
![img06](/assets/images/posts/Server/2026-06-26-Massive infrastructure overhaul 1/img06.webp){: width="70%"}  
  
설정 완료 후 파일이 올바르게 열리는지 확인하면 끝!  
  
> #### 남은 일  
---  
  
갈 곳을 잃은 클라우드플레어 터널 A레코드가 노란 경고를 뿜어내고 있는데 어서 길을 찾아줘야한다.  
바로 다음 할 일이 되겠다.  
  
아 넥스트클라우드 메이저 버전업도 진행해야한다.  
귀찮아 죽겠네 정말  
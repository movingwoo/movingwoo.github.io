---
title: "Caddy 웹서버 구성"
description: "Caddy 웹서버 최초 구성"
date: "2026-06-24 15:00:00 +0900"
last_modified_at: "2026-06-24 15:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, CADDY, PROXY]
author: movingwoo
---
> #### 개요  
---  
  
Glances 대시보드에 도메인을 달아야한다.  
이왕 도메인 주는 것, 다른 서비스들에도 일괄 달아줄 예정이다.  
이를 위해서 인프라 대공사가 필요해진다.  
앗 하기 싫어  
  
> #### 구상  
---  
  
우선 NextCloud가 돌아가는 꼬라지를 보면  
외부 접속을 위해 CloudFlare Tunnel 뒤에 Traefik이 있으며 얘가 80포트를 점유하고 있다.  
이 전체를 들어내는 것은 귀찮고, 보안문제도 있기 때문에 얘는 가만히 둔다.  
  
Glances는 내 VPN망 내부에서만 동작하면 되기 때문에 외부 접속이 필요 없다.  
따라서 CloudFlare Tunnel은 버리고 {% include colored_text.html color="orange" text="**도메인 -> IP A레코드 매핑**" %}만 진행한다.  
  
도메인은 고민을 좀 해봤는데 {% include colored_text.html color="orange" text="**sub2.sub1.sld.tld 형식**" %}이 맞는 것 같다.  
1차적으로 sub1.sld.tld에 A레코드로 IP 매핑을 해주고  
해당 IP에 443으로 받아주는 {% include colored_text.html color="orange" text="**리버스 프록시 웹서버**" %}를 하나 두고  
웹서버에서 각 시스템으로 분배해주며 동시에 SSL 인증서를 담당한다.  
  
음 뭔가 될 것 같다.  
  
> #### Nginx Proxy Manager vs Caddy 
---  
  
Lets Encrypt의 성공으로 사설 인증서를 발급받을때 대부분 ACME 프로토콜을 이용한다.  
ACME프로토콜에서 도메인 소유권을 검증하는 대표적인 두 방식이 {% include colored_text.html color="orange" text="**HTTP-01**" %} 과 {% include colored_text.html color="orange" text="**DNS-01**" %} 이다.  
  
HTTP-01은 설정이 단순한데 서버 포트를 열어줘야한다.  
CA가 호스트에 직접 접근이 불가능하면 사용할 수 없다.  
  
DNS-01 방식은 DNS 설정에 텍스트 레코드를 추가하여 검증하는 방식이다.  
CA가 DNS를 조회하여 텍스트 레코드가 확인되면 인증서가 발급되는데  
이런 구조로 {% include colored_text.html color="orange" text="**폐쇄된 사설 네트워크 내부에서도 SSL 인증서 발급이 가능**" %}하다.  
  
이전에 {% include colored_text.html color="orange" text="**nginx**" %} + {% include colored_text.html color="orange" text="**acme-companion**" %} 세트로 사용한 적이 있다.  
nginx 자체가 가볍고 acme-companion이 도커 특화라 나쁘지 않게 사용할 수 있다.  
이번에는 다른 선택지를 경험하고 싶어서 오픈소스 소프트웨어를 찾다가 2가지를 놓고 고민했다.  
  
{% include colored_text.html color="orange" text="**Nginx Proxy Manager**" %}와 {% include colored_text.html color="orange" text="**Caddy**" %}  
  
[Nginx Proxy Manager](https://nginxproxymanager.com/)  
  
[Nginx Proxy Manager - github](https://github.com/NginxProxyManager/nginx-proxy-manager)  
  
![img01](/assets/images/posts/Server/Service/2026-06-24-Setting Caddy/img01.webp){: width="80%"}  
  
Node Package Manager가 아니다.  
{% include colored_text.html color="orange" text="**Nginx Proxy Manager**" %} 이다!!  
  
이 녀석의 장점은 {% include colored_text.html color="green" text="**대시보드**" %}가 있어서 편하게 관리할 수 있다는 점이다.  
단점은 날것의 nginx는 아주 가볍지만 대시보드를 위해 node, pyhton, sqlite 등이 추가로 돌아 {% include colored_text.html color="red" text="**묵직**" %}하다는 점이다.  
  
[Caddy](https://caddyserver.com/)  
  
[Caddy - github](https://github.com/caddyserver/caddy)  
  
![img02](/assets/images/posts/Server/Service/2026-06-24-Setting Caddy/img02.webp){: width="80%"}  

{% include colored_text.html color="orange" text="**Caddy**" %}는 Go 언어로 작성된 웹서버이다.  
외국에서 쓴다고 한 번 들어본 적은 있다.  
요 녀석의 장점은 후술할 클라우드플레어 토큰 등록을 위한 공식 플러그인을 추가 빌드하여 {% include colored_text.html color="green" text="**가볍게 사용**" %}할 수 있다는 점이다.  
단점은 쌩 날것의 {% include colored_text.html color="red" text="**nginx와 비교하면 성능**" %}이 조금 떨어질 수 있다는 것?  
  
| 비교 항목 | Nginx Proxy Manager (NPM) | 캐디 (Caddy) |  
| :--- | :--- | :--- |  
| **작동 구조** | 무거움 (Nginx + Python + Node.js + DB) | **가벼움 (단일 Go 바이너리 / 단일 컨테이너)** |  
| **대기 시 메모리** | 수백 MB 이상 (컨테이너 전체 합산 시) | **수십 MB 내외 (단일 프로세스)** |  
| **대규모 트래픽 성능** | **우수 (C언어 기반 비동기 처리)** | 보통 (Go 언어 기반) |  
| **설정 방식** | 웹 브라우저 GUI 클릭 방식 | Caddyfile 텍스트 작성 방식 |  
  
혼자 쓰고 가벼운걸 추구하는 나에게 Caddy가 매력적인 선택지이긴하다.  
사실 npm 보다 원래 사용하던 nginx + acme-companion이 훨씬 매력적인 선택지로 보인다.  
  
Caddy의 경우 공식 도커 이미지에 플러그인이 없어서 빌드를 해야하는데...  
귀찮긴해도 Caddy를 이 기회에 한 번 써보자.  
  
> #### 구축  
---  
  
우선 포트를 443은 그대로 캐디에 양보해주고  
80은 트래픽이 먹고 있으니 8080포트를 캐디 내부 80으로 매핑해주기로 한다.  
  
클라우드플레어 플러그인이 빌드된 순정 도커 이미지가 없는데  
2가지 방법이 있다.  
- 직접 빌드하기  
- 빌드된 이미지 찾기  
  
말해 뭐해 직접 빌드해야지.  
빌드하기 전에 {% include colored_text.html color="orange" text="**클라우드플레어 토큰**" %}을 받아야한다.  
  
![img03](/assets/images/posts/Server/Service/2026-06-24-Setting Caddy/img03.webp){: width="70%"}  
  
사용자 설정 토큰 생성을 통해 토큰을 발급받는다.  
권한은 {% include colored_text.html color="orange" text="**영역-DNS-편집**" %}, {% include colored_text.html color="orange" text="**영역-영역-읽기**" %}  
영역 리소스에 메인 도메인을 포함하도록 설정했다.  
  
이렇게 생성된 토큰은 다시 제공되지 않으므로 잘 백업해둬야 한다.  
  
```yaml
networks:
  caddy_net:
    driver: bridge

services:
  caddy:
    build:
      context: /app/caddy
      dockerfile_inline: |
        FROM caddy:2-builder AS builder
        RUN xcaddy build --with github.com/caddy-dns/cloudflare
        FROM caddy:2
        COPY --from=builder /usr/bin/caddy /usr/bin/caddy
    restart: unless-stopped
    networks:
      - caddy_net
    ports:
      - 8080:80
      - 443:443
    environment:
      - CLOUDFLARE_API_TOKEN={토큰}
    volumes:
      - /app/caddy/Caddyfile:/etc/caddy/Caddyfile
      - /app/caddy/caddy_data:/data
      - /app/caddy/caddy_config:/config
```
  
과거같으면 Dockerfile로 빌드를 해야했겠지만 {% include colored_text.html color="orange" text="**dockerfile_inline**" %}을 사용하면 별도 파일 생성 없이 처리 가능하다.  
xcaddy는 캐디 빌드 도구인데 이를 builder로 불러와서 클라우드플레어 플러그인과 결합한다.  
플러그인은 공식 깃허브 저장소를 활용한다. [caddy-dns cloudflare - github](https://github.com/caddy-dns/cloudflare)  
  
그 다음으로 순정 caddy 이미지를 가져와 builder에 들어있는 플러그인이 내장된 실행파일만 덮어쓰고 기동한다.  
  
context는 이미지 빌드 시 설정한 경로의 폴더의 파일들만 빌드 재료로 쓸 수 있게 제한하는 것이다.  
도커가 호스트 파일을 루트부터 훑을 필요는 없기 때문이다.  
  
environment에는 발급받은 토큰을 넣어준다.  
  
다음으로 {% include colored_text.html color="orange" text="**Caddyfile**" %}을 작성해야한다.  
  
```nginx
*.sub1.domain.com {
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }

    @service1 host sub2.sub1.domain.com
    handle @service1 {
        reverse_proxy 100.1.2.3:61208
    }

    handle {
        abort
    }
}
```
  
캐디를 통해 적용할 와일드카드 인증서는 *.sub1.domain.com 형식으로 정했다.  
해당 도메인 블럭을 작성하고 내부 tls 블럭에 클라우드플레어 토큰을 실어다 주면 와일드카드 인증서를 자동 발급, 갱신해준다.  
  
다음으로 {% include colored_text.html color="orange" text="**@별명 host 실제접속주소**" %} 형식으로 매쳐  
아래에 {% include colored_text.html color="orange" text="**handle**" %} 블럭에 리버스 프록시로 어디로 보낼지 작성한다.  
  
설정하지 않은 접속은 abort 시킨다.  
  
이건 진짜 설정이 편한 듯 하다.  
내용이 정말 짧게 끝나고 추가할 일 있으면 블럭만 하나씩 추가해주면 된다.  
  
> #### 기동  
---  
  
![img04](/assets/images/posts/Server/Service/2026-06-24-Setting Caddy/img04.webp){: width="80%"}  
  
최초 기동시 빌드를 진행하는 것을 확인할 수 있다.  
아무 문제가 없을 경우 Image Built와 함께 컨테이너가 시작된다.  
  
![img05](/assets/images/posts/Server/Service/2026-06-24-Setting Caddy/img05.webp){: width="70%"}  
  
이후 Caddyfile에 설정한대로 SSL 인증서 발급을 진행한다.  
성공적으로 발급 로그 확인되면 브라우저로 접속해보자.  
  
![img06](/assets/images/posts/Server/Service/2026-06-24-Setting Caddy/img06.webp){: width="60%"}  
  
설정한 도메인으로 https 접속이 정상적으로 된다.  
  
> #### 느낀 점  
---  
  
Caddy 요놈 물건이다.  
과거에 apache 웹서버 만져보다가 nginx로 넘어갔을때 신세계를 느꼈고  
traefik 만지면서 세상이 변했구나를 체감했는데  
caddy도 그러하다.  
nginx 설정이 이것저것 만지다보면 제법 길어지는데 caddy 설정 너무 편하다.  
  
당분간 메인 웹서버는 캐디로 두고 트래픽은 도커 컨테이너 연결성에서 좀 독보적이라 서브 웹서버로  
웹서버 양강 체제로 운영해야겠다.  
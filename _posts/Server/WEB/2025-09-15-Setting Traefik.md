---
title: "Traefik 구축, 설정"
description: "Traefik 첫 구축, 설정"
date: "2025-09-15 15:00:00 +0900"
last_modified_at: "2025-09-15 15:00:00 +0900"
categories: 
  - Server/WEB/
tags: [SERVER, WEB, 도커, 구축, 설정, TRAEFIK]
author: movingwoo
---
> #### 머리말  
---  
  
원래 이번 3호기 구축하며 cloudflare tunnel을 사용해볼 생각이었다.  
포트를 열지 않고 보안을 cloudflare에 맡겨버리는게 상당히 매력적인 선택지다.  
  
보안 설정을 직접 해야한다면 상당히 피곤하지만 재미는 있다.  
만약 cloudflare tunnel을 쓰지 않고 직접 포트 열고 웹서버를 구축해서 사용한다면?  
  
nginx 정도는 여러 번 사용해봤고, SSL 인증서 자동 갱신을 위해 acme-companion까지 사용해본 적 있다.  
한 번 설정하면 다시는 손대기 싫은게 단점이었는데  
{% include colored_text.html color="orange" text="**traefik**" %}을 사용하면 더 적은 설정으로 HTTPS, 라우팅, 보안 미들웨어까지 해결해준다고 한다.  
  
경험삼아 traefik을 한 번 설정해보자.  
  
> #### Traefik이란?  
---  
  
![img01](/assets/images/posts/Server/WEB/2025-09-15-Setting Traefik/img01.webp)  
  
요 캐릭터는 많이 봤다.  
  
traefik은 {% include colored_text.html color="orange" text="**레이블 기반 선언형 라우팅**" %}을 사용해서  
각 서비스 컨테이너에 레이블만 달아주면 알아서 도메인 매핑, 경로 라우팅을 해준다.  
traefik {% include colored_text.html color="orange" text="**자체적으로 인증서 발급, 갱신**" %}을 해주기도 한다.  
보안 미들웨어도 내장하고 있고, 로그 경로를 호스트에 마운트해서 fail2ban과 연계할 수도 있다.  
  
레이블만 대충 바꿔주면 된다는 점이 매력포인트다.  
관리포인트는 적어질수록 좋다.  
  
대시보드도 제공하는데 별로 필요없어 보여서 대시보드는 제외하고 설정한다.  
괜히 쓸데없는 노출이 늘어나는 것이기도 하다.  
그냥 로그 보면 다 나오는데 뭔 대시보드야  
  
> #### 설정 및 기동  
---  
  
##### 1. docker-compose.yml  
  
도커로 올린다.  
레이블 설정까지 정상적으로 먹히는지 확인하기 위해 빈 서비스로 tomcat 깡통을 하나 같이 올린다.  
  
fail2ban 적용을 위한 로그와 공통 설정파일을 밖으로 빼고  
tomcat 에는 label만 잘 맞춰준다.  
  
ratelimit은 앞으로의 사용을 고려해 조절해야하는데  
우선 테스트를 위해 일반적인 웹 요청에 적당한 값으로 세팅했다.  
  
```yml
networks:
  proxy:
    external: false

services:
  traefik:
    image: traefik:3.5.2
    restart: unless-stopped
    networks: [proxy]
    ports:
      - "80:80"
      - "443:443"
    command:
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --entrypoints.web.http.redirections.entryPoint.to=websecure
      - --entrypoints.web.http.redirections.entryPoint.scheme=https
      - --providers.docker=true                    # 도커 레이블로 라우팅/미들웨어 정의
      - --providers.docker.exposedbydefault=false  # 레이블에 enable=true 있는 컨테이너만 공개
      - --providers.file.directory=/dynamic
      - --certificatesresolvers.le.acme.tlschallenge=true
      - --certificatesresolvers.le.acme.email=id@mail.com
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
      - --accesslog=true
      - --accesslog.filepath=/var/log/traefik/access.log
      - --log.level=INFO
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
      - ./logs/traefik:/var/log/traefik  # fail2ban 위한 로그
      - ./dynamic:/dynamic:ro 
    security_opt:
      - no-new-privileges:true
    labels:
      - traefik.enable=true
      - traefik.http.middlewares.sec-headers.headers.stsSeconds=300               # HSTS 테스트용 5분
      - traefik.http.middlewares.sec-headers.headers.stsIncludeSubdomains=true
      - traefik.http.middlewares.sec-headers.headers.stsPreload=true
      - traefik.http.middlewares.sec-headers.headers.contentTypeNosniff=true
      - traefik.http.middlewares.sec-headers.headers.frameDeny=true
      - traefik.http.middlewares.ratelimit.ratelimit.average=20  # 초당 평균 허용 요청수
      - traefik.http.middlewares.ratelimit.ratelimit.burst=40    # 버스트

  tomcat:
    image: tomcat:10-jdk17-corretto   # 테스트용 Tomcat 10
    restart: unless-stopped
    networks: [proxy]
    labels:
      - traefik.enable=true
      - traefik.http.routers.tomcat.rule=Host(`test.domain.io`)       # 도메인
      - traefik.http.routers.tomcat.entrypoints=websecure             # HTTPS에서만 서비스
      - traefik.http.routers.tomcat.tls.certresolver=le               # 위에서 정의한 ACME resolver
      - traefik.http.routers.tomcat.tls.options=strict-tls@file       # 파일 프로바이더의 TLS 정책
      - traefik.http.routers.tomcat.middlewares=sec-headers,ratelimit # 공통 미들웨어
      - traefik.http.services.tomcat.loadbalancer.server.port=8080    # 컨테이너 내부 포트
```
  
추후 서브 도메인만 변경해 다른 앱을 올릴 경우  
서비스 레이블에 다른 도메인을 세팅해주면 해당 도메인으로 인증서를 발급받아준다.  
  
##### 2. 기동  
  
![img02](/assets/images/posts/Server/WEB/2025-09-15-Setting Traefik/img02.webp)  
  
![img03](/assets/images/posts/Server/WEB/2025-09-15-Setting Traefik/img03.webp)  
  
{% include colored_text.html color="orange" text="**docker compose up -d**" %} 명령어로 기동한다.  
정상적으로 컨테이너가 올라간 것을 보고 docker logs 명령어로 오류가 없는지 확인한다.  
로그가 전부 INFO 레벨인걸 보니 이상이 없어보인다.  
  
브라우저로 접근해보자.  
  
![img04](/assets/images/posts/Server/WEB/2025-09-15-Setting Traefik/img04.webp)  
  
TLS 인증서가 적용되어있고, 404 페이지가 뜬다.  
깡통 톰캣 컨테이너에 아무것도 들어있지 않아 404가 뜨는거라 정상적인 접근이다.  
  
##### 3. fail2ban 연동  
  
필터를 새롭게 설정하여 fail2ban 연동을 진행한다.  
이 부분 또한 실제 사용에 따라 세부 설정이 필요한데  
우선은 테스트로 적당히 값 집어넣어서 설정한다.  
  
{% include colored_text.html color="orange" text="**429, 404, 시그니처 스캔 필터**" %} 3가지를 만든다.  
429는 traefik이 429 Too Many Requests로 거른 요청들을 차단하고  
시그니처 스캔 필터는 /.git /wp-login.php 등 잘 알려진 취약점이나 관리 페이지 경로를 차단한다.  
  
추후 모든 요청(성공 포함)이나 봇 요청에 대한 필터를 추가할 수 있겠다.  
  
```shell
# /etc/fail2ban/jail.d/traefik-access.conf
  
[DEFAULT]
action = ufw
logpath = /app/logs/traefik/access.log
backend = auto

[traefik-rate-429]
enabled  = true
filter   = traefik-rate-429
maxretry = 5
findtime = 60
bantime  = 3600

[traefik-rate-404]
enabled  = true
filter   = traefik-rate-404
maxretry = 10
findtime = 600
bantime  = 3600

[traefik-scan]
enabled  = true
filter   = traefik-scan
findtime = 600
maxretry = 3
bantime  = -1
```
  
```shell
# /etc/fail2ban/filter.d/traefik-rate-429.conf
[Definition]
failregex = ^<HOST> .* ".*" 429 .*
ignoreregex =

# /etc/fail2ban/filter.d/traefik-rate-404.conf
[Definition]
failregex = ^<HOST> .* ".*" 404 .*
ignoreregex =

# /etc/fail2ban/filter.d/traefik-scan.conf
[Definition]
failregex = ^<HOST> .* "(GET|POST|HEAD) .*(/wp-login\.php|/wp-admin|/xmlrpc\.php|/phpmyadmin|/pma/|/vendor/phpunit|/\.env|/\.git/|/server-status|/actuator|/manager/html|/jmx-console|/HNAP1|/boaform|/config\.json|/id_rsa|/adminer\.php|/shell\.php)" .*
ignoreregex =
```
  
![img05](/assets/images/posts/Server/WEB/2025-09-15-Setting Traefik/img05.webp)  
  
fail2ban을 재기동하여 필터를 확인한다.  
현재는 tomcat 깡통이 전부 404 Not Found로 빠지기 때문에 404 필터에 실패 요청이 쌓여있다.  
  
##### 4. 로그 분리  
  
access.log는 한 파일에 계속해서 쌓이기 때문에 분리할 필요가 있다.  
fail2ban이 놓치지 않게 copytruncate 방식으로 logrotate 규칙을 설정한다.  
  
오래된 RHEL 계열 서버에서는 따로 crontab 등록했던 거 같은데...  
요즘엔 알아서 돌려주나보다.  
편하다 편해.  
  
```shell
# /etc/logrotate.d/traefik

/app/logs/traefik/access.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  copytruncate
}
```
  
> #### 꼬리말  
---  
  
traefik 설정이 굉장히 쉽고 간편해서 빠르게 끝났다.  
nginx 쓸때는 100% 에러 뿜뿜하고 트러블슈팅 들어가야할텐데 말이다.  
  
언젠가 cloudflare 의존 없이 직접 제어해야할 상황이 온다면 본격적으로 traefik을 사용해볼 것 같다.  
첫 인상이 아주 좋다.  
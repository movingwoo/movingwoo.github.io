---
title: "Nextcloud 설치"
description: "도커 활용 Nextcloud 첫 설치"
date: "2025-09-17 17:00:00 +0900"
last_modified_at: "2025-09-17 17:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, 도커, NEXTCLOUD]
author: movingwoo
---
> #### 머리말  
---  
  
1호기에 Nextcloud가 있긴 했는데  
보안관리가 귀찮아 잘 안쓰고 있었다.  
  
뭐 파일도 몇 개 없었으니 이 기회에 새로 올리자.  
  
> #### Nextcloud 란?  
---  
  
![img01](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img01.webp)  
  
{% include colored_text.html color="orange" text="**Nextcloud**" %}는 오픈소스 기반 클라우드 스토리지 및 협업 플랫폼이다.  
협업할 일은 없으니 갖다치우고, 오픈소스 스토리지 서비스를 이용한다고 보면 된다.  
  
확장성이 좋고 제공하는 앱이 다양해 기능이 상당히 강력하다.  
그만큼 무거워지기 쉬운 점은 단점이다.  
  
이런 서비스 특성 상 보안이슈 터지면 감당이 안되는데  
클라우드플레어 방패 뒤에 숨으면 보안 부담을 상당히 덜 수 있다.  
  
> #### 계획  
---  
    
[Nextcloud All-in-One - github](https://github.com/nextcloud/all-in-one#nextcloud-all-in-one)  
  
예전에는 없었던 것 같은데  
github에 올인원 설치 가이드가 생겼다.  
내용이 굉장히 알차게 작성되어있어 정독할 필요가 있다.  
  
![img02](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img02.webp)  
  
읽는 중 이 부분이 눈에 밟혔는데...  
Cloudflare Tunnel 사용 시 발생할 수 있는 문제점에 관해 다루고 있다.  
이 때문에 Tailscale 사용을 권장하고 있다.  
  
일단 써보고 뭐가 문제인지 몸으로 파악하자...  
Tailscale은 예전에 들어본 적 있긴한데 언젠가 한 번 써볼 기회가 올지 모르겠다.  
  
DB는 Mysql(MariaDB), Postgres, SQLite 3개를 지원하는 것으로 보인다.  
SQLite는 집어치우고 {% include colored_text.html color="orange" text="**MariaDB**" %}를 선택한다.  
Postgres가 좋은 DB라고 알고는 있는데 직접 써본 경험이 너무 적어서 꺼려진다.  
  
1호기 당시 최대한 가볍게 구동하려 Redis를 제외했는데  
3호기는 스펙이 빵빵하니 {% include colored_text.html color="orange" text="**Redis**" %}를 추가한다.  
  
> #### 설치  
---  
  
#### 1. docker-compose.yml 작성  
  
[Nextcloud - Docker Hub](https://hub.docker.com/_/nextcloud)  
  
![img03](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img03.webp)  
  
도커 허브에 기초적인 yml 작성 가이드가 있다.  
이를 토대로 작성하되 커스텀이 필요하다.  
  
마리아디비는 안정적인 것 같은 {% include colored_text.html color="orange" text="**10.11**" %} 버전을 하고  
redis는 {% include colored_text.html color="orange" text="**7.2**" %} 버전에 최대한 가벼운 {% include colored_text.html color="orange" text="**alpine**" %} 이미지를 선택한다.  
nextcloud는 {% include colored_text.html color="orange" text="**31**" %}버전에 {% include colored_text.html color="orange" text="**apache**" %}가 포함된 이미지를 선택한다.  
  
```yml
services:
  database:
    image: mariadb:10.11
    restart: unless-stopped
    command: --transaction-isolation=READ-COMMITTED --binlog-format=ROW --skip-log-bin --innodb-file-per-table=1 # command 추가
    environment:
      MYSQL_ROOT_PASSWORD: 
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: 
    volumes:
      - /app/nextcloud/mysql:/var/lib/mysql
    healthcheck: # 헬스체크용 추가
      test: "mysqladmin ping -h localhost"
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7.2-alpine
    restart: unless-stopped
    command: 
      - redis-server
      - --appendonly yes
    volumes:
      - /app/nextcloud/redis:/data

  app: # 앱 본체
    image: nextcloud:31-apache
    restart: unless-stopped
    depends_on:
      - database
      - redis
    ports:
      - 8080:80
    environment:
      MYSQL_HOST: database
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: 
      REDIS_HOST: redis
      PHP_MEMORY_LIMIT: 1024M
      PHP_UPLOAD_LIMIT: 10G
      NEXTCLOUD_TRUSTED_DOMAINS: "domain"
    volumes:
      - nextcloud_html:/var/www/html 
      - /app/nextcloud/data:/var/www/html/data 
      - /app/nextcloud/config:/var/www/html/config 
      - /app/nextcloud/custom_apps:/var/www/html/custom_apps 
      - /app/nextcloud/themes:/var/www/html/themes 

  cron: # 크론
    image: nextcloud:31-apache
    restart: unless-stopped
    depends_on: 
      - database
      - redis
    volumes:
      - nextcloud_html:/var/www/html
      - /app/nextcloud/data:/var/www/html/data 
      - /app/nextcloud/config:/var/www/html/config 
      - /app/nextcloud/custom_apps:/var/www/html/custom_apps 
      - /app/nextcloud/themes:/var/www/html/themes 
    entrypoint: /cron.sh

volumes: # 크론에서 이용하기 위한 공유 볼륨
  nextcloud_html:
```
  
#### 2. 기동 및 설치  
  
기동 전 nextcloud 기준 /var/www/html 하위 폴더에 대한 권한을 줘야한다.  
www-data 계정에 권한을 줘야하는데 uid, gid가 33이다.  
{% include colored_text.html color="orange" text="**chown -R 33:33 대상폴더**" %} 명령어로 일괄 권한부여를 진행한다.  
  
예전 설치했을 때 볼륨을 따로 잡아두고 권한을 주지 않으면 설치 시 권한 오류가 발생해서 재기동이 필요했다.  
  
![img04](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img04.webp)  
  
이후 {% include colored_text.html color="orange" text="**docker compose up -d**" %} 명령어로 기동  
  
![img05](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img05.webp)  
  
브라우저로 접속 시 초기화면이 나온다.  
관리자 계정을 설정하면 최초 설치를 진행하고  
추천 앱을 설치하든 말든 하면 메인화면을 확인할 수 있다.  
  
![img06](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img06.webp)  
  
#### 3. 추가 설정  
  
이대로 그냥 쓸 수 있긴한데 추가 설정을 일부 진행한다.  
  
![img07](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img07.webp)  
  
yml에 옵션 넣은 부분도 혹시 모르니 재확인한다.  
redis를 명확히 지정하고 백그라운드 작업도 크론으로 설정한다.  
  
이전에 백그라운드 작업을 ajax로 했더니 성능이 속터질정도로 답답했던 기억이 있다.  
  
그리고 클라우드플레어 업로드 제한을 회피하기 위해 청크 사이즈를 설정한다.  
여유있게 {% include colored_text.html color="orange" text="**94371840 byte**" %}로 설정한다.  
  
```shell
# 리전
php occ config:system:set default_phone_region --value=KR
# redis 관련
php occ config:system:set memcache.local --value='\OC\Memcache\APCu'
php occ config:system:set memcache.locking --value='\OC\Memcache\Redis'
php occ config:system:set redis host --value='redis'
php occ config:system:set redis port --value='6379' --type=integer
# 크론 설정
php occ background:cron
# 청크 사이즈 설정 (100mb 제한 회피)
php occ config:app:set files max_chunk_size --value 94371840
# 신뢰할 수 있는 도메인
php occ config:system:set overwrite.cli.url --value="https://도메인"
# mimetype 마이그
php occ maintenance:repair --include-expensive
```
  
어디까지 설정해야 하느냐가 문제인데...  
관리자 메뉴의 보안 쪽을 보면 nextcloud에서 시스템 확인 후 {% include colored_text.html color="red" text="**보안 경고**" %}를 보여준다.  
  
![img08](/assets/images/posts/Server/Service/2025-09-17-Install Nextcloud/img08.webp)  
  
보안경고를 모두 없앤다는 생각으로 설정을 진행하면 된다.  
  
> #### 꼬리말  
---  
  
1호기 때 고생을 많이 했더니 굉장히 쉽게 설치했다.  
yml 새로 작성하기는 머리가 아팠지만 덕분에 결과물이 만족스럽다.  
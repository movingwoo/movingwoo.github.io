---
title: "OnlyOffice 서버 추가 구성"
description: "NextCloud + OnlyOffice 서버 추가 구성"
date: "2025-10-15 14:00:00 +0900"
last_modified_at: "2025-10-15 14:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, 도커, NEXTCLOUD, ONLYOFFICE]
author: movingwoo
---
> #### 시작  
---  
  
넥스트클라우드 앱을 보면 다양한 앱이 있는데  
기본적으로 딸려 설치되는 앱 중 PDF viewer 앱을 사용하면 pdf를 보는데는 문제가 없다.  
  
하지만 엑셀이나 워드, 파워포인트 문서는 웹에서 뷰잉이 불가능하고 다운로드를 받아야한다.  
마소의 제 3자 문서 형식이라 어쩔 수 없는 부분이긴 한데  
웹에서 이놈들을 읽고 편집하려면 어떻게 해야하지?  
  
> #### Collabora Online와 Only Office  
---  
  
넥스트클라우드의 앱 메뉴에서 오피스 및 텍스트 섹션에 여러 문서 앱이 있다.  
이 중 사람들이 가장 많이 사용하는 것은 {% include colored_text.html color="orange" text="**Nextcloud Office**" %}와 {% include colored_text.html color="orange" text="**ONLYOFFICE**" %}의 2종이다.  
  
![img01](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img01.webp)  
  
![img02](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img02.webp)  
  
Nextcloud Office는 Collabora라는 오피스 제품인데 반쯤 넥스트 클라우드 공식으로 여겨지고 있는 듯 하다.  
둘을 비교해보면 대충 아래와 같다.  
  
| 항목                | Collabora (Nextcloud Office 기반)                                                                 | ONLYOFFICE                                                                 |
|---------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| **엔진 / 기반**     | LibreOffice 기반. 서버에서 문서 렌더링 후 클라이언트에 타일/이미지 전송.                           | 클라이언트 측 편집 중심, 서버는 동기화/연산 담당.                           |
| **파일 포맷 / 호환성** | ODF(odt, ods 등) 기본 지원 강함. MS Office 포맷(docx, xlsx)은 지원하나 변환 오차 가능성 있음.       | OOXML(docx, xlsx, pptx) 호환성에 중점. 원본과 비슷한 레이아웃 유지 강점.    |
| **리소스 요구**     | 서버에서 대부분 연산 처리 → 동시 접속 많으면 CPU/RAM 부담 큼.                                       | 클라이언트 자원 활용 비중 높음 → 서버 부담 상대적으로 적음.                 |
| **기능 범위**       | LibreOffice의 고급 기능들을 비교적 많이 제공. 복잡한 문서 편집 기능 강점.                           | UI/UX가 직관적이고 MS Office와 유사. 단, 일부 고급 기능은 제한될 수 있음.  |
| **통합성**          | Nextcloud와 긴밀히 협력. Nextcloud Office의 기본 백엔드로 쓰임.                                     | 독립 제품. Nextcloud와도 잘 연동되지만 기본 통합은 아님.                   |
| **문제 / 버그**     | 성능 저하, 메모리 과다 사용 보고 사례 있음.                                                         | 과거 문서 저장/캐시 관련 버그 사례 있음.                                   |
  
정리하면, Collabora는 Nextcloud Office 앱으로 나올 정도로 긴밀하게 협력하고 있으며 리브레 오피스 기반인게 좋고  
Only Office는 MS 문서 호환이 잘되며 서버 부담이 적은게 좋다.  
  
기본적으로 나는 {% include colored_text.html color="orange" text="**공식**" %} 과 {% include colored_text.html color="orange" text="**기본**" %} 을 좋아한다.  
애플 맥세이프 배터리팩을 산 호구가 바로 나다.  
  
하지만 Collabora 사용에 문제가 있었으니...  
  
> #### Cloudflare 구성의 문제  
---  
  
현재 넥스트클라우드 서버는 클라우드플레어 터널을 통해 내부로 접근할 수 있게 해두었다.  
이 클라우드플레어가 문제가 되었다.  
  
기본적으로 collabora든 onlyoffice든 nextcloud 서버와 쌍방 통신이 되어야한다.  
여기에 클라우드플레어가 끼어들면서 {% include colored_text.html color="orange" text="**access 정책을 만족하지 못해 403오류**" %}로 떨어져버린다.  
넥스트클라우드와 오피스서버 통신이 안되니 뭐 어떻게 할 방법이 없다!!  
  
![img03](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img03.webp)  
  
지난번 확인했던 cloudflare 사용 시의 주의사항이다.  
{% include colored_text.html color="red" text="**collabora does not work out of the box behind Cloudflare**" %} 라고 명확하게 써있다아뿔싸!!!!!  
해결하기 위해 IP 범위를 등록하라고 하는데 이것도 문제가 있다.  
  
당연히 내 공인 IP를 넣어주면 될 줄 알았는데  
{% include colored_text.html color="orange" text="**공인 IP를 넣어도 403오류**" %}가 발생했다.  
디버깅 결과 172로 시작하는 cloudflare 프록시로 추정되는 IP로 찍히고 있었다.  
또 클라우드플레어 너야???  
  
해당 IP를 열어주면 문 활짝 열고 이랏샤이마세 하는 것과 비슷하기 때문에 IP 등록은 포기.  
  
[Nextcloud Community](https://help.nextcloud.com/)  
  
![img04](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img04.webp)  
  
커뮤니티 포럼에서 뒤져보니 cloudflare 이용 시 발생하는 문제에 관한 사용자들의 수많은 아우성이 존재한다.  
  
사용자들의 성공적인 사례를 참조해보았는데  
cloudflare 치우고 웹서버 오픈, 엄격한 보안설정하는 방안은 관리가 너무 귀찮을 것 같아서 제외한다.  
  
nextcloud 공식에서 추천하는 tailscale을 이용해 vpn 환경을 새로 구성하는 방안도 있었는데  
아 vpn 매번 키고 끄기 너무 귀찮을걸?  
손 안대는게 맞다고 생각했다.  
  
이건 뭐 정말 방법이 없는걸까?  
  
> #### 수많은 실패와 성공적인 구성  
---  
  
성공적으로 오피스 서버를 구성하기 위해 아래의 조건이 필요했다.  
- onlyoffice
  - 고급 설정에서 {% include colored_text.html color="orange" text="**내부 통신**" %} 설정
- web server
  - {% include colored_text.html color="orange" text="**동일 도메인 내**" %} context로 서버 분기
  
#### 1. onlyoffice  
  
앞서 언급한 바와 같이 cloudflare가 끼면서 넥스트클라우드와 오피스서버 간 통신이 원활하지 않다.  
  
판단하기로 collabora는 현재 구성에서는 적용이 전혀 불가능한데  
onlyoffice는 적용이 가능하다.  
  
![img05](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img05.webp)  
  
onlyoffice 커넥터 설정 화면이다.  
고급 설정에서 {% include colored_text.html color="orange" text="**내부 요청을 위한 http 주소 설정**" %}이 별도로 가능하다.  
collabora는 반드시 https 도메인을 통해야했는데 onlyoffice는 컨테이너 간 내부 통신이 가능해보인다.  
cloudflare를 거치지 않으면 아무 문제 없지 않을까?  
  
#### 2. web server  
  
그럼에도 불구하고, 아무튼 오피스 서버에 붙을 수 있는 도메인은 마련해줘야했다.  
오피스용 서브도메인을 새로 파서 적용 후, cloudflare access 정책을 제거해보았다.  
  
access 정책이 없으므로 nextcloud에서 office 서버로 통신은 아무 이상 없었지만  
{% include colored_text.html color="orange" text="**office 서버에서 nextcloud로 통신 시 cloudflare access 정책에 걸려 403**" %}이 떨어진다.  
  
내부 주소 설정과 별개로 대표 오피스 주소로 통신할 일이 있나보다...  
결국 오피스 서버와 넥스트클라우드가 같은 네트워크에 존재하게 하고 access 정책을 회피해야하는데  
cloudflare 정책을 건드려서 설정하기엔 무료 플랜에서 한계가 있었다.  
  
따라서 {% include colored_text.html color="orange" text="**웹서버**" %}를 두고 오피스 서버용 요청만 오피스 서버로 넘어가게 분기를 걸었다.  
onlyoffice는 이 설정으로 200 성공이 떨어졌는데  
collabora는 context 분기 시 다른 오류가 발생하여 사용할 수 없었다.  
  
> #### 기동 및 연동  
---  
    
[ONLYOFFICE - dockerhub](https://hub.docker.com/r/onlyoffice/documentserver)  
  
이미지는 {% include colored_text.html color="orange" text="**documentserver**" %} 이미지를 사용한다.  
ee는 엔터프라이즈용이고 무료인 커뮤니티 에디션이 그냥 documentserver 이미지이다.  
  
웹서버는 해외 포럼들 뒤져보면 caddy를 많이 사용하고  
내가 익숙한건 nginx인데  
설정 관리 포인트를 줄이고 싶어서 {% include colored_text.html color="orange" text="**traefik**" %}을 사용한다.  
볼륨을 따로 잡을 필요가 없으며 설정 변경시 yml의 label 항목만 변경하면 된다.  
  
#### 1. traefik  
  
yml에 traefik 컨테이너를 추가한다.  
네트워크도 추가하는데, 트래픽 분기용 traefik_net과 넥스트클라우드 구성에 포함될 nextcloud_net 2개로 만든다.  

```yaml
networks:
  traefik_net:
    driver: bridge
  nextcloud_net:
    driver: bridge

services:
  traefik:
    image: traefik:v3.5.3
    restart: unless-stopped
    networks:
      - traefik_net
      - nextcloud_net
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
    ports:
      - 80:80
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    labels:
      - "traefik.enable=true"
```
  
다른 서비스들에도 네트워크 설정을 해주고  
제일 중요한 nextcloud 서비스에 레이블을 잔뜩 붙여준다.  
  
/office를 오피스 서버로 넘어가기로 결정했다면  
{% include colored_text.html color="orange" text="**해당 prefix만 제외**" %}하고 넥스트클라우드로 넘어오게 하고  
{% include colored_text.html color="orange" text="**우선도를 낮게**" %} 하여 오피스 서버로 갈 요청을 우선 판단하게 한다.  
  
```yaml
labels:
  - "traefik.enable=true"
  # 오피스 서버로 넘어갈 /office 컨텍스트 제외
  - "traefik.http.routers.app.rule=Host(`my.domain.com`) && !PathPrefix(`/office`)"
  - "traefik.http.routers.app.entrypoints=web"
  - "traefik.http.services.app.loadbalancer.server.port=80"
  # 우선도를 낮게 유지
  - "traefik.http.routers.app.priority=1"
  - "traefik.http.middlewares.app-httpshdr.headers.customrequestheaders.X-Forwarded-Proto=https"
  - "traefik.http.middlewares.app-httpshdr.headers.customrequestheaders.X-Forwarded-Host=my.domain.com"
  - "traefik.http.routers.app.middlewares=app-httpshdr@docker"
```
  
#### 2. onlyoffice  
  
환경변수에 {% include colored_text.html color="orange" text="**JWT_SECRET**" %}은 나중에 설정 시 입력해야하니 잘 기억해야한다.  
레이블에 이것저것 막 넣다보니 엄청나게 길어졌는데  
아무튼 저렇게 쓰니까 되니 좋았쓰  
  
```yaml
office:
  image: onlyoffice/documentserver:latest
  restart: unless-stopped
  networks:
    - traefik_net
    - nextcloud_net
  depends_on:
    - app
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=
    - JWT_HEADER=Authorization
  labels:
    - "traefik.enable=true"
    # 명시적으로 지정 안하니 오류나서
    - "traefik.docker.network=traefik_net"
    # /office는 전부 onlyoffice를 통하도록
    - "traefik.http.routers.office.rule=Host(`my.domain.com`) && (PathPrefix(`/office`) || Path(`/office`))"
    - "traefik.http.routers.office.entrypoints=web"
    # 우선도를 넥스트클라우드보다 높게 설정
    - "traefik.http.routers.office.priority=100"
    - "traefik.http.services.office.loadbalancer.server.port=80"
    # /office 잘라서 백엔드로 전달
    - "traefik.http.middlewares.office-strip.stripprefix.prefixes=/office"
    - "traefik.http.middlewares.office-strip.stripprefix.forceSlash=true"
    - "traefik.http.middlewares.office-httpshdr.headers.customrequestheaders.X-Forwarded-Proto=https"
    - "traefik.http.middlewares.office-httpshdr.headers.customrequestheaders.X-Forwarded-Host=my.domain.com"
    - "traefik.http.middlewares.office-httpshdr.headers.customrequestheaders.X-Forwarded-Prefix=/office"
    # 마지막 / 없는 접근 방지
    - "traefik.http.middlewares.office-slash.redirectregex.regex=^(.*/office)$"
    - "traefik.http.middlewares.office-slash.redirectregex.replacement=$${1}/"
    - "traefik.http.middlewares.office-slash.redirectregex.permanent=true"
    - "traefik.http.routers.office.middlewares=office-slash@docker,office-strip@docker,office-httpshdr@docker"
```
  
#### 3. 기동  
  
![img06](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img06.webp)  
  
기동 시 onlyoffice 로그를 확인해보면 이것저것 바쁘게 설치하는게 보인다.  
nginx도 있고 postgre도 있고 rabbitmq도 있고 뭐가 많다.  
어쩐지 이미지가 묵직하더라니  
  
![img07](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img07.webp)  
  
넥스트클라우드 앱 메뉴에서 ONLYOFFICE를 설치하고 활성화한다.  
얘가 일종의 커넥터 역할을 하는 듯 하다.  
  
![img08](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img08.webp)  
  
이후 관리자 설정 메뉴의 ONLYOFFICE 섹션에서 도메인과 내부 주소를 넣고  
JWT_SECRET을 넣어주고 저장을 눌렀을 때 오류가 안나면 성공이다.  
  
![img09](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img09.webp)  
  
테스트를 위해 엑셀로 Hello World 파일을 만든다.  
이놈을 업로드해보자.  
  
![img10](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img10.webp)  
  
자동으로 썸네일 이미지를 왼쪽에 만들어준다.  
저 문서 자체에 내용이 없어서 새하얗게 보이는데 내용이 가득하면 썸네일도 제대로 보일 것이다.  
  
![img11](/assets/images/posts/Server/Service/2025-10-15-Install Only Office Server/img11.webp)  
  
클릭해보면 다운로드가 아니라 onlyoffice를 통해 웹에서 내용을 수정, 편집할 수 있다.  
UI가 MS랑 유사해서 이질감이 적다.  
  
아 이정도면 아주 훌륭하지  
{% include colored_text.html color="red" text="**이제 나도 쓸 수 있다 웹 오피스**" %}  
  
> #### 마무리  
---  
  
한계가 있다면  
일부 고급기능(얼마나 고급기능인지 잘 모르겠음)은 사용할 수 없다고 하고  
모바일에서 편집하려면 유료 라이선스가 필요하다.  
  
하지만 모바일로 편집할 일은 딱히 없을 것 같고 열리긴 잘 열리며  
문서 내 간단한 SUMIF 같은 함수들도 잘 동작한다.  
  
추석 전 부터 어떻게든 웹 오피스의 꿈을 이루려 노력했는데 상당히 오래걸렸다.  
중간에 마음이 꺾여서 웹 뷰어로 우회하려 했지만 포기하지 않길 잘했구나  
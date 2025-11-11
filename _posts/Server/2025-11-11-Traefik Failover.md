---
title: "시스템 장애 복구 - docker와 traefik"
description: "traefik 장애 원인 분석 및 복구"
date: "2025-11-11 11:00:00 +0900"
last_modified_at: "2025-11-11 11:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, ubuntu, 장애, 복구, traefik, docker]
author: movingwoo
---
> #### 상황  
---  
  
개인이 할 수 있는 최고의 보안 대책은 최신 업데이트이다.  
때문에 시간이 될 때마다 업데이트를 돌려주곤 하는데...  
  
아무 생각없이 업데이트 진행 후 서비스 접속 시 {% include colored_text.html color="orange" text="**404 page not found**" %} 오류가 다수 발생하기 시작했다.  
  
![img01](/assets/images/posts/Server/2025-11-11-Traefik Failover/img01.webp)  
  
{% include colored_text.html color="red" text="**아니 이게 무슨 일이야!!!!**" %}  
  
> #### 원인 분석  
---  
  
우선 내부 컨테이너는 모두 정상 구동 중이다.  
도커 서비스와 클라우드플레어 서비스도 정상이다.  
  
각 컨테이너 로그를 확인해보니 범인의 윤곽이 보인다.  
  
![img02](/assets/images/posts/Server/2025-11-11-Traefik Failover/img02.webp)  
  
메시지는 명확하다.  
{% include colored_text.html color="orange" text="**1.24 버전이 너무 오래되었으니 최소 지원 버전인 1.44 이상으로 맞춰달라는 것.**" %}  
  
여기서 말하는 API 버전은 도커 API 버전이다.  
최신 업데이트를 진행하며 {% include colored_text.html color="orange" text="**최소 지원 버전이 1.24 -> 1.44**" %}로 높아졌는데  
트래픽에서 아직 1.24를 사용하는 건가 싶다.  
하지만 트래픽도 최신 이미지를 사용하는 중인데...  
아니면 도커 소켓이나 데몬에 문제가 있을 수도 있다.  
  
트래픽 컨테이너 안에서 도커 소켓을 직접 호출해본다.  
  
![img03](/assets/images/posts/Server/2025-11-11-Traefik Failover/img03.webp)  
  
최소 API 버전은 1.44로 나오며
1.24 버전 강제 호출 시 같은 400 Bad Request 응답이 돌아온다.  
이러면 도커 소켓은 정상이고 트래픽이 1.24로 호출 중일 확률이 높다.  
  
[Docker Engine 29 release notes](https://docs.docker.com/engine/release-notes/29/)  
  
![img04](/assets/images/posts/Server/2025-11-11-Traefik Failover/img04.webp)  
  
오늘 아침에 도커 엔진이 29로 업데이트가 되었기 때문에 릴리즈 노트를 확인해본다.  
1.44 부터 필요하다는 내용이 확실히 있다.  
  
즉, 트래픽은 1.24 버전 API를 사용하는데  
도커 엔진 업데이트로 인해 최소 1.44 버전 API를 요구해서  
트래픽이 도커 provider 초기화가 실패, 라우팅 실패, 404로 떨어진다는 뜻이다.  
  
[Traefik Docker provider - pkg.go.dev](https://pkg.go.dev/github.com/traefik/traefik/v3/pkg/provider/docker)  
  
![img05](/assets/images/posts/Server/2025-11-11-Traefik Failover/img05.webp)  
  
Go 패키지 확인 시 DockerAPIVersion이 1.24로 상수로 선언되어 있다.  
별다른 튜닝이나 업데이트가 가해지지 않았다면 아마 1.24로 동작할 것이다.  
  
> #### 조치  
---  
  
가장 좋은 방법은 traefik에서 1.44 이상의 API를 사용하는 것인데  
겨우 그걸 위해 traefik 커스텀 이미지를 빌드하기는 아주 귀찮다.  
  
언젠가 공식적인 지원을 기다리도록 하고  
당장 해결 가능한 방법은 {% include colored_text.html color="orange" text="**도커 엔진 버전을 내리는 것**" %}이다.  
  
![img06](/assets/images/posts/Server/2025-11-11-Traefik Failover/img06.webp)  
  
{% include colored_text.html color="orange" text="**apt-cache madison docker-ce**" %} 명령어로 버전을 확인해본다.  
최신 29.0.0 빌드에서 문제가 생겼으므로 바로 아래의 28.5.2 빌드로 내리면 정상동작 할 것이다.  
{% include colored_text.html color="orange" text="**docker-ce**" %} 외에 {% include colored_text.html color="orange" text="**docker-ce-cli, docker-compose-plugin, docker-buildx-plugin, containerd.io**" %} 패키지도 버전을 체크한다.  
  
![img07](/assets/images/posts/Server/2025-11-11-Traefik Failover/img07.webp)  
  
![img08](/assets/images/posts/Server/2025-11-11-Traefik Failover/img08.webp)  
  
다운그레이드 후 {% include colored_text.html color="orange" text="**apt-mark hold**" %} 명령어로 업데이트 되지 않도록 패키지를 고정한다.  
  
> #### 추후 방안  
---  
  
당장은 docker 버전을 현 상태로 유지하는 수 밖에 없어보인다.  
  
추후 traefik 공식 릴리즈를 확인하여 docker API 버전 관련 내용이 있으면  
패키지 고정한걸 풀어서 업데이트를 진행하면 되겠다.  
  
그동안 생각없이 써왔는데  
도커가 제법 종속적이며 버전에 민감하다는 걸 알았다.  
으윽 나는 최신 업데이트를 하지 않으면 두드러기가 올라오는 병이 있는데  
  
---
title: "Glances 활용 모니터링"
description: "Glances 활용 모니터링 최초 구성"
date: "2026-06-19 10:00:00 +0900"
last_modified_at: "2026-06-19 10:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, GLANCES, 모니터링]
author: movingwoo
---
> #### 개요  
---  
  
지난번에 모니터링 시스템을 한 번 만들려고 한 적이 있다.  
뭔가 직접 개발하자니 생각할게 많아서 때려쳤고  
Prometheus + Grafana 구성으로 해보자니 이건 뭐 모니터링 시스템이 더 무거운 것 같아서 말았다.  
  
이번에 원격 시스템을 구축하면서 모니터링 시스템을 진짜 갖추자는 마음이 다시 들었으므로 추진한다.  
  
> #### Glances  
---  
  
내 요구사항을 살펴보자.  
- 가벼워야 함  
- 호스트 시스템 자원 사용량 확인 가능해야 함  
- 도커 돌아가는 놈들 감시해줘야 함  
- 웹으로 확인 가능해야 함  
  
Dozzle이 제일 깔끔하고 좋아보였는데  
정말 아쉽게도 도커 컨테이너 모니터링에 특화된 도구이다.  
호스트 시스템 감시는 불가능하다는 뜻이다.  
  
그 다음으로 눈에 들어온게 {% include colored_text.html color="orange" text="**Glances**" %}  
  
[Glances - github](https://github.com/nicolargo/glances)  
  
![img01](/assets/images/posts/Server/Service/2026-06-24-Monitoring With Glances/img01.webp){: width="80%"}  
  
{% include colored_text.html color="orange" text="**Glances - An Eye on your System**" %}  
뭐지 개멋있다.  
  
파이썬 기반으로 개발되었고 웹 대시보드를 지원한다.  
시스템 상태를 보여주고 docker 컨테이너도 확인할 수 있다.  
  
> #### 구축  
---  
  
[Glances - docker hub](https://hub.docker.com/r/nicolargo/glances)  
  
도커 컨테이너 감시를 위해서는 풀 버전을 받아야한다.  
나는 우분투에 설치할 예정이라 ubuntu-latest-full 버전을 선택한다.  
  
```bash
docker pull nicolargo/glances:ubuntu-latest-full
```
  
![img02](/assets/images/posts/Server/Service/2026-06-24-Monitoring With Glances/img02.webp){: width="60%"}  
  
{% include colored_text.html color="orange" text="**docker-compose.yml**" %} 파일을 작성한다.  
  
```yaml
services:
  glances:
    image: nicolargo/glances:ubuntu-latest-full
    restart: unless-stopped
    ports:
      - 61208:61208
    pid: host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /:/host:ro
      - /etc/os-release:/etc/os-release:ro
    environment:
      - GLANCES_OPT=-w
```
  
pid: host 부분은 정확한 PID 매핑을 위해 필요하다.  
볼륨에서 docker.sock을 잡아줘야 도커 컨테이너 감시가 가능하다.  
GLANCES_OPT=-w 옵션을 사용해야 웹 실행이 가능하다.  
  
기동한 다음 설정한 61208 포트로 웹 접속해보자.  
  
> #### 살펴보기  
---  
  
![img03](/assets/images/posts/Server/Service/2026-06-24-Monitoring With Glances/img03.webp){: width="80%"}  
  
몬가... 몬가 동작하고 있음...  
전체적으로 색깔이 초록색인데 {% include colored_text.html color="green" text="**초록색**" %}은 안정적이라는 뜻이고 {% include colored_text.html color="blue" text="**파란색**" %}부터는 주의를 해야한다.  
구획 별로 한 번 살펴보자.  
  
1번 구획은 시스템 요약이다.  
{% include colored_text.html color="orange" text="**하드웨어 온도**" %} 센서는 내가 항상 눈여겨 봐야한다.  
필요하면 에어컨이라도 빵빵하게 틀어줘야지...  
그 외에는 디스크 여유공간 확인정도 할 수 있겠다.  

2번 구획은 코어 리소스 세부 상태이다.  
{% include colored_text.html color="orange" text="**메모리**" %}는 항상 잘 봐둬야하는데 지금은 전혀 부족하지 않아보인다.  
이외에 {% include colored_text.html color="orange" text="**CPU iowait**" %} 와 Load 수치를 주목해야 하겠다.  
  
3번 구획은 {% include colored_text.html color="orange" text="**도커 컨테이너 목록**" %}이다.  
상태, 가동시간, 리소스 점유율을 확인할 수 있다.  
특정 컨테이너가 대폭주해서 CPU와 메모리를 과도하게 점유하는지 감시해야한다.  
그래 나는 이런 기능이 필요했던거야.  
  
그 아래 4번 구획에는 {% include colored_text.html color="orange" text="**전체 프로세스 목록**" %}을 CPU 점유율 순으로 정렬하여 보여준다.  
이런건 너무 익숙한 화면이다.    
glances를 켜두고 지켜봐서 그런지 glances가 1등이다.  
여기서 특정 task를 클릭할 수 있는데  
  
![img04](/assets/images/posts/Server/Service/2026-06-24-Monitoring With Glances/img04.webp){: width="50%"}  
  
이렇게 클릭한 프로세스가 고정된다.  
고정된 시점에서부터 CPU 점유율, 메모리 점유율을 확인할 수 있다.  
그 외 메모리 세부 지표 등 정보가 나온다.  
Unpin을 누르면 고정이 해제된다.  
  
> #### 다음 작업  
---  
  
대시보드를 들어가려면 IP:61208로 접속해야한다.  
이걸 어떻게 외움?  
따라서 기억하기 쉽게 도메인을 달아줄 예정이다.  
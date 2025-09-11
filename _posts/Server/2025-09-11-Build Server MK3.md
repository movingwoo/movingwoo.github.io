---
title: "3호기 서버 구축"
description: "3호기 개인 우분투 서버 구축"
date: "2025-09-11 11:00:00 +0900"
last_modified_at: "2025-09-11 11:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, ubuntu, 구축]
author: movingwoo
---
> #### 들어가기 앞서  
---  
  
서버 1호기와 2호기를 운영 중 이상이 생겼다.  
  
1호기는 서피스 윈도우를 밀어버리고 우분투를 올렸는데  
뭐가 문제인지 며칠 지나면 멋대로 {% include colored_text.html color="red" text="**'죽을게'**" %}를 외치고 꺼져버린다.  
왜 이러는거야...  
  
2호기는 오라클 클라우드에서 40평형 궁궐같은 집을 무료로 임대받아 살았는데  
리전이 한국이 아니라 일본이라 사소한 이슈가 조금 있었고  
이를 해결하기 위한 오라클과의 불통 끝에 서버 접근도 안되고 탈퇴도 안되는 불법체류자 같은 존재가 되었다.  
  
3호기 서버가 절실한 상황, 서버를 새로 구축한다.  
  
> #### 3호기 설계  
---  
  
무료로 제공하는 VM 서비스를 찾아보면, 사실 오라클 클라우드를 제외하면 마땅한 후보가 존재치 않는다.  
기간 제한이 있거나 용량이 너무 적다.  
돈 만원이라도 넣어야 사용할만한 공간이 나오는데 무료가 아니라 아쉬운게 사실.  
  
결국 물리 서버 하나 집구석에 던져두고 공유기 물려두는게 제일 저렴하다.  
3호기에 서비스를 올려서 테스트용으로 가볍게 사용할거라 네트워크 이슈가 생길 일도 없다.  
  
다행히도 뽀얗게 먼지쌓인 데스크탑 한 대가 있다.  
  
뭔가 램도 꽂혀있고 그래픽카드도 달려있는데... 모델 명을 모르겠다.  
6 ~ 7년은 지난 터라 구매기록도 못찾겠다.  
  
다른 부품은 다 있고 SSD만 뽑아간 탓에 SSD 연결하면 사용에는 이상이 없을 것 같다.  
M.2 슬롯이 없는 것 같으니 SATA SSD 500gb 로 주문하자.  
  
![img01](/assets/images/posts/Server/2025-09-11-Build Server MK3/img01.webp) 
  
배송비 포함 8만원  
PC 부품이 워낙 싯가로 널뛰기를 하기 때문에 싼지 비싼지 가늠이 안간다.  
쓸 돈은 써야지 뭐...  
  
> #### 3호기 구축  
---  
  
##### 1. 본체 확인  
  
나는 하드웨어 쪽은 잘 모르지만, PC 조립은 레고의 그것과 같다고 들었다.  
  
{% include colored_text.html color="orange" text="**구멍이 맞는가?**" %}  
{% include colored_text.html color="orange" text="**큰 힘 없이 끼워지는가?**" %}  
{% include colored_text.html color="red" text="**거기가 맞으니 끼워라**" %}  
  
![img02](/assets/images/posts/Server/2025-09-11-Build Server MK3/img02.webp)  
  
이렇게 하면 되겠지?  
대충 남는 공간에 쑤셔박고 파워를 물리면 끝  
  
##### 2. 부팅 디스크 준비  
  
{% include colored_text.html color="orange" text="**rufus**" %}를 이용하여 usb를 부팅디스크로 만든다.  
ventoy 였나? 그걸 쓰는 경우도 있다는데 나는 익숙한 rufus를 쓰기로 했다.  
  
![img03](/assets/images/posts/Server/2025-09-11-Build Server MK3/img03.webp)  
  
[Ubuntu Server Download](https://ubuntu.com/download/server)  
  
공식홈페이지에서 다운로드 받아 부팅 드라이브를 만든다.  
  
여기서 {% include colored_text.html color="orange" text="**우분투 데스크탑**" %}을 사용할지, {% include colored_text.html color="orange" text="**우분투 서버**" %}를 사용할지 결정을 해야하는데 나는 서버를 선택했다.  
모니터와 키보드 없이 전원만 붙여놓을 생각이기 때문이며, 서버는 인터넷 없는 환경에서 {% include colored_text.html color="orange" text="**OpenSSH를 사전 설치**" %} 가능하다.  
우선 인터넷 없는 환경에서 설치 후 자리를 옮길거라 서버가 적절한 옵션이다.  
  
데스크탑과 서버의 차이는 대략 아래와 같다.  
  
| 항목 | Ubuntu Desktop | Ubuntu Server |
|------|----------------|---------------|
| **GUI** | O | X |
| **기본 설치 패키지** | 파폭, 리브레오피스 등 | openssh, apache 등 |
| **자원 사용량** | 상대적으로 무거움 | 상대적으로 가벼움 |
| **보안 정책** | 개인 사용자 보안 중심 (방화벽 off 기본) | 서버 보안 중심 (SSH 접근, UFW 설정 등 적극 권장) |
| **업데이트 주기** | 데스크탑 중심 패키지 포함 (예: 그래픽 드라이버, 오피스 등) | 서버 안정성·장기 지원 중심 (서비스 지향) |
  
초기화 시 iso로 할지 dd로 할지 묻는데 {% include colored_text.html color="orange" text="**dd**" %}로 진행하면 된다.  
일부 환경에서 iso usb가 인식이 잘 안될수도 있다고, 그대로 복제를 한 dd 이미지가 안정적이라고 한다.  
  
##### 3. OS 설치  
  
usb로 부팅 후 하라는 대로 엔터치면서 설치하면 끝인데...  
여기서 한가지 문제 발생  
{% include colored_text.html color="red" text="**The install media checksum verification failed**" %} 라는 오류가 뜨며 진행할 수 없다.  
  
일반적으로 usb를 잘못 구웠거나 다운로드가 잘못되었을 경우 발생한다는데...  
하드웨어가 잘못되었을 가능성도 있기 때문에 데스크탑 버전으로 한 번 설치를 시도한다.  
결과는 성공.  
  
데스크탑 설치는 문제없으니 하드웨어 이상은 아닐거로 판단, 하위버전을 설치해본다.  
24.04 말고 22.04 버전으로 새로 다운로드 받아서 설치하니 성공.  
  
![img04](/assets/images/posts/Server/2025-09-11-Build Server MK3/img04.webp)  
  
**acquiring and extracting image** 부분에서 오류 발생 후 셧다운 됐었는데  
이상없이 시스템 설치가 진행된다.  
  
##### 4. 세팅  
  
인터넷이 연결되면 우선 업데이트를 진행한다.  
  
![img05](/assets/images/posts/Server/2025-09-11-Build Server MK3/img05.webp)  
  
시간대 설정 후 ufw에 ssh 포트를 세팅한다.  
  
![img06](/assets/images/posts/Server/2025-09-11-Build Server MK3/img06.webp)  
  
보안 상 22번 포트를 그대로 노출하는건 별로다.  
추후 22번 포트 자체를 다른 포트로 변경할텐데 우선은 공유기 포트 포워딩 설정에서 외부 포트를 다른 포트로 지정하고 내부 22번 포트로 연결한다.  
  
ssh 접속 테스트 진행  
  
![img07](/assets/images/posts/Server/2025-09-11-Build Server MK3/img07.webp)  
  
이제 연결해둔 모니터와 키보드를 제거하고 전원만 켜두면 된다.  
  
> #### 앞으로 해야할 것  
---  
  
오랜만에 서버 구축하니까 재미있다.  
  
24.04로 업그레이드는 당장 필요치 않으니 제외하고  
{% include colored_text.html color="orange" text="**보안 설정**" %}을 우선적으로 진행하고  
도커와 같은 필수 툴을 설치하고  
개인 설정을 진행해야한다.  
  
그러고보니 보드가 뭔지 그래픽카드는 뭔지 정보를 아무것도 모르고 일단 올렸는데 이제 확인해보자.  
  
![img08](/assets/images/posts/Server/2025-09-11-Build Server MK3/img08.webp)  
![img09](/assets/images/posts/Server/2025-09-11-Build Server MK3/img09.webp)  
![img10](/assets/images/posts/Server/2025-09-11-Build Server MK3/img10.webp)  
  
그래픽카드의 경우 명확히는 안나오는데 아마 기억이 맞다면 rx 570쯤 될거다.  
이 서버엔 너무나 과분한 그래픽카드가 아닐 수 없다.  
  
메인보드가 MSI B450M 인데...  
  
![img11](/assets/images/posts/Server/2025-09-11-Build Server MK3/img11.webp)  
  
{% include colored_text.html color="red" text="**뭐야 M.2 슬롯이 있었다고?**" %}  

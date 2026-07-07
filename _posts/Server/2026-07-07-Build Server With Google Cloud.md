---
title: "구글 클라우드 무료 서버 생성"
description: "구글 클라우드를 이용한 무료 서버 5호기 생성"
date: "2026-07-07 17:00:00 +0900"
last_modified_at: "2026-07-07 17:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, GOOGLE, GOOGLECLOUD]
author: movingwoo
---
> #### 서버 현황  
---  
  
5호기 서버가 필요하다.  
  
1호기는 오래된 서피스에 설치된 리눅스라 깔딱깔딱거리며 죽기 일보직전이다.  
충전기 뽑으면 2시간 내로 '죽을게'를 외치며 뻗는다.  
2호기는 국제미아가 되어서 찾을 수도 없고
3호기 우분투 데스크탑과 4호기 맥북은 쌩쌩하다.  
  
계란을 한 바구니에 담지 말라는 말이 있다.  
현재 대부분 서비스가 3호기에서 돌아가고 있고  
일부는 4호기가 대신 해주긴 하지만 4호기는 개발용으로 더 자주 쓰이는 상황.  
3호기가 뻗으면 재앙이 일어난다!!  
  
조금이라도 3호기의 스트레스를 분산해줄 5호기가 절실하다...  
  
> #### 구글 클라우드  
---  
  
에잉 어디 무료 VM 없나?  
누가 무료로 8vCPU, 16gb MEM, 1024gb Storage 안뿌리나...  
  
다방면으로 찾아보았지만 오라클 클라우드도 사용하지 못하고 돈 1000원도 내기 싫은 나에겐 선택지가 별로 없다.  
제일 접근성이 좋은 {% include colored_text.html color="orange" text="**구글 클라우드**" %} 밖에 선택지가 없다.  
구글 클라우드 무료 서버 스펙이란?  
  
![img01](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img01.webp){: width="90%"}  
  
리전 3개에 한해서 무료로 제공된다.  
전부 us 리전이라... 속도는 크게 기대하지 않아야겠다.  
  
디스크 30GB가 무료이다.  
와 이거 누구코에 붙임?  
엘든링도 60기가정도 했고... 발게이3가 150기가쯤 했던거같은데  
  
e2-micro 인스턴스라고 명기되어있는데 이놈 스펙을 함 찾아보자.  
  
![img02](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img02.webp){: width="90%"}  
  
1gb 메모리  
와 살벌하네 진짜  
무료 손가락에게 줄 메모리는 없어요  
  
이거라도 감지덕지 기쁘게 사용하려면 결과에 원인을 끼워맞추는 전긍정적 사고방식이 필요하다...  
이 서버에 무슨 서비스를 올려야 서버 잘 쓰고있다 소문이 나지?  
그건 나중에 생각하고 VM을 한 번 구성해보자.  
  
> #### VM 생성  
---  
  
![img03](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img03.webp){: width="90%"}  
  
메뉴가 좀 낯설어서 헤맸지만 Compute Engine을 찾아냈다.  
여기서 무료 규칙을 잘 지키며 VM을 생성하면 작고 귀엽고 하찮은 5호기가 탄생한다...  
  
![img04](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img04.webp){: width="70%"}  
  
그래도 이래저래 콘솔에서 한글이 잘 지원되니 보기는 편하다.  
인스턴스 만들기 클릭  
  
![img05](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img05.webp){: width="60%"}  
  
리전을 다시 한 번 잘 확인한다.  
무료로 제공되는 리전은 {% include colored_text.html color="orange" text="**us-central1, us-east1, us-west1**" %} 단 3개 뿐이다.  
us-west1 리전은 오리건 주에 있는데 요놈이 지도 상 한국에서 그나마 가장 가깝다.  
조금이라도 가까이 두고 싶은 마음을 담아 us-west1 리전을 선택한다...  
  
![img06](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img06.webp){: width="80%"}  
  
![img07](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img07.webp){: width="60%"}  
  
기본적으로 {% include colored_text.html color="orange" text="**E2**" %}가 잡힌다.  
상세 머신 유형을 스탠다드에서 {% include colored_text.html color="orange" text="**마이크로**" %}로 바꿔줘야한다.  
  
![img08](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img08.webp){: width="50%"}  
  
부팅디스크는 기본 10gb에 데비안이 잡히는데  
만만한게 우분투니 우분투 LTS로 바꿔준다.  
ARM은 못쓰고 {% include colored_text.html color="orange" text="**x86**" %}으로 맞춰줘야한다.  
그리고 30GB까지 무료니 {% include colored_text.html color="orange" text="**30**" %}으로 확장한다.  
  
![img09](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img09.webp){: width="60%"}  
  
{% include colored_text.html color="orange" text="**백업 없음**" %}을 설정한다.  
스냅샷 뜬거 쌓이면 귀신같이 요금 청구될 수 있다.  
나중에 서비스 올려서 그때 스냅샷 한 번 수동으로 떠두기로 하자.  
  
![img10](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img10.webp){: width="50%"}  
  
네트워킹에서 http, https 정책을 사전 설정할 수 있다.  
이거 좀 고민인데... 우선 넣어두는걸로 하자.  
나중에 정책 삭제하면 그만이다.  
  
![img11](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img11.webp){: width="70%"}  
  
만들기를 누르면 짱 귀여운 5호기 vm이 탄생한다!  
하지만 아직 하나가 더 남았다.  
  
![img12](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img12.webp){: width="90%"}  
  
방화벽 정책을 확인해보면 쓸데없는 정책이 몇 개 보인다.  
http, https는 우선 남겨두고 나머지는 다 지운다.  
ssh는 22번 포트를 쓰긴 할건데 구글 콘솔에서 들어가는 접속만 허용할거다.  
  
![img13](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img13.webp){: width="50%"}  
  
방화벽 규칙 만들기를 눌러서 규칙을 생성한다.  
22번 포트에 대해 ingress를 설정하고  
IPv4 범위를 {% include colored_text.html color="orange" text="**35.235.240.0/20**" %} 으로 설정한다.  
해당 IP 범위는 구글 IAP 서버 IP 대역이다.  
이렇게 설정하면 내 구글 계정이 로그인 된 콘솔 화면에서만 ssh 접근이 가능하다.  
  
![img14](/assets/images/posts/Server/2026-07-07-Build Server With Google Cloud/img14.webp){: width="70%"}  
  
인스턴스 메뉴에서 SSH 버튼을 클릭하면 브라우저로 ssh 접속이 가능하다.  
  
> #### 이제 뭐하지  
---  
  
요놈은 싸이즈만 짝은게 아니라 네트워크 통신량에도 제한이 있다.  
아까 언급안하고 내려왔는데... 아웃바운드 데이터 전송이 월 1gb 제한이다.  
이거 뭐 어떻게 써야할지가 고민이다.  
  
좀만 여유가 있어도 vpn exit node로 구성할까 싶었는데  
한 번 텔레그램이랑 잘 엮으면 뭐라도 할 수 있겠다 싶다.  

---
title: "TailScale 최초 구성"
description: "TailScale 최초 구성 및 설정"
date: "2026-06-18 10:00:00 +0900"
last_modified_at: "2026-06-18 10:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, TAILSCALE]
author: movingwoo
---
> #### 개요  
---  
  
집에 맥북을 시즈모드 박아두고 원격으로 컨트롤을 하려고 한다.  
이게 과거에 무료 원격 툴 좋은게 참 많았다.  
TeamViewer, AnyDesk 같은 무료 솔루션이 좋았는데  
이것들 유지가 빡센지 어느샌가 유료 솔루션이 되어있다.  
  
때문에 오픈소스인 RustDesk를 이용해보려한다.  
이런저런 문제로 인하여 탈중앙화를 꾀하고 있는데  
문제에 대해서는 RustDesk 구성 시 포스트에서 논하기로 하자.  
  
이전에 CloudFlare Tunnel을 이용하면서 OnlyOffice 구성에 어려움을 겪은 바 있다.  
그래서 이번에는 CloudFlare 프록시나 터널을 거치지 않기 위해 {% include colored_text.html color="orange" text="**TailScale**" %}을 이용하려한다.  
  
> #### TailScale과 HeadSacle  
---  
  
[TailScale](https://tailscale.com/)  
  
![img01](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img01.webp){: width="80%"}  
  
TailScale은 간단히 말해 {% include colored_text.html color="orange" text="**WireGuard 기반 VPN 서비스**" %}이다.  
클라이언트와 호스트를 가상 네트워크로 묶어버리면 포트 노출 리스크가 0에 수렴한다.  
다른 사람에게 원격을 허용할 필요도 없기 때문에 현재 나에게 적절한 선택지이다.  
  
테일스케일 또한 중앙서버와 통신이 필요한데  
중앙서버 의존성을 해결하기 위해 셀프 호스팅을 이용한다.  
여기서 나오는 솔루션이 {% include colored_text.html color="orange" text="**HeadScale**" %}이다.  
  
[HeadScale](https://headscale.net/stable/)  
  
[HeadScale GitHub](https://github.com/juanfont/headscale)
  
![img02](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img02.webp){: width="80%"}    
  
HeadScale은 테일스케일의 중앙서버를 내 서버에 직접 설치해서 운영할 수 있도록 만든 오픈소스 대안 소프트웨어이다.  
테일스케일 공식 앱을 그대로 사용할 수 있어서 편리하고  
탈중앙화를 통해 개인정보가 완전히 안전해진다.  
  
> #### 뭘 선택하지?  
---  
  
제로트러스트 관점에서 보면 테일스케일 중앙 서버를 신뢰해서는 안된다.  
내 서버에 헤드스케일 서버를 두는게 맞는 것 같은데  
여기서 문제가 발생한다.  
  
##### 1. 집구석 서버에 HeadScale을 올리는 경우  
  
집구석 서버에 헤드스케일을 올리면 필연적으로 공유기 백단에 서버가 위치하게 된다.  
그러면 vpn 사용을 위해 헤드스케일로 들어가는 공유기 포트를 열어야 한다.  
{% include colored_text.html color="red" text="**포트 오픈을 하기 싫어서 vpn을 사용 하기 위해 포트를 여는 말도 안되는 상황!**" %}  
이 무슨 모순이란 말인가?  
  
##### 2. 등대 서버를 두는 경우  
  
그렇다면 헤드스케일을 외부 클라우드에 설치하는 방법이 있다.  
헤드스케일 제어 트래픽은 크지 않기 때문에 클라우드에 헤드스케일을 설치하면 공유기 포트는 필요없어진다.  
  
참 좋은 생각이긴한데 클라우드 서버는 누가 주는가? 조상님이 주시나?  
고객센터 이슈로 인해 무료 클라우드의 최고봉인 오라클 클라우드는 사용할 수 없는 상황이고  
구글 클라우드 프리티어는 미국 리전만 해당되어 속도를 기대할 수 없다.  
  
그럼 1 cpu 1g ram 만원 미만 클라우드 서버를 구독해서 써야하는건데...  
그렇게까지 하면서 관리 포인트를 늘려야하는가 하는 의문이 든다.  
서버 관리란게 여간 귀찮은 일이 아니다.  
  
##### 3. TailScale 중앙서버를 이용하는 경우  
  
모든 것을 테일스케일에 맡기기  
사실 제일 편한 방법이다.  
테일스케일을 어디까지 신뢰할 수 있을지 한 번 공식 기술문서를 참조해보자.  
  
[Control and data planes - tailscale](https://tailscale.com/docs/concepts/control-data-planes)  
  
중앙 서버 부분 (Coordination server) 부분을 보자.  
  
![img03](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img03.webp){: width="60%"}  
  
테일스케일 중앙서버는 {% include colored_text.html color="orange" text="**IP, 메타데이터, 공개키 등의 정보를 수집**" %}한다.  
데이터 플레인 부분을 보면 {% include colored_text.html color="orange" text="**WireGuard 프로토콜**" %}을 사용한다고 되어있다.  
종단간 암호화가 되고 {% include colored_text.html color="orange" text="**개인키는 전송하지 않는다.**" %}  
공개키는 주고 개인키는 잘 보관하는건 일반적인 비대칭 암호화 방식으로 보인다.  
  
결국 중앙 서버는 메타데이터와 공개키만 중계할 뿐, 실제 데이터는 기기 내부의 개인키와 와이어가드로 종단간 암호화되어 안전하다는 뜻인데...  
테일스케일 서버가 해킹당하거나 악의적인 의도로 공개키를 배포하거나 acl을 조작한다면?  
  
[Tailnet Lock - tailscale](https://tailscale.com/docs/features/tailnet-lock)  
  
[Tailnet Lock white paper - tailscale](https://tailscale.com/docs/concepts/tailnet-lock-whitepaper)
  
{% include colored_text.html color="orange" text="**Tailnet Lock**" %}이란 기술을 소개하는 문서이다.  
테일스케일 중앙서버를 신뢰하지 않고도 노드를 검증할 수 있도록 한다.  
이 기능을 활성화 시 사용자의 로컬 기기가 사설망의 최상위 인증기관이 된다.  
  
그렇게 되면 이후 테일스케일 중앙서버가 새로운 기기의 공개키나 acl을 배포하려해도  
{% include colored_text.html color="orange" text="**내가 신뢰한다고 지정한 로컬 기기의 서명이 없으면 다른 기기에서 정보를 거부**" %}한다.  
테일스케일 중앙서버가 통제권을 쥐고 흔드는 위험을 차단할 수 있다는 말이다.  
  
기술백서는 너무 복잡해서 대충 읽고 패스...  
  
##### 4. 선택은?  
  
1번 내용대로 포트를 오픈할 수 없길래 내부 서버에 헤드스케일 구축은 포기한다.  
2번은 마땅한 클라우드를 현재 바로 찾기는 어렵기 때문에 패스한다.  
{% include colored_text.html color="orange" text="**3번**" %}은 일단 구성이 편하고 추가로 뭔가 수틀릴 경우 테일스케일 시스템을 들어내는 것도 편하다.  
장점이 크기 때문에 그냥 테일스케일 중앙서버를 사용하자.  
  
{% include colored_text.html color="orange" text="**장기적으로는 좋은 외부 클라우드를 구하게 되면 거기에 헤드스케일을 올리는게 최선일 것이다.**" %}  
  
> #### 설치 및 설정  
---  
  
사실 테일스케일 중앙서버 이용을 결정한 순간 구성은 아주 간단하다.  
내부 VPN 구성원마다 테일스케일 클라이언트를 설치한다.  
  
![img04](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img04.webp){: width="60%"}  
  
첫번째 디바이스로 윈도우 PC를 한 대 등록하였다.  
디바이스 명과 IP가 표시된다.  
테일스케일이 부여하는 IP는 {% include colored_text.html color="orange" text="**100**" %}.* 으로 시작한다.  
  
두번째 디바이스로 맥을 등록해본다.  
맥은 brew를 이용하여 설치한다.  
  
```bash
brew install --cask tailscale-app
```  
  
![img05](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img05.webp){: width="60%"}  
  
세번째 디바이스로 리눅스를 등록한다.  
리눅스판은 repo 등록하면 된다.  
  
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```  
  
![img06](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img06.webp){: width="60%"}  
  
이제 테일스케일 어드민 콘솔에 들어가보면 등록한 기기 3대를 확인할 수 있다.  
  
![img07](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img07.webp){: width="80%"}  
  
100으로 시작하는 IP나 테일스케일에서 기본적으로 제공해주는 MagicDNS 주소를 통하여 포트를 닫고도 접근 가능하다.  
우선 설정에서 신규 기기 등록은 승인을 받도록 해두고 마친다.  
  
![img08](/assets/images/posts/Server/Service/2026-06-18-Setting TailScale/img08.webp){: width="60%"}  
  
> #### 우선 마무리
---  
  
테일넥 락을 거는 것은 신뢰할 수 있는 기기 2대를 우선 등록해야하는데  
어떤 기기를 등록해둘지 잠시 고민이 필요하기 때문에 다음에 진행하는 것으로 한다.  
  
도메인 등록을 위해 좀 고민해보았는데  
도메인으로 테일스케일 내부 기기에 올바르게 분배하며 cloudflare tunnel까지 이용하려면  
현재 리눅스에 등록된 traefik을 이용하든 nginx를 새로 올리든 인프라 구성 변경이 좀 필요해보인다.  
  
골치가 아파진다...  

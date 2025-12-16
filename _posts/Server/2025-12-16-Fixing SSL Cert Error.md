---
title: "SSL 인증서 오류 해결"
description: "Cloudflare SSL 인증서 오류 해결"
date: "2025-12-16 11:00:00 +0900"
last_modified_at: "2025-12-16 11:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, CLOUDFLARE, GITHUB, 장애, 복구, SSL]
author: movingwoo
---
> #### 상황  
---  
  
![img01](/assets/images/posts/Server/2025-12-16-Fixing SSL Cert Error/img01.webp)  
  
오 맙소사 이게 뭐야  
{% include colored_text.html color="red" text="**Invalid SSL certificate**" %}  
  
뭔가 SSL 인증서 갱신이 제대로 이루어지지 않았나 보다.  
  
> #### 원인 분석  
---  
  
현재 SSL 인증서 발급 및 적용은 클라우드플레어에서 처리 중이다.  
대시보드를 확인해본다.  
  
![img02](/assets/images/posts/Server/2025-12-16-Fixing SSL Cert Error/img02.webp)  
  
2월 11일까지 3개월짜리 인증서가 정상적으로 적용되어있다.  
오류 사진에서도 클라이언트와 클라우드플레어 간 통신은 정상이다.  
  
이러면 호스트 쪽을 봐야하는데...  
github pages를 사용하고 있으므로 github에 들어가 인증서 쪽을 확인해보자.  
  
![img03](/assets/images/posts/Server/2025-12-16-Fixing SSL Cert Error/img03.webp)  
  
DNS 검증이 되지 않고 있다.  
이게 원래는 됐었는데...  
  
곰곰히 생각해보니 github pages TLS 적용을 최초에 진행했고  
나중에 cloudflare가 붙었다.  
아마 cloudflare가 붙으면서 그때부터 TLS 검증이 이루어지지 않은 것 같다.  
  
대충 원인은 github으로 붙을때 HTTPS로 붙지 못해 발생한 것 같은데
민감 데이터도 없고 cloudflare 뒤의 백본이라 HTTP 통신만 이뤄져도 되는데 왜 SSL 오류가 떠버리지?
  
![img04](/assets/images/posts/Server/2025-12-16-Fixing SSL Cert Error/img04.webp)  
  
결국 이 놈이 원인이었다.  
현재 암호화모드가 {% include colored_text.html color="orange" text="**전체**" %}로 되어있는데  
이 모드에서는 cloudflare와 github pages 간의 암호화 통신이 이루어져야한다.  
  
그런데 github 인증서가 만료되면서 도메인으로 Let's Encrypt 인증서를 재발급하려 시도를 하였고  
이때 cloudflare 프록시에 걸리면서 인증서 재발급이 실패  
cloudflare는 인증서가 유효하지 않으니 호스트 통신 시 SSL 오류를 뱉은 것이다.  
  
> #### 조치  
---  
  
![img05](/assets/images/posts/Server/2025-12-16-Fixing SSL Cert Error/img05.webp)  
  
간단하게 암호화 모드를 {% include colored_text.html color="orange" text="**가변**" %}으로 변경해준다.  
이렇게 되면 클라이언트와 클라우드플레어 암호화 통신은 유지하되  
클라우드플레어와 깃헙 간 통신은 평문 통신을 허용한다.  
  
훔쳐갈 정보 자체가 없고 앞단에 클라우드플레어가 있기 때문에 보안상 문제는 크게 없다.  
  
궁극적으로는 프록시를 타지 않게 해두고 github pages 인증서를 갱신 하는게 좋겠지만  
당장 그렇게까지 할 필요성을 못느끼겠다.  
  
github pages DNS 설정부는 계속 DNS 체크 실패로 뜨고 HTTPS 강제가 불가능할 것이다.  
이대로 둔다고 해도 큰 문제는 안생기니 신경쓰지말고 냅두는 걸로  
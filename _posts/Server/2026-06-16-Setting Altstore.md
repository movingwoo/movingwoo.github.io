---
title: "AltStore 활용 앱 자동 갱신"
description: "AltStore 활용 iOS앱 자동 갱신"
date: "2026-06-16 11:00:00 +0900"
last_modified_at: "2026-06-16 11:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, IOS, ALTSTORE]
author: movingwoo
---
> #### 개요  
---  
  
연회비를 내고 애플 개발자 등록을 하지 않는 경우  
내가 만든 앱은 7일 밖에 지속되지 않는다.  
  
이 얼마나 폐쇄적인 환경이란 말인가?  
돈내고 1년 유지하는게 편하겠지만 개인 프로젝트 단위에서 생돈 지출이 너무 아깝다.  
  
때문에 {% include colored_text.html color="orange" text="**AltStore**" %}를 이용하여 앱 수명을 자동 연장해주도록 구성한다.  
  
> #### 진행  
---  
  
##### 1. 설치  
  
[AltStore](https://altstore.io)  
  
![img01](/assets/images/posts/Server/2026-06-16-Setting Altstore/img01.webp){: width="80%"}  
  
우선 맥에 AltStore 공식 홈페이지에서 AltServer를 다운받아 설치해준다.  
AltServer는 백그라운드에서 자동으로 돌아가게 된다.  
  
![img02](/assets/images/posts/Server/2026-06-16-Setting Altstore/img02.webp){: width="80%"}  
  
맥과 아이폰을 연결하면 finder에서 아이폰을 선택한다.  
설정에서 {% include colored_text.html color="orange" text="**Wi-Fi가 연결되었을 때 이 iPhone 보기**" %} 옵션을 체크해준다.  
  
![img03](/assets/images/posts/Server/2026-06-16-Setting Altstore/img03.webp){: width="50%"}  
  
AltStore 메뉴에서 {% include colored_text.html color="orange" text="**Install AltStore**" %}를 클릭해 아이폰에서 AltStore 앱을 설치한다.  
  
##### 2. 앱 등록  
  
![img04](/assets/images/posts/Server/2026-06-16-Setting Altstore/img04.webp){: width="80%"}  
  
앱을 AltStore에 등록하기 위해 .ipa로 추출해야한다.  
애플 개발자에 등록이 되어있지 않으면 xcode에서 추출도 불가능하다.  
따라서 아이폰에 빌드 후 .app 파일을 찾아 .ipa로 만들어준다.  
  
만든 ipa파일을 아이폰으로 전송하여 마지막으로 AltStore 앱에서 설치를 해야한다.  
  
![img05](/assets/images/posts/Server/2026-06-16-Setting Altstore/img05.webp){: width="40%"}  
  
AltStore 앱을 켜서 {% include colored_text.html color="orange" text="**My Apps**" %} 메뉴에 들어가서 + 버튼을 누른다.  
이미 AltStore 자체가 무료 App ID 분량을 먹고 있다...  
무료 손가락의 설움이니 넘어가자.  
  
![img06](/assets/images/posts/Server/2026-06-16-Setting Altstore/img06.webp){: width="40%"}  
  
첫 1회 애플 아이디 로그인이 필요하다.  
애플 로그인이 필요한 이유는 애플 공식서버에 접속하여 7일짜리 인증서를 발급받기 위함이다.  
AltStore 개발진에 따르면 이 로그인 정보는 애플 공식서버로만 직접 전송 된다고 한다.  
솔직히 100% 신뢰할 수는 없기 때문에 언젠가 애플 개발자 프로그램에 참여하게 된다면 애플 비밀번호를 바꾸는게 좋겠다.  
  
![img07](/assets/images/posts/Server/2026-06-16-Setting Altstore/img07.webp){: width="40%"}  
  
앱이 등록되었다.  
등록한 키보드 앱은 익스텐션이 필요해서 앱 아이디를 5개나 먹는다.  
익스텐션마다 아이디를 부여하는 애플의 악랄한 정책이다.  
  
이제 맥북과 아이폰이 같은 네트워크에 있는 경우 자동으로 AltServer를 통해서 7일 인증서를 갱신하게 된다.  
  
> #### 마무리  
---  
  
애플은 폐쇄적이다 말만 들었지만 직접 경험해보니 정말 뭘 하기가 힘들다.  
그 악랄함 덕분에 보안을 챙기는 것이라 뭐라 하기도 애매하다.  
  
내 자유는 연 99달러에 달려있다.  
정말 평소라면 쾌척하고 말겠는데  
{% include colored_text.html color="red" text="**진짜 요즘 환율이... 나는 감당할 수 없다...**" %}  
환율이 정상화되긴 할까? 이게 뉴노멀일까?  
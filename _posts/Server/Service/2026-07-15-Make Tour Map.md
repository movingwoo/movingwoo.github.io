---
title: "여행 계획 지도 만들기"
description: "여행 계획 지도 만들기"
date: "2026-07-15 13:00:00 +0900"
last_modified_at: "2026-07-15 13:00:00 +0900"
categories: 
  - Server/Service/
tags: [SERVER, SERVICE, TOURMAP]
author: movingwoo
---
> #### 개요  
---  
  
올해 3번째 해외여행 준비 중  
어쩌다보니 너무 많이 나간다.  
돈이 없다 진짜  
  
아무튼 여행 준비하는데 그동안 구글맵으로 위치 저장해두고 해당 저장 목록 권한을 공유하는 식으로 했는데  
은근히 잔버그가 많아서 쓰기 곤란했다.  
뭔가 일행들이 한 번에 확인 가능한 그런 서비스가 필요했는데  
뭐 없으면 그냥 만들지 뭐  
  
> #### 만들기  
---  
  
지도 데이터는 {% include colored_text.html color="orange" text="**Leaflet**" %}을 사용한다.  
  
![img01](/assets/images/posts/Server/Service/2026-07-15-Make Tour Map/img01.webp){: width="30%"}  
  
[Leaflet](https://leafletjs.com/)  
  
웹페이지에 지도를 삽입하기 위한 경량 JS 라이브러리다.  
많은 기능이 있는 건 아니지만 무료로 간단하게 땡겨올 수 있는 지도 데이터가 흔치 않다.  
사용법은 간단하다.  
라이브러리를 가져와서 적당히 초기화 해주면 된다.  
  
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```  
  
자세한 사용법은 공식 홈페이지 레퍼런스 참조  
  
[Leaflet API reference](https://leafletjs.com/reference.html)  
  
리플릿 지도를 띄우고 좌표는 수동으로 구글맵으로 확인해 지정해주고 간단히 점과 선으로 이어준다.  
어차피 정확한 경로와 실시간 데이터는 현지에서 구글맵으로 확인해야한다.  
대략 왕복 예상 시간 정도만 미리 계산해서 박아두면 되겠다.  
  
이번 여행지는 다카마쓰라 해당 지역 기준으로 content.js를 작성한다.  
content.js에는 모든 수정 가능한 데이터를 입력한다.  
이번에만 쓰고 버리는 일회용이 되면 좀 아까우니까  
추후 여행계획을 새로 꾸리게 되면 content.js만 수정해서 사용하게 한다.  
  
```javascript
window.TOURMAP_CONTENT = {
  site: {
    title: '지도',
    intro: '여행 계획 지도',
    legend: {
      hub: '숙소',
      rail: '육상 (철도·버스)',
      ferry: '페리',
      airport: '공항'
    }
  },
  modules: [
    {
      id:'A', name:'다카마쓰', mode:'rail',
      def:'숙소 근처 다카마쓰 시내',
      stops:[{lat:34.341, lng:134.049, label:'미나미신마치 상점가'}], // 점 추가
      roundTrip:'왕복 30분 이내', roundTripMin:30,
      stayLabel:'마음대로', stayMin:180,
      see:['미나미신마치 상점가 등'],
      eat:['안모치 조니','와산본 화과자','호네쓰키도리','올리브 방어','올리브규','사와라','쇼유마메 등'],
      note:'가나다라마바사'
    }
    // 코스 모듈 추가
  ]
};
```
  
html + js로 이루어진 정적인 웹 페이지라 그냥 github pages로 배포하면 끝이다.  
  
![img02](/assets/images/posts/Server/Service/2026-07-15-Make Tour Map/img02.webp){: width="70%"}  
  
> #### 더 할 것  
---  
  
동행할 사람들과 확인하며 content.js 업데이트 하며 코스를 정한다.  
코스가 정해지면 이제 식당 지도를 만들거다.  
여행 성공의 팔할은 먹을거리가 좌우한다.  
코스 근처 최고의 식당들을 추려서 다이닝 페이지를 다음에 만들어야지.  
  
이번에 처음 알게 된 건데  
private 레포는 github pages로 배포가 안된다.  
정확히 말하면 {% include colored_text.html color="orange" text="**유료 플랜에 가입해야만 가능하다!**" %}  
민감정보가 올라가지 않도록 조심해야한다는 뜻이다...  
  
여행 준비 중에는 public으로 배포해두고  
여행 끝나면 private로 돌려서 배포 중지하고  
그렇게 사용해야겠다.  
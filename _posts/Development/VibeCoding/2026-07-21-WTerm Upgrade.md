---
title: "웹 터미널 코덱스 추가"
description: "웹 터미널 코덱스 추가 및 효율적인 AI 사용"
date: "2026-07-21 11:00:00 +0900"
last_modified_at: "2026-07-21 11:00:00 +0900"
categories: 
  - Development/VibeCoding/
tags: [VIVECODING, CLAUDE, CODEX, WTERM]
author: movingwoo
---
> #### AI 경쟁  
---  
  
오늘자로 클로드 코드 Fable5 모델이 사용할 수 없게 되었다.  
정확하게는 토큰 정량제로 전환된 듯 하다.  
아! 진짜 좋았는데!!!  
  
사실 그동안 Codex의 Sol 모델과 많은 경합이 있어왔다.  
듣기로는 막 사용량 초기화도 해주고 난리도 아니었다고 한다.  
하지만 나는 Fable5 사용감이 좋아서 그냥 쓰고 있었는데...  
이렇게 되면 GPT를 안 쓸 수가 없잖아?  
  
> #### Codex  
---  
  
```shell
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```
  
한 줄로 간단하게 codex를 설치한다.  
  
```shell
╭───────────────────────────────────────────╮
│ >_ OpenAI Codex (v0.144.6)                │
│                                           │
│ model:     gpt-5.6-sol   /model to change │
│ directory: ~/workspace/                   │
╰───────────────────────────────────────────╯
```
  
캐릭터가 반겨주던 claude code와는 다르게 심플한 카드 형태이다.  
전체적인 명령어는 비슷하다.  
/usage 라거나 /model 이라거나  
  
codex를 사용하게 되었으니 wterm에 codex 기능을 추가해준다.  
  
```shell
• Codex 세션 기능 구현을 완료했습니다.

  주요 변경:

  - Claude/Codex/셸 세션을 각각 독립적으로 유지
      - <project>#claude
      - <project>#codex
      - <project>#shell

  - Codex 새 세션: codex
  - Codex 이어하기: codex resume
  - 자동 재연결: codex resume --last
  - 로컬 및 SSH 프로젝트의 Codex 이력 탐지
  - Codex도 기존 grace, replay, resize, 다중 접속 정책 동일 적용
  - 프로젝트 카드에 Claude/Codex 버튼 행과 독립 상태 배지 추가
  - 기존 shell=1 URL 호환 유지
  - 프로젝트 문서 갱신

  변경 파일:

  - server/session.py
  - server/main.py
  - static/app.js
  - static/style.css
  - CLAUDE.md

  검증 결과:

  - Python 문법 검사 통과
  - 실제 Codex 이력 탐지 통과
  - 프로젝트 API의 codex_live, codex_has_history 응답 검증 통과
  - 실제 Codex PTY 기동 및 종료 스모크 테스트 통과
  - git diff --check 통과
  - 임시 .orig/.rej 파일 정리 완료

  현재 실행 중인 W-Term에는 아직 반영되지 않았습니다. uvicorn reload를 사용하지 않으므로 서버를 재시작하면 새 UI와 Codex 기능이 적용됩니다.
```
  
그동안 클로드만 써와서 프로젝트 개요가 CLAUDE.md에 정리되어 있는데  
코덱스를 같이 사용하려면 정리를 해주는 편이 좋다.  
{% include colored_text.html color="orange" text="**AGENTS.md**" %} 파일에 프로젝트 개요와 개발 규칙을 정리하고 CLAUDE.md는 클로드 코드가 확인해야할 사항만 남겨둔다.  
  
이후 기능 테스트 후 커밋  
  
![img01](/assets/images/posts/Development/VibeCoding/2026-07-21-WTerm Upgrade/img01.webp){: width="80%"}  
  
찐빠는 없이 완료되었다.  
  
> #### 느낀 점  
---  
  
바이크 코딩 특성상 찐빠와 버그는 자동으로 딸려오기 때문에 그런 부분은 제외하고 느낀 점.  
  
Fable5는 뭔가 {% include colored_text.html color="orange" text="**완성형**" %}이라는 느낌을 크게 받았다.  
가장 좋은 점은 두루뭉술하게 표현해도 추가 질의를 통해 말로 표현하지 못하던 부분을 캐치해주는 점.  
개같이 말해도 찰떡같이 알아들으니 대화가 편하다.  
부족한 부분은 알아서 채워주니 일류고수의 아우라가 느껴진다.  
  
그래서 그런가 {% include colored_text.html color="orange" text="**토큰 사용량이 어마무시**" %}하다.  
진짜 세션 한 번 키면 바로 사용량 100% 달성했다.  
초기화까지 손가락 빨고 기다릴 수 밖에.  
  
5.6 Sol은 아 내가 AI 코딩 에이전트를 사용하고 있구나 하고 느끼게 해준다.  
{% include colored_text.html color="orange" text="**인풋을 넣으면 아웃풋이 그대로 나오는 느낌**" %}  
시키면 시키는 대로 기계적으로 튀어나오는 느낌이다.  
서울에서 부산까지 가고싶어 하면 일직선으로 뚫고 나가준다.  
  
사용량은 Fable5보다는 더 적은 느낌인데 정확하지는 않다.  
사용량을 주간 한도로만 표시해줘서 정확한 비교가 지금은 어렵다.  
주간 빡시게 굴려봐야 판단이 될 듯하다.  
  
현재 Fable5 사용이 어려워진 이상 절충안으로 두 개를 동시에 사용해야한다.  
{% include colored_text.html color="orange" text="**기획 및 코어 구현은 gpt로**" %}  
{% include colored_text.html color="orange" text="**다듬고 내용 채우기는 claude로**" %}  
{% include colored_text.html color="red" text="**구독 비용이 2배**" %}로 늘긴하지만... 일단 그렇게 써봐야겠다.  
  
---
title: "3호기 서버 설정"
description: "3호기 개인 우분투 서버 설정"
date: "2025-09-12 11:00:00 +0900"
last_modified_at: "2025-09-15 13:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, ubuntu, 구축, 설정]
author: movingwoo
---
> #### 이어서  
---  
  
생각해보니 램 얼만지 확인을 안해봤다.  

![img01](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img01.webp)  
  
아니 무슨 40기가나 박혀있네?  
내 게임 PC가 32기가일텐데...  
  
> #### 설정할 내용  
---  
  
계정을 여러개 쓰지 않을거라 돌이킬 수 없는 결과를 낳을 듯한 faillock은 제외하고 간단하게 4가지를 설정한다.  
- {% include colored_text.html color="orange" text="**root 로그인 비활성화**" %}  
- {% include colored_text.html color="orange" text="**ssh 포트 변경**" %}  
- {% include colored_text.html color="orange" text="**fail2ban**" %}  
- {% include colored_text.html color="orange" text="**세션 타임아웃**" %}  
  
그 외 설정으로 bash 프롬프트 수정과 히스토리 최적화 등을 진행한다.  
  
> #### 설정  
---  
  
##### 1. 업그레이드  
  
22.04로 설치했으니 24.04로 업그레이드를 우선 진행한다.  
이것저것 설치되어 있을수록 업그레이드가 부담되니까 깡통일때 해버리는게 낫다.  

{% include colored_text.html color="orange" text="**sudo do-release-upgrade**" %}  
명령어 입력 후 콘솔 안내에 따라 업그레이드를 진행한다.  
  
![img02](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img02.webp)  
  
업그레이드 중 언어셋이 en_US.UTF-8 인걸 확인했다.  
데스크탑 설치에는 한국어 설정이 있었는데 서버 설치에는 없어서 전체 영어로 진행되는 상황.  
ko_KR.UTF-8 로 바꿔줘야겠다.  
  
{% include colored_text.html color="orange" text="**sudo apt install language-pack-ko**" %}  
{% include colored_text.html color="orange" text="**sudo update-locale LANG=ko_KR.UTF-8**" %}  
  
언어팩을 설치하고 locale을 바꿔준다.  
  
![img03](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img03.webp)  
  
안내문이 한글로 뜨는 것을 볼 수 있다.  
  
##### 2. sshd 설정  
  
{% include colored_text.html color="orange" text="**/etc/ssh/sshd_config**" %} 파일을 수정하면  
ssh 포트 변경, root 로그인 차단을 처리할 수 있다.  
추가로 네트워크 응답이 없으면 끊기게 시간제한도 설정한다.  
  
사실 포트 변경과 루트 차단은 굳이 설정할 필요가 없다.  
22번 포트는 앞단에서 포트 포워딩을 하기 때문에 직접 노출되지 않고  
우분투는 설치 시 생성하는 계정에 sudo 권한을 주고 root 계정을 바로 사용하지 않기 때문에 어차피 로그인이 안된다.  
그래도 기분 문제가 있으니 변경하기로 한다.  
  
```shell
# /etc/ssh/sshd_config

Port 12345                # 포트
PermitRootLogin no        # 루트 로그인 비허용
ClientAliveInterval 300   # 종료대기 시간(s)
ClientAliveCountMax 0     # 실패 횟수
```
  
아직 서버 접근할 고정적인 환경이 정해지지 않은 상태라 인증서 로그인 설정은 생략한다.  
  
##### 3. fail2ban  
  
fail2ban은 로그 파일을 모니터링해서 이상 로그인 패턴을 찾아 차단하는 도구이다.  
{% include colored_text.html color="orange" text="**sudo apt install fail2ban**" %} 명령어로 설치한다.  
  
{% include colored_text.html color="orange" text="**/etc/fail2ban/jail.conf**" %} 파일이 설정파일인데  
개인 설정을 위해 복사해서 {% include colored_text.html color="orange" text="**jail.local**" %} 파일을 만들고 sshd 블럭을 찾아 수정한다.  
  
```shell
# /etc/fail2ban/jail.local

[sshd]
enabled   = true                          
port      = 12345             # ssh 포트
filter    = sshd
logpath   = %(sshd_log)s
backend   = %(sshd_backend)s
banaction = ufw               # ufw 사용
maxretry  = 5                 # 시도 횟수
bantime   = -1                # 영구밴
findtime  = 600               # 지정한 시간 내 탐색
ignoreip  = 127.0.0.1/8       # 허용 IP
```
  
![img06](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img06.webp)  
  
설정 후 fail2ban 재시작하고 일부러 패스워드를 틀려본다.  
  
{% include colored_text.html color="orange" text="**sudo fail2ban-client status sshd**" %}  
명령어 입력 시 사진과 같이 잘못된 로그인을 탐지한 것을 볼 수 있다.  
  
##### 4. bash 설정  
  
{% include colored_text.html color="orange" text="**.bashrc**" %} 파일을 수정해서 idle logout과 프롬프트, 히스토리를 수정한다.  
  
```shell
# idle logout
export TIMEOUT=300

# prompt
export PS1='\w\$ '

# edit history
export HISTSIZE=50000
export HISTFILESIZE=100000
export HISTCONTROL=ignoredups:erasedups:ignorespace
export HISTTIMEFORMAT='%F %T '
shopt -s histappend
PROMPT_COMMAND='history -a; history -n; '"$PROMPT_COMMAND"
```
  
프롬프트에는 계정과 호스트를 빼고 경로만 남긴다.  
히스토리를 정리하지 않으면 기본적으로  
  
![img04](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img04.webp)  
  
이렇게 나오는데  
중복제거, 타임스탬프 추가 등 작업을 통해 아래와 같이 깔끔하게 정리할 수 있다.  
  
![img05](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img05.webp)  
  
##### 5. 도커 설치  
  
아 도커는 필수 툴이지.  
작업 PC 환경은 로키 리눅스를 사용하는데 우분투는 또 설치방법이 조금 다르다.  
조금 더 길다.  
  
```shell
# 필수 패키지 확인
sudo apt install -y ca-certificates curl gnupg

# gpg 키 및 repo 등록
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 실행, 권한부여
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```
  
![img07](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img07.webp)  
  
정상적으로 서비스 올라온 것을 확인하면 끝.  
  
##### 6. 공지 수정  
  
서버 계정 로그인 시 공지가 뜬다.  
버전 정보나 간단한 안내문, 업데이트 관련 정보가 노출이 되는데 대부분 필요없다.  
  
![img08](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img08.webp)  
  
현재 정보에서 시스템 정보, 업데이트 가능 여부, 마지막 로그인 3가지 정보만 남기고 다 지워보자.  
  
{% include colored_text.html color="orange" text="**/etc/update-motd.d**" %} 경로로 들어가면 공지 관련 파일들이 있다.  
파일들은 숫자 순서로 실행된다.  
  
![img09](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img09.webp)  
  
마지막 로그인은 PAM 에서 출력하니 상관없다.  
파일들을 확인해서 보여주지 않을 내용이 있는 파일에 대한 실행 권한을 제거한다.  
  
![img10](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img10.webp)  
  
이후 로그인 해보면 공지가 상당수 줄어든 것을 볼 수 있다.  
  
![img11](/assets/images/posts/Server/2025-09-12-Server MK3 Setting/img11.webp)  
  
ESM 메시지는 업데이트 메시지에 딸려오는거 같은데...  
수동 제거하거나 커스텀해야하는데 귀찮으니 당분간 냅두자.  
근데 뭐했다고 온도가 60도가 넘지?  
  
> #### 마무리 
---  
  
금방 설정하고 끝날 줄 알았는데 생각보다 이것도 해야지 저것도 해야지 하다보니 바빠졌다.  
  
분명 또 빼먹은게 있을테니 쉬면서 생각나면 추가로 진행하고 서비스 올려봐야겠다.  

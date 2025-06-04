---
title: "서버 관리 콘솔"
date: "2025-04-28 20:00:00 +0900"
last_modified_at: "2025-04-28 20:00:00 +0900"
categories: 
  - one-pan/ShellScript/
author: movingwoo
---
> #### 탄생 비화  
---  

WSL 환경에서 tomcat과 jdk를 버전별로 올려 테스트 중 문제 발생  
윈도우 IP로 접속 시 WSL과 바로 연결이 안됨  
{% include colored_text.html color="orange" text="ㄴ **포트 매핑이 필요하다.**" %}  
  
모든 톰캣의 포트를 일일이 매핑시키기 귀찮음  
{% include colored_text.html color="orange" text="ㄴ **nginx를 올려 443번만 뚫고 각 톰캣 http 포트로 매핑**" %}  
  
설정 일일히 하기 귀찮아서 톰캣 8080 포트 통일  
일일이 경로 찾아가서 끄고 키기 귀찮아짐  
alternatives 로 jdk 버전 바꾸는 것도 귀찮음  
{% include colored_text.html color="orange" text="ㄴ **그냥 간단한 shell script 작성해 때우자!**" %}  
  
> #### 구현 포인트  
---  

##### 1. 메뉴 틀 작성  
  
```shell
# 메뉴가 계속 돌아야 하므로 반복문 안에 집어넣는다
while true; do
  clear # 계속 쌓이므로 돌아올때 clear
	
  # 숫자와 함께 메뉴 틀 작성
  echo "=========================="
  echo "      Manage Console"
  echo "--------------------------"
  echo "00. Refresh"
  echo "11. JDK"
  echo "21. Nginx"
  echo "... 중략 ..."
  echo "Else. Exit"
  echo "=========================="
  echo -n ">> "

  read choice
	
  # 입력 받아서 분기
  case $choice in
    00)
      ;;
    11)
      ;;
    21)
      ;;
    *)
      exit 0
      ;;
  esac
done
```
  
##### 2. 기동 및 중단 완료 판단  

- docker  
  - start 시 컨테이너 완전 기동 판단을 위해 docker compose 사용 등을 고려해야함 -> 귀찮으니 그냥 start 후 기동 처리  
  - stop 시 프로세스 사라지면 중단 처리  
- nginx  
  - nginx 헬스체크 페이지를 만들어두고 curl 호출해서 200 성공 시 기동 처리  
  - 종료 시 프로세스 확인  
- tomcat  
  - ROOT 페이지를 남겨두고 curl 호출해서 200 성공 시 기동 처리  
  - 종료 시 프로세스 확인  
  
```shell
# 프로세스가 올라올 때까지 기다리는 함수
wait_service_process() {
  while true; do
    if ps -aux | grep -E "grep 할 단어" | grep -v grep > /dev/null; then
      return
    else
      sleep 1
    fi
  done
}

# curl 성공할 때까지 기다리는 함수
wait_service_curl() {
  if ps -aux | grep -E "grep 할 단어" | grep -v grep > /dev/null; then
    while true; do  
      # http status만 200인지 확인
      http_status=$(curl -s -o /dev/null -w "%{http_code}" -L -k --connect-timeout 5 --max-time 5 https://localhost:8080/)
			
      if [ "$http_status" = "200" ]; then
        return
      else
        sleep 1
      fi
    done
  fi
}
```
  
##### 3. 로딩 처리  
  
```shell
# 로딩 애니메이션 함수
loading_animation() {
  frames=('-' '\' '|' '/')
	
  while true; do
    for frame in "${frames[@]}"; do
      # 0.2초마다 노란색 프레임이 돌아간다
      echo -ne "\r\e[33mLoading... $frame \033[K\e[0m"
      sleep 0.2
    done
  done
}

# 서비스 시작 시 
start_service() {
  # 로딩 중 입력을 막고 애니메이션을 시작한다.
  stty -echo -icanon
  loading_animation &
  animation_pid=$!

  # ... 중략 ...

  # 완료 후 애니메이션을 종료하고 입력버퍼를 비운다.
  kill $animation_pid 2>/dev/null
  wait $animation_pid 2>/dev/null
  while read -t 0.1 -n 10000; do : ; done
  stty echo icanon

  # 서비스 종료도 마찬가지로 처리
}
```
  
##### 4. jdk 변경 처리

```shell
# JDK 버전 변경 함수
switch_jdk_version() {
  # ... 전략 ...
	
  # 설치된 자바 목록은 alternatives로 가져와서 보여준다
  JAVA_PATHS=($(alternatives --display java | grep -E '^/usr' | awk '{print $1}'))

  i=1
  for path in "${JAVA_PATHS[@]}"; do
    echo "$i. $path"
    ((i++))
  done

  # ... 중략 ...
	
  # 버전마다 내부 경로가 다르다 (특히 1.8이 문제)
  # jre 경로에서 javac을 찾는데 없을 경우 상위 bin 폴더에서 javac을 찾는다
  SELECTED_PATH="${JAVA_PATHS[$((num-1))]}"
  SELECTED_DIR=$(dirname "$SELECTED_PATH")
  JAVAC_PATH="${SELECTED_DIR}/javac"
	
  if [ ! -f "$JAVAC_PATH" ]; then
    PARENT_DIR=$(dirname "$SELECTED_DIR")
    GRAND_PARENT_DIR=$(dirname "$PARENT_DIR") 
    JAVAC_PATH="${GRAND_PARENT_DIR}/bin/javac"
  fi

  # ... 중략 ...
	
  # alternatives를 이용해서 선택한 경로의 java와 javac으로 바꾼다
  alternatives --set java "$SELECTED_PATH"
  alternatives --set javac "$JAVAC_PATH"
}
```  
  
##### 5. 변수 설정
  
```shell
# 가능한한 추후 쉽게 변동될만한 부분은 변수부로 뺀다
# NGINX ENV
export NGINX_GREP=nginx: master
export NGINX_PORT=443
export NGINX_URL=/health

# TOMCAT10 ENV
export TOMCAT10_PATH=/app/tomcat10.1.9
export TOMCAT10_GREP=app/tomcat10.1.9
export TOMCAT10_PORT=8080
export TOMCAT10_URL=
# ... 후략 ...
```
  
> #### 완성  
---  

![img01](/assets/images/posts/one-pan/ShellScript/2025-04-28-Server Manage Console/img01.webp)  
  
각 프로세스 현 상황과 jdk 버전을 한 눈에 확인하기 위한 상태 확인 코드를 추가하고 기동  
메뉴 별 번호를 입력시 기동/중단을 즉시 수행한다  
  
![img02](/assets/images/posts/one-pan/ShellScript/2025-04-28-Server Manage Console/img02.webp)  
  
메뉴 선택 시 로딩화면과 함께 기동/중단이 진행된다  
  
> #### 반성  
---  

대충 뚝딱 만들었다보니 고칠 수 있는 부분이 많이 보인다  
  
1. 메뉴 선택 시  
메뉴의 디자인을 단순하게 유지한다면 **idx를 잡고 반복문**을 돌리는 것으로 코드를 줄일 수 있다  
  
2. 기동/중단 시  
**메뉴 선택시 start / stop** 을 넘기면 중복 코드를 제거할 수 있다  
  
3. 환경변수  
**배열로 설정**하고 배열을 가져와서 빼 쓰면 코드를 많이 줄일 수 있다  
1번 내용과 함께할 시 하드코딩된 부분을 상당수 제거 가능하다  
  
> #### 코드 확인   
---  

[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/ShellScript/2025-04-28-Server%20Manage%20Console.sh)


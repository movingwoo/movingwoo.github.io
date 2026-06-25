---
title: "도커 컴포즈 관리 방안"
description: "여러개의 도커 컴포즈를 어떻게 관리할 것인가"
date: "2026-06-25 09:00:00 +0900"
last_modified_at: "2026-06-25 09:00:00 +0900"
categories: 
  - Server/
tags: [SERVER, DOCKER, COMPOSE]
author: movingwoo
---
> #### 개요  
---  
  
도커 컴포즈는 단일 서버에서 여러 컨테이너를 하나로 묶어 관리하기 위한 좋은 방법이다.  
그런데 여러 서비스를 올리다 보면 도커 컴포즈가 늘어난다.  
어? 도커 컨테이너가 늘어나는건 컴포즈가 관리해주는데 컴포즈가 늘어나는건 누가 관리함?  
  
> #### 몰라 개발하지 뭐  
---  
  
새 이미지 pull 하고 필요하면 재기동하고 system prune으로 찌꺼기 파일 정리 정도는 주기적으로 수행한다.  
관리라 하면 거창하지만 이게 컴포즈가 3개가 되는 순간부터 상당히 귀찮아졌다.  
  
그래서 이거 그냥 sh 만들면 그만 아닌가? 하고 개발에 착수.  
  
```shell
main() {
  while true; do
    show_menu
    read -r choice

    case "$choice" in
      1)
        run "종료" down
        ;;
      2)
        run "기동" up -d
        ;;
      3)
        run "업데이트" pull
        ;;
      4)
        run "업데이트" pull
        run "재기동" up -d
        ;;
      5)
        run
        ;;
      0)
        echo "Byte byte!"
        exit 0
        ;;
      *)
        echo "잘못된 입력"
        ;;
    esac
  done
}
```
  
대충 이렇게 메뉴를 만든다.  
  
```shell
find_services() {
    find "$SCRIPT_DIR" -mindepth 2 -maxdepth 2 -type f '(' -name 'docker-compose.yml' -o -name 'docker-compose.yaml' ')' -exec dirname {} ';'
}
```
  
depth를 2로 제한해 현재 내 폴더 구조에 맞게 docker-compose.yml이 위치할 폴더만 뒤져서 경로를 수집한다.  
  
```shell
local success=()
local failed=()

for service_dir in "${services[@]}"; do
  local service_name
  service_name="$(basename "$service_dir")"

  echo
  echo "===================================="
  echo "   [$service_name] $description"
  echo "===================================="

  if (cd "$service_dir" && docker compose "${compose_args[@]}"); then
    success+=("$service_name")
  else
    echo ">> [$service_name] 실패"
    failed+=("$service_name")
  fi
done
```
  
이후 대충 명령 수행하고 보여준다.  
  
```shell
run_prune() {
    echo
    echo "컨테이너 정리"
    if docker container prune -f; then
        echo "완료"
    else
        echo ">> 실패"
    fi

    echo
    echo "네트워크 정리"
    if docker network prune -f; then
        echo "완료"
    else
        echo "실패"
    fi

    echo
    echo "이미지 정리"
    if docker image prune -f; then
        echo "완료"
    else
        echo "실패"
    fi
}
```
  
docker system prune -f 하면 되긴하는데  
그냥 뭐라도 여러개 뜨는게 보기 좋아서 container, network, image를 따로따로 돌린다.  
  
![img01](/assets/images/posts/Server/2026-06-25-How To Manage Docker Compose/img01.webp){: width="40%"}  
  
여튼 이런 스크립트를 만들고 잘 쓰고 있었는데...  
  
> #### 멍청하면 몸이 고생  
---  
  
[dockerdocs - include](https://docs.docker.com/reference/compose-file/include/)  
  
{% include colored_text.html color="orange" text="**include**" %}라는 기능을 설명하는 도커 공식 문서이다.  
그게 무엇이냐?  
도커 컴포즈 2.20.0 버전 이상에서 지원하는 기능이다.  
메인 파일 하나에서 각 서비스의 yml을 불러와 병합하여 독립성을 유지하면서 한 번에 제어할 수 있다.  
중앙 yml 하나를 두고 명령을 날리면  
지정된 하위 파일들을 읽어와 메모리에서 병합해 하나의 설정 파일이 되는 식이다.  
  
include를 사용할 경우 주의할 점이라면 아래와 같겠다.  
- 공통 네트워크 자동 공유 -> {% include colored_text.html color="orange" text="**전혀 상관 없음**" %}  
- 상대경로 문제 발생 -> {% include colored_text.html color="orange" text="**이럴 줄 알고 무조건 절대경로로 설정함**" %}  
  
뭐 이런 말도 안되는 좋은 기능이 있다고?  
2.20.0 버전은 23년 7월에 출시했다고 한다.  
까마득한 옛날인데?  
  
그럼 이런 좋은 기능을 어떻게 쓰느냐?  
  
![img02](/assets/images/posts/Server/2026-06-25-How To Manage Docker Compose/img02.webp){: width="70%"}  
  
허허허허 이게 말이되나  
이렇게 간단한 것을 나는 왜...  
  
{% include colored_text.html color="red" text="**이게 다 멍청해서 그렇다.**" %}  
멍청하면 몸이 고생하는게 국룰임.  
  
> #### 정리  
---  
  
중앙 docker-compose.yml은 간단하게 작성할 수 있다.  
  
```yaml
include:
  - /app/service1/docker-compose.yml
  - /app/service2/docker-compose.yml
  - /app/service3/docker-compose.yml
  - /app/service4/docker-compose.yml
  # 계속 추가
```
  
이게 끝이다.  
이제 이 yml 파일에다 대고 명령어를 입력하면 한번에 전파된다.  
뭐 sh 만드고 개 뻘짓을 할 이유가 전혀 없다는 거다.  
  
그냥 {% include colored_text.html color="orange" text="**docker compose up -d --build --pull always**" %} 명령어로 한번에 처리하면 된다.  
숙제 단축 성공!  
  
쉘 스크립트로 기록된 멍청의 역사는 아까우니까 github에 올려서 박제해두도록 한다...  
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/Server/2026-06-25-How%20To%20Manage%20Docker%20Compose.sh)
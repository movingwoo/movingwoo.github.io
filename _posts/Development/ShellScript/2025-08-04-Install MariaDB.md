---
title: "마리아디비 설치"
description: "마리아디비 설치 스크립트 개발"
date: "2025-08-04 16:00:00 +0900"
last_modified_at: "2025-08-04 16:00:00 +0900"
categories: 
  - Development/ShellScript/
tags: [SHELL, 마리아디비 설치]
author: movingwoo
---
> #### 개요  
---  

일반적인 리눅스 환경에서 마리아디비 설치가 필요한 경우 rpm으로 설치한다.  
간편하고 빠르다.  
  
하지만 rpm을 쓸 수 없는 특수한 환경에서는 어떡하지?  
구글링하면서 공부하다가 자동화 스크립트 만들 수 있을 것 같아서 만든다.  
  
> #### 설계  
---  
  
[MariaDB Foundation Download](https://mariadb.org/download/)  
  
설치할 마리아디비 tarball 파일은 공식홈페이지에서 구할 수 있다.  
  
tar 파일 이용해 설치 진행 시 내용을 간단히 요약해보자면  
1. {% include colored_text.html color="orange" text="**파일들을 적당히 경로로 옮긴다.**" %}  
2. {% include colored_text.html color="orange" text="**데이터베이스 초기화 스크립트를 수행한다.**" %}  
3. {% include colored_text.html color="orange" text="**기동!!**" %}  
  
써놓고 보면 아주 단순한데 막상 해보면 이상한 오류가 나기도 하고  
알 수 없는 억까의 세계  
  
일단 커맨드 자체는 아주 단순한 편들이라 스크립트화 가능하다.  
  
> #### 구현  
---  
  
##### 1. 환경변수와 사용법 함수  
  
rpm으로 설치해보면 {% include colored_text.html color="orange" text="**mysql**" %} 계정이 디폴트다.  
다른 계정을 쓸 수 있으니 그룹과 계정을 변수로 뺀다.  
  
{% include colored_text.html color="orange" text="**TAR**" %} 파일 경로는 당연히 옵션화 해야하며  
{% include colored_text.html color="orange" text="**/usr/local**" %} 하위 설치를 디폴트로 두고 변수화한다.  
  
사용 시 설치를 리트라이할 수 있는데 이때를 위해 데이터를 삭제하는 옵션을 넣어준다.  
{% include colored_text.html color="orange" text="**RESET**" %} 옵션은 삭제 후 재설치, {% include colored_text.html color="orange" text="**CLEAN**" %} 옵션은 삭제만 하는 것으로 한다.  
  
그냥 스크립트 호출하는 순간 설치가 진행되는 것도 위험하기 때문에 {% include colored_text.html color="orange" text="**INSTALL**" %} 옵션을 넣어준다.  
  
```shell
# 기본 변수
GROUP="mysql"
USER="mysql"
TAR_FILE="/home/app/mariadb-10.11.13-linux-systemd-x86_64.tar.gz"
INSTALL_PREFIX="/usr/local"
INSTALL_DIR="$INSTALL_PREFIX/mariadb"
RESET=false
CLEAN_ONLY=false
INSTALL=false

# 옵션 파싱
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--install)    INSTALL=true; shift;;
    -r|--reset)      RESET=true; shift;;
    -c|--clean)      CLEAN_ONLY=true; shift;;
    -h|--help)       usage;;
    *)               echo "Unknown option: $1" >&2; usage;;
  esac
done
```
  
옵션 없이 스크립트를 호출하거나, -h 옵션을 넣을 경우에는 도움말을 보여주도록 한다.  
{% include colored_text.html color="red" text="**이런 거 무시하고 안넣으면 나중에 나도 까먹어서 사용할 수 없다...**" %}  
  
```shell
# 사용법 함수
usage() {
  cat <<EOF
Usage: sudo $0 [options]

Options:
  -i, --install     Install MariaDB
                    마리아디비 설치
  -r, --reset       Reset data before installing (remove then reinstall)
                    데이터 초기화 후 설치 (삭제 후 재설치)
  -c, --clean       Clean only (remove data without reinstalling)
                    초기화만 (재설치 없이 삭제)
  -h, --help        Show this help message and exit
                    도움말
EOF
  exit 1
}
```
  
##### 2. 설치 전 조건과 초기화 조건  
  
관리자 권한이 필요해 {% include colored_text.html color="orange" text="**root 권한**" %}을 체크한다.  
RESET 옵션과 CLEAN 옵션이 충돌하면 난리날거라 그 부분도 확인하고  
CLEAN을 지정했을 경우 삭제 후 프로세스를 종료하도록 설정한다.  
  
```shell
# root 권한 확인
if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] root 권한으로 실행해야 함" >&2
  exit 1
fi

# -r 과 -c 충돌 확인
if [ "$RESET" = true ] && [ "$CLEAN_ONLY" = true ]; then
  echo "[ERROR] -r 과 -c 옵션은 함께 사용 불가" >&2
  exit 1
fi

# 아무 옵션도 안걸면 -h로 수행
if [ "$INSTALL" != true ] && [ "$RESET" != true ] && [ "$CLEAN_ONLY" != true ]; then
  usage
fi

# 초기화 (reset 또는 clean)
if [ "$RESET" = true ] || [ "$CLEAN_ONLY" = true ]; then
  echo "=== MariaDB 초기화 시작 ==="
  systemctl stop mariadb >/dev/null 2>&1 || true
  systemctl disable mariadb >/dev/null 2>&1 || true
  rm -f /etc/systemd/system/mariadb.service
  systemctl daemon-reload >/dev/null 2>&1 || true
  rm -rf "$INSTALL_DIR"
  rm -f /etc/profile.d/mariadb.sh
  rm -rf "$INSTALL_PREFIX/mysql"
  echo "=== 초기화 완료: 설치 디렉터리, 서비스 파일, 환경변수, 링크 제거 ==="

  if [ "$CLEAN_ONLY" = true ]; then
    exit 0
  fi
fi
```
  
##### 3. 설치  
  
설치 커맨드를 나열하는 단계.  
  
마리아디비가 마이에스큐엘의 아종이다보니 헷갈리는 부분이 많았다.  
mysql 이름의 폴더를 기본 설정으로 찾는 경우가 많아서 {% include colored_text.html color="orange" text="**심볼릭 링크**" %}를 생성해 오류를 피하고  
{% include colored_text.html color="orange" text="**데이터베이스 초기화 파일**" %}도 mariadb~~ 인 경우가 있고 mysql~~ 인 경우가 있어서 뭐라도 있으면 찾아서 쓰도록 하였다.  
  
실제 이리저리 시도해보다 온갖 오류가 나길래 이 단계에서의 관건은 실패 시 해결책을 같이 써두는 것으로 하였다.  
{% include colored_text.html color="orange" text="**ERROR**" %} 태그 출력 시 가능하면 {% include colored_text.html color="orange" text="**HOW TO FIX**" %} 태그와 함께 수동으로 문제를 확인해볼 수 있게 한다.  
  
```shell
# 설치
if [ "$INSTALL" = true ] || [ "$RESET" = true ]; then

  # 그룹/사용자 생성
  getent group "$GROUP" >/dev/null || groupadd "$GROUP"
  getent passwd "$USER" >/dev/null || useradd -r -g "$GROUP" -s /bin/false "$USER"

  # 압축 해제
  if [ ! -f "$TAR_FILE" ]; then
    echo "[ERROR] '$TAR_FILE' 파일을 찾을 수 없음" >&2
    echo "[HOW TO FIX] TAR_FILE 경로와 이름이 정확한지 확인."
    exit 1
  fi

  echo "[INFO] '$TAR_FILE' 압축 해제 중..."
  mkdir -p "$INSTALL_PREFIX"
  tar -xzf "$TAR_FILE" -C "$INSTALL_PREFIX"
  echo "[SUCCESS] '$INSTALL_PREFIX' 아래 디렉터리 압축 해제 완료"

  # 디렉터리 위치 조정
  EX_DIR=$(tar -tf "$TAR_FILE" | head -1 | cut -f1 -d"/")
  mv "$INSTALL_PREFIX/$EX_DIR" "$INSTALL_DIR"
  echo "[SUCCESS] '$INSTALL_DIR'로 이동 완료"

  # 링크 생성
  ln -sfn "$INSTALL_DIR" "$INSTALL_PREFIX/mysql"
  echo "[SUCCESS] '$INSTALL_PREFIX/mysql' 심볼릭 링크 '$INSTALL_DIR' 생성 완료"

  # 권한 설정
  cd "$INSTALL_DIR"
  mkdir -p mysql-files data
  chown -R "$USER":"$GROUP" .
  chmod 750 mysql-files
  echo "[SUCCESS] mysql-files, data 디렉터리 권한 변경 완료"

  # 데이터베이스 초기화
  if [ -x "bin/mariadb-install-db" ]; then
    bin/mariadb-install-db \
      --user="$USER" \
      --basedir="$INSTALL_DIR" \
      --datadir="$INSTALL_DIR/data"
    echo "[SUCCESS] bin/mariadb-install-db로 데이터베이스 초기화 완료"

  elif [ -x "scripts/mysql_install_db" ]; then
    scripts/mysql_install_db \
      --user="$USER" \
      --basedir="$INSTALL_DIR" \
      --datadir="$INSTALL_DIR/data"
    echo "[SUCCESS] scripts/mysql_install_db로 데이터베이스 초기화 완료"

  else
    echo "[ERROR] 초기화 스크립트를 찾을 수 없음, 수동 초기화 필요" >&2
    echo "[HOW TO FIX]"
    echo "  1) $INSTALL_DIR/bin 또는 $INSTALL_DIR/scripts 경로 확인"
    echo "  2) 해당 경로에서 mysql_install_db 또는 mariadb-install-db 실행"
    echo "  3) 설정 완료 후 'systemctl start mariadb' 재시도"
  fi

  # 환경변수 등록
  cat <<EOF > /etc/profile.d/mariadb.sh
export PATH=$INSTALL_DIR/bin:\$PATH
EOF
  chmod +x /etc/profile.d/mariadb.sh
  echo "[SUCCESS] /etc/profile.d/mariadb.sh 생성 및 권한 변경 완료"
fi
```
  
##### 4. 나머지 과정  
  
rpm으로 설치해보면 systemctl로 컨트롤 할 수 있게 올라간다.  
요즘에 {% include colored_text.html color="orange" text="**systemd**" %} 안쓰는 리눅스가 어디있냐! 하느냐면  
당장 도커 컨테이너로 올리면 systemd 쓰기가 녹록치 않다.  
  
때문에 분기로 systemd 여부를 체크하고 있으면 등록, 없으면 mysqld_safe 기동 후 크론탭에 자동 등록하도록 한다.  
  
```shell
# systemd 존재할 경우 서비스 설정 및 시작, 없으면 mysqld_safe 실행 후 크론 등록
if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  IS_SYSTEMD=true
else
  IS_SYSTEMD=false
fi

SERVICE_SRC=$(find "$INSTALL_DIR" -type f -name mariadb.service | head -n1)

if [ "$IS_SYSTEMD" = true ];then
  if [ -n "$SERVICE_SRC" ]; then
    echo "[INFO] 서비스 설정"
    cp "$SERVICE_SRC" /etc/systemd/system/mariadb.service
    sed -i "s|/usr/local/mysql|$INSTALL_DIR|g" /etc/systemd/system/mariadb.service
    systemctl daemon-reload
    systemctl enable mariadb
    systemctl start mariadb || true
    echo "[SUCCESS] 서비스 시작 완료, 상태확인: systemctl status mariadb"

  else
    echo "[ERROR] mariadb.service 파일을 찾을 수 없음" >&2
      echo "[HOW TO FIX]"
      echo "  1) 설치 디렉터리에서 service 파일 검색: find $INSTALL_DIR -type f -name mariadb.service"
      echo "  2) 해당 파일을 /etc/systemd/system/ 디렉터리에 복사: sudo cp <경로> /etc/systemd/system/mariadb.service"
      echo "  3) systemd 다시 로드 및 서비스 활성화/시작:"
      echo "       sudo systemctl daemon-reload"
      echo "       sudo systemctl enable mariadb"
      echo "       sudo systemctl start mariadb"
      exit 1
  fi
else
  echo "[INFO] 크론 설정"
  sudo -u "$USER" "$INSTALL_DIR/bin/mysqld_safe" \
      --basedir="$INSTALL_DIR" \
      --datadir="$INSTALL_DIR/data" > /var/log/mariadb.log 2>&1 &

  (
    crontab -l 2>/dev/null \
    | grep -v -F "$INSTALL_DIR/bin/mysqld_safe" || true
    echo "@reboot sudo -u $USER $INSTALL_DIR/bin/mysqld_safe --basedir=$INSTALL_DIR --datadir=$INSTALL_DIR/data >> /var/log/mariadb.log 2>&1 &"
  ) | crontab -

  echo "[SUCCESS] mysqld_safe 시작 완료, 크론 등록 완료"
fi

echo "=== MariaDB 설치 및 서비스 구동 완료 ==="
echo "DB 접속할 계정에서 1회만 실행: source /etc/profile.d/mariadb.sh"
echo "접속: mysql -u root"
```
  
> #### 완성  
---  
  
![img01](/assets/images/posts/Development/ShellScript/2025-08-04-Install MariaDB/img01.webp)  
  
이후 계정 생성이나 튜닝이나 기타 등등은 재주껏 하는 것  
  
> #### 반성  
---  
  
생각해보니 크론탭 등록 분기 추가했으면 삭제 시 크론도 삭제해야하는데 빼먹었다!!!  
아 이제와서 손대기 귀찮으니 다음에 사고나면 고쳐보자.  
  
OS는 유닉스를 가져오지 않는 이상 웬만하면 돌아갈 것 같다.  
버전도 10 버전, 11버전만 써보긴 했는데 뭐 크게 바뀌는거 아니면 웬만하면 돌아가지 않을까?  
  
이 스크립트가 안돌아갈 정도로 버전이 바뀌면 어차피 나도 이 스크립트의 존재를 까먹고 지낼 것 같긴 하다.  
  
> #### 코드 확인   
---  
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/Development/ShellScript/2025-08-04-Install%20MariaDB.sh)


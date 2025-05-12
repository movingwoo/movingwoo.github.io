---
title: "파일 복사기"
date: "2025-05-12 16:00:00 +0900"
last_modified_at: "2025-05-12 16:00:00 +0900"
categories: 
  - one-pan/ShellScript/
author: movingwoo
---
> #### 탄생 비화  
---  

리눅스 파일 100개를 일일이 복사하려는 안타까운 광경을 보고 대충 투닥투닥 만들어줌...  
  
> #### 구현 포인트  
---  

##### 1. 입력받기  
  
파일과 복사할 숫자를 입력받고 없으면 예외처리해준다.
  
```shell
read -p "파일명 입력 (확장자 포함) : " FILENAME

if [ ! -e "$FILENAME" ]; then
  echo "파일이 없음..."
  exit 1
fi

read -p "복사할 개수 (숫자) : " COUNT

if [[ ! $COUNT =~ ^[0-9]+$ ]]; then
  echo "숫자가 아님..."
  exit 1
fi
```
  
##### 2. 복사

인덱스를 1부터 잡고 반복문을 돌려 파일을 생성한다.
  
```shell
for i in $(seq 1 $COUNT)
do
  cp -r "$FILENAME" "${FILENAME%.*}$i.${FILENAME##*.}"
  echo "$i/$COUNT 진행 중.."
done

echo "$COUNT 개 복사 완료!!"
```
  
> #### 완성  
---  

![img01](/assets/images/posts/one-pan/ShellScript/2025-05-12-File Copier/img01.jpg)  
  
> #### 반성  
---  

같은 경로에 있는 파일만 되는데 제대로 할거면  
- 복사할 파일 경로  
- 복사 위치  
- 파일명 규칙  
  
이렇게 받아야하지 않을까?  
  
다음에 해봐야겠다.  
  
> #### 코드 확인   
---  

[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/ShellScript/2025-05-12-File%20Copier.sh)


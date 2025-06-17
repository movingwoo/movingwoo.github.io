---
title: "WebP 변환기"
description: "PYTHON WEBP 변환기 프로그램 개발"
date: "2025-06-04 11:00:00 +0900"
last_modified_at: "2025-06-17 15:00:00 +0900"
categories: 
  - Development/Python/
tags: [PYTHON, WEBP 변환기]
author: movingwoo
---
> #### 개요  
---  

jpg는 화질을 제법 깎아먹어서 용량이 가벼운 편이다.  
하지만 지난 포스트를 작성하며 이미지를 더 가볍게 유지할 필요성을 느꼈고  
{% include colored_text.html color="orange" text="**webp**" %}로 변환하는게 좋겠다는 결론에 도달했다.  
  
그러면 WebP 변환기를 만들어야겠지!!!  
  
변환하며 화질을 살짝 열화시키면 더 효과가 좋을 것이다.  
뭐 영화 보는 것도 아니고 고화질 유지할 필요는 없으니  
  
파이썬을 선택한 이유는 간단하다.  
딸깍 한 번 하면 필요한 라이브러리가 설치되니까.  
  
자바로 하면 TwelveMonkeys 같은 외부 라이브러리 끌어와야하고  
C++하면 libwebp 빌드부터가 귀찮다.  
  
편하게 쓰려고 내가 파이썬을 배웠지  
  
> #### 설계  
---  
  
webp로 변환할 타겟 폴더를 선택하는게 좋나, 타겟 이미지가 있는 폴더에 소스코드를 넣어두고 실행시키는게 좋나?  
고민 끝에 더 생각없이 쓰려면 후자가 쉽고 빠를 것 같아 후자로 한다.  
  
현재 폴더의 모든 이미지를 타겟 폴더에 webp로 뱉어내도록 한다.  
  
하는 김에 용량 얼마나 줄였는지 디스플레이도 해주면 좋겠다.  
  
> #### 구현 포인트  
---  
  
{% include colored_text.html color="orange" text="**Pillow**" %} 라이브러리를 사용한다.  
  
##### 1. 기초 코드  
    
```python
from PIL import Image
import os

# 실행 경로
folder = os.getcwd()

# 폴더 내 파일들을 대상으로 변환
for filename in os.listdir(folder):
    img_path = os.path.join(folder, filename)
    webp_path = os.path.splitext(img_path)[0] + ".webp"
    Image.open(img_path).save(webp_path, "WEBP", quality=80) # 80% 품질

    print("변환 완료")
```
  
##### 2. 세부 설정  
  
예외처리를 위해 이미지 확장자를 제한한다.  
jpg와 png, gif 3종류면 되겠지 뭐.  
  
그리고 변환 전후로 용량을 확인해 print 시 표시해준다.  
  
gif 파일은 그냥 변환하면 애니메이션이 사라지므로 따로 분기를 태워준다.  
  
```python
# jpg, png, gif
if filename.lower().endswith((".jpg", ".jpeg", ".png", ".gif")):
    img_path = os.path.join(folder, filename)
    webp_path = os.path.join(target_folder, os.path.splitext(filename)[0] + ".webp")

    with Image.open(img_path) as img:
        # gif는 애니메이션 때문에 특수 처리
        if img.format == "GIF" and getattr(img, "is_animated", False):
            frames = []
            durations = []
            # 그냥 변환하면 너무 느려서 duration 직접 추출
            for frame in ImageSequence.Iterator(img):
                frames.append(frame.copy())
                durations.append(frame.info.get("duration", 100)) 

            frames[0].save(
                webp_path,
                "WEBP",
                save_all=True,
                append_images=frames[1:],
                duration=durations,
                loop=img.info.get("loop", 0),
                quality=80,
            )
        # 애니메이션 없으면 그냥 변환
        else:
            img.save(webp_path, "WEBP", quality=80)

    # 용량 확인 (kb)
    before_size = os.path.getsize(img_path) / 1024
    after_size = os.path.getsize(webp_path) / 1024

    print(f"{filename} 변환 완료")
    if after_size > before_size:
        print(f"↑↑증가↑↑ {(1 - before_size / after_size) * 100:.1f}% ({before_size:.1f}kb -> {after_size:.1f}kb)")
    else:
        print(f"↓↓감소↓↓ {(1 - after_size / before_size) * 100:.1f}% ({before_size:.1f}kb -> {after_size:.1f}kb)")
```
  
> #### 완성  
---  
  
테스트 이미지 파일 몇개 넣어놓고 돌려보았다.  
  
![img01](/assets/images/posts/one-pan/Python/2025-06-04-WebP Converter/img01.webp)  
  
{% include colored_text.html color="red" text="**gif는 용량이 오히려 늘어날 수 있다!!!**" %}  
변환해보고 webp가 오히려 용량이 많은 경우 gif를 그대로 써야겠다.  
  
늘어난 파일 제외하고 테스트 이미지 파일 압축 시 용량변화는 아래와 같다.  
  
![img02](/assets/images/posts/one-pan/Python/2025-06-04-WebP Converter/img02.webp)  
  
{% include colored_text.html color="orange" text="**18.1mb에서 4.51mb로 줄였으니 75% 가량 줄인 셈이다!!!**" %}  
홀리 지져스 크라이스트  
  
이제 그동안 올린 이미지 파일도 전체 용량 줄이기에 들어가자.  
쌓이면 답도 없으니 이미지가 하나라도 적은 지금 작업해야한다...  
  
> #### 반성  
---  
  
더 발전 시킬 수 있을거란 마음이 계속 생긴다.  
하지만 이런건 적당히 끊어줘야한다.  
잘 돌아가고 목적을 달성했으면 됐지.  
여기서 칼같이 끊어야겠다.  
이것 말고도 할게 많단 말이야.  
  
> #### 코드 확인   
---  
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/Python/2025-06-04-WebP%20Converter.py)


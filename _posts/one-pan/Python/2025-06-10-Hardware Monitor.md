---
title: "하드웨어 모니터"
date: "2025-06-10 08:00:00 +0900"
last_modified_at: "2025-06-10 08:00:00 +0900"
categories: 
  - one-pan/Python/
author: movingwoo
---
> #### 개요  
---  

![img01](/assets/images/posts/one-pan/Python/2025-06-10-Hardware Monitor/img01.webp)  
  
알리에서 3.5인치 모니터를 주웠다.  
온도 체크하기가 불편해서 사봤는데 리소스 사용량도 보여주고 상당히 괜찮다.  

제조사에서 드라이버를 제공해서 예쁜 테마를 가져다 그대로 쓸 수 있는데  
다소 불안한 감이 있고 이런 건 또 직접해야 제맛이다.  
필요없는 정보는 지우고 감성보다 기능성에 초점을 맞춘 새로운 테마를 만든다.  
  
> #### 설계  
---  
  
[turing-smart-screen-python](https://github.com/mathoudebine/turing-smart-screen-python)  
  
![img02](/assets/images/posts/one-pan/Python/2025-06-10-Hardware Monitor/img02.webp)  
  
이 오픈소스 프로젝트는 소형 시스템 모니터에 각종 정보를 보기 좋게 표시해주는 프로그램이다.  
능력자들이 밥을 다 차려놨으니 나는 숟가락만 들면 되는 것이다.  
  
소스코드를 다운로드 해 필요한 부분만 커스텀하고 사용할 수 있도록 하자.  
  
내게 필요한 정보는
- CPU, GPU 온도
- CPU 전체, 코어 별 사용량
- GPU, VRAM 사용량
- RAM 사용량
- 디스크 사용량
  
필요 없는 정보는
- 날짜
- 날씨
- 네트워크 사용량
- 업타임
  
아니 진짜 날짜 날씨는 왜 있지?  
메인 모니터나 휴대폰이 훨씬 잘 알려주는데  
  
> #### 커스텀  
---  
  
##### 1. 설치  
  
파이썬만 있으면 설치는 간편하다.  
  
```batch
pip install -r requirements.txt
```
  
pip 의존성 설치 후 실행하면 켜진다.  
바로 실행하려면 {% include colored_text.html color="orange" text="**main.py**" %}를, 설정 창을 띄우려면 {% include colored_text.html color="orange" text="**configure.py**" %}를 실행한다.  
  
```batch
python configure.py
```
  
![img03](/assets/images/posts/one-pan/Python/2025-06-10-Hardware Monitor/img03.webp)  
  
##### 2. 커스텀 테마 생성  
  
테마 파일은 {% include colored_text.html color="orange" text="**turing-smart-screen-python\res\themes**" %} 폴더에 위치해있다.  
MyCustomTheme 폴더를 생성하고 내부에 {% include colored_text.html color="orange" text="**theme.yaml**" %} 파일을 생성한다.  
  
구매한 3.5인치 모니터의 자체 프로그램 테마는 좀 다양한게 많아서 참고하려했더니  
.data 파일로 되어있어서 그냥 포기하고 새로 만들기로 한다.  
  
3.5인치 모니터의 크기는 480 X 320 이고 배경은 검은색으로 만들거라 그림판으로 검은색 사진을 만들어 {% include colored_text.html color="orange" text="**background.png**" %} 로 넣어준다.  
뭐 없으면 알아서 까만화면 될 줄 알았는데 오류 나더라...  
  
![img04](/assets/images/posts/one-pan/Python/2025-06-10-Hardware Monitor/img04.webp)  
  
yaml 수정은 즉각 반영되니 테마 에디터를 띄어두고 yaml을 수정하며 맞추면 된다.  
  
```batch
python theme-editor.py MyCustomTheme
```
  
![img05](/assets/images/posts/one-pan/Python/2025-06-10-Hardware Monitor/img05.webp)  
  
##### 3. yaml 작성  
  
기본적으로 yaml만 잘 작성해주면 해당 정보들을 알아서 가져온다.  
디폴트 테마를 예시로 삼아서 잘 작성해보자.  
  
CPU와 디스크 쪽은 커스텀이 들어가야해서 머리아프다.  
  
갱신은 디스크 제외 1초로 통일했다.  
1초 마다 사용량을 갱신할 의미가 있을까 싶어서 60초로 설정했다.  
  
```yaml
display:
  DISPLAY_SIZE: "3.5\""
  DISPLAY_ORIENTATION: "landscape"
  DISPLAY_REVERSE: true
  DISPLAY_RGB_LED: "0, 0, 0"

static_images:
  BACKGROUND:
    PATH: background.png
    X: 0
    Y: 0
    WIDTH: 480
    HEIGHT: 320

STATS:
  CPU:
    PERCENTAGE:
      INTERVAL: 1
      TEXT:
        SHOW: true
        X: 70
        Y: 20
        FONT: "jetbrains-mono/JetBrainsMono-Bold.ttf"
        FONT_SIZE: 22
        FONT_COLOR: "255, 50, 0"
        BACKGROUND_COLOR: 0, 0, 0
      GRAPH:
        SHOW: true
        X: 20
        Y: 50
        WIDTH: 200
        HEIGHT: 20
        MIN_VALUE: 0
        MAX_VALUE: 100
        BAR_COLOR: 255, 50, 0
        BAR_OUTLINE: true
        BAR_OUTLINE_COLOR: 255, 50, 0
        BACKGROUND_COLOR: 0, 0, 0
    TEMPERATURE:
      INTERVAL: 1
      TEXT:
        SHOW: true
        X: 155
        Y: 20
        FONT: "jetbrains-mono/JetBrainsMono-Bold.ttf"
        FONT_SIZE: 22
        FONT_COLOR: "255, 50, 0"
        BACKGROUND_COLOR: 0, 0, 0
    CORE_0:
      GRAPH:
        SHOW: true
        X: 70
        Y: 80
        WIDTH: 150
        HEIGHT: 10
        MIN_VALUE: 0
        MAX_VALUE: 100
        BAR_COLOR: 255, 50, 0
        BAR_OUTLINE: true
        BAR_OUTLINE_COLOR: 255, 50, 0
        BACKGROUND_COLOR: 0, 0, 0
    CORE_1:
      GRAPH:
        SHOW: true
        X: 70
        Y: 95
        WIDTH: 150
        HEIGHT: 10
        MIN_VALUE: 0
        MAX_VALUE: 100
        BAR_COLOR: 255, 50, 0
        BAR_OUTLINE: true
        BAR_OUTLINE_COLOR: 255, 50, 0
        BACKGROUND_COLOR: 0, 0, 0

### ... 후략 ... ###
```
  
##### 4. 파이썬 코드 커스텀  
  
theme.yaml을 읽어 파이썬 코드로 필요한 정보를 빼오는 식이다.  
코드를 수정하면 원하는 정보를 다양하게 가져올 수 있다는 것.  
  
우선 기본 테두리 설정이 너무 얇아서 테두리를 굵게 해준다.  
수정 대상 파일은 {% include colored_text.html color="orange" text="**turing-smart-screen-python\library\lcd\lcd_comm.py**" %}  
  
```python
if bar_outline:
    # Draw outline
    # 테두리 두께 추가
    outline_width = 3
    draw.rectangle([0, 0, width - 1, height - 1], fill=None, outline=bar_color, width=outline_width)
```
  
{% include colored_text.html color="orange" text="**turing-smart-screen-python\library\stats.py**" %}  
main.py 실행 시 스케쥴러를 통해 stats.py 를 주기적으로 호출한다.  
각 센서 데이터를 수집하니 가장 커스텀할게 많은 셈이다.  

하나하나 커스텀하자면 끝도 없을텐데 최대한 쓸 수 있는 기능은 그대로 가져다 쓰고싶기 때문에 최소한의 커스텀을 해보자.  
yaml 만드는 것으로 이미 지쳤다.  
    
우선 모든 CPU 코어를 한 눈에 볼 수 있게 코어 정보를 가져온다.  
CPU 클래스에 코어 확인 함수를 추가하고 퍼센티지 호출하는 부분 하단에 코어 확인 함수를 추가한다.  
  
```python
@classmethod
def percentage(cls):
    theme_data = config.THEME_DATA['STATS']['CPU']['PERCENTAGE']
    cpu_percentage = sensors.Cpu.percentage(
        interval=theme_data.get("INTERVAL", None)
    )
    save_last_value(cpu_percentage, cls.last_values_cpu_percentage,
                    theme_data['LINE_GRAPH'].get("HISTORY_SIZE", DEFAULT_HISTORY_SIZE))
    # logger.debug(f"CPU Percentage: {cpu_percentage}")

    display_themed_progress_bar(theme_data['GRAPH'], cpu_percentage)
    display_themed_percent_radial_bar(theme_data['RADIAL'], cpu_percentage)
    display_themed_percent_value(theme_data['TEXT'], cpu_percentage)
    display_themed_line_graph(theme_data['LINE_GRAPH'], cls.last_values_cpu_percentage)

    # 코어 확인 함수
    CPU.core_percentages()

### ... 중략 ...

# 코어 확인 위한 함수
@classmethod
def core_percentages(cls):
    # theme.yaml에 정의된 코어별 항목을 자동으로 순회
    cpu_theme = config.THEME_DATA['STATS']['CPU']

    import psutil
    core_percents = psutil.cpu_percent(percpu=True)

    for idx, percent in enumerate(core_percents):
        key = f'CORE_{idx}'
        if key in cpu_theme and 'GRAPH' in cpu_theme[key]:
            display_themed_progress_bar(cpu_theme[key]['GRAPH'], percent)
```
  
디스크의 경우는 C, D, E 드라이브를 사용 중인데  
각각 드라이브 사용량을 보여주기 위해 커스텀한다.  
  
기존 코드는 단일 디스크의 사용량, 남은용량 등의 정보를 가져오는데  
나는 3개의 사용량만 확인하면 되기 때문에 전체 주석 처리 후 아래 코드로 사용량만 확인하게끔 바꿔주었다.  
  
```python
@classmethod
def stats(cls):
    import psutil
    disk_theme_data = config.THEME_DATA['STATS']['DISK']

    # C 드라이브
    try:
        c_usage = psutil.disk_usage('C:/').percent
    except Exception:
        c_usage = 0
    display_themed_progress_bar(disk_theme_data['C']['GRAPH'], c_usage)
    display_themed_percent_value(disk_theme_data['C']['TEXT'], c_usage)

    # D 드라이브
    try:
        d_usage = psutil.disk_usage('D:/').percent
    except Exception:
        d_usage = 0
    display_themed_progress_bar(disk_theme_data['D']['GRAPH'], d_usage)
    display_themed_percent_value(disk_theme_data['D']['TEXT'], d_usage)

    # E 드라이브 
    try:
        e_usage = psutil.disk_usage('E:/').percent
    except Exception:
        e_usage = 0

    display_themed_progress_bar(disk_theme_data['E']['GRAPH'], e_usage)
    display_themed_percent_value(disk_theme_data['E']['TEXT'], e_usage)
```
  
> #### 완성  
---  
  
![img06](/assets/images/posts/one-pan/Python/2025-06-10-Hardware Monitor/img06.webp)  
  
딱 내가 필요한 정보만 쑤셔박았다  
음 투박해 기능적이야  
  
자동 실행을 위해 작업 스케쥴러에 등록하고  
깔끔하게 보이기 위해 어항 케이스 안으로 쑤셔박으면 된다.  
  
> #### 반성  
---  
  
cpu나 보드, 그래픽카드 제품 명도 넣는게 좋을까? 생각했는데  
별로 기능적으로 의미가 없을 것 같다.  
  
AI에 적당히 깔끔하게 백그라운드 만들어달라하고 거기에 맞추면 더 보기 좋을 것 같기도 하고...  
일단은 이대로 써보고 질리는 날이 오면 추가 커스텀 들어가야겠다.  
  
> #### 코드 확인   
---  
  
파이썬 코드는 위 내용이 전부기 때문에 theme.yaml만 업로드  
  
[Link to GitHub](https://raw.githubusercontent.com/movingwoo/movingwoo-snippets/refs/heads/main/one-pan/Python/2025-06-10-Hardware%20Monitor-theme.yaml)


from PIL import Image, ImageSequence
import os

# 실행 경로
folder = os.getcwd()
# 타겟 폴더
target_folder = os.path.join(folder, "target")
os.makedirs(target_folder, exist_ok=True)

# 폴더 내 파일들을 대상으로 변환
for filename in os.listdir(folder):
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

input("종료하려면 Enter 입력")
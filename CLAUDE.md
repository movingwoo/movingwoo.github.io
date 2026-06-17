# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트에서 작업할 때 참조하는 가이드입니다.

---

## 프로젝트 개요

**블로그명:** 뭐라도 하겠지  
**URL:** https://movingwoo.com  
**기술 스택:** Jekyll 4.3.2 + Minimal Mistakes 4.24.0 테마 (커스터마이징)  
**배포:** GitHub Actions → `gh-pages` 브랜치 → GitHub Pages (커스텀 도메인)  
**언어:** 한국어

---

## 개발 환경 명령어

```bash
# 로컬 개발 서버 실행
bundle exec jekyll serve

# 사이트 빌드
bundle exec jekyll build

# 의존성 설치
bundle install
```

---

## 프로젝트 구조

```
movingwoo.github.io/
├── _posts/              # 블로그 포스트 (카테고리별 하위 디렉토리)
│   ├── BOJ/             # 백준 알고리즘 풀이
│   ├── Development/     # 개발 프로젝트
│   ├── Server/          # 서버/인프라
│   └── Zone of Exile/   # 기타
├── _layouts/            # Jekyll 레이아웃 템플릿
├── _includes/           # 재사용 가능한 컴포넌트
├── _pages/              # 정적 페이지 (board.md 등)
├── _sass/               # SCSS 스타일시트 (커스텀 스킨: _redblack.scss)
├── assets/
│   ├── css/             # 컴파일된 CSS
│   ├── js/              # JavaScript (board.js, toc.js 등 커스텀 스크립트)
│   └── images/posts/    # 포스트별 이미지 (카테고리/날짜 구조)
├── _config.yml          # Jekyll 설정
├── Gemfile              # Ruby 의존성
└── .github/workflows/   # GitHub Actions 배포 설정
```

---

## 포스트 작성 규칙

### 파일명 형식
```
_posts/[카테고리]/[서브카테고리]/YYYY-MM-DD-제목.md
```
예시:
- `_posts/BOJ/C++/2025-12-01-BOJ-1234.md`
- `_posts/Server/Service/2026-06-18-Setting TailScale.md`
- `_posts/Development/JavaScript/2025-10-01-MyProject.md`

### Front Matter 형식
```yaml
---
title: "포스트 제목"
description: "SEO 메타 설명"
date: "YYYY-MM-DD HH:MM:SS +0900"
last_modified_at: "YYYY-MM-DD HH:MM:SS +0900"
categories:
  - Server/Service/
tags: [tag1, tag2, tag3]
author: movingwoo
---
```

- `categories`는 슬래시(`/`)로 계층 구조를 표현하며 끝에 `/`를 붙임
- `date`와 `last_modified_at`은 한국 시간(+0900) 사용

### 이미지 경로 규칙
포스트에 사용하는 이미지는 아래 경로에 저장:
```
assets/images/posts/[카테고리]/[서브카테고리]/[YYYY-MM-DD-제목]/이미지.webp
```
- 이미지 형식은 WebP 권장

---

## 커스텀 Include 컴포넌트

포스트 작성 시 사용 가능한 커스텀 태그:

```liquid
{% include colored_text.html color="red" text="강조할 텍스트" %}

{% include resized_img.html src="/assets/images/..." alt="설명" width="600" %}
```

---

## 카테고리 구조

| 카테고리 | 설명 |
|---|---|
| `BOJ/C++/`, `BOJ/Java/`, `BOJ/Python/` | 백준 알고리즘 풀이 |
| `Development/JavaScript/`, `Development/Python/`, etc. | 개발 프로젝트 |
| `Server/`, `Server/Service/` | 서버/인프라 설정 |
| `Zone of Exile/` | 기타 잡다한 내용 |

---

## 배포 흐름

1. `main` 브랜치에 push
2. GitHub Actions (`.github/workflows/jekyll.yml`) 자동 트리거
3. Jekyll 빌드 (Ruby 3.2.2)
4. `_site/` 내용을 `gh-pages` 브랜치에 배포
5. GitHub Pages에서 `movingwoo.com`으로 서빙

---

## 주의사항

- `_site/` 디렉토리는 빌드 산출물이므로 직접 수정하지 않음
- `.jekyll-cache/`는 캐시 디렉토리로 직접 수정 불필요
- `_config.yml` 변경 시 로컬 서버 재시작 필요
- 포스트 파일명에 한글 포함 가능하나 영문 권장 (URL 인코딩 문제 방지)
- 기존 포스트의 `permalink`나 파일명 변경 시 SEO에 영향을 주므로 주의

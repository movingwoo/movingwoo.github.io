# To-Do List

## Critical

## High

## Medium

- [ ] board.js - `.board-list`를 매번 querySelector로 재조회 (캐싱 없음)
  - 반복 렌더링 시 불필요한 DOM 탐색 (L34, 55, 159, 214)
- [ ] post_pagination.js - `window.postData` 존재 여부 확인 없이 사용
  - `post.categories[0]` 배열 길이 체크 없음 (L2, L94, L106)
- [ ] search.js - 입력 이벤트에 디바운스 없음
  - 타이핑할 때마다 검색 처리 실행 (L100~101, L118~119)
- [ ] board.js - `.replace()` 콜백을 순수 부수효과(mutation)용으로 오용
  - `.matchAll()` 또는 단순 반복문으로 교체 권장 (L178~200)
- [ ] toc.js - 스크롤 이벤트에서 `tocWrapper.style.top`을 항상 같은 값으로 세팅
  - 실질적으로 아무 동작도 안 함 (L251)

## Low - 로직 개선

- [ ] post_pagination.js - 이전/다음 버튼 아이콘에 `aria-label` 없음
  - 스크린 리더 접근성 미지원
- [ ] search.js - 검색어 필터링이 이모지/유니코드 조합 문자 처리 못 함 (L54)
- [ ] post_pagination.html - `site.posts` 전체를 인라인 JSON으로 직렬화
  - 포스트 수백 개 초과 시 HTML 크기 문제 (L15~26)
- [ ] toc.js / post_pagination.js - 폴더 열기/닫기 연속 클릭 시 비동기 애니메이션 경쟁 조건 발생 가능

## Low - 기능 추가 / 포스트 작성

- [ ] 메인화면 개편
- [ ] 조회수 기능 검토
- [ ] 포스트 최하단에 목록으로 돌아가기 버튼 추가
- [ ] 단축어 포스트 작성 시 Mermaid 다이어그램 활용
- [ ] 이미지 WebP 포맷 일괄 변환 스크립트 (Python)
- [ ] 포스트 작성 - tesseract(OCR) 활용해보기
- [ ] toc-hierarchy.html - 카테고리에 자식이 있어도 submenu(중첩 목록)가 항상 비어서 렌더링됨
  - 원인: `{% if other_depth == depth | plus: 1 %}` 조건이 필터(`| plus: 1`)를 제대로 평가하지 못해 항상 false로 판정 (빌드 결과 확인: 18개 전체 submenu가 빈 `<ul>`)
  - 해결: 단순 조건 수정으로는 부족함 - 현재 전체 카테고리를 평면 순회하면서 부모 submenu에도 중복 렌더링하는 구조라, 자식이 있는 카테고리는 평면 목록과 submenu에 중복 표시되는 문제도 있음. depth-0만 순회하고 `_includes/toc-node.html` 같은 재귀 include로 전체 트리를 다시 그리는 리팩토링 필요

document.addEventListener('DOMContentLoaded', function () {
  // masthead의 검색 요소
  const mastheadSearchInput = document.getElementById('search-input');
  const mastheadSearchButton = document.querySelector('.masthead .search-button');
  
  // board의 검색 요소
  const boardSearchInput = document.getElementById('board-search-input');
  const boardSearchButton = document.querySelector('.board-container .search-button');

  // 에러 메시지 표시 함수
  const showErrorMessage = (input, message) => {
    // 기존 에러 메시지 제거
    removeErrorMessage(input);
    
    // 새 에러 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'search-error';
    errorDiv.textContent = message;
    
    // 검색창 컨테이너 다음에 에러 메시지 삽입
    input.closest('.search-container').appendChild(errorDiv);
  };

  // 에러 메시지 제거 함수
  const removeErrorMessage = (input) => {
    const container = input.closest('.search-container');
    const errorDiv = container.querySelector('.search-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  };

  // 검색어 유효성 검사
  const validateSearchTerm = (term) => {
    // 공백 제거
    term = term.trim().replace(/\s+/g, ' ');
    
    // 길이 체크
    if (term.length < 2) {
      return {
        isValid: false,
        message: '2글자 이상 필요'
      };
    }
    
    if (term.length > 50) {
      return {
        isValid: false,
        message: '50글자 초과 불가'
      };
    }

    // 특수문자 체크 (한글, 영문, 숫자, 공백만 허용)
    const specialCharRegex = /[^가-힣a-zA-Z0-9\s]/g;
    if (specialCharRegex.test(term)) {
      return {
        isValid: false,
        message: '특수문자 불가'
      };
    }

    return {
      isValid: true,
      term: term
    };
  };

  // 검색 수행 함수
  const performSearch = (searchInput) => {
    const result = validateSearchTerm(searchInput.value);
    if (!result.isValid) {
      showErrorMessage(searchInput, result.message);
      return;
    }
    
    // 검색 실행 전 에러 메시지 제거
    removeErrorMessage(searchInput);
    
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '';
    const currentPath = path ? `path=${path}&` : '';
    const searchUrl = `/board?${currentPath}search=${encodeURIComponent(result.term)}`;
    
    window.location.href = searchUrl;
  };

  // masthead 검색 이벤트
  if (mastheadSearchInput && mastheadSearchButton) {
    mastheadSearchButton.addEventListener('click', () => {
      performSearch(mastheadSearchInput);
    });

    mastheadSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && document.activeElement === mastheadSearchInput) {
        performSearch(mastheadSearchInput);
      }
    });

    // 새로운 검색 시도 시 에러 메시지 제거
    mastheadSearchInput.addEventListener('input', () => {
      removeErrorMessage(mastheadSearchInput);
    });
  }

  // board 검색 이벤트
  if (boardSearchInput && boardSearchButton) {
    boardSearchButton.addEventListener('click', () => {
      performSearch(boardSearchInput);
    });

    boardSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && document.activeElement === boardSearchInput) {
        performSearch(boardSearchInput);
      }
    });

    // 새로운 검색 시도 시 에러 메시지 제거
    boardSearchInput.addEventListener('input', () => {
      removeErrorMessage(boardSearchInput);
    });
  }
}); 
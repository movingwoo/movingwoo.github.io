document.addEventListener('DOMContentLoaded', function () {
  // masthead의 검색 요소
  const mastheadSearchInput = document.getElementById('search-input');
  const mastheadSearchButton = document.querySelector('.masthead .search-button');
  
  // board의 검색 요소
  const boardSearchInput = document.getElementById('board-search-input');
  const boardSearchButton = document.querySelector('.board-container .search-button');

  // 검색 수행 함수
  const performSearch = (searchInput) => {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '';
    const currentPath = path ? `path=${path}&` : '';
    const searchUrl = `/board?${currentPath}search=${encodeURIComponent(searchTerm)}`;
    
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
  }
}); 
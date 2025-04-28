document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get('path') || '';
  const search = urlParams.get('search') || '';
  const currentPage = parseInt(urlParams.get('page')) || 1;
  const postsPerPage = 15;
  
  // 게시글 필터링 및 페이징
  const boardItems = document.querySelectorAll('.board-item:not(.no-data)');
  const filteredItems = Array.from(boardItems).filter(item => {
    const categories = item.getAttribute('data-categories');
    const title = item.querySelector('.board-title').textContent.toLowerCase();
    const searchTerm = search.toLowerCase();
    
    if (search) {
      return title.includes(searchTerm);
    }
    return path && categories === path;
  });

  // 하위 폴더 목록 생성 (검색 중이 아닐 때만)
  const subFolders = new Set();
  if (!search) {
    boardItems.forEach(item => {
      const categories = item.getAttribute('data-categories');
      const normalizedPath = path.replace(/\/$/, '');
      
      if (!path) {
        // path가 없을 때는 최상위 폴더만 추출
        const topLevelFolder = categories.split('/')[0];
        if (topLevelFolder) {
          subFolders.add(topLevelFolder);
        }
      } else if (categories.startsWith(normalizedPath + '/')) {
        // path가 있을 때는 하위 폴더 추출
        const remainingPath = categories.substring(normalizedPath ? normalizedPath.length + 1 : 0);
        const subFolder = remainingPath.split('/')[0];
        if (subFolder) {
          subFolders.add(subFolder);
        }
      }
    });
  }

  // 상위 폴더로 이동 항목 추가 (검색 중이 아닐 때만)
  if (path && !search) {
    const parentPath = path.replace(/\/$/, '').split('/').slice(0, -1).join('/');
    const parentItem = document.createElement('div');
    parentItem.className = 'board-item';
    parentItem.setAttribute('data-categories', parentPath);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'board-content';
    
    const parentLink = document.createElement('a');
    parentLink.href = `?path=${parentPath ? parentPath + '/' : ''}`;
    parentLink.className = 'board-title';
    
    const upIcon = document.createElement('i');
    upIcon.className = 'fas fa-folder';
    
    const linkText = document.createTextNode(' ..');
    
    parentLink.appendChild(upIcon);
    parentLink.appendChild(linkText);
    contentDiv.appendChild(parentLink);
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'board-date';
    contentDiv.appendChild(dateSpan);
    
    parentItem.appendChild(contentDiv);
    document.querySelector('.board-list').insertBefore(parentItem, boardItems[0]);
  }

  // 하위 폴더 항목 추가 (검색 중이 아닐 때만)
  if (!search) {
    subFolders.forEach(folder => {
      const folderPath = path ? path.replace(/\/$/, '') + '/' + folder : folder;
      const folderItem = document.createElement('div');
      folderItem.className = 'board-item';
      folderItem.setAttribute('data-categories', folderPath);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'board-content';
      
      const folderLink = document.createElement('a');
      folderLink.href = `?path=${folderPath}/`;
      folderLink.className = 'board-title';
      
      const folderIcon = document.createElement('i');
      folderIcon.className = 'fas fa-folder';
      
      const linkText = document.createTextNode(` ${folder}`);
      
      folderLink.appendChild(folderIcon);
      folderLink.appendChild(linkText);
      contentDiv.appendChild(folderLink);
      
      const dateSpan = document.createElement('span');
      dateSpan.className = 'board-date';
      contentDiv.appendChild(dateSpan);
      
      folderItem.appendChild(contentDiv);
      document.querySelector('.board-list').insertBefore(folderItem, boardItems[0]);
    });
  }

  // 검색어 하이라이팅
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredItems.forEach(item => {
      const titleElement = item.querySelector('.board-title');
      const icon = titleElement.querySelector('i');
      const originalText = titleElement.textContent.replace(icon.textContent, '').trim();
      
      // 기존 내용 비우기
      titleElement.textContent = '';
      
      // 아이콘 다시 추가
      titleElement.appendChild(icon);
      
      // 검색어가 포함된 부분을 찾아 하이라이팅
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      let lastIndex = 0;
      
      originalText.replace(regex, (match, p1, offset) => {
        // 검색어 앞의 텍스트 추가
        if (offset > lastIndex) {
          const textNode = document.createTextNode(originalText.substring(lastIndex, offset));
          titleElement.appendChild(textNode);
        }
        
        // 하이라이팅된 검색어 추가
        const mark = document.createElement('mark');
        mark.textContent = match;
        titleElement.appendChild(mark);
        
        lastIndex = offset + match.length;
      });
      
      // 마지막 텍스트 추가
      if (lastIndex < originalText.length) {
        const textNode = document.createTextNode(originalText.substring(lastIndex));
        titleElement.appendChild(textNode);
      }
    });
  }

  const totalPages = Math.ceil(filteredItems.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  // No Data 메시지 처리
  const noDataItem = document.querySelector('.board-item.no-data');
  if (noDataItem) {
    noDataItem.style.display = filteredItems.length === 0 ? 'block' : 'none';
  } else if (filteredItems.length === 0) {
    // No Data 메시지가 없고 필터링된 항목이 없을 때 메시지 생성
    const boardList = document.querySelector('.board-list');
    const noDataDiv = document.createElement('div');
    noDataDiv.className = 'board-item no-data';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'board-content';
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'board-title';
    titleSpan.textContent = 'No Data';
    
    contentDiv.appendChild(titleSpan);
    noDataDiv.appendChild(contentDiv);
    boardList.appendChild(noDataDiv);
  }

  // 필터링된 항목 표시
  filteredItems.slice(startIndex, endIndex).forEach(item => {
    item.style.display = 'block';
  });

  // 페이징 UI 생성
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  // 이전 페이지 버튼
  if (currentPage > 1) {
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item';
    const prevLink = document.createElement('a');
    prevLink.href = `?path=${path}&search=${search}&page=${currentPage - 1}`;
    prevLink.textContent = '이전';
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);
  }

  // 페이지 번호
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item';
    const link = document.createElement('a');
    link.href = `?path=${path}&search=${search}&page=${i}`;
    link.textContent = i;
    if (i === currentPage) {
      link.classList.add('active');
    }
    li.appendChild(link);
    pagination.appendChild(li);
  }

  // 다음 페이지 버튼
  if (currentPage < totalPages) {
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item';
    const nextLink = document.createElement('a');
    nextLink.href = `?path=${path}&search=${search}&page=${currentPage + 1}`;
    nextLink.textContent = '다음';
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
  }
});

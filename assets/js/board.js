document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get('path') || '';
  const currentPage = parseInt(urlParams.get('page')) || 1;
  const postsPerPage = 15;
  
  // 게시글 필터링 및 페이징
  const boardItems = document.querySelectorAll('.board-item:not(.no-data)');
  const filteredItems = Array.from(boardItems).filter(item => {
    const categories = item.getAttribute('data-categories');
    return path && categories === path;
  });

  // 하위 폴더 목록 생성
  const subFolders = new Set();
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

  // 상위 폴더로 이동 항목 추가
  if (path) {
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

  // 하위 폴더 항목 추가
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
    prevLink.href = `?path=${path}&page=${currentPage - 1}`;
    prevLink.textContent = '이전';
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);
  }

  // 페이지 번호
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item';
    const link = document.createElement('a');
    link.href = `?path=${path}&page=${i}`;
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
    nextLink.href = `?path=${path}&page=${currentPage + 1}`;
    nextLink.textContent = '다음';
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
  }
});

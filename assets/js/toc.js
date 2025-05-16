(function() {
  // Constants for animation and storage
  const ANIMATION_DURATION = 300;
  const ANIMATION_DELAY = 20;
  const STORAGE_KEY = 'toc_states';

  // 현재 열린 depth-0 폴더의 경로를 저장
  let currentOpenRootPath = null;

  /**
   * 세션 스토리지 관련 함수
   */
  function saveTocStates() {
    // 열린 depth-0 폴더가 없으면 스토리지를 비움
    if (!currentOpenRootPath) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    // 현재 열린 depth-0 폴더의 경로만 저장
    sessionStorage.setItem(STORAGE_KEY, currentOpenRootPath);
  }

  function restoreTocStates() {
    const savedPath = sessionStorage.getItem(STORAGE_KEY);
    
    if (!savedPath) {
      // 세션스토리지가 비어있으면 기본 설정 카테고리 열기
      const defaultPath = 'one-pan/'; 
      currentOpenRootPath = defaultPath;
      openFolder(defaultPath);
      updateAllPostCounts(defaultPath);
      return;
    }
    // 저장된 경로의 폴더와 하위 항목들을 열고 상태 복원
    currentOpenRootPath = savedPath;
    openFolder(savedPath);
    updateAllPostCounts(savedPath);
  }

  /**
   * 폴더 상태 관리 함수
   */
  function setFolderState(item, isOpen) {
    const isRootItem = item.classList.contains('depth-0');
    
    if (isOpen) {
      // 열린 상태로 설정
      item.classList.remove('collapsed');
      if (!isRootItem) {
        item.classList.remove('anim-hide');
      }
      toggleFolderIcon(item, false);
    } else {
      // 닫힌 상태로 설정
      item.classList.add('collapsed');
      if (!isRootItem) {
        item.classList.add('anim-hide');
      }
      toggleFolderIcon(item, true);
    }
  }

  // 폴더 아이콘 토글 (열림/닫힘)
  function toggleFolderIcon(element, isCollapsed) {
    const icon = element.querySelector('.folder-toggle i');
    if (icon) {
      icon.classList.remove('fa-folder', 'fa-folder-open');
      icon.classList.add(isCollapsed ? 'fa-folder' : 'fa-folder-open');
    }
  }

  // 요소 애니메이션 처리
  function animateElement(element, show, delay = 0) {
    if (show) {
      setTimeout(() => {
        element.classList.remove('anim-hide');
      }, delay);
    } else {
      element.classList.add('anim-hide');
    }
  }

  /**
   * 폴더 열기/닫기 함수
   */
  function openFolder(path) {
    const allItems = document.querySelectorAll('.toc__item');
    let delay = 0;
    
    // path로 시작하는 모든 항목을 열린 상태로 설정
    allItems.forEach(item => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath.startsWith(path)) {
        setFolderState(item, true);
        
        // 하위 항목들은 애니메이션 적용
        if (itemPath !== path) {
          const postsList = item.querySelector('.posts-list');
          if (postsList) {
            animateElement(postsList, true, delay);
          }
          delay += ANIMATION_DELAY;
        }
      }
    });
  }

  function closeFolder(path) {
    const allItems = document.querySelectorAll('.toc__item');
    let delay = 0;
    
    // path로 시작하는 모든 항목을 닫힌 상태로 설정
    allItems.forEach(item => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath.startsWith(path)) {
        if (itemPath !== path) {
          setFolderState(item, false);
          const postsList = item.querySelector('.posts-list');
          if (postsList) {
            animateElement(postsList, false, delay);
          }
          delay += ANIMATION_DELAY;
        } else {
          setFolderState(item, false);
        }
      }
    });
  }

  /**
   * 포스트 수 관리 함수
   */
  function updatePostCount(tocItem, isCollapsed) {
    let postCount = tocItem.querySelector('.post-count');
    if (!postCount) {
      postCount = document.createElement('span');
      postCount.className = 'post-count';
      tocItem.querySelector('.toc__menu-title').appendChild(postCount);
    }

    const path = tocItem.getAttribute('data-path');
    const isRootItem = tocItem.classList.contains('depth-0');
    const currentPosts = parseInt(tocItem.getAttribute('data-total-posts') || '0');
    let totalPosts = currentPosts;

    // depth-0이고 닫힌 상태일 때는 하위 포스트 수를 합산
    if (isRootItem && isCollapsed) {
      const allItems = document.querySelectorAll('.toc__item');
      allItems.forEach(item => {
        const itemPath = item.getAttribute('data-path');
        if (itemPath && itemPath.startsWith(path) && itemPath !== path) {
          const subPosts = parseInt(item.getAttribute('data-total-posts') || '0');
          totalPosts += subPosts;
        }
      });
    }

    // 포스트 수에 따라 배지 표시/숨김
    if (totalPosts > 0) {
      postCount.textContent = totalPosts;
      postCount.style.display = 'inline-flex';
    } else {
      postCount.style.display = 'none';
    }
  }

  function updateAllPostCounts(openedPath = null) {
    const allItems = document.querySelectorAll('.toc__item');
    allItems.forEach(item => {
      const itemPath = item.getAttribute('data-path');
      const isCollapsed = item.classList.contains('collapsed');
      
      // depth-0 폴더가 열려있을 때는 모든 하위 폴더도 자신의 포스트 수를 표시
      const shouldShowCount = !openedPath || 
                            itemPath === openedPath || 
                            (openedPath && itemPath.startsWith(openedPath));
      
      if (shouldShowCount) {
        updatePostCount(item, isCollapsed);
      }
    });
  }

  /**
   * 이벤트 초기화 함수
   */
  function initFolderToggle() {
    const folderToggles = document.querySelectorAll('.toc__menu-title');
    
    folderToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        const tocItem = this.closest('.toc__item');
        const path = tocItem.getAttribute('data-path');
        const isRootItem = path.split('/').length === 2;
        
        if (isRootItem) {
          let isOpen = !tocItem.classList.contains('collapsed');
          
          if (isOpen) {
            // 열린 상태에서 클릭: 현재 폴더를 닫음
            currentOpenRootPath = null;
            closeFolder(path);
            updateAllPostCounts();
          } else {
            // 닫힌 상태에서 클릭: 다른 열린 폴더가 있으면 닫고, 현재 폴더를 엶
            if (currentOpenRootPath) {
              closeFolder(currentOpenRootPath);
            }
            currentOpenRootPath = path;
            openFolder(path);
            updateAllPostCounts(path);
          }
          
          saveTocStates();
        } else {
          // depth-1 이상의 폴더는 해당 경로로 이동
          e.preventDefault();
          window.location.href = `/board?path=${encodeURIComponent(path)}`;
        }
      });
    });
  }

  function initializeAllItems() {
    // 모든 항목을 닫힌 상태로 초기화
    document.querySelectorAll('.toc__item').forEach(item => {
      setFolderState(item, false);
    });
    updateAllPostCounts();
  }

  /**
   * 초기화 및 이벤트 설정
   */
  const initialize = () => {
    initFolderToggle();
    initializeAllItems();
    restoreTocStates();

    // 스크롤 이벤트에 따른 TOC 위치 조정
    let lastScrollTop = 0;
    const tocWrapper = document.querySelector('.toc-wrapper');
    const initialTop = 32;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      tocWrapper.style.top = `${currentScroll > lastScrollTop ? initialTop : initialTop}px`;
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
  };

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(); 
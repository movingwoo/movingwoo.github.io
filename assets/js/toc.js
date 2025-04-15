(function() {
  // Constants
  const ANIMATION_DURATION = 300;
  const ANIMATION_DELAY = 20;
  const STORAGE_KEY = 'toc_states';

  // 현재 열린 최상위 폴더 경로를 저장
  let currentOpenRootPath = null;

  // 세션 스토리지 관련 함수들
  function saveTocStates() {
    if (!currentOpenRootPath) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, currentOpenRootPath);
  }

  function restoreTocStates() {
    const savedPath = sessionStorage.getItem(STORAGE_KEY);
    if (!savedPath) return;

    currentOpenRootPath = savedPath;
    openFolder(savedPath);
    updateAllPostCounts(savedPath);
  }

  // 폴더 상태 관리 함수들
  function setFolderState(item, isOpen) {
    const isRootItem = item.classList.contains('depth-0');
    
    if (isOpen) {
      item.classList.remove('collapsed');
      if (!isRootItem) {
        item.classList.remove('anim-hide');
      }
      toggleFolderIcon(item, false);
    } else {
      item.classList.add('collapsed');
      if (!isRootItem) {
        item.classList.add('anim-hide');
      }
      toggleFolderIcon(item, true);
    }
  }

  function toggleFolderIcon(element, isCollapsed) {
    const icon = element.querySelector('.folder-toggle i');
    if (icon) {
      icon.classList.remove('fa-folder', 'fa-folder-open');
      icon.classList.add(isCollapsed ? 'fa-folder' : 'fa-folder-open');
    }
  }

  function animateElement(element, show, delay = 0) {
    if (show) {
      setTimeout(() => {
        element.classList.remove('anim-hide');
      }, delay);
    } else {
      element.classList.add('anim-hide');
    }
  }

  function openFolder(path) {
    const allItems = document.querySelectorAll('.toc__item');
    let delay = 0;
    
    allItems.forEach(item => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath.startsWith(path)) {
        setFolderState(item, true);
        
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
      const shouldShowCount = !openedPath || 
                            itemPath === openedPath || 
                            (openedPath && itemPath.startsWith(openedPath));
      
      if (shouldShowCount) {
        updatePostCount(item, isCollapsed);
      }
    });
  }

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
            currentOpenRootPath = null;
            closeFolder(path);
            updateAllPostCounts();
          } else {
            if (currentOpenRootPath) {
              closeFolder(currentOpenRootPath);
            }
            currentOpenRootPath = path;
            openFolder(path);
            updateAllPostCounts(path);
          }
          
          saveTocStates();
        } else {
          e.preventDefault();
          window.location.href = `/board?path=${path}`;
        }
      });
    });
  }

  function initializeAllItems() {
    document.querySelectorAll('.toc__item').forEach(item => {
      setFolderState(item, false);
    });
    updateAllPostCounts();
  }

  // 초기화
  const initialize = () => {
    initFolderToggle();
    initializeAllItems();
    restoreTocStates();

    // 스크롤 이벤트 처리
    let lastScrollTop = 0;
    const tocWrapper = document.querySelector('.toc-wrapper');
    const initialTop = 32;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      tocWrapper.style.top = `${currentScroll > lastScrollTop ? initialTop : initialTop}px`;
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(); 
(function() {
  function initFolderToggle() {
    const folderToggles = document.querySelectorAll('.toc__menu-title');
    
    folderToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        const tocItem = this.closest('.toc__item');
        const icon = this.querySelector('.folder-toggle i');
        const path = tocItem.getAttribute('data-path');

        const isCollapsed = tocItem.classList.toggle('collapsed');
        
        icon.classList.remove('fa-folder', 'fa-folder-open');
        icon.classList.add(isCollapsed ? 'fa-folder' : 'fa-folder-open');

        toggleDescendantsDisplay(path, !isCollapsed);
        toggleCurrentPostsDisplay(tocItem, !isCollapsed);
        updatePostCount(tocItem, isCollapsed);
      });
    });
  }

  function toggleDescendantsDisplay(path, show) {
    const allItems = document.querySelectorAll('.toc__item');
    
    allItems.forEach(item => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath.startsWith(path) && itemPath !== path) {
        item.style.display = show ? 'block' : 'none';
      }
    });
  }

  function toggleCurrentPostsDisplay(tocItem, show) {
    const postsList = tocItem.querySelector('.posts-list');
    if (postsList) {
      postsList.style.display = show ? 'block' : 'none';
    }
  }

  function updatePostCount(tocItem, isCollapsed) {
    let postCount = tocItem.querySelector('.post-count');

    // 없으면 생성
    if (!postCount) {
      postCount = document.createElement('span');
      postCount.className = 'post-count';
      postCount.textContent = '0';
      tocItem.querySelector('.toc__menu-title').appendChild(postCount);
    }

    const path = tocItem.getAttribute('data-path');
    const allItems = document.querySelectorAll('.toc__item');
    let totalPosts = 0;

    // 직접 포스트 수
    const postsList = tocItem.querySelector('.posts-list');
    if (postsList) {
      totalPosts += postsList.querySelectorAll('li:not(.more-posts)').length;
    }

    if (isCollapsed) {
      // 하위까지 합산
      allItems.forEach(item => {
        const itemPath = item.getAttribute('data-path');
        if (itemPath && itemPath.startsWith(path) && itemPath !== path) {
          const subPostsList = item.querySelector('.posts-list');
          if (subPostsList) {
            totalPosts += subPostsList.querySelectorAll('li:not(.more-posts)').length;
          }
        }
      });
    }

    postCount.textContent = totalPosts;
    postCount.style.display = totalPosts > 0 ? 'inline-block' : 'none';
  }

  // DOM이 로드되면 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFolderToggle);
  } else {
    initFolderToggle();
  }
})(); 
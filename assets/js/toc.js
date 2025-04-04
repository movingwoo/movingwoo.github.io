(function() {
  // Constants
  const ANIMATION_DURATION = 300;
  const ANIMATION_DELAY = 20;
  const INITIAL_DELAY = 50;

  // Utility Functions
  function getPostsInCategory(categoryPath) {
    return Array.from(document.querySelectorAll('.toc__item')).filter(item => {
      const itemPath = item.getAttribute('data-path');
      return itemPath === categoryPath;
    }).map(item => {
      const postsList = item.querySelector('.posts-list');
      return postsList ? Array.from(postsList.querySelectorAll('li:not(.more-posts)')) : [];
    }).flat();
  }

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

        // 하위 폴더들의 아이콘도 함께 변경
        const allItems = document.querySelectorAll('.toc__item');
        allItems.forEach(item => {
          const itemPath = item.getAttribute('data-path');
          if (itemPath.startsWith(path) && itemPath !== path) {
            const subIcon = item.querySelector('.folder-toggle i');
            if (subIcon) {
              subIcon.classList.remove('fa-folder', 'fa-folder-open');
              subIcon.classList.add(isCollapsed ? 'fa-folder' : 'fa-folder-open');
            }
          }
        });

        toggleDescendantsDisplay(path, !isCollapsed);
        toggleCurrentPostsDisplay(tocItem, !isCollapsed);
        updatePostCount(tocItem, isCollapsed);
      });
    });
  }

  // 공통 애니메이션 함수
  function animateElement(element, show, delay = 0) {
    if (show) {
      element.style.display = 'block';
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    } else {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        element.style.display = 'none';
      }, ANIMATION_DURATION + delay);
    }
  }

  function toggleDescendantsDisplay(path, show) {
    const allItems = document.querySelectorAll('.toc__item');
    
    allItems.forEach((item, index) => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath.startsWith(path) && itemPath !== path) {
        const isSubCollapsed = item.classList.contains('collapsed');
        const postsList = item.querySelector('.posts-list');
        const isPostsVisible = postsList && postsList.style.display !== 'none';
        
        if (show) {
          item.classList.add('anim-pre-show');
          item.style.display = 'block';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.classList.remove('anim-pre-show');
              item.classList.add('anim-show');
              if (isSubCollapsed) {
                item.classList.add('collapsed');
                const subIcon = item.querySelector('.folder-toggle i');
                if (subIcon) {
                  subIcon.classList.remove('fa-folder-open');
                  subIcon.classList.add('fa-folder');
                }
                if (postsList) {
                  postsList.style.display = isPostsVisible ? 'block' : 'none';
                  postsList.style.opacity = isPostsVisible ? '1' : '0';
                  postsList.style.transform = isPostsVisible ? 'translateY(0)' : 'translateY(-10px)';
                }
              }
            });
          });
        } else {
          item.classList.remove('anim-show');
          item.classList.add('anim-hide');
          setTimeout(() => {
            item.style.display = 'none';
          }, ANIMATION_DURATION + index * ANIMATION_DELAY);
        }
  
        if (postsList) {
          const postCount = item.querySelector('.post-count');
          if (postCount) {
            postCount.classList.remove('anim-hide');
            postCount.classList.add('anim-show');
          }
          animateElement(postsList, show && !isSubCollapsed, index * ANIMATION_DELAY);
        }
      }
    });
  }
  

  function toggleCurrentPostsDisplay(tocItem, show) {
    const postsList = tocItem.querySelector('.posts-list');
    if (postsList) {
      animateElement(postsList, show, INITIAL_DELAY);
    }
  }

  function updatePostCount(tocItem, isCollapsed) {
    let postCount = tocItem.querySelector('.post-count');
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
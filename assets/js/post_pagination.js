document.addEventListener('DOMContentLoaded', function() {
  const { currentPost, allPosts } = window.postData;

  function createPostElement(post, type, icon) {
    // disabled 타입일 때는 완전히 다른 방식으로 처리
    if (type === 'disabled') {
      const element = document.createElement('span');
      element.className = 'post-navigation__item post-navigation__disabled';
      const iconElement = document.createElement('i');
      iconElement.className = `fas fa-${icon}`;
      element.appendChild(iconElement);
      return element;
    }

    const element = document.createElement(type === 'link' ? 'a' : 'span');
    element.className = 'post-navigation__item' + (type === 'current' ? ' post-navigation__current' : '');
    
    // post 객체와 url이 존재할 때만 href 설정
    if (type === 'link' && post && post.url) {
      element.href = post.url;
    }

    const iconElement = document.createElement('i');
    iconElement.className = `fas fa-${icon}`;
    element.appendChild(iconElement);

    if (post && post.title) {
      element.appendChild(document.createTextNode(post.title));
    }

    return element;
  }

  function findAdjacentPosts() {
    // 필수 데이터가 없는 경우 빈 배열 반환
    if (!currentPost || !allPosts || !Array.isArray(allPosts)) {
      return { next: [], previous: [] };
    }

    // 카테고리가 없는 경우 null 처리
    const currentCategory = currentPost.categories && currentPost.categories.length > 0 
      ? currentPost.categories[0] 
      : null;
    const currentIndex = allPosts.findIndex(post => post && post.url === currentPost.url);
    
    //현재 포스트를 찾지 못한 경우 빈 배열 반환
    if (currentIndex === -1) {
      return { next: [], previous: [] };
    }

    let nextPosts = [];
    let prevPosts = [];
    
    let nextIndex = currentIndex - 1;
    let nextCount = 0;
    while (nextIndex >= 0 && nextCount < 2) {
      const post = allPosts[nextIndex];

      // 포스트와 카테고리가 존재하는지 확인
      if (post && post.categories && post.categories[0] === currentCategory) {
        nextPosts.push(post);
        nextCount++;
      }
      nextIndex--;
    }

    let prevIndex = currentIndex + 1;
    let prevCount = 0;
    while (prevIndex < allPosts.length && prevCount < 2) {
      const post = allPosts[prevIndex];

      // 포스트와 카테고리가 존재하는지 확인
      if (post && post.categories && post.categories[0] === currentCategory) {
        prevPosts.push(post);
        prevCount++;
      }
      prevIndex++;
    }

    return {
      next: nextPosts,
      previous: prevPosts
    };
  }

  function generateNavigation() {
    const adjacentPosts = findAdjacentPosts();
    const container = document.getElementById('postNavigation');
    container.innerHTML = ''; // 기존 내용 제거

    if (adjacentPosts.next.length === 0 && adjacentPosts.previous.length === 0) {
      // 포스트가 하나만 있는 경우
      container.appendChild(createPostElement(null, 'disabled', 'minus'));
      container.appendChild(createPostElement(currentPost, 'current', 'play'));
      container.appendChild(createPostElement(null, 'disabled', 'minus'));
    } else if (adjacentPosts.next.length === 0) {
      // 최신 포스트인 경우
      container.appendChild(createPostElement(null, 'disabled', 'minus'));
      container.appendChild(createPostElement(currentPost, 'current', 'play'));
      adjacentPosts.previous.forEach((post, index) => {
        container.appendChild(createPostElement(post, 'link', index === 0 ? 'angle-down' : 'angle-double-down'));
      });
    } else if (adjacentPosts.previous.length === 0) {
      // 가장 오래된 포스트인 경우
      adjacentPosts.next.reverse().forEach((post, index, array) => {
        container.appendChild(createPostElement(post, 'link', index === array.length - 1 ? 'angle-up' : 'angle-double-up'));
      });
      container.appendChild(createPostElement(currentPost, 'current', 'play'));
      container.appendChild(createPostElement(null, 'disabled', 'minus'));
    } else {
      // 중간 포스트인 경우
      adjacentPosts.next.reverse().forEach((post, index, array) => {
        container.appendChild(createPostElement(post, 'link', index === array.length - 1 ? 'angle-up' : 'angle-double-up'));
      });
      container.appendChild(createPostElement(currentPost, 'current', 'play'));
      adjacentPosts.previous.forEach((post, index) => {
        container.appendChild(createPostElement(post, 'link', index === 0 ? 'angle-down' : 'angle-double-down'));
      });
    }
  }

  generateNavigation();
});

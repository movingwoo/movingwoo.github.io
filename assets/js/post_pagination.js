document.addEventListener('DOMContentLoaded', function() {
  const { currentPost, allPosts } = window.postData;

  function createPostElement(post, type, icon) {
    const element = document.createElement(type === 'link' ? 'a' : 'span');
    element.className = 'post-navigation__item' + (type === 'current' ? ' post-navigation__current' : type === 'disabled' ? ' post-navigation__disabled' : '');
    
    if (type === 'link') {
      element.href = post.url;
    }

    const iconElement = document.createElement('i');
    iconElement.className = `fas fa-${icon}`;
    element.appendChild(iconElement);

    if (type === 'disabled') {
      element.appendChild(document.createTextNode(''));
    } else {
      element.appendChild(document.createTextNode(post.title));
    }

    return element;
  }

  function findAdjacentPosts() {
    const currentCategory = currentPost.categories[0];
    const currentIndex = allPosts.findIndex(post => post.url === currentPost.url);
    
    let nextPosts = [];
    let prevPosts = [];
    
    let nextIndex = currentIndex - 1;
    let nextCount = 0;
    while (nextIndex >= 0 && nextCount < 2) {
      if (allPosts[nextIndex].categories[0] === currentCategory) {
        nextPosts.push(allPosts[nextIndex]);
        nextCount++;
      }
      nextIndex--;
    }

    let prevIndex = currentIndex + 1;
    let prevCount = 0;
    while (prevIndex < allPosts.length && prevCount < 2) {
      if (allPosts[prevIndex].categories[0] === currentCategory) {
        prevPosts.push(allPosts[prevIndex]);
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
      container.appendChild(createPostElement({}, 'disabled', 'minus'));
      container.appendChild(createPostElement(currentPost, 'current', 'play'));
      container.appendChild(createPostElement({}, 'disabled', 'minus'));
    } else if (adjacentPosts.next.length === 0) {
      // 최신 포스트인 경우
      container.appendChild(createPostElement({}, 'disabled', 'minus'));
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
      container.appendChild(createPostElement({}, 'disabled', 'minus'));
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

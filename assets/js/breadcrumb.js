document.addEventListener('DOMContentLoaded', function () {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    // 1. Board 페이지 방식 (URL 파라미터)
    const urlParams = new URLSearchParams(window.location.search);
    const paramPath = urlParams.get('path');
    const search = urlParams.get('search');

    // 2. 포스트 페이지 방식 (URL 경로)
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment && segment !== 'board');
    
    // Archive 링크는 항상 추가
    const archiveLink = document.createElement('a');
    archiveLink.href = '/board?path=';  // board로 이동
    archiveLink.className = 'current-path';
    archiveLink.textContent = 'Archive';
    breadcrumb.appendChild(archiveLink);

    // 구분자 추가
    const addSeparator = () => {
        const sep = document.createElement('span');
        sep.className = 'separator';
        sep.textContent = '/';
        breadcrumb.appendChild(sep);
    };

    if (search) {
        // 검색 결과 표시
        addSeparator();
        const searchLink = document.createElement('a');
        searchLink.href = '#';
        searchLink.className = 'current-path current';
        searchLink.textContent = `Search Results > "${search}"`;
        breadcrumb.appendChild(searchLink);
    } else if (paramPath) {
        // Board 페이지 breadcrumb 처리
        if (paramPath !== 'archive') {
            addSeparator();
            const categories = paramPath.split('/').filter(Boolean);
            let currentPath = '';
            
            categories.forEach((cat, index) => {
                if (index > 0) addSeparator();
                
                currentPath += (index > 0 ? '/' : '') + cat;
                const link = document.createElement('a');
                link.href = `?path=${currentPath}`;
                link.className = 'current-path';
                link.textContent = cat;
                breadcrumb.appendChild(link);
            });
        }
    } else if (pathSegments.length > 0) {
        // 포스트 페이지 breadcrumb 처리
        let currentPath = '';
        
        pathSegments.forEach((segment, index) => {
            if (index > 0) addSeparator();
            
            currentPath += '/' + segment;
            const link = document.createElement('a');
            
            // 마지막 세그먼트(포스트 제목)는 현재 페이지
            if (index === pathSegments.length - 1) {
                link.className = 'current-path current';
                link.href = '#';
            } else {
                // 카테고리는 board의 해당 경로로 이동
                link.href = `/board?path=${pathSegments.slice(0, index + 1).join('/')}`;
                link.className = 'current-path';
            }
            
            link.textContent = segment;
            breadcrumb.appendChild(link);
        });
    }
});
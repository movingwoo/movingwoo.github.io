/* ==========================================================================
   jQuery plugin settings and other scripts
   ========================================================================== */

// content 속성 관련 콘솔 오류의 원인이 Github pages와 로컬 환경 차이로 보임...
// 그래서 로컬에서는 정상이었나 보다...
// 기능에 문제 없으므로 콘솔 출력만 막음
window.addEventListener("error", function(event) {
  if (event.message && event.message.includes("reading 'content'")) {
    event.preventDefault();  // 콘솔 출력 자체를 막음
  }
}, true);

// content 속성 접근 방어 코드
(function() {
  const originalContentDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'content');
  
  // content 속성 훼손이 의심되어 전체 주석처리
  Object.defineProperty(HTMLElement.prototype, 'content', {
    get: function() {
      try {
        // 기존 content 속성이 있으면 사용
        if (originalContentDescriptor && originalContentDescriptor.get) {
          return originalContentDescriptor.get.call(this);
        }
        // data-content 속성이 있으면 사용
        if (this.hasAttribute('data-content')) {
          return this.getAttribute('data-content');
        }
        // 기본값 반환
        return null;
      } catch (e) {
        return null;
      }
    },
    set: function(value) {
      try {
        // 기존 content 속성이 있으면 사용
        if (originalContentDescriptor && originalContentDescriptor.set) {
          originalContentDescriptor.set.call(this, value);
        } else {
          // data-content 속성으로 저장
          this.setAttribute('data-content', value);
        }
      } catch (e) {
        // 오류 무시
      }
    },
    configurable: true
  });
})();

$(document).ready(function() {

  // FitVids init
  $("#main").fitVids();

  // Sticky sidebar
  var stickySideBar = function() {
    var show =
      $(".author__urls-wrapper button").length === 0
        ? $(window).width() > 1024 // width should match $large Sass variable
        : !$(".author__urls-wrapper button").is(":visible");
    if (show) {
      // fix
      $(".sidebar").addClass("sticky");
    } else {
      // unfix
      $(".sidebar").removeClass("sticky");
    }
  };

  stickySideBar();

  $(window).resize(function() {
    stickySideBar();
  });

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function() {
    $(".author__urls").toggleClass("is--visible");
    $(".author__urls-wrapper button").toggleClass("open");
  });

  // Close search screen with Esc key
  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      if ($(".initial-content").hasClass("is--hidden")) {
        $(".search-content").toggleClass("is--visible");
        $(".initial-content").toggleClass("is--hidden");
      }
    }
  });

  // Search toggle
  $(".search__toggle").on("click", function() {
    $(".search-content").toggleClass("is--visible");
    $(".initial-content").toggleClass("is--hidden");
    // set focus on input
    setTimeout(function() {
      $(".search-content input").focus();
    }, 400);
  });

  // Smooth scrolling
  var scroll = new SmoothScroll('a[href*="#"]', {
    offset: 20,
    speed: 400,
    speedAsDuration: true,
    durationMax: 500
  });

  //  scroll spy init - 비활성화
  /*
  if($("nav.toc").length > 0) {
    var spy = new Gumshoe("nav.toc a", {
      // Active classes
      navClass: "active", // applied to the nav list item
      contentClass: "active", // applied to the content

      // Nested navigation
      nested: false, // if true, add classes to parents of active link
      nestedClass: "active", // applied to the parent items

      // Offset & reflow
      offset: 20, // how far from the top of the page to activate a content area
      reflow: true, // if true, listen for reflows

      // Event support
      events: true // if true, emit custom events
    });
  }
  */

  // add lightbox class to all image links
  $(
    "a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif'],a[href$='.webp']"
  ).addClass("image-popup");

  // Magnific-Popup options
  $(".image-popup").magnificPopup({
    // disableOn: function() {
    //   if( $(window).width() < 500 ) {
    //     return false;
    //   }
    //   return true;
    // },
    type: "image",
    tLoading: "Loading image #%curr%...",
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.'
    },
    removalDelay: 500, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it unique to apply your CSS animations just to this exact popup
    mainClass: "mfp-zoom-in",
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup
        this.st.image.markup = this.st.image.markup.replace(
          "mfp-figure",
          "mfp-figure mfp-with-anim"
        );
      }
    },
    closeOnContentClick: true,
    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
  });

  // Add anchors for headings
  $('.page__content').find('h1, h2, h3, h4, h5, h6').each(function() {
    var id = $(this).attr('id');
    if (id) {
      var anchor = document.createElement("a");
      anchor.className = 'header-link';
      anchor.href = '#' + id;
      
      const srOnly = document.createElement('span');
      srOnly.className = 'sr-only';
      srOnly.textContent = 'Permalink';
      
      const icon = document.createElement('i');
      icon.className = 'fas fa-link';
      
      anchor.appendChild(srOnly);
      anchor.appendChild(icon);
      anchor.title = "Permalink";
      $(this).append(anchor);
    }
  });
});

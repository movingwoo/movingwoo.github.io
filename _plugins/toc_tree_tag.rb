require "cgi"

module Jekyll
  # 카테고리 트리를 재귀적으로 렌더링하는 커스텀 태그.
  #
  # _includes/toc-hierarchy.html에서 이 작업을 평면 순회 + Liquid 재귀 include로
  # 시도했으나, 같은 include 파일을 재귀적으로 호출하면 Jekyll의 Liquid 파서가
  # 재진입 상황을 제대로 처리하지 못해 멀쩡한 다른 파일에서 가짜 syntax error가
  # 발생함 (Jekyll/Liquid의 알려진 한계). Ruby 메서드 재귀는 이런 문제가 없으므로
  # 트리 렌더링 자체를 플러그인으로 옮김.
  class TocTreeTag < Liquid::Tag
    def render(context)
      site = context.registers[:site]
      baseurl = site.config["baseurl"].to_s

      paths = collect_paths(site.categories.keys)
      children = build_children_map(paths)
      roots = paths.select { |path| depth_of(path) == 0 }.sort

      roots.map { |path| render_node(path, 0, children, site, baseurl) }.join
    end

    private

    # site.categories의 키들(예: "BOJ/C++/")로부터 중간 경로까지 포함한
    # 전체 카테고리 경로 집합을 만든다 (예: "BOJ/C++/" 이 있으면 "BOJ/" 도 포함)
    def collect_paths(category_keys)
      paths = []
      category_keys.each do |category|
        current = ""
        category.split("/").each do |part|
          current += "#{part}/"
          paths << current unless paths.include?(current)
        end
      end
      paths
    end

    def depth_of(path)
      path.split("/").size - 1
    end

    def build_children_map(paths)
      children = Hash.new { |h, k| h[k] = [] }
      paths.each do |path|
        parts = path.split("/")
        next if parts.size <= 1

        parent = "#{parts[0..-2].join('/')}/"
        children[parent] << path if paths.include?(parent)
      end
      children
    end

    def render_node(path, depth, children, site, baseurl)
      parts = path.split("/")
      folder_name = CGI.escapeHTML(parts.last)
      posts_in_category = site.posts.docs.select { |post| Array(post.data["categories"]).first == path }
      total_posts = posts_in_category.size

      html = +%(<li class="toc__item depth-#{depth}" data-path="#{CGI.escapeHTML(path)}" data-total-posts="#{total_posts}">)
      html << %(<div class="toc__menu-title">)
      html << %(<span class="folder-toggle"><i class="fas fa-folder-open"></i></span>)
      html << %(<span class="folder-name">#{folder_name}</span>)
      html << %(<span class="post-count">#{total_posts}</span>) if total_posts > 0
      html << %(</div>)

      if total_posts > 0
        html << %(<ul class="toc__menu posts-list">)
        posts_in_category.sort_by(&:date).reverse.first(3).each do |post|
          html << %(<li><a href="#{relative_url(post.url, baseurl)}" class="toc__link"><i class="fas fa-file-alt"></i> #{CGI.escapeHTML(post.data["title"].to_s)}</a></li>)
        end
        if total_posts > 3
          html << %(<li><a href="/board?path=#{CGI.escape(path)}" class="toc__link more-posts"><i class="fas fa-ellipsis-h"></i> 더보기</a></li>)
        end
        html << %(</ul>)
      end

      child_paths = children[path] || []
      unless child_paths.empty?
        # 의도적으로 toc__menu 클래스를 붙이지 않음: 테마의 .toc__menu는
        # font-size를 0.75em(상대 단위)으로 주는데, 카테고리가 깊어질수록
        # submenu가 실제로 중첩되면서 0.75^depth로 폰트가 누적 축소돼버림
        html << %(<ul class="submenu">)
        child_paths.sort.each do |child_path|
          html << render_node(child_path, depth + 1, children, site, baseurl)
        end
        html << %(</ul>)
      end

      html << %(</li>)
      html
    end

    def relative_url(url, baseurl)
      "#{baseurl}#{url}".squeeze("/")
    end
  end
end

Liquid::Template.register_tag("toc_tree", Jekyll::TocTreeTag)

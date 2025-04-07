---
layout: single
permalink: /board
classes: wide
---

<div class="board-container">
  <div class="board-header">
    {% include breadcrumb.html %}
  </div>
  <div class="board-list">
    {% for post in site.posts %}
      <div class="board-item" data-categories="{{ post.categories | join: '/' }}" style="display: none;">
        <div class="board-content">
          <a href="{{ post.url | relative_url }}" class="board-title">{{ post.title }}</a>
          <span class="board-date">{{ post.date | date: "%Y-%m-%d" }}</span>
        </div>
      </div>
    {% endfor %}
    <div class="board-item no-data" style="display: none;">
      <div class="board-content">
        <span class="board-title">No Data</span>
      </div>
    </div>
  </div>
  <div class="board-controls">
    <ul class="pagination"></ul>
  </div>
</div>

<script src="{{ '/assets/js/board.js' | relative_url }}"></script>

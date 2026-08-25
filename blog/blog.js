/* ──────────────────────────────────────────────────────────────
   Curiosity Hub — notes & links
   Two data files drive everything:
     posts.json  → the notes (markdown files live in posts/)
     links.json  → standalone Links entries
   The Links tab merges both: the "source" declared on each note
   (so every note's reference shows up automatically) plus
   anything listed in links.json on its own.
   Routing is hash-based so it works on plain static hosting:
     #/links            everything worth keeping a link to (default, sorted A–Z by title)
     #/notes            the notes list
     #/notes/<slug>     one note
   ────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    // Links 的筛选按钮固定这几个（数据里出现的新类型会自动补在后面）
    var TYPES = ['All', 'Course', 'Reference', 'Article', 'Tool', 'Fun'];

    var state = {
        posts: [],
        links: [],
        sources: [],
        rendered: [],
        view: 'links',      // 'links' | 'notes'
        noteTag: 'All',
        linkType: 'All',
        query: ''
    };

    var el = {
        listView:   document.getElementById('list-view'),
        articleView:document.getElementById('article-view'),
        articleHead:document.getElementById('article-head'),
        articleBody:document.getElementById('article-body'),
        articleToc: document.getElementById('article-toc'),
        stats:      document.getElementById('blog-stats'),
        search:     document.getElementById('blog-search-input'),
        tabs:       document.querySelectorAll('.blog-tab'),
        panelNotes: document.getElementById('panel-notes'),
        panelLinks: document.getElementById('panel-links'),
        noteFilters:document.getElementById('notes-filters'),
        linkFilters:document.getElementById('links-filters'),
        noteList:   document.getElementById('note-list'),
        linkList:   document.getElementById('link-list'),
        modal:      document.getElementById('collection-modal'),
        modalBody:  document.getElementById('modal-body'),
        modalClose: document.getElementById('modal-close')
    };

    // ── helpers ────────────────────────────────────────────────
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // 卡片描述里允许用 *星号* 打斜体（书名、片名之类），其他内容照常转义
    function withEm(str) {
        return esc(str).replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }

    function prettyDate(iso) {
        if (!iso) return '';
        var parts = String(iso).split('-');
        if (parts.length < 3) return iso;
        var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
        if (isNaN(d)) return iso;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    }

    function slugify(text) {
        return String(text).toLowerCase().trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section';
    }

    function matchesQuery(haystackParts) {
        if (!state.query) return true;
        return haystackParts.join(' ').toLowerCase().indexOf(state.query) !== -1;
    }

    // 卡片进入视口再淡入
    var io = ('IntersectionObserver' in window)
        ? new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('in');
                io.unobserve(e.target);
            });
        }, { threshold: 0.08 })
        : null;

    function reveal(container) {
        var items = container.querySelectorAll('.reveal');
        if (!io) { items.forEach(function (n) { n.classList.add('in'); }); return; }
        items.forEach(function (n, i) {
            n.style.transitionDelay = Math.min(i, 5) * 50 + 'ms';
            io.observe(n);
        });
    }

    // ── the links tab = notes' sources + standalone links ─────
    function collectSources() {
        var all = [];

        // 笔记里引用的来源，自动进 Links
        state.posts.forEach(function (p) {
            if (!p.source) return;
            var list = Array.isArray(p.source) ? p.source : [p.source];
            list.forEach(function (s) {
                if (!s || !s.url) return;
                all.push({
                    title: s.title || s.url,
                    url:   s.url,
                    type:  s.type || 'Website',
                    note:  s.note || '',
                    tags:  s.tags || p.tags || [],
                    date:  s.date || p.date || '',
                    items: s.items || null
                });
            });
        });

        // links.json 里单独收藏的、不挂在任何笔记下面的
        state.links.forEach(function (s) {
            if (!s || (!s.url && !s.items)) return;
            all.push({
                title: s.title || s.url,
                url:   s.url,
                type:  s.type || 'Website',
                note:  s.note || '',
                tags:  s.tags || [],
                date:  s.date || '',
                items: s.items || null   // 有 items 就是合集卡，点开展开
            });
        });

        // 同一个网址只留一张卡
        var out = [], seen = {};
        all.forEach(function (s) {
            var key = s.url || 'collection:' + s.title;
            if (seen[key]) return;
            seen[key] = true;
            out.push(s);
        });

        // 按标题字母排序：卡片数量长起来以后，找一个记得名字的东西比「最近加的在前」好用；
        // sensitivity: 'base' 让大小写和重音不影响顺序（a 和 A 排在一起）
        out.sort(function (a, b) {
            return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
        });
        return out;
    }

    // ── stats ──────────────────────────────────────────────────
    function renderStats() {
        var cells = [
            { n: state.posts.length, label: 'Notes' },
            { n: state.sources.length, label: 'Links' }
        ];
        el.stats.innerHTML = cells.map(function (c) {
            return '<div class="stat"><span class="stat-num">' + c.n + '</span>' +
                   '<span class="stat-label">' + c.label + '</span></div>';
        }).join('');
    }

    // ── notes ──────────────────────────────────────────────────
    function renderNoteFilters() {
        var tags = ['All'];
        state.posts.forEach(function (p) {
            (p.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
        });
        if (tags.length <= 2) { el.noteFilters.innerHTML = ''; return; }  // 只有一个标签就不用筛选了
        el.noteFilters.innerHTML = tags.map(function (t) {
            return '<button class="chip' + (t === state.noteTag ? ' is-active' : '') +
                   '" data-tag="' + esc(t) + '">' + esc(t) + '</button>';
        }).join('');
    }

    function renderNotes() {
        var items = state.posts.filter(function (p) {
            var tagOk = state.noteTag === 'All' || (p.tags || []).indexOf(state.noteTag) !== -1;
            return tagOk && matchesQuery([p.title, p.summary, (p.tags || []).join(' ')]);
        });

        if (!items.length) {
            el.noteList.innerHTML = '<p class="blog-empty">Nothing here yet — try another topic or search.</p>';
            return;
        }

        el.noteList.innerHTML = items.map(function (p) {
            var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
            return '<a class="note-card reveal" href="#/notes/' + encodeURIComponent(p.slug) + '">' +
                     '<span class="card-arrow" aria-hidden="true">\u2192</span>' +
                     '<div class="note-date">' + esc(prettyDate(p.date)) + '</div>' +
                     '<h2 class="note-title">' + esc(p.title) + '</h2>' +
                     (p.summary ? '<p class="note-summary">' + withEm(p.summary) + '</p>' : '') +
                     (tags ? '<div class="tag-row">' + tags + '</div>' : '') +
                   '</a>';
        }).join('');
        reveal(el.noteList);
    }

    // ── links ──────────────────────────────────────────────────
    function renderLinkFilters() {
        var types = TYPES.slice();
        state.sources.forEach(function (s) {
            if (s.type && types.indexOf(s.type) === -1) types.push(s.type);
        });
        el.linkFilters.innerHTML = types.map(function (t) {
            return '<button class="chip' + (t === state.linkType ? ' is-active' : '') +
                   '" data-type="' + esc(t) + '">' + esc(t) + '</button>';
        }).join('');
    }

    // 合集卡里的一条链接
    function itemLink(l) {
        return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
               esc(l.label) + '</a>' +
               (l.note ? ' <span class="res-hint">(' + esc(l.note) + ')</span>' : '');
    }

    // items 支持两种条目：单条链接，或者「一个不带链接的小标题 + 它下面的若干条链接」
    function renderItems(items) {
        return items.map(function (it) {
            if (it.group) {
                var lines = (it.links || []).map(function (l) {
                    return '<div class="res-line res-sub">' + itemLink(l) + '</div>';
                }).join('');
                return '<div class="res-group">' +
                         '<div class="res-group-label">' + esc(it.group) + '</div>' + lines +
                       '</div>';
            }
            return '<div class="res-line">' + itemLink(it) + '</div>';
        }).join('');
    }

    // 合集卡的文字也要能被搜到，否则搜「Pantages」什么都搜不出来
    function itemsText(items) {
        if (!items) return '';
        return items.map(function (it) {
            if (it.group) {
                return it.group + ' ' + (it.links || []).map(function (l) {
                    return l.label + ' ' + (l.note || '');
                }).join(' ');
            }
            return it.label + ' ' + (it.note || '');
        }).join(' ');
    }

    function renderLinks() {
        var items = state.sources.filter(function (s) {
            var typeOk = state.linkType === 'All' || s.type === state.linkType;
            return typeOk && matchesQuery([s.title, s.note, s.type, (s.tags || []).join(' '),
                                           itemsText(s.items)]);
        });

        if (!items.length) {
            el.linkList.innerHTML = '<p class="blog-empty">Nothing here yet — try another filter or search.</p>';
            return;
        }

        state.rendered = items;   // data-collection 存的是这个数组的下标
        el.linkList.innerHTML = items.map(function (s, i) {
            var tags = (s.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
            var body = '<span class="res-type">' + esc(s.type) + '</span>' +
                       '<div class="res-title">' + esc(s.title) + '</div>' +
                       (s.note ? '<p class="res-note">' + withEm(s.note) + '</p>' : '') +
                       (tags ? '<div class="tag-row">' + tags + '</div>' : '');

            // 合集卡：外观跟普通卡一致，右上角用 + 表示「里面还有东西」，点开是弹窗。
            // 细节收在弹窗里，列表才不会把这张卡撑得比邻居高一大截。
            if (s.items && s.items.length) {
                return '<button class="res-card res-collection reveal" type="button" data-collection="' + i + '">' +
                         '<span class="card-arrow card-arrow-more" aria-hidden="true">+</span>' +
                         body +
                       '</button>';
            }

            return '<a class="res-card reveal" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
                     '<span class="card-arrow card-arrow-out" aria-hidden="true">\u2197</span>' +
                     body +
                   '</a>';
        }).join('');
        reveal(el.linkList);
    }

    // ── markdown ───────────────────────────────────────────────
    // 优先用 marked；CDN 挂了就退回下面这个够用的小解析器
    function renderMarkdown(md) {
        if (window.marked && typeof window.marked.parse === 'function') {
            return window.marked.parse(md);
        }
        return miniMarkdown(md);
    }

    function miniMarkdown(md) {
        var blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
        return blocks.map(function (block) {
            var b = block.trim();
            if (!b) return '';
            if (/^```/.test(b)) {
                return '<pre><code>' + esc(b.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')) + '</code></pre>';
            }
            if (/^#{1,6}\s/.test(b)) {
                var level = b.match(/^#+/)[0].length;
                return '<h' + level + '>' + inline(b.replace(/^#+\s*/, '')) + '</h' + level + '>';
            }
            if (/^>\s?/.test(b)) {
                return '<blockquote>' + inline(b.replace(/^>\s?/gm, '')) + '</blockquote>';
            }
            if (/^(-{3,}|\*{3,})$/.test(b)) return '<hr>';
            if (/^[-*]\s/.test(b)) {
                return '<ul>' + b.split('\n').map(function (li) {
                    return '<li>' + inline(li.replace(/^[-*]\s*/, '')) + '</li>';
                }).join('') + '</ul>';
            }
            if (/^\d+\.\s/.test(b)) {
                return '<ol>' + b.split('\n').map(function (li) {
                    return '<li>' + inline(li.replace(/^\d+\.\s*/, '')) + '</li>';
                }).join('') + '</ol>';
            }
            if (/^</.test(b)) return b; // 正文里手写的 HTML 原样输出
            return '<p>' + inline(b) + '</p>';
        }).join('\n');

        function inline(t) {
            return esc(t)
                .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
                .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
                .replace(/\n/g, '<br>');
        }
    }

    // ── left-hand heading index ────────────────────────────────
    var tocSpy = null;

    function buildToc() {
        if (tocSpy) { tocSpy.disconnect(); tocSpy = null; }

        var heads = el.articleBody.querySelectorAll('h2');
        if (heads.length < 2) {
            el.articleToc.innerHTML = '';
            el.articleToc.hidden = true;
            return;
        }

        var used = {};
        var links = [].map.call(heads, function (h) {
            var id = slugify(h.textContent);
            while (used[id]) { id = id + '-x'; }
            used[id] = true;
            h.id = id;
            return '<a class="toc-link" href="#' + id + '" data-target="' + id + '">' + esc(h.textContent) + '</a>';
        }).join('');

        el.articleToc.innerHTML = '<div class="toc-label">In this note</div><nav class="toc-links">' + links + '</nav>';
        el.articleToc.hidden = false;

        // 目录跟着滚动高亮当前小节
        if ('IntersectionObserver' in window) {
            var anchors = el.articleToc.querySelectorAll('.toc-link');
            tocSpy = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (!e.isIntersecting) return;
                    anchors.forEach(function (a) {
                        a.classList.toggle('is-current', a.dataset.target === e.target.id);
                    });
                });
            }, { rootMargin: '-100px 0px -70% 0px' });
            [].forEach.call(heads, function (h) { tocSpy.observe(h); });
        }

        el.articleToc.addEventListener('click', function (e) {
            var a = e.target.closest('.toc-link');
            if (!a) return;
            e.preventDefault();   // 不要把 #section 写进地址栏，否则会打断 #/notes/... 路由
            var target = document.getElementById(a.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // ── article ────────────────────────────────────────────────
    function showArticle(slug) {
        var post = state.posts.filter(function (p) { return p.slug === slug; })[0];
        el.listView.hidden = true;
        el.articleView.hidden = false;
        window.scrollTo(0, 0);

        if (!post) {
            el.articleToc.hidden = true;
            el.articleHead.innerHTML = '<h1>Note not found</h1>';
            el.articleBody.innerHTML = '<p>That note doesn\'t exist (yet). Head back to the list and pick another one.</p>';
            document.title = 'Curiosity Hub — Happy\'s Website';
            return;
        }

        document.title = post.title + ' — Curiosity Hub — Happy\'s Website';
        el.articleToc.hidden = true;
        el.articleHead.innerHTML =
            '<div class="article-meta">' + esc(prettyDate(post.date)) + '</div>' +
            '<h1>' + esc(post.title) + '</h1>' +
            ((post.tags || []).length
                ? '<div class="tag-row">' + post.tags.map(function (t) {
                      return '<span class="tag">' + esc(t) + '</span>';
                  }).join('') + '</div>'
                : '');
        el.articleBody.innerHTML = '<p class="blog-empty">Loading…</p>';

        fetch('posts/' + post.file)
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.text();
            })
            .then(function (md) {
                el.articleBody.innerHTML = renderMarkdown(md);
                buildToc();
                var mins = Math.max(1, Math.round(md.split(/\s+/).length / 220));
                var meta = el.articleHead.querySelector('.article-meta');
                if (meta) meta.textContent = meta.textContent + ' · ' + mins + ' min read';
            })
            .catch(function () {
                el.articleBody.innerHTML = '<p class="blog-empty">Couldn\'t load this note. Try again in a moment.</p>';
            });
    }

    function showList(view) {
        state.view = view;
        el.articleView.hidden = true;
        el.listView.hidden = false;
        document.title = 'Curiosity Hub — Happy\'s Website';

        el.tabs.forEach(function (t) {
            var on = t.dataset.view === view;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        el.panelNotes.hidden = view !== 'notes';
        el.panelLinks.hidden = view !== 'links';
    }

    // ── routing ────────────────────────────────────────────────
    function route() {
        var hash = window.location.hash.replace(/^#\/?/, '');
        var parts = hash.split('/').filter(Boolean);

        if (parts[0] === 'notes' && parts[1]) {
            showArticle(decodeURIComponent(parts[1]));
        } else if (parts[0] === 'notes') {
            showList('notes');
        } else {
            showList('links');   // 默认就是 Links；旧的 #/library 链接落到这里也没问题
        }
    }

    // ── events ─────────────────────────────────────────────────
    el.tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            window.location.hash = '#/' + tab.dataset.view;
        });
    });

    el.search.addEventListener('input', function () {
        state.query = el.search.value.trim().toLowerCase();
        renderNotes();
        renderLinks();
    });

    el.noteFilters.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        state.noteTag = chip.dataset.tag;
        renderNoteFilters();
        renderNotes();
    });

    var modalTrigger = null;   // 关闭后把焦点还回去，键盘用户才不会掉到页首

    function openCollection(source, trigger) {
        var tags = (source.tags || []).map(function (t) {
            return '<span class="tag">' + esc(t) + '</span>';
        }).join('');

        el.modalBody.innerHTML =
            '<span class="res-type">' + esc(source.type) + '</span>' +
            '<h2 class="modal-title" id="modal-title">' + esc(source.title) + '</h2>' +
            (source.note ? '<p class="modal-note">' + withEm(source.note) + '</p>' : '') +
            (tags ? '<div class="tag-row">' + tags + '</div>' : '') +
            '<div class="res-items">' + renderItems(source.items) + '</div>';

        modalTrigger = trigger || null;
        document.body.classList.add('modal-open');
        el.modal.showModal();
    }

    function closeCollection() {
        if (el.modal.open) el.modal.close();
    }

    el.linkList.addEventListener('click', function (e) {
        var card = e.target.closest('[data-collection]');
        if (!card) return;
        var source = state.rendered[+card.dataset.collection];
        if (source) openCollection(source, card);
    });

    el.modalClose.addEventListener('click', closeCollection);

    // 点空白处关闭：dialog 本身铺满屏幕，命中它说明点的是内容区外面
    el.modal.addEventListener('click', function (e) {
        if (e.target === el.modal) closeCollection();
    });

    el.modal.addEventListener('close', function () {
        document.body.classList.remove('modal-open');
        if (modalTrigger) { modalTrigger.focus(); modalTrigger = null; }
    });

    el.linkFilters.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        state.linkType = chip.dataset.type;
        renderLinkFilters();
        renderLinks();
    });

    window.addEventListener('hashchange', route);

    // ── boot ───────────────────────────────────────────────────
    function loadJSON(path) {
        return fetch(path).then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.json();
        }).catch(function () { return []; });   // links.json 不存在也不影响页面
    }

    Promise.all([loadJSON('posts.json'), loadJSON('links.json')])
        .then(function (res) {
            state.posts = (res[0] || []).slice().sort(function (a, b) {
                return String(b.date || '').localeCompare(String(a.date || ''));
            });
            state.links = res[1] || [];
            state.sources = collectSources();

            renderStats();
            renderNoteFilters();
            renderNotes();
            renderLinkFilters();
            renderLinks();
            route();
        });
})();

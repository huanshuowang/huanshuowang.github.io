/* ──────────────────────────────────────────────────────────────
   页面副目录：吸附在导航栏下方的一排标签，标记当前板块。
   结构从页面已有的 .category-section 读取，加新板块不用改这里。
   portfolio.html 与 videos.html 共用。
   ────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var container = document.querySelector('.links-container');
        var sections = [].slice.call(document.querySelectorAll('.category-section'));
        if (!container || sections.length < 2) return;

        var items = sections.map(function (sec) {
            var header = sec.querySelector('.category-header');
            var heading = sec.querySelector('.category-heading');
            if (!header || !heading) return null;

            var m = (header.getAttribute('onclick') || '').match(/toggleCategory\('([^']+)'\)/);
            var key = m ? m[1] : '';
            if (!key) return null;

            if (!sec.id) sec.id = 'sec-' + key;
            sec.style.scrollMarginTop = '150px';   // 导航栏 + 目录条的高度
            // 板块标题太长时，在 .category-section 上写 data-toc="短名" 覆盖
            var label = sec.dataset.toc ||
                (heading.childNodes[0] && heading.childNodes[0].nodeValue || heading.textContent)
                    .trim().split('\n')[0].trim();
            return { sec: sec, key: key, label: label };
        }).filter(Boolean);

        if (items.length < 2) return;

        var bar = document.createElement('div');
        bar.className = 'toc-bar';
        bar.innerHTML = '<nav class="toc-bar-inner" aria-label="Sections">' +
            items.map(function (i) {
                return '<a href="#' + i.sec.id + '" data-key="' + i.key + '">' + i.label + '</a>';
            }).join('') + '</nav>';
        container.parentNode.insertBefore(bar, container);

        bar.addEventListener('click', function (e) {
            var a = e.target.closest('a');
            if (!a) return;
            e.preventDefault();
            var it = items.filter(function (x) { return x.key === a.dataset.key; })[0];
            if (!it) return;
            // 目标板块收着的话先展开，否则跳过去只看到一行标题
            var content = document.getElementById(it.key + '-content');
            if (content && content.classList.contains('collapsed') && window.toggleCategory) {
                window.toggleCategory(it.key);
            }
            it.sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // 滚动高亮：直接算哪个板块处在视口上部，不用 IntersectionObserver。
        // 一来只有几个板块、成本可以忽略；二来 observer 依赖渲染帧，
        // 在某些内嵌预览环境里根本不回调，用滚动位置算是确定性的。
        var links = [].slice.call(bar.querySelectorAll('a'));
        var scroller = bar.querySelector('.toc-bar-inner');
        var lastKey = null;

        // 目录条在手机上放不下会横向溢出。切到新板块时把对应标签拨进可视范围，
        // 免得读者已经滚到 Personal、目录却还停在最左边。
        function revealInBar(a) {
            if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
            // 用 rect 相减算位置，不依赖 offsetParent 是谁
            var pad = 20;
            var box = scroller.getBoundingClientRect();
            var r = a.getBoundingClientRect();
            var left = r.left - box.left + scroller.scrollLeft - pad;
            var right = left + r.width + pad * 2;
            var target = null;

            if (left < scroller.scrollLeft) target = left;
            else if (right > scroller.scrollLeft + scroller.clientWidth) {
                target = right - scroller.clientWidth;
            }
            if (target === null) return;

            // 直接赋值而不是 scrollTo({behavior:'smooth'})——后者依赖渲染帧，
            // 某些环境里根本不动。平滑效果交给 CSS 的 scroll-behavior。
            scroller.scrollLeft = Math.max(
                0, Math.min(target, scroller.scrollWidth - scroller.clientWidth)
            );
        }

        function markCurrent() {
            var line = 170;                    // 导航栏 + 目录条下沿
            var current = items[0];
            items.forEach(function (it) {
                if (it.sec.getBoundingClientRect().top <= line) current = it;
            });
            // 滚到底时高亮最后一节，否则最后一节永远轮不到
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
                current = items[items.length - 1];
            }
            links.forEach(function (a) {
                a.classList.toggle('on', a.dataset.key === current.key);
            });

            // 只在当前板块真的变了时才拨动，否则会和读者手动横拖打架
            if (current.key !== lastKey) {
                lastKey = current.key;
                links.forEach(function (a) {
                    if (a.dataset.key === current.key) revealInBar(a);
                });
            }
        }

        // 直接在 scroll 里算：只有几个板块，读几次 rect 的开销可以忽略。
        // 不用 requestAnimationFrame 节流——它依赖渲染帧，某些内嵌环境里不回调。
        window.addEventListener('scroll', markCurrent, { passive: true });
        window.addEventListener('resize', markCurrent);
        markCurrent();

    });
})();

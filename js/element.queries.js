(function (els) {
    'use strict';

    var elements = [];

    // loop through each link tag with
    // data attribute "data-element-queries"
    for (var i = 0, l = els.length; i < l; i += 1) {
        var el = els[i],
            url = el.href,
            xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // find and store the element with :media() pseudo class
                var str = xhr.responseText.replace(/\n/g, ''),
                    mEls = str.match(/[^|}]+:media+(.*?)}/gi);

                mEls.forEach(function (str, num) {
                    // create a style tag
                    // and replace all the :media() pseudo classes
                    // with - separated class names
                    // e.g. .el2:media(max-width: 100px) -> .el2-media-max-width-100px
                    var head = document.getElementsByTagName('head')[0],
                        styleTag = document.createElement('style'),
                        style = str.replace(/:media\(/, '-').replace(')', '').replace(/:\s/, '-'),
                        cls = style.replace(/\{.*\}/g, '').replace(/\./g, '').replace(/\s/g, ''),
                        el = document.querySelectorAll(str.match(/^[^:]*/gi)),
                        cond = str.match(/\([^:]*/)[0].replace('(', ''),
                        val = str.match(/\:\s[^)]*/)[0].replace(/:\s/, ''),
                        obj = {};

                    styleTag.appendChild(document.createTextNode(style));
                    head.appendChild(styleTag);
                    // currently only supports 1 max-width condition
                    // max-width is actually hard-coded below in the check
                    // it's a prototype - deal with it :)
                    obj[cond] = val;
                    elements.push({ el: el, cls: cls, conditions: [obj] });
                    window.addEventListener('resize', debounce(function () {
                        elements.forEach(function (obj) {
                            for (var i = 0, l = obj.el.length; i < l; i += 1) {
                                if (obj.el[i].offsetWidth < parseInt(obj.conditions[0]['max-width'])) {
                                    obj.el[i].classList.add(obj.cls);
                                } else {
                                    obj.el[i].classList.remove(obj.cls);
                                }
                            }
                        });
                    }, 10), false);
                });
            }
        }

        try {
            xhr.open('GET', url);
            xhr.send(null);
        } catch (e) {
            console.log(e);
        }
    }

    /* http://remysharp.com/2010/07/21/throttling-function-calls/ */
    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }
}(document.querySelectorAll('link[data-element-queries=true]')));
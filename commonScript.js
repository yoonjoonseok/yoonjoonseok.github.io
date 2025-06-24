document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  const loader = document.getElementById("loader");
  if (nav) {
    fetch("/common/navbar/navbar.html")
      .then(res => res.text())
      .then(html => {
        nav.innerHTML = html;
      });
  }
  if (loader) {
    fetch("/common/loader/loader.html")
      .then(res => res.text())
      .then(html => {
        loader.innerHTML = html;
      });
  }
});

(() => {
  const classMap = {
    default:   '/resource/cursor/일반 선택.cur',
    pointer:   '/resource/cursor/일반 선택.cur',
    text:      '/resource/cursor/일반 선택.cur',
    grabbing:  '/resource/cursor/일반 선택.cur',
    grab:      '/resource/cursor/일반 선택.cur',
    wait:      '/resource/cursor/일반 선택.cur',
    help:      '/resource/cursor/일반 선택.cur',
    notAllowed:'/resource/cursor/일반 선택.cur',
    resizeEW:  '/resource/cursor/일반 선택.cur',
    resizeNS:  '/resource/cursor/일반 선택.cur'
  };

  const state = new Set();

  const updateCursor = () => {
    const priority = [
      'grabbing', 'grab', 'text', 'wait',
      'pointer', 'notAllowed', 'resizeEW', 'resizeNS',
      'help', 'default'
    ];
    let cursorFile = classMap.default;
    for (const s of priority) {
      if (state.has(s)) {
        cursorFile = classMap[s];
        break;
      }
    }
    document.body.style.cursor = `url(${cursorFile}), auto`;
  };

  const setState = (key, on) => {
    on ? state.add(key) : state.delete(key);
    updateCursor();
  };

  document.addEventListener('mousedown', e => {
    if (e.target.draggable || e.target.classList.contains('draggable')) {
      setState('grabbing', true);
    } else {
      setState('grab', true);
    }
  });

  document.addEventListener('mouseup', () => {
    setState('grabbing', false);
    setState('grab', false);
  });

  document.addEventListener('selectstart', () => setState('text', true));
  document.addEventListener('selectionchange', () => {
    if (!window.getSelection().toString()) {
      setState('text', false);
    }
  });

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role=button]')) {
      setState('pointer', true);
    } else {
      setState('pointer', false);
    }
  });

  document.addEventListener('mousemove', e => {
    const edge = 5;
    const x = e.clientX;
    const y = e.clientY;

    setState('resizeEW', x >= window.innerWidth - edge);
    setState('resizeNS', y >= window.innerHeight - edge);
  });

  // 선택적으로 전역에 expose 가능
  window.CursorSystem = {
    withLoading(promiseOrFn) {
      setState('wait', true);
      const p = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
      return Promise.resolve(p).finally(() => setState('wait', false));
    },
    setState,
  };

})();

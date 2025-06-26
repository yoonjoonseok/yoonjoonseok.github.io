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
    default:   '/resource/cursor/일반선택.cur',
    pointer:   '/resource/cursor/연결선택.ani',
    text:      '/resource/cursor/텍스트_선택.cur',
    grabbing:  '/resource/cursor/이동.gif',
    /*grab:      '/resource/cursor/이동.gif',*/
    wait:      '/resource/cursor/사용중.ani',
    help:      '/resource/cursor/도움말 선택.ani',
    notAllowed:'/resource/cursor/사용할 수 없음.ani',
    resizeEW:  '/resource/cursor/수직 크기 조절.ani',
    resizeNS:  '/resource/cursor/수평 크기 조절.ani',
    resizeNS:  '/resource/cursor/수평 크기 조절.ani'
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

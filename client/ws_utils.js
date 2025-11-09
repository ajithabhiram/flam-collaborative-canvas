export function throttle(fn, ms) {
  let last = 0; let timer = null; let pendingArgs = null;
  return function(...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now; fn.apply(this, args);
    } else {
      pendingArgs = args;
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, pendingArgs);
        pendingArgs = null;
      }, ms - (now - last));
    }
  };
}

export function genTempId() {
  return Math.random().toString(36).slice(2);
}

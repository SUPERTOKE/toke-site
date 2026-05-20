import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './Views/Home.vue'

const routes = [
    { path: '/', component: Home },
];

/** Fragment deep-links: the browser scrolls before #app mounts, so the target id is missing. Wait for DOM then scroll. */
function waitForHashElement(hash, maxFrames = 24) {
  const raw = hash.replace(/^#/, '');
  if (!raw) return Promise.resolve(null);
  let id;
  try {
    id = decodeURIComponent(raw);
  } catch {
    id = raw;
  }
  return new Promise((resolve) => {
    let frame = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        resolve(el);
        return;
      }
      if (++frame >= maxFrames) {
        resolve(null);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    const h = to.hash;
    if (!h || h === '#') return false;
    return waitForHashElement(h).then((el) => {
      if (!el) return false;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      return {
        el: h,
        top: 80,
        behavior: reduceMotion ? 'auto' : 'smooth',
      };
    });
  },
});

createApp(App).use(router).mount('#app');

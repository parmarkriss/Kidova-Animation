import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";



gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;
const FRAME_PATH = "./frames";

const frames = [];
let loadedFrames = 0;

const state = {
  frame: 0
};

const canvas =
  document.getElementById(
    "animation-canvas"
  );

if (!canvas) {
  console.error(
    "Canvas not found"
  );
  throw new Error(
    "Canvas missing"
  );
}

const ctx =
  canvas.getContext("2d");

if (!ctx) {
  console.error(
    "2D Context unavailable"
  );
  throw new Error(
    "Canvas Context missing"
  );
}

const preloader =
  document.getElementById(
    "preloader"
  );

const progress =
  document.getElementById(
    "load-progress"
  );

const percentage =
  document.getElementById(
    "load-percentage"
  );

function pad(num) {
  return String(num).padStart(
    3,
    "0"
  );
}

function updateLoader() {

  if (
    !progress ||
    !percentage
  )
    return;

  const value = Math.round(
    (loadedFrames /
      TOTAL_FRAMES) *
      100
  );

  progress.style.width =
    `${value}%`;

  percentage.textContent =
    `${value}%`;
}

function preloadFrames() {

  return new Promise(
    (resolve) => {

      const frameLoaded =
        () => {

          loadedFrames++;

          updateLoader();

          if (
            loadedFrames >=
            TOTAL_FRAMES
          ) {
            resolve();
          }
        };

      for (
        let i = 1;
        i <= TOTAL_FRAMES;
        i++
      ) {

        const img =
          new Image();

        img.decoding =
          "async";

        img.loading =
          "eager";

        img.onload =
          frameLoaded;

        img.onerror =
          frameLoaded;

        img.src =
          `${FRAME_PATH}/ezgif-frame-${pad(
            i
          )}.jpg`;

        frames.push(img);
      }
    }
  );
}

function renderFrame(
  index
) {

  const frame =
    Math.min(
      TOTAL_FRAMES - 1,
      Math.max(
        0,
        Math.round(index)
      )
    );

  const img =
    frames[frame];

  if (
    !img ||
    !img.complete
  )
    return;

  const cw =
    window.innerWidth;

  const ch =
    window.innerHeight;

  const iw =
    img.naturalWidth;

  const ih =
    img.naturalHeight;

  if (!iw || !ih) return;

  const scale =
    Math.max(
      cw / iw,
      ch / ih
    );

  const dw =
    iw * scale;

  const dh =
    ih * scale;

  const x =
    (cw - dw) / 2;

  const y =
    (ch - dh) / 2;

  ctx.clearRect(
    0,
    0,
    cw,
    ch
  );

  ctx.drawImage(
    img,
    x,
    y,
    dw,
    dh
  );
}

function resizeCanvas() {

  const dpr =
    Math.min(
      window.devicePixelRatio ||
        1,
      2
    );

  canvas.width =
    window.innerWidth *
    dpr;

  canvas.height =
    window.innerHeight *
    dpr;

  canvas.style.width =
    window.innerWidth +
    "px";

  canvas.style.height =
    window.innerHeight +
    "px";

  ctx.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
  );

  ctx.scale(
    dpr,
    dpr
  );

  renderFrame(
    state.frame
  );
}

let resizeTimer;

window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeTimer
    );

    resizeTimer =
      setTimeout(
        resizeCanvas,
        150
      );
  }
);

function initAnimation() {

  resizeCanvas();

  renderFrame(0);

  gsap.to(state, {

    frame:
      TOTAL_FRAMES -
      1,

    ease: "none",

    onUpdate: () => {
      renderFrame(
        state.frame
      );
    },

    scrollTrigger: {

      trigger:
        ".scroll-container",

      start:
        "top top",

      end: () =>
        `+=${window.innerHeight * 8}`,

      scrub: 0.5,

      pin: true,

      anticipatePin: 1
    }
  });

  if (preloader) {

    preloader.classList.add(
      "fade-out"
    );

    setTimeout(() => {
      preloader.remove();
    }, 1000);
  }

  ScrollTrigger.refresh();
}

window.addEventListener(
  "load",
  async () => {

    try {

      await preloadFrames();

      initAnimation();

    } catch (error) {

      console.error(
        error
      );

      if (preloader) {
        preloader.style.display =
          "none";
      }
    }
  }
);
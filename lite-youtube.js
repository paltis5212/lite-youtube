/**
thanks https://github.com/justinribeiro/lite-youtube
 */
export class LiteYTEmbed extends HTMLElement {
  constructor() {
    super();
    this.isIframeLoaded = false;
    this.setupDom();
  }

  static get observedAttributes() {
    return ['videoid', 'playlistid'];
  }

  connectedCallback() {
    this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
      once: true,
    });

    this.addEventListener('click', () => this.addIframe());
  }
  get videoId() {
    return encodeURIComponent(this.getAttribute('videoid') || '');
  }
  set videoId(id) {
    this.setAttribute('videoid', id);
  }
  get playlistId() {
    return encodeURIComponent(this.getAttribute('playlistid') || '');
  }
  set playlistId(id) {
    this.setAttribute('playlistid', id);
  }
  get videoTitle() {
    return this.getAttribute('videotitle') || 'Video';
  }
  set videoTitle(title) {
    this.setAttribute('videotitle', title);
  }
  get videoPlay() {
    return this.getAttribute('videoPlay') || 'Play';
  }
  set videoPlay(name) {
    this.setAttribute('videoPlay', name);
  }
  get videoStartAt() {
    return Number(this.getAttribute('videoStartAt') || '0');
  }
  set videoStartAt(time) {
    this.setAttribute('videoStartAt', String(time));
  }
  get autoLoad() {
    return this.hasAttribute('autoload');
  }
  get noCookie() {
    return this.hasAttribute('nocookie');
  }
  get posterQuality() {
    return this.getAttribute('posterquality') || 'hqdefault';
  }
  get posterLoading() {
    return this.getAttribute('posterloading') || 'lazy';
  }
  get params() {
    return `start=${this.videoStartAt}&${this.getAttribute('params')}`;
  }

  setupDom() {
    const shadowDom = this.attachShadow({ mode: 'open' });
    shadowDom.innerHTML = `
        <style>
          :host {
            contain: content;
            display: block;
            position: relative;
            width: 100%;
            padding-bottom: calc(100% / (16 / 9));
          }
  
          #frame, #fallbackPlaceholder, iframe {
            position: absolute;
            width: 100%;
            height: 100%;
          }
  
          #frame {
            cursor: pointer;
          }
  
          #fallbackPlaceholder {
            object-fit: cover;
          }
  
          #frame::before {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);
            background-position: top;
            background-repeat: repeat-x;
            height: 60px;
            padding-bottom: 50px;
            width: 100%;
            transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
            z-index: 1;
          }
          #playButton {
            width: 68px;
            height: 48px;
            background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDY4IDQ4Ij48cGF0aCBzdHlsZT0iY3Vyc29yOiBwb2ludGVyOyIgZD0iTTY2LjUyLDcuNzRjLTAuNzgtMi45My0yLjQ5LTUuNDEtNS40Mi02LjE5QzU1Ljc5LC4xMywzNCwwLDM0LDBTMTIuMjEsLjEzLDYuOSwxLjU1IEMzLjk3LDIuMzMsMi4yNyw0LjgxLDEuNDgsNy43NEMwLjA2LDEzLjA1LDAsMjQsMCwyNHMwLjA2LDEwLjk1LDEuNDgsMTYuMjZjMC43OCwyLjkzLDIuNDksNS40MSw1LjQyLDYuMTkgQzEyLjIxLDQ3Ljg3LDM0LDQ4LDM0LDQ4czIxLjc5LTAuMTMsMjcuMS0xLjU1YzIuOTMtMC43OCw0LjY0LTMuMjYsNS40Mi02LjE5QzY3Ljk0LDM0Ljk1LDY4LDI0LDY4LDI0UzY3Ljk0LDEzLjA1LDY2LjUyLDcuNzR6IiBmaWxsPSIjZjAwIj48L3BhdGg+PHBhdGggZD0iTSA0NSwyNCAyNywxNCAyNywzNCIgZmlsbD0iI2ZmZiI+PC9wYXRoPjwvc3ZnPg==");
            background-color: transparent;
            filter: grayscale(100%);
            z-index: 1;
            opacity: 0.8;
            transition: opacity .25s cubic-bezier(0, 0, 0.2, 1);
            border: 0;
            cursor: pointer;
          }
          #frame:hover > #playButton {
            filter: grayscale(0%);
            opacity: 1;
          }
          #playButton {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0);
          }
  
          /* Post-click styles */
          .activated {
            cursor: unset;
          }
  
          #frame.activated::before,
          #frame.activated > #playButton {
            display: none;
          }
        </style>
        <div id="frame">
          <picture>
            <source id="webpPlaceholder" type="image/webp">
            <source id="jpegPlaceholder" type="image/jpeg">
            <img id="fallbackPlaceholder" referrerpolicy="origin">
          </picture>
          <button id="playButton"></button>
        </div>
      `;
    this.domRefFrame = shadowDom.querySelector('#frame');
    this.domRefImg = {
      fallback: shadowDom.querySelector('#fallbackPlaceholder'),
      webp: shadowDom.querySelector('#webpPlaceholder'),
      jpeg: shadowDom.querySelector('#jpegPlaceholder'),
    };
    this.domRefPlayButton = shadowDom.querySelector('#playButton');
  }

  setupComponent() {
    this.initImagePlaceholder();
    this.domRefPlayButton.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
    this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);
    if (this.autoLoad) {
      this.initIntersectionObserver();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case 'videoid':
      case 'playlistid': {
        if (oldVal !== newVal) {
          this.setupComponent();

          // if we have a previous iframe, remove it and the activated class
          if (this.domRefFrame.classList.contains('activated')) {
            this.domRefFrame.classList.remove('activated');
            this.shadowRoot.querySelector('iframe').remove();
            this.isIframeLoaded = false;
          }
        }
        break;
      }
      default:
        break;
    }
  }

  addIframe(isIntersectionObserver = false) {
    if (!this.isIframeLoaded) {
      const autoplay = isIntersectionObserver ? 0 : 1;
      const wantsNoCookie = this.noCookie ? '-nocookie' : '';
      let embedTarget;
      if (this.playlistId) {
        embedTarget = `?listType=playlist&list=${this.playlistId}&`;
      }
      else {
        embedTarget = `${this.videoId}?`;
      }
      const iframeHTML = `
        <iframe frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
        src="https://www.youtube${wantsNoCookie}.com/embed/${embedTarget}autoplay=${autoplay}&${this.params}"
      ></iframe>`;
      this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
      this.domRefFrame.classList.add('activated');
      this.isIframeLoaded = true;
      this.dispatchEvent(new CustomEvent('liteYoutubeIframeLoaded', {
        detail: {
          videoId: this.videoId,
        },
        bubbles: true,
        cancelable: true,
      }));
    }
  }

  initImagePlaceholder() {
    LiteYTEmbed.addPrefetch('preconnect', 'https://i.ytimg.com/');
    const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/${this.posterQuality}.webp`;
    const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/${this.posterQuality}.jpg`;
    this.domRefImg.fallback.loading = this.posterLoading;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
    this.domRefImg?.fallback?.setAttribute('alt', `${this.videoPlay}: ${this.videoTitle}`);
  }


  initIntersectionObserver() {

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isIframeLoaded) {
          LiteYTEmbed.warmConnections();
          this.addIframe(true);
          observer.unobserve(this);
        }
      });
    }, options);
    observer.observe(this);
  }

  static addPrefetch(kind, url, as) {
    const linkElem = document.createElement('link');
    linkElem.rel = kind;
    linkElem.href = url;
    if (as) {
      linkElem.as = as;
    }
    linkElem.crossOrigin = 'true';
    document.head.append(linkElem);
  }

  static warmConnections() {
    if (LiteYTEmbed.isPreconnected) return;
    LiteYTEmbed.addPrefetch('preconnect', 'https://s.ytimg.com');

    LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');

    LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');

    LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
    LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
    LiteYTEmbed.isPreconnected = true;
  }
}
LiteYTEmbed.isPreconnected = false;

customElements.define('lite-youtube', LiteYTEmbed);
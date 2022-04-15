/**
thanks https://github.com/justinribeiro/lite-youtube
 */
 class LiteYTEmbed extends HTMLElement {
    constructor() {
      super();
      this.__iframeLoaded = false;
      this.__setupDom();
    }
  
    static get observedAttributes() {
      return ['videoid'];
    }
  
    connectedCallback() {
      this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
        once: true,
      });
  
      this.addEventListener('click', e => this.__addIframe());
    }
  
    /**
     * Define our shadowDOM for the component
     * @private
     */
    __setupDom() {
      const shadowDom = this.attachShadow({mode: 'open'});
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
          /* play button */
          .lty-playbtn {
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
          #frame:hover .lty-playbtn {
            filter: grayscale(0%);
            opacity: 1;
          }
          .lty-playbtn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0);
          }
  
          /* Post-click styles */
          .lyt-activated {
            cursor: unset;
          }
  
          #frame.lyt-activated::before,
          .lyt-activated .lty-playbtn {
            display: none;
          }
        </style>
        <div id="frame">
          <picture>
            <source id="webpPlaceholder" type="image/webp">
            <source id="jpegPlaceholder" type="image/jpeg">
            <img id="fallbackPlaceholder" referrerpolicy="origin">
          </picture>
          <button class="lty-playbtn"></button>
        </div>
      `;
      this.__domRefFrame = this.shadowRoot.querySelector('#frame');
      this.__domRefImg = {
        fallback: this.shadowRoot.querySelector('#fallbackPlaceholder'),
        webp: this.shadowRoot.querySelector('#webpPlaceholder'),
        jpeg: this.shadowRoot.querySelector('#jpegPlaceholder'),
      };
      this.__domRefPlayButton = this.shadowRoot.querySelector('.lty-playbtn');
    }
  
    /**
     * Parse our attributes and fire up some placeholders
     * @private
     */
    __setupComponent() {
      this.videoId = encodeURIComponent(this.getAttribute('videoid'));
      this.videoTitle = this.getAttribute('videotitle') || 'Video';
      this.videoPlay = this.getAttribute('videoplay') || 'Play';
      this.videoStartAt = this.getAttribute('start') || 0;
      this.autoLoad = this.getAttribute('autoload') === '' ? true : false;
  
      this.__initImagePlaceholder();
  
      this.__domRefPlayButton.setAttribute(
        'aria-label',
        `${this.videoPlay}: ${this.videoTitle}`,
      );
      this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);
  
      if (this.autoLoad) {
        this.__initIntersectionObserver();
      }
    }
  
    /**
     * Lifecycle method that we use to listen for attribute changes to period
     * @param {*} name
     * @param {*} oldVal
     * @param {*} newVal
     */
    attributeChangedCallback(name, oldVal, newVal) {
      switch (name) {
        case 'videoid': {
          if (oldVal !== newVal) {
            this.__setupComponent();
  
            // if we have a previous iframe, remove it and the activated class
            if (this.__domRefFrame.classList.contains('lyt-activated')) {
              this.__domRefFrame.classList.remove('lyt-activated');
              this.shadowRoot.querySelector('iframe').remove();
            }
          }
          break;
        }
        default:
          break;
      }
    }
  
    /**
     * Inject the iframe into the component body
     * @private
     */
    __addIframe() {
      if (!this.__iframeLoaded) {
        const iframeHTML = `
  <iframe frameborder="0" scrolling="no" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" src="https://www.youtube.com/embed/${this.videoId}?autoplay=1&start=${this.videoStartAt}"></iframe>`;
        this.__domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
        this.__domRefFrame.classList.add('lyt-activated');
        this.__iframeLoaded = true;
      }
    }
  
    /**
     * Setup the placeholder image for the component
     * @private
     */
    __initImagePlaceholder() {
      // we don't know which image type to preload, so warm the connection
      LiteYTEmbed.addPrefetch('preconnect', 'https://i.ytimg.com/');
  
      const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/hqdefault.webp`;
      const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
      this.__domRefImg.webp.srcset = posterUrlWebp;
      this.__domRefImg.jpeg.srcset = posterUrlJpeg;
      this.__domRefImg.fallback.src = posterUrlJpeg;
      this.__domRefImg.fallback.setAttribute(
        'aria-label',
        `${this.videoPlay}: ${this.videoTitle}`,
      );
      this.__domRefImg.fallback.setAttribute(
        'alt',
        `${this.videoPlay}: ${this.videoTitle}`,
      );
    }
  
    /**
     * Setup the Intersection Observer to load the iframe when scrolled into view
     * @private
     */
    __initIntersectionObserver() {
      if (
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window
      ) {
        const options = {
          root: null,
          rootMargin: '0px',
          threshold: 0,
        };
  
        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.__iframeLoaded) {
              LiteYTEmbed.warmConnections();
              this.__addIframe();
              observer.unobserve(this);
            }
          });
        }, options);
  
        observer.observe(this);
      }
    }
  
    /**
     * Add a <link rel={preload | preconnect} ...> to the head
     */
    static addPrefetch(kind, url, as) {
      const linkElem = document.createElement('link');
      linkElem.rel = kind;
      linkElem.href = url;
      if (as) {
        linkElem.as = as;
      }
      linkElem.crossorigin = true;
      document.head.append(linkElem);
    }
  
    /**
     * Begin preconnecting to warm up the iframe load Since the embed's netwok
     * requests load within its iframe, preload/prefetch'ing them outside the
     * iframe will only cause double-downloads. So, the best we can do is warm up
     * a few connections to origins that are in the critical path.
     *
     * Maybe `<link rel=preload as=document>` would work, but it's unsupported:
     * http://crbug.com/593267 But TBH, I don't think it'll happen soon with Site
     * Isolation and split caches adding serious complexity.
     */
    static warmConnections() {
      if (LiteYTEmbed.preconnected) return;
      // Host that YT uses to serve JS needed by player, per amp-youtube
      LiteYTEmbed.addPrefetch('preconnect', 'https://s.ytimg.com');
  
      // The iframe document and most of its subresources come right off
      // youtube.com
      LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');
  
      // The botguard script is fetched off from google.com
      LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');
  
      // TODO: Not certain if these ad related domains are in the critical path.
      // Could verify with domain-specific throttling.
      LiteYTEmbed.addPrefetch(
        'preconnect',
        'https://googleads.g.doubleclick.net',
      );
      LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
      LiteYTEmbed.preconnected = true;
    }
  }
  // Register custom element
  customElements.define('lite-youtube', LiteYTEmbed);
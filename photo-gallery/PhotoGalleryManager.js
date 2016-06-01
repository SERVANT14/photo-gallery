export default class PhotoGalleryManager {
  constructor(galleryContainer, viewerContainer) {
    this._galleryContainer = galleryContainer
    this._viewerContainer = viewerContainer
    this.setup()
  }

  /**
   * Setup the photo gallery.
   */
  setup() {
    // loop through all gallery elements and bind events
    let galleryElements = this._galleryContainer.querySelectorAll('figure')

    for (let i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i + 1);
      galleryElements[i].onclick = (...params) => this.onThumbnailsClick(...params);
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    let hashData = this.photoswipeParseHash();
    if (hashData.pid && hashData.gid) {
      this.openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
    }
  }

  /**
   * Triggers when user clicks on thumbnail
   *
   * @param e
   *
   * @returns {boolean}
   */
  onThumbnailsClick(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    let eTarget = e.target || e.srcElement;

    // find nearest parent element
    let closest = function closest(el, fn) {
      return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // find root element of slide
    let clickedListItem = closest(eTarget, function (el) {
      return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
    });

    if (!clickedListItem) {
      return;
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    let clickedGallery = clickedListItem.parentNode,
      childNodes = clickedListItem.parentNode.childNodes,
      numChildNodes = childNodes.length,
      nodeIndex = 0,
      index;

    for (let i = 0; i < numChildNodes; i++) {
      if (childNodes[i].nodeType !== 1) {
        continue;
      }

      if (childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }
      nodeIndex++;
    }


    if (index >= 0) {
      // open PhotoSwipe if valid index found
      this.openPhotoSwipe(index, clickedGallery);
    }

    return false;
  }

  /**
   * Parse slide data (url, title, size ...) from DOM elements
   *
   * @param el
   *
   * @returns {Array}
   */
  parseThumbnailElements(el) {
    let thumbElements = el.childNodes,
      numNodes = thumbElements.length,
      items = [],
      figureEl,
      linkEl,
      size,
      item;

    for (let i = 0; i < numNodes; i++) {

      figureEl = thumbElements[i]; // <figure> element

      // include only element nodes
      if (figureEl.nodeType !== 1) {
        continue;
      }

      linkEl = figureEl.children[0]; // <a> element

      size = linkEl.getAttribute('data-size').split('x');

      // create slide object
      item = {
        src: linkEl.getAttribute('href'),
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10)
      };


      if (figureEl.children.length > 1) {
        // <figcaption> content
        item.title = figureEl.children[1].innerHTML;
      }

      if (linkEl.children.length > 0) {
        // <img> thumbnail element, retrieving thumbnail url
        item.msrc = linkEl.children[0].getAttribute('src');
      }

      item.el = figureEl; // save link to element for getThumbBoundsFn
      items.push(item);
    }

    return items;
  }

  /**
   * Parse picture index and gallery index from URL (#&pid=1&gid=2).
   *
   * @returns {{}}
   */
  photoswipeParseHash() {
    let hash = window.location.hash.substring(1),
      params = {};

    if (hash.length < 5) {
      return params;
    }

    let vars = hash.split('&');
    for (let i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      let pair = vars[i].split('=');
      if (pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  }

  openPhotoSwipe(index, galleryElement, disableAnimation, fromURL) {
    let gallery;
    let options;
    let items;

    items = this.parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {

      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function (index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        let thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
      }

    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (let j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(this._viewerContainer, PhotoSwipeUI_Default, items, options);
    gallery.init();
  }
}
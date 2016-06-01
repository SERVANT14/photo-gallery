import PhotoGalleryManager from './PhotoGalleryManager'

export default {
  template: require('./template.html'),
  props: {
    allowSharing: {
      default: false
    },
    allowFullScreen: {
      default: true
    },
    allowZoom: {
      default: true
    }
  },

  data ()
  {
    return {
      items: [
        {
          src: '',
          w: 2000,
          h: 1500
        },
        {
          src: 'http://placephant.com/g/1000/1000',
          w: 1000,
          h: 1000
        }
      ]
    }
  },

  ready ()
  {
    let galleryContainer = this.$el.querySelector('.gallery');
    let viewerContainer = this.$el.querySelector('.pswp');

    new PhotoGalleryManager(galleryContainer, viewerContainer)
      .setup()
  }
}

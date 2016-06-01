export default {
  template: require('./template.html'),
  props: {
    // For the full-sized image.
    photoUrl: {
      type: String,
      required: true
    },
    // For the thumbnail. If none given, photoUrl will be used.
    thumbUrl: {
      type: String,
      default: null
    },
    // The width of the full-sized image.
    width: {
      required: true
    },
    // The height of the full-sized image.
    height: {
      required: true
    },
    // The caption for this image.
    caption: {
      type: String,
      default: ''
    }
  },

  computed: {
    /**
     * If no thumbUrl given, we use photoUrl for the thumbnail.
     *
     * @returns {*}
     */
    finalThumbUrl () {
      return this.thumbUrl ? this.thumbUrl : this.photoUrl
    }
  }
};

const mongoose = require('mongoose');

const MetaDataSchema = new mongoose.Schema({
    asin: {
      type: String,
      default: ''
    },
    title: {
        type: String,
        default: ''
    },
    description:{
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: false
    },
    imUrl: {
        type: String,
        default: ''
    },
    author: {
        type: String, 
        default: ''
    },
    related: {
        type: Object,
        default: null
    },
    categories: {
        type: Array,
        default: []
    },
  });
  
  module.exports = mongoose.model('MetaData', MetaDataSchema);
  
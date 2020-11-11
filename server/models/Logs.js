const mongoose = require('mongoose');

const LogSession = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now()
  },
  type:{
      type: String,
      required: true
  },
  response: {
      type: Number,
      required: true
  }

});

module.exports = mongoose.model('LogSession', LogSession);

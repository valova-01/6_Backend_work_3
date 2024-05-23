const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  problemDescription: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Request = mongoose.model('Request', RequestSchema)

module.exports = Request

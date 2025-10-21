import mongoose from 'mongoose'

const user_schema = new mongoose.Schema({
  ufid: {
    type: String,
    required: true,
    unique: true,
    length: 8
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true })

const User = mongoose.model('User', user_schema)
export default User
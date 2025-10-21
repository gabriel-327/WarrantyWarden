import express from 'express'
import User from '../models/UserAuth.js'
const router = express.Router()
//new account
router.post('/register', async (req, res) => {
  const { ufid, password } = req.body
  if (!ufid || !password) return res.status(400).json({ error: 'Missing fields' })

  try {
    const existing = await User.findOne({ ufid })
    if (existing) return res.status(400).json({ error: 'User already exists' })

    const newUser = new User({ ufid, password })
    await newUser.save()
    res.status(201).json({ message: 'Account created!' })
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' })
  }
})

//userlogin
router.post('/login', async (req, res) => {
  const { ufid, password } = req.body
  try {
    const user = await User.findOne({ ufid })
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    res.status(200).json({ message: 'Login success' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


//get all users
const getAllUsers = asyncHandler(async (req, res) =>{
  const users = await User.find().select('-password').lean();
  if(!users?.length){
    return res.status(400).json({ message: 'User not found' });
  }
  res.json(users);
})

//create a new user
const createNewUser = asyncHandler(async (req, res) =>{
  const { username, password, roles} = req.body;

  //confirm data
  if(!username || !password || !Array.isArray(roles) || !roles.length){
    return res.status(400).json({ message: 'All fields is required!' });
  }

  //check for duplicate username
  const duplicateUsername = await User.findOne({ username }).lean().exec()

  if(duplicateUsername){
    return res.status(409).json({ message: 'Username already exists!' });
  }

  //hash password
  const hashedPasword = await bcrypt.hash(password, 10)

  //create and store new user
  const userObject = { username, "password": hashedPasword, roles };
  const user = await User.create(userObject);

  if(user){
    res.status(201).json({message: `New user ${username} created`});
  } else{
    res.status(400).json({ message: 'Failed to create user' });
  }

})

//update user
const updateUser = asyncHandler(async (req, res) =>{
  const { id, username, roles, active, password } = req.body

  //confirm data 
  if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
    return res.status(400).json({ message: 'All fields is required!'})
  }

  // Validate user existence
  const user = await User.findById(id).exec()
  if(!user){
    return res.status(400).json({message: 'User not found'})
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec()
  if(duplicate && duplicate?._id.toString() !== id){
    return res.status(409).json({ message: 'duplicate username' });
  }

  // Update user data
  user.username = username
  user.roles = roles
  user.active = active

  if(password){
    user.password = await bcrypt.hash(password, 10)
  }

  const updatedUser = await user.save()
  res.status(200).json({ message: `${updatedUser.username} updated`})
})


// delete user
const deleteUser = asyncHandler(async (req, res) =>{
  const { id } = req.body

  if(!id){
    return res.status(400).json({ message: 'User id is required!' });
  }

  const notes = await Note.findOne( {user : id}).lean().exec()
  if(notes?.length){
    return res.status(400).json({ message: 'Cannot delete user while they have notes' });
  }

  const user = await User.findById(id).exec()

  if(!user){
    return res.status(404).json({ message: 'User not found' });
  }

  const result = await user.deleteOne()

  const reply = `Username ${user.username} with ID ${user._id} deleted successfully`

  res.json(reply)
})

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
}
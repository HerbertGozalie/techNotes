const User = require('../models/User');
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler');

// get all notes
const getAllNotes = asyncHandler (async (req, res) => {
  // using populate for small datasets
  const notes = await Note.find().populate('user', 'username').lean()

  if(!notes?.length){
    return res.status(400).json({ message: 'Note not found' });
  }

  res.json(notes)

  // iterate using map for fetching large documents
  // const noteWithUser = await Promise.all(notes.map(async (note) => {
  //   const user = await User.findById(note.user).lean().exec()
  //   return {...note, username: user.username}
  // }))
  // res.json(noteWithUser);  
})

// create a new note
const createNewNote = asyncHandler (async (req, res) => {
  const { user, title, text} = req.body

  if(!user || !title || !text){
    return res.status(400).json({ message: 'All fields is required!' });
  }

  // check for duplicates
  const duplicateNote = await Note.findOne({ title }).lean().exec()

  if(duplicateNote){
    return res.status(409).json({ message: 'Title already exists!' });
  }

  const note = await Note.create({ user, title, text})

  if(note){
    return res.status(201).json({ message: 'Note created!' });
  } else{
    return res.status(400).json({ message: 'Failed to create note' });
  }
})

// update notes
const updateNote = asyncHandler (async (req, res) => {
  const { id, user, title, text, completed } = req.body

  if(!id || !user || !title || !text || typeof completed !== 'boolean'){
    return res.status(400).json({ message: 'All fields is required!' });
  }

  const note = await Note.findById(id).exec()

  if(!note){
    return res.status(400).json({ message: 'Note not found' });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();

  if(duplicate && duplicate?._id.toString()!== id){
    return res.status(409).json({ message: 'Title already exists!' });
  }


  const updatedNote = await Note.findByIdAndUpdate(
    id,
    { user, title, text, completed},
    { new: true}
  )

  if (!updatedNote){
    return res.status(400).json({ message: 'Failed to update note' });
  }

  res.json({ message: `'${updatedNote.title}' updated`, note: updatedNote})

  // note.user = user
  // note.title = title
  // note.text = text
  // note.completed = completed

  // const updatedNote = await note.save()
})


const deleteNote = asyncHandler (async (req, res) => {
  const { id } = req.body

  if(!id){
    return res.status(400).json({ message: 'Note id is required!' });
  }

  const note = await Note.findById(id).exec()
  if(!note){
    return res.status(404).json({ message: 'Note not found' });
  }

  const result = await note.deleteOne()

  const reply = `Note '${note.title}' with ID ${note.id} deleted`

  res.json(reply)
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
}

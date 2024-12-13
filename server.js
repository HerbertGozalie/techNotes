require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const root = require('./routes/root.js')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions.js')
const connectDB = require('./config/dbConn.js')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger.js')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

//middleware
app.use(logger)
app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')));

//routes
app.use('/', root);
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/notesRoutes'))

//if the request is not match with the routes
app.all('*', (req, res) => {
  res.status(404)
  if(req.accepts('html')){
    res.sendFile(path.join(__dirname, 'views' ,'404.html'));
  } else if(req.accepts('json')){
    res.json({ message: '404 not found' });
  } else{
    res.type('txt').send('404 Not Found');
  }
})

app.use(errorHandler)

const startServer = async () => {
  try{
    await connectDB(process.env.DATABASE_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logEvents(`Server started on port ${PORT}`, 'server_log.txt');
    });
  } catch(error){
    console.error('Server failed to start:', error);
    logEvents(`${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`, 'mongoErrLog.log')
    process.exit(1);
  }
}

startServer();
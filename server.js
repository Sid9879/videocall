const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose')
const config = require('./config')
const http = require('http');
const server = http.createServer(app);
const zegoRoutes  =  require("./routes/zego");



//Import routes
const initializeSocket = require('./socket/SocketConnection');
const auth = require('./routes/authRoute');
const admin = require('./routes/adminRoute');
const business = require('./routes/BusinessDevelopmentRoute');
const user = require('./routes/userRoute');
const public = require('./routes/publicRoute')
const agency = require('./routes/agencyRoute')
const media = require('./controllers/media');

initializeSocket(server);

app.use(express.json());
app.use(cors());

mongoose.connect(config.mongodb.dbConnectionString)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//routes.
app.use('/api/auth',auth);
app.use('/api/admin',admin);
app.use('/api/business',business);
app.use('/api/user',user);
app.use('/api/agency',agency);
app.use('/api/public',public);
app.use('/api/media',media);
app.use("/api/zego", zegoRoutes);


server.listen(config.http.port , ()=>{
     console.log("Server started successfully at port " + config.http.port)
})
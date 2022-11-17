const mongoose = require('mongoose');

const connectionString = "mongodb+srv://gaut:capsule@cluster0.yt8nf.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));

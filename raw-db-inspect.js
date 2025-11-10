const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    try {
      // Get the raw collection
      const studentClassCollection = mongoose.connection.collection('studentclasses');
      
      // Get all documents with raw data
      const cursor = studentClassCollection.find({});
      const documents = await cursor.toArray();
      
      console.log('Raw StudentClass documents:');
      documents.forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
        
        // Check the type of classId
        console.log(`  classId type: ${typeof doc.classId}`);
        console.log(`  classId value:`, doc.classId);
        if (doc.classId && typeof doc.classId === 'object' && doc.classId._id) {
          console.log(`  classId._id type: ${typeof doc.classId._id}`);
          console.log(`  classId._id value:`, doc.classId._id);
        }
      });
      
      // Close connection
      mongoose.connection.close();
    } catch (err) {
      console.error('Error:', err);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
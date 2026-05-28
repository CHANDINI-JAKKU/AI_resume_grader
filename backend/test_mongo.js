import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = 'mongodb+srv://24eg105q39_db_user:Chandu%4031@cluster0.pjbjbcx.mongodb.net/?appName=Cluster0';

async function test() {
  console.log(`Testing URI with URL encoded password: ${uri}`);
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('SUCCESS connecting!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('FAILED connecting! Error:', err.message);
  }
}

test();

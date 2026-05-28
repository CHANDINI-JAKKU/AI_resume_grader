import mongoose from 'mongoose'
import dns from 'dns'

// Set DNS servers to Google and Cloudflare DNS to resolve potential ECONNREFUSED SRV lookup issues on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
} catch (err) {
  console.warn('Warning: Could not set fallback DNS servers:', err.message)
}

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-grader'

  // If the MONGO_URI is still the template, fallback to local database automatically
  if (uri.includes('<username>') || uri.includes('<password>')) {
    console.warn('MongoDB config: MONGO_URI contains template placeholders. Falling back to local MongoDB.')
    uri = 'mongodb://127.0.0.1:27017/resume-grader'
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected successfully to:', uri.includes('127.0.0.1') ? 'Local Database' : 'MongoDB Atlas')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    console.warn('Backend server running, but database features will fail until database is running.')
  }
}

export default connectDB


import mongoose from "mongoose";
import dns from "dns";

// Some home/office networks block or mishandle DNS SRV lookups, which makes
// the mongodb+srv:// connection string fail with "querySrv ECONNREFUSED"
// even though the internet itself works fine. Forcing Node to resolve DNS
// through Google's public DNS servers fixes this in almost all cases.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

import mongoose from "mongoose";

export const connectDB = () => {
  try {
    mongoose
      .connect(process.env.MONGO_URL)
      .then((connection) => {
        console.log(`✅ MongoDB connected to ${connection.connection.name}`);
      })
      .catch((error) => {
        console.log(error, '❌ Failed to connect to DB');
      });
  } catch (error) {
    console.error('❌ Caught error:', error.message);
  }
};

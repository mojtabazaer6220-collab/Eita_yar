const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// خواندن لینک دیتابیس از متغیرهای محیطی چابکان
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'eitaa_app';
const COLLECTION = 'users';

let db;
// اتصال به دیتابیس
MongoClient.connect(MONGO_URI)
  .then(client => { 
      db = client.db(DB_NAME); 
      console.log('MongoDB connected'); 
  })
  .catch(err => console.error('MongoDB connection error:', err));

// مسیر ثبت کاربر جدید
app.post('/register', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  try {
      const existing = await db.collection(COLLECTION).findOne({ chat_id: userId });
      if (!existing) {
        await db.collection(COLLECTION).insertOne({ chat_id: userId, registeredAt: new Date() });
      }
      res.json({ success: true });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// مسیر دریافت لیست کاربران
app.get('/users', async (req, res) => {
  try {
      const users = await db.collection(COLLECTION).find({}).toArray();
      res.json({ users: users.map(u => u.chat_id) });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// روشن کردن سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));

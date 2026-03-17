const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const NEW_URI = 'mongodb+srv://tookaa:tookapassword123@cluster0.8wic54k.mongodb.net/tooka?retryWrites=true&w=majority';
const DATA_DIR = path.join(__dirname, 'dataabekep');

function convertExtendedJSON(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertExtendedJSON);
  if (obj.$oid) return new ObjectId(obj.$oid);
  if (obj.$date) return new Date(obj.$date);
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = convertExtendedJSON(obj[key]);
  }
  return result;
}

async function migrate() {
  const client = new MongoClient(NEW_URI);
  try {
    await client.connect();
    console.log('Connected to new database');
    const db = client.db('tooka');
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const collectionName = file.replace('tooka.', '').replace('.json', '');
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
      const docs = convertExtendedJSON(raw);

      if (!Array.isArray(docs) || docs.length === 0) {
        console.log(`⏭ ${collectionName}: empty, skipping`);
        continue;
      }

      try { await db.collection(collectionName).drop(); } catch {}
      await db.collection(collectionName).insertMany(docs);
      console.log(`✅ ${collectionName}: ${docs.length} documents imported`);
    }

    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.close();
  }
}

migrate();

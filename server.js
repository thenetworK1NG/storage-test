require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const S3_ENDPOINT = process.env.S3_ENDPOINT; // e.g. https://s3.eu-central-1.s4.mega.io
const BUCKET = process.env.BUCKET; // e.g. abm-pdf-system.s3.g.s4.mega.io or just abm-pdf-system

// Normalize bucket name: if user supplied a host-like value (bucket.s3....), extract the bucket portion
let BUCKET_NAME = BUCKET || '';
if (BUCKET_NAME && BUCKET_NAME.includes('.s3')) {
  BUCKET_NAME = BUCKET_NAME.split('.s3')[0];
} else if (BUCKET_NAME && BUCKET_NAME.includes('.')) {
  // also handle values like 'bucket.something'
  BUCKET_NAME = BUCKET_NAME.split('.')[0];
}
if (BUCKET && BUCKET_NAME !== BUCKET) {
  console.log(`Normalized BUCKET from '${BUCKET}' to '${BUCKET_NAME}'`);
}

const missing = [];
if (!process.env.AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID');
if (!process.env.AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY');
if (!S3_ENDPOINT) missing.push('S3_ENDPOINT');
if (!BUCKET) missing.push('BUCKET');
const configured = missing.length === 0;
if (!configured) {
  console.warn('Missing required env vars: ' + missing.join(', ') + '. Server will start but S3 requests will return helpful errors.');
}

const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || 'true').toLowerCase() === 'true';
const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle,
});

console.log(`S3 client configured. endpoint='${S3_ENDPOINT}', region='${process.env.AWS_REGION || 'eu-central-1'}', forcePathStyle=${forcePathStyle}`);

// Serve static client
app.use('/', express.static(path.join(__dirname, 'public')));

// Create presigned upload URL (PUT)
app.post('/presign-upload', async (req, res) => {
  if (!configured) return res.status(500).json({ error: 'Server not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT and BUCKET.' });
  try {
  const { key, contentType } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });

  console.log(`Presign upload for bucket='${BUCKET_NAME}' key='${key}'`);
  const put = new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key, ContentType: contentType || mime.lookup(key) || 'application/octet-stream' });
  const url = await getSignedUrl(s3Client, put, { expiresIn: 3600 });
  console.log('Presigned upload URL:', url);
  res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// Create presigned download URL (GET)
app.post('/presign-download', async (req, res) => {
  if (!configured) return res.status(500).json({ error: 'Server not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT and BUCKET.' });
  try {
  const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });

  console.log(`Presign download for bucket='${BUCKET_NAME}' key='${key}'`);
  const get = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  const url = await getSignedUrl(s3Client, get, { expiresIn: 3600 });
  console.log('Presigned download URL:', url);
  res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// List objects in bucket (simple)
app.get('/list', async (req, res) => {
  if (!configured) return res.status(500).json({ error: 'Server not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_ENDPOINT and BUCKET.' });
  try {
  console.log(`Listing objects from bucket='${BUCKET_NAME}'`);
  const cmd = new ListObjectsV2Command({ Bucket: BUCKET_NAME, MaxKeys: 1000 });
    const data = await s3Client.send(cmd);
    const items = (data.Contents || []).map(o => ({ Key: o.Key, Size: o.Size, LastModified: o.LastModified }));
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

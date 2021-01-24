require('dotenv').config()
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const s3 = new S3Client()
const stats = require('./api/index')
const langs = require('./api/top-langs')

const saveToS3 = async (path, svg) => {
  const bucket = process.env.AWS_BUCKET_NAME
  const obj = {
    Bucket: bucket,
    Key: path,
    Body: svg,
    ContentType: "image/svg+xml"
  }

  try {
    await s3.send(new PutObjectCommand(obj))
    console.log(`Successfully uploaded to ${bucket}/${path}`)
  }
  catch (err) {
    console.log("Error", err)
  }
}

const statsReq = {
  query: JSON.parse(process.env.STATS)
}
const langsReq = {
  query: JSON.parse(process.env.LANGS)
}

const statsRes = {
  setHeader: (header, value) => true,
  send: (svg) => saveToS3("stats", svg)
}

const langsRes = {
  setHeader: (header, value) => true,
  send: (svg) => saveToS3("langs", svg)
}

console.log(statsReq)
console.log(langsReq)
try{
  stats(statsReq, statsRes)
}
catch (err) {
  console.log(err)
}
try{
  langs(langsReq, langsRes)
}
catch (err) {
  console.log(err)
}


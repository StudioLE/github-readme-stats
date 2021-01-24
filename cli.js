require('dotenv').config()
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const s3 = new S3Client()
const { logger } = require("./src/common/utils");
const stats = require('./api/index')
const langs = require('./api/top-langs')
process.env.NODE_ENV = 'test'

const requiredEnv = [
  "PAT_1", 
  "STATS",
  "LANGS",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_BUCKET_NAME"
];

const missingEnv = requiredEnv.filter(key => !process.env[key])

if(missingEnv.length > 0) {
  logger.error("The following variables must be set in .env:", missingEnv)
  process.exit()
}

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
    logger.log(`Successfully uploaded to ${bucket}/${path}`)
  }
  catch (err) {
    logger.log("Error", err)
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

logger.log(statsReq)
logger.log(langsReq)
try{
  stats(statsReq, statsRes)
}
catch (err) {
  logger.log(err)
}
try{
  langs(langsReq, langsRes)
}
catch (err) {
  logger.log(err)
}


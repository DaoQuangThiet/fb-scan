const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const axios = require('axios');

let allAgruments = {
  AWS_ACCESS_KEY: '',
  AWS_SECRET_KEY: '',
  AWS_BUCKET_NAME: '',
  EXTENSION_UPDATE_TOKEN: '',
  EXTENSION_ID: '',
  KIKI_ENDPOINT: '',
};
process.argv.forEach(function (val, index, array) {
  if (val.includes('=')) {
    val = val.split('=');
    if (allAgruments.hasOwnProperty(val[0])) {
      allAgruments[val[0]] = val[1];
    }
  }
});
Object.keys(allAgruments).map((eachKey) => {
  if (!allAgruments[eachKey]) {
    throw new Error(`Missing ${eachKey}`);
  }
});
console.log(`Current config: `, allAgruments);
console.log('Distributing extension bundle...');
const buildFolder = path.join(__dirname, '..', 'buildZip');
if (!fs.existsSync(buildFolder)) {
  throw new Error('Build folder not exists!');
}
let allFiles = fs.readdirSync(buildFolder);
if (!allFiles || allFiles.length < 1)
  throw new Error('Not found any zip bundle!');
let bundleFile = allFiles[0];
console.log(`Found bundle: ${bundleFile}`);
console.log('Uploading bundle to S3');
let extensionFileName = `kikistore-${makeid(64)}-${new Date().getTime()}.zip`;
console.log(`S3 extensions path: `, extensionFileName);

AWS.config.update({
  accessKeyId: allAgruments.AWS_ACCESS_KEY,
  secretAccessKey: allAgruments.AWS_SECRET_KEY,
  region: 'ap-southeast-1',
});
const S3 = new AWS.S3();
var params = {
  Bucket: allAgruments.AWS_BUCKET_NAME,
  Key: extensionFileName,
  Body: fs.readFileSync(path.join(buildFolder, bundleFile)),
};

let result = S3.upload(params).promise();
result
  .then((res) => {
    let { Location } = res;
    axios
      .put(
        `${allAgruments.KIKI_ENDPOINT}/api/admin/extension/${allAgruments.EXTENSION_ID}/update-download-url`,
        {
          downloadUrl: Location,
          version: process.env.npm_package_version,
        },
        {
          headers: {
            updateToken: allAgruments.EXTENSION_UPDATE_TOKEN,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        throw new Error(err);
      });
  })
  .catch((err) => {
    console.log('Failed to upload file to S3!');
    throw new Error(err);
  });
function makeid(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

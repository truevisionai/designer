const fs = require('fs');
const path = require('path');

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();

const newVersion = `${year}.${month}.${day}`;

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t'), 'utf8');
console.log(`Updated package version in package.json to: ${newVersion}`);

const packageLockJsonPath = path.join(__dirname, 'package-lock.json');
const packageLockJson = require(packageLockJsonPath);

packageLockJson.version = newVersion;

fs.writeFileSync(packageLockJsonPath, JSON.stringify(packageLockJson, null, '\t'), 'utf8');
console.log(`Updated package version in package-lock.json to: ${newVersion}`);

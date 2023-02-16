const crypto = require('crypto');

const firsts = require("./data/first-names.json");
const lasts = require("./data/names.json");
const middles = require("./data/middle-names.json");



const not_null = (data) => (data != null && data != undefined && data != "");
const is_type = (data, type) => (typeof data == type);

const hashsum = (data) => crypto.createHash("md5").update(data).digest("hex");

const randomName = (list) => list[Math.floor(Math.random() * list.length)];
const randomDate = () => new Date( Math.floor(Math.random() * Math.floor(Date.now() / 1000)) * 1000 );
//const randomSex = () => Math.floor(Math.random() * (2 - 1 + 1) + 1) == 1 ? "male" : "female";
const randomSex = () => Math.floor(Math.random() * (2 - 1 + 1) + 1);
const generateUser = () => [ randomName(firsts), randomName(lasts), randomName(middles), randomDate(),  randomSex()];

module.exports = {
  not_null, is_type,
  hashsum,
  generateUser
}
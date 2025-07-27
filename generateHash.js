// generateHash.js
// hash값 확인용
const bcrypt = require("bcrypt");

async function hashPassword() {
  const password = "0000";
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed:", hashed);
}

hashPassword();

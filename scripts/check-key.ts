import dotenv from "dotenv";
dotenv.config({ override: true });

const key = process.env.ANTHROPIC_API_KEY ?? "";
console.log("키 존재:", !!key);
console.log("키 길이:", key.length);
console.log("앞 10자:", key.slice(0, 10));
console.log("뒤 4자:", key.slice(-4));
console.log("'sk-ant-'로 시작?", key.startsWith("sk-ant-"));
console.log("공백 포함?", /\s/.test(key));
console.log("줄바꿈 포함?", /[\r\n]/.test(key));

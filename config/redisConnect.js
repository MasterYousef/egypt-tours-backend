const { createClient } = require("redis");
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
const redisConnect = async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  client.on("connect", () => console.log("redis connection successfully"));
  await client.connect();
};

module.exports = {redisConnect,client}

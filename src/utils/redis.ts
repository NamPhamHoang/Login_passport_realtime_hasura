import redis from "redis";
import { promisify } from "util";
export const client = redis.createClient({
  url: process.env.REDIS_CONNECT_STRING,
});
export const set = promisify(client.set).bind(client);
export const get = promisify(client.get).bind(client);
export const flushAll = promisify(client.flushall).bind(client);

client.on("error", (err) => {
  throw new Error(err.message);
});

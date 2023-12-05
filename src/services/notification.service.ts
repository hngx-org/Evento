import { Server as SocketIoServer, Socket as SocketIoSocket } from "socket.io";
import createSubscriber from "pg-listen"
import "dotenv/config";
import {pgClient} from '../utils/dbClient';


const subscriber = createSubscriber({ connectionString: process.env.DATABASE_URL });
subscriber.notifications.on("new_event", (payload) => {
  console.log("Row added!", payload);
});

subscriber.notifications.on("join_event", (payload) => {
    console.log("Row added!", payload);
  });

subscriber.events.on("error", (error) => {
  console.error("Fatal database connection error:", error);
  process.exit(1);
});

subscriber.notifications.on("error", (error) => {
  console.error("Fatal database notification error:", error);
  process.exit(1);
});

// Start PostgreSQL listener
(async () => {
  await subscriber.connect();
  await subscriber.listenTo("new_event");
})().catch(console.error);
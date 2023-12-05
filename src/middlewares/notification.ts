// postgresMiddleware.js

import { Server as SocketIoServer } from "socket.io";
import { pgClient } from "../utils/dbClient";
import createSubscriber from "pg-listen";
import "dotenv/config";
import prisma from '../utils/prisma';





const pgNotify = (io) => {
   // Connect to PostgreSQL
  pgClient.connect().then(() => {
    console.log("Connected to Postgres");
    const subscriber = createSubscriber({ connectionString: process.env.DATABASE_URL+`?ssl=true` })
    
    subscriber.notifications.on("new_event", (payload) => {
    console.log("Row added!", payload);
    const message = "You have successeffuly created a new event";

    prisma.notification.create({
      data: { 
        userId: payload.userID,
        message: message,
        type: 'EVENT_REGISTRATION',
        read: false,
      },
    }).then((notification) => {
      console.log(notification);

      io.emit("new_event", payload); // Emit the payload to connected clients

   
      // Emit the payload to connected clients
    }).catch((err) => {
      console.error(err);
    })


  
    
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

}).catch((err) => {
  console.error(err);
});
  


  return (req, res, next) => {
    req.io = io; // Make io accessible in routes
    next();
  };
};

export {pgNotify};

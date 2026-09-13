import { app } from "./src/server.js";
import "dotenv/config";
import {connectDB} from "./src/db/db.connection.js";

const PORT = process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
  });
})
.catch((err)=>{
    console.log("Internal server error",err );
})


// app.listen(PORT, () => {
//     console.log(`server is running on http://localhost:${PORT}`);
//   });





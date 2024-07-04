import dotenv from "dotenv";
dotenv.config();
import { connectDb } from "./db/connect.js";
import { app } from "./app.js";

const port = process.env.PORT || 8000;

connectDb()
.then(
    app.listen(port,(req,res)=>{
        console.log(`Listening at http://localhost:${port}`);
    })
)
.catch(
    (err) => console.log("Database connection failed" ,err)
)
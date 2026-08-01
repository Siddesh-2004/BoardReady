import express from "express";
import cors from "cors";


const app = express();

app.use(cors({
    origin:process.env.CORSORIGIN,
    credentials: true,
}));
app.use(express.json({
    limit:"20kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "20kb"
}));
app.use(express.static("public"));



import boardRoutes from "./routes/board.routes.js";
app.use("/api/v2/boards", boardRoutes);


export default app;




import "dotenv/config"; // MUST be first — no exceptions

import connectDB from "./db/index.js";
import app from "./app.js";

const start = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 9000;

        app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);
        });
    } catch (error) {
        console.log("Error starting the server:", error);
    }
};

start();

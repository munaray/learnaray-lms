import { app } from "./app";
import "dotenv/config";
import connectDB from "./utils/db";

const PORT = process.env.PORT || 3001;
// create server
app.listen(PORT, () => {
	console.log(`Server is connected at port ${PORT}`);
	connectDB();
});

import { config } from "dotenv";
import path from "path";

// Load the correct env file for Supabase tests
config({ path: path.resolve(__dirname, ".jest/.env.test") });
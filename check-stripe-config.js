// Quick script to check Stripe configuration
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config();

console.log("\n🔍 Checking Stripe Configuration...\n");

// Check if .env file exists
const envPath = join(__dirname, ".env");
const envExists = existsSync(envPath);

if (!envExists) {
  console.log("❌ .env file NOT FOUND!");
  console.log(`   Expected location: ${envPath}\n`);
  console.log("📝 To fix this:");
  console.log("   1. Create a file named '.env' in the root directory");
  console.log("   2. Add the following content:\n");
  console.log("   STRIPE_SECRET_KEY=sk_test_your_complete_secret_key_here");
  console.log("   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here");
  console.log("   FRONTEND_URL=http://localhost:3000");
  console.log("   PORT=8001");
  console.log("   DEV_MODE=development\n");
} else {
  console.log("✅ .env file exists");
  
  // Try to read it (might fail if it's empty or has issues)
  try {
    const envContent = readFileSync(envPath, "utf8");
    console.log("✅ .env file is readable\n");
    
    // Check for STRIPE_SECRET_KEY
    const hasStripeKey = envContent.includes("STRIPE_SECRET_KEY");
    
    if (hasStripeKey) {
      const lines = envContent.split("\n");
      const stripeLine = lines.find(line => line.startsWith("STRIPE_SECRET_KEY"));
      
      if (stripeLine) {
        const keyValue = stripeLine.split("=")[1]?.trim();
        if (keyValue && keyValue.length > 20) {
          console.log("✅ STRIPE_SECRET_KEY is set");
          console.log(`   Key length: ${keyValue.length} characters`);
          console.log(`   Key starts with: ${keyValue.substring(0, 10)}...`);
        } else {
          console.log("⚠️  STRIPE_SECRET_KEY appears to be empty or too short");
        }
      }
    } else {
      console.log("❌ STRIPE_SECRET_KEY not found in .env file");
    }
  } catch (error) {
    console.log("⚠️  Could not read .env file:", error.message);
  }
}

// Check environment variable
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (stripeKey) {
  console.log("\n✅ STRIPE_SECRET_KEY is loaded in environment");
  console.log(`   Key length: ${stripeKey.length} characters`);
  console.log(`   Key starts with: ${stripeKey.substring(0, 10)}...`);
  
  if (stripeKey.length < 50) {
    console.log("\n⚠️  WARNING: Key seems too short. Make sure you copied the complete key!");
  }
} else {
  console.log("\n❌ STRIPE_SECRET_KEY is NOT loaded in environment");
  console.log("\n💡 Troubleshooting:");
  console.log("   1. Make sure .env file exists in the root directory");
  console.log("   2. Make sure STRIPE_SECRET_KEY is set in .env (no spaces around =)");
  console.log("   3. Restart your server after creating/updating .env");
  console.log("   4. Check that dotenv.config() is called before using process.env");
}

console.log("\n" + "=".repeat(50) + "\n");

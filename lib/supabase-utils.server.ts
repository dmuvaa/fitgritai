// Server-only Supabase utilities
// This file should ONLY be imported from server components or API routes
import "server-only"

import { createClient } from "@/utils/supabase/server"

// Test connection function - SERVER ONLY
export const testSupabaseConnection = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const hasValidCredentials = !!(
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl.startsWith("https://") &&
        !supabaseUrl.includes("placeholder") &&
        !supabaseAnonKey.includes("placeholder")
    )

    if (!hasValidCredentials) {
        return { success: false, error: "Credentials not configured", type: "credentials" }
    }

    try {
        const supabase = await createClient()

        // Check if our required tables exist by trying to query each one
        const requiredTables = [
            "users",
            "weight_logs",
            "meal_logs",
            "activity_logs",
            "mood_logs",
            "chat_messages",
            "user_fitness_profile",
            "personalized_plans",
            "user_goals",
        ]
        const missingTables: string[] = []

        for (const table of requiredTables) {
            try {
                const { error } = await supabase.from(table).select("id").limit(1)
                if (error) {
                    if (error.code === "42P01") {
                        // Table doesn't exist
                        missingTables.push(table)
                    } else if (error.code === "42501") {
                        // Permission denied - table exists but no access (this is actually good for our test)
                        console.log(`✅ Table ${table} exists (permission check passed)`)
                    } else {
                        // Other error
                        console.warn(`⚠️ Error checking table ${table}:`, error.message)
                    }
                } else {
                    console.log(`✅ Table ${table} exists and accessible`)
                }
            } catch (err) {
                console.warn(`⚠️ Error checking table ${table}:`, err)
                missingTables.push(table)
            }
        }

        if (missingTables.length > 0) {
            console.warn("⚠️ Database tables missing:", missingTables)
            return {
                success: false,
                error: `Missing database tables: ${missingTables.join(", ")}`,
                type: "tables",
                missingTables,
            }
        }

        console.log("✅ Supabase connection and database setup successful")
        return { success: true, type: "complete" }
    } catch (err) {
        console.error("❌ Supabase connection error:", err)
        return { success: false, error: "Connection failed", type: "connection" }
    }
}

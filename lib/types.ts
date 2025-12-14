export interface User {
  id: string
  email: string
  name: string
  height: number
  starting_weight: number
  current_weight: number
  goal_weight: number
  created_at: string
  updated_at: string
}

export interface WeightLog {
  id: string
  user_id: string
  weight: number
  date: string
  notes?: string
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  description: string
  calories?: number
  date: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  steps?: number
  workout_type?: string
  duration?: number
  date: string
  notes?: string
  created_at: string
}

export interface MoodLog {
  id: string
  user_id: string
  mood: number
  energy: number
  motivation: number
  date: string
  notes?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  interval_type: "monthly" | "yearly"
  paystack_plan_code?: string
  features?: string[]
  is_active: boolean
  created_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_type: string
  status: "active" | "cancelled" | "past_due" | "trialing"
  paystack_subscription_code?: string
  paystack_customer_code?: string
  current_period_start?: string
  current_period_end?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionTransaction {
  id: string
  user_id: string
  reference: string
  paystack_reference?: string
  amount: number
  currency: string
  plan_type: string
  status: "pending" | "completed" | "failed"
  verified_at?: string
  created_at: string
}

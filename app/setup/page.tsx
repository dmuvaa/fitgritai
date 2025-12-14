import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "@/components/connection-status"
import Link from "next/link"
import { Database, Key, Globe, Terminal, CheckCircle, AlertTriangle, ExternalLink, FileText } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FitGrit AI Setup Guide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow these steps to configure your Supabase database and unlock all features of FitGrit AI.
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-12">
          <ConnectionStatus />
        </div>

        {/* Setup Steps */}
        <div className="space-y-8">
          {/* Step 1: Create Supabase Project */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Create Supabase Project
                </CardTitle>
              </div>
              <CardDescription>Set up your free Supabase account and create a new project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Go to{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      supabase.com <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Sign up for a free account</li>
                  <li>Click "New Project" and choose your organization</li>
                  <li>Enter a project name (e.g., "fitgrit-ai")</li>
                  <li>Set a strong database password</li>
                  <li>Choose a region close to your users</li>
                  <li>Click "Create new project"</li>
                </ol>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Save your database password! You'll need it later.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 2: Get API Keys */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">2</span>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Get Your API Keys
                </CardTitle>
              </div>
              <CardDescription>Copy your project URL and API keys from the Supabase dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    In your Supabase project dashboard, go to <strong>Settings → API</strong>
                  </li>
                  <li>
                    Copy the <strong>Project URL</strong>
                  </li>
                  <li>
                    Copy the <strong>anon public</strong> key
                  </li>
                  <li>
                    Optionally copy the <strong>service_role</strong> key for server operations
                  </li>
                </ol>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded border">
                  <div className="font-medium text-blue-900 mb-1">Project URL</div>
                  <code className="text-xs text-blue-700">https://your-project.supabase.co</code>
                </div>
                <div className="bg-green-50 p-3 rounded border">
                  <div className="font-medium text-green-900 mb-1">Anon Key</div>
                  <code className="text-xs text-green-700">eyJhbGciOiJIUzI1NiIsInR5cCI6...</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Environment Variables */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">3</span>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Configure Environment Variables
                </CardTitle>
              </div>
              <CardDescription>Add your Supabase credentials to your environment variables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm mb-3">
                  Create a <code>.env.local</code> file in your project root and add:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                  <div># Supabase Configuration</div>
                  <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here</div>
                  <div className="mt-2"># Optional: OpenRouter for AI features</div>
                  <div>OPENROUTER_API_KEY=your-openrouter-key-here</div>
                </div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security:</strong> Never commit your <code>.env.local</code> file to version control. Add it
                  to your <code>.gitignore</code>.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 4: Database Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-600">4</span>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Set Up Database Schema
                </CardTitle>
              </div>
              <CardDescription>
                Run the SQL scripts to create all necessary database tables and functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    In your Supabase dashboard, go to <strong>SQL Editor</strong>
                  </li>
                  <li>Create a new query</li>
                  <li>
                    Copy and paste the contents of <code>scripts/setup-database.sql</code>
                  </li>
                  <li>
                    Click <strong>Run</strong> to execute the script
                  </li>
                  <li>
                    Repeat for <code>scripts/setup-exercises-database.sql</code>
                  </li>
                  <li>
                    Optionally run <code>scripts/setup-subscriptions.sql</code> for payment features
                  </li>
                </ol>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded border text-center">
                  <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-blue-900">Main Schema</div>
                  <code className="text-xs text-blue-700">setup-database.sql</code>
                </div>
                <div className="bg-green-50 p-3 rounded border text-center">
                  <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-green-900">Exercises</div>
                  <code className="text-xs text-green-700">setup-exercises-database.sql</code>
                </div>
                <div className="bg-purple-50 p-3 rounded border text-center">
                  <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium text-purple-900">Subscriptions</div>
                  <code className="text-xs text-purple-700">setup-subscriptions.sql</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Test Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle>Test Your Setup</CardTitle>
              </div>
              <CardDescription>Verify that everything is working correctly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Restart your development server</li>
                  <li>Refresh this page and check the connection status above</li>
                  <li>
                    Try creating an account on the{" "}
                    <Link href="/auth" className="text-blue-600 hover:underline">
                      auth page
                    </Link>
                  </li>
                  <li>
                    Access the{" "}
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                      dashboard
                    </Link>{" "}
                    after signing in
                  </li>
                </ol>
              </div>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/auth">Test Authentication</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>Helpful links and documentation for further customization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Documentation</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a
                      href="https://supabase.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Supabase Documentation <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://nextjs.org/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Next.js Documentation <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <Link href="/faq" className="text-blue-600 hover:underline">
                      FitGrit AI FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Support</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link href="/about" className="text-blue-600 hover:underline">
                      About FitGrit AI
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

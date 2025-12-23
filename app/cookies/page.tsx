import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Cookie, Shield, BarChart3, Settings, Mail } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
    title: "Cookie Policy | FitGrit AI",
    description: "Learn about how FitGrit AI uses cookies and similar technologies.",
}

export default function CookiesPage() {
    const lastUpdated = "December 23, 2025"

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="mb-12">
                        <Button variant="ghost" asChild className="mb-6">
                            <Link href="/" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Cookie className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                            <p className="text-xl text-gray-600">How we use cookies and similar technologies</p>
                            <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
                        </div>
                    </div>

                    {/* What Are Cookies */}
                    <Card className="border-0 shadow-lg mb-8">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                            <p className="text-gray-700">
                                Cookies are small text files that are placed on your device when you visit a website. They help websites
                                remember your preferences and understand how you use the site. We use cookies and similar technologies
                                to provide, protect, and improve FitGrit AI.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Types of Cookies */}
                    <Card className="border-0 shadow-lg mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>

                            <div className="space-y-6">
                                {/* Essential Cookies */}
                                <div className="border rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Essential Cookies</h3>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Required</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        These cookies are necessary for the website to function and cannot be disabled. They are usually
                                        set in response to your actions, such as logging in, setting preferences, or filling in forms.
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                                            <li>Authentication and login sessions</li>
                                            <li>Security and fraud prevention</li>
                                            <li>Load balancing and server performance</li>
                                            <li>Remembering your cookie consent preferences</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="border rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Analytics Cookies</h3>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Optional</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        These cookies help us understand how visitors interact with our platform by collecting and
                                        reporting information anonymously. This helps us improve our services and user experience.
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                                            <li>Pages visited and time spent on each page</li>
                                            <li>Features used and interaction patterns</li>
                                            <li>Error tracking and performance monitoring</li>
                                            <li>Understanding how users find and use FitGrit</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Preference Cookies */}
                                <div className="border rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Settings className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Preference Cookies</h3>
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Optional</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        These cookies allow the website to remember choices you make and provide enhanced, personalized
                                        features. They may also be used to provide services you have requested.
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                                            <li>Language and region preferences</li>
                                            <li>Theme and display settings</li>
                                            <li>Remembering your fitness preferences</li>
                                            <li>Notification settings</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Managing Cookies */}
                    <Card className="border-0 shadow-lg mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                                    <p className="text-gray-700 mb-4">
                                        Most web browsers allow you to control cookies through their settings. You can usually find
                                        these settings in the "Options" or "Preferences" menu of your browser. Here are links to
                                        cookie management for popular browsers:
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <a
                                            href="https://support.google.com/chrome/answer/95647"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-700">Chrome</span>
                                        </a>
                                        <a
                                            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-700">Firefox</span>
                                        </a>
                                        <a
                                            href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-700">Safari</span>
                                        </a>
                                        <a
                                            href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-700">Edge</span>
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 m-0">
                                        <strong>Note:</strong> If you disable cookies, some features of FitGrit AI may not function
                                        properly. Essential cookies cannot be disabled as they are necessary for the platform to work.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Third-Party Cookies */}
                    <Card className="border-0 shadow-lg mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
                            <p className="text-gray-700 mb-4">
                                We use the following third-party services that may set cookies on your device:
                            </p>
                            <div className="space-y-3">
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900">Supabase (Authentication)</h4>
                                    <p className="text-gray-600 text-sm">Manages user sessions and authentication</p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900">Payment Providers</h4>
                                    <p className="text-gray-600 text-sm">Secure payment processing for subscriptions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Updates */}
                    <Card className="border-0 shadow-lg mb-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                            <p className="text-gray-700">
                                We may update this Cookie Policy from time to time to reflect changes in our practices or for
                                operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
                                Your continued use of FitGrit AI after any changes indicates your acceptance of the updated policy.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card className="border-0 shadow-lg mb-8">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 m-0">Questions?</h2>
                            </div>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about our use of cookies, please contact us:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 m-0">
                                    <strong>Email:</strong> <a href="mailto:dennis@fitgritai.com" className="text-orange-600">dennis@fitgritai.com</a><br />
                                    <strong>Address:</strong> Nairobi, Kenya
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Policies */}
                    <div className="text-center">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Related Policies</h3>
                                <p className="text-gray-700 mb-6">
                                    For more information about how we handle your data, please review our other policies.
                                </p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <Button asChild className="rounded-xl">
                                        <Link href="/auth">Get Started</Link>
                                    </Button>
                                    <Button variant="outline" asChild className="rounded-xl">
                                        <Link href="/privacy">Privacy Policy</Link>
                                    </Button>
                                    <Button variant="outline" asChild className="rounded-xl">
                                        <Link href="/terms">Terms of Service</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

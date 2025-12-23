import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield, Database, Lock, UserCheck, Mail, Clock, Globe } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy | FitGrit AI",
  description: "Learn how FitGrit AI collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-xl text-gray-600">Your privacy matters to us</p>
              <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
            </div>
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600 text-sm">We are clear about what data we collect and how we use it</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600 text-sm">Your data is protected with industry-standard security measures</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Control</h3>
                <p className="text-gray-600 text-sm">You have control over your personal information and settings</p>
              </CardContent>
            </Card>
          </div>

          {/* Table of Contents */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contents</h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#information-collected" className="text-blue-600 hover:text-blue-700">1. Information We Collect</a>
                <a href="#how-we-use" className="text-blue-600 hover:text-blue-700">2. How We Use Your Information</a>
                <a href="#information-sharing" className="text-blue-600 hover:text-blue-700">3. Information Sharing</a>
                <a href="#data-security" className="text-blue-600 hover:text-blue-700">4. Data Security</a>
                <a href="#your-rights" className="text-blue-600 hover:text-blue-700">5. Your Rights and Choices</a>
                <a href="#cookies" className="text-blue-600 hover:text-blue-700">6. Cookies and Tracking</a>
                <a href="#data-transfers" className="text-blue-600 hover:text-blue-700">7. International Data Transfers</a>
                <a href="#children" className="text-blue-600 hover:text-blue-700">8. Children's Privacy</a>
                <a href="#retention" className="text-blue-600 hover:text-blue-700">9. Data Retention</a>
                <a href="#changes" className="text-blue-600 hover:text-blue-700">10. Changes to This Policy</a>
                <a href="#contact" className="text-blue-600 hover:text-blue-700">11. Contact Us</a>
              </nav>
            </CardContent>
          </Card>

          {/* Privacy Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 prose prose-gray max-w-none">
              <div className="space-y-10">

                {/* 1. Information We Collect */}
                <section id="information-collected">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Information We Collect</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Account Information:</strong> Name, email address, and password when you register</li>
                        <li><strong>Profile Details:</strong> Profile photo, fitness goals, and preferences</li>
                        <li><strong>Health & Fitness Data:</strong> Weight logs, meal descriptions, activity logs, workout records</li>
                        <li><strong>Payment Information:</strong> Processed securely by third-party payment providers (we do not store card details)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Activity Logs:</strong> Pages visited, features used, and interactions</li>
                        <li><strong>Device Information:</strong> Device type, operating system, and browser type</li>
                        <li><strong>Communication Data:</strong> Messages exchanged with our AI coach</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 2. How We Use Your Information */}
                <section id="how-we-use">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Platform Services:</strong> To create and manage your account, process transactions, and provide our core services</li>
                    <li><strong>Personalization:</strong> To provide personalized AI coaching, meal plans, and workout recommendations</li>
                    <li><strong>Communication:</strong> To send you notifications about your progress, account activity, and platform updates</li>
                    <li><strong>Improvement:</strong> To analyze usage patterns and improve our platform features</li>
                    <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms and Conditions</li>
                    <li><strong>Marketing:</strong> To send promotional content about new features (you can opt-out at any time)</li>
                  </ul>
                </section>

                {/* 3. Information Sharing */}
                <section id="information-sharing">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-semibold m-0">
                      ✓ We do NOT sell your personal data to third parties.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">With Service Providers</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Payment processors for handling transactions</li>
                        <li>Cloud hosting providers for data storage</li>
                        <li>AI providers for generating personalized recommendations</li>
                        <li>Communication services for email notifications</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>We may disclose your information if required by law or court order</li>
                        <li>To protect our rights, property, or safety, or that of our users</li>
                        <li>In connection with a merger, acquisition, or sale of assets (users will be notified)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 4. Data Security */}
                <section id="data-security">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Lock className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Data Security</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>We implement industry-standard security measures including encryption, secure servers, and access controls</li>
                    <li>All payment information is processed through secure third-party payment providers</li>
                    <li>We use SSL/TLS encryption to protect data transmission</li>
                    <li>Regular security updates to protect against vulnerabilities</li>
                    <li>We advise users to use strong passwords and be cautious of phishing attempts</li>
                  </ul>
                </section>

                {/* 5. Your Rights and Choices */}
                <section id="your-rights">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                  <div className="grid gap-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Access and Correction</h4>
                      <p className="text-gray-600 text-sm">You can access and update your account information at any time through your profile settings</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Deletion</h4>
                      <p className="text-gray-600 text-sm">You can delete your account and data at any time from your account settings</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Marketing Opt-Out</h4>
                      <p className="text-gray-600 text-sm">Unsubscribe from marketing emails using the link in any promotional email</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Data Portability</h4>
                      <p className="text-gray-600 text-sm">Request a copy of your data by contacting our support team</p>
                    </div>
                  </div>
                </section>

                {/* 6. Cookies and Tracking */}
                <section id="cookies">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Essential Cookies:</strong> Required for platform functionality, authentication, and security</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    You can control cookie preferences through your browser settings. For more details,
                    see our <Link href="/cookies" className="text-orange-600 hover:text-orange-700">Cookie Policy</Link>.
                  </p>
                </section>

                {/* 7. International Data Transfers */}
                <section id="data-transfers">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. International Data Transfers</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>FitGrit AI is based in Kenya, and your data may be stored on servers in other countries</li>
                    <li>We may transfer data to service providers in other countries for processing and storage</li>
                    <li>When we transfer data internationally, we ensure appropriate safeguards are in place</li>
                    <li>By using our platform, you consent to the transfer of your information as described</li>
                  </ul>
                </section>

                {/* 8. Children's Privacy */}
                <section id="children">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-2 text-yellow-800 m-0">
                      <li>FitGrit AI is not intended for users under the age of 18</li>
                      <li>We do not knowingly collect personal information from children</li>
                      <li>If we discover that we have collected information from a child, we will promptly delete it</li>
                      <li>If you believe a child has provided us with personal information, please contact us immediately</li>
                    </ul>
                  </div>
                </section>

                {/* 9. Data Retention */}
                <section id="retention">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">9. Data Retention</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>We retain your personal information for as long as your account is active</li>
                    <li>After account deletion, we may retain certain information for legal compliance (up to 90 days)</li>
                    <li>Payment records are kept as required by tax and financial regulations</li>
                  </ul>
                </section>

                {/* 10. Changes to This Policy */}
                <section id="changes">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>We may update this Privacy Policy from time to time to reflect changes in our practices</li>
                    <li>We will notify you of material changes via email or through a notice on our platform</li>
                    <li>Your continued use of FitGrit AI after changes are posted constitutes acceptance of the updated policy</li>
                    <li>We encourage you to review this policy periodically</li>
                  </ul>
                </section>

                {/* 11. Contact Us */}
                <section id="contact">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">11. Contact Us</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 m-0">
                      <strong>Email:</strong> <a href="mailto:dennis@fitgritai.com" className="text-orange-600">dennis@fitgritai.com</a><br />
                      <strong>Address:</strong> Nairobi, Kenya
                    </p>
                  </div>
                  <p className="text-gray-700 mt-4">
                    We will respond to your inquiry as soon as possible.
                  </p>
                </section>

              </div>
            </CardContent>
          </Card>

          {/* Your Privacy Rights */}
          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h3>
                <p className="text-gray-700 mb-6">
                  You have the right to access, correct, or delete your personal information at any time.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild className="rounded-xl">
                    <Link href="/auth">Get Started</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-xl">
                    <Link href="/terms">Terms of Service</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-xl">
                    <Link href="/cookies">Cookie Policy</Link>
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

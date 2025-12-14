import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield, Database, Globe, Lock, UserCheck, Mail, Clock, Baby, Scale } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy | FitGrit AI",
  description: "Learn how FitGrit AI collects, uses, and protects your personal health and fitness data.",
}

export default function PrivacyPage() {
  const lastUpdated = "December 11, 2024"

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
              <p className="text-xl text-gray-600">Your privacy is as strong as your commitment</p>
              <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contents</h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#data-controller" className="text-blue-600 hover:text-blue-700">1. Data Controller</a>
                <a href="#information-collected" className="text-blue-600 hover:text-blue-700">2. Information We Collect</a>
                <a href="#legal-basis" className="text-blue-600 hover:text-blue-700">3. Legal Basis for Processing</a>
                <a href="#how-we-use" className="text-blue-600 hover:text-blue-700">4. How We Use Your Information</a>
                <a href="#data-sharing" className="text-blue-600 hover:text-blue-700">5. Data Sharing & Third Parties</a>
                <a href="#data-security" className="text-blue-600 hover:text-blue-700">6. Data Security</a>
                <a href="#data-retention" className="text-blue-600 hover:text-blue-700">7. Data Retention</a>
                <a href="#international-transfers" className="text-blue-600 hover:text-blue-700">8. International Data Transfers</a>
                <a href="#your-rights" className="text-blue-600 hover:text-blue-700">9. Your Rights</a>
                <a href="#cookies" className="text-blue-600 hover:text-blue-700">10. Cookies & Tracking</a>
                <a href="#children" className="text-blue-600 hover:text-blue-700">11. Children's Privacy</a>
                <a href="#california" className="text-blue-600 hover:text-blue-700">12. California Privacy Rights</a>
                <a href="#eu-uk" className="text-blue-600 hover:text-blue-700">13. EU/UK Privacy Rights</a>
                <a href="#changes" className="text-blue-600 hover:text-blue-700">14. Changes to This Policy</a>
                <a href="#contact" className="text-blue-600 hover:text-blue-700">15. Contact Us</a>
              </nav>
            </CardContent>
          </Card>

          {/* Privacy Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 prose prose-gray max-w-none">
              <div className="space-y-10">

                {/* 1. Data Controller */}
                <section id="data-controller">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Data Controller</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    FitGrit AI ("we", "us", or "our") is the data controller responsible for your personal data.
                    We are committed to protecting your privacy and handling your data in an open and transparent manner.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p className="text-gray-700 m-0">
                      <strong>Contact:</strong> privacy@fitgrit.ai<br />
                      <strong>Data Protection Inquiries:</strong> dpo@fitgrit.ai
                    </p>
                  </div>
                </section>

                {/* 2. Information We Collect */}
                <section id="information-collected">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. Information We Collect</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Information You Provide</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                        <li><strong>Profile Data:</strong> Height, starting weight, goal weight, age, gender, activity level</li>
                        <li><strong>Health & Fitness Data:</strong> Weight logs, meal descriptions and photos, activity logs, mood ratings, sleep data, workout records</li>
                        <li><strong>AI Conversations:</strong> Messages exchanged with our AI coach</li>
                        <li><strong>Payment Information:</strong> Processed securely by Paystack (we do not store card details)</li>
                        <li><strong>Preferences:</strong> Notification settings, dietary preferences, fitness goals</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Information Collected Automatically</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                        <li><strong>Usage Data:</strong> Features used, time spent, interaction patterns</li>
                        <li><strong>Log Data:</strong> IP address, access times, pages viewed, app crashes</li>
                        <li><strong>Location:</strong> General location (country/region) from IP address only</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 m-0">
                        <strong>Sensitive Health Data:</strong> Weight, nutrition, and fitness data are considered sensitive personal information.
                        We process this data only with your explicit consent to provide our coaching services.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Legal Basis */}
                <section id="legal-basis">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Scale className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. Legal Basis for Processing</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We process your personal data under the following legal bases:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Consent:</strong> For processing health data and sending marketing communications</li>
                    <li><strong>Contract:</strong> To provide the fitness coaching services you've signed up for</li>
                    <li><strong>Legitimate Interest:</strong> To improve our services, prevent fraud, and ensure security</li>
                    <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                  </ul>
                </section>

                {/* 4. How We Use Your Information */}
                <section id="how-we-use">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
                  <div className="grid gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 Core Services</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Provide personalized AI coaching and feedback</li>
                        <li>Track your progress and generate insights</li>
                        <li>Create customized workout and meal plans</li>
                        <li>Send reminder notifications (if enabled)</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Service Improvement</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Improve AI algorithms and recommendations</li>
                        <li>Analyze usage patterns (anonymized)</li>
                        <li>Develop new features based on user needs</li>
                        <li>Conduct research to improve health outcomes</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">🔒 Security & Support</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Authenticate your identity and prevent fraud</li>
                        <li>Provide customer support when requested</li>
                        <li>Send important account and service updates</li>
                        <li>Comply with legal obligations</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 5. Data Sharing */}
                <section id="data-sharing">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing & Third Parties</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-semibold m-0">
                      ✓ We NEVER sell your personal data to third parties.
                    </p>
                  </div>

                  <p className="text-gray-700 mb-4">We share data only with these service providers who help us operate our platform:</p>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Supabase (Database & Authentication)</h4>
                      <p className="text-gray-600 text-sm">Stores account and fitness data securely | EU-US Data Privacy Framework compliant</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">OpenRouter (AI Processing)</h4>
                      <p className="text-gray-600 text-sm">Processes AI coach conversations | Data not used for model training</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Paystack (Payments)</h4>
                      <p className="text-gray-600 text-sm">Processes subscription payments | PCI-DSS compliant</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Resend (Email)</h4>
                      <p className="text-gray-600 text-sm">Sends transactional and notification emails</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mt-4">We may also share data:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations or court orders</li>
                    <li>To protect our rights, privacy, safety, or property</li>
                    <li>In connection with a merger, acquisition, or sale of assets (with notice)</li>
                  </ul>
                </section>

                {/* 6. Data Security */}
                <section id="data-security">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Lock className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Data Security</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Encryption in Transit:</strong> All data transmitted using TLS 1.3</li>
                    <li><strong>Encryption at Rest:</strong> All personal data encrypted using AES-256</li>
                    <li><strong>Access Controls:</strong> Role-based access with principle of least privilege</li>
                    <li><strong>Authentication:</strong> Secure password hashing, optional 2FA</li>
                    <li><strong>Infrastructure:</strong> SOC 2 Type II certified cloud providers</li>
                    <li><strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection</li>
                    <li><strong>Audits:</strong> Regular security assessments and penetration testing</li>
                  </ul>
                </section>

                {/* 7. Data Retention */}
                <section id="data-retention">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. Data Retention</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Active Accounts</h4>
                      <p className="text-gray-600">Data retained while your account is active</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">After Account Deletion</h4>
                      <p className="text-gray-600">Personal data deleted within 30 days; anonymized analytics may be retained</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Inactive Accounts</h4>
                      <p className="text-gray-600">Accounts inactive for 24 months may be deleted with prior notice</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Legal Requirements</h4>
                      <p className="text-gray-600">Some data may be retained longer if required by law (e.g., payment records for 7 years)</p>
                    </div>
                  </div>
                </section>

                {/* 8. International Transfers */}
                <section id="international-transfers">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">8. International Data Transfers</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Your data may be processed in countries outside your residence. We ensure adequate protection through:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>EU-US Data Privacy Framework certification</li>
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Binding Corporate Rules where applicable</li>
                    <li>Adequacy decisions for data transfers to approved countries</li>
                  </ul>
                </section>

                {/* 9. Your Rights */}
                <section id="your-rights">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your data:</p>
                  <div className="grid gap-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Access</h4>
                      <p className="text-gray-600 text-sm">Request a copy of all personal data we hold about you</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Rectification</h4>
                      <p className="text-gray-600 text-sm">Correct any inaccurate or incomplete data</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Erasure ("Right to be Forgotten")</h4>
                      <p className="text-gray-600 text-sm">Request deletion of your personal data</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Data Portability</h4>
                      <p className="text-gray-600 text-sm">Receive your data in a structured, machine-readable format</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Restrict Processing</h4>
                      <p className="text-gray-600 text-sm">Limit how we use your data in certain circumstances</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Object</h4>
                      <p className="text-gray-600 text-sm">Object to processing based on legitimate interests or direct marketing</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Right to Withdraw Consent</h4>
                      <p className="text-gray-600 text-sm">Withdraw consent at any time without affecting prior processing</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-4">
                    To exercise these rights, email us at <a href="mailto:privacy@fitgrit.ai" className="text-orange-600 hover:text-orange-700">privacy@fitgrit.ai</a>.
                    We will respond within 30 days.
                  </p>
                </section>

                {/* 10. Cookies */}
                <section id="cookies">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies & Tracking Technologies</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">We use cookies and similar technologies for:</p>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                      <p className="text-gray-600 text-sm">Required for authentication, security, and basic functionality. Cannot be disabled.</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                      <p className="text-gray-600 text-sm">Help us understand how users interact with our service. Can be disabled.</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">Preference Cookies</h4>
                      <p className="text-gray-600 text-sm">Remember your settings and preferences. Can be disabled.</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-4">
                    You can manage cookie preferences through your browser settings or our cookie consent banner.
                  </p>
                </section>

                {/* 11. Children's Privacy */}
                <section id="children">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Baby className="h-5 w-5 text-pink-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">11. Children's Privacy (COPPA)</h2>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 m-0">
                      FitGrit AI is not intended for children under 16 years of age. We do not knowingly collect
                      personal information from children under 16. If we discover we have collected data from a child
                      under 16, we will delete it immediately. If you believe we have collected data from a child,
                      please contact us at <a href="mailto:privacy@fitgrit.ai" className="text-red-700 underline">privacy@fitgrit.ai</a>.
                    </p>
                  </div>
                </section>

                {/* 12. California Privacy Rights */}
                <section id="california">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Privacy Rights (CCPA/CPRA)</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    California residents have additional rights under the California Consumer Privacy Act (CCPA) and
                    California Privacy Rights Act (CPRA):
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Right to Know:</strong> What personal information we collect and how we use it</li>
                    <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                    <li><strong>Right to Correct:</strong> Request correction of inaccurate information</li>
                    <li><strong>Right to Opt-Out of Sale:</strong> We do NOT sell personal information</li>
                    <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
                    <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> Limit use of health data to service provision</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    To exercise these rights, contact us at <a href="mailto:privacy@fitgrit.ai" className="text-orange-600">privacy@fitgrit.ai</a> or
                    call our privacy hotline. We may verify your identity before processing your request.
                  </p>
                </section>

                {/* 13. EU/UK Privacy Rights */}
                <section id="eu-uk">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">13. EU/UK Privacy Rights (GDPR)</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you are in the European Economic Area (EEA) or United Kingdom, you have rights under the
                    General Data Protection Regulation (GDPR) including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>All rights listed in Section 9 above</li>
                    <li>Right to lodge a complaint with your local data protection authority</li>
                    <li>Right to be informed about automated decision-making and profiling</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    <strong>Automated Decision-Making:</strong> Our AI coach provides recommendations based on your data.
                    These are suggestions only and do not constitute legally binding decisions. You can request human
                    review of any automated recommendation.
                  </p>
                </section>

                {/* 14. Changes */}
                <section id="changes">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to This Policy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy to reflect changes in our practices or legal requirements.
                    For significant changes, we will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                    <li>Notify you via email at least 30 days before changes take effect</li>
                    <li>Display a prominent notice in the app</li>
                    <li>Update the "Last updated" date at the top of this policy</li>
                    <li>Obtain renewed consent where required by law</li>
                  </ul>
                </section>

                {/* 15. Contact */}
                <section id="contact">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">15. Contact Us</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Questions, concerns, or requests about this Privacy Policy? We're here to help:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 m-0">
                      <strong>Privacy Inquiries:</strong> <a href="mailto:privacy@fitgrit.ai" className="text-orange-600">privacy@fitgrit.ai</a><br />
                      <strong>Data Protection Officer:</strong> <a href="mailto:dpo@fitgrit.ai" className="text-orange-600">dpo@fitgrit.ai</a><br />
                      <strong>General Support:</strong> <a href="mailto:support@fitgrit.ai" className="text-orange-600">support@fitgrit.ai</a>
                    </p>
                  </div>
                  <p className="text-gray-700 mt-4">
                    We aim to respond to all inquiries within 48 hours on business days.
                  </p>
                </section>

              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to start your private journey?</h3>
                <p className="text-gray-700 mb-6">Your data stays secure while you achieve real results.</p>
                <div className="flex gap-4 justify-center">
                  <Button asChild className="rounded-xl">
                    <Link href="/auth">Start Free & Private</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-xl">
                    <Link href="/terms">View Terms</Link>
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

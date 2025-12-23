import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, FileText, AlertTriangle, Scale, Ban, CreditCard, Copyright, Gavel, Mail } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service | FitGrit AI",
  description: "Read the Terms of Service for using FitGrit AI fitness coaching platform.",
}

export default function TermsPage() {
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
              <p className="text-xl text-gray-600">Clear terms for your FitGrit journey</p>
              <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
            </div>
          </div>

          {/* Important Notice */}
          <Card className="border-0 shadow-lg mb-8 bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-orange-800 mb-2">Important Notice</h2>
              <p className="text-orange-700">
                These Terms and Conditions constitute a legally binding agreement between you and FitGrit AI.
                By using our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
            </CardContent>
          </Card>

          {/* Table of Contents */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contents</h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#acceptance" className="text-green-600 hover:text-green-700">1. Acceptance of Terms</a>
                <a href="#account" className="text-green-600 hover:text-green-700">2. Account Registration</a>
                <a href="#responsibilities" className="text-green-600 hover:text-green-700">3. User Responsibilities</a>
                <a href="#medical" className="text-green-600 hover:text-green-700">4. Medical Disclaimer</a>
                <a href="#ai-content" className="text-green-600 hover:text-green-700">5. AI-Generated Content</a>
                <a href="#prohibited" className="text-green-600 hover:text-green-700">6. Prohibited Activities</a>
                <a href="#intellectual-property" className="text-green-600 hover:text-green-700">7. Intellectual Property</a>
                <a href="#payment" className="text-green-600 hover:text-green-700">8. Payment and Fees</a>
                <a href="#liability" className="text-green-600 hover:text-green-700">9. Limitation of Liability</a>
                <a href="#indemnification" className="text-green-600 hover:text-green-700">10. Indemnification</a>
                <a href="#termination" className="text-green-600 hover:text-green-700">11. Termination</a>
                <a href="#disputes" className="text-green-600 hover:text-green-700">12. Dispute Resolution</a>
                <a href="#contact" className="text-green-600 hover:text-green-700">13. Contact Information</a>
              </nav>
            </CardContent>
          </Card>

          {/* Terms Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 prose prose-gray max-w-none">
              <div className="space-y-10">

                {/* 1. Acceptance of Terms */}
                <section id="acceptance">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Acceptance of Terms</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing and using FitGrit AI, you accept and agree to be bound by these Terms and Conditions
                    and our <Link href="/privacy" className="text-orange-600 hover:text-orange-700">Privacy Policy</Link>.
                    If you do not agree to these terms, please do not use our platform.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these terms at any time. Your continued use of the platform after
                    changes are posted constitutes acceptance of the modified terms.
                  </p>
                </section>

                {/* 2. Account Registration */}
                <section id="account">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>To access certain features, you must create an account by providing accurate and complete information</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account</li>
                    <li>You must be at least 18 years old to create an account and use our services</li>
                    <li>You agree to notify us immediately of any unauthorized access to your account</li>
                  </ul>
                </section>

                {/* 3. User Responsibilities */}
                <section id="responsibilities">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You agree to use FitGrit AI only for legitimate fitness and wellness purposes. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Providing accurate health and fitness information for personalized recommendations</li>
                    <li>Using the platform in compliance with all applicable laws and regulations</li>
                    <li>Respecting other users and our support team</li>
                    <li>Not sharing your account access with others</li>
                  </ul>
                </section>

                {/* 4. Medical Disclaimer */}
                <section id="medical">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Medical Disclaimer</h2>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                    <h3 className="text-lg font-bold text-red-800 mb-3">⚠️ Important Health Notice</h3>
                    <div className="space-y-3 text-red-800">
                      <p className="m-0">
                        <strong>FitGrit AI is NOT a medical service.</strong> Our platform provides general wellness and
                        fitness guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                      <p className="m-0">
                        <strong>Always consult qualified healthcare professionals</strong> before starting any weight loss program,
                        changing your diet, beginning an exercise routine, or if you have any health concerns.
                      </p>
                      <p className="m-0">
                        <strong>Seek immediate medical attention</strong> if you experience any adverse health effects.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 5. AI-Generated Content */}
                <section id="ai-content">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. AI-Generated Content</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    FitGrit AI uses artificial intelligence to generate coaching advice, meal plans, and workout recommendations.
                    You acknowledge that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>AI-generated content may contain errors or inaccuracies</li>
                    <li>AI recommendations do not replace advice from qualified professionals</li>
                    <li>You are responsible for evaluating the appropriateness of any AI recommendations</li>
                    <li>We do not guarantee specific health or fitness outcomes</li>
                  </ul>
                </section>

                {/* 6. Prohibited Activities */}
                <section id="prohibited">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Ban className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Prohibited Activities</h2>
                  </div>
                  <p className="text-gray-700 mb-4">You agree NOT to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Create fake or duplicate accounts</li>
                    <li>Submit false or misleading information</li>
                    <li>Harass, threaten, or abuse other users or our team</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use automated tools (bots, scrapers) to access the platform</li>
                    <li>Reverse engineer or attempt to extract our source code</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Use the AI coach for purposes unrelated to fitness and wellness</li>
                  </ul>
                </section>

                {/* 7. Intellectual Property */}
                <section id="intellectual-property">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Copyright className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. Intellectual Property</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>All content, features, and functionality on FitGrit AI are owned by us and protected by intellectual property laws</li>
                    <li>You may not reproduce, distribute, modify, or create derivative works without explicit permission</li>
                    <li>User-generated content remains your property, but you grant us a license to use it on the platform</li>
                    <li>AI-generated content for you is licensed for your personal use only</li>
                  </ul>
                </section>

                {/* 8. Payment and Fees */}
                <section id="payment">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">8. Payment and Fees</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Certain premium features require a paid subscription</li>
                    <li>Payments are processed securely through third-party payment providers (we do not store card details)</li>
                    <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                    <li>All sales are final unless otherwise stated. Refunds are subject to our refund policy</li>
                    <li>We reserve the right to change our fees at any time with reasonable notice</li>
                  </ul>
                </section>

                {/* 9. Limitation of Liability */}
                <section id="liability">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Scale className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">9. Limitation of Liability</h2>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-700 m-0">
                      FitGrit AI is provided "as is" without warranties of any kind, either express or implied.
                    </p>
                    <p className="text-gray-700 mt-3 m-0">
                      We are not liable for any direct, indirect, incidental, or consequential damages arising from
                      your use of the platform.
                    </p>
                    <p className="text-gray-700 mt-3 m-0">
                      We are not responsible for health outcomes, injuries, or losses resulting from following
                      recommendations provided through our platform.
                    </p>
                    <p className="text-gray-700 mt-3 m-0">
                      Our total liability shall not exceed the amount you paid to us in the past 12 months.
                    </p>
                  </div>
                </section>

                {/* 10. Indemnification */}
                <section id="indemnification">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to indemnify and hold FitGrit AI, its officers, directors, employees, and agents
                    harmless from any claims, damages, losses, or expenses arising from:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                    <li>Your use of the platform</li>
                    <li>Your violation of these Terms and Conditions</li>
                    <li>Your violation of any rights of another party</li>
                    <li>Any content you submit through the platform</li>
                  </ul>
                </section>

                {/* 11. Termination */}
                <section id="termination">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion</li>
                    <li>Upon termination, your right to use the platform will immediately cease</li>
                    <li>You may terminate your account at any time from your account settings or by contacting our support team</li>
                    <li>Sections of these terms that by their nature should survive termination shall remain in effect</li>
                  </ul>
                </section>

                {/* 12. Dispute Resolution */}
                <section id="disputes">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Gavel className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">12. Dispute Resolution</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>These Terms and Conditions are governed by the laws of Kenya</li>
                    <li>Any disputes arising from these terms or your use of the platform shall be resolved through binding arbitration in Nairobi, Kenya</li>
                    <li>You waive your right to participate in class action lawsuits or class-wide arbitration</li>
                    <li>If any provision of these terms is found unenforceable, the remaining provisions shall remain in full effect</li>
                  </ul>
                </section>

                {/* 13. Contact Information */}
                <section id="contact">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">13. Contact Information</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions about these Terms and Conditions, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 m-0">
                      <strong>Email:</strong> <a href="mailto:dennis@fitgritai.com" className="text-orange-600">dennis@fitgritai.com</a><br />
                      <strong>Address:</strong> Nairobi, Kenya
                    </p>
                  </div>
                </section>

              </div>
            </CardContent>
          </Card>

          {/* Agreement Acknowledgment */}
          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Agreement Acknowledgment</h3>
                <p className="text-gray-700 mb-6">
                  By using FitGrit AI, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild className="rounded-xl">
                    <Link href="/auth">Get Started</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-xl">
                    <Link href="/privacy">Privacy Policy</Link>
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

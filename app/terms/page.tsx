import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, FileText, AlertTriangle, Scale, Ban, CreditCard, Copyright, Gavel, FileWarning, Mail } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service | FitGrit AI",
  description: "Read the Terms of Service for using FitGrit AI fitness coaching platform.",
}

export default function TermsPage() {
  const lastUpdated = "December 11, 2024"
  const effectiveDate = "December 11, 2024"

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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-600">Clear terms for your FitGrit journey</p>
              <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated} | Effective: {effectiveDate}</p>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contents</h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#agreement" className="text-green-600 hover:text-green-700">1. Agreement to Terms</a>
                <a href="#description" className="text-green-600 hover:text-green-700">2. Description of Service</a>
                <a href="#eligibility" className="text-green-600 hover:text-green-700">3. Eligibility</a>
                <a href="#account" className="text-green-600 hover:text-green-700">4. Account Registration</a>
                <a href="#medical" className="text-green-600 hover:text-green-700">5. Medical Disclaimer</a>
                <a href="#ai-content" className="text-green-600 hover:text-green-700">6. AI-Generated Content</a>
                <a href="#acceptable-use" className="text-green-600 hover:text-green-700">7. Acceptable Use Policy</a>
                <a href="#subscription" className="text-green-600 hover:text-green-700">8. Subscription & Billing</a>
                <a href="#intellectual-property" className="text-green-600 hover:text-green-700">9. Intellectual Property</a>
                <a href="#user-content" className="text-green-600 hover:text-green-700">10. User Content</a>
                <a href="#termination" className="text-green-600 hover:text-green-700">11. Termination</a>
                <a href="#disclaimers" className="text-green-600 hover:text-green-700">12. Disclaimers</a>
                <a href="#liability" className="text-green-600 hover:text-green-700">13. Limitation of Liability</a>
                <a href="#indemnification" className="text-green-600 hover:text-green-700">14. Indemnification</a>
                <a href="#disputes" className="text-green-600 hover:text-green-700">15. Dispute Resolution</a>
                <a href="#governing-law" className="text-green-600 hover:text-green-700">16. Governing Law</a>
                <a href="#changes" className="text-green-600 hover:text-green-700">17. Changes to Terms</a>
                <a href="#miscellaneous" className="text-green-600 hover:text-green-700">18. Miscellaneous</a>
                <a href="#contact" className="text-green-600 hover:text-green-700">19. Contact Information</a>
              </nav>
            </CardContent>
          </Card>

          {/* Terms Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 prose prose-gray max-w-none">
              <div className="space-y-10">

                {/* 1. Agreement to Terms */}
                <section id="agreement">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Agreement to Terms</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing or using FitGrit AI ("Service"), you agree to be bound by these Terms of Service ("Terms")
                    and our <Link href="/privacy" className="text-orange-600 hover:text-orange-700">Privacy Policy</Link>.
                    If you disagree with any part of these terms, you may not access the Service.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms constitute a legally binding agreement between you and FitGrit AI. Please read them carefully
                    before using our Service.
                  </p>
                </section>

                {/* 2. Description of Service */}
                <section id="description">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    FitGrit AI is a comprehensive fitness and weight management platform that provides:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>AI-Powered Coaching:</strong> Personalized guidance using artificial intelligence</li>
                    <li><strong>Progress Tracking:</strong> Tools to log weight, meals, activities, and mood</li>
                    <li><strong>Personalized Plans:</strong> AI-generated workout and meal plans based on your profile</li>
                    <li><strong>Insights & Analytics:</strong> Data-driven feedback on your progress</li>
                    <li><strong>Educational Content:</strong> Exercise guides and nutritional information</li>
                    <li><strong>Community Features:</strong> Optional social features (if enabled)</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    The Service is available via web application and mobile applications for iOS and Android.
                  </p>
                </section>

                {/* 3. Eligibility */}
                <section id="eligibility">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">To use FitGrit AI, you must:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Be at least 16 years of age (or the age of majority in your jurisdiction)</li>
                    <li>Have the legal capacity to enter into a binding agreement</li>
                    <li>Not be prohibited from using the Service under applicable laws</li>
                    <li>Provide accurate and complete registration information</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 m-0">
                      <strong>Parental Consent:</strong> Users between 16-18 should have parental or guardian consent to use health-related services.
                    </p>
                  </div>
                </section>

                {/* 4. Account Registration */}
                <section id="account">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">When creating an account, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Keep your password confidential and secure</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    You may not share your account credentials, create multiple accounts, or use another person's account
                    without permission.
                  </p>
                </section>

                {/* 5. Medical Disclaimer */}
                <section id="medical">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">5. Medical Disclaimer</h2>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                    <h3 className="text-lg font-bold text-red-800 mb-3">⚠️ Important Health Notice</h3>
                    <div className="space-y-3 text-red-800">
                      <p className="m-0">
                        <strong>FitGrit AI is NOT a medical service.</strong> Our Service provides general wellness guidance
                        and is not a substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                      <p className="m-0">
                        <strong>Always consult qualified healthcare professionals</strong> before starting any weight loss program,
                        changing your diet, beginning an exercise routine, or if you have any health concerns.
                      </p>
                      <p className="m-0">
                        <strong>Seek immediate medical attention</strong> if you experience any adverse health effects,
                        chest pain, difficulty breathing, or other concerning symptoms.
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    By using the Service, you acknowledge that you have consulted with appropriate healthcare professionals
                    and that participation in fitness activities carries inherent risks.
                  </p>
                </section>

                {/* 6. AI-Generated Content */}
                <section id="ai-content">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileWarning className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. AI-Generated Content Disclaimer</h2>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-purple-800 m-0">
                      FitGrit AI uses artificial intelligence to generate coaching advice, meal plans, workout recommendations,
                      and insights. You acknowledge and agree that:
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>AI Limitations:</strong> AI-generated content may contain errors, inaccuracies, or recommendations that may not be suitable for your specific situation</li>
                    <li><strong>Not Professional Advice:</strong> AI recommendations do not replace advice from qualified nutritionists, personal trainers, or healthcare providers</li>
                    <li><strong>Your Responsibility:</strong> You are responsible for evaluating the appropriateness of any AI-generated recommendations before following them</li>
                    <li><strong>No Guarantees:</strong> We do not guarantee specific health outcomes from following AI recommendations</li>
                    <li><strong>Third-Party AI:</strong> Our AI features are powered by third-party AI models; we are not responsible for their outputs</li>
                  </ul>
                </section>

                {/* 7. Acceptable Use Policy */}
                <section id="acceptable-use">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Ban className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. Acceptable Use Policy</h2>
                  </div>
                  <p className="text-gray-700 mb-4">You agree NOT to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Use the Service for any illegal purpose or in violation of any laws</li>
                    <li>Harass, abuse, threaten, or harm other users or our staff</li>
                    <li>Submit false, misleading, or fraudulent information</li>
                    <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                    <li>Reverse engineer, decompile, or otherwise attempt to extract source code</li>
                    <li>Use automated tools (bots, scrapers) to access the Service</li>
                    <li>Transmit viruses, malware, or other harmful code</li>
                    <li>Interfere with the proper functioning of the Service</li>
                    <li>Use the Service to promote other products or services without permission</li>
                    <li>Create multiple accounts to abuse free trials or promotions</li>
                    <li>Share your account with others or resell access</li>
                    <li>Use the AI coach to generate content unrelated to fitness/health</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Violation of this policy may result in immediate account suspension or termination.
                  </p>
                </section>

                {/* 8. Subscription & Billing */}
                <section id="subscription">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">8. Subscription & Billing</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">8.1 Free Tier</h3>
                      <p className="text-gray-700">
                        We offer a free tier with basic features. No credit card is required to start. Free tier features
                        may be limited and are subject to change.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">8.2 Paid Subscriptions</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Premium features require a paid subscription</li>
                        <li>Subscriptions are billed monthly unless otherwise specified</li>
                        <li>Payment is due at the beginning of each billing cycle</li>
                        <li>All payments are processed securely through Paystack</li>
                        <li>Prices are displayed in your local currency where available</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">8.3 Automatic Renewal</h3>
                      <p className="text-gray-700">
                        Subscriptions automatically renew unless cancelled before the renewal date. You will be charged
                        the then-current subscription price unless you cancel.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">8.4 Cancellation</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>You may cancel your subscription at any time from your account settings</li>
                        <li>Cancellation takes effect at the end of your current billing period</li>
                        <li>You retain access to premium features until the end of the paid period</li>
                        <li>No partial refunds for unused time within a billing period</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">8.5 Refunds</h3>
                      <p className="text-gray-700">
                        Refund requests are evaluated on a case-by-case basis. If you believe you are entitled to a refund,
                        please contact <a href="mailto:billing@fitgrit.ai" className="text-orange-600">billing@fitgrit.ai</a> within
                        7 days of your payment.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">8.6 Price Changes</h3>
                      <p className="text-gray-700">
                        We may change subscription prices with at least 30 days' notice. Price changes will apply to the
                        next billing cycle after the notice period.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 9. Intellectual Property */}
                <section id="intellectual-property">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Copyright className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">9. Intellectual Property</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The Service and its original content, features, and functionality are owned by FitGrit AI and are
                    protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>The FitGrit name, logo, and branding are our trademarks</li>
                    <li>You may not reproduce, distribute, modify, or create derivative works without written permission</li>
                    <li>Exercise guides, educational content, and UI designs are our copyrighted materials</li>
                    <li>AI-generated content for you is licensed for your personal use only</li>
                  </ul>
                </section>

                {/* 10. User Content */}
                <section id="user-content">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. User Content</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    When you submit content to the Service (logs, messages, photos, etc.), you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Retain ownership of your content</li>
                    <li>Grant us a license to use, store, and process your content to provide the Service</li>
                    <li>Represent that you have the right to submit the content</li>
                    <li>Agree not to submit content that infringes others' rights</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    We may use anonymized, aggregated data for research and service improvement purposes.
                  </p>
                </section>

                {/* 11. Termination */}
                <section id="termination">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">By You</h3>
                      <p className="text-gray-700">
                        You may terminate your account at any time by deleting it from your account settings or contacting
                        support. Upon deletion, your data will be handled according to our Privacy Policy.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">By Us</h3>
                      <p className="text-gray-700">
                        We may suspend or terminate your account immediately, without prior notice, if you:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                        <li>Violate these Terms or our Acceptable Use Policy</li>
                        <li>Engage in fraudulent or illegal activity</li>
                        <li>Fail to pay subscription fees when due</li>
                        <li>Create risk or legal exposure for us</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Effect of Termination</h3>
                      <p className="text-gray-700">
                        Upon termination, your right to use the Service immediately ceases. Provisions that should survive
                        termination (such as intellectual property, disclaimers, and liability limitations) will continue to apply.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 12. Disclaimers */}
                <section id="disclaimers">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Disclaimers</h2>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-800 uppercase text-sm font-semibold mb-2">
                      PLEASE READ CAREFULLY
                    </p>
                    <p className="text-gray-700 m-0">
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS
                      OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                      PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                    </p>
                    <p className="text-gray-700 mt-3 m-0">
                      We do not warrant that: (a) the Service will function uninterrupted, secure, or available at any
                      particular time or location; (b) any errors or defects will be corrected; (c) the Service is free
                      of viruses or other harmful components; or (d) the results of using the Service will meet your requirements.
                    </p>
                  </div>
                </section>

                {/* 13. Limitation of Liability */}
                <section id="liability">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Scale className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">13. Limitation of Liability</h2>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-700 m-0">
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, FITGRIT AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                      SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                      DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                    <p className="text-gray-700 mt-3 m-0">
                      OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT
                      EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM; OR (B) $100 USD.
                    </p>
                  </div>
                  <p className="text-gray-700 mt-4">
                    Some jurisdictions do not allow limitations on implied warranties or liability. If these laws apply
                    to you, some or all of the above limitations may not apply.
                  </p>
                </section>

                {/* 14. Indemnification */}
                <section id="indemnification">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Indemnification</h2>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to defend, indemnify, and hold harmless FitGrit AI, its officers, directors, employees,
                    and agents from any claims, damages, obligations, losses, liabilities, costs, or debt arising from:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any content you submit to the Service</li>
                  </ul>
                </section>

                {/* 15. Dispute Resolution */}
                <section id="disputes">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Gavel className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">15. Dispute Resolution</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">15.1 Informal Resolution</h3>
                      <p className="text-gray-700">
                        Before filing a formal dispute, you agree to contact us at <a href="mailto:legal@fitgrit.ai" className="text-orange-600">legal@fitgrit.ai</a> to
                        attempt to resolve the dispute informally. We will try to resolve the matter within 60 days.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">15.2 Arbitration Agreement</h3>
                      <p className="text-gray-700">
                        If informal resolution fails, you agree that any dispute will be resolved through binding arbitration,
                        rather than in court, except for claims that may be brought in small claims court.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">15.3 Class Action Waiver</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 m-0">
                          You agree to resolve disputes with us on an individual basis and waive your right to participate
                          in class actions, class arbitrations, or representative actions.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">15.4 Exceptions</h3>
                      <p className="text-gray-700">
                        Either party may seek injunctive relief in court for intellectual property infringement or
                        unauthorized access to the Service.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 16. Governing Law */}
                <section id="governing-law">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Governing Law</h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where
                    FitGrit AI is registered, without regard to its conflict of law provisions. Our failure to enforce
                    any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </section>

                {/* 17. Changes to Terms */}
                <section id="changes">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Changes to Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these Terms at any time. For material changes, we will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                    <li>Provide at least 30 days' notice before changes take effect</li>
                    <li>Notify you via email and/or in-app notification</li>
                    <li>Update the "Last updated" date at the top of these Terms</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Your continued use of the Service after changes take effect constitutes acceptance of the new Terms.
                    If you do not agree to the new terms, you must stop using the Service.
                  </p>
                </section>

                {/* 18. Miscellaneous */}
                <section id="miscellaneous">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Miscellaneous</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Entire Agreement</h3>
                      <p className="text-gray-700">
                        These Terms, together with our Privacy Policy, constitute the entire agreement between you and
                        FitGrit AI regarding the Service.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Severability</h3>
                      <p className="text-gray-700">
                        If any provision of these Terms is found unenforceable, the remaining provisions will continue
                        in full force and effect.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiver</h3>
                      <p className="text-gray-700">
                        No waiver of any term shall be deemed a further or continuing waiver of such term or any other term.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment</h3>
                      <p className="text-gray-700">
                        You may not assign your rights under these Terms. We may assign our rights to an affiliate or
                        successor in connection with a merger, acquisition, or sale of assets.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 19. Contact */}
                <section id="contact">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">19. Contact Information</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Questions about these Terms of Service? Contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 m-0">
                      <strong>Legal Inquiries:</strong> <a href="mailto:legal@fitgrit.ai" className="text-orange-600">legal@fitgrit.ai</a><br />
                      <strong>Billing Support:</strong> <a href="mailto:billing@fitgrit.ai" className="text-orange-600">billing@fitgrit.ai</a><br />
                      <strong>General Support:</strong> <a href="mailto:support@fitgrit.ai" className="text-orange-600">support@fitgrit.ai</a>
                    </p>
                  </div>
                </section>

              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to begin your transformation?</h3>
                <p className="text-gray-700 mb-6">Start your honest weight loss journey today.</p>
                <div className="flex gap-4 justify-center">
                  <Button asChild className="rounded-xl">
                    <Link href="/auth">Accept Terms & Start Free</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-xl">
                    <Link href="/privacy">View Privacy Policy</Link>
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

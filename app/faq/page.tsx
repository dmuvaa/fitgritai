import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "Will FitGrit AI be too harsh?",
          answer:
            "FitGrit AI is firm but never cruel. Our goal is empowering results, not guilt. We deliver honest feedback designed to help you grow, not tear you down.",
        },
        {
          question: "Can I choose gentler support sometimes?",
          answer:
            "Absolutely. Set your coaching style to tough, supportive, or balanced in your settings. The honesty stays consistent, but the delivery adapts to your needs.",
        },
        {
          question: "How is FitGrit different from other weight loss apps?",
          answer:
            "FitGrit AI doesn't sugarcoat reality. While other apps offer empty motivation, we provide actionable insights based on your actual behavior patterns and data.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my data secure?",
          answer:
            "Yes. Your privacy is paramount. All data is fully encrypted at rest and in transit, with anonymous account options available if you prefer complete privacy.",
        },
        {
          question: "Do you sell my data?",
          answer:
            "Never. Your personal information and health data are never sold, shared, or used for advertising. Your journey remains yours alone.",
        },
        {
          question: "Can I delete my account and data?",
          answer:
            "Yes, you can permanently delete your account and all associated data at any time from your settings page.",
        },
      ],
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          question: "How does the AI coach work?",
          answer:
            "FitGrit AI analyzes your logging patterns, identifies trends, and provides personalized feedback. It learns from your successes and setbacks to offer increasingly targeted advice.",
        },
        {
          question: "What can I track with FitGrit?",
          answer:
            "Track weight, meals, physical activity, mood, and energy levels. The more you log, the smarter your AI coach becomes.",
        },
        {
          question: "Does FitGrit work offline?",
          answer:
            "You can log data offline, and it will sync when you reconnect. However, AI coaching requires an internet connection.",
        },
      ],
    },
    {
      category: "Subscription & Billing",
      questions: [
        {
          question: "Is there a free trial?",
          answer:
            "Yes! Start with our free tier to experience FitGrit AI. Upgrade anytime to unlock advanced features and deeper insights.",
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Absolutely. Cancel anytime with no penalties. Your data remains accessible even after cancellation.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards, debit cards, and bank transfers through our secure Paystack integration.",
        },
      ],
    },
    {
      category: "Support & Troubleshooting",
      questions: [
        {
          question: "What if I'm not seeing results?",
          answer:
            "FitGrit AI adapts to your progress. If you're not seeing results, your coach will analyze your patterns and suggest strategic changes. Consistency in logging is key.",
        },
        {
          question: "How do I contact support?",
          answer:
            "Reach out through the in-app support chat, email us at dennis@fitgritai.com, or visit our help center for instant answers.",
        },
        {
          question: "Is FitGrit suitable for medical conditions?",
          answer:
            "FitGrit AI provides general wellness guidance, not medical advice. Always consult healthcare professionals for medical conditions or before starting any weight loss program.",
        },
      ],
    },
  ]

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">Everything you need to know about FitGrit AI</p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <Card key={faqIndex} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
                <p className="text-gray-700 mb-6">Our support team is here to help you succeed.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="rounded-xl">
                    <Link href="/auth">Start Free Trial</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-xl bg-transparent">
                    <Link href="mailto:dennis@fitgritai.com">Contact Support</Link>
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

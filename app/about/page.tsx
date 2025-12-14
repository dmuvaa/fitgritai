import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Target, MessageCircle, TrendingDown, Users, Award, Zap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-3xl font-bold text-white">FG</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About FitGrit AI</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're not another feel-good fitness app. We're the reality check you need to finally achieve lasting
              weight loss results.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                  To cut through the noise of the weight loss industry with brutal honesty, science-backed guidance, and
                  AI-powered accountability that actually works. We believe real change requires real truth - not empty
                  motivation.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What Makes Us Different */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Makes FitGrit AI Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Honest AI Coaching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Our AI doesn't sugarcoat reality. It analyzes your patterns, calls out your excuses, and provides
                    the tough love you need to succeed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Data-Driven Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Every recommendation is based on your actual behavior patterns and progress data, not generic advice
                    that works for nobody.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Relentless Accountability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    We track everything, remember everything, and hold you accountable for everything. No excuses, no
                    exceptions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Our Approach */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Science Over Hype</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Evidence-Based Methods</h4>
                      <p className="text-gray-700">
                        Every strategy is backed by peer-reviewed research, not social media trends.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Behavioral Psychology</h4>
                      <p className="text-gray-700">
                        We understand why you fail and design interventions that actually work.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Personalized Approach</h4>
                      <p className="text-gray-700">Your plan adapts to your life, your struggles, and your progress.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 text-white p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4">The FitGrit Philosophy</h3>
                <blockquote className="text-lg italic mb-4">
                  "Comfort is the enemy of progress. We don't make you feel better about your choices - we make your
                  choices better."
                </blockquote>
                <p className="text-gray-300">
                  We believe that sustainable weight loss comes from facing reality, building systems, and maintaining
                  consistency - not from motivation that fades when life gets hard.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Ready for Real Results?</h2>
                <p className="text-xl mb-6 opacity-90">Stop making excuses. Start making progress.</p>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 rounded-xl text-lg px-8 py-4"
                >
                  <Link href="/auth">Start Your Journey</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

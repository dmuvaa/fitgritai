import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Play, Zap, Target, TrendingUp } from "lucide-react"
import "./global.css"

export default async function HomePage() {
  let user = null
  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user = currentUser
    if (user) redirect("/dashboard")
  } catch {
    // Continue without auth - allow page to render for visitors
  }

  const transformations = [
    {
      name: "MARCUS T.",
      stat: "-47 LBS",
      duration: "12 weeks",
      image: "/fit-muscular-man-portrait-dark-background.jpg",
    },
    {
      name: "SARAH K.",
      stat: "-32 LBS",
      duration: "10 weeks",
      image: "/athletic-woman-fitness-portrait-dark-background.jpg",
    },
    {
      name: "JAMES R.",
      stat: "-55 LBS",
      duration: "16 weeks",
      image: "/strong-man-transformation-portrait-dark-background.jpg",
    },
    {
      name: "ELENA M.",
      stat: "-28 LBS",
      duration: "8 weeks",
      image: "/fit-woman-athlete-portrait-dark-background.jpg",
    },
  ]

  const features = [
    {
      title: "AI THAT LEARNS YOU",
      description: "Your patterns. Your excuses. Your breakthroughs. The AI remembers everything.",
    },
    { title: "NO SUGAR COATING", description: "Real feedback. Real accountability. No participation trophies here." },
    { title: "TRACK EVERYTHING", description: "Weight. Meals. Workouts. Sleep. Mood. One place. Zero friction." },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Accent glow */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left side - Content */}
            <div className="order-2 lg:order-1">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">
                  Now with AI Coach 2.0
                </span>
              </div>

              {/* Main headline - stacked dramatic type */}
              <h1 className="mb-8">
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] text-foreground">
                  YOUR
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] text-foreground">
                  EXCUSES
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] text-primary">
                  END HERE.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
                The AI fitness coach that remembers everything, calls out your BS, and actually gets you results. No
                fluff. No mercy. Just gains.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider h-14 px-8 text-base shadow-[0_0_30px_rgba(163,230,53,0.3)]"
                >
                  <Link href="/auth" className="flex items-center gap-2">
                    Start Free Today
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border hover:border-foreground bg-transparent font-semibold uppercase tracking-wider h-14 px-8 text-base"
                >
                  <Link href="/about" className="flex items-center gap-2">
                    <Play className="h-4 w-4 fill-current" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Social proof strip */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
                  ))}
                </div>
                <div className="text-muted-foreground">
                  <span className="text-foreground font-bold">10,000+</span> athletes already training
                </div>
              </div>
            </div>

            {/* Right side - Visual */}
            <div className="order-1 lg:order-2 relative">
              {/* Stats cards floating */}
              <div className="relative aspect-[4/5] max-w-md mx-auto">
                {/* Main image placeholder */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-border/50">
                  <img
                    src="/intense-athlete-training-gym-dark-dramatic-lightin.jpg"
                    alt="Athlete training"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                {/* Floating stat card - top right */}
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-primary">+127%</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Strength Gains</div>
                    </div>
                  </div>
                </div>

                {/* Floating stat card - bottom left */}
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-foreground">89%</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Goal Completion</div>
                    </div>
                  </div>
                </div>

                {/* Floating badge - mid right */}
                <div className="absolute top-1/2 -right-8 bg-primary text-primary-foreground rounded-lg px-4 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold text-sm uppercase">AI Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 divide-x divide-border">
              {[
                { value: "2.5M+", label: "Pounds Lost" },
                { value: "500K+", label: "Workouts Logged" },
                { value: "4.9★", label: "App Store Rating" },
              ].map((stat, i) => (
                <div key={i} className="py-6 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-primary">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">Real Results</p>
              <h2 className="headline-athletic text-4xl sm:text-5xl lg:text-6xl">Transformations</h2>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium uppercase tracking-wider text-sm"
            >
              View All Stories
              {/* ArrowRight icon is not used here, so it's commented out */}
              {/* <ArrowRight className="h-4 w-4" /> */}
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {transformations.map((person, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={person.image || "/placeholder.svg"}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-2xl sm:text-3xl font-black text-primary">{person.stat}</div>
                  <div className="text-foreground font-bold">{person.name}</div>
                  <div className="text-muted-foreground text-sm">{person.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">Why FitGrit</p>
            <h2 className="headline-athletic text-4xl sm:text-5xl lg:text-6xl mb-4">Built Different</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Most fitness apps coddle you. We don&apos;t. FitGrit AI delivers the tough love you need to actually
              change.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-border rounded hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-black text-xl">0{i + 1}</span>
                </div>
                <h3 className="font-bold text-xl mb-3 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">The Process</p>
              <h2 className="headline-athletic text-4xl sm:text-5xl lg:text-6xl mb-8">
                How It
                <br />
                Works
              </h2>

              <div className="space-y-8">
                {[
                  {
                    num: "01",
                    title: "SET YOUR GOALS",
                    desc: "Tell us where you are and where you want to be. Be honest — we can handle it.",
                  },
                  {
                    num: "02",
                    title: "LOG DAILY",
                    desc: "2 minutes a day. Weight, meals, workouts, mood. The AI learns your patterns.",
                  },
                  {
                    num: "03",
                    title: "GET CALLED OUT",
                    desc: "Your AI coach spots your excuses and gives you specific, actionable next steps.",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-black text-primary/30">{step.num}</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 uppercase tracking-wide">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded overflow-hidden border border-border">
                <img
                  src="/fitness-app-dashboard-mobile-phone-dark-interface.jpg"
                  alt="FitGrit App Interface"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded">
                <div className="text-3xl font-black">89%</div>
                <div className="text-sm font-semibold uppercase tracking-wider">Hit Their Goals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-primary fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-8">
            &ldquo;Finally an app that doesn&apos;t treat me like I&apos;m fragile. The AI coach is tough but fair.
            <span className="text-primary"> Down 47 pounds</span> and counting.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <img
              src="/man-portrait-headshot.jpg"
              alt="Marcus T."
              className="w-14 h-14 rounded-full object-cover border-2 border-primary"
            />
            <div className="text-left">
              <div className="font-bold">MARCUS T.</div>
              <div className="text-muted-foreground text-sm">Lost 47 lbs in 12 weeks</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="headline-athletic text-5xl sm:text-6xl lg:text-7xl mb-6">
            Ready to
            <br />
            <span className="text-primary">transform?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands who stopped making excuses and started seeing results. Your future self will thank you.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider px-12 py-7 text-lg glow-lime"
          >
            <Link href="/auth" className="flex items-center gap-3">
              Start Your Transformation
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">Free to start. No credit card required.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

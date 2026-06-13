import { Link } from 'react-router-dom';
import { Instagram, ArrowRight, Shield, Zap, Globe, Award, Sparkles, CheckCircle, Star } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Share reels in under 15 seconds with automated scheduling' },
  { icon: Shield, title: 'Smart Scheduling', desc: 'Set intervals from 15sec to 6 hours, choose active days' },
  { icon: Globe, title: 'Multi-Group', desc: 'Target multiple Instagram groups simultaneously' },
  { icon: Award, title: 'Analytics', desc: 'Track success rates, daily shares, and group performance' },
];

const stats = [
  { value: '2+', label: 'Active Users' },
  { value: '5+', label: 'Shares Today' },
  { value: '100%', label: 'Uptime' },
  { value: '24/7', label: 'Automation' },
];

const testimonials = [
  { name: 'Samit', city: 'India', text: 'InstaFlow transformed how I share content. Set it and forget it!', rating: 5 },
  { name: 'Priya', city: 'Mumbai', text: 'The scheduling is flawless. My groups get fresh reels every hour.', rating: 5 },
  { name: 'Rahul', city: 'Delhi', text: 'Best automation tool for Instagram. The analytics are incredible.', rating: 5 },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-luxury-900 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(166,255,77,0.04)_0%,transparent_60%)]" />
      <div className="pointer-events-none fixed top-20 left-1/4 w-96 h-96 rounded-full bg-neon/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-20 right-1/4 w-64 h-64 rounded-full bg-gold/5 blur-[100px]" />

      <div className="fixed top-0 left-0 right-0 border-b border-white/[0.06] bg-luxury-900/60 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon/10">
              <Instagram className="h-4 w-4 text-neon" />
            </div>
            <span className="font-bold tracking-tight">InstaFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary text-xs !px-4 !py-2">Get Started</Link>
          </div>
        </div>
      </div>

      <main className="relative pt-24">
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/5 border border-neon/10 mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-neon" />
            <span className="text-xs font-medium text-neon">Premium Instagram Automation</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight animate-fade-in-up">
            Transform Your<br />
            <span className="gradient-text">Instagram Sharing</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Automate reel sharing to your Instagram groups with intelligent scheduling. Set it once, watch it work.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="btn-primary gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="glass-card p-6 text-center animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <p className="stat-value gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle mt-3 mx-auto">Powerful features for seamless Instagram automation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-card-hover p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="mb-4 p-3 rounded-xl bg-neon/10 inline-block">
                    <Icon className="h-6 w-6 text-neon" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="section-title">What Users Say</h2>
            <p className="section-subtitle mt-3 mx-auto">Trusted by content creators worldwide</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neon/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-neon">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-20">
          <div className="glass-card p-12 text-center gradient-border">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Automate?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join InstaFlow and transform your Instagram sharing workflow.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="btn-primary gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-neon" />
              <span className="font-bold">InstaFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium Instagram Automation Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

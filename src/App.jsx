import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { 
  ChevronDown, 
  Download, 
  ExternalLink, 
  Coins, 
  Users, 
  Shield, 
  Zap,
  Star,
  Calendar,
  MessageCircle,
  Twitter,
  Github,
  Globe,
  TrendingUp,
  Lock,
  Sparkles,
  Crown,
  Gift,
  HelpCircle
} from 'lucide-react'
import HVNATokenPurchaseMultiChain from './components/HVNATokenPurchaseMultiChain.jsx'
// import HVNATokenPurchase from './components/HVNATokenPurchase.jsx' // Old single-chain version
import BoldlyElephunkyPurchase from './components/BoldlyElephunkyPurchase.jsx'
import LiveTokenActivity from './components/LiveTokenActivity.jsx'
import PriceCountdownTimer from './components/PriceCountdownTimer.jsx'
import ROICalculator from './components/ROICalculator.jsx'
import './App.css'

function App() {
  const [currentPhase] = useState({
    name: "Genesis Founders",
    month: 1,
    price: 0.01,
    tokensTarget: 25000000,
    tokensSold: 0,
    nextPrice: 0.05,
    benefits: "30% discount, founder status"
  })
  
  const presalePhases = [
    { phase: "Genesis Founders", months: "Month 1-2", price: 0.01, benefits: "30% discount, founder status", color: "yellow" },
    { phase: "Early Believers", months: "Month 3-4", price: 0.05, benefits: "25% discount, priority access", color: "green" },
    { phase: "Visionary Round", months: "Month 5-6", price: 0.08, benefits: "20% discount, exclusive content", color: "blue" },
    { phase: "Community Round", months: "Month 7-8", price: 0.12, benefits: "15% discount, governance rights", color: "purple" },
    { phase: "Growth Phase", months: "Month 9-10", price: 0.18, benefits: "10% discount, early features", color: "orange" },
    { phase: "Momentum Round", months: "Month 11-12", price: 0.25, benefits: "5% discount, beta access", color: "red" },
    { phase: "Last Opportunity", months: "Final 2 weeks", price: 0.30, benefits: "Final chance, launch preparation", color: "gray" }
  ]

  // Calculate presale progress: $0 raised of $2.75M target = 0% (presale not yet started)
  const presaleProgress = 0

  // Contact form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Newsletter signup state
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Register Interest state
  const [isInterestSubmitting, setIsInterestSubmitting] = useState(false)
  const [interestMessage, setInterestMessage] = useState('')
  const [isInterestDialogOpen, setIsInterestDialogOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle contact form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const formData = new FormData(e.target)
      
      // Encode form data properly for Netlify
      const params = new URLSearchParams()
      for (let [key, value] of formData.entries()) {
        params.append(key, value)
      }
      
      console.log('Submitting form data:', params.toString()) // Debug log
      
      const response = await fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })

      console.log('Response status:', response.status) // Debug log

      if (response.ok) {
        setSubmitMessage('✅ Message sent successfully! We\'ll get back to you soon.')
        e.target.reset()
      } else {
        const responseText = await response.text()
        console.log('Error response:', responseText) // Debug log
        setSubmitMessage('❌ Failed to send message. Please try again.')
      }
    } catch (error) {
      console.log('Network error:', error) // Debug log
      setSubmitMessage('❌ Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle newsletter signup
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setIsNewsletterSubmitting(true)
    setNewsletterMessage('')

    try {
      const formData = new FormData(e.target)
      
      // Encode form data properly for Netlify
      const params = new URLSearchParams()
      for (let [key, value] of formData.entries()) {
        params.append(key, value)
      }
      
      const response = await fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })

      if (response.ok) {
        setNewsletterMessage('✅ Successfully registered! We\'ll notify you when presale launches.')
        e.target.reset()
        setTimeout(() => setIsDialogOpen(false), 2000)
      } else {
        setNewsletterMessage('❌ Failed to register. Please try again.')
      }
    } catch (error) {
      setNewsletterMessage('❌ Network error. Please try again.')
    } finally {
      setIsNewsletterSubmitting(false)
    }
  }

  // Handle register interest submission
  const handleInterestSubmit = async (e) => {
    e.preventDefault()
    setIsInterestSubmitting(true)
    setInterestMessage('')

    try {
      const formData = new FormData(e.target)
      
      // Encode form data properly for Netlify
      const params = new URLSearchParams()
      for (let [key, value] of formData.entries()) {
        params.append(key, value)
      }
      
      const response = await fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })

      if (response.ok) {
        setInterestMessage('🚀 Interest registered! We\'ll notify you when presale launches.')
        e.target.reset()
        setTimeout(() => setIsInterestDialogOpen(false), 2000)
      } else {
        setInterestMessage('❌ Failed to register. Please try again.')
      }
    } catch (error) {
      setInterestMessage('❌ Network error. Please try again.')
    } finally {
      setIsInterestSubmitting(false)
    }
  }

  // Social media links - updated with actual URLs
  const socialLinks = {
    discord: "https://discord.gg/NFTCHAMPION",     // Your Discord server
    twitter: "https://twitter.com/DavidJSIme1",    // Your Twitter handle
    website: "https://havanaelephantbrand.com"     // Your Shopify store
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Live Token Activity Feed - Fixed Right Sidebar */}
      <LiveTokenActivity />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">Havana Elephant</span>
            </div>
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 xl:space-x-6">
              <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">About</button>
              <button onClick={() => scrollToSection('founder')} className="text-gray-300 hover:text-yellow-400 transition-colors text-sm lg:text-base font-semibold">Founder</button>
              <button onClick={() => scrollToSection('tokenomics')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">Tokenomics</button>
              <button onClick={() => scrollToSection('tokens')} className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold text-sm lg:text-base">Buy $HVNA</button>
              <button onClick={() => scrollToSection('nfts')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">NFTs</button>
              <button onClick={() => scrollToSection('boldly-elephunky')} className="text-gray-300 hover:text-orange-400 transition-colors font-semibold text-sm lg:text-base">🔥 Boldly Elephunky</button>
              <button onClick={() => scrollToSection('genesis')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">Buy Genesis</button>
              <button onClick={() => window.open('https://contentlynk.com/beta', '_blank')} className="text-gray-300 hover:text-purple-400 transition-colors font-semibold text-sm lg:text-base">🎯 Creator Beta</button>
              <button onClick={() => window.open('/whitepaper.html', '_blank')} className="text-gray-300 hover:text-yellow-400 transition-colors text-sm lg:text-base">Whitepaper</button>
              <button onClick={() => scrollToSection('roadmap')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">Roadmap</button>
              <button onClick={() => scrollToSection('community')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">Community</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">FAQ</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">Contact</button>
              <button onClick={() => scrollToSection('legal')} className="text-gray-300 hover:text-white transition-colors text-sm lg:text-base">Legal</button>
            </div>
            <div className="flex items-center space-x-2 ml-4 lg:ml-6 xl:ml-8">
              {/* Wallet button removed - connection handled in purchase component */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30l15-15v30l-15-15zm-15 0l15 15v-30l-15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          {/* Price Countdown Timer - Top of Hero */}
          <div className="mb-8">
            <PriceCountdownTimer />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold animate-pulse">
                🔥 $HVNA Token Sale LIVE NOW
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Havana Elephant
                </span>
                <br />
                <span className="text-3xl lg:text-4xl text-gray-300">Web3 Ecosystem</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Where Style Meets Blockchain Innovation. Join the revolution with $HVNA tokens, 
                exclusive NFTs, and the future ContentLynk social platform.
              </p>

              {/* Token Presale Phases */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-purple-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">$HVNA Token Presale</h3>
                  <Badge className="bg-green-500 text-white animate-pulse">🔥 LIVE NOW</Badge>
                </div>
                
                {/* Current Phase Highlight */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-400 font-semibold">Starting Price</span>
                    <span className="text-white text-2xl font-bold">${currentPhase.price}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-center text-blue-400 font-semibold mb-2">
                      Ready to Launch: {(currentPhase.tokensTarget / 1000000).toFixed(1)}M tokens
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-green-400 mt-2">
                      🔥 Token sale is LIVE - Buy now!
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400 mb-2">
                      Genesis Founders Benefits:
                    </div>
                    <div className="text-sm text-blue-300 font-semibold mb-2">
                      {currentPhase.benefits}
                    </div>
                    <div className="text-sm text-green-400">
                      Token sale is LIVE! Genesis NFT holders get 30% discount - Buy now!
                    </div>
                  </div>
                </div>


                {/* FOMO Message */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-semibold text-sm">
                    🔥 $HVNA Token Sale is LIVE! Genesis holders get 30% discount!
                  </div>
                  <div className="text-green-300 text-xs mt-1">
                    Buy now at $0.01 per token (Genesis: $0.007) - Start earning rewards immediately
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start relative z-10">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 relative z-20 cursor-pointer"
                  onClick={() => scrollToSection('tokens')}
                  style={{ pointerEvents: 'auto' }}
                >
                  <Coins className="mr-2 h-5 w-5" />
                  Buy $HVNA Tokens
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/20 text-lg px-8 py-6 relative z-20 cursor-pointer"
                  onClick={() => setIsInterestDialogOpen(true)}
                  style={{ pointerEvents: 'auto' }}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Register Interest
                </Button>
                
                {/* Simple Modal Overlay */}
                {isInterestDialogOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-purple-500/20 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-yellow-400">🚀 Register Your Interest</h2>
                          <button 
                            onClick={() => setIsInterestDialogOpen(false)}
                            className="text-gray-400 hover:text-white text-2xl font-bold"
                          >
                            ×
                          </button>
                        </div>
                        
                        <form 
                          className="space-y-4"
                          name="register-interest"
                          method="POST"
                          data-netlify="true"
                          onSubmit={handleInterestSubmit}
                        >
                          <input type="hidden" name="form-name" value="register-interest" />
                          <p style={{display: 'none'}}>
                            <label>Don't fill this out: <input name="bot-field" /></label>
                          </p>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                            <input 
                              type="text" 
                              name="name"
                              className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                              placeholder="Your name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input 
                              type="email" 
                              name="email"
                              className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                              placeholder="your.email@example.com"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Interest Type</label>
                            <select 
                              name="interest-type"
                              className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                              required
                            >
                              <option value="">Select your primary interest</option>
                              <option value="presale">Presale Notification</option>
                              <option value="genesis-nft">Genesis NFT Launch</option>
                              <option value="main-nft">Main NFT Collection</option>
                              <option value="contentlynk">ContentLynk Platform</option>
                              <option value="general">General Updates</option>
                            </select>
                          </div>
                          
                          {interestMessage && (
                            <div className="p-3 rounded-md text-center bg-green-900/20 border border-green-500/30">
                              <p className="text-green-300">{interestMessage}</p>
                            </div>
                          )}
                          
                          <Button 
                            type="submit" 
                            disabled={isInterestSubmitting}
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold disabled:opacity-50"
                          >
                            {isInterestSubmitting ? 'Registering...' : 'Register Interest 🚀'}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/20 text-lg px-8 py-6"
                  onClick={() => window.open('/whitepaper.html', '_blank')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Whitepaper
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">1000+</div>
                  <div className="text-sm text-gray-400">Existing Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">$2.75M</div>
                  <div className="text-sm text-gray-400">Presale Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">100 + 9.9K</div>
                  <div className="text-sm text-gray-400">Genesis + Main NFTs</div>
                </div>
              </div>
            </div>

            {/* Right Column - Bold Statement Text */}
            <div className="relative flex items-center justify-center min-h-[400px]">
              <div className="relative z-10 text-center">
                <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight space-y-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                    Three Live Platforms.
                  </div>
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                    Real Utility.
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Zero Vaporware.
                  </div>
                </h2>
              </div>
              {/* Floating particles effect */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                <div className="absolute top-32 right-16 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
                <div className="absolute bottom-20 left-20 w-5 h-5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-gray-400" />
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">About the Ecosystem</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Havana Elephant Brand is revolutionizing the intersection of fashion, blockchain, 
              and social media with a comprehensive Web3 ecosystem built for the future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <Coins className="h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">$HVNA Token</CardTitle>
                <CardDescription className="text-gray-400">
                  Utility token powering the entire ecosystem with real-world benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• Product discounts up to 30% (tiered)</li>
                  <li>• Governance voting rights</li>
                  <li>• Staking rewards</li>
                  <li>• ContentLynk platform access</li>
                  <li>• €25-10,000 purchase limits</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Boldly Elephunky NFTs</CardTitle>
                <CardDescription className="text-gray-400">
                  10,000 unique NFTs with genuine utility and exclusive benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• Exclusive product access</li>
                  <li>• Custom NFT printing</li>
                  <li>• VIP community access</li>
                  <li>• Brand collaboration opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <Globe className="h-12 w-12 text-pink-400 mb-4" />
                <CardTitle className="text-white">ContentLynk Platform</CardTitle>
                <CardDescription className="text-gray-400">
                  Revolutionary social media platform with fair creator compensation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• Direct creator monetization</li>
                  <li>• Blockchain-verified engagement</li>
                  <li>• Community governance</li>
                  <li>• NFT integration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ROICalculator />
        </div>
      </section>

      {/* Founder Section */}
      <section id="founder" className="py-20 bg-gradient-to-br from-purple-900/30 to-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Meet David Sime</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Building the Positive Side of Blockchain
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Founder Info */}
            <div>
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">🎯 Live Life Big in Style Celebrate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-300">
                  <p>
                    That's not just a tagline—it's a life philosophy born from personal experience. My father died at 48 from a heart attack. My uncle at 42 from cancer. Those losses taught me life's most important lesson: <span className="text-yellow-400 font-semibold">you never know when your time is up</span>, so make every moment count.
                  </p>
                  <p>
                    After reading yet another crypto-negative book focusing on scams, I got frustrated. I'd written three books myself on blockchain—including <em>"Digital Ownership Revolution"</em>—and I kept thinking: Where are the projects actually using this technology to help people?
                  </p>
                  <p className="text-lg font-semibold text-purple-400">
                    So I decided to build one.
                  </p>
                  <p>
                    Instead of just writing about what blockchain could do, I built what it should do: empower creators, support sustainability, and give everyone—regardless of location or wealth—a fair shot at success.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Credentials */}
            <div>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-orange-500/30 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Who I Am</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-300">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">📊</span>
                    <span><strong>Chartered Financial Planner</strong></span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">💼</span>
                    <span><strong>35+ Years</strong> Business Experience</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">📚</span>
                    <span>Author: <a href="https://www.amazon.com/dp/B0FRG3F4WY" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline font-semibold">"Digital Ownership Revolution"</a></span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">🌍</span>
                    <span>Based in <strong>Dubrovnik, Croatia</strong></span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">🔗</span>
                    <span><a href="https://www.linkedin.com/in/davidjsime" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline font-semibold">Connect on LinkedIn</a></span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-purple-500/20">
                    <p className="text-sm text-gray-400 mb-4">Learn more about the founder:</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => window.open('https://contentlynk.com/founder', '_blank')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        Full Founder Story
                      </button>
                      <button
                        onClick={() => window.open('https://havanaelephantbrand.com', '_blank')}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        Visit Fashion Store
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* $HVNA Token Purchase Section */}
      <section id="tokens" className="py-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HVNATokenPurchaseMultiChain />
        </div>
      </section>

      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Tokenomics</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transparent and sustainable token distribution designed for long-term growth
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Token Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Public Presale</span>
                      <span className="text-yellow-400 font-semibold">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Community Treasury</span>
                      <span className="text-purple-400 font-semibold">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">ContentLynk Development</span>
                      <span className="text-pink-400 font-semibold">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Team & Advisors</span>
                      <span className="text-blue-400 font-semibold">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Platform Liquidity</span>
                      <span className="text-green-400 font-semibold">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Other Allocations</span>
                      <span className="text-orange-400 font-semibold">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                    
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Token Details</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Symbol</div>
                      <div className="text-lg font-semibold text-yellow-400">$HVNA</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Supply</div>
                      <div className="text-lg font-semibold">100M</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Presale Price</div>
                      <div className="text-lg font-semibold text-green-400">$0.01</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Blockchain</div>
                      <div className="text-lg font-semibold">Ethereum</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Presale Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="text-green-400 font-semibold text-lg mb-2">
                        🔥 Token Sale LIVE NOW!
                      </div>
                      <div className="text-gray-300 text-sm">
                        Active presale with secure smart contract
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full" style={{width: '15%'}}></div>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                      Genesis NFT holders get 30% discount - Buy tokens now!
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Token Holder Benefits</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>€150+ Holdings</span>
                      <span className="text-green-400 font-semibold">10% Discount</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>€250+ Holdings</span>
                      <span className="text-blue-400 font-semibold">20% Discount</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>€500+ Holdings</span>
                      <span className="text-purple-400 font-semibold">30% Discount</span>
                    </div>
                    <div className="text-sm text-gray-400 pt-2 border-t border-gray-600">
                      Purchase limits: €25 - €10,000 (prevents whales)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Deflationary Mechanisms</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-2">
                    <li>• 2% of product sales → token burn</li>
                    <li>• 50% of NFT royalties → token burn</li>
                    <li>• 30% of ContentLynk revenue → token burn</li>
                    <li>• Quarterly burn events</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Section */}
      <section id="nfts" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">NFT Collections</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              <span className="text-orange-400 font-semibold">🔥 Boldly Elephunky Genesis (LIVE!)</span> - 5 available at 0.25 ETH + 
              <span className="text-yellow-400 font-semibold"> Classic Genesis Collection</span> + 
              <span className="text-purple-400 font-semibold"> 9,900 Future NFTs</span> with tiered benefits
            </p>
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Badge className="bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-bold text-lg px-4 py-2">
                🔥 Boldly Elephunky LIVE
              </Badge>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg px-4 py-2">
                ✅ Classic Genesis Live
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg px-4 py-2">
                ⏳ Main Mint Coming Soon
              </Badge>
            </div>
          </div>

          {/* Genesis Collection Highlight */}
          <div className="mb-12">
            <Card className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400 border-2 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500 text-white font-bold animate-pulse">LIVE NOW</Badge>
              </div>
              <CardHeader className="text-center">
                <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <CardTitle className="text-white text-2xl">🏆 Genesis Elephants</CardTitle>
                <CardDescription className="text-gray-200 text-lg font-semibold">Ultra-Rare Founder Tier - Only 100 Available</CardDescription>
              </CardHeader>
              <CardContent className="text-gray-200">
                <ul className="space-y-3 mb-6">
                  <li>• All Platinum tier benefits (30% discounts)</li>
                  <li>• Exclusive founder governance rights</li>
                  <li>• Priority access to all future drops</li>
                  <li>• Direct brand collaboration opportunities</li>
                  <li>• Lifetime VIP status</li>
                  <li>• Genesis holder exclusive events</li>
                </ul>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg text-center mb-4">
                  <div className="text-2xl font-bold text-black">0.25 - 1.0 ETH</div>
                  <div className="text-sm text-black font-semibold">Genesis Price Range ($625 - $2,500)</div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg"
                  onClick={() => scrollToSection('genesis')}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Purchase Genesis NFT
                </Button>
                <div className="text-center mt-3 text-sm text-gray-400">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Verified collection • Also available on OpenSea
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Collection */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Main Collection (9,900 NFTs)</h3>
            <p className="text-lg text-gray-300">Coming Soon - Traditional Mint Experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-md">
              <CardHeader>
                <Crown className="h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Silver Elephant</CardTitle>
                <CardDescription className="text-gray-300">2,970 NFTs (30% of Main Collection)</CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• 10% product discounts</li>
                  <li>• Quarterly exclusive designs</li>
                  <li>• Community forum access</li>
                  <li>• Basic ContentLynk tools</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">$150</div>
                  <div className="text-sm text-gray-400">Mint Price</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-md">
              <CardHeader>
                <Star className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Gold Elephant</CardTitle>
                <CardDescription className="text-gray-300">4,950 NFTs (50% of Main Collection)</CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• 20% product discounts</li>
                  <li>• Monthly exclusive drops</li>
                  <li>• Design voting rights</li>
                  <li>• Custom NFT printing</li>
                  <li>• Advanced ContentLynk analytics</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">$300</div>
                  <div className="text-sm text-gray-400">Mint Price</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/20 to-red-500/20 border-pink-500/30 backdrop-blur-md">
              <CardHeader>
                <Gift className="h-12 w-12 text-pink-400 mb-4" />
                <CardTitle className="text-white">Platinum Elephant</CardTitle>
                <CardDescription className="text-gray-300">1,980 NFTs (20% of Main Collection)</CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li>• 30% product discounts</li>
                  <li>• Weekly exclusive access</li>
                  <li>• Brand collaboration opportunities</li>
                  <li>• VIP event invitations</li>
                  <li>• Premium ContentLynk features</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-pink-500/20">
                  <div className="text-2xl font-bold text-pink-400">$500</div>
                  <div className="text-sm text-gray-400">Mint Price</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-6"
              onClick={() => scrollToSection('genesis')}
            >
              <Crown className="mr-2 h-5 w-5" />
              Get Genesis NFT Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-500/20 text-lg px-8 py-6"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Join Main Mint Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Boldly Elephunky Genesis Section */}
      <section id="boldly-elephunky" className="py-20 bg-gradient-to-br from-orange-500/20 to-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BoldlyElephunkyPurchase />
        </div>
      </section>

      {/* Genesis section - redirects to Boldly Elephunky */}
      <section id="genesis" className="hidden">
        {/* Anchor for navigation - actual content shown above */}
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Roadmap</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our journey from Web3 integration to social media revolution
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <Card className="flex-1 bg-slate-900/50 border-green-500/30 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Q4 2025 - Foundation ✅</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-1">
                    <li>• Smart contract development and auditing</li>
                    <li>• NFT collection artwork completion</li>
                    <li>• Community building and presale launch</li>
                    <li>• ContentLynk technical specifications</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <Card className="flex-1 bg-slate-900/50 border-yellow-500/30 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Q1 2026 - Launch 🚀</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-1">
                    <li>• NFT collection mint</li>
                    <li>• Web3 integration go-live</li>
                    <li>• Marketing campaign execution</li>
                    <li>• ContentLynk alpha development</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <Card className="flex-1 bg-slate-900/50 border-purple-500/30 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Q2 2026 - Growth</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-1">
                    <li>• Token exchange listing</li>
                    <li>• Advanced loyalty features</li>
                    <li>• Partnership development</li>
                    <li>• Community governance activation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <Card className="flex-1 bg-slate-900/50 border-pink-500/30 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Q3 2026 - ContentLynk Launch</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-1">
                    <li>• ContentLynk public beta launch</li>
                    <li>• Creator onboarding program</li>
                    <li>• Initial advertising marketplace</li>
                    <li>• Mobile app development</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Join Our Community</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with fellow enthusiasts, get updates, and be part of the Web3 revolution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white">Discord</CardTitle>
                <CardDescription className="text-gray-400">
                  Join our active community for discussions and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  onClick={() => window.open(socialLinks.discord, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Discord
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <Twitter className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-white">Twitter</CardTitle>
                <CardDescription className="text-gray-400">
                  Follow us for the latest news and announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-blue-500 text-blue-300 hover:bg-blue-500/20"
                  onClick={() => window.open(socialLinks.twitter, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Follow Us
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-white">Documentation</CardTitle>
                <CardDescription className="text-gray-400">
                  Read our whitepaper and project documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-300 hover:bg-green-500/20"
                  onClick={() => window.open('/whitepaper.html', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Whitepaper
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <Globe className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-white">Website</CardTitle>
                <CardDescription className="text-gray-400">
                  Visit our main brand website and shop
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-300 hover:bg-green-500/20"
                  onClick={() => window.open(socialLinks.website, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Site
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about the Havana Elephant Web3 ecosystem
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* General Web3 Questions */}
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-purple-400" />
                  General Web3 Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="what-is-ecosystem">
                    <AccordionTrigger className="text-white hover:text-purple-300">
                      What is the Havana Elephant Web3 ecosystem?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      We're expanding our beloved elephant-themed brand into the Web3 space by introducing NFTs and the $ELEPHUNK token. This creates a bridge between our physical products and digital ownership, giving you exclusive benefits, discounts, and voting rights on future designs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="need-crypto-knowledge">
                    <AccordionTrigger className="text-white hover:text-purple-300">
                      Do I need to understand cryptocurrency to shop with you?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Not at all! You can continue shopping normally on our website. The Web3 features are completely optional and designed to enhance your experience if you choose to participate.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="blockchain">
                    <AccordionTrigger className="text-white hover:text-purple-300">
                      What blockchain will you be using?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      We're launching on Ethereum mainnet with Polygon Layer 2 integration for lower transaction costs. This ensures security while keeping fees affordable.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* $ELEPHUNK Token Questions */}
            <Card className="bg-slate-900/50 border-yellow-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="h-6 w-6 text-yellow-400" />
                  $ELEPHUNK Token Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="what-is-token">
                    <AccordionTrigger className="text-white hover:text-yellow-300">
                      What is the $ELEPHUNK token?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      $ELEPHUNK is our utility token that gives you special benefits when shopping with us, including discounts, early access to new products, and the ability to vote on future designs.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-to-get-tokens">
                    <AccordionTrigger className="text-white hover:text-yellow-300">
                      How can I get $ELEPHUNK tokens?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      You can participate in our presale starting Q4 2025, or earn tokens through our loyalty program, referrals, and staking rewards once the ecosystem launches.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="token-benefits">
                    <AccordionTrigger className="text-white hover:text-yellow-300">
                      What can I do with $ELEPHUNK tokens?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Get 10-50% discounts on products based on your holdings</li>
                        <li>Access exclusive limited edition drops before everyone else</li>
                        <li>Vote on new product designs and brand decisions</li>
                        <li>Stake tokens to earn additional rewards</li>
                        <li>Receive referral bonuses for bringing friends to the community</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="token-value">
                    <AccordionTrigger className="text-white hover:text-yellow-300">
                      Will the token value go up or down?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Like all cryptocurrencies, $ELEPHUNK's value will fluctuate based on market conditions. However, we've built in deflationary mechanisms including quarterly token burns using 2% of product sales revenue.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="minimum-purchase">
                    <AccordionTrigger className="text-white hover:text-yellow-300">
                      What's the minimum token purchase?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Our €25 minimum ensures you can meaningfully benefit from the ecosystem. Based on our average customer purchases, you'll typically save more than your initial investment within your first few orders through product discounts alone! This threshold helps us build a community of engaged brand enthusiasts rather than short-term speculators, while keeping the barrier low enough for genuine accessibility.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* NFT Collection Questions */}
            <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-pink-400" />
                  NFT Collection Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="boldly-elephunky">
                    <AccordionTrigger className="text-white hover:text-pink-300">
                      What is the "Boldly Elephunky" NFT collection?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      It's a collection of 10,000 unique digital artworks featuring our signature elephant characters. Each NFT provides real utility including product discounts and exclusive access.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="nft-cost">
                    <AccordionTrigger className="text-white hover:text-pink-300">
                      How much will the NFTs cost?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      NFT prices will range from $150-500 depending on the rarity tier (Silver, Gold, or Platinum Elephant).
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="nft-benefits">
                    <AccordionTrigger className="text-white hover:text-pink-300">
                      What benefits do NFT holders get?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <div className="space-y-3">
                        <div>
                          <strong className="text-gray-200">Silver Elephant (30% of collection):</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>10% product discounts</li>
                            <li>Quarterly exclusive designs</li>
                            <li>Community forum access</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-yellow-400">Gold Elephant (50% of collection):</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>25% product discounts</li>
                            <li>Monthly exclusive drops</li>
                            <li>Design voting rights</li>
                            <li>Custom NFT printing on products</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-purple-400">Platinum Elephant (20% of collection):</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>50% product discounts</li>
                            <li>Weekly exclusive access</li>
                            <li>Brand collaboration opportunities</li>
                            <li>Physical merchandise bundles</li>
                            <li>VIP event invitations</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="print-nft">
                    <AccordionTrigger className="text-white hover:text-pink-300">
                      Can I print my NFT on your products?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Yes! Gold and Platinum NFT holders can have their unique NFT artwork printed on select products, creating truly personalized items.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Technical Questions */}
            <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-400" />
                  Technical Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="need-wallet">
                    <AccordionTrigger className="text-white hover:text-blue-300">
                      Do I need a crypto wallet?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Only if you want to participate in the Web3 features. We support popular wallets like MetaMask and WalletConnect. If you just want to shop normally, no wallet is needed.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="connect-wallet">
                    <AccordionTrigger className="text-white hover:text-blue-300">
                      How do I connect my wallet to get discounts?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Simply connect your wallet at checkout, and our system will automatically verify your NFT or token holdings and apply applicable discounts.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-safety">
                    <AccordionTrigger className="text-white hover:text-blue-300">
                      Is my personal information safe?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Absolutely. We're fully GDPR compliant and use minimal data collection. Blockchain participation is optional and can be done anonymously if preferred.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="lost-wallet">
                    <AccordionTrigger className="text-white hover:text-blue-300">
                      What if I lose access to my wallet?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      We recommend backing up your wallet's seed phrase securely. While we can't recover lost wallets, we provide educational resources on wallet security best practices.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Getting Started */}
            <Card className="bg-slate-900/50 border-green-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-6 w-6 text-green-400" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="where-to-start">
                    <AccordionTrigger className="text-white hover:text-green-300">
                      I'm interested but don't know where to start
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Join our Discord community to learn more</li>
                        <li>Follow our social media for updates</li>
                        <li>Consider starting with a small token purchase during presale</li>
                        <li>Attend our educational webinars about Web3 basics</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="learn-more">
                    <AccordionTrigger className="text-white hover:text-green-300">
                      Where can I learn more?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Read our full white paper</li>
                        <li>Join our Discord community</li>
                        <li>Follow us on Twitter</li>
                        <li>Subscribe to our newsletter for updates</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="stay-updated">
                    <AccordionTrigger className="text-white hover:text-green-300">
                      How can I stay updated on the launch?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      Join our Discord, follow our social media, and sign up for our newsletter. We'll announce all major milestones and launch dates across these channels.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>


            {/* Risk Disclaimer */}
            <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge variant="destructive" className="mb-4">
                    Important Disclaimer
                  </Badge>
                  <p className="text-gray-300 text-sm">
                    <strong>Remember:</strong> Cryptocurrency investments carry risk. Never invest more than you can afford to lose, and always do your own research before participating in any Web3 project.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Contact Us</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions about the Havana Elephant ecosystem? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Get in Touch</CardTitle>
                  <CardDescription className="text-gray-400">
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <MessageCircle className="h-8 w-8 text-purple-400" />
                    <div>
                      <div className="text-white font-semibold">Discord Community</div>
                      <div className="text-gray-400">Join our active community for real-time support</div>
                      <Button 
                        variant="link" 
                        className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                        onClick={() => window.open(socialLinks.discord, '_blank')}
                      >
                        discord.gg/NFTCHAMPION
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Twitter className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold">Twitter/X</div>
                      <div className="text-gray-400">Follow us for updates and announcements</div>
                      <Button 
                        variant="link" 
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                        onClick={() => window.open(socialLinks.twitter, '_blank')}
                      >
                        @DavidJSIme1
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Globe className="h-8 w-8 text-green-400" />
                    <div>
                      <div className="text-white font-semibold">Official Website</div>
                      <div className="text-gray-400">Visit our main brand website</div>
                      <Button 
                        variant="link" 
                        className="text-green-400 hover:text-green-300 p-0 h-auto"
                        onClick={() => window.open(socialLinks.website, '_blank')}
                      >
                        havanaelephantbrand.com
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Send Message</CardTitle>
                  <CardDescription className="text-gray-400">
                    Fill out the form below and we'll get back to you soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form 
                    className="space-y-6"
                    name="contact"
                    method="POST"
                    data-netlify="true"
                    onSubmit={handleFormSubmit}
                  >
                    <input type="hidden" name="form-name" value="contact" />
                    <p style={{display: 'none'}}>
                      <label>Don't fill this out: <input name="bot-field" /></label>
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                      <select 
                        name="subject"
                        className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a topic</option>
                        <option value="token">$HVNA Token Questions</option>
                        <option value="nft">NFT Collection Inquiry</option>
                        <option value="contentlynk">ContentLynk Platform</option>
                        <option value="partnership">Partnership Opportunities</option>
                        <option value="support">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                      <textarea 
                        name="message"
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your message..."
                        required
                      ></textarea>
                    </div>
                    
                    {submitMessage && (
                      <div className="p-3 rounded-md text-center">
                        <p className="text-white">{submitMessage}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section id="legal" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Legal Information</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Important compliance and regulatory information about our Web3 services
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-green-400" />
                  About Our Crypto Wallet, NFT, and Token Pre-Sale Services
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Havana Elephant Web3 is a provider of non-custodial cryptocurrency wallet services, facilitating crypto-to-crypto (C2C) transactions, the sale of our exclusive 100-piece NFT collection, and a limited pre-sale of $HVNA tokens. As a non-custodial platform, we do not hold, control, or manage users' private keys or funds. Users retain full control over their private keys and digital assets, including NFTs and tokens purchased via their own wallets.
                </p>
                
                <p>
                  Our NFT collection represents digital collectibles linked to our business, and our $HVNA pre-sale offers utility tokens for future platform access, with all transactions conducted in cryptocurrency. We are committed to compliance with international Anti-Money Laundering (AML) and Know Your Customer (KYC) standards, implementing risk-based measures to ensure transparency and security across our wallet, NFT, and token pre-sale services. We operate in accordance with applicable regulations and align with global best practices.
                </p>

                <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 mt-6">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-400" />
                    Contact Information
                  </h3>
                  <p>
                    For any inquiries, please contact us at: <a href="mailto:nftchampion2024@gmail.com" className="text-purple-400 hover:text-purple-300 underline">nftchampion2024@gmail.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-8 w-8 text-yellow-400" />
                <span className="text-xl font-bold text-white">Havana Elephant</span>
              </div>
              <p className="text-gray-400 mb-4">
                Live Life Big in Style Celebrate - Now in Web3
              </p>
              <div className="flex space-x-4">
                <Twitter 
                  className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" 
                  onClick={() => window.open(socialLinks.twitter, '_blank')}
                />
                <MessageCircle 
                  className="h-5 w-5 text-gray-400 hover:text-purple-400 cursor-pointer" 
                  onClick={() => window.open(socialLinks.discord, '_blank')}
                />
                <Globe 
                  className="h-5 w-5 text-gray-400 hover:text-green-400 cursor-pointer" 
                  onClick={() => window.open(socialLinks.website, '_blank')}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Ecosystem</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">$HVNA Token</a></li>
                <li><a href="#" className="hover:text-white">NFT Collection</a></li>
                <li><a href="https://contentlynk.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">ContentLynk</a></li>
                <li><a href="#" className="hover:text-white">Governance</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">White Paper</a></li>
                <li><a href="#" className="hover:text-white">Audit Report</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white" onClick={() => scrollToSection('contact')}>Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Partnership</a></li>
                <li><a href="#" className="hover:text-white">Press Kit</a></li>
                <li><a href="#legal" className="hover:text-white" onClick={() => scrollToSection('legal')}>Legal</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Havana Elephant Brand. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Shield className="mr-1 h-3 w-3" />
                Audited
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                <Lock className="mr-1 h-3 w-3" />
                Secure
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


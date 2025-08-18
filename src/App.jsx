import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'
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
  Gift
} from 'lucide-react'
import heroImage from './assets/hero_mockup.png'
import './App.css'

function App() {
  const [tokenPrice, setTokenPrice] = useState(0.01)
  const [presaleProgress, setPresaleProgress] = useState(35)
  const [timeLeft, setTimeLeft] = useState({ days: 45, hours: 12, minutes: 30, seconds: 15 })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Social media links - updated with actual URLs
  const socialLinks = {
    discord: "https://discord.gg/NFTCHAMPION",     // Your Discord server
    twitter: "https://twitter.com/DavidJSIme1",    // Your Twitter handle
    website: "https://havanaelephantbrand.com"     // Your Shopify store
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">Havana Elephant</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-white transition-colors">About</button>
              <button onClick={() => scrollToSection('tokenomics')} className="text-gray-300 hover:text-white transition-colors">Tokenomics</button>
              <button onClick={() => scrollToSection('nfts')} className="text-gray-300 hover:text-white transition-colors">NFTs</button>
              <button onClick={() => scrollToSection('roadmap')} className="text-gray-300 hover:text-white transition-colors">Roadmap</button>
              <button onClick={() => scrollToSection('community')} className="text-gray-300 hover:text-white transition-colors">Community</button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                Connect Wallet
              </Button>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                🎉 Presale Now Live
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
                exclusive NFTs, and the future ContentFlow social platform.
              </p>

              {/* Countdown Timer */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Presale Ends In:</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{timeLeft.days}</div>
                    <div className="text-sm text-gray-400">Days</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{timeLeft.hours}</div>
                    <div className="text-sm text-gray-400">Hours</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{timeLeft.minutes}</div>
                    <div className="text-sm text-gray-400">Minutes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{timeLeft.seconds}</div>
                    <div className="text-sm text-gray-400">Seconds</div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold text-lg px-8 py-6"
                >
                  <Coins className="mr-2 h-5 w-5" />
                  Join $HVNA Presale
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/20 text-lg px-8 py-6"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download White Paper
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">1000+</div>
                  <div className="text-sm text-gray-400">Existing Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">$2.5M</div>
                  <div className="text-sm text-gray-400">Presale Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">100 + 9.9K</div>
                  <div className="text-sm text-gray-400">Genesis + Main NFTs</div>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={heroImage} 
                  alt="Havana Elephant Web3 Ecosystem" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
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
                  <li>• ContentFlow platform access</li>
                  <li>• €50-10,000 purchase limits</li>
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
                <CardTitle className="text-white">ContentFlow Platform</CardTitle>
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

      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-20">
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
                      <span className="text-yellow-400 font-semibold">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Liquidity Pool</span>
                      <span className="text-purple-400 font-semibold">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">ContentFlow Development</span>
                      <span className="text-pink-400 font-semibold">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Team & Advisors</span>
                      <span className="text-blue-400 font-semibold">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Marketing</span>
                      <span className="text-green-400 font-semibold">8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Treasury</span>
                      <span className="text-orange-400 font-semibold">7%</span>
                    </div>
                    <Progress value={7} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Development</span>
                      <span className="text-red-400 font-semibold">3%</span>
                    </div>
                    <Progress value={3} className="h-2" />
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
                  <CardTitle className="text-white">Presale Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Raised</span>
                      <span className="text-green-400 font-semibold">$875K / $2.5M</span>
                    </div>
                    <Progress value={presaleProgress} className="h-3" />
                    <div className="text-center text-sm text-gray-400">
                      {presaleProgress}% Complete
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
                      Purchase limits: €50 - €10,000 (prevents whales)
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
                    <li>• 30% of ContentFlow revenue → token burn</li>
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
            <h2 className="text-4xl font-bold text-white mb-6">Boldly Elephunky NFT Collection</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              <span className="text-yellow-400 font-semibold">100 Ultra-Rare Genesis Elephants</span> available now + 
              <span className="text-purple-400 font-semibold"> 9,900 NFT minting opportunities</span> with tiered discounts and exclusive benefits
            </p>
            <div className="flex justify-center items-center space-x-8 mt-6">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg px-4 py-2">
                🔥 Genesis Collection Live
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
                  <div className="text-2xl font-bold text-black">$1,000 - $2,500</div>
                  <div className="text-sm text-black font-semibold">Genesis Price Range</div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Purchase Genesis NFT
                </Button>
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
                  <li>• Basic ContentFlow tools</li>
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
                  <li>• Advanced ContentFlow analytics</li>
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
                  <li>• Premium ContentFlow features</li>
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
                    <li>• ContentFlow technical specifications</li>
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
                    <li>• ContentFlow alpha development</li>
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
                  <CardTitle className="text-white">Q3 2026 - ContentFlow Launch</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-1">
                    <li>• ContentFlow public beta launch</li>
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
                <li><a href="#" className="hover:text-white">ContentFlow</a></li>
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
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
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


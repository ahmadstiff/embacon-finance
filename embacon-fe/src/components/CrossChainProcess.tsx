"use client"

import { Shield, Zap, Globe, Lock, TrendingUp, Network } from "lucide-react"
import Image from "next/image"

export default function CrossChainProcess() {
  const steps = [
    {
      id: 1,
      title: "Deposit Collateral",
      description: "Deposit your assets as collateral on any supported blockchain",
      icon: Lock,
      color: "bg-blue-500",
      chain: "/chain/avax-logo.png"
    },
    {
      id: 2,
      title: "CCIP Cross-Chain Message",
      description: "Chainlink CCIP securely transmits your collateral data across chains",
      icon: Network,
      color: "bg-purple-500",
      chain: "/chainlink.png"
    },
    {
      id: 3,
      title: "Borrow on Any Chain",
      description: "Borrow assets on a different blockchain using your cross-chain collateral",
      icon: TrendingUp,
      color: "bg-green-500",
      chain: "/chain/arbitrum.png"
    },
    {
      id: 4,
      title: "Secure & Verified",
      description: "All transactions are secured by Chainlink's proven cross-chain infrastructure",
      icon: Shield,
      color: "bg-orange-500",
      chain: "/eth2.jpg"
    }
  ]

  const features = [
    {
      title: "Multi-Chain Support",
      description: "Support for Ethereum, Avalance, Arbitrum, and Base",
      icon: Globe,
      chains: ["/eth2.jpg", "/chain/avax-logo.png", "/chain/arbitrum.png", "/chain/base.png"]
    },
    {
      title: "Instant Settlements",
      description: "Fast and efficient cross-chain transactions powered by CCIP",
      icon: Zap,
      chains: ["/chainlink.png"]
    },
    {
      title: "Secure Infrastructure",
      description: "Built on Chainlink's battle-tested cross-chain protocol",
      icon: Shield,
      chains: ["/chainlink.png", "/eth2.jpg"]
    }
  ]

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6 text-glow">
            How Cross-Chain Lending Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience seamless lending and borrowing across multiple blockchains with 
            <span className="text-cyan-400 font-semibold text-glow-cyan"> Chainlink CCIP</span>
          </p>
        </div>

        {/* Process Steps */}
        <div className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                  </div>
                )}
                
                {/* Step Card */}
                <div className="glass rounded-xl p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 h-full flex flex-col hover-lift neon-glow">
                  <div className="text-center flex-1 flex flex-col justify-between">
                    {/* Step Number */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg neon-glow-blue">
                        {step.id}
                      </div>
                    </div>
                    
                    {/* Chain Logo */}
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                      <Image 
                        src={step.chain} 
                        alt={`Chain ${step.id}`}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mx-auto mb-4 neon-glow`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-lg font-semibold text-white mb-2 text-glow">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-white mb-12 text-glow">
            Why Choose Cross-Chain Lending?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass rounded-xl p-8 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 h-full flex flex-col hover-lift neon-glow">
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-6 neon-glow-blue">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-4 text-glow">
                        {feature.title}
                      </h4>
                      
                      <p className="text-gray-300 mb-6">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Chain logos */}
                    <div className="flex justify-center space-x-3">
                      {feature.chains.map((chain, chainIndex) => (
                        <div key={chainIndex} className="w-8 h-8 relative">
                          <Image 
                            src={chain} 
                            alt={`Chain ${chainIndex}`}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

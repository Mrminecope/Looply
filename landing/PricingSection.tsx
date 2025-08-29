import React, { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  Check, 
  Zap, 
  Crown, 
  Rocket, 
  ArrowRight, 
  Sparkles,
  Star,
  Users,
  Video,
  Shield,
  Bot,
  Infinity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';

interface PricingSectionProps {
  onGetStarted: () => void;
  darkMode: boolean;
}

export function PricingSection({ onGetStarted, darkMode }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Free",
      icon: Sparkles,
      description: "Perfect for getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      color: "from-gray-500 to-gray-600",
      borderColor: "border-gray-200 dark:border-gray-700",
      buttonColor: "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600",
      popular: false,
      features: [
        "Up to 5 posts per day",
        "Basic video editing tools",
        "Join unlimited communities",
        "Standard support",
        "2GB storage",
        "Basic LIA assistance"
      ],
      limits: [
        "Watermark on videos",
        "Limited analytics",
        "Basic themes only"
      ]
    },
    {
      name: "Creator",
      icon: Zap,
      description: "For active content creators",
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-300 dark:border-purple-600",
      buttonColor: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
      popular: true,
      features: [
        "Unlimited posts",
        "Advanced video editing",
        "Premium filters & effects",
        "Priority support",
        "50GB storage",
        "Advanced LIA features",
        "Custom themes",
        "Detailed analytics",
        "No watermarks",
        "Collaboration tools"
      ],
      limits: []
    },
    {
      name: "Pro",
      icon: Crown,
      description: "For professional creators & businesses",
      monthlyPrice: 24.99,
      annualPrice: 249.99,
      color: "from-gold-500 to-gold-600",
      borderColor: "border-yellow-300 dark:border-yellow-600",
      buttonColor: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
      popular: false,
      features: [
        "Everything in Creator",
        "White-label options",
        "Advanced moderation tools",
        "Team management",
        "200GB storage",
        "API access",
        "Custom branding",
        "Advanced scheduling",
        "Multi-account management",
        "Dedicated account manager"
      ],
      limits: []
    },
    {
      name: "Enterprise",
      icon: Rocket,
      description: "For large organizations",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      color: "from-pink-500 to-pink-600",
      borderColor: "border-pink-300 dark:border-pink-600",
      buttonColor: "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800",
      popular: false,
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "Custom integrations",
        "Enterprise SSO",
        "Advanced security",
        "Custom SLA",
        "On-premise deployment",
        "24/7 phone support",
        "Custom training",
        "Dedicated infrastructure"
      ],
      limits: []
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (typeof plan.monthlyPrice === 'string') return plan.monthlyPrice;
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (typeof plan.monthlyPrice === 'string') return null;
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.annualPrice;
    return Math.round(savings);
  };

  return (
    <section ref={ref} className="py-20 sm:py-32 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="outline" className="px-4 py-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
              💰 Simple Pricing
            </Badge>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Choose your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              perfect plan
            </span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Start free, upgrade when you're ready. All plans include our core features 
            with no hidden fees or surprises.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl max-w-sm mx-auto"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Save up to 20%
              </Badge>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);
            
            return (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative group ${plan.popular ? 'md:scale-105 z-10' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-semibold">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card className={`p-8 h-full ${plan.borderColor} ${
                  plan.popular 
                    ? 'border-2 shadow-2xl bg-white dark:bg-gray-800' 
                    : 'border shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl'
                } transition-all duration-300 group-hover:scale-[1.02]`}>
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-4 bg-gradient-to-r ${plan.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-1">
                        {typeof price === 'string' ? (
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {price}
                          </span>
                        ) : (
                          <>
                            <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                              {price}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              /{isAnnual ? 'year' : 'month'}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {savings && isAnnual && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                          Save ${savings}/year
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={onGetStarted}
                      className={`w-full py-3 font-semibold rounded-xl ${plan.buttonColor} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {plan.name === 'Free' ? 'Start Free' : 
                       plan.name === 'Enterprise' ? 'Contact Sales' : 
                       `Start ${plan.name}`}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      What's included:
                    </h4>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limits.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="font-medium text-gray-500 dark:text-gray-400 text-sm mb-2">
                          Limitations:
                        </h5>
                        <ul className="space-y-2">
                          {plan.limits.map((limit, limitIndex) => (
                            <li key={limitIndex} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                              {limit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="text-center bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-gray-700"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[
                {
                  question: "Can I change plans anytime?",
                  answer: "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
                },
                {
                  question: "Is there a free trial?",
                  answer: "The Free plan is available forever. You can also try Creator and Pro plans free for 14 days."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "Yes, we offer a 30-day money-back guarantee for all paid plans, no questions asked."
                }
              ].map((faq, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Infinity className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  Still have questions?
                </h4>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our support team is here to help you choose the perfect plan for your needs.
              </p>
              
              <Button
                variant="outline"
                className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
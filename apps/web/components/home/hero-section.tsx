'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Fixed fadeInUp variant - transition should be inside animate
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/Picture1.png')"
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Optional: Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-muted/40" />
      </div>

      {/* Animated Background Elements (kept for extra visual interest) */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10">
        <motion.div
          className="flex flex-col items-center text-center py-24 lg:py-32"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6"
          >
            <span className="gradient-text">
              Kendimle
            </span>
            <br />
            <span className="text-muted-foreground">
              100leşme Yolculuğu
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 leading-relaxed"
          >
            Ben Seda. 100leşme yolculuğunun yazarı, yürüyeni ve en çok da tanığıyım. 
            Bu blog, kendisiyle karşılaşmaya cesaret edenlerin sesi, kaybolduklarında 
            yeniden yön bulanların haritası.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              asChild
              size="lg"
              variant="default"
              className="group btn-hover-lift bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/blog">
                Yazıları Keşfet
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
              className="btn-hover-lift glass backdrop-blur-md"
            >
              <Link href="/about">
                Hakkımda
              </Link>
            </Button>
            
          </motion.div>
                  {/* Personal Quote - Outside the padded container */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex justify-center mt-6"
        >
          <div className="p-6 glass backdrop-blur-md rounded-2xl max-w-2xl">
            <blockquote className="text-lg italic text-center">
              <p>
                "Bu hayat gerçekten benim mi? sorusuyla başlayan bir içsel kalkışma..."
              </p>
              <footer className="text-sm text-muted-foreground">
                — Seda Tokmak
              </footer>
            </blockquote>
          </div>
        </motion.div>
        </motion.div>


      </div>
    </section>
  )
}
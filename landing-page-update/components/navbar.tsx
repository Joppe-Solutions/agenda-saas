"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Precos", href: "#precos" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex items-center justify-between w-full max-w-5xl px-4 py-2.5 rounded-2xl transition-all duration-500 ${
          scrolled
            ? "bg-[#0a1628]/80 backdrop-blur-xl border border-[#162d4d]/80 shadow-lg shadow-black/20"
            : "bg-[#0a1628]/40 backdrop-blur-md border border-[#162d4d]/40"
        }`}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#0ea5e9]/20 group-hover:shadow-[#0ea5e9]/40 transition-shadow duration-300">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h5v5H7v-5z" />
            </svg>
          </div>
          <span
            className="font-semibold text-foreground text-base tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            reserva
            <span className="text-[#0ea5e9]">.online</span>
          </span>
        </a>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-xl hover:bg-[#0ea5e9]/5"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-[#0ea5e9]/5 rounded-xl px-4"
          >
            Entrar
          </Button>
          <Button
            size="sm"
            className="bg-[#0ea5e9] text-white hover:bg-[#38bdf8] rounded-xl px-5 font-medium shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/40 transition-all duration-300"
          >
            Comece Online
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-[#0ea5e9]/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 right-4 mt-2 rounded-2xl bg-[#0a1628]/95 backdrop-blur-xl border border-[#162d4d] shadow-2xl shadow-black/40 md:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-[#0ea5e9]/5 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <hr className="border-[#162d4d] my-2" />
              <Button
                variant="ghost"
                className="justify-start text-muted-foreground hover:text-foreground hover:bg-[#0ea5e9]/5 rounded-xl"
              >
                Entrar
              </Button>
              <Button className="bg-[#0ea5e9] text-white hover:bg-[#38bdf8] rounded-xl font-medium shadow-lg shadow-[#0ea5e9]/20">
                Comece Online
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

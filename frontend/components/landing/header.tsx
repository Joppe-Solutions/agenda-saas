"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const navLinks = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#precos", label: "Preços" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex items-center justify-between w-full max-w-6xl px-6 py-3 rounded-2xl transition-all duration-500 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border border-border shadow-lg shadow-black/5"
            : "bg-white/10 backdrop-blur-md border border-white/20"
        }`}
      >
        <Link href="/" className="flex items-center">
          <Logo variant="full" size="sm" forceTheme={scrolled ? "light" : "dark"} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-xl ${
                scrolled
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className={`rounded-xl px-4 ${
              scrolled 
                ? "" 
                : "text-white hover:text-white hover:bg-white/10"
            }`}
          >
            <Link href="/sign-in">Entrar</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="rounded-xl px-5 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
          >
            <Link href="/sign-up">Começar Grátis</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-lg ${scrolled ? "" : "text-white hover:text-white hover:bg-white/10"}`}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4">
                  <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                    <Logo variant="full" size="sm" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 text-base font-medium text-foreground hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto mb-4 flex flex-col gap-2">
                  <Button variant="ghost" asChild className="justify-start rounded-xl">
                    <Link href="/sign-in" onClick={() => setOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild className="rounded-xl">
                    <Link href="/sign-up" onClick={() => setOpen(false)}>
                      Começar Grátis
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
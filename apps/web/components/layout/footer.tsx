import Link from 'next/link'
import { FOOTER_LINKS, SOCIAL_LINKS, SITE_CONFIG } from '@/lib/constants'
import { Mail, Linkedin, Instagram } from 'lucide-react'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Marka */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-[55px] h-[55px]">
                {/* Light mode logo */}
                <Image
                  src="/images/logo/logo-light.png"
                  alt={SITE_CONFIG.name}
                  width={55}
                  height={55}
                  className="rounded-md transition-opacity duration-300 dark:opacity-0 dark:invisible opacity-100 visible absolute inset-0"
                />
                {/* Dark mode logo */}
                <Image
                  src="/images/logo/logo-dark.png"
                  alt={SITE_CONFIG.name}
                  width={55}
                  height={55}
                  className="rounded-md transition-opacity duration-300 dark:opacity-100 dark:visible opacity-0 invisible absolute inset-0"
                />
              </div>
              <span className="font-bold text-xl gradient-text">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* İçerik Linkleri */}
          <div>
            <h3 className="font-semibold mb-4">İçerik</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.content.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hakkımda Linkleri */}
          <div>
            <h3 className="font-semibold mb-4">Hakkımda</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kaynaklar */}
          <div>
            <h3 className="font-semibold mb-4">Kaynaklar</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 {SITE_CONFIG.name}. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <Link
                href="mailto:100lesmeofficial@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="E-posta"
              >
                <Mail className="h-4 w-4" />
              </Link>

              <Link
                href="https://instagram.com/100_lesmeofficial"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4" />
              </Link>

              <Link
                href="https://www.linkedin.com/company/108661179"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
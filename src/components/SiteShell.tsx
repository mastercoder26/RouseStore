"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import PreLoader from "@/components/animations/PreLoader";
import ThemeSelector from "@/components/ThemeSelector";
import { useStore } from "@/components/StoreProvider";
import styles from "./SiteShell.module.css";

const pages = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/admin", label: "Admin" },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems, openBag } = useStore();
  const reducedMotion = useReducedMotion();

  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/shop/");
    if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/");
    return pathname === href;
  };

  return (
    <div className={styles.shell}>
      <PreLoader />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`site-header ${styles.header}`}>
        <Link className="wordmark" href="/" aria-label="Raider Station home">
          <span className="school-mark"><Image src="/images/rouse-school-mark.jpg" width={60} height={60} alt="" /></span>
          <span>RAIDER<br />STATION</span>
        </Link>
        <nav aria-label="Main navigation">
          {pages.map(page => {
            const active = isCurrent(page.href);
            return (
              <Link key={page.href} href={page.href} aria-current={active ? "page" : undefined}>
                {page.label}
                {active && (
                  <motion.span
                    className={styles.activeLine}
                    layoutId="active-navigation"
                    transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className={styles.headerActions}>
          <ThemeSelector />
          <div className={styles.bag}>
            <Magnetic strength={0.15}>
              <button
                className="bag-button"
                onClick={openBag}
                aria-label={`Open shopping bag, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
              >
                <ShoppingBag size={17} strokeWidth={1.5} />
                <span>Bag</span>
                <span className="bag-count">{totalItems}</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      <main id="main-content" className={styles.main} tabIndex={-1}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <nav aria-label="Footer navigation">
            {pages.map(page => <Link key={page.href} href={page.href}>{page.label}</Link>)}
          </nav>
          <span>© {new Date().getFullYear()} Raider Station · Rouse High School</span>
        </div>
        <Link href="/shop" className={styles.signature} aria-label="Go Raiders — shop Raider Station">
          <span>GO RAIDERS</span>
        </Link>
      </footer>
    </div>
  );
}

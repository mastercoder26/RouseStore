"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import PreLoader from "@/components/animations/PreLoader";
import { useStore } from "@/components/StoreProvider";
import styles from "./SiteShell.module.css";

const pages = [{ href: "/", label: "Home" }, { href: "/shop", label: "The shop" }, { href: "/school", label: "Our school" }];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems, openBag } = useStore();
  const reducedMotion = useReducedMotion();

  return (
    <div className={styles.shell}>
      <PreLoader />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`site-header ${styles.header}`}>
        <Link className="wordmark" href="/" aria-label="Raider Station home">
          <span className="school-mark"><Image src="/images/rouse-school-mark.jpg" width={60} height={60} alt="" /></span>
          <span>RAIDER<br />STATION</span>
        </Link>
        <div className="header-school">Rouse High School<br /><span>Leander, Texas</span></div>
        <nav aria-label="Main navigation">
          {pages.map(page => (
            <Link key={page.href} href={page.href} aria-current={pathname === page.href ? "page" : undefined}>
              {page.label}
              {pathname === page.href && <motion.span className={styles.activeLine} layoutId="active-navigation" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 35 }} />}
            </Link>
          ))}
        </nav>
        <div className={styles.bag}>
          <Magnetic strength={0.15}>
            <button className="bag-button" onClick={openBag} aria-label={`Open shopping bag, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}>
              <ShoppingBag size={18} strokeWidth={1.5} /><span>Bag</span><span className="bag-count">{totalItems}</span>
            </button>
          </Magnetic>
        </div>
      </header>

      <main id="main-content" className={styles.main} tabIndex={-1}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <Link href="/shop" className={styles.signature} aria-label="Shop Raider Station">GO RAIDERS<ArrowUpRight strokeWidth={1} aria-hidden="true" /></Link>
          <nav aria-label="Footer navigation">{pages.map(page => <Link key={page.href} href={page.href}>{page.label}</Link>)}</nav>
        </div>
        <div className={styles.footerDetails}>
          <span>© {new Date().getFullYear()} Raider Station</span>
          <span>Rouse High School / Leander, TX</span>
          <a href="https://www.leanderisd.org/" target="_blank" rel="noreferrer">Leander ISD <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </div>
  );
}

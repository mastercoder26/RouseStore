"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, MessageSquareHeart } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import PreLoader from "@/components/animations/PreLoader";
import ThemeSelector from "@/components/ThemeSelector";
import { useStore } from "@/components/StoreProvider";
import { FeedbackDrawer, ToastNotification } from "@/components/feedback";
import styles from "./SiteShell.module.css";

const customerPages = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems, openBag, openFeedbackDrawer } = useStore();
  const reducedMotion = useReducedMotion();

  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/shop/");
    return pathname === href;
  };

  return (
    <div className={styles.shell}>
      <PreLoader />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Primary Header Navigation */}
      <header className={`site-header ${styles.header}`}>
        <Link
          className={`wordmark ${styles.wordmarkLink}`}
          href="/"
          aria-label="Rouse Station home"
        >
          <Magnetic strength={0.25}>
            <span className="school-mark">
              <Image
                src="/images/rouse-school-mark.jpg"
                width={60}
                height={60}
                alt=""
                priority
              />
            </span>
          </Magnetic>
          <span className={styles.wordmarkGroup}>
            <span className={styles.wordmarkCopyright} aria-hidden="true">
              ©
            </span>
            <span className={styles.wordmarkTrack}>
              <span className={styles.wordmarkRouse}>Rouse</span>
              <span className={styles.wordmarkStation}>Station</span>
            </span>
          </span>
        </Link>

        <nav aria-label="Main customer navigation">
          {customerPages.map((page) => {
            const active = isCurrent(page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={active ? "page" : undefined}
              >
                {page.label}
                {active && (
                  <motion.span
                    className={styles.activeLine}
                    layoutId="active-navigation"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 450, damping: 35 }
                    }
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
                aria-label={`Open shopping bag, ${totalItems} ${
                  totalItems === 1 ? "item" : "items"
                }`}
              >
                <ShoppingBag size={17} strokeWidth={1.5} />
                <span>Bag</span>
                <span className="bag-count">{totalItems}</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>

      {/* Discreet Footer Navigation */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <nav aria-label="Footer navigation">
            {customerPages.map((page) => (
              <Link key={page.href} href={page.href}>
                {page.label}
              </Link>
            ))}
            <Link
              href="https://rouse.leanderisd.net"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rouse High School official portal (opens in new tab)"
            >
              Rouse High School
            </Link>
            <button
              type="button"
              className={styles.footerFeedbackBtn}
              onClick={openFeedbackDrawer}
              aria-label="Open student feedback and grievance drawer"
            >
              <MessageSquareHeart size={14} className={styles.feedbackIcon} />
              <span>Feedback & Grievances</span>
            </button>
            <Link href="/admin" className={styles.adminFooterLink}>
              Staff Admin
            </Link>
          </nav>
          <span className={styles.copyrightText}>
            © {new Date().getFullYear()} Raider Station · Rouse High School
          </span>
        </div>

        <Link
          href="/shop"
          className={styles.signature}
          aria-label="Go Raiders — shop Raider Station"
        >
          <span>GO RAIDERS</span>
        </Link>
      </footer>

      {/* Global Modals & Notifications */}
      <FeedbackDrawer />
      <ToastNotification />
    </div>
  );
}

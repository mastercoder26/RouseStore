"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import PreLoader from "@/components/animations/PreLoader";
import { INTRO_REQUEST_EVENT } from "@/lib/intro";
import ThemeSelector from "@/components/ThemeSelector";
import { useStore } from "@/components/StoreProvider";
import styles from "./SiteShell.module.css";

const subscribeToHydration = () => () => {};
const serverBagCount = () => 0;

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { totalItems, openBag } = useStore();
  const displayedItems = useSyncExternalStore(subscribeToHydration, () => totalItems, serverBagCount);
  const replayHomeIntro = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/" || event.currentTarget.pathname !== "/") return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    window.dispatchEvent(new Event(INTRO_REQUEST_EVENT));
  };

  return (
    <div className={styles.shell}>
      <PreLoader />
      <a className="skip-link" href="#main-content" data-intro-content>Skip to content</a>
      <div className={styles.announcement} role="region" aria-label="Store announcement" data-intro-content>Rouse High School Student Store</div>
      <header className={styles.header} data-intro-content>
        <Link className={styles.wordmark} href="/" onClick={replayHomeIntro} aria-label="Rouse Station home">
          <span className={styles.wordmarkName}>ROUSE</span>
          <span className={styles.wordmarkReveal} aria-hidden="true"><span className={styles.wordmarkStation}>STATION</span></span>
        </Link>
        <nav className={styles.navigation} aria-label="Main customer navigation">
          <Link href="/shop" aria-current={pathname.startsWith("/shop") ? "page" : undefined}>Shop</Link>
          <Link href="/feedback" aria-current={pathname === "/feedback" ? "page" : undefined}>Feedback</Link>
        </nav>
        <button type="button" className={styles.bagButton} onClick={openBag} aria-label={`Open shopping bag, ${displayedItems} ${displayedItems === 1 ? "item" : "items"}`}><ShoppingBag size={17} strokeWidth={1.5} /><span>Bag</span><span className={styles.bagCount}>{displayedItems}</span></button>
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1} data-intro-content>{children}</main>
      <footer className={styles.footer} data-intro-content>
        <div className={styles.footerTop}>
          <div><span className={styles.footerEyebrow}>Rouse High School</span><p>Raider<br /><em>Station</em></p></div>
          <div className={styles.footerLinks}><span>Links</span><Link href="/shop">Shop <ArrowUpRight size={15} /></Link><Link href="/feedback">Feedback <ArrowUpRight size={15} /></Link><a href="https://rhs.leanderisd.org/" target="_blank" rel="noopener noreferrer">Rouse High School <ArrowUpRight size={15} /></a></div>
          <div className={styles.footerAside}><span>Theme</span><ThemeSelector /><Link href="/admin">Staff admin <ArrowUpRight size={13} /></Link></div>
        </div>
        <div className={styles.footerBottom}><span>© {new Date().getFullYear()} Rouse Station</span><span>Demo store · No online checkout</span></div>
      </footer>
    </div>
  );
}

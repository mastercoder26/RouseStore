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
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={styles.announcement} role="region" aria-label="Store announcement" data-intro-content><span>For the school day. And everything after.</span><span aria-hidden="true">Go Raiders ✳</span></div>
      <header className={styles.header} data-intro-content>
        <Link className={styles.wordmark} href="/" onClick={replayHomeIntro} aria-label="Rouse Station home">ROUSE<span>STATION</span></Link>
        <nav className={styles.navigation} aria-label="Main customer navigation">
          <Link href="/shop" aria-current={pathname.startsWith("/shop") ? "page" : undefined}>Shop all</Link>
          <Link className={styles.gearLink} href="/shop?category=Spirit%20Wear">The gear</Link>
          <Link href="/feedback" aria-current={pathname === "/feedback" ? "page" : undefined}>Your say</Link>
        </nav>
        <button type="button" className={styles.bagButton} onClick={openBag} aria-label={`Open shopping bag, ${displayedItems} ${displayedItems === 1 ? "item" : "items"}`}><ShoppingBag size={17} strokeWidth={1.5} /><span>Bag</span><span className={styles.bagCount}>{displayedItems}</span></button>
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1} data-intro-content>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div><span className={styles.footerEyebrow}>Your Rouse. Your station.</span><p>See you around,<br /><em>Raider.</em></p></div>
          <div className={styles.footerLinks}><span>Take a look</span><Link href="/shop">Shop everything <ArrowUpRight size={15} /></Link><Link href="/feedback">Feedback & grievances <ArrowUpRight size={15} /></Link><a href="https://rhs.leanderisd.org/" target="_blank" rel="noopener noreferrer">Rouse High School <ArrowUpRight size={15} /></a></div>
          <div className={styles.footerAside}><span>Make yourself at home.</span><ThemeSelector /><Link href="/admin">Staff admin <ArrowUpRight size={13} /></Link></div>
        </div>
        <Link href="/shop" className={styles.signature} aria-label="Go Raiders — shop Raider Station">GO RAIDERS<span aria-hidden="true">✳</span></Link>
        <div className={styles.footerBottom}><span>© {new Date().getFullYear()} Rouse Station</span><span>Maroon & gold, through and through.</span><span>Demo store · No online checkout</span></div>
      </footer>
    </div>
  );
}

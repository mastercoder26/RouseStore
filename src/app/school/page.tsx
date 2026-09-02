import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TextSlideUp from "@/components/animations/TextSlideUp";
import styles from "./school.module.css";

export const metadata: Metadata = {
  title: "Our school | Raider Station",
  description:
    "Learn about Rouse High School, home of the Raiders in Leander, Texas.",
};

export default function SchoolPage() {
  return (
    <section className={styles.page} aria-labelledby="school-page-title">
      <div className={styles.topline}>
        <span className={styles.eyebrow}>Our school</span>
        <span className={styles.location}>Leander, Texas / 2008</span>
      </div>

      <section className={styles.story}>
        <div className={styles.headingColumn}>
          <p className={styles.overline}>Rouse High School</p>
          <TextSlideUp
            text="Rooted on Raider Way."
            element="h1"
            id="school-page-title"
            className={styles.title}
            delay={120}
          />
          <p className={styles.lead}>
            Home of the Raiders since 2008. Part of Leander ISD, right here
            in Leander, Texas.
          </p>
          <Link className={styles.shopLink} href="/shop">
            <span>Visit the shop</span>
            <ArrowUpRight size={18} strokeWidth={1.35} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.detailsColumn}>
          <div className={styles.markFrame}>
            <Image
              src="/images/rouse-school-mark.jpg"
              alt="Rouse High School logo"
              fill
              sizes="(max-width: 720px) 42vw, 220px"
              className={styles.mark}
              preload
            />
            <span className={styles.markNote}>RHS / Raiders</span>
          </div>

          <p className={styles.supportingCopy}>
            For students in the halls and everyone cheering from the stands.
            Wear a little maroon and gold wherever the day takes you.
          </p>

          <dl className={styles.facts}>
            <div>
              <dt>Address</dt>
              <dd>
                1222 Raider Way
                <br />
                Leander, TX 78641
              </dd>
            </div>
            <div>
              <dt>District</dt>
              <dd>Leander ISD</dd>
            </div>
          </dl>

          <div className={styles.externalLinks}>
            <a
              href="https://rhs.leanderisd.org/"
              target="_blank"
              rel="noreferrer"
            >
              <span>Rouse High School</span>
              <ArrowUpRight size={16} strokeWidth={1.35} aria-hidden="true" />
            </a>
            <a
              href="https://rhs.leanderisd.org/calendar"
              target="_blank"
              rel="noreferrer"
            >
              <span>School calendar</span>
              <ArrowUpRight size={16} strokeWidth={1.35} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}

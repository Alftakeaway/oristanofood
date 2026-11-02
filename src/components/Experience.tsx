"use client";
import {LocalizedContent} from "@/i18n";

import { useEffect, useState } from "react";

export function MotionToggle() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    let value = false;
    try {
      value = sessionStorage.getItem("fenicio-motion") === "off";
    } catch {
      /* Optional preference storage. */
    }
    setPaused(value);
    document.documentElement.dataset.motion = value ? "off" : "on";
  }, []);
  function toggle() {
    const value = !paused;
    setPaused(value);
    document.documentElement.dataset.motion = value ? "off" : "on";
    try {
      sessionStorage.setItem("fenicio-motion", value ? "off" : "on");
    } catch {
      /* Works without storage. */
    }
  }
  return <LocalizedContent>{(
    <button
      type="button"
      className="of-motion-toggle"
      onClick={toggle}
      aria-pressed={paused}
      aria-label={
        paused ? "Riattiva le animazioni" : "Metti in pausa le animazioni"
      }
      title={paused ? "Riattiva le animazioni" : "Pausa animazioni"}
    >
      <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
      <span className="of-motion-label">Movimento</span>
    </button>
  )}</LocalizedContent>;
}

export default function Experience() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const root = document.documentElement;
    const update = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty(
        "--read-progress",
        `${max > 0 ? window.scrollY / max : 0}`,
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    update();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("of-in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    const observe = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-observed])")
        .forEach((el) => {
          el.dataset.observed = "true";
          observer.observe(el);
        });
    observe();
    const changes = new MutationObserver(observe);
    changes.observe(document.querySelector("main") ?? document.body, {
      childList: true,
      subtree: true,
    });
    const navigation = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          document
            .querySelectorAll<HTMLAnchorElement>(".of-nav a")
            .forEach((link) => {
              if (link.hash === `#${entry.target.id}`)
                link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
        }
      },
      { rootMargin: "-10% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((section) => navigation.observe(section));
    const visual = document.querySelector<HTMLElement>("[data-parallax]");
    const move = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        reduced.matches ||
        root.dataset.motion === "off" ||
        !visual
      )
        return;
      const bounds = visual.getBoundingClientRect();
      visual.style.setProperty(
        "--px",
        `${((event.clientX - bounds.left) / bounds.width - 0.5) * 10}px`,
      );
      visual.style.setProperty(
        "--py",
        `${((event.clientY - bounds.top) / bounds.height - 0.5) * 10}px`,
      );
    };
    visual?.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
      navigation.disconnect();
      changes.disconnect();
      visual?.removeEventListener("pointermove", move);
    };
  }, []);
  return <LocalizedContent>{<div className="of-reading-progress" aria-hidden="true" />}</LocalizedContent>;
}

export function KineticBand({
  text = "Terra. Mare. Forno. Fatto a mano.",
}: {
  text?: string;
}) {
  return <LocalizedContent>{(
    <div className="of-kinetic" aria-label={text}>
      <div className="of-kinetic__track" aria-hidden="true">
        {[0, 1, 2, 3].map((n) => (
          <span key={n}>
            {text} <i>✳</i>{" "}
          </span>
        ))}
      </div>
    </div>
  )}</LocalizedContent>;
}

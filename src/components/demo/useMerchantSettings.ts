"use client";
import { useEffect, useState } from "react";
import { emptySettings, readSettings } from "../../lib/demo-settings";
import { demoLink, sharedSettings } from "../../lib/demo-share";

export function useMerchantSettings(enabled = true, key = "merchant-demo:v2") {
  const [settings, setSettings] = useState(emptySettings);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (enabled) {
      const shared = sharedSettings(window.location.search);
      if (shared) {
        try {
          const local = readSettings(localStorage.getItem(key));
          if (
            demoLink(window.location.href, local) ===
            demoLink(window.location.href, shared)
          )
            shared.logo = local.logo;
        } catch {
          /* A shared version works even when storage is unavailable. */
        }
        setSettings(shared);
        setNotice(
          "Versione condivisa caricata. Il logo personale non è incluso nei link.",
        );
      } else {
        try {
          setSettings(readSettings(localStorage.getItem(key)));
        } catch {
          setNotice(
            "Il browser non consente il salvataggio. Puoi comunque copiare il link.",
          );
        }
        if (new URLSearchParams(window.location.search).has("demo"))
          setNotice(
            "Link demo non valido: puoi ricominciare con le impostazioni salvate.",
          );
      }
    }
    setReady(true);
  }, [enabled, key]);
  useEffect(() => {
    if (!ready || !enabled) return;
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {
      setNotice(
        "Salvataggio non disponibile: le modifiche restano in questa pagina. Copia il link per conservarle senza logo.",
      );
    }
    if (new URLSearchParams(window.location.search).has("demo")) {
      try {
        window.history.replaceState(
          window.history.state,
          "",
          demoLink(window.location.href, settings),
        );
      } catch {
        /* Oversized links are reported when the visitor chooses to share. */
      }
    }
  }, [enabled, key, ready, settings]);
  function clearSharedURL() {
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    window.history.replaceState(window.history.state, "", url);
  }
  return { settings, setSettings, ready, notice, setNotice, clearSharedURL };
}

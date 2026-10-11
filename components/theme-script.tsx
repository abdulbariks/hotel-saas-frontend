"use client";

import { useEffect } from "react";

const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'system';if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t}catch(e){}})()`;

export function ThemeScript() {
  useEffect(() => {
    const script = document.createElement("script");
    script.textContent = THEME_BOOTSTRAP_SCRIPT;
    script.id = "theme-bootstrap";
    document.head.appendChild(script);
    return () => {
      const existing = document.getElementById("theme-bootstrap");
      if (existing) existing.remove();
    };
  }, []);

  return null;
}
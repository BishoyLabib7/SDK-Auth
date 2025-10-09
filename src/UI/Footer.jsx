import React from "react";
import { getTranslations } from "../lib/translations";

export default function Footer({ language = "en" }) {
  const t = getTranslations(language);

  return (
    <div className="mt-10 text-center text-xs text-gray-500">{t.copyright}</div>
  );
}

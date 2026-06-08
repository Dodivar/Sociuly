// Configuration cartographique partagée (SPEC §1 — MapLibre GL JS).
// Fournisseur de tuiles : OpenFreeMap (https://openfreemap.org) — tuiles
// vectorielles open source basées sur OpenStreetMap, gratuites et SANS clé API
// ni quota. Compatible MapLibre nativement (le style est une simple URL).
// Choix du style : « positron » (fond clair épuré, POI retirés) → les pastilles
// orange/navy du DS ressortent, cohérent avec le positionnement premium « stade ».
// Instance publique pour l'instant ; auto-hébergement possible plus tard
// (cf. https://openfreemap.org/quick_start/) sans changer le code applicatif.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// ─── Vue par défaut : région Grand-Est (couvre Strasbourg, Nancy, Metz) ───
export const GRAND_EST_CENTER: [number, number] = [6.2, 48.7]; // [lng, lat]
export const GRAND_EST_ZOOM = 7;

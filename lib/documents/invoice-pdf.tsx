// Template PDF de la facture finale (@react-pdf/renderer) — émetteur = CLUB.
//
// Contenu B2B (SPEC §3/§4) : entête club (SIRET, statut, n° TVA si assujetti),
// destinataire entreprise (SIRET, TVA intracom, adresse de facturation), lignes
// du devis accepté, totaux HT / TVA / TTC, déduction de l'acompte versé, et bloc
// de mentions légales obligatoires. La commission Sociuly (6 %) n'apparaît JAMAIS
// (invisible côté acheteur — CLAUDE.md §4). Tous les montants sont en cents.
//
// Couleurs reprises des tokens DS (app/globals.css) — @react-pdf ne lit pas le CSS,
// on recopie donc les valeurs des variables, sans inventer de palette (§6).

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ─────── Données d'entrée (toutes pré-calculées côté serveur) ───────
export type InvoicePdfLine = {
  label: string;
  detail?: string | null;
  quantity: number;
  unitPriceCents: number;
};

export type InvoicePdfData = {
  invoiceNumber: string; // FAC-YYYY-NNNNN
  bookingNumber: string; // SOC-YYYY-NNNNN
  quoteNumber: string; // DEV-YYYY-NNNNN
  issuedOnISO: string; // date d'émission (YYYY-MM-DD)
  eventDateISO: string; // date de la prestation

  // Émetteur (club)
  club: {
    name: string;
    siret: string;
    addressLine?: string | null;
    city: string;
    postalCode: string;
    vatLiable: boolean;
    tvaNumber?: string | null; // n° TVA intracom du club (si assujetti)
  };

  // Destinataire (entreprise)
  organization: {
    name: string;
    siret: string;
    tvaIntracom?: string | null;
    addressLine?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country: string;
  };

  experienceTitle: string;
  participants?: number | null;

  lines: InvoicePdfLine[];
  amountHTCents: number;
  vatCents: number;
  amountTTCCents: number;
  depositCents: number; // acompte déjà réglé (déduit du net à payer)
};

// ─────── Tokens (recopiés de globals.css) ───────
const C = {
  ink: "#0b1530",
  ink3: "#7780a0",
  primaryDeep: "#0d2d8a",
  line: "#d8dff0",
  surface2: "#eef2fb",
};

const eur = (cents: number): string =>
  `${(cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

const frDate = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, color: C.ink, fontFamily: "Helvetica", lineHeight: 1.5 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.primaryDeep },
  docTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "right" },
  docMeta: { fontSize: 9, color: C.ink3, textAlign: "right", marginTop: 2 },

  parties: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  party: { width: "47%" },
  partyLabel: { fontSize: 8, color: C.ink3, textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5 },
  partyName: { fontFamily: "Helvetica-Bold", fontSize: 10 },

  meta: { marginTop: 20, padding: 10, backgroundColor: C.surface2, borderRadius: 6 },
  metaLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  metaKey: { color: C.ink3 },

  table: { marginTop: 22 },
  thead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.ink, paddingBottom: 5 },
  trow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 6 },
  cLabel: { width: "52%" },
  cQty: { width: "12%", textAlign: "right" },
  cUnit: { width: "18%", textAlign: "right" },
  cTotal: { width: "18%", textAlign: "right" },
  th: { fontFamily: "Helvetica-Bold", fontSize: 8, color: C.ink3, textTransform: "uppercase" },
  lineDetail: { color: C.ink3, fontSize: 8 },

  totals: { marginTop: 16, marginLeft: "auto", width: "45%" },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalKey: { color: C.ink3 },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.ink,
  },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },

  legal: { marginTop: 28, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: C.line, fontSize: 7.5, color: C.ink3 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, textAlign: "center", fontSize: 7.5, color: C.ink3 },
});

export function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const netToPayCents = data.amountTTCCents - data.depositCents;
  // Mention TVA non assujetti : franchise en base (décision : art. 293 B du CGI).
  const vatExemptionNote = "TVA non applicable, art. 293 B du CGI";

  return (
    <Document
      title={`Facture ${data.invoiceNumber}`}
      author={data.club.name}
      subject={`Facture pour ${data.organization.name}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Entête */}
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{data.club.name}</Text>
          <View>
            <Text style={styles.docTitle}>FACTURE</Text>
            <Text style={styles.docMeta}>{data.invoiceNumber}</Text>
            <Text style={styles.docMeta}>Émise le {frDate(data.issuedOnISO)}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Émetteur</Text>
            <Text style={styles.partyName}>{data.club.name}</Text>
            {data.club.addressLine ? <Text>{data.club.addressLine}</Text> : null}
            <Text>
              {data.club.postalCode} {data.club.city}
            </Text>
            <Text>SIRET {data.club.siret}</Text>
            {data.club.vatLiable ? (
              data.club.tvaNumber ? <Text>TVA {data.club.tvaNumber}</Text> : null
            ) : (
              <Text>{vatExemptionNote}</Text>
            )}
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Facturé à</Text>
            <Text style={styles.partyName}>{data.organization.name}</Text>
            {data.organization.addressLine ? <Text>{data.organization.addressLine}</Text> : null}
            <Text>
              {[data.organization.postalCode, data.organization.city].filter(Boolean).join(" ")}
              {data.organization.country && data.organization.country !== "FR"
                ? ` · ${data.organization.country}`
                : ""}
            </Text>
            <Text>SIRET {data.organization.siret}</Text>
            {data.organization.tvaIntracom ? <Text>TVA {data.organization.tvaIntracom}</Text> : null}
          </View>
        </View>

        {/* Références */}
        <View style={styles.meta}>
          <View style={styles.metaLine}>
            <Text style={styles.metaKey}>Prestation</Text>
            <Text>{data.experienceTitle}</Text>
          </View>
          <View style={styles.metaLine}>
            <Text style={styles.metaKey}>Date de la prestation</Text>
            <Text>{frDate(data.eventDateISO)}</Text>
          </View>
          {data.participants ? (
            <View style={styles.metaLine}>
              <Text style={styles.metaKey}>Participants</Text>
              <Text>{data.participants}</Text>
            </View>
          ) : null}
          <View style={styles.metaLine}>
            <Text style={styles.metaKey}>Réservation</Text>
            <Text>{data.bookingNumber}</Text>
          </View>
          <View style={styles.metaLine}>
            <Text style={styles.metaKey}>Devis</Text>
            <Text>{data.quoteNumber}</Text>
          </View>
        </View>

        {/* Lignes */}
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.cLabel, styles.th]}>Désignation</Text>
            <Text style={[styles.cQty, styles.th]}>Qté</Text>
            <Text style={[styles.cUnit, styles.th]}>PU HT</Text>
            <Text style={[styles.cTotal, styles.th]}>Total HT</Text>
          </View>
          {data.lines.map((l, i) => (
            <View style={styles.trow} key={i} wrap={false}>
              <View style={styles.cLabel}>
                <Text>{l.label}</Text>
                {l.detail ? <Text style={styles.lineDetail}>{l.detail}</Text> : null}
              </View>
              <Text style={styles.cQty}>{l.quantity}</Text>
              <Text style={styles.cUnit}>{eur(l.unitPriceCents)}</Text>
              <Text style={styles.cTotal}>{eur(l.unitPriceCents * l.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text style={styles.totalKey}>Total HT</Text>
            <Text>{eur(data.amountHTCents)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalKey}>
              TVA {data.club.vatLiable ? "(20 %)" : ""}
            </Text>
            <Text>{data.club.vatLiable ? eur(data.vatCents) : vatExemptionNote}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandLabel}>Total TTC</Text>
            <Text style={styles.grandLabel}>{eur(data.amountTTCCents)}</Text>
          </View>
          {data.depositCents > 0 ? (
            <>
              <View style={styles.totalLine}>
                <Text style={styles.totalKey}>Acompte déjà réglé</Text>
                <Text>− {eur(data.depositCents)}</Text>
              </View>
              <View style={styles.totalLine}>
                <Text style={styles.totalKey}>Net à payer</Text>
                <Text>{eur(netToPayCents)}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Mentions légales B2B obligatoires */}
        <View style={styles.legal}>
          <Text>
            En cas de retard de paiement, application de pénalités de retard au taux de trois fois
            le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire pour frais de recouvrement
            de 40 €. Pas d'escompte pour règlement anticipé.
          </Text>
          {!data.club.vatLiable ? <Text>{vatExemptionNote}.</Text> : null}
        </View>

        <Text style={styles.footer} fixed>
          Facture émise via Sociuly · {data.invoiceNumber}
        </Text>
      </Page>
    </Document>
  );
}

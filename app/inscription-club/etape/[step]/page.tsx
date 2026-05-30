import { notFound } from "next/navigation";
import InscriptionStepper from "../../_components/InscriptionStepper";
import Step1Form from "../../_components/Step1Form";
import Step2Form from "../../_components/Step2Form";
import Step3Form from "../../_components/Step3Form";
import Step4Form from "../../_components/Step4Form";

const STEP_META = [
  { num: 1, title: "Votre association",    desc: "Renseignez les informations de base de votre club." },
  { num: 2, title: "Contact & équipe",     desc: "Qui sera le gestionnaire principal de la console club ?" },
  { num: 3, title: "Pièces justificatives", desc: "Ces documents permettent de vérifier le statut loi 1901 de votre association." },
  { num: 4, title: "Compte bancaire",      desc: "Finalisez la configuration pour recevoir vos encaissements." },
];

type Params = Promise<{ step: string }>;

export default async function EtapePage({ params }: { params: Params }) {
  const { step } = await params;
  const num = parseInt(step, 10);
  if (Number.isNaN(num) || num < 1 || num > 4) notFound();

  const meta = STEP_META[num - 1];

  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <InscriptionStepper current={num} />

      <div className="sy-card sy-card-xl sy-card-elevated" style={{ width: "100%" }}>
        {/* Step header */}
        <div style={{ marginBottom: 28 }}>
          <div className="sy-mono" style={{ color: "var(--primary)", marginBottom: 6 }}>
            Étape {num} sur 4
          </div>
          <h1 className="sy-h1" style={{ fontSize: 26 }}>{meta.title}</h1>
          <p className="sy-body" style={{ marginTop: 6 }}>{meta.desc}</p>
        </div>

        {/* Step form */}
        {num === 1 && <Step1Form />}
        {num === 2 && <Step2Form />}
        {num === 3 && <Step3Form />}
        {num === 4 && <Step4Form />}
      </div>
    </div>
  );
}

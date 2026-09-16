import { DocumentIcon, ShieldCheckIcon, SignatureIcon } from "@/components/icons";

export function Guide() {
  return (
    <div className="guide">
      <section className="panel">
        <div className="panel-head">
          <span className="panel-step">01</span>
          <span className="panel-icon panel-icon-blue">
            <DocumentIcon />
          </span>
          <h2>Configurer le contrat ClaimIssuer</h2>
        </div>
        <p className="panel-hint">
          Renseigne l&apos;adresse du contrat <code>ClaimIssuer</code> déjà déployé, sur le même réseau que ton
          wallet. L&apos;appli vérifie automatiquement qu&apos;un contrat existe bien à cette adresse ; si le badge
          affiche <em>&quot;Introuvable sur ce réseau&quot;</em>, ton wallet n&apos;est probablement pas sur le bon
          réseau.
        </p>
      </section>

      <section className="panel">
        <div className="panel-head">
          <span className="panel-step">02</span>
          <span className="panel-icon panel-icon-violet">
            <SignatureIcon />
          </span>
          <h2>Émettre une claim</h2>
        </div>
        <p className="panel-hint">
          Connecte un wallet qui détient la clé de management ou de claim signer du <code>ClaimIssuer</code>, puis
          remplis le formulaire. Exemple concret :
        </p>
        <ul className="guide-example">
          <li>
            <strong>Adresse de l&apos;identité (sujet)</strong> : l&apos;adresse concernée par la claim, ex.{" "}
            <code>0x6B3D16C808E8084bBC679292b3914385ef032Ceb</code>
          </li>
          <li>
            <strong>Topic</strong> : identifiant numérique du type de claim, ex. <code>1</code> (convention courante
            pour &quot;KYC&quot; dans l&apos;écosystème ONCHAINID)
          </li>
          <li>
            <strong>Scheme</strong> : <code>1</code> (signature ECDSA, le seul type que ce contrat sait vérifier)
          </li>
          <li>
            <strong>Données de la claim</strong> : texte libre, ex. <code>KYC vérifié</code>
          </li>
          <li>
            <strong>URI</strong> : optionnel, un lien vers une preuve hors-chaîne
          </li>
        </ul>
        <p className="panel-hint">
          Clique <strong>&quot;Signer la claim&quot;</strong> : ton wallet te demande une signature (gratuite, pas de
          transaction on-chain). L&apos;appli affiche ensuite un JSON contenant la signature et les valeurs saisies.
          Conserve-le, il te sert à l&apos;étape suivante.
        </p>
      </section>

      <section className="panel">
        <div className="panel-head">
          <span className="panel-step">03</span>
          <span className="panel-icon panel-icon-pink">
            <ShieldCheckIcon />
          </span>
          <h2>Vérifier / révoquer</h2>
        </div>
        <p className="panel-hint">
          Remets <strong>exactement</strong> les mêmes valeurs qu&apos;à l&apos;étape 2, puis clique{" "}
          <strong>&quot;Vérifier&quot;</strong>.
        </p>
        <div className="guide-callout">
          <strong>Piège le plus fréquent :</strong> le champ &quot;Données de la claim&quot; attend le{" "}
          <strong>texte brut original</strong> (ex. <code>KYC vérifié</code>). Jamais le JSON entier produit à
          l&apos;étape 2, ni son champ <code>data</code> (déjà encodé en hexadécimal). Un seul caractère différent, y
          compris la casse, et la vérification échoue.
        </div>
        <table className="guide-mapping">
          <thead>
            <tr>
              <th>Champ (étape 3)</th>
              <th>Valeur à utiliser</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Adresse de l&apos;identité</td>
              <td>
                le champ <code>identity</code> du JSON
              </td>
            </tr>
            <tr>
              <td>Topic</td>
              <td>
                le champ <code>topic</code> du JSON
              </td>
            </tr>
            <tr>
              <td>Données de la claim</td>
              <td>le texte brut original (pas le JSON, pas le champ hex)</td>
            </tr>
            <tr>
              <td>Signature</td>
              <td>
                le champ <code>signature</code> du JSON
              </td>
            </tr>
          </tbody>
        </table>
        <p className="panel-hint">
          Pour <strong>révoquer</strong>, connecte le wallet qui détient la clé de management, colle la Signature, et
          clique <strong>&quot;Révoquer&quot;</strong>. Cette fois, c&apos;est une vraie transaction on-chain (gas
          requis).
        </p>
      </section>
    </div>
  );
}

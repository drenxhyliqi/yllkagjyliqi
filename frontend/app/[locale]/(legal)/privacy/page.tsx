import { LegalRoute, legalMetadata } from "../legal-route";

export const generateMetadata = () => legalMetadata("privacy");

export default function Page() {
  return <LegalRoute slug="privacy" />;
}

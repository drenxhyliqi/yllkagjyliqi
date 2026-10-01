import { LegalRoute, legalMetadata } from "../legal-route";

export const generateMetadata = () => legalMetadata("terms");

export default function Page() {
  return <LegalRoute slug="terms" />;
}

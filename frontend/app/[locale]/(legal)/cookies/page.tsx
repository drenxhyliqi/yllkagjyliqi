import { LegalRoute, legalMetadata } from "../legal-route";

export const generateMetadata = () => legalMetadata("cookies");

export default function Page() {
  return <LegalRoute slug="cookies" />;
}

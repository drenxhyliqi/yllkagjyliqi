import type { LegalContext, LegalDocument } from "@/lib/legal/types";

function contactLine({ email, phone, address }: LegalContext): string {
  const parts = [
    email && `by email at ${email}`,
    phone && `by phone on ${phone}`,
    address && `by post at ${address}`,
  ];
  return parts.filter(Boolean).join(", ");
}

export function privacyEn(ctx: LegalContext): LegalDocument {
  return {
    title: "Privacy Policy",
    description: `How ${ctx.name} collects and uses personal information, and the choices you have.`,
    intro: `This policy explains what personal information ${ctx.name} collects through this website, why, and the choices you have. We keep it short, because we collect very little.`,
    sections: [
      {
        heading: "Who we are",
        blocks: [
          `${ctx.name} (“we”, “us”) is responsible for the personal information described in this policy. You can contact us ${contactLine(ctx)}.`,
        ],
      },
      {
        heading: "What we collect",
        blocks: [
          {
            list: [
              "Appointment requests: your name, phone number, email address, the service and time you choose, and any note you add.",
              "Messages: anything you send us by email, phone or social media.",
              "Technical data: like every website, our servers briefly record information such as your IP address, browser type and the pages requested, to keep the site secure and working.",
              "Preferences: your language and your cookie choice, stored in cookies (see our Cookie Policy).",
            ],
          },
          "We do not use advertising trackers, and we do not sell personal information.",
        ],
      },
      {
        heading: "Why we use it",
        blocks: [
          {
            list: [
              "To arrange your appointment: to confirm, remind, change or cancel it. This is necessary to provide the service you ask for.",
              "To answer your questions, which is in our legitimate interest and yours.",
              "To keep the website secure and working, which is in our legitimate interest.",
              "To meet legal obligations, such as keeping financial records.",
            ],
          },
        ],
      },
      {
        heading: "Who we share it with",
        blocks: [
          "We share information only with service providers that help us run the website and appointments, such as our hosting provider, booking system and email provider. They may use it only to provide their service to us. We may also disclose information where the law requires it.",
          "Links to Instagram and Facebook take you to those platforms, where their own privacy policies apply.",
        ],
      },
      {
        heading: "How long we keep it",
        blocks: [
          "Appointment details are kept for as long as needed to provide the service and to meet legal record-keeping requirements. Technical logs are kept for a short period. Messages are deleted when they are no longer needed.",
        ],
      },
      {
        heading: "Your rights",
        blocks: [
          "Under the data protection law that applies to you, such as Kosovo’s Law No. 06/L-082 on Protection of Personal Data or the EU General Data Protection Regulation, you can ask to:",
          {
            list: [
              "see the personal information we hold about you;",
              "correct it, or have it deleted;",
              "object to, or restrict, how we use it;",
              "receive a copy of it.",
            ],
          },
          `To make a request, contact us ${contactLine(ctx)}. You also have the right to complain to a data protection authority; in Kosovo this is the Information and Privacy Agency.`,
        ],
      },
      {
        heading: "Security",
        blocks: [
          "We use reasonable technical and organisational measures to protect personal information, including encrypted connections. No system is completely secure, but we work to keep your information safe.",
        ],
      },
      {
        heading: "Changes to this policy",
        blocks: [
          "We may update this policy from time to time. The date at the top of this page shows when it last changed.",
        ],
      },
    ],
  };
}

export function cookiesEn(ctx: LegalContext): LegalDocument {
  return {
    title: "Cookie Policy",
    description: `Which cookies the ${ctx.name} website uses and how to manage them.`,
    intro:
      "Cookies are small text files a website stores in your browser. This page lists the ones this website uses and how you can manage them.",
    sections: [
      {
        heading: "Cookies we use",
        blocks: [
          {
            table: {
              columns: ["Cookie", "Purpose", "Kept for"],
              rows: [
                [
                  "locale",
                  "Remembers your language, Albanian or English.",
                  "1 year",
                ],
                [
                  "cookie-consent",
                  "Remembers your choice in the cookie banner.",
                  "6 months",
                ],
                [
                  "yllka_admin_session",
                  "Keeps the site owner signed in to the admin area. Only set when signing in to the admin.",
                  "Up to 14 days",
                ],
              ],
            },
          },
          "These cookies are necessary for the website to work as you would expect, so they do not need your consent.",
        ],
      },
      {
        heading: "Similar technologies",
        blocks: [
          "On your first visit, the website notes in your browser’s session storage that the opening animation has played, so it is not shown again during the same visit. This is cleared when you close the browser.",
        ],
      },
      {
        heading: "Analytics and third parties",
        blocks: [
          "We currently do not use analytics, advertising or social media cookies. If we add analytics in the future, it will only run after you choose “Accept” in the cookie banner, and this page will be updated.",
          "Our fonts and photos are delivered from our own website, so loading a page does not send your information to third parties for these.",
        ],
      },
      {
        heading: "Your choices",
        blocks: [
          "You can change your choice at any time with “Cookie settings” at the bottom of every page. You can also delete or block cookies in your browser settings; if you block necessary cookies, some features, such as remembering your language, may not work.",
        ],
      },
      {
        heading: "Contact",
        blocks: [`Questions about cookies? Contact us ${contactLine(ctx)}.`],
      },
    ],
  };
}

export function termsEn(ctx: LegalContext): LegalDocument {
  return {
    title: "Terms of Use",
    description: `The terms that apply when you use the ${ctx.name} website.`,
    intro:
      "These terms apply to your use of this website. By using it, you agree to them.",
    sections: [
      {
        heading: "About this website",
        blocks: [
          `This website is run by ${ctx.name}. It presents our services, prices and work, and lets you request appointments.`,
        ],
      },
      {
        heading: "Appointments",
        blocks: [
          "An appointment request is not confirmed until you receive a confirmation from us. Details about confirmation, changes and cancellations are given when you book.",
        ],
      },
      {
        heading: "Services and prices",
        blocks: [
          "We keep services and prices up to date, but they may change, and some depend on your needs. Prices shown as “from” are starting prices. We may correct mistakes on the website at any time.",
        ],
      },
      {
        heading: "Content and photographs",
        blocks: [
          `The text, photographs, logo and design of this website belong to ${ctx.name} or are used with permission. Please do not copy or reuse them without written permission. You are welcome to share links to the website.`,
        ],
      },
      {
        heading: "Using the website",
        blocks: [
          "Please do not misuse the website, for example by trying to access areas you are not allowed to use, disrupting how it works, or sending false appointment requests.",
        ],
      },
      {
        heading: "Links to other websites",
        blocks: [
          "This website links to other websites, such as Instagram and Facebook. We are not responsible for their content or how they handle your information.",
        ],
      },
      {
        heading: "Liability",
        blocks: [
          "We work to keep the website accurate and available, but cannot guarantee that it will always be free of errors or interruptions. As far as the law allows, we are not liable for losses arising from the use of the website. Nothing in these terms limits your rights under consumer protection law.",
        ],
      },
      {
        heading: "Governing law",
        blocks: [
          "These terms are governed by the laws of the Republic of Kosovo.",
        ],
      },
      {
        heading: "Changes and contact",
        blocks: [
          `We may update these terms from time to time; the date at the top shows when they last changed. Questions? Contact us ${contactLine(ctx)}.`,
        ],
      },
    ],
  };
}

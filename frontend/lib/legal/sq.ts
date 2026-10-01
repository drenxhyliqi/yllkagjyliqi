import type { LegalContext, LegalDocument } from "@/lib/legal/types";

function contactLine({ email, phone, address }: LegalContext): string {
  const parts = [
    email && `me email në ${email}`,
    phone && `me telefon në ${phone}`,
    address && `me postë në ${address}`,
  ];
  return parts.filter(Boolean).join(", ");
}

export function privacySq(ctx: LegalContext): LegalDocument {
  return {
    title: "Politika e privatësisë",
    description: `Si i mbledh dhe i përdor ${ctx.name} të dhënat personale, dhe çfarë zgjedhjesh keni.`,
    intro: `Kjo politikë shpjegon cilat të dhëna personale mbledh ${ctx.name} përmes kësaj faqeje, pse i mbledh dhe çfarë zgjedhjesh keni. E mbajmë të shkurtër, sepse mbledhim shumë pak.`,
    sections: [
      {
        heading: "Kush jemi",
        blocks: [
          `${ctx.name} („ne”) është përgjegjëse për të dhënat personale të përshkruara në këtë politikë. Mund të na kontaktoni ${contactLine(ctx)}.`,
        ],
      },
      {
        heading: "Çfarë mbledhim",
        blocks: [
          {
            list: [
              "Kërkesat për termin: emrin, numrin e telefonit, adresën e email-it, shërbimin dhe orarin që zgjidhni, si dhe çdo shënim që shtoni.",
              "Mesazhet: çdo gjë që na dërgoni me email, telefon ose rrjete sociale.",
              "Të dhëna teknike: si çdo faqe interneti, serverët tanë regjistrojnë për pak kohë të dhëna si adresa IP, lloji i shfletuesit dhe faqet e kërkuara, që faqja të jetë e sigurt dhe të funksionojë.",
              "Preferencat: gjuhën dhe zgjedhjen tuaj për cookies, të ruajtura në cookies (shihni Politikën e cookies).",
            ],
          },
          "Nuk përdorim gjurmues reklamash dhe nuk shesim të dhëna personale.",
        ],
      },
      {
        heading: "Pse i përdorim",
        blocks: [
          {
            list: [
              "Për të organizuar terminin tuaj: për ta konfirmuar, për t’ju kujtuar, për ta ndryshuar ose anuluar. Kjo është e nevojshme për të ofruar shërbimin që kërkoni.",
              "Për t’iu përgjigjur pyetjeve tuaja, gjë që është në interesin tonë të ligjshëm dhe në interesin tuaj.",
              "Për ta mbajtur faqen të sigurt dhe funksionale, në interesin tonë të ligjshëm.",
              "Për të përmbushur detyrimet ligjore, si mbajtja e të dhënave financiare.",
            ],
          },
        ],
      },
      {
        heading: "Me kë i ndajmë",
        blocks: [
          "I ndajmë të dhënat vetëm me ofruesit e shërbimeve që na ndihmojnë të mbajmë faqen dhe terminet, si ofruesi i hostimit, sistemi i rezervimeve dhe ofruesi i email-it. Ata mund t’i përdorin vetëm për të na ofruar shërbimin e tyre. Mund t’i zbulojmë të dhënat edhe kur e kërkon ligji.",
          "Lidhjet për në Instagram dhe Facebook ju çojnë në ato platforma, ku zbatohen politikat e tyre të privatësisë.",
        ],
      },
      {
        heading: "Sa kohë i ruajmë",
        blocks: [
          "Të dhënat e terminit ruhen për aq kohë sa duhet për të ofruar shërbimin dhe për të përmbushur kërkesat ligjore për mbajtjen e të dhënave. Regjistrat teknikë ruhen për një periudhë të shkurtër. Mesazhet fshihen kur nuk nevojiten më.",
        ],
      },
      {
        heading: "Të drejtat tuaja",
        blocks: [
          "Sipas ligjit për mbrojtjen e të dhënave që zbatohet për ju, si Ligji nr. 06/L-082 për Mbrojtjen e të Dhënave Personale në Kosovë ose Rregullorja e Përgjithshme e BE-së për Mbrojtjen e të Dhënave, mund të kërkoni:",
          {
            list: [
              "të shihni të dhënat personale që kemi për ju;",
              "t’i korrigjoni ose t’i fshini;",
              "të kundërshtoni ose të kufizoni mënyrën si i përdorim;",
              "të merrni një kopje të tyre.",
            ],
          },
          `Për të bërë një kërkesë, na kontaktoni ${contactLine(ctx)}. Keni gjithashtu të drejtë të ankoheni te autoriteti për mbrojtjen e të dhënave; në Kosovë ky është Agjencia për Informim dhe Privatësi.`,
        ],
      },
      {
        heading: "Siguria",
        blocks: [
          "Përdorim masa të arsyeshme teknike dhe organizative për të mbrojtur të dhënat personale, përfshirë lidhje të enkriptuara. Asnjë sistem nuk është plotësisht i sigurt, por punojmë që të dhënat tuaja të jenë të mbrojtura.",
        ],
      },
      {
        heading: "Ndryshimet e kësaj politike",
        blocks: [
          "Mund ta përditësojmë këtë politikë herë pas here. Data në krye të faqes tregon kur është ndryshuar për herë të fundit.",
        ],
      },
    ],
  };
}

export function cookiesSq(ctx: LegalContext): LegalDocument {
  return {
    title: "Politika e cookies",
    description: "Cilat cookies përdor kjo faqe dhe si t’i menaxhoni.",
    intro:
      "Cookies janë skedarë të vegjël teksti që një faqe interneti i ruan në shfletuesin tuaj. Kjo faqe tregon cilat cookies përdorim dhe si mund t’i menaxhoni.",
    sections: [
      {
        heading: "Cookies që përdorim",
        blocks: [
          {
            table: {
              columns: ["Cookie", "Qëllimi", "Ruhet për"],
              rows: [
                [
                  "locale",
                  "Mban mend gjuhën tuaj, shqip ose anglisht.",
                  "1 vit",
                ],
                [
                  "cookie-consent",
                  "Mban mend zgjedhjen tuaj te njoftimi për cookies.",
                  "6 muaj",
                ],
                [
                  "yllka_admin_session",
                  "E mban pronaren e faqes të kyçur në pjesën e administrimit. Vendoset vetëm gjatë kyçjes në administrim.",
                  "Deri në 14 ditë",
                ],
              ],
            },
          },
          "Këto cookies janë të domosdoshme që faqja të funksionojë siç pritet, prandaj nuk kërkojnë pëlqimin tuaj.",
        ],
      },
      {
        heading: "Teknologji të ngjashme",
        blocks: [
          "Në vizitën e parë, faqja shënon në hapësirën e sesionit të shfletuesit se animacioni hyrës është shfaqur, që të mos shfaqet përsëri gjatë së njëjtës vizitë. Ky shënim fshihet kur mbyllni shfletuesin.",
        ],
      },
      {
        heading: "Analitika dhe palët e treta",
        blocks: [
          "Aktualisht nuk përdorim cookies për analitikë, reklama ose rrjete sociale. Nëse në të ardhmen shtojmë analitikë, ajo do të aktivizohet vetëm pasi të zgjidhni „Prano” te njoftimi për cookies, dhe kjo faqe do të përditësohet.",
          "Shkronjat dhe fotografitë tona shërbehen nga vetë faqja jonë, prandaj hapja e një faqeje nuk ua dërgon të dhënat tuaja palëve të treta për këto.",
        ],
      },
      {
        heading: "Zgjedhjet tuaja",
        blocks: [
          "Mund ta ndryshoni zgjedhjen tuaj në çdo kohë përmes „Cilësimet e cookies” në fund të çdo faqeje. Mund t’i fshini ose bllokoni cookies edhe në cilësimet e shfletuesit; nëse bllokoni cookies të domosdoshme, disa funksione, si mbajtja mend e gjuhës, mund të mos punojnë.",
        ],
      },
      {
        heading: "Kontakti",
        blocks: [`Keni pyetje për cookies? Na kontaktoni ${contactLine(ctx)}.`],
      },
    ],
  };
}

export function termsSq(ctx: LegalContext): LegalDocument {
  return {
    title: "Kushtet e përdorimit",
    description: "Kushtet që zbatohen kur përdorni këtë faqe.",
    intro:
      "Këto kushte zbatohen për përdorimin e kësaj faqeje. Duke e përdorur atë, i pranoni këto kushte.",
    sections: [
      {
        heading: "Për këtë faqe",
        blocks: [
          `Kjo faqe menaxhohet nga ${ctx.name}. Ajo prezanton shërbimet, çmimet dhe punimet tona, dhe ju lejon të kërkoni termine.`,
        ],
      },
      {
        heading: "Terminet",
        blocks: [
          "Një kërkesë për termin nuk është e konfirmuar derisa të merrni konfirmimin nga ne. Detajet për konfirmimin, ndryshimet dhe anulimet jepen gjatë rezervimit.",
        ],
      },
      {
        heading: "Shërbimet dhe çmimet",
        blocks: [
          "I mbajmë shërbimet dhe çmimet të përditësuara, por ato mund të ndryshojnë dhe disa varen nga nevojat tuaja. Çmimet e shënuara „nga” janë çmime fillestare. Mund të korrigjojmë gabimet në faqe në çdo kohë.",
        ],
      },
      {
        heading: "Përmbajtja dhe fotografitë",
        blocks: [
          "Teksti, fotografitë, logoja dhe dizajni i kësaj faqeje janë pronë jona ose përdoren me leje. Ju lutemi mos i kopjoni dhe mos i ripërdorni pa leje me shkrim. Jeni të mirëpritur të ndani lidhjet për në faqe.",
        ],
      },
      {
        heading: "Përdorimi i faqes",
        blocks: [
          "Ju lutemi mos e keqpërdorni faqen, për shembull duke u përpjekur të hyni në pjesë ku nuk keni leje, duke penguar funksionimin e saj ose duke dërguar kërkesa të rreme për termin.",
        ],
      },
      {
        heading: "Lidhjet për në faqe të tjera",
        blocks: [
          "Kjo faqe ka lidhje për në faqe të tjera, si Instagram dhe Facebook. Nuk jemi përgjegjës për përmbajtjen e tyre ose për mënyrën si i trajtojnë të dhënat tuaja.",
        ],
      },
      {
        heading: "Përgjegjësia",
        blocks: [
          "Punojmë që faqja të jetë e saktë dhe e qasshme, por nuk mund të garantojmë që do të jetë gjithmonë pa gabime ose ndërprerje. Për aq sa e lejon ligji, nuk mbajmë përgjegjësi për humbjet që rrjedhin nga përdorimi i faqes. Asgjë në këto kushte nuk i kufizon të drejtat tuaja sipas ligjit për mbrojtjen e konsumatorit.",
        ],
      },
      {
        heading: "Ligji i zbatueshëm",
        blocks: ["Këto kushte rregullohen nga ligjet e Republikës së Kosovës."],
      },
      {
        heading: "Ndryshimet dhe kontakti",
        blocks: [
          `Mund t’i përditësojmë këto kushte herë pas here; data në krye tregon kur janë ndryshuar për herë të fundit. Keni pyetje? Na kontaktoni ${contactLine(ctx)}.`,
        ],
      },
    ],
  };
}

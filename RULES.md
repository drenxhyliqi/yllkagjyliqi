Design website reference will be this one and it should have the same rich and elegantfeeling for each page until to the booking and the admin oage: https://raphaeliscoiffure.be/en/?utm_source=chatgpt.com

You are the lead frontend engineer and senior digital product designer for this project.

Read the entire CLAUDE.md file before doing ANY implementation.

You are building the website for Yllka, a premium hair & makeup artist / beauty studio.

This is NOT a generic salon template.
This must NOT look AI-generated.
It must feel like a real, professionally art-directed beauty brand with excellent typography, photography, spacing, hierarchy, responsive behavior, and subtle interaction design.

Your standard for this project is:
PREMIUM EDITORIAL BEAUTY WEBSITE
+ MODERN DIGITAL EXPERIENCE
+ EXTREMELY CLEAN UI
+ REAL-WORLD PRODUCTION QUALITY

Do not rush.

Do not build all pages at once.

Do not generate a huge amount of code in one pass.

Work through the website ONE SECTION AT A TIME and give each section significant design attention before moving to the next.

==================================================
# 1. FIRST: UNDERSTAND THE PROJECT
==================================================

Before changing any code:

1. Read CLAUDE.md completely.
2. Inspect the entire repository structure.
3. Inspect package.json.
4. Inspect the current Next.js configuration.
5. Inspect existing components.
6. Inspect existing styles.
7. Inspect assets and images.
8. Inspect the current implementation of every existing page.
9. Identify what can be reused.
10. Identify what should be redesigned.
11. Do NOT delete working functionality unnecessarily.
12. Do NOT introduce unnecessary dependencies.

Then create a short internal implementation plan.

Do not start implementing the entire website immediately.

The first actual implementation task is ONLY the global visual foundation and navbar.

==================================================
# 2. DESIGN PHILOSOPHY
==================================================

The website should feel like a premium beauty/editorial brand.

Think:

- luxury beauty studio
- fashion editorial
- modern European beauty brand
- refined portfolio
- understated elegance
- high-end personal brand
- excellent photography
- beautiful typography
- generous whitespace

Do NOT make it look like:

- a SaaS website
- an AI landing page
- a generic Tailwind template
- a startup website
- a Canva template
- a dashboard
- an over-designed "luxury" website
- excessive glassmorphism
- excessive gradients
- excessive rounded cards
- excessive shadows
- giant glowing typography
- random decorative blobs
- excessive animations
- generic beauty stock-template design

Premium does NOT mean adding more visual effects.

Premium comes from:

- typography
- spacing
- proportions
- photography
- layout
- restraint
- consistency
- subtle interactions
- details

==================================================
# 3. DESIGN SYSTEM FIRST
==================================================

Before building the individual homepage sections, establish a small visual system.

Determine:

- primary background
- secondary background
- text colors
- muted text
- borders
- accent color
- typography
- heading scale
- body scale
- spacing rhythm
- container widths
- border radius philosophy
- button style
- image treatment

Use the existing Yllka logo as a major reference.

The logo is elegant and handwritten/calligraphic.

The visual system should complement the logo instead of competing with it.

The design should probably use:

- warm off-white
- black / near-black
- soft beige / nude neutrals
- subtle warm accent
- elegant serif display typography
- clean sans-serif body typography

But do not blindly use those values.

Inspect the logo and existing assets and make a considered design decision.

Typography is extremely important.

A possible direction:

DISPLAY:
Elegant serif such as Cormorant Garamond / Instrument Serif / DM Serif Display.

BODY:
Inter / Manrope / Geist / DM Sans.

Do not automatically use these.
Choose what actually looks best.

Use no more font families than necessary.

==================================================
# 4. IMPORTANT: WORK ONE SECTION AT A TIME
==================================================

This is the most important instruction.

Do NOT implement:

Navbar + Hero + Services + Work + Footer

in one operation.

Instead:

PHASE 1
Global design system

PHASE 2
Navbar

PHASE 3
Hero

PHASE 4
Homepage introduction

PHASE 5
Services preview

PHASE 6
Featured work

PHASE 7
About / Yllka section

PHASE 8
Booking CTA

PHASE 9
Footer

PHASE 10
Services page

PHASE 11
Work page

PHASE 12
Prices page

PHASE 13
About page

PHASE 14
Booking page

PHASE 15
Admin UI

PHASE 16
Responsive refinement

PHASE 17
Accessibility

PHASE 18
Performance

PHASE 19
Final polish

After each phase:

- inspect the implementation
- run the project
- check browser console
- check TypeScript
- check responsive behavior
- inspect visual hierarchy
- fix obvious issues
- only then continue

Do not move to the next phase just because the previous section technically works.

It must look finished.

==================================================
# 5. PHASE 1 — GLOBAL FOUNDATION
==================================================

Start ONLY with the global visual foundation.

Implement:

- typography
- colors
- spacing
- global container
- buttons
- links
- image behavior
- page background
- selection color if appropriate
- scrollbar behavior if appropriate
- basic responsive rules

Create reusable primitives only when they are actually useful.

Do not create 40 tiny components.

Create a coherent design system.

The website should already feel premium before the navbar exists.

Then stop and inspect the result.

==================================================
# 6. PHASE 2 — NAVBAR
==================================================

Build ONLY the navbar next.

The navbar should be extremely polished.

Concept:

LEFT:
Yllka logo

CENTER / RIGHT:
Services
Work
Prices
About

PRIMARY CTA:
Book Appointment

On desktop:

- elegant spacing
- minimal navigation
- excellent typography
- subtle hover states
- no unnecessary icons
- no excessive borders

On mobile:

- compact logo
- clean menu trigger
- elegant mobile menu
- excellent spacing
- easy thumb interaction
- booking CTA clearly accessible

The navbar should not feel like a standard component copied from a UI library.

Consider:

- transparent/overlay state over hero
- transition to solid background when scrolling
- subtle backdrop only if it actually improves the design
- smooth state transition
- proper contrast over hero imagery

Do not overdo the effect.

The navbar must feel like it belongs to the brand.

Test:

- desktop
- tablet
- mobile
- long navigation labels
- scroll state
- menu open/close
- keyboard interaction

Do NOT continue until the navbar feels production-ready.

==================================================
# 7. PHASE 3 — HERO
==================================================

Now build ONLY the hero.

The hero is one of the most important sections.

It should immediately communicate:

Yllka
Hair & Makeup

but in a sophisticated way.

Do not use generic marketing copy.

Do not write:

"Transform your beauty with our premium services."

That sounds AI-generated.

Use restrained, human language.

Possible conceptual direction:

"Hair & makeup, thoughtfully created for you."

But refine the wording based on the actual brand.

The hero should be highly visual.

Prioritize:

- beautiful image
- strong composition
- typography
- whitespace
- logo
- subtle CTA
- excellent proportions

Do NOT fill the hero with:

- statistics
- badges
- fake reviews
- multiple buttons
- floating cards
- decorative blobs
- excessive text

The hero should feel almost editorial.

Consider a composition such as:

large portrait/image
+
small elegant typography
+
one clear booking CTA

But make the final layout based on what looks best with the actual assets.

If suitable photography does not exist yet:

- use a clearly identifiable placeholder
- preserve the intended composition
- do not generate fake business photography
- make it easy to replace later

The hero should be responsive by design.

Desktop and mobile should NOT simply be the same layout scaled down.

==================================================
# 8. PHASE 4 — INTRODUCTION
==================================================

After the hero is finished, create a short introduction section.

This section should introduce Yllka personally.

It should feel:

- warm
- personal
- elegant
- minimal

Potential structure:

small eyebrow:
"ABOUT YLLKA"

large statement:
short personal brand message

supporting paragraph:
2–4 lines

optional:
small portrait

Do not create a giant wall of text.

Do not invent facts about Yllka.

If information is unavailable, use neutral placeholder copy and clearly structure it for later replacement.

==================================================
# 9. PHASE 5 — SERVICES
==================================================

Build a premium services preview.

Do not use generic 3-column SaaS cards.

Instead, consider an editorial service layout.

For example:

HAIR
short description
Explore →

MAKEUP
short description
Explore →

BRIDAL
short description
Explore →

OTHER
short description
Explore →

Use imagery where appropriate.

Make each category visually distinct without turning each into a giant card.

The data should eventually come from the backend.

For now, create the component structure so replacing mock data with API data is straightforward.

Services must support:

- category
- service name
- description
- price
- duration
- image
- active/inactive
- ordering

==================================================
# 10. PHASE 6 — FEATURED WORK
==================================================

This section should be highly visual.

The portfolio is one of the strongest selling points.

Do NOT create a generic equal-size grid.

Use an editorial composition.

Consider:

- asymmetric image grid
- large feature image
- smaller supporting images
- different image proportions
- controlled whitespace
- subtle hover interaction

Example concept:

FEATURED WORK

large image
        smaller image
small image
        large image

But determine the actual composition yourself.

Do not make the masonry layout chaotic.

Every image should feel intentionally placed.

Hover interactions should be subtle.

Examples:

- slight image scale
- subtle overlay
- title reveal
- category reveal

Do not use dramatic animations.

==================================================
# 11. PHASE 7 — ABOUT YLLKA
==================================================

Create a more personal section.

This is a personal beauty brand, so Yllka herself should be part of the experience.

Potential layout:

portrait
+
short story
+
"Book an appointment"

The section should not look like a corporate About Us page.

It should feel personal.

Do not invent credentials, years of experience, awards, client counts, or claims.

Only use information actually provided by the client.

==================================================
# 12. PHASE 8 — BOOKING CTA
==================================================

Create a strong final booking section.

It should feel like the natural conclusion of the homepage.

Example conceptual structure:

"Ready for your next look?"

small supporting text

[ Book an appointment ]

Keep it elegant.

Do not create a giant marketing CTA with five buttons.

==================================================
# 13. PHASE 9 — FOOTER
==================================================

The footer should be minimal and useful.

Include:

Yllka logo

Services
Work
Prices
About
Book

Instagram
Phone
Location

Opening hours

Copyright

The footer should feel like part of the brand, not a generic website footer.

==================================================
# 14. SERVICES PAGE
==================================================

After the homepage is fully polished, create the Services page.

The page should include:

- page introduction
- category navigation
- service listings
- service descriptions
- price
- duration
- booking CTA

Services must eventually come from the API/database.

Do not hardcode production data.

Make category filtering elegant.

==================================================
# 15. PRICES PAGE
==================================================

Create an editorial price list.

Not a boring data table.

Example:

HAIR

Hair Styling                 €XX
Blow Dry                     €XX
Haircut                      €XX

MAKEUP

Day Makeup                   €XX
Event Makeup                 €XX

BRIDAL

Bridal Makeup                from €XX
Bridal Hair                  from €XX

The admin will eventually manage all prices.

Support:

- fixed price
- starting-from price
- custom/contact pricing

==================================================
# 16. WORK PAGE
==================================================

Create the full portfolio page.

It should include:

- category filters
- featured work
- gallery
- hover states
- responsive image layout

The page should feel more like an editorial portfolio than a typical image gallery.

Eventually all items will come from the backend.

==================================================
# 17. BOOKING PAGE
==================================================

The booking page should be extremely simple.

Concept:

BOOK YOUR APPOINTMENT

1. Choose category
2. Choose service
3. Choose date
4. Choose time
5. Enter details
6. Confirm/request

The actual scheduling will be integrated with the selected external booking provider.

Do NOT build a fake scheduling engine.

Do NOT invent provider APIs.

When implementation reaches this point, inspect the provider's current official documentation before implementing the integration.

The booking architecture must remain provider-independent.

==================================================
# 18. ADMIN DASHBOARD
==================================================

Only after the entire public-facing website is visually polished should you build the admin dashboard.

The admin dashboard should be much simpler visually than the public website.

Yllka needs to manage:

SERVICES
- categories
- services
- prices
- duration
- active/inactive
- ordering

WORK
- upload photos
- title
- category
- description
- featured
- publish/unpublish

BOOKINGS
- upcoming
- pending
- confirmed
- cancelled
- completed

SETTINGS
- business information
- phone
- Instagram
- location
- opening hours

The dashboard should feel like a clean CMS.

Do not overdesign it.

==================================================
# 19. IMAGE DIRECTION
==================================================

Photography is critical.

Do not use random images simply to fill space.

Every image should have:

- correct aspect ratio
- intentional crop
- appropriate focal point
- high quality
- responsive sizing
- alt text

If placeholder images are needed during development, clearly structure the components so real images can replace them easily.

Never make the website dependent on one specific placeholder image.

==================================================
# 20. RESPONSIVE DESIGN
==================================================

Do not treat responsiveness as a final step.

Every section must be designed responsively when created.

Test:

375px
390px
430px
768px
1024px
1280px
1440px
1920px

Mobile is extremely important because customers will likely arrive from Instagram.

The mobile experience must feel intentionally designed.

Pay particular attention to:

- logo size
- navbar
- typography
- image crops
- spacing
- buttons
- booking flow
- portfolio grid
- price lists

==================================================
# 21. MICRO-INTERACTIONS
==================================================

Use animation sparingly.

Good:

- 150–400ms transitions
- opacity changes
- subtle translate
- image scale 1.02–1.05
- gentle menu animation
- understated page transitions

Avoid:

- bouncing
- spinning
- excessive parallax
- scroll hijacking
- huge text animations
- constant floating
- excessive staggered animations

The site should feel calm.

==================================================
# 22. QUALITY CONTROL AFTER EVERY SECTION
==================================================

After EACH section, perform this checklist:

VISUAL:
- Does this look premium?
- Does it look like a real beauty brand?
- Does it feel intentionally designed?
- Is there too much visual noise?
- Is the typography excellent?
- Is the spacing balanced?
- Are the proportions correct?

UX:
- Is the purpose of the section immediately clear?
- Is the CTA obvious?
- Is navigation intuitive?

TECHNICAL:
- TypeScript clean?
- No console errors?
- No broken links?
- No hydration problems?
- No unnecessary client components?
- No unnecessary dependencies?

RESPONSIVE:
- Desktop
- Tablet
- Mobile

ACCESSIBILITY:
- Semantic HTML
- keyboard navigation
- labels
- contrast
- focus states

Do not proceed if obvious problems remain.

==================================================
# 23. SELF-CRITIQUE
==================================================

After every major section, critically review your own implementation.

Ask:

"What would a senior product designer criticize here?"

"What makes this look like an AI-generated website?"

"What feels generic?"

"What feels unnecessarily decorative?"

"What could be simplified?"

"Does the typography feel premium?"

"Does the spacing feel expensive?"

"Would a real beauty professional be proud to put this website in her Instagram bio?"

Then make the necessary improvements.

Do not settle for the first acceptable version.

==================================================
# 24. DO NOT OVER-ENGINEER
==================================================

Do not create unnecessary abstractions.

Do not install libraries for things that can be solved cleanly with existing React/Next.js/CSS.

Do not create complicated design systems.

Do not create 50 components before they are needed.

Do not build the custom booking engine unless explicitly required.

Do not implement advanced features before the core website is excellent.

==================================================
# 25. IMPORTANT: DO NOT ASK FOR PERMISSION BETWEEN EVERY SECTION
==================================================

You are allowed to proceed through the implementation phases yourself.

However, maintain the rule:

ONE MAJOR SECTION AT A TIME.

Do not ask:

"Should I build the hero?"

Just build it after the previous section has passed your quality check.

If a real business requirement is missing and you cannot safely infer it, then stop and ask.

For visual/design decisions, use your professional judgment.

==================================================
# 26. IMPLEMENTATION ORDER
==================================================

Follow this exact order:

STEP 01
Inspect repository + CLAUDE.md

STEP 02
Global design foundation

STEP 03
Navbar

STEP 04
Hero

STEP 05
Homepage introduction

STEP 06
Services preview

STEP 07
Featured work

STEP 08
About Yllka

STEP 09
Booking CTA

STEP 10
Footer

STEP 11
Homepage responsive refinement

STEP 12
Services page

STEP 13
Prices page

STEP 14
Work page

STEP 15
About page

STEP 16
Booking page

STEP 17
Admin authentication

STEP 18
Admin dashboard

STEP 19
Services management

STEP 20
Portfolio management

STEP 21
Booking integration

STEP 22
Settings

STEP 23
SEO

STEP 24
Performance optimization

STEP 25
Accessibility audit

STEP 26
Final visual polish

==================================================
# 27. FINAL STANDARD
==================================================

Do not aim for:

"Looks good."

Aim for:

"This looks like a professionally designed beauty brand website that could launch today."

Every major section should feel deliberate.

Every margin should have a reason.

Every font size should have a purpose.

Every image should have a purpose.

Every animation should have a purpose.

Every component should support the brand.

The final result should be:

MINIMAL
ELEGANT
PREMIUM
PERSONAL
EDITORIAL
FAST
RESPONSIVE
ACCESSIBLE
PRODUCTION-READY

Start now.

First, inspect the repository and CLAUDE.md.

Then implement ONLY:

1. Global design foundation
2. Navbar

Do not build the hero yet.

Once the navbar is implemented, run the project, inspect it carefully, fix it, and only then continue to the Hero section.

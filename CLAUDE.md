Yllka Hair & Makeup --- Claude Project Specification

1. Project Overview

This project is a premium, clean, modern website and lightweight
management platform for Yllka, a hair and makeup professional /
salon.

The website should feel like a real premium beauty brand, not like a
generic template or an AI-generated website.

The main goals are:

Present Yllka's brand and work professionally.

Clearly communicate available beauty services.

Organize services into categories such as Hair, Makeup, Bridal, and
other services that may be added later.

Display transparent pricing where appropriate.

Showcase recent work through a polished portfolio.

Allow customers to request/book appointments.

Give Yllka a private admin dashboard where she can manage the
website content and appointments.

Keep the architecture flexible enough to use an external booking
provider initially and replace it with a custom booking engine later
if necessary.

The public website should prioritize visual quality, simplicity,
trust, and conversion.

The admin dashboard should prioritize simplicity and usability.
Yllka should not need technical knowledge to manage it.

2. Core Product Concept

This is not just a static salon website.

It is a small content + booking management platform consisting of:

                         YLLKA WEBSITE
                              |
        ------------------------------------------------
        |              |              |               |
       HOME         SERVICES          WORK           PRICES
        |              |              |               |
        ------------------------------------------------
                              |
                       BOOK APPOINTMENT
                              |
                              v
                    BOOKING PROVIDER
                  (initially external)
                              |
                              v
                       YLLKA / ADMIN


                         ADMIN DASHBOARD
                              |
       ------------------------------------------------
       |              |              |               |
   SERVICES         WORK          BOOKINGS        SETTINGS
       |              |              |               |
    Categories      Photos        Status          Hours
    Prices          Portfolio     Calendar        Profile
    Duration        Featured      Management      Booking

The website and admin content should be owned by the application.

The appointment scheduling layer should be abstracted behind a
booking-provider interface so that the project does not become
permanently dependent on one external provider.

3. Technology Stack

Frontend

Use:

Next.js

TypeScript

React

Tailwind CSS

Modern CSS where Tailwind becomes unnecessarily complicated.

Next.js App Router.

Server Components by default.

Client Components only when interaction/state requires them.

Recommended:

Next.js
TypeScript
Tailwind CSS
React
next/image
next/font

Do not introduce unnecessary UI libraries.

If a component can be built cleanly with Tailwind and React, build it
directly.

4. Backend

Use:

FastAPI

Python

PostgreSQL

SQLAlchemy 2.x

Alembic

Pydantic / Pydantic Settings

Backend responsibilities:

Authentication

Admin authorization

Services

Categories

Portfolio/work

Business settings

Booking integration

Booking synchronization

Public API where necessary

Admin API

Validation

Image metadata

Website content management

Recommended backend structure:

backend/
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── database.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   │   ├── admin.py
│   │   ├── category.py
│   │   ├── service.py
│   │   ├── portfolio.py
│   │   ├── booking.py
│   │   ├── business_settings.py
│   │   └── booking_provider.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── category.py
│   │   ├── service.py
│   │   ├── portfolio.py
│   │   ├── booking.py
│   │   └── settings.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── public.py
│   │   ├── categories.py
│   │   ├── services.py
│   │   ├── portfolio.py
│   │   ├── bookings.py
│   │   └── settings.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── booking_service.py
│   │   ├── portfolio_service.py
│   │   ├── service_service.py
│   │   └── notification_service.py
│   │
│   ├── integrations/
│   │   ├── booking/
│   │   │   ├── base.py
│   │   │   ├── calcom.py
│   │   │   └── setmore.py
│   │   └── storage/
│   │       └── image_provider.py
│   │
│   └── utils/
│       ├── validation.py
│       └── dates.py
│
├── alembic/
├── tests/
├── requirements.txt
└── .env.example

The exact provider files should only be implemented when that provider
is selected.

Do not build fake integrations.

5. Frontend Project Structure

Recommended:

frontend/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── work/
│   │   │   └── page.tsx
│   │   │
│   │   ├── prices/
│   │   │   └── page.tsx
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx
│   │   │
│   │   ├── book/
│   │   │   └── page.tsx
│   │   │
│   │   └── contact/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── work/
│   │   │   └── page.tsx
│   │   ├── bookings/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   └── ...
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── home/
│   ├── services/
│   ├── work/
│   ├── booking/
│   ├── admin/
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── booking/
│
├── types/
│   ├── service.ts
│   ├── category.ts
│   ├── portfolio.ts
│   └── booking.ts
│
├── public/
│   ├── images/
│   └── ...
│
├── middleware.ts
├── next.config.ts
├── package.json
└── .env.example

If internationalization is not required for the first release, do not
implement [locale] just for the sake of it. The architecture should
remain easy to internationalize later.

6. Website Design Direction

Overall visual direction

The website must be:

Clean

Minimal

Elegant

Feminine without becoming overly decorative

Premium

Modern

Editorial

Image-focused

Spacious

Sophisticated

Mobile-first

Avoid the visual style of generic AI-generated websites.

Do NOT use:

Excessive gradients

Huge glowing text

Random glassmorphism

Excessive rounded cards

Generic SaaS layouts

Excessive animations

Decorative blobs

Fake statistics

"AI-style" landing page sections

Huge amounts of text

Stock-photo-looking imagery

Overuse of icons

Excessive shadows

Every section inside a separate card

The website should look like a real beauty studio / editorial brand.

Think:

Luxury beauty studio
+
Modern editorial website
+
Minimal portfolio
+
Simple booking experience

7. Brand Identity

The existing logo is the starting point.

The logo contains the word:

Yllka

with an elegant handwritten / calligraphic style.

The website should respect the logo rather than redesigning it.

The logo should be available as:

Transparent PNG

Preferably SVG/vector version if manually recreated accurately

Dark version for light backgrounds

Light version only if necessary

The existing "MAKE UP & HAIR" subtitle should not necessarily be part of
the primary website logo.

Use the standalone Yllka mark as the primary brand identifier.

8. Color Direction

Use a restrained palette.

Potential direction:

Primary:
#111111 / near-black

Background:
#FAF9F7 / warm off-white

Secondary:
#E9E2D9 / soft beige

Text:
#171717

Muted text:
#777777

Border:
#E5E1DC

Optional accent:
a subtle warm nude / muted rose / champagne tone

Do not blindly use these values everywhere.

The final palette should be derived from the actual logo and
photography.

The site should remain visually calm.

9. Typography

Typography is extremely important.

Use a combination such as:

Display font

Elegant serif:

Cormorant Garamond

DM Serif Display

Playfair Display

Instrument Serif

UI/body font

Clean modern sans:

Inter

Manrope

Geist

DM Sans

Do not use too many font families.

Recommended:

Display:
Elegant serif

Body:
Modern sans-serif

Logo:
Original Yllka logo

Typography should create hierarchy without relying on giant font sizes.

10. Homepage

The homepage should be intentionally short and strong.

Suggested structure:

HEADER
    Logo
    Services
    Work
    Prices
    About
    Book Appointment

HERO
    Large editorial image
    Yllka
    Short statement
    Book appointment CTA

INTRODUCTION
    Short personal introduction from Yllka

SERVICES
    Main categories
    Hair
    Makeup
    Bridal
    Other

FEATURED WORK
    Large visual gallery
    View all work

WHY YLLKA / EXPERIENCE
    Short section
    Focus on craftsmanship and personal experience

BOOKING CTA
    Strong but minimal

FOOTER
    Instagram
    Phone
    Location
    Opening hours
    Book appointment

Do not fill the homepage with unnecessary sections.

11. Hero Section

The hero should feel premium immediately.

Example direction:

Yllka

Hair & Makeup Artist

Beauty, styling and makeup
created around you.

[ Book an appointment ]

The actual copy should be refined once the client provides her preferred
wording.

Do not invent fake claims such as:

"The #1 salon"

"Award-winning"

"Best beauty studio"

"Thousands of happy clients"

unless the client can verify them.

12. Services

Services must be dynamic.

Do not hardcode services directly into React components.

Database hierarchy:

Category
    |
    ├── Service
    ├── Service
    └── Service

Example:

HAIR
    Hair Styling
    Blow Dry
    Haircut
    Hair Coloring

MAKEUP
    Day Makeup
    Evening Makeup
    Event Makeup

BRIDAL
    Bridal Makeup
    Bridal Hair
    Hair + Makeup

OTHER
    Custom service

These are examples only.

Yllka must be able to create her own categories and services from the
admin dashboard.

13. Service Data Model

Each service should support:

id
category_id
name
slug
description
price
currency
duration_minutes
image
is_active
is_featured
sort_order
created_at
updated_at

Optional:

price_type

Possible values:

fixed
starting_from
custom

This matters because beauty services do not always have a fixed price.

Example:

Bridal Makeup
Starting from €80

instead of:

Bridal Makeup
€80

14. Prices Page

The prices page should not simply be a boring table.

Use category-based sections.

Example:

HAIR

Hair Styling ........ €XX
Blow Dry ............ €XX
Haircut ............. €XX


MAKEUP

Day Makeup .......... €XX
Event Makeup ........ €XX


BRIDAL

Bridal Makeup ....... from €XX
Bridal Hair ......... from €XX

The design should remain editorial and clean.

Pricing should come from the database.

15. Work / Portfolio Page

The "Work" page is one of the most important parts of the site.

It should visually demonstrate quality.

Use a strong image grid.

Possible layout:

WORK

All
Hair
Makeup
Bridal

[ image ][ image ]
[   large image    ]
[ image ][ image ]

The admin should be able to upload a new work item.

Each work item:

id
title
slug
description
category
images
featured
published
sort_order
created_at

If multiple images are supported:

portfolio_item
    |
    ├── image
    ├── image
    └── image

The website should use optimized images.

Do not load original full-resolution files directly into the browser.

16. Work Detail Page

Optional for MVP, recommended for SEO and portfolio depth.

Example:

Bridal Look — Summer Wedding

Large image

Short description

Category:
Bridal

[ More work ]

Keep it visual.

17. Booking Page

The booking page should be one of the cleanest pages on the website.

Do not overwhelm the customer.

Recommended flow:

BOOK YOUR APPOINTMENT

Choose a service

    Hair
    Makeup
    Bridal
    Other

Choose service

    Bridal Makeup
    90 minutes
    From €80

Choose date

Choose time

Your details

    Name
    Phone
    Email
    Optional note

[ Request Appointment ]

The exact flow depends on the selected booking provider.

18. Booking Architecture

This is a critical architectural requirement.

Do NOT hardwire the frontend to a single booking provider.

Create a conceptual interface:

BookingProvider

getAvailability()
createBooking()
cancelBooking()
rescheduleBooking()
getBookings()
getBooking()

The application should be able to use:

Cal.com
Setmore
CustomBookingProvider

without rewriting the entire website.

Example conceptual structure:

integrations/
└── booking/
    ├── base.py
    ├── calcom.py
    └── setmore.py

The exact APIs and webhook capabilities of the chosen provider must be
verified before implementation.

Do not assume a free plan provides API access just because the provider
offers a free booking page.

19. Recommended Initial Booking Strategy

For the first version, prefer an established booking provider rather
than building scheduling logic from scratch.

Potential providers to evaluate:

Cal.com

Setmore

Other reputable appointment scheduling providers

The provider should ideally support:

Availability

Working hours

Appointment duration

Booking confirmation

Cancellation

Rescheduling

Notifications

Calendar integration

Website embedding

API/webhooks if available

The provider should be evaluated based on the client's actual needs and
current plan limitations.

Do not promise a free integration until the provider's current
API/webhook/embed limitations have been verified.

20. Hybrid Booking Model

Preferred architecture:

Customer
   |
   v
Yllka Website
   |
   v
Booking Integration
   |
   v
External Booking Provider
   |
   +----> Calendar
   |
   +----> Notifications
   |
   +----> Booking Management

Meanwhile:

External Provider
       |
       | webhook / API sync
       v
Yllka Backend
       |
       v
Local Booking Records
       |
       v
Admin Dashboard

This allows Yllka to see important booking information inside the custom
admin dashboard if the selected provider supports reliable
synchronization.

If the selected provider does not expose the necessary API/webhooks on
the chosen plan, do not fake synchronization.

Instead, provide a clear admin link to the provider's booking management
interface.

21. Manual Confirmation vs Automatic Confirmation

The booking system should support the concept of:

PENDING
CONFIRMED
CANCELLED
COMPLETED
NO_SHOW

For a small salon, a useful flow can be:

Customer submits booking
        |
        v
PENDING
        |
        v
Yllka reviews
    /       \
   /         \
CONFIRMED   CANCELLED

However, if the external booking provider handles automatic confirmation
and real-time availability correctly, automatic confirmation may be
preferable.

The final choice should be made with Yllka before implementation.

22. Admin Dashboard

The admin dashboard is private.

Main navigation:

Dashboard

Services
    Categories
    Services

Work
    Portfolio

Bookings

Settings
    Business
    Opening Hours
    Booking
    Social Links

23. Admin Dashboard --- Dashboard Home

Keep it simple.

Possible cards:

Today's Appointments
Upcoming Appointments
Pending Requests
Total Services
Portfolio Items

Then:

Today's schedule

09:00  Bridal Makeup      Confirmed
11:00  Hair Styling       Confirmed
14:00  Makeup             Pending

Do not create fake analytics just to fill space.

24. Admin --- Categories

Yllka can:

Create category

Rename category

Delete category

Reorder category

Activate/deactivate category

Example:

Hair
Makeup
Bridal
Other

Each category should have:

id
name
slug
description
image
is_active
sort_order

Deleting a category that contains services should require a safe
confirmation and should not silently delete associated data.

25. Admin --- Services

Yllka can:

Create service

Edit service

Change price

Change duration

Change category

Add description

Enable/disable service

Reorder service

Example form:

Service name
Category
Description

Price
Price type

Duration

Active
Featured

[ Save service ]

Do not expose technical database concepts to the admin.

26. Admin --- Work

Yllka should be able to:

Upload photos
Create work item
Edit title
Edit description
Assign category
Mark featured
Publish/unpublish
Delete
Reorder

The upload interface should be very simple.

Example:

ADD NEW WORK

[ Upload photos ]

Title
Category
Description

[ ] Featured

[ Publish ]

Image previews should appear before saving.

27. Admin --- Bookings

Bookings should have clear status indicators.

Example:

BOOKINGS

Today

10:00
Bridal Makeup
Anna K.
+383 XX XXX XXX
CONFIRMED

14:30
Hair Styling
Sara K.
PENDING

Filters:

Today
Tomorrow
This week
Upcoming
Pending
Confirmed
Cancelled
Completed

If the provider supports management through API, actions can include:

Confirm
Cancel
Reschedule
View details

Otherwise, provide:

Open in booking provider

Do not create a fake local cancellation/rescheduling operation that does
not update the real provider.

28. Business Settings

Yllka should be able to manage:

Business name
Phone
Email
Address
Instagram
Facebook
Google Maps URL

Opening hours

Example:

Monday
09:00 — 18:00

Tuesday
09:00 — 18:00

Wednesday
Closed

These settings should be stored in the database.

29. Authentication

The admin dashboard must never be public.

Use secure authentication.

Recommended:

Secure HTTP-only cookies

Password hashing

Short-lived access tokens if JWT is used

Refresh mechanism if necessary

CSRF protection where applicable

Server-side authorization checks

Protected admin routes

Do not store authentication tokens in localStorage unless there is a
strong architectural reason.

For a single-admin business, keep the system simple.

The initial version can support one admin account.

Design the data model so additional admin users can be added later.

30. Database

Recommended PostgreSQL entities:

admins
categories
services
portfolio_items
portfolio_images
bookings
business_settings
business_hours
blocked_periods
booking_provider_settings

Potential relationships:

categories
    |
    └── services


portfolio_items
    |
    └── portfolio_images

Bookings should reference the local service when possible, but external
provider identifiers should also be stored.

Example:

bookings
    id
    provider
    external_booking_id
    service_id
    customer_name
    customer_phone
    customer_email
    start_time
    end_time
    status
    notes
    created_at
    updated_at

31. External Booking IDs

If using an external booking provider, ALWAYS store the provider's
booking identifier.

Example:

provider:
calcom

external_booking_id:
abc123

This allows the backend to synchronize or modify the external
appointment later.

Never assume the local database ID is enough.

32. Timezones

Timezone handling must be explicit.

For Kosovo, the business timezone should normally be configured as:

Europe/Pristina

Do not hardcode timezone logic throughout the application.

Use a configurable business timezone.

Store timestamps consistently and convert them for display.

Avoid naive datetime objects wherever possible.

33. Images

Portfolio images are central to the website.

Do not store large image binaries directly inside PostgreSQL.

Use an image storage/CDN provider.

Potential options:

Cloudinary

ImageKit

Vercel-compatible image storage

Other reliable object storage

Store:

url
public_id / asset_id
width
height
alt_text
sort_order

Use Next.js image optimization.

Images should have:

Correct aspect ratios

Responsive sizes

Lazy loading where appropriate

Meaningful alt text

Proper compression

34. SEO

The public website should be SEO-ready.

Important:

Metadata per page

Open Graph metadata

Twitter/X metadata where relevant

Canonical URLs

Sitemap

Robots.txt

Semantic HTML

Correct heading hierarchy

Image alt text

Local business structured data where appropriate

Potential structured data:

BeautySalon
LocalBusiness
Person
Service

Do not add structured data that does not accurately describe the
business.

35. Social Sharing

When someone shares the website in:

WhatsApp

Instagram messages

Facebook

Messenger

iMessage

the preview should have:

Yllka
Hair & Makeup

[beautiful selected image]

Short description

Implement proper Open Graph metadata.

Use a dedicated social preview image.

36. Mobile Design

Mobile is extremely important.

Many customers will discover Yllka through Instagram and open the
website on their phone.

The website must be designed mobile-first.

Pay particular attention to:

Header

Logo size

Navigation

Image galleries

Service cards

Price lists

Booking flow

Form inputs

Sticky booking CTA if appropriate

Do not simply shrink the desktop layout.

The mobile version should feel intentionally designed.

37. Instagram Integration

Do not depend on scraping Instagram.

For the initial version, use:

Instagram profile link

Manually managed portfolio

Optional Instagram button

Potential future feature:

Latest Instagram Work

Only implement this if a reliable official integration is available.

38. Contact

Contact section should include:

Phone
Instagram
Location
Opening hours
Google Maps

If the business has a physical location, provide a clear map/directions
action.

On mobile:

Call
Instagram
Get Directions
Book

39. Navigation

Desktop navigation should be minimal.

Example:

Yllka

Services
Work
Prices
About

[ Book Appointment ]

Mobile:

Yllka          Menu

Do not put 10 links into the navigation.

40. Animations

Animations should be subtle.

Use:

Fade-in

Slight image reveal

Smooth hover

Gentle page transitions

Avoid:

Excessive parallax

Bouncing elements

Constant floating animations

Large loading animations

Scroll hijacking

The website should feel premium because of its design, photography,
spacing and typography --- not because it has lots of animation.

41. Accessibility

Implement:

Semantic HTML

Keyboard navigation

Visible focus states

Accessible buttons

Form labels

Proper contrast

Alt text

Accessible dialogs

Error messages

aria-* only where necessary

Do not sacrifice accessibility for visual effects.

42. Performance

Target excellent Core Web Vitals.

Important:

Optimize images

Use next/image

Avoid huge JavaScript bundles

Use Server Components where appropriate

Lazy-load heavy components

Avoid unnecessary client-side state

Avoid loading animation libraries globally

Optimize fonts

Avoid unnecessary third-party scripts

The portfolio page should not load 30 full-resolution images
simultaneously.

43. API Design

Public endpoints could include:

GET /api/categories
GET /api/services
GET /api/services/{slug}
GET /api/portfolio
GET /api/portfolio/{slug}
GET /api/business-settings

Admin endpoints:

POST   /api/admin/categories
PATCH  /api/admin/categories/{id}
DELETE /api/admin/categories/{id}

POST   /api/admin/services
PATCH  /api/admin/services/{id}
DELETE /api/admin/services/{id}

POST   /api/admin/portfolio
PATCH  /api/admin/portfolio/{id}
DELETE /api/admin/portfolio/{id}

GET    /api/admin/bookings
PATCH  /api/admin/bookings/{id}

Exact routes can be adjusted based on FastAPI architecture.

44. Validation

Use Pydantic schemas on the backend.

Never trust frontend validation alone.

Validate:

Service price

Duration

Category IDs

Image metadata

Booking dates

Customer contact details

Admin input

Return useful errors.

Example:

{
  "message": "Service duration must be greater than 0."
}

Do not expose stack traces to users.

45. Error Handling

The website should handle:

API unavailable

Booking provider unavailable

Invalid booking

Image upload failure

Authentication failure

Missing service

Missing portfolio item

Network timeout

The customer should see friendly messages.

Never expose:

SQL errors

stack traces

internal API details

secrets

provider credentials

46. Environment Variables

Example:

DATABASE_URL=

NEXT_PUBLIC_API_URL=

JWT_SECRET=

ADMIN_EMAIL=

BOOKING_PROVIDER=

CALCOM_API_KEY=
CALCOM_EVENT_TYPE_ID=

SETMORE_API_KEY=

IMAGE_PROVIDER=
IMAGE_PROVIDER_API_KEY=

RESEND_API_KEY=

BUSINESS_TIMEZONE=Europe/Pristina

Do not commit .env.

Create:

.env.example

with placeholders only.

47. Email Notifications

Email notifications can be handled by an email provider such as Resend.

Potential emails:

Customer

Appointment request received
Appointment confirmed
Appointment cancelled
Appointment rescheduled

Yllka

New appointment request
Appointment cancelled
Appointment changed

Keep email templates clean and branded.

Do not send unnecessary emails.

48. Booking Notifications

If the external provider already sends confirmation/reminder emails,
avoid duplicating them.

The system should decide which component owns each notification.

For example:

Booking provider:
- appointment confirmation
- reminder

Custom backend:
- admin notification
- website-specific communication

Avoid duplicate notifications.

49. Admin UX Principles

Yllka is not a developer.

The admin interface should feel like a simple CMS.

Bad:

Portfolio Item ID
Slug
Sort Order
Published Boolean

Better:

Title
Category
Photos

[ Featured work ]

Visibility:
Published / Hidden

Technical fields should be hidden unless needed.

50. CRUD Principles

Every admin CRUD operation should have:

Loading state

Success state

Error state

Empty state

Confirmation for destructive actions

Optimistic UI only where safe

For delete operations:

Are you sure you want to delete this work?

This action cannot be undone.

[Cancel] [Delete]

51. Empty States

Do not leave blank screens.

Example:

No portfolio work yet.

Add your first work to start building your gallery.

[ Add Work ]

Bookings:

No upcoming appointments.

Services:

No services in this category.

[ Add Service ]

52. Seed Data

During development, create realistic seed data.

Example categories:

Hair
Makeup
Bridal
Other

Example services:

Hair Styling
Blow Dry
Event Makeup
Bridal Makeup
Bridal Hair

Use placeholder prices only in development.

Clearly label them as demo data.

Do not accidentally publish demo content to production.

53. Security

Important:

Never expose database credentials

Never expose booking API keys

Never expose Resend API keys

Validate uploads

Restrict image file types

Restrict image sizes

Rate-limit authentication

Rate-limit public booking-related endpoints

Protect admin endpoints

Sanitize user-generated content where needed

Use HTTPS in production

For image uploads:

Allowed examples:

JPEG
PNG
WebP
AVIF

Limit file size.

54. Admin Authorization

All admin API endpoints must verify authentication server-side.

Do not rely on:

if (isAdmin) { ... }

in the frontend as the security mechanism.

Frontend route protection is UX.

Backend authorization is security.

Both should be implemented.

55. Booking Conflict Protection

If the custom booking engine is ever implemented, appointment creation
must be transaction-safe.

Never do:

check availability
then insert booking

without protecting against race conditions.

Two customers could otherwise book the same slot simultaneously.

Use appropriate PostgreSQL constraints / transactions / locking
strategies.

However, if an external booking provider is responsible for
availability, do not recreate its scheduling logic locally.

56. Custom Booking Engine --- Future Option

Only build a fully custom booking engine if the external providers do
not meet the client's requirements.

A custom engine would need:

business_hours
blocked_periods
services.duration
bookings
buffer_time
timezone
availability calculation
conflict detection
notifications

Availability would conceptually be:

working hours
-
blocked periods
-
existing appointments
=
available slots

Then:

available slots
+
service duration
+
buffer
=
valid appointment windows

This should be treated as a later feature, not an MVP requirement.

57. MVP

The first production version should focus on:

Public

Home

Services

Prices

Work

About

Contact

Book Appointment

Admin

Login

Dashboard

Categories

Services

Portfolio

Basic settings

Booking visibility / provider access

Integrations

Image storage

External booking provider

Email if required

Analytics if required

Do not build advanced analytics, client CRM, loyalty programs, payments,
coupons, or complex scheduling unless the client explicitly requests
them.

58. Phase 2

Potential future features:

Customer accounts
Booking history
Online deposits
Online payments
Automatic reminders
SMS reminders
Client profiles
Before/after gallery
Reviews
Discount codes
Gift cards
Analytics
Revenue dashboard
Multiple staff members
Multiple locations
Custom booking engine
Calendar synchronization

These should not complicate the MVP.

59. Development Order

Implement in this order:

Phase 1 --- Foundation

Repository setup

Next.js setup

FastAPI setup

PostgreSQL

Environment configuration

Database migrations

Basic API structure

Authentication

Phase 2 --- Public Website

Global design system

Navigation

Footer

Homepage

Services

Prices

Work

About

Contact

Phase 3 --- Admin

Admin layout

Dashboard

Categories

Services

Portfolio

Settings

Phase 4 --- Booking

Decide provider

Implement provider adapter

Booking page

Availability

Booking creation

Confirmation

Admin synchronization if supported

Phase 5 --- Production

SEO

Metadata

Open Graph

Performance

Accessibility

Security review

Mobile testing

Production deployment

60. Coding Rules

Keep it simple

Do not over-engineer.

Prefer:

simple component

over:

generic abstraction used once

Prefer:

clear service

over:

five layers of abstraction

Do not duplicate business logic

Booking rules belong in the backend/provider layer.

Do not calculate availability independently in multiple frontend
components.

Type everything

Avoid:

any

unless there is a documented reason.

Use proper interfaces/types.

Do not hardcode client content

Bad:

const services = [
  { name: "Bridal Makeup", price: 80 }
]

Production services must come from the backend.

61. Design Rules for Claude

When modifying the UI:

Preserve existing functionality.

Do not rewrite the entire project unnecessarily.

Inspect the existing implementation before changing it.

Reuse existing components when they are good.

Avoid unnecessary dependencies.

Keep visual hierarchy strong.

Prioritize whitespace.

Use real content where available.

Do not invent claims about Yllka.

Do not use generic AI-generated marketing language.

Avoid excessive cards.

Avoid excessive rounded corners.

Avoid excessive animations.

Avoid giant text everywhere.

Make the website look intentionally designed.

62. Content Tone

Copy should be:

Short

Elegant

Personal

Confident

Warm

Professional

Avoid:

"We are revolutionizing the beauty industry with our innovative
solutions..."

This is a beauty professional, not a software startup.

Prefer:

"Hair and makeup, thoughtfully created for your occasion."

Or:

"A beauty experience shaped around you."

Actual copy should be finalized with Yllka.

63. Important Client Questions

Before finalizing the booking system, ask Yllka:

What exact services do you offer?

What are the prices?

Which services have variable pricing?

How long does each service take?

What are your working hours?

Which days are normally closed?

Do you accept same-day appointments?

How far in advance can customers book?

Do you want appointments confirmed automatically?

Or do you want to approve every request?

Do you require a deposit?

Do you accept cash, bank transfer, or card?

What happens if a customer cancels?

How much notice is required for cancellation?

Do you want reminders?

Do you have one location?

Will another makeup/hair artist use the system later?

What phone number should customers use?

What Instagram account should be linked?

What exact portfolio categories do you want?

These answers should determine the final booking architecture.

64. Definition of Done

The project is ready for production when:

Public website

Looks polished on mobile and desktop.

No placeholder content remains.

All services come from the database.

Prices come from the database.

Portfolio comes from the database.

Images are optimized.

Booking flow works.

Contact information is correct.

SEO metadata is configured.

Open Graph preview works.

No console errors.

No broken links.

Admin

Yllka can log in.

Yllka can create categories.

Yllka can create/edit services.

Yllka can change prices.

Yllka can upload portfolio work.

Yllka can hide/delete work.

Yllka can see booking information.

Yllka can manage relevant booking actions.

Destructive actions have confirmation.

Errors are understandable.

Security

.env is not committed.

Admin endpoints are protected.

API keys are server-side only.

Uploads are validated.

Authentication is secure.

Production uses HTTPS.

Performance

Images are optimized.

Mobile performance is good.

No unnecessary client-side JavaScript.

No unnecessary third-party scripts.

65. Final Product Vision

The finished website should feel like:

A premium personal beauty brand
        +
A beautiful portfolio
        +
A simple booking experience
        +
A small private CMS

The customer should think:

"This looks professional. I can immediately see her work, understand
the services, see the prices, and book."

Yllka should think:

"I can manage my services, prices, photos and appointments myself
without needing a developer."

That is the core purpose of this project.

66. Priority Rule

When making implementation decisions, prioritize in this order:

1. Client usability
2. Customer booking experience
3. Visual quality
4. Reliability
5. Performance
6. Security
7. Maintainability
8. Future extensibility

Do not sacrifice simplicity for theoretical flexibility.

Build the smallest system that solves Yllka's real business needs well.

67. Instructions to Claude Code

Before implementing anything:

Inspect the existing repository.

Understand the current architecture.

Identify what already exists.

Do not overwrite working functionality without a reason.

Create a concise implementation plan.

Implement incrementally.

Run the project after major changes.

Check TypeScript errors.

Check Python/FastAPI errors.

Check responsive behavior.

Check the browser console.

Test all admin CRUD operations.

Test booking edge cases.

Test authentication.

Test production build.

When you are uncertain about a business requirement, do not invent
it. Use a sensible placeholder or ask for clarification.

When you are uncertain about an external booking provider's current
capabilities, verify its current documentation before implementing
against it.

The goal is not to build the most technically complicated system.

The goal is to build a beautiful, reliable, maintainable website and
management platform that Yllka can actually use every day.

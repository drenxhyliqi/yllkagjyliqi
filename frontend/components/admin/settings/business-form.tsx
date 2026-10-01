"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveBusiness } from "@/app/admin/(panel)/settings/actions";
import { AdminSection } from "@/components/admin/admin-page";
import { TextField } from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";
import type { AdminBusiness } from "@/types/admin-content";

const text = adminText.settings;

export function BusinessForm({ business }: { business: AdminBusiness }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveBusiness, {
    status: "idle",
  });
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;

  return (
    <form action={formAction}>
      <AdminSection title={text.contact} text={text.contactText}>
        <div className="space-y-5">
          <TextField
            label={text.businessName}
            name="business_name"
            defaultValue={business.business_name}
            required
            maxLength={80}
            autoComplete="organization"
            error={errorFor("business_name")}
          />
          <TextField
            label={text.phone}
            name="phone"
            type="tel"
            defaultValue={business.phone ?? ""}
            hint={text.phoneHint}
            maxLength={40}
            autoComplete="tel"
            optional
            error={errorFor("phone")}
          />
          <TextField
            label={text.email}
            name="email"
            type="email"
            defaultValue={business.email ?? ""}
            maxLength={254}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            optional
            error={errorFor("email")}
          />
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr] sm:gap-4">
            <TextField
              label={text.street}
              name="street"
              defaultValue={business.street ?? ""}
              placeholder={text.streetPlaceholder}
              maxLength={120}
              autoComplete="street-address"
              optional
              error={errorFor("street")}
            />
            <TextField
              label={text.city}
              name="city"
              defaultValue={business.city ?? ""}
              maxLength={80}
              autoComplete="address-level2"
              error={errorFor("city")}
            />
          </div>
          <TextField
            label={text.mapsUrl}
            name="maps_url"
            type="url"
            inputMode="url"
            defaultValue={business.maps_url ?? ""}
            hint={text.mapsHint}
            placeholder="https://maps.app.goo.gl/…"
            maxLength={1000}
            autoCapitalize="none"
            spellCheck={false}
            optional
            error={errorFor("maps_url")}
          />
        </div>
      </AdminSection>

      <AdminSection title={text.social} text={text.socialText}>
        <div className="space-y-5">
          <TextField
            label={text.instagram}
            name="instagram"
            defaultValue={business.instagram ? `@${business.instagram}` : ""}
            hint={text.instagramHint}
            placeholder="@yllka"
            maxLength={200}
            autoCapitalize="none"
            spellCheck={false}
            optional
            error={errorFor("instagram")}
          />
          <TextField
            label={text.facebook}
            name="facebook_url"
            inputMode="url"
            defaultValue={business.facebook_url ?? ""}
            hint={text.facebookHint}
            placeholder="facebook.com/…"
            maxLength={300}
            autoCapitalize="none"
            spellCheck={false}
            optional
            error={errorFor("facebook_url")}
          />
        </div>
      </AdminSection>

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-(--gutter) border-t border-line bg-paper/95 px-(--gutter) pb-4 backdrop-blur-sm lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:backdrop-blur-none">
        <FormFooter state={state} pending={pending} label={text.save} />
      </div>

      <AdminSection title={text.hoursTitle} text={text.hoursText}>
        <Link
          href="/admin/appointments"
          className="group inline-flex min-h-11 items-center gap-3 text-small underline-offset-4 hover:underline"
        >
          {text.hoursLink}
          <ArrowRightIcon className="w-5 transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </Link>
      </AdminSection>
    </form>
  );
}

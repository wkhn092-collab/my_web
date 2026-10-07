import { defineQuery } from 'next-sanity';

/** One query for all site-wide content. Explicit projections only; never whole documents. */
export const SITE_CONTENT_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    brandName, legalName, businessType, businessNumber, city, remoteNote, phoneE164, whatsappE164, email,
    accessibilityCoordinator{name, phoneE164, email}
  },
  "hours": *[_id == "hours"][0]{
    day0[]{from, to}, day1[]{from, to}, day2[]{from, to}, day3[]{from, to},
    day4[]{from, to}, day5[]{from, to}, day6[]{from, to},
    closedDates,
    cutoffMinutes
  },
  "announcement": *[_id == "announcement" && active == true && (!defined(endsAt) || endsAt > now())][0]{active, text, href, endsAt},
  "home": *[_id == "homePage"][0]{
    hero{title, lead, reassurance},
    works{title, intro},
    depth{title, layers[]{title, body}},
    services{title, note},
    about{text},
    faq{title},
    closing{title, privacyNote}
  },
  "about": *[_id == "aboutPage"][0]{title, paragraphs, processTitle, process},
  "services": *[_type == "service"] | order(order asc){
    "id": _id, title, summary, includes, siteType, priceFrom, ctaLabel
  },
  "niches": *[_type == "niche"] | order(order asc){"slug": slug.current, title},
  "projects": *[_type == "project" && defined(slug.current)] | order(order asc){
    "id": _id,
    "slug": slug.current,
    title,
    "niche": niche->{"slug": slug.current, title},
    siteType,
    tier,
    "isConcept": coalesce(isConcept, true),
    liveUrl,
    summary,
    challenge,
    solution,
    "cover": select(defined(cover.asset) => {
      "url": cover.asset->url,
      "alt": cover.alt,
      "width": cover.asset->metadata.dimensions.width,
      "height": cover.asset->metadata.dimensions.height,
      "lqip": cover.asset->metadata.lqip
    }),
    "metrics": coalesce(metrics[]{label, value, measuredAt, source}, [])
  },
  "faqs": *[_type == "faq"] | order(order asc){"id": _id, question, answer},
  "addons": *[_type == "addon" && active == true && defined(slug.current)] | order(order asc){
    "slug": slug.current, title, benefit, siteTypes
  },
  "testimonials": *[_type == "testimonial" && status == "approved" && defined(consentDate)] | order(consentDate desc)[0...6]{
    "id": _id,
    fullName,
    role,
    quote,
    rating,
    "photo": select(defined(photo.asset) => {
      "url": photo.asset->url,
      "alt": photo.alt,
      "width": photo.asset->metadata.dimensions.width,
      "height": photo.asset->metadata.dimensions.height,
      "lqip": photo.asset->metadata.lqip
    }),
    "project": select(defined(project->slug.current) => project->{title, "slug": slug.current, "isConcept": coalesce(isConcept, true)})
  },
  "legalPages": *[_type == "legalPage" && defined(slug.current)] | order(title asc){"slug": slug.current, title}
}`);

export const LEGAL_PAGE_QUERY = defineQuery(
  `*[_type == "legalPage" && slug.current == $slug][0]{"slug": slug.current, title, updatedAt, body}`,
);

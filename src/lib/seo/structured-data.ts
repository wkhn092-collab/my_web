import type { ReplyHours } from '@/lib/domain/reply-window';
import type { Faq, Project, Service, SiteSettings } from '@/lib/content/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Ld = Record<string, unknown>;

/** JSON for a <script type="application/ld+json">. `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: Ld | Ld[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const businessId = (base: string) => `${base}/#business`;

/** One entry per time range, grouped by identical hours so Google gets the compact form. */
function openingHours(hours: ReplyHours) {
  const groups = new Map<string, string[]>();
  hours.days.forEach((ranges, day) => {
    for (const range of ranges) {
      const key = `${range.from}-${range.to}`;
      groups.set(key, [...(groups.get(key) ?? []), DAY_NAMES[day]]);
    }
  });
  return [...groups].map(([key, days]) => {
    const [opens, closes] = key.split('-');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes };
  });
}

/** The studio itself: city only (no street, remote work), all of Israel as the service area, no price range. */
export function businessLd(settings: SiteSettings, hours: ReplyHours, base: string): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': businessId(base),
    name: settings.brandName,
    ...(settings.legalName ? { legalName: settings.legalName } : {}),
    description: 'סטודיו לבניית אתרים לעסקים: דפי נחיתה, אתרי תדמית ואתרי פרימיום עם תלת-ממד.',
    url: `${base}/`,
    image: `${base}/opengraph-image`,
    telephone: settings.phoneE164,
    email: settings.email,
    address: { '@type': 'PostalAddress', addressLocality: settings.city, addressCountry: 'IL' },
    areaServed: { '@type': 'Country', name: 'ישראל' },
    founder: { '@type': 'Person', name: 'אבישי' },
    openingHoursSpecification: openingHours(hours),
    knowsLanguage: 'he',
  };
}

export function servicesLd(services: Service[], base: string): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.title,
        description: `${service.summary} ${service.includes}`,
        provider: { '@id': businessId(base) },
        areaServed: { '@type': 'Country', name: 'ישראל' },
      },
    })),
  };
}

export function faqLd(faqs: Faq[]): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** A concept build says so in its description: no implied paying client. */
export function projectLd(project: Project, base: string): Ld[] {
  const url = `${base}/projects/${project.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.isConcept ? `פרויקט קונספט: ${project.summary}` : project.summary,
      url,
      image: `${url}/opengraph-image`,
      genre: project.niche.title,
      creator: { '@id': businessId(base) },
      ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'עומק', item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: 'פרויקטים', item: `${base}/projects` },
        { '@type': 'ListItem', position: 3, name: project.title, item: url },
      ],
    },
  ];
}

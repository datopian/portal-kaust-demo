/* eslint-disable import/no-anonymous-default-export */

export const siteTitle = "KAUST Data Portal";
export const title = "KAUST";
export const description =
  "Discover and explore academic and scientific datasets. Search, preview, and analyse open research data powered by KAUST.";

export const url = "https://portaljs-cloud-frontend-template.vercel.app";
export const imageUrl = `${url}/images/portaljs-frontend.png`;

export default {
  defaultTitle: `${siteTitle} | ${title}`,
  siteTitle,
  description,
  canonical: url,
  openGraph: {
    siteTitle,
    description,
    type: "website",
    locale: "en_US",
    url,
    site_name: siteTitle,
    images: [
      {
        url: imageUrl,
        alt: siteTitle,
        width: 1200,
        height: 627,
        type: "image/png",
      },
    ],
  },
  twitter: {
    handle: "@kaust",
    site: "@kaust",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "KAUST, research data, academic datasets, open science, data portal",
    },
    {
      name: "author",
      content: "KAUST",
    },
    {
      property: "og:image:width",
      content: "1200",
    },
    {
      property: "og:image:height",
      content: "627",
    },
    {
      property: "og:locale",
      content: "en_US",
    },
  ],
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ]
};

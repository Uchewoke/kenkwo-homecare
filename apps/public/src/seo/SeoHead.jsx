import { useEffect } from 'react'

const ensureMeta = (attributeName, attributeValue) => {
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }
  return element
}

const setMetaTag = (attributeName, attributeValue, content) => {
  const element = ensureMeta(attributeName, attributeValue)
  element.setAttribute('content', content)
}

const ensureCanonical = () => {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  return link
}

const ensureJsonLd = () => {
  let script = document.head.querySelector('script[data-seo="jsonld"]')
  if (!script) {
    script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.setAttribute('data-seo', 'jsonld')
    document.head.appendChild(script)
  }
  return script
}

export default function SeoHead({ title, description, canonicalUrl, imageUrl, jsonLdObject }) {
  useEffect(() => {
    document.title = title

    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', 'article')
    setMetaTag('property', 'og:url', canonicalUrl)
    setMetaTag('property', 'og:image', imageUrl)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', imageUrl)

    const canonical = ensureCanonical()
    canonical.setAttribute('href', canonicalUrl)

    if (jsonLdObject) {
      const script = ensureJsonLd()
      script.textContent = JSON.stringify(jsonLdObject)
    }
  }, [title, description, canonicalUrl, imageUrl, jsonLdObject])

  return null
}
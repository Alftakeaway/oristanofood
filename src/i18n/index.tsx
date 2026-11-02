"use client";
import React, {createContext, useContext, useEffect, type ReactNode} from "react";
import {translate,type Locale} from './copy';
export {translate,type Locale} from './copy';
const Language = createContext<{locale:Locale;path:string}>({locale:"it",path:"/"});
export function localPath(path: string, locale: Locale) {
 if(!path.startsWith('/') || path.startsWith('//') || /^\/(?:api|_next|photos|images|assets)(?:\/|$)/.test(path) || /\.[a-z0-9]+(?:[?#]|$)/i.test(path)) return path;
 const clean = path.replace(/^\/en(?=\/|$)/,'') || '/';
 return locale === 'en-GB' ? `/en${clean === '/' ? '' : clean}` : clean;
}
export function LocaleProvider({locale,path="/",children}: {locale: Locale; path?:string; children:ReactNode}) {
 useEffect(() => {
  document.documentElement.lang=locale;
  if(locale === 'en-GB') {
   document.title=translate(document.title,locale);
   const description=document.querySelector('meta[name="description"]');
   if(description) description.setAttribute('content',translate(description.getAttribute('content') || '',locale));
  }
 },[locale]);
 return <Language.Provider value={{locale,path}}>{children}</Language.Provider>;
}
export function useLanguage() {return useContext(Language).locale;}
export function useTranslation() {const locale=useLanguage();return (text:string) => translate(text,locale);}
/** Translate rendered copy, never product IDs, form values, prices or API payloads. */
export function LocalizedContent({children}: {children:ReactNode}) {
 const locale=useLanguage();
 if(locale==='it') return <>{children}</>;
 function visit(node:ReactNode):ReactNode {
  if(typeof node==='string') return node.length === 1 ? node : translate(node,locale);
  if(!React.isValidElement<Record<string,unknown>>(node)) return node;
  const props=node.props;
  if(props['data-no-translate']) return node;
  const next:Record<string,unknown>={};
  for(const attr of ['title','alt','placeholder','aria-label','aria-description','text','heading','subheading','eyebrow','ctaLabel']) if(typeof props[attr]==='string') next[attr]=translate(props[attr] as string,locale);
  if(typeof props.href==='string') {
   next.href=localPath(props.href,locale);
   try {
    const url=new URL(props.href);
    if(['wa.me','api.whatsapp.com'].includes(url.hostname) && url.searchParams.has('text')) {url.searchParams.set('text',translate(url.searchParams.get('text') || '',locale));next.href=url.toString();}
    if(url.protocol==='mailto:') {for(const field of ['subject','body'])if(url.searchParams.has(field))url.searchParams.set(field,translate(url.searchParams.get(field) || '',locale));next.href=url.toString();}
   }catch{/* Fragment and relative links stay local. */}
  }
  if('children' in props) next.children=React.Children.map(props.children as ReactNode,visit);
  return React.cloneElement(node,next);
 }
 return <>{React.Children.map(children,visit)}</>;
}
export function LanguageSwitcher() {
 const locale=useLanguage();
 const current=useContext(Language).path;
 const [path,queryString]=current.split('?');
 const query=queryString?'?'+queryString:'';
 return <nav className="language-switcher" aria-label={locale==='it'?'Lingua del sito':'Website language'} data-no-translate="true">
  <a href={localPath(path || '/','it')+query} hrefLang="it" lang="it" aria-current={locale==='it'?'page':undefined} aria-label="Italiano">IT</a>
  <a href={localPath(path || '/','en-GB')+query} hrefLang="en-GB" lang="en-GB" aria-current={locale==='en-GB'?'page':undefined} aria-label="English (UK)">EN</a>
 </nav>;
}

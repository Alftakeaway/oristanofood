import type {Metadata} from 'next';
import dictionary from './en-GB.json';
const map:Record<string,string>=dictionary;
export async function localiseMetadata(metadata:Metadata,path='/',english=false):Promise<Metadata> {
 const t=(text:string)=>english ? map[text] ?? text.split(' — ').map(part=>map[part] ?? part).join(' — ') : text;
 const origin=process.env.NEXT_PUBLIC_SITE_URL || 'https://oristanofood.vercel.app';
 const it=path;const en='/en'+(path==='/'?'':path);
 const title=typeof metadata.title==='string'?t(metadata.title):metadata.title? {...metadata.title,...('default' in metadata.title ? {default:t(metadata.title.default as string)} : {})}:undefined;
 return {...metadata,metadataBase:new URL(origin),title,description:metadata.description?t(metadata.description):metadata.description,
  alternates:{canonical:english?en:it,languages:{it:origin+it,'en-GB':origin+en,'x-default':origin+it}},
  openGraph:metadata.openGraph?{...metadata.openGraph,locale:english?'en_GB':'it_IT',...(typeof metadata.openGraph.title==='string'?{title:t(metadata.openGraph.title)}:{}),url:origin+(english?en:it),description:metadata.openGraph.description?t(metadata.openGraph.description):undefined}:undefined,
  twitter:metadata.twitter?{...metadata.twitter,...(typeof metadata.twitter.title==='string'?{title:t(metadata.twitter.title)}:{}),description:metadata.twitter.description?t(metadata.twitter.description):undefined}:undefined};
}

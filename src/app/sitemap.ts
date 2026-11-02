import type {MetadataRoute} from 'next';
const origin=process.env.NEXT_PUBLIC_SITE_URL || 'https://oristanofood.vercel.app';
export default function sitemap(): MetadataRoute.Sitemap {
 return ['','/privacy','/crediti'].flatMap(path => {
  const it=origin+(path||'/'),en=origin+'/en'+path;
  const alternates={languages:{it,'en-GB':en}};
  return [{url:it,lastModified:new Date(),alternates},{url:en,lastModified:new Date(),alternates}];
 });
}

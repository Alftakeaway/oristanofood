import SiteDocument,{generateMetadata as baseMetadata} from '@/components/SiteDocument';
import {localiseMetadata} from '@/i18n/server';
import '../globals.css';
export async function generateMetadata() {return localiseMetadata(await baseMetadata(), '/', true);}

export default function Layout({children}: {children:React.ReactNode}) {return <SiteDocument language="en-GB">{children}</SiteDocument>;}

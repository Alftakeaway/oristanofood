import SiteDocument,{generateMetadata as baseMetadata} from '@/components/SiteDocument';
import '../globals.css';
export const generateMetadata=baseMetadata;

export default function Layout({children}: {children:React.ReactNode}) {return <SiteDocument language="it">{children}</SiteDocument>;}

import Page from '../../../(it)/privacy/page';
import {localiseMetadata} from '@/i18n/server';
import {metadata as baseMetadata} from '../../../(it)/privacy/page';
export async function generateMetadata() {return localiseMetadata(baseMetadata, '/privacy', true);}
export default Page;

import Page from '../../../(it)/crediti/page';
import {localiseMetadata} from '@/i18n/server';
import {metadata as baseMetadata} from '../../../(it)/crediti/page';
export async function generateMetadata() {return localiseMetadata(baseMetadata, '/crediti', true);}
export default Page;

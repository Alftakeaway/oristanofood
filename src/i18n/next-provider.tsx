"use client";
import {usePathname} from 'next/navigation';
import {LocaleProvider,type Locale} from './index';
export function NextLocaleProvider({locale,children}: {locale:Locale;children:React.ReactNode}) {
 const pathname=usePathname();return <LocaleProvider locale={locale} path={pathname || '/'}>{children}</LocaleProvider>;
}

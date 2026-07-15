import createMiddleware from 'next-intl/middleware';

export default createMiddleware({

    locales: ['ko', 'en', 'ja', 'zh', 'fr', 'es', 'de'],
    defaultLocale: 'ko'
});

export const config = {

    matcher: [
        '/((?!api|_next|.*\\..*).*)'
    ]

};
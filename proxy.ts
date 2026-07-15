import createMiddleware from 'next-intl/middleware';

export default createMiddleware({

    locales: ['ko', 'en', 'ja', 'zh', 'fr', 'es', 'de'],
    defaultLocale: 'ko',
    localeCookie: {
    name: 'locale'
  }
});

export const config = {

    matcher: [
        '/((?!api|_next|.*\\..*).*)'
    ]

};
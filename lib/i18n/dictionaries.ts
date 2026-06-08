export type Locale = 'es' | 'en';

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const DEFAULT_LOCALE: Locale = 'es';
export const LOCALES: Locale[] = ['es', 'en'];

export type Dictionary = {
  nav: {
    blog: string;
    tutorials: string;
    about: string;
    signIn: string;
    account: string;
  };
  hero: {
    titlePrefix: string;
    titleWords: string[];
    subtitle: string;
    intro: string;
    noPosts: string;
  };
  newsletter: {
    title: string;
    description: string;
    subscribe: string;
    subscribed: string;
    signUpPrompt: string;
    signUp: string;
  };
  ctaBanner: {
    title: string;
    description: string;
    signUp: string;
  };
};

const es: Dictionary = {
  nav: {
    blog: 'Blog',
    tutorials: 'Tutoriales',
    about: 'Acerca de',
    signIn: 'Iniciar sesión',
    account: 'Mi cuenta',
  },
  hero: {
    titlePrefix: 'Ingeniería, ',
    titleWords: [
      'bien enseñada.',
      'explicada con claridad.',
      'contada con código real.',
      'enseñada paso a paso.',
    ],
    subtitle: 'Notas de un ingeniero que enseña.',
    intro:
      'Tutoriales prácticos, notas de ingeniería real y proyectos paso a paso — directo a tu bandeja de entrada.',
    noPosts: 'Aún no hay publicaciones.',
  },
  newsletter: {
    title: 'Lleva tus habilidades de ingeniería al siguiente nivel',
    description:
      'Recibe un resumen semanal de análisis técnicos y consejos de carrera directo en tu correo.',
    subscribe: 'Suscribirme al boletín',
    subscribed: '✓ Suscrito — clic para cancelar',
    signUpPrompt: 'Crea una cuenta gratis para suscribirte.',
    signUp: 'Registrarme',
  },
  ctaBanner: {
    title: '¿Te está gustando este post?',
    description:
      'Crea una cuenta gratis para dar like, comentar y guardar publicaciones para después.',
    signUp: 'Registrarme',
  },
};

const en: Dictionary = {
  nav: {
    blog: 'Blog',
    tutorials: 'Tutorials',
    about: 'About',
    signIn: 'Sign in',
    account: 'Account',
  },
  hero: {
    titlePrefix: 'Engineering, ',
    titleWords: [
      'taught well.',
      'explained clearly.',
      'told through real code.',
      'taught step by step.',
    ],
    subtitle: 'Notes from an engineer who teaches.',
    intro:
      'Practical tutorials, real engineering notes, and step-by-step projects — straight to your inbox.',
    noPosts: 'No posts yet.',
  },
  newsletter: {
    title: 'Level up your engineering skills',
    description:
      'Get a weekly summary of technical deep dives and career advice delivered straight to your inbox.',
    subscribe: 'Subscribe to the newsletter',
    subscribed: '✓ Subscribed — click to unsubscribe',
    signUpPrompt: 'Create a free account to subscribe.',
    signUp: 'Sign up',
  },
  ctaBanner: {
    title: 'Enjoying this post?',
    description: 'Create a free account to like, comment, and save posts for later.',
    signUp: 'Sign up',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'es' || value === 'en';
}

import { modifier } from 'ember-modifier';

/**
 * auto-upgrade-promo — mounts the auto-upgrade feature spotlight (ds-tour, corner
 * variant) once per user, right after they reach the authenticated shell.
 *
 * Applied to a hidden host in application.hbs's non-standalone (signed-in) branch,
 * so it exists only on shell pages — never on /login or /patterns. `persist-key` +
 * `auto-start` fire it a single time and never re-nag (localStorage
 * `uems-tour-seen:<key>`); the card is non-blocking (mask="none"), so the dashboard
 * behind it stays fully interactive.
 *
 *   {{auto-upgrade-promo this.session this.router}}
 */
const PERSIST_KEY = 'ec.auto-upgrade-promo.v1';
const SEEN_KEY = 'uems-tour-seen:' + PERSIST_KEY;
const START_DELAY = 1000; // let the dashboard settle for ~1s after login before it slides in

export default modifier(function autoUpgradePromo(element, [session, router]) {
  // Signed-in only, and never mount twice (the host persists across shell routes).
  if (session && session.requireLogin && !session.isAuthenticated) return;
  if (document.querySelector('ds-tour[data-au-promo]')) return;

  const tour = document.createElement('ds-tour');
  tour.setAttribute('data-au-promo', '');
  tour.setAttribute('mask', 'none'); // non-blocking corner announcement — no backdrop
  tour.setAttribute('persist-key', PERSIST_KEY); // show once per user (marks "seen" on dismiss/complete)
  // NOTE: no `auto-start` — we start it manually after START_DELAY so it slides in
  // ~1s after the user lands, not the instant the shell paints.
  // The reduced feature-spotlight: hero on top, title below, one full-width primary,
  // an inline "Learn more", and a soft "I'll do it later" decline.
  tour.steps = [
    {
      corner: 'bottom-right',
      image: '/images/auto-upgrade-server.jpg',
      imageAlt: 'A cloud syncing automatic upgrades to a server',
      title: 'Automate your server upgrades',
      body: 'Set it up once, and Endpoint Central downloads, installs, and verifies every server upgrade for you — during the maintenance window you choose.',
      learnMoreHref: '#',
      learnMoreLabel: 'Learn more',
      primaryLabel: 'Set up auto-upgrade',
      secondaryLabel: "I'll do it later",
    },
  ];
  document.body.appendChild(tour);

  /* Primary action → deep-link to Server Upgrade Settings (Admin › Central Server
     Maintenance › Server Upgrade Settings). Wire this to your real route/drawer,
     e.g. router.transitionTo('product.module.view', 'ec', '<tab>', '<view-slug>')
     or window.ShellDrawers?.settings?.show?.(). */
  void router;
  const onComplete = () => {
    // eslint-disable-next-line no-console
    console.info('[auto-upgrade-promo] Set up auto-upgrade → navigate to Server Upgrade Settings');
  };
  tour.addEventListener('ds-tour-complete', onComplete);

  // Start once, ~1s after landing — but only if this user hasn't already seen it.
  let seen = false;
  try {
    seen = !!localStorage.getItem(SEEN_KEY);
  } catch (_) {
    /* storage blocked → treat as unseen */
  }
  let timer = null;
  if (!seen) {
    timer = setTimeout(() => {
      timer = null;
      try {
        tour.start();
      } catch (_) {
        /* teardown raced us */
      }
    }, START_DELAY);
  }

  return () => {
    if (timer) clearTimeout(timer);
    tour.removeEventListener('ds-tour-complete', onComplete);
    try {
      // remindLater: tearing the shell down (e.g. signout) shouldn't count as the
      // user dismissing it — only their explicit ✕ / Esc / action marks it seen.
      tour.end?.({ completed: false, remindLater: true });
    } catch (_) {
      /* already torn down */
    }
    tour.remove();
  };
});

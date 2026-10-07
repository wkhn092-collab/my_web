import { z } from 'zod';

// The CSP forbids eval; without this zod probes `new Function` when a schema is built and logs a CSP violation.
// Import zod from here, never from 'zod' directly, so the flag is set before any schema exists.
z.config({ jitless: true });

export { z };

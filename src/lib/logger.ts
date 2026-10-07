import 'server-only';

type Fields = Record<string, string | number | boolean | undefined>;

function line(level: 'info' | 'warn' | 'error', scope: string, message: string, fields?: Fields) {
  return JSON.stringify({ level, scope, message, ...fields, at: new Date().toISOString() });
}

export function logInfo(scope: string, message: string, fields?: Fields) {
  console.info(line('info', scope, message, fields));
}

export function logWarn(scope: string, message: string, fields?: Fields) {
  console.warn(line('warn', scope, message, fields));
}

export function logError(scope: string, error: unknown, fields?: Fields) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(line('error', scope, message, fields));
}

import Ajv from 'ajv';
import ventas from './ventas.discovery.schema.json' assert { type: 'json' };
import usab from './research.usabilidad.schema.json' assert { type: 'json' };

const ajv = new Ajv({ allErrors: true, strict: false });
const validators = {
  'ventas.discovery': ajv.compile(ventas as any),
  'research.prueba_usabilidad': ajv.compile(usab as any)
};

export function validateOutput(team: string, session: string, data: unknown) {
  const key = `${team}.${session}`;
  const v = (validators as any)[key];
  if (!v) return { valid: true, errors: [] };
  const ok = v(data);
  return { valid: !!ok, errors: (v.errors || []) };
}

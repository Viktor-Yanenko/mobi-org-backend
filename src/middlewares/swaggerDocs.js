import fs from 'node:fs';
import path from 'node:path';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yaml';

const SPEC_PATH = path.resolve('docs', 'openapi.yaml');

export const swaggerDocs = () => {
  const spec = YAML.parse(fs.readFileSync(SPEC_PATH, 'utf8'));

  return [
    ...swaggerUI.serve,
    swaggerUI.setup(spec, {
      customSiteTitle: 'MobiOrg API',
      // токен з Authorize не зникає після перезавантаження сторінки
      swaggerOptions: { persistAuthorization: true },
    }),
  ];
};

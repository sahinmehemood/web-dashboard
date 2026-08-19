// VLY Integrations Configuration
// See /integrations.md for usage documentation

import { createVlyIntegrations } from '@vly-ai/integrations';

export const vly = createVlyIntegrations({
  deploymentToken: import.meta.env.VITE_VLY_INTEGRATION_KEY as string,
  debug: import.meta.env.DEV,
});

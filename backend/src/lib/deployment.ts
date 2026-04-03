import axios from 'axios';

export async function provisionStore(params: { storeId: string; slug: string; name: string }): Promise<{
  ok: boolean;
  deploymentId?: string;
  message?: string;
}> {
  const base = process.env.COOLIFY_API_URL?.replace(/\/$/, '');
  const token = process.env.COOLIFY_TOKEN;
  const project = process.env.COOLIFY_PROJECT_UUID;
  const environment = process.env.COOLIFY_ENVIRONMENT_UUID;

  if (!base || !token || !project || !environment) {
    console.warn(
      'Coolify not configured — simulated deployment. Set COOLIFY_* env vars for production.',
    );
    return {
      ok: true,
      deploymentId: `sim-${params.storeId}`,
      message: 'Simulated deployment (configure Coolify for production)',
    };
  }

  try {
    const url = `${base}/api/v1/deploy?uuid=${encodeURIComponent(environment)}`;
    const res = await axios.post(
      url,
      {
        project_uuid: project,
        environment_name: 'production',
        variables: {
          STORE_SLUG: params.slug,
          STORE_NAME: params.name,
          STORE_ID: params.storeId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      },
    );
    const deploymentId =
      (res.data as { deployment_uuid?: string })?.deployment_uuid ??
      (res.data as { id?: string })?.id;
    return { ok: true, deploymentId: deploymentId ?? undefined };
  } catch (err) {
    console.error('Coolify deploy failed', err instanceof Error ? err.stack : String(err));
    return { ok: false, message: 'Coolify request failed — check logs' };
  }
}

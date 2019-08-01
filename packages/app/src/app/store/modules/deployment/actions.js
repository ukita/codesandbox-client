import { omit } from 'lodash-es';
import getNetlifyConfig from 'app/utils/getNetlifyConfig';
import getTemplate from '@codesandbox/common/lib/templates';
import pollUntilDone from '../../utils/pollUntilDone';

export function createZip({ utils, state }) {
  const sandboxId = state.get('editor.currentId');
  const sandbox = state.get(`editor.sandboxes.${sandboxId}`);
  return utils.getZip(sandbox).then(result => ({ file: result.file }));
}

export function loadZip({ props, jsZip }) {
  const { file } = props;

  return jsZip.loadAsync(file).then(result => ({ contents: result }));
}

const NetlifyBaseURL = 'https://netlify.deploy.codesandbox.io/site';

export async function claimNetlifyWebsite({ http, state, path }) {
  const userId = state.get('user.id');
  const sandboxId = state.get('editor.currentId');
  const sessionId = `${userId}-${sandboxId}`;

  const { result } = await http.request({
    url: `${NetlifyBaseURL}-claim?sessionId=${sessionId}`,
  });

  return path.success({
    claimURL: result.claim,
  });
}

export async function getNetlifyDeploys({ http, state, path }) {
  const sandboxId = state.get('editor.currentId');

  try {
    const site = await http.request({
      url: `${NetlifyBaseURL}/${sandboxId}`,
    });

    return path.success({
      site: site.result,
    });
  } catch (error) {
    return path.error({ error });
  }
}

export async function deployToNetlify({ http, props, state }) {
  const { file } = props;
  state.set('deployment.netlifyLogs', null);
  const userId = state.get('user.id');
  const sandboxId = state.get('editor.currentId');
  const sandbox = state.get(`editor.sandboxes.${sandboxId}`);
  const template = getTemplate(sandbox.template);
  const buildCommand = name => {
    switch (name) {
      case 'styleguidist':
        return 'styleguide:build';
      case 'nuxt':
        return 'generate';
      default:
        return 'build';
    }
  };

  const buildConfig = getNetlifyConfig(sandbox);
  // command needs to be passed without the package manager name
  const buildCommandFromConfig = (buildConfig.command || '')
    .replace('npm run', '')
    .replace('yarn ', '');
  let id = '';
  try {
    const { result } = await http.request({
      url: `${NetlifyBaseURL}/${sandboxId}`,
    });

    id = result.site_id;
  } catch (e) {
    const { result } = await http.request({
      url: NetlifyBaseURL,
      method: 'POST',
      body: {
        name: `csb-${sandboxId}`,
        session_id: `${userId}-${sandboxId}`,
      },
    });
    id = result.site_id;
  }

  try {
    await http.request({
      url: `${NetlifyBaseURL}/${sandboxId}/deploys?siteId=${id}&dist=${buildConfig.publish ||
        template.distDir}&buildCommand=${buildCommandFromConfig ||
        buildCommand(template.name)}`,
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': 'application/zip',
      },
    });

    return { id };
  } catch (e) {
    return { error: true };
  }
}

export async function getStatus({ props, path, http, state }) {
  const url = `${NetlifyBaseURL}/${props.id}/status`;
  if (props.error) {
    return path.error();
  }
  const { result } = await http.request({
    url,
  });

  if (result.status.status === 'IN_PROGRESS') {
    // polls every 10s for up to 2m
    await pollUntilDone(http, url, 10000, 60 * 2000, state);
    return path.success();
  }
  return path.success();
}

export async function createApiData({ props, state }) {
  const { contents } = props;
  const sandboxId = state.get('editor.currentId');
  const sandbox = state.get(`editor.sandboxes.${sandboxId}`);
  const template = getTemplate(sandbox.template);
  let apiData = {
    files: [],
  };

  let packageJSON = {};
  let nowJSON = {};
  const projectPackage = contents.files['package.json'];
  const nowFile = contents.files['now.json'];

  if (projectPackage) {
    const data = await projectPackage.async('text'); // eslint-disable-line no-await-in-loop

    const parsed = JSON.parse(data);
    packageJSON = parsed;
  }

  if (nowFile) {
    const data = await nowFile.async('text'); // eslint-disable-line no-await-in-loop

    const parsed = JSON.parse(data);
    nowJSON = parsed;
  } else if (packageJSON.now) {
    // Also support package.json if imported like that
    nowJSON = packageJSON.now;
  }

  const nowDefaults = {
    name: `csb-${sandbox.id}`,
    public: true,
  };

  const filePaths = nowJSON.files || Object.keys(contents.files);

  // We'll omit the homepage-value from package.json as it creates wrong assumptions over the now deployment environment.
  packageJSON = omit(packageJSON, 'homepage');

  // We force the sandbox id, so ZEIT will always group the deployments to a
  // single sandbox
  packageJSON.name = nowJSON.name || nowDefaults.name;

  apiData.name = nowJSON.name || nowDefaults.name;
  apiData.deploymentType = nowJSON.type || nowDefaults.type;
  apiData.public = nowJSON.public || nowDefaults.public;

  // if now v2 we need to tell now the version, builds and routes
  if (nowJSON.version === 2) {
    apiData.version = 2;
    apiData.builds = nowJSON.builds;
    apiData.routes = nowJSON.routes;
    apiData.env = nowJSON.env;
    apiData.scope = nowJSON.scope;
    apiData['build.env'] = nowJSON['build.env'];
    apiData.regions = nowJSON.regions;
  } else {
    apiData.config = omit(nowJSON, ['public', 'type', 'name', 'files']);
    apiData.forceNew = true;
  }

  if (!nowJSON.files) {
    apiData.files.push({
      file: 'package.json',
      data: JSON.stringify(packageJSON, null, 2),
    });
  }

  for (let i = 0; i < filePaths.length; i += 1) {
    const filePath = filePaths[i];
    const file = contents.files[filePath];

    if (!file.dir && filePath !== 'package.json') {
      const data = await file.async('base64'); // eslint-disable-line no-await-in-loop

      apiData.files.push({ file: filePath, data, encoding: 'base64' });
    }

    // if person added some files but no package.json
    if (
      filePath === 'package.json' &&
      !apiData.files.filter(f => f.name === 'package.json')
    ) {
      apiData.files.push({
        file: 'package.json',
        data: JSON.stringify(packageJSON, null, 2),
      });
    }
  }

  // this adds unnecessary code for version 2
  // packages/common/templates/template.js
  if (template.alterDeploymentData && nowJSON.version !== 2) {
    apiData = template.alterDeploymentData(apiData);
  }

  return { apiData };
}

export async function aliasDeployment({ http, path, props, state }) {
  const { nowData, id } = props;
  const token = state.get('user.integrations.zeit.token');
  try {
    const alias = await http.request({
      url: `https://api.zeit.co/v2/now/deployments/${id}/aliases`,
      body: { alias: nowData.alias },
      method: 'POST',
      headers: { Authorization: `bearer ${token}` },
    });
    const url = `https://${alias.result.alias}`;

    return path.success({ message: `Deployment aliased to ${url}` });
  } catch (error) {
    console.error(error);
    return path.error({ error });
  }
}

export async function postToZeit({ http, path, props, state }) {
  const { apiData } = props;
  const token = state.get('user.integrations.zeit.token');
  const deploymentVersion = apiData.version === 2 ? 'v6' : 'v3';

  try {
    const deployment = await http.request({
      url: `https://api.zeit.co/${deploymentVersion}/now/deployments?forceNew=1`,
      body: apiData,
      method: 'POST',
      headers: { Authorization: `bearer ${token}` },
    });

    const url = `https://${deployment.result.url}`;

    return path.success({ url });
  } catch (error) {
    console.error(error);
    return path.error({ error });
  }
}

export function getDeploymentData({ state }) {
  const sandbox = state.get('editor.currentSandbox');
  const nowData =
    sandbox.modules
      .filter(
        m => m.title === 'now.json' || (m.title === 'package.json' && m.now)
      )
      .map(c => JSON.parse(c.code))[0] || {};

  if (!nowData.name) {
    nowData.name = `csb-${sandbox.id}`;
  }

  state.set('deployment.hasAlias', !!nowData.alias);

  return { nowData };
}

async function deploysByID(id, token, http) {
  try {
    const data = await http.request({
      url: `https://api.zeit.co/v3/now/deployments/${id}/aliases`,
      method: 'GET',
      headers: { Authorization: `bearer ${token}` },
    });

    return data.result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getDeploys({ http, path, state, props }) {
  const token = state.get('user.integrations.zeit.token');
  const { nowData } = props;

  try {
    const data = await http.request({
      url: 'https://api.zeit.co/v3/now/deployments',
      method: 'GET',
      headers: { Authorization: `bearer ${token}` },
    });
    const deploys = data.result.deployments;

    const deploysNoAlias = deploys
      .filter(d => d.name === nowData.name)
      .sort((a, b) => (a.created < b.created ? 1 : -1));

    const assignAlias = async d => {
      const alias = await deploysByID(d.uid, token, http);
      if (alias) {
        // eslint-disable-next-line
        d.alias = alias.aliases;
      } else {
        d.alias = [];
      }
      return d;
    };

    const sandboxAlias = await deploysNoAlias.map(assignAlias);

    const sandboxDeploys = await Promise.all(sandboxAlias);

    return path.success({ sandboxDeploys });
  } catch (error) {
    console.error(error);
    return path.error();
  }
}

export async function deleteDeployment({ http, path, state }) {
  const id = state.get('deployment.deployToDelete');
  const token = state.get('user.integrations.zeit.token');

  try {
    await http.request({
      url: `https://api.zeit.co/v2/now/deployments/${id}`,
      method: 'DELETE',
      headers: { Authorization: `bearer ${token}` },
    });

    return path.success();
  } catch (error) {
    console.error(error);
    return path.error();
  }
}

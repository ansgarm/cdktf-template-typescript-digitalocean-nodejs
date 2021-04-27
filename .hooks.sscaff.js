const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const constructs_version = require('../../package.json').dependencies.constructs;

exports.post = ctx => {
  // Terraform Cloud configuration settings if the organization name and workspace is set.
  if (ctx.OrganizationName != '') {
    console.log(`\nGenerating Terraform Cloud configuration for '${ctx.OrganizationName}' organization and '${ctx.WorkspaceName}' workspace.....`)
    terraformCloudConfig(ctx.$base, ctx.OrganizationName, ctx.WorkspaceName);
  }

  const npm_cdktf = ctx.npm_cdktf;
  if (!npm_cdktf) { throw new Error(`missing context "npm_cdktf"`); }

  installDeps([npm_cdktf, `constructs@${constructs_version}`]);
  installDeps(['@types/node', 'typescript'], true);

  console.log(readFileSync('./help', 'utf-8'));
};

function installDeps(deps, isDev) {
  const devDep = isDev ? '-D' : '';
  // make sure we're installing dev dependencies as well
  const env = Object.assign({}, process.env)
  env['NODE_ENV'] = 'development'

  execSync(`npm install ${devDep} ${deps.join(' ')}`, { stdio: 'inherit', env });
}

function terraformCloudConfig(baseName, organizationName, workspaceName) {
  template = readFileSync('./main.ts', 'utf-8');

  result = template.replace(`import { App, TerraformOutput, TerraformStack } from 'cdktf';`, `import { App, TerraformOutput, TerraformStack, RemoteBackend } from 'cdktf';`);
  result = result.replace(`new MyStack(app, '${baseName}-development', {
  environmentSlug: 'dev',
  instanceSizeSlug: 'basic-xxs',
  deployBranch: 'main', // you could use a development branch here
});`, `const devStack = new MyStack(app, '${baseName}-development', {
  environmentSlug: 'dev',
  instanceSizeSlug: 'basic-xxs',
  deployBranch: 'main', // you could use a development branch here
});
new RemoteBackend(devStack, {
  hostname: 'app.terraform.io',
  organization: '${organizationName}',
  workspaces: {
    name: '${workspaceName}-dev'
  }
});`);
result = result.replace(`new MyStack(app, '${baseName}-production', {
  environmentSlug: 'prod',
  instanceSizeSlug: 'basic-xxs', // you could use a bigger instance size here
  deployBranch: 'main',
});`, `const prodStack = new MyStack(app, '${baseName}-production', {
  environmentSlug: 'prod',
  instanceSizeSlug: 'basic-xxs', // you could use a bigger instance size here
  deployBranch: 'main',
});
new RemoteBackend(prodStack, {
  hostname: 'app.terraform.io',
  organization: '${organizationName}',
  workspaces: {
    name: '${workspaceName}-prod'
  }
});`);

  writeFileSync('./main.ts', result, 'utf-8');
}

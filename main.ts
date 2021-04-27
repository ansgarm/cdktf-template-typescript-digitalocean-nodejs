import { Construct } from 'constructs';
import { App, TerraformOutput, TerraformStack } from 'cdktf';
import { App as DOApp, DigitaloceanProvider } from './.gen/providers/digitalocean';

interface MyStackConfig {
  environmentSlug: string,
  instanceSizeSlug: string,
  deployBranch: string,
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: MyStackConfig) {
    super(scope, name);

    new DigitaloceanProvider(this, 'do-provider');

    const doApp = new DOApp(this, 'app', {
      spec: [{
        name: `{{ $base }}-${config.environmentSlug}`,
        region: 'fra1',
        service: [{
          name: 'nodejs-service',
          environmentSlug: 'node-js',
          instanceSizeSlug: config.instanceSizeSlug,

          git: [{
            repoCloneUrl: 'https://github.com/digitalocean/sample-nodejs',
            branch: config.deployBranch,
          }]
        }]
      }]
    });

    new TerraformOutput(this, 'endpoint', {
      value: doApp.defaultIngress,
    })

  }
}

const app = new App();
new MyStack(app, '{{ $base }}-development', {
  environmentSlug: 'dev',
  instanceSizeSlug: 'basic-xxs',
  deployBranch: 'main', // you could use a development branch here
});
new MyStack(app, '{{ $base }}-production', {
  environmentSlug: 'prod',
  instanceSizeSlug: 'basic-xxs', // you could use a bigger instance size here
  deployBranch: 'main',
});
app.synth();

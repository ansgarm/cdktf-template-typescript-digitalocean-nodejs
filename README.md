# CDK for Terraform template for Nodejs service on DigitalOcean

This template for the [CDK for Terraform](https://cdk.tf) provisions a small infrastructure on DigitalOcean running a sample Node.js service.
It demos using multiple stacks to provision a staging and a production environment.

## Usage
### Prerequisites
You need to have the [cdktf-cli](https://github.com/hashicorp/terraform-cdk/blob/main/docs/getting-started/typescript.md#prerequisites) and the [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli) installed.

### Initalizing a new project
```
cdktf init --template https://github.com/ansgarm/cdktf-template-typescript-digitalocean-nodejs/archive/refs/heads/main.zip
cdktf get # generates provider bindings for digitalocean Terraform provider
cdktf synth # generates Terraform JSON describing the resources
```

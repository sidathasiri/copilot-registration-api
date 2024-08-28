# copilot-registration-api

This APIs provides you to register with the GitHub Copilot usage tracker solution. To use this solution effectively, you will need to register by providing your GitHubID, ProjectID and your machine ID. [GitHub Copilot Proxy](https://github.com/sidathasiri/copilot-proxy-server) can only detect your device ID. So in order to map the device ID to your GitHub ID, you can use this API to register. 

The registration process can be conveniently handled by the [Copilot Usage Analyzer tool](https://github.com/sidathasiri/copilot-usage-analyzer) without using this API directly.

## Solution Architecture

This is a RESTful API developed with AWS API Gateway, Lambda functions and a DynamoDB table. 

![Proxy Solution Image](solution.png)

The Terraform implementation helps to create and deploy the entire solution on AWS

## How to Use?

`POST` `/register` endpoint can be used to register by providing below information in the request payload
- githubId: Your GitHub Id
- projectId: The project you use
- machineId: The device identifier

## How to Setup?

- Run `npm install` to install dependencies
- Run `npm run package` to create zip file of the lambda handler implementation
- Create the S3 bucket for the Terraform backend and update the configuration
- Run below commands to deploy with Terraform
  - `terraform init`
  - `terraform plan`
  - `terraform apply`
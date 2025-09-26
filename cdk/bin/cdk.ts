#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TexttositeCdkStack } from '../lib/texttosite-cdk-stack';

const app = new cdk.App();
new TexttositeCdkStack(app, 'TexttositeCDKStack', {
  domainName: 'vberkoz.com',
  subdomain: 'texttosite',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
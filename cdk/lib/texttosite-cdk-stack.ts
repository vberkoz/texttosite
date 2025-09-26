import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';

interface TexttositeCDKStackProps extends cdk.StackProps {
  domainName: string;
  subdomain: string;
  env: {
    account: string | undefined;
    region: string | undefined;
  };
}

export class TexttositeCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TexttositeCDKStackProps) {
    super(scope, id, props);

    const domain = `${props.subdomain}.${props.domainName}`;

    const hostedZone = cdk.aws_route53.HostedZone.fromLookup(this, 'TexttositeCDKStackZone', {
      domainName: props.domainName,
    });

    const cert = new cdk.aws_certificatemanager.Certificate(this, 'TexttositeCDKStackCert', {
      domainName: domain,
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

    const bucket = new cdk.aws_s3.Bucket(this, 'TexttositeCDKStackBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });

    const oai = new cdk.aws_cloudfront.OriginAccessIdentity(this, 'TexttositeCDKStackOAI');
    bucket.grantRead(oai);

    const cfFunction = new cdk.aws_cloudfront.Function(this, 'TexttositeCDKStackIndexHtmlFunction', {
      code: cdk.aws_cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;

          if (uri.endsWith("/")) {
            request.uri += "index.html";
          } else if (!uri.includes(".")) {
            request.uri += "/index.html";
          }

          return request;
        }
      `),
    });

    const distribution = new cdk.aws_cloudfront.Distribution(this, 'TexttositeCDKStackDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [{
          function: cfFunction,
          eventType: cdk.aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
        }],
      },
      domainNames: [domain],
      certificate: cert,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5)
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5)
        },
      ],
    });

    new cdk.aws_s3_deployment.BucketDeployment(this, 'TexttositeCDKStackBucketDeployment', {
      sources: [
        cdk.aws_s3_deployment.Source.asset(path.join(process.cwd(), '../dist')),
      ],
      destinationBucket: bucket,
      distributionPaths: ['/*'],
      distribution,
    });

    new cdk.aws_route53.ARecord(this, 'TexttositeCDKStackAliasRecord', {
      zone: hostedZone,
      recordName: props.subdomain,
      target: cdk.aws_route53.RecordTarget.fromAlias(new cdk.aws_route53_targets.CloudFrontTarget(distribution)),
    });

    const lambda: cdk.aws_lambda_nodejs.NodejsFunction = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'TexttositeCDKStackApiFunction', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
      handler: 'lambda.handler',
      code: cdk.aws_lambda.Code.fromAsset('../api'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'stage'
      },
    });

    const api = new cdk.aws_apigatewayv2.HttpApi(this, 'TexttositeCDKStackApiHttpApi', {
      disableExecuteApiEndpoint: false,
      createDefaultStage: false,
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [cdk.aws_apigatewayv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
      },
    });

    api.addRoutes({
      path: '/api/{proxy+}',
      methods: [cdk.aws_apigatewayv2.HttpMethod.ANY],
      integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('TexttositeCDKStackApiIntegration', lambda),
    });

    new cdk.aws_apigatewayv2.CfnStage(this, 'TexttositeCDKStackRateLimitedStage', {
      apiId: api.apiId,
      stageName: '$default',
      autoDeploy: true,
      defaultRouteSettings: {
        throttlingBurstLimit: 5,   // max 5 concurrent requests
        throttlingRateLimit: 10,   // 10 requests per second
      },
    });

    lambda.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: ["*"],
      })
    );
  }
}

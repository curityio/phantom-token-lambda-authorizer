# Phantom Token Lambda Authorizer

[![Quality](https://img.shields.io/badge/quality-experiment-red)](https://curity.io/resources/code-examples/status/)
[![Availability](https://img.shields.io/badge/availability-source-blue)](https://curity.io/resources/code-examples/status/)

A Lambda Authorizer implementing the [Phantom Token Pattern](https://curity.io/resources/learn/phantom-token-pattern/). This Lambda Authorizer function enables a secure API solution using any API Gateway that supports the use of Lambda Functions.

## Overview

Many API Gateways does not have built-in capabilities for introspecting opaque access tokens. It is however a lot of times possible to extend the capabilities of the gateway by leveraging [Lambda Authorizer functions](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) even when not using the AWS API Gateway.

The Phantom Token Lambda Authorizer implements the Phantom Token Pattern. An opaque access token is passed in the Authorization header to the gateway. The gateway invokes the authorizer that will introspect the token using the `application/jwt` header in order to receive a JWT in the response.

The authorizer can also be configured to verify that a set of required scopes are present in the `scope` claim in the JWT or otherwise deny access to the requested API.

The API Gateway in use is configured to forward the JWT from the introspection response in the `Authorization` header to the upstream API enabling a Zero Trust approach. The API in itself could also leverage a Zero Trust design where the JWT holds the public key details for self-contained JWT verification as exemplified in this [Serverless API](https://github.com/curityio/serverless-zero-trust-api).

## Building the Lambda Authorizer

1. Clone the repository.
2. Update `.env` with the correct parameters. See the [Configuration](#Configuration) section for details.
3. Run `npm run package`. This will generate `phantom-token-lambda-authorizer.zip` in the current directory.

## Deploying the Lambda Authorizer

After building the authorizer, `phantom-token-lambda-authorizer.zip` can be uploaded and deployed as a Lambda Function in the AWS Console.

1. Choose `Create function`
2. Select the `Author from scratch` option, set a function name (ex. `phantom-token-lambda-authorizer`), choose the `Node.js 22.x` runtime and `x86_64` as the architecture.
3. Click `Create function` 
4. The default `Hello from Lambda` code is displayed. Choose `Upload from` and from the drop-down select `.zip file`. Browse to `phantom-token-lambda-authorizer.zip` and upload the file.
5. Click `Deploy` to deploy the Lambda function

## Configuration

An `.env` file is bundled with the packaged authorizer before deployment. 

Parameter | Description |
--------- | ----------- |
HOST | The hostname of the Curity Identity Server
INTROSPECTION_PATH | The introspection path (`/oauth/v2/oauth-introspect`)
PORT | The runtime port of the Curity Identity Server
SCOPE | Required scopes for API access (space separated string)
CLIENT_ID | The client_id of a client with the `introspection` capability
CLIENT_SECRET | The secret of the client with the `introspection` capability

## Function URL

External services can leverage lambda functions in different ways. This implementation has been tested by exposing the function using a [Function URL](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html) that is invoked by the API Gateway that needs to implement the Phantom Token Pattern. The configuration on the gateway side will differ between API Gateways used but access to the lambda function should be restricted using [AWS IAM approaches](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html). 

### The Response

The function will return a JSON payload containing the JWT representation of the opaque access token that was introspected. The API Gateway should be configured to handle this response accordingly.

```json
{
    token_type: 'Bearer',
    access_token: eyJraWQiO...2CWnDGG5WiB7o7Nwfg
}
```
## More Information

* Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.

Copyright (C) 2025 Curity AB.
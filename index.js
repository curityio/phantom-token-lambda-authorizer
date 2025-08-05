/*
 *  Copyright 2025 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/* Used to read values from .env */
require('dotenv').config();

/* Verify provided scope against configured required scope */
function verifyScope(providedScope, requiredScope) {
  if (!requiredScope) return true;

  const providedSplitScope = providedScope.split(' ');
  const requiredSplitScope = requiredScope.split(' ');

  return requiredSplitScope.every(scope => providedSplitScope.includes(scope));
}

/* Introspect access token */
function introspect(options, data) {
  return new Promise((resolve, reject) => {
    const https = require('https');

    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        resolve(responseBody);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

exports.handler = async function (event) {
  if (!event.headers || !event.headers.authorization || !event.headers.authorization.startsWith("Bearer ")) {
    console.log("Missing or malformed Authorization header");
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "missing_or_malformed_authorization" })
    };
  }

  const token = event.headers.authorization.substring(7); // Strip 'Bearer '

  const data = new URLSearchParams();
  data.append('token', token);

  const introspectCredentials = Buffer
    .from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8')
    .toString('base64');

  const options = {
    host: process.env.HOST,
    path: process.env.INTROSPECTION_PATH,
    method: 'POST',
    port: process.env.PORT || 443,
    headers: {
      'Authorization': `Basic ${introspectCredentials}`,
      'Accept': 'application/jwt',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data.toString())
    }
  };

  try {
    const jwt = await introspect(options, data.toString());

    if (jwt && jwt.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          token_type: "Bearer",
          access_token: jwt
        })
      };
    } else {
      console.log("Introspection succeeded but returned no JWT");
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "invalid_token" })
      };
    }
  } catch (err) {
    console.error("Introspection call failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "introspection_call_failed" })
    };
  }
};
import { createHmac } from 'crypto';

/**
 * Class used to handle the initial verification of a newly added webhook endpoint to Facebook. To be used with the GET
 * route as that is the method used by Facebook for token verification.
 */
export class ValidateWebhook {
  /* istanbul ignore next line */
  private constructor() {}

  /**
   * Method to validate Facebook Webhook when being run on AWS Lambda when payload is of API GW format and passed in.
   * @param event - The Lambda event object
   * @param {Function} callback - The Lambda callback function
   * @param {string} token - The Facebook token - Optional, will take FB_VERIFICATION_TOKEN if no parameter passed in.
   */
  public static validateLambda(event: any, callback: Function, token?: string) {
    const fbToken = token ? token : process.env.FB_VERIFICATION_TOKEN;
    const request = {
      query: {
        'hub.verify_token': event.queryStringParameters['hub.verify_token'],
        'hub.challenge': event.queryStringParameters['hub.challenge']
      }
    };
    const response = this.verifyToken(request, fbToken);
    response.isBase64Encoded = false;

    if (response.statusCode === 403) {
      response.body = 403;
    }
    callback(null, response);
  }

  /**
   * Method to validate Facebook Webhook when being run on a traditional server that passes in the request and response
   * objects.
   * @param req - The request object from server
   * @param res - The response object from server
   * @param token - The Facebook token - Optional, will take FB_VERIFICATION_TOKEN if no parameter passed in.
   */
  public static validateServer(req: any, res: any, token?: string) {
    const fbToken = token ? token : process.env.FB_VERIFICATION_TOKEN;
    const response = this.verifyToken(req, fbToken);

    if (response.statusCode === 403) {
      res.sendStatus(403);
    } else {
      res.status(200).send(req.query['hub.challenge']);
    }
  }

  /**
   * Method to validate Facebook message integrity
   * @param xHubSignature - The Signature present in Facebook payload
   * @param applicationSecret - The Facebook application secret - Optional, will take FB_APPLICATION_SECRET if no parameter passed in.
   */
  public static validateMessageIntegrity(
    xHubSignature: string,
    applicationSecret?: string
  ): boolean {
    if (
      !xHubSignature ||
      Object.prototype.toString.call(xHubSignature) !== '[object String]'
    ) {
      return false;
    }

    const xHubSignatureValueParts = xHubSignature.split('=');
    if (xHubSignatureValueParts.length !== 2) {
      return false;
    }

    let fbApplicationSecret;
    if (applicationSecret) {
      fbApplicationSecret = applicationSecret;
    } else if (process.env.FB_APPLICATION_SECRET) {
      fbApplicationSecret = process.env.FB_APPLICATION_SECRET;
    } else {
      console.error('No Facebook Application Secret provided.');
      return false;
    }
    const authenticationCode = createHmac(
      xHubSignatureValueParts[0],
      fbApplicationSecret
    ).digest('hex');

    if (authenticationCode === xHubSignatureValueParts[1]) {
      return true;
    }

    return false;
  }

  private static verifyToken(req: any, facebookToken?: string) {
    const tokenPresent = facebookToken != null;
    const remoteTokenPresent =
      req != null &&
      typeof req.query !== 'undefined' &&
      typeof req.query['hub.verify_token'] !== 'undefined';

    const response: any = {
      statusCode: 403
    };

    if (tokenPresent && remoteTokenPresent) {
      if (req.query['hub.verify_token'] === facebookToken) {
        response.statusCode = 200;
        response.body = req.query['hub.challenge'];
        return response;
      }
    }

    return response;
  }
}

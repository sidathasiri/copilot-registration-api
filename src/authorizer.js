// Example valid API key for simplicity (you can also use Secrets Manager or env variables)
const validApiKey = process.env.VALID_API_KEY;

exports.handler = async (event) => {
  const { methodArn, headers } = event;
  const apiKey = headers["Authorization"];

  // Check if the API key is valid
  if (apiKey === validApiKey) {
    return generatePolicy("Allow", methodArn);
  } else {
    return generatePolicy("Deny", methodArn);
  }
};

// Helper function to generate an IAM policy
function generatePolicy(effect, resource) {
  return {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

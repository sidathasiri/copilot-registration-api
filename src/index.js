const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  const apiKey = event.headers["x-api-key"] ?? "";
  if (apiKey !== process.env.API_KEY) {
    console.log("Request is not authorized");
    return {
      statusCode: 401,
      body: "Unauthorized",
    };
  }

  console.log("Request body", requestBody);

  // Prepare the DynamoDB put command
  const params = {
    TableName: "CopilotUsage", // Replace with your table name
    Item: {
      pk: { S: `user#${requestBody.machineId}` },
      sk: { S: `user#${requestBody.machineId}` },
      machineId: { S: requestBody.machineId },
      projectId: { S: requestBody.projectId },
      githubId: { S: requestBody.githubId }
    },
  };

  try {
    // Execute the put command
    await dynamoDbClient.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Registration succesful",
        data: requestBody
      }),
    };
  } catch (err) {
    console.error("Error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to save item",
        error: err.message,
      }),
    };
  }
};

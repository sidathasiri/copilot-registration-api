const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });

const saveUser = async (user) => {
  // Prepare the DynamoDB put command
  const params = {
    TableName: "CopilotUsage", // Replace with your table name
    Item: {
      pk: { S: `user#${user.machineId}` },
      sk: { S: `user#${user.machineId}` },
      machineId: { S: user.machineId },
      projectId: { S: user.projectId },
      githubId: { S: user.githubId },
    },
  };
  return dynamoDbClient.send(new PutItemCommand(params));
};

module.exports = {
  saveUser,
};

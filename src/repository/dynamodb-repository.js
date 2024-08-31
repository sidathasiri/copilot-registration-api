const {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });

const saveUser = async (user) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
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

const getUsers = async () => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    IndexName: "ProjectIdIndex",
  };

  return dynamoDbClient.send(new ScanCommand(params));
};

module.exports = {
  saveUser,
  getUsers,
};

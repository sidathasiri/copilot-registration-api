const {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { getUserPk } = require("../utils/dynamodb-utils");

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const tableName = process.env.DYNAMODB_TABLE;

const saveUser = async (user) => {
  const params = {
    TableName: tableName,
    Item: {
      pk: { S: getUserPk(user.machineId) },
      sk: { S: getUserPk(user.machineId) },
      machineId: { S: user.machineId },
      projectId: { S: user.projectId },
      githubId: { S: user.githubId },
    },
  };
  return dynamoDbClient.send(new PutItemCommand(params));
};

const getUsers = async () => {
  const params = {
    TableName: tableName,
    IndexName: "ProjectIdIndex",
  };

  return dynamoDbClient.send(new ScanCommand(params));
};

const getUserMetric = (githubId, metricName) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "pk = :pkValue AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pkValue": { S: getUserPk(githubId) },
      ":skPrefix": { S: `metric#copilot/${metricName}#` },
    },
  };

  return dynamoDbClient.send(new QueryCommand(params));
};

module.exports = {
  saveUser,
  getUsers,
  getUserMetric,
};

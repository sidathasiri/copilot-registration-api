const { unmarshall } = require("@aws-sdk/util-dynamodb");

const removeDataTypeInDynamoDBItem = (item) => unmarshall(item);

const removeKeysFromDynamoDBItem = (item) => {
  const { pk, sk, ...rest } = item;
  return rest;
};

const getFormattedDynamoDBItem = (item) => {
  const formattedItem = removeDataTypeInDynamoDBItem(item);
  return removeKeysFromDynamoDBItem(formattedItem);
};

module.exports = {
  removeDataTypeInDynamoDBItem,
  removeKeysFromDynamoDBItem,
  getFormattedDynamoDBItem,
};

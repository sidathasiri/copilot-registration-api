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

const getUserPk = (id) => `user#${id}`;

const getDateFromSk = (sk) => sk.split("#date#")[1];

const getGithubIdFromPk = (pk) => pk.split("#")[1];

const formatUsersMetrics = (fetchedDataRecords = []) => {
  const result = {};
  return fetchedDataRecords.map((record) => {
    console.log("record:", record);

    const recordItems = record.Items;
    const formattedRecordItems = recordItems.map((item) => {
      const formattedRecord = removeDataTypeInDynamoDBItem(item);
      const githubId = getGithubIdFromPk(formattedRecord.pk);
      const date = getDateFromSk(formattedRecord.sk);
      return {
        githubId,
        date,
        count: formattedRecord.value,
      };
    });

    console.log("formattedRecordItems:", formattedRecordItems);
    const processedRecord = formattedRecordItems.reduce((acc, item) => {
      const { githubId, count, date } = item;

      // If the group doesn't exist, create it
      if (!acc[githubId]) {
        acc[githubId] = [];
      }

      // Push the item into the group
      acc[githubId].push({ count, date });

      return acc;
    }, {});

    console.log("processedRecord:", processedRecord);
    return processedRecord;
  });
};

module.exports = {
  removeDataTypeInDynamoDBItem,
  removeKeysFromDynamoDBItem,
  getFormattedDynamoDBItem,
  getUserPk,
  formatUsersMetrics,
};

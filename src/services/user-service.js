const {
  saveUser,
  getUsers,
  getUserMetric,
} = require("../repository/dynamodb-repository");
const {
  getFormattedDynamoDBItem,
  removeDataTypeInDynamoDBItem,
  formatUsersMetrics,
} = require("../utils/dynamodb-utils");

const registerUser = async (requestBody) => {
  try {
    await saveUser(requestBody);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Registration successful",
        data: requestBody,
      }),
    };
  } catch (err) {
    console.error("Error registering user", { requestBody, err });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to register user",
      }),
    };
  }
};

const getAllUsers = async () => {
  try {
    const data = await getUsers();
    console.log("data", data.Items[0]);
    const items = data.Items.map((item) => getFormattedDynamoDBItem(item));
    console.log("items", items);

    return {
      statusCode: 200,
      body: JSON.stringify({
        count: data.Count,
        users: items,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  } catch (err) {
    console.error("Error getting users:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve users",
      }),
    };
  }
};

const getUsersMetrics = async (metricName, githubIDs = []) => {
  try {
    // Create an array of promises for each item
    const metricPromises = githubIDs.map((githubId) =>
      getUserMetric(githubId, metricName)
    );
    // Execute all promises in parallel and wait for them to resolve
    const response = await Promise.all(metricPromises);
    console.log("response:", response);
    const results = formatUsersMetrics(response);
    console.log("results:", results);
    const processedResult = {};
    results.forEach((item) => {
      // Get the githubId and its corresponding array of objects
      const githubId = Object.keys(item)[0];
      const values = item[githubId];

      // Add or initialize the githubId key in the result object
      processedResult[githubId] = values;
    });

    console.log("processedResult:", processedResult);

    return {
      statusCode: 200,
      body: JSON.stringify({
        metricName,
        data: processedResult,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  } catch (err) {
    console.error("Error getting user metrics:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve user metrics",
      }),
    };
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  getUsersMetrics,
};

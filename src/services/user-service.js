const { saveUser, getUsers } = require("../repository/dynamodb-repository");
const { getFormattedDynamoDBItem } = require("../utils/dynamodb-utils");

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
        data: JSON.stringify({
          count: data.Count,
          users: items,
        }),
      }),
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

module.exports = {
  registerUser,
  getAllUsers,
};

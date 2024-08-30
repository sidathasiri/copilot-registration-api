const { saveUser } = require("../repository/dynamodb-repository");

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

module.exports = {
  registerUser,
};

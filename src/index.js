const { registerUser } = require("./services/user-service");

exports.handler = async (event) => {
  const { httpMethod, resource } = event;

  if (httpMethod === "POST" && resource === "/register") {
    const requestBody = JSON.parse(event.body);
    console.log("Register request received", requestBody);
    return registerUser(requestBody);
  }
};

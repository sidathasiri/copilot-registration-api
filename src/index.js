const { retrieveProjects } = require("./services/project-service");
const { registerUser } = require("./services/user-service");

exports.handler = async (event) => {
  const { httpMethod, resource } = event;

  const request = `${httpMethod} ${resource}`;

  if (request === "POST /register") {
    const requestBody = JSON.parse(event.body);
    console.log("Register request received", requestBody);
    return registerUser(requestBody);
  } else if (request === "GET /projects") {
    console.log("Get projects request received");
    return retrieveProjects();
  } else {
    return {
      statusCode: 400,
      body: "Invalid request",
    };
  }
};

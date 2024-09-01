const {
  registerUser,
  getAllUsers,
  getUsersMetrics,
} = require("./services/user-service");

exports.handler = async (event) => {
  const { httpMethod, resource } = event;

  const request = `${httpMethod} ${resource}`;

  console.log("Request received:", request);

  if (request === "POST /register") {
    const requestBody = JSON.parse(event.body);
    console.log("Register request received", requestBody);
    return registerUser(requestBody);
  } else if (request === "GET /users") {
    console.log("Get projects request received");
    return getAllUsers();
  } else if (request === "POST /metrics") {
    const body = JSON.parse(event.body);
    console.log("Metrics request received", {
      body: body,
    });
    return getUsersMetrics(body.metricName, body.githubIds);
  } else {
    return {
      statusCode: 400,
      body: "Invalid request",
    };
  }
};

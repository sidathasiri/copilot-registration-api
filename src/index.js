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
  } else if (request === "POST /users/metrics/{metricName}") {
    const metricName = event.pathParameters?.metricName;
    const body = JSON.parse(event.body);
    console.log("Metrics request received", {
      metricName,
      body: body,
    });
    return getUsersMetrics(metricName, body.githubIds);
  } else {
    return {
      statusCode: 400,
      body: "Invalid request",
    };
  }
};

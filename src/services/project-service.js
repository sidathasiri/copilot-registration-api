const { getProjects } = require("../repository/dynamodb-repository");

const retrieveProjects = async () => {
  try {
    const data = await getProjects();
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: JSON.stringify(data.Items),
      }),
    };
  } catch (err) {
    console.error("Error retrieving projects:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve projects",
      }),
    };
  }
};

module.exports = {
  retrieveProjects,
};

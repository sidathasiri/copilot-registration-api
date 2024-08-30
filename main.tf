provider "aws" {
  region = var.region
}

# S3 bucket for Terraform state backend
terraform {
  backend "s3" {
    bucket = "copilot-analyzer-tf-backend"
    key    = "api-gw/state"
    region = "us-east-1"
  }
}

# DynamoDB Table
resource "aws_dynamodb_table" "my_table" {
  name         = "CopilotUsage"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  # Attributes for the GSI
  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "githubId"
    type = "S"
  }

  # Global Secondary Index
  global_secondary_index {
    name               = "ProjectIdIndex"
    hash_key           = "projectId"
    range_key          = "githubId"
    projection_type    = "ALL" # You can use "ALL" or "KEYS_ONLY" or "INCLUDE"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda to access DynamoDB
resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "lambda_dynamodb_policy"
  description = "IAM policy for Lambda to access DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.my_table.arn
      }
    ]
  })
}

# Attach the policy to the Lambda execution role
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

resource "aws_iam_policy_attachment" "lambda_basic_execution_policy" {
  name       = "lambda-basic-execution-policy-attachment"
  roles      = [aws_iam_role.lambda_exec_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function
resource "aws_lambda_function" "my_lambda" {
  filename         = "lambda_function_payload.zip"
  function_name    = "copilot-registration"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "src/index.handler"
  runtime          = "nodejs18.x"

  source_code_hash = filebase64sha256("lambda_function_payload.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.my_table.name
    }
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "my_rest_api" {
  name        = "copilot-registration-api"
  description = "Registration API for Copilot Usage Tracker"
}

resource "aws_api_gateway_model" "request_model" {
  rest_api_id = aws_api_gateway_rest_api.my_rest_api.id
  name        = "RegisterPostRequestModel"
  content_type = "application/json"
  schema = jsonencode({
    type = "object"
    properties = {
      githubId = {
        type = "string"
      }
      projectId = {
        type = "string"
      }
      machineId = {
        type = "string"
      }
    }
    required = ["githubId", "projectId", "machineId"]
    additionalProperties = false
  })
}

resource "aws_api_gateway_request_validator" "request_validator" {
  rest_api_id = aws_api_gateway_rest_api.my_rest_api.id
  name        = "ValidateRequestBody"
  validate_request_body = true
  validate_request_parameters = false
}

# API Gateway Resource
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.my_rest_api.id
  parent_id   = aws_api_gateway_rest_api.my_rest_api.root_resource_id
  path_part   = "register"
}

# API Gateway Method
resource "aws_api_gateway_method" "proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.my_rest_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "POST"
  authorization = "NONE"

  request_validator_id = aws_api_gateway_request_validator.request_validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.request_model.name
  }
}

# API Gateway Integration
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.my_rest_api.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.my_lambda.invoke_arn
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration
  ]
  rest_api_id = aws_api_gateway_rest_api.my_rest_api.id
  stage_name  = "prod"
}

# Lambda Permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.my_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.my_rest_api.execution_arn}/*/*"
}

# Output the API endpoint URL
output "api_url" {
  value = "${aws_api_gateway_deployment.api_deployment.invoke_url}"
}

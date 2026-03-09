#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🚀 Generating Postman Collection...");

// Get collection name or use default
const collectionName = process.argv[2] || "LeadFlexUp API";
const baseUrl = process.argv[3] || "{{baseUrl}}";

// Create Postman collection structure
function createPostmanCollection(name, baseUrl) {
  return {
    info: {
      name: name,
      description: `API collection for ${name}`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _exporter_id: "leadflexup-generator"
    },
    item: [],
    variable: [
      {
        key: "baseUrl",
        value: "http://localhost:3000",
        type: "string"
      },
      {
        key: "apiVersion",
        value: "v1",
        type: "string"
      }
    ],
    auth: {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{authToken}}",
          type: "string"
        }
      ]
    },
    event: [
      {
        listen: "prerequest",
        script: {
          type: "text/javascript",
          exec: [
            "// Auto-generated pre-request script",
            "console.log('Making request to:', pm.request.url.toString());"
          ]
        }
      },
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "// Auto-generated test script",
            "pm.test('Status code is success', function () {",
            "    pm.response.to.have.status.that.is.oneOf([200, 201, 204]);",
            "});",
            "",
            "pm.test('Response time is less than 2000ms', function () {",
            "    pm.expect(pm.response.responseTime).to.be.below(2000);",
            "});"
          ]
        }
      }
    ]
  };
}

// Create request template
function createRequest(name, method, url, description, body = null, headers = []) {
  const request = {
    name: name,
    request: {
      method: method.toUpperCase(),
      header: [
        {
          key: "Content-Type",
          value: "application/json",
          type: "text"
        },
        ...headers
      ],
      url: {
        raw: `${baseUrl}/api/{{apiVersion}}${url}`,
        host: [baseUrl.replace('{{', '').replace('}}', '')],
        path: ["api", "{{apiVersion}}", ...url.split('/').filter(p => p)]
      }
    },
    response: []
  };

  if (body && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put' || method.toLowerCase() === 'patch')) {
    request.request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  // Add description if provided
  if (description) {
    request.request.description = description;
  }

  return request;
}

// Scan modules and generate requests
function scanModulesForRoutes() {
  const modulesDir = path.join(__dirname, "..", "modules");
  const requests = [];
  
  if (!fs.existsSync(modulesDir)) {
    console.log("ℹ️  No modules directory found, creating sample requests");
    return createSampleRequests();
  }

  const modules = fs.readdirSync(modulesDir).filter(item => 
    fs.statSync(path.join(modulesDir, item)).isDirectory()
  );

  modules.forEach(moduleName => {
    const routeFile = path.join(modulesDir, moduleName, "routes", `${moduleName}Routes.js`);
    
    if (fs.existsSync(routeFile)) {
      const routeContent = fs.readFileSync(routeFile, "utf8");
      const moduleRequests = parseRouteFile(moduleName, routeContent);
      
      if (moduleRequests.length > 0) {
        requests.push({
          name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
          item: moduleRequests
        });
      }
    }
  });

  return requests.length > 0 ? requests : createSampleRequests();
}

// Parse route file to extract endpoints
function parseRouteFile(moduleName, content) {
  const requests = [];
  const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  
  // Look for router.get, router.post, etc.
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1];
    const route = match[2];
    const fullRoute = `/${moduleName}${route === '/' ? '' : route}`;
    
    // Generate request based on HTTP method
    switch (method.toLowerCase()) {
      case 'get':
        if (route.includes(':id')) {
          requests.push(createRequest(
            `Get ${capitalized} by ID`,
            'GET',
            fullRoute.replace(':id', '{{id}}'),
            `Retrieve a specific ${moduleName} by ID`
          ));
        } else {
          requests.push(createRequest(
            `Get All ${capitalized}s`,
            'GET',
            fullRoute,
            `Retrieve all ${moduleName}s`
          ));
        }
        break;
        
      case 'post':
        requests.push(createRequest(
          `Create ${capitalized}`,
          'POST',
          fullRoute,
          `Create a new ${moduleName}`,
          generateSampleBody(moduleName)
        ));
        break;
        
      case 'put':
        requests.push(createRequest(
          `Update ${capitalized}`,
          'PUT',
          fullRoute.includes(':id') ? fullRoute.replace(':id', '{{id}}') : `${fullRoute}/{{id}}`,
          `Update an existing ${moduleName}`,
          generateSampleBody(moduleName)
        ));
        break;
        
      case 'delete':
        requests.push(createRequest(
          `Delete ${capitalized}`,
          'DELETE',
          fullRoute.includes(':id') ? fullRoute.replace(':id', '{{id}}') : `${fullRoute}/{{id}}`,
          `Delete a ${moduleName} by ID`
        ));
        break;
        
      case 'patch':
        requests.push(createRequest(
          `Partial Update ${capitalized}`,
          'PATCH',
          fullRoute.includes(':id') ? fullRoute.replace(':id', '{{id}}') : `${fullRoute}/{{id}}`,
          `Partially update a ${moduleName}`,
          generateSampleBody(moduleName, true)
        ));
        break;
    }
  }
  
  return requests;
}

// Generate sample body based on Prisma schema
function generateSampleBody(modelName, isPartial = false) {
  const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
  
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const body = parseSchemaForModel(modelName, schemaContent, isPartial);
    if (body) return body;
  }
  
  // Default sample body
  const defaultBody = {
    name: `Sample ${modelName}`,
    description: `This is a sample ${modelName}`,
  };
  
  if (modelName.toLowerCase() === 'user') {
    return {
      email: "user@example.com",
      full_name: "John Doe",
      ...(isPartial ? {} : defaultBody)
    };
  }
  
  return defaultBody;
}

// Parse Prisma schema to generate sample data
function parseSchemaForModel(modelName, schemaContent, isPartial = false) {
  const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const modelRegex = new RegExp(`model\\s+${capitalized}\\s*{([^}]+)}`, 'i');
  const match = modelRegex.exec(schemaContent);
  
  if (!match) return null;
  
  const modelBody = match[1];
  const fields = {};
  
  // Parse fields
  const fieldRegex = /(\w+)\s+(\w+)(\[\]|\?)?/g;
  let fieldMatch;
  
  while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
    const fieldName = fieldMatch[1];
    const fieldType = fieldMatch[2];
    const isOptional = fieldMatch[3] === '?';
    const isArray = fieldMatch[3] === '[]';
    
    // Skip auto-generated fields
    if (['id', 'createdAt', 'updatedAt'].includes(fieldName)) continue;
    
    // Skip optional fields in partial updates sometimes
    if (isPartial && isOptional && Math.random() > 0.5) continue;
    
    // Generate sample data based on type
    switch (fieldType.toLowerCase()) {
      case 'string':
        if (fieldName.toLowerCase().includes('email')) {
          fields[fieldName] = "user@example.com";
        } else if (fieldName.toLowerCase().includes('name')) {
          fields[fieldName] = "Sample Name";
        } else {
          fields[fieldName] = isArray ? ["sample", "data"] : "Sample string";
        }
        break;
      case 'int':
        fields[fieldName] = isArray ? [1, 2, 3] : 42;
        break;
      case 'float':
        fields[fieldName] = isArray ? [1.1, 2.2, 3.3] : 3.14;
        break;
      case 'boolean':
        fields[fieldName] = isArray ? [true, false] : true;
        break;
      case 'datetime':
        fields[fieldName] = isArray ? ["2024-01-01T00:00:00Z", "2024-12-31T23:59:59Z"] : "2024-01-01T00:00:00Z";
        break;
      case 'json':
        fields[fieldName] = isArray ? [{"key": "value"}, {"another": "object"}] : {"key": "value"};
        break;
      default:
        fields[fieldName] = isArray ? ["sample"] : "sample";
    }
  }
  
  return Object.keys(fields).length > 0 ? fields : null;
}

// Create sample requests if no modules found
function createSampleRequests() {
  return [
    {
      name: "Users",
      item: [
        createRequest("Get All Users", "GET", "/users", "Retrieve all users"),
        createRequest("Get User by ID", "GET", "/users/{{id}}", "Retrieve a specific user by ID"),
        createRequest("Create User", "POST", "/users", "Create a new user", {
          email: "user@example.com",
          full_name: "John Doe"
        }),
        createRequest("Update User", "PUT", "/users/{{id}}", "Update an existing user", {
          email: "updated@example.com",
          full_name: "Jane Doe"
        }),
        createRequest("Delete User", "DELETE", "/users/{{id}}", "Delete a user by ID")
      ]
    },
    {
      name: "Health Check",
      item: [
        createRequest("API Health Check", "GET", "/health", "Check if the API is running")
      ]
    }
  ];
}

// Main execution
try {
  const collection = createPostmanCollection(collectionName, baseUrl);
  const moduleRequests = scanModulesForRoutes();
  
  collection.item = moduleRequests;
  
  // Create output directory
  const outputDir = path.join(__dirname, "..", "docs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Write collection file
  const outputFile = path.join(outputDir, `${collectionName.replace(/\s+/g, '_')}_Collection.json`);
  fs.writeFileSync(outputFile, JSON.stringify(collection, null, 2));
  
  // Create environment file
  const environment = {
    id: "leadflexup-env",
    name: "LeadFlexUp Environment",
    values: [
      {
        key: "baseUrl",
        value: "http://localhost:3000",
        enabled: true
      },
      {
        key: "apiVersion",
        value: "v1",
        enabled: true
      },
      {
        key: "authToken",
        value: "your-jwt-token-here",
        enabled: true
      },
      {
        key: "id",
        value: "sample-id",
        enabled: true
      }
    ],
    _postman_variable_scope: "environment"
  };
  
  const envFile = path.join(outputDir, "LeadFlexUp_Environment.json");
  fs.writeFileSync(envFile, JSON.stringify(environment, null, 2));
  
  console.log("✅ Postman collection generated successfully!");
  console.log("");
  console.log("📋 Generated files:");
  console.log(`   📁 ${outputFile}`);
  console.log(`   📁 ${envFile}`);
  console.log("");
  console.log("🚀 Next steps:");
  console.log("   1. Open Postman");
  console.log("   2. Import the collection file");
  console.log("   3. Import the environment file");
  console.log("   4. Set the environment as active");
  console.log("   5. Update the authToken variable with your JWT token");
  console.log("");
  console.log("📖 Usage tips:");
  console.log("   - Use {{baseUrl}} for dynamic server URLs");
  console.log("   - Use {{id}} for dynamic resource IDs");
  console.log("   - Pre-request scripts auto-log request URLs");
  console.log("   - Response tests validate status codes and timing");
  
  // Show statistics
  const totalRequests = collection.item.reduce((sum, folder) => sum + (folder.item?.length || 0), 0);
  console.log("");
  console.log("📊 Collection statistics:");
  console.log(`   - ${collection.item.length} folders`);
  console.log(`   - ${totalRequests} requests`);
  console.log(`   - ${environment.values.length} environment variables`);
  
} catch (error) {
  console.error("❌ Error generating Postman collection:", error.message);
  process.exit(1);
}
import YAML from "yamljs";
import path from "path";
import fs from "fs";

const yamlAPIDirectory = path.join(__dirname, "swagger-api-docs");
const yamlSchemaDirectory = path.join(__dirname, "swagger-schema-docs");

const yamlAPIDocuments: Record<string, any> = {};
const yamlSchemaDocuments: Record<string, any> = {};

// Read all files from the swagger-api-docs directory
fs.readdirSync(yamlAPIDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlAPIDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlAPIDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error: any) {
      console.error(`Error loading ${file}`, error);
    }
  }
});

// Read all files from the swagger-schema-docs directory
fs.readdirSync(yamlSchemaDirectory).forEach((file) => {
  // Filter only .yaml or .yml files
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    const filePath = path.join(yamlSchemaDirectory, file);

    // Using the file as a key without the extension
    const fileNameWithoutExtension = path.basename(file, path.extname(file));
    try {
      yamlSchemaDocuments[fileNameWithoutExtension] = YAML.load(filePath);
    } catch (error: any) {
      console.error(`Error loading ${file}`, error);
    }
  }
});

const userApi = yamlAPIDocuments["user-api"];
const userSchema = yamlSchemaDocuments["user-schema"];

const courseApi = yamlAPIDocuments["course-api"];
const courseSchema = yamlSchemaDocuments["course-schema"];

const orderSchema = yamlSchemaDocuments["order-schema"];

const notificationSchema = yamlSchemaDocuments["notification-schema"];

const layoutSchema = yamlSchemaDocuments["layout-schema"];

const OPENAPI_DOCS = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Learnaray - Learning Management System API",
    description: `Learnaray LMS API provides a set of endpoints for managing essential components of Learning Management System application, including:
                - **Users:** Manage user accounts and permissions.
                - **Courses:** Create, update, and manage courses and content.
                - **Orders:** Handle course purchases and payment workflows.
                - **Notifications:** Send alerts and announcements about an activity.
                - **Analytics:** Retrieve data on user activity and course performance.
                - **Layouts:** Customize layouts for landing page.
                This API uses JWT(Json Web Token) for secure authentication and returns data in JSON format.
                `,
  },
  servers: [
    {
      url: "https://learnaray-lms.vercel.app/",
      description: "My API Documentation",
    },
  ],
  paths: {
    ...userApi.paths,
    ...courseApi.paths,
  },
  components: {
    schemas: {
      ...userSchema.components.schemas,
      ...courseSchema.components.schemas,
      ...orderSchema.components.schemas,
      ...notificationSchema.components.schemas,
      ...layoutSchema.components.schemas,
    },
  },
};

export default OPENAPI_DOCS;

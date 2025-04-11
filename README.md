# Workshop Task and Inventory Management System

This is a web-based management system designed for a garment production workshop. It provides tools for assigning tasks to operators, monitoring material inventories, managing completed sales, and tracking technical specifications for various pants models.

## Features

- 🔐 User authentication with hierarchical roles:
  - **Administrator**: Full access to task assignment, inventory control, and sales logging.
  - **Operator**: Can only view their assigned task and its description.
  
- 📋 Task Assignment Module:
  - Admins can assign or update operator tasks from a predefined list (e.g. cutting, sewing, packing).
  - Tasks include general descriptions for operator understanding.

- 🧑‍🔧 Operator Dashboard:
  - Displays the operator's current task and a clear description.
  - Interface is simplified and focused for clarity.

- 📦 Inventory Control:
  - Tracks available materials, minimum required stock, and flags shortages.
  - Includes dynamic visualizations (charts) to show material availability.

- 🛠 Technical Sheets:
  - Visual catalog of different pants models.
  - Displays images and names for reference in production or inventory.

- 📊 Summary Dashboard:
  - Visual analytics for orders in process, completed, or pending.
  - Material availability charts via Chart.js.

- 🌐 Hosted on Hostinger with MySQL database and PHP-based API endpoints.

## Technologies Used

- HTML5, JavaScript (Vanilla), PHP
- TailwindCSS for responsive styling
- Chart.js for analytics visualization
- MySQL for database operations
- Git for version control
- Hostinger as hosting platform

## Folder Structure (simplified)

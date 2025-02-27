# Getting Started
Welcome to the project of the Programming School. 
This project serves as the backend and frontend components of the CRM system, 
providing a robust and efficient API for managing student applications and inquiries. 
Powered by Java, Spring Boot, Docker, and NGINX, and integrated with a MySQL database.

**Features**:
- Provides RESTful APIs for creating, updating, and retrieving student applications.
- Implements authentication and authorization for secure access to the system.
- Utilizes MySQL for efficient and scalable data management.
- Supports pagination, sorting, and filtering of student applications.
- Easily integrates with frontend applications to deliver a complete CRM solution.

----
# Technical Specification
This project is built using the following technologies:

- Java
- Spring Boot
- MySQL
- Docker
- NGINX

----
# Requirements
Before running the project, ensure you have the following installed:

- Java 17 or higher
- Maven 3.x or higher
- MySQL 8 or higher
- Docker and Docker Compose

----
# Setup Instructions
1. Clone the repository to your local machine:

```
git clone https://github.com/Viktor-Gorelov/Okten_Project.git
```

2. Build and run the application using Docker:

```
docker-compose up --build
```

3. Open your web browser and access the following URL:

```
http://localhost:<PORT>
```

Replace `<PORT>` with the port number you specified in the `.env` configuration file.

----
# Project Details
**Authentication**

The project supports two roles:
- **Admin**
- **Manager**

Use the default admin credentials to log in:
- **Email**: `admin@gmail.com`
- **Password**: `admin`

After logging in, you'll be redirected to the Orders page. 

The following fields are displayed for each application:

- `id`,`name`, `surname`, `email`, `phone`, `age`, `course`, `course_format`, `course_type`,`status`, `sum`, `alreadyPaid`, `created_at`

**Pagination**
- Applications are paginated, showing 25 applications per page.
- By default, applications are sorted in descending order by `created_at`.

The pagination panel operates as follows:

- When you are on the first page: **First Page**
- When you are on a page in the first half of all pages, excluding the first: **First Half**
- When you are on a **Middle** of all page: Both "Previous" and "Next" buttons are visible.
- When you are on a page in the second half of all pages, excluding the last: **Second Half**
- When you are on the last page: **Last Page**

**Sorting**
- Click on any column header to sort applications by that column in **ascending** or **descending** order.
- The sorting preferences are reflected in the Query Parameters.


----
## Postman help
To make a request in Postman, you can follow these steps:

1. Open Postman and select the appropriate query method.
2. Enter the URL, replacing :the appropriate parameter with the actual value.
3. Customize any necessary headers or parameters for the request.
4. Click the Send button (or press the Enter hotkey) to send the request.<p> Remember that you must have the server running on your `http://localhost:<PORT>` to successfully connect and receive a response.</p>

Postman collection here in project directory with name `Okten Project.postman_collection.json`

----
## Stay in touch
- Author - [Viktor](https://github.com/Viktor-Gorelov)
- Mail me - <a href="mailto:viktor15gorelov@gmail.com">viktor15gorelov@gmail.com</a>
- Call me - +380994776300

----
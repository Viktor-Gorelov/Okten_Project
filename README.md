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

Additional column are added:
- **manager**: Indicates the manager assigned to order;
- **group**: Indicates the group assigned to order;

Clicking on an application expands its details:
- The **Message** and **UTM** fields display information from the database table.
- Input field allows you to enter comments to order.
- Comments can only be added to applications without an assigned manager or manager is current user.
- Submitting a comment, the current user's name is recorded in the "manager" column, and the status is set to **In Work** if it was previously null or **New**.
- The comment, author, and date displayed.

**Modal Window EDIT**

Clicking the **EDIT** open a modal window with an edit form:
- Only applications without an assigned manager or current user is owner can be edited.
- All form fields can be left empty.
- The form include functionality to add a new group directly from the modal window.
- Performed validation.

**Filtration**

Added inputs and selects for filters of orders:
- `Name`, `Surname`, `Email`, `Phone`, `Age`, `Start date`, `End date` - inputs for writing;
- `Courses`, `Course Formats`, `Course Types`, `Statuses`, `Groups` - selects for selection;
- Filtering by text fields can search for matches across the entire field;
- There is a checkbox that filters only your applications and a button that clears all filters;
- Button that will form an Excel table (file) of applications according to your filters;

**Header**
- Has a logo, current username, button logout and admin button if you admin;

**Admin Panel**
- Page have statistics of all orders which contains: `Total`, `Agree`, `In Work`, `Disagree`, `Dubbing`, `New`.  

**Modal Window CREATE**

Clicking the **CREATE** open a modal window create manager:
- For creating manager need enter Email, Name and Surname;
- After clicking **CREATE** in modal window created manager should be displayed in the list of managers.

**List of Managers**
- To activate the manager, you need to click on the **ACTIVATE** button, at the same time a link with a token should be generated (token lifetime 30 minutes) for activation and copied to the clipboard;
- Example: http://bigbird.space/activate/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWN0aXZhdGUiLCJleHAiOjE2OTA5OTAzMTEsImlhdCI6MTY5MDk4OTcxMSwianRpIjoiNzExZTljMjE0YjIxNGY5NDgyOTQwNzg0ZTM3ZjNjZDIiLCJ1c2VyX2lkIjoxMDl9.1tJKW5zZjSbHsTP0zI8QOfSxCtZ—Pxta9j7YjsziDE
- This link is sent to the manager in any way and when you click on it, you should get to the page for creating a password, after that, the manager can log in and deal with requests.

There are three buttons for each user:
- **ACTIVATE** if it is not yet activated;
- **RECOVERY PASSWORD** to recover the password (the flow is the same as during activation);
- **BAN** to block the user (blocked users cannot log in);
- **UNBAN** to unblock the user; 

Each manager must have individual statistics on his requests as well as orders;

**Pagination**
- List of managers are paginated, showing 6 managers per page;
- By default, managers are sorted in descending order by `created_at`.
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
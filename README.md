# Bookface
Enterprise computing programming coursework

## Technologies
* Node.js
* Express
* Express Messages, Session, Connect Flash & Validation
* MongoDB & Mongoose
* Pug Templating
* Passport.js Authentication
* BCrypt Hashing

## Usage


### Installation

Install the dependencies

```sh
$ npm install
```
Run app listening on **localhost:3000**

```sh
$ npm start
```

### Data and Admin
Use data in the data folder in your MongoDB database
  - Import the JSON collections to your local database manually via the command line with mongodump or with a tool like Studio3T
  - If using data provided the admin account is already created with username:**admin** and password:**pass**
  - If you choose to create accounts manually the first account created with username **admin** (case sensitive) will have access to edit and delete functionality
  - Once an account is registered a link is sent to the email address which they must visit to verify and successfully login with their details, then they will be able to add books and authors
  - Optionally in ./config/mailer.js you may change EMAIL_USER and EMAIL_PASS to any other gmail username and password to send verification emails the details provided are for a dummy account

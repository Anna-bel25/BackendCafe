CREATE DATABASE IF NOT EXISTS `cafeteriadb`;

USE cafeteriadb;

CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    contactNumber VARCHAR(255),
    email VARCHAR(50),
    password VARCHAR(255),
    status VARCHAR(20),
    role VARCHAR(50),
    UNIQUE (email)
);

CREATE TABLE category (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE product (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    description VARCHAR(255),
    price INTEGER,
    status VARCHAR(20),
    PRIMARY KEY (id)
);

CREATE TABLE bill (
    id INT NOT NULL AUTO_INCREMENT,
    uui VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(20) NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    total INT NOT NULL,
    productDetails JSON DEFAULT NULL,
    createBy VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

// Insert data

INSERT INTO user (
    name, 
    contactNumber, 
    email, 
    password, 
    status,
    role
) VALUES (
    'Admin',
    '12345789',
    'admin@gmail.com',
    'admin',
    'true',
    'admin'
);

INSERT INTO user (
    name, 
    contactNumber, 
    email, 
    password
) VALUES (
    'Soobin',
    '123456788',
    'soobin@gmail.com',
    'soobin1234'
);

INSERT INTO user (
    name, 
    contactNumber, 
    email, 
    password,
    status
) VALUES (
    'Soobin',
    '123456778',
    'soobin@mailinator.com',
    'soobin1234',
    'true'
);


SELECT * FROM user;
DESC category;
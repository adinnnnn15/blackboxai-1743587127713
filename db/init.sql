CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description NVARCHAR(MAX),
    image NVARCHAR(255)
);

CREATE TABLE Cart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE CartItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cart_id INT FOREIGN KEY REFERENCES Cart(id),
    product_id INT FOREIGN KEY REFERENCES Products(id),
    quantity INT NOT NULL
);

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

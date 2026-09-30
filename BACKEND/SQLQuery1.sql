CREATE TABLE UserType 
(
	TypeId INT IDENTITY(1, 1) PRIMARY KEY,
	TypeName VARCHAR(10) UNIQUE
);

INSERT INTO UserType(TypeName) VALUES ('Admin');
INSERT INTO UserType(TypeName) VALUES ('User');

SELECT * FROM UserType;

CREATE TABLE Users 
(
	UserId INT IDENTITY(1, 1) PRIMARY KEY,
	FullName VARCHAR(100) NOT NULL,
	Email VARCHAR(100) UNIQUE NOT NULL,
	Password VARCHAR(100) NOT NULL,
	TypeId INT REFERENCES UserType(TypeId) ON DELETE CASCADE NOT NULL
);

INSERT INTO Users(FullName, Email, Password, TypeId) VALUES ('John Doe', 'john@artisian.com', 'john123', 1);
INSERT INTO Users(FullName, Email, Password, TypeId) VALUES ('Smith Thomas', 'smith@gmail.com', '1234', 2);

SELECT * FROM Users;

CREATE TABLE Cart 
(
	CartId INT IDENTITY(1, 1) PRIMARY KEY,
	UserId INT REFERENCES Users(UserId) ON DELETE CASCADE NOT NULL
);

SELECT * FROM Cart;

CREATE TABLE Category 
(
	CategoryId INT IDENTITY(1, 1) PRIMARY KEY,
	CategoryName VARCHAR(100) NOT NULL UNIQUE 
);

INSERT INTO Category(CategoryName) VALUES ('Nature');
INSERT INTO Category(CategoryName) VALUES ('Tribal Art');
INSERT INTO Category(CategoryName) VALUES ('Religious');
INSERT INTO Category(CategoryName) VALUES ('Monuments');

SELECT * FROM Category order by CategoryId;

CREATE TABLE Products 
(
	ProductId INT IDENTITY(1, 1) PRIMARY KEY,
	ProductName VARCHAR(100) UNIQUE NOT NULL,
	Price INT NOT NULL CHECK(Price > 0),
	Image VARCHAR(500) UNIQUE NOT NULL, 
	Quantity INT CHECK(Quantity >= 0),
	CategoryId INT REFERENCES Category(CategoryId) ON DELETE CASCADE NOT NULL, 
);

ALTER TABLE Products
ADD Description VARCHAR(500) NOT NULL;

INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Madhubani Painting', 1800, 'images/Madhubani.webp', 5, 2, 'A beautiful painting style from the people of Bihar in India.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Pattachitra Painting', 2100, 'images/Pattachitra.jpg', 5, 2, 'A beautiful painting style from the people of West Bengal in India.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Sohrai Painting', 1200, 'images/Sohrai.webp', 5, 2, 'A beautiful painting style from the people of Jharkhand in India.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Tanjore Painting', 2500, 'images/Tanjore.webp', 5, 2, 'A beautiful painting style from the people of Tanjore, Tamil Nadu in India.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Warli Painting', 1700, 'images/Warli.jpg', 5, 2, 'A beautiful painting style from the people of Maharashtra in India.'
);

UPDATE Products SET Image = 'images/Religious1.jpg' WHERE ProductId = 6;

INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Radha Krishna Painting', 3500, 'images/Religious.jpg', 5, 3, 'A beautiful painting of Radha Krishna with Gopis.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Shree Ganesh Ji Painting', 2000, 'images/Religious2.png', 5, 3, 'A beautiful painting of Ganesh Ji.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Jesus Painting', 1900, 'images/Religious3.jpg', 5, 3, 'A spiritual painting of Jesus.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Gautam Buddha Painting', 1850, 'images/Religious4.jpg', 5, 3, 'A powerful painting of Gautam Buddha meditating.'
);
INSERT INTO Products(ProductName, Price, Image, Quantity, CategoryId, Description) VALUES 
(
	'Laxmi Narayan Painting', 4000, 'images/Religious5.webp', 5, 3, 'A beautiful painting of Narayan with Laxmi.'
);

SELECT * FROM Products;

CREATE TABLE CartItems 
(
	CartItemId INT IDENTITY(1, 1) PRIMARY KEY,
	CartId INT REFERENCES Cart(CartId) ON DELETE CASCADE NOT NULL,
	ProductId INT REFERENCES Products(ProductId) ON DELETE CASCADE NOT NULL,
	Quantity INT NOT NULL CHECK(Quantity > 0),
);

SELECT * FROM CartItems;

CREATE TABLE Orders 
(
	OrderId INT IDENTITY(1, 1) PRIMARY KEY,
	UserId INT REFERENCES Users(UserId) ON DELETE CASCADE NOT NULL
);

SELECT * FROM Orders;

CREATE TABLE OrderItem 
(
	OrderItemId INT IDENTITY(1, 1) PRIMARY KEY,
	OrderId INT REFERENCES Orders(OrderId) ON DELETE CASCADE NOT NULL,
	ProductId INT REFERENCES Products(ProductId) NOT NULL,
	Quantity INT CHECK(Quantity > 0) NOT NULL
);

SELECT * FROM OrderItem;
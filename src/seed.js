// The practice database: five related tables, rebuilt fresh whenever the
// learner resets. The data is deliberately shaped to make edge cases teachable
// — a customer with no orders, a product no one ordered, a manager hierarchy —
// so problems like "customers who never ordered" actually have an answer.

export const SEED = `
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT,
  city        TEXT,
  country     TEXT,
  signup_date TEXT
);
INSERT INTO customers VALUES
 (1,'Sarah Johnson','New York','USA','2022-01-15'),
 (2,'Michael Lee','London','UK','2022-03-22'),
 (3,'Priya Sharma','Mumbai','India','2022-05-10'),
 (4,'James Smith','New York','USA','2022-06-18'),
 (5,'Yuki Tanaka','Tokyo','Japan','2022-08-01'),
 (6,'Anna Muller','Berlin','Germany','2022-09-14'),
 (7,'Carlos Ruiz','Madrid','Spain','2023-01-05'),
 (8,'Emily Davis','London','UK','2023-02-20'),
 (9,'Wei Zhang','Shanghai','China','2023-04-11'),
 (10,'Olivia Brown','Sydney','Australia','2023-06-30'),
 (11,'Tom Wilson','New York','USA','2023-09-12'),
 (12,'Fatima Khan','Dubai','UAE','2023-11-25');

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name       TEXT,
  category   TEXT,
  price      REAL
);
INSERT INTO products VALUES
 (1,'Wireless Mouse','Electronics',29.99),
 (2,'Mechanical Keyboard','Electronics',89.99),
 (3,'USB-C Cable','Accessories',12.50),
 (4,'Laptop Stand','Accessories',45.00),
 (5,'Noise-Canceling Headphones','Electronics',199.99),
 (6,'Webcam HD','Electronics',59.99),
 (7,'Desk Lamp','Home Office',34.99),
 (8,'Notebook','Stationery',6.99),
 (9,'Pen Set','Stationery',14.99),
 (10,'Monitor 27in','Electronics',279.99),
 (11,'Office Chair','Home Office',189.00),
 (12,'Coffee Mug','Home Office',9.99),
 (13,'Sticky Notes','Stationery',4.49);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date  TEXT,
  status      TEXT
);
INSERT INTO orders VALUES
 (1,1,'2023-01-10','completed'),
 (2,2,'2023-01-15','completed'),
 (3,1,'2023-02-01','completed'),
 (4,3,'2023-02-20','shipped'),
 (5,4,'2023-03-05','completed'),
 (6,5,'2023-03-18','cancelled'),
 (7,2,'2023-04-02','completed'),
 (8,6,'2023-04-25','shipped'),
 (9,7,'2023-05-10','completed'),
 (10,1,'2023-05-22','completed'),
 (11,8,'2023-06-15','completed'),
 (12,9,'2023-07-01','shipped'),
 (13,4,'2023-07-20','completed'),
 (14,10,'2023-08-11','cancelled'),
 (15,2,'2023-09-03','completed'),
 (16,11,'2023-09-28','shipped'),
 (17,5,'2023-10-14','completed'),
 (18,7,'2023-11-30','completed');

CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY,
  order_id      INTEGER,
  product_id    INTEGER,
  quantity      INTEGER
);
INSERT INTO order_items VALUES
 (1,1,1,2),(2,1,3,1),(3,2,5,1),(4,3,2,1),(5,3,4,1),
 (6,4,8,3),(7,4,9,2),(8,5,10,1),(9,5,4,1),(10,6,1,1),
 (11,7,5,1),(12,7,6,1),(13,8,11,1),(14,8,7,1),(15,9,2,2),
 (16,10,10,1),(17,10,1,1),(18,10,3,2),(19,11,5,1),(20,11,2,1),
 (21,12,12,4),(22,13,6,1),(23,13,4,2),(24,14,10,1),(25,15,7,1),
 (26,15,8,5),(27,16,11,1),(28,17,1,3),(29,17,9,1),(30,18,5,1),
 (31,18,10,1),(32,18,6,1);

CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT,
  department  TEXT,
  salary      REAL,
  manager_id  INTEGER,
  hire_date   TEXT
);
INSERT INTO employees VALUES
 (1,'Alice Chen','Engineering',145000,NULL,'2018-03-01'),
 (2,'Bob Martinez','Engineering',120000,1,'2019-06-15'),
 (3,'Carla Reed','Engineering',98000,2,'2020-01-20'),
 (4,'David Kim','Engineering',92000,2,'2021-09-10'),
 (5,'Emma Wilson','Sales',110000,1,'2019-02-11'),
 (6,'Frank Lopez','Sales',85000,5,'2020-07-30'),
 (7,'Grace Patel','Sales',82000,5,'2021-03-22'),
 (8,'Henry Ford','Marketing',95000,1,'2020-11-05'),
 (9,'Ivy Nguyen','Marketing',78000,8,'2022-04-18'),
 (10,'Jack Brown','Support',68000,1,'2021-08-01'),
 (11,'Karen Davis','Support',64000,10,'2022-02-14'),
 (12,'Leo Garcia','Support',61000,10,'2023-01-09');
`;

// Display order for the schema reference and table-detection.
export const TABLE_ORDER = ['customers', 'products', 'orders', 'order_items', 'employees'];

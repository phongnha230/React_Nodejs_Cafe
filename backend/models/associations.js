// associations.js
module.exports = (sequelize) => {
  // Use correct model names as defined in sequelize.define (capitalized)
  const {
    User,
    Order,
    OrderItem,
    Product,
    Review,
    MenuSection,
    ProductMenuSection,
    Payment,
    Notification,
    News,
  } = sequelize.models;

  if (Order && OrderItem) {
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
  }

  if (User && Order) {
    User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
    Order.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
  }

  if (Product && OrderItem) {
    Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
  }

  if (User && Review) {
    User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
    Review.belongsTo(User, { foreignKey: 'user_id' });
  }

  if (Product && Review) {
    Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
    Review.belongsTo(Product, { foreignKey: 'product_id' });
  }

  if (Product && MenuSection && ProductMenuSection) {
    Product.hasMany(ProductMenuSection, { foreignKey: 'product_id', as: 'product_menu_sections' });
    MenuSection.hasMany(ProductMenuSection, { foreignKey: 'menu_section_id', as: 'product_menu_sections' });
    ProductMenuSection.belongsTo(Product, { foreignKey: 'product_id' });
    ProductMenuSection.belongsTo(MenuSection, { foreignKey: 'menu_section_id' });
  }

  if (Order && Payment) {
    Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
    Payment.belongsTo(Order, { foreignKey: 'order_id' });
  }

  if (User && Notification) {
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
    Notification.belongsTo(User, { foreignKey: 'user_id' });
  }

  if (Order && Notification) {
    Order.hasMany(Notification, { foreignKey: 'order_id', as: 'notifications' });
    Notification.belongsTo(Order, { foreignKey: 'order_id' });
  }

  if (User && News) {
    User.hasMany(News, { foreignKey: 'created_by', as: 'news' });
    // Add alias 'author' to match controller includes
    News.belongsTo(User, { foreignKey: 'created_by', as: 'author' });
  }
};

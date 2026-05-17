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
    Table,
    CoinTransaction,
    Voucher,
    UserVoucher,
  } = sequelize.models;

  if (Order && OrderItem) {
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
  }

  if (User && Order) {
    User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
    Order.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
  }

  if (Table && Order) {
    Table.hasMany(Order, { foreignKey: 'table_id', as: 'orders' });
    Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });
  }

  if (Product && OrderItem) {
    Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
  }

  if (User && Review) {
    User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
    Review.belongsTo(User, { foreignKey: 'user_id' });
  }

  if (User && CoinTransaction) {
    User.hasMany(CoinTransaction, { foreignKey: 'user_id', as: 'coin_transactions' });
    CoinTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }

  if (Review && CoinTransaction) {
    Review.hasOne(CoinTransaction, { foreignKey: 'review_id', as: 'coin_reward' });
    CoinTransaction.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });
  }

  if (User && UserVoucher) {
    User.hasMany(UserVoucher, { foreignKey: 'user_id', as: 'user_vouchers' });
    UserVoucher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }

  if (Voucher && UserVoucher) {
    Voucher.hasMany(UserVoucher, { foreignKey: 'voucher_id', as: 'user_vouchers' });
    UserVoucher.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' });
  }

  if (Order && Voucher) {
    Order.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' });
  }

  if (Order && UserVoucher) {
    Order.belongsTo(UserVoucher, { foreignKey: 'user_voucher_id', as: 'user_voucher' });
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

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientId: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      merchantTransactionId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payerTelephoneNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      paymentOperatorTransactionId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      basePayTransactionId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      transactionFee: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      collectedAmount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      monthsPaid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      paymentProviderTransactionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      callbackUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      trackId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add index for frequently queried fields
    await queryInterface.addIndex('payments', ['clientId']);
    await queryInterface.addIndex('payments', ['basePayTransactionId']);
    await queryInterface.addIndex('payments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payments');
  }
};

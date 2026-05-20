'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

import { ORDER_STATUSES } from '@src/types';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customer_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courier_provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courier_order_id: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      awb_number: {
        type: DataTypes.STRING,
        defaultValue: null,
        unique: true,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ORDER_STATUSES)),
        allowNull: false,
        defaultValue: ORDER_STATUSES.CREATED,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex('orders', ['customer_id']);
    await queryInterface.addIndex('orders', ['courier_provider']);
    await queryInterface.addIndex('orders', ['awb_number']);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_status";',
    );
  },
};

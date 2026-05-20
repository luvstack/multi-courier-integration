'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

import { ORDER_STATUSES, TRACKING_ACTIONS } from '@src/types';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('tracking_history', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      action: {
        type: DataTypes.ENUM(...Object.values(TRACKING_ACTIONS)),
        allowNull: false,
      },
      request_payload: {
        type: DataTypes.JSONB,
        defaultValue: null,
        allowNull: true,
      },
      response_payload: {
        type: DataTypes.JSONB,
        defaultValue: null,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ORDER_STATUSES)),
        allowNull: false,
      },
      error_message: {
        type: DataTypes.TEXT,
        defaultValue: null,
        allowNull: true,
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

    await queryInterface.addIndex('tracking_history', ['order_id']);
    await queryInterface.addIndex('tracking_history', ['action']);
    await queryInterface.addIndex('tracking_history', ['status']);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('tracking_history');
    // Drop enum types left over from a previous ENUM-based version of this migration.
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tracking_history_status"; DROP TYPE IF EXISTS "enum_tracking_history_action";',
    );
  },
};

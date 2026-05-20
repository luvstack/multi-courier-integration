import {
  CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@src/db/sequelize';
import {
  TRACKING_ACTIONS,
  ORDER_STATUSES as TRACKING_STATUSES,
  TrackingAction,
  OrderStatus as TrackingStatus,
} from '@src/types';

export class TrackingHistoryModel extends Model<
  InferAttributes<TrackingHistoryModel>,
  InferCreationAttributes<TrackingHistoryModel>
> {
  readonly id!: CreationOptional<string>;
  readonly orderId!: string;
  readonly action!: TrackingAction;
  readonly requestPayload!: CreationOptional<Record<string, unknown> | null>;
  readonly responsePayload!: CreationOptional<Record<string, unknown> | null>;
  readonly status!: CreationOptional<TrackingStatus>;
  readonly errorMessage!: CreationOptional<string | null>;
  readonly createdAt!: CreationOptional<Date>;
  readonly updatedAt!: CreationOptional<Date>;
}

TrackingHistoryModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM(...Object.values(TRACKING_ACTIONS)),
      allowNull: false,
    },
    requestPayload: {
      type: DataTypes.JSONB,
      defaultValue: null,
      allowNull: true,
    },
    responsePayload: {
      type: DataTypes.JSONB,
      defaultValue: null,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TRACKING_STATUSES)),
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      defaultValue: null,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'TrackingHistory',
    tableName: 'tracking_history',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['action'] },
      { fields: ['status'] },
    ],
  },
);

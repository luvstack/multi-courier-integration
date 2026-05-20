import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@src/db/sequelize';
import type { CourierProvider } from '@src/libs/providers/types';
import { ORDER_STATUSES, type OrderStatus } from '@src/types';

export class OrderModel extends Model<
  InferAttributes<OrderModel>,
  InferCreationAttributes<OrderModel>
> {
  readonly id!: CreationOptional<string>;
  readonly orderId!: string;
  readonly customerId!: string;
  readonly courierProvider!: CourierProvider;
  readonly courierOrderId!: CreationOptional<string | null>;
  readonly awbNumber!: CreationOptional<string | null>;
  readonly status!: CreationOptional<OrderStatus>;
  // readonly requestPayload: Record<string, unknown>;
  // readonly responsePayload: CreationOptional<Record<string, unknown> | null>;
  readonly createdAt!: CreationOptional<Date>;
  readonly updatedAt!: CreationOptional<Date>;
}

OrderModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courierProvider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courierOrderId: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    awbNumber: {
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
    modelName: 'Order',
    tableName: 'orders',
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['courier_provider'] },
      { fields: ['awb_number'] },
    ],
  },
);

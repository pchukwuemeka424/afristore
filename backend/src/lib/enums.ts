export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentProvider = {
  PAYSTACK: 'PAYSTACK',
  MOBILE_MONEY: 'MOBILE_MONEY',
  MANUAL: 'MANUAL',
} as const;
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];

export const DeploymentStatus = {
  PENDING: 'PENDING',
  PROVISIONING: 'PROVISIONING',
  LIVE: 'LIVE',
  FAILED: 'FAILED',
} as const;
export type DeploymentStatus = (typeof DeploymentStatus)[keyof typeof DeploymentStatus];

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

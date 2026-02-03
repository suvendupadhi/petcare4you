export const USER_ROLE = {
  OWNER: 1,
  PROVIDER: 2,
  ADMIN: 3,
};

export const PET_TYPE = {
  DOG: 1,
  CAT: 2,
  BIRD: 3,
  RABBIT: 4,
  OTHER: 5,
};

export const APPOINTMENT_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

export const PAYMENT_STATUS = {
  PENDING: 5,
  COMPLETED: 6,
  FAILED: 7,
};

export const getStatusLabel = (statusId: number) => {
  switch (statusId) {
    case APPOINTMENT_STATUS.PENDING: return 'Pending';
    case APPOINTMENT_STATUS.CONFIRMED: return 'Confirmed';
    case APPOINTMENT_STATUS.COMPLETED: return 'Completed';
    case APPOINTMENT_STATUS.CANCELLED: return 'Cancelled';
    case PAYMENT_STATUS.PENDING: return 'Pending';
    case PAYMENT_STATUS.COMPLETED: return 'Completed';
    case PAYMENT_STATUS.FAILED: return 'Failed';
    default: return 'Unknown';
  }
};

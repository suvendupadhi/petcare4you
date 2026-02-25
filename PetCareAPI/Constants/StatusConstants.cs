namespace PetCareAPI.Constants
{
    public static class StatusConstants
    {
        public static class UserRole
        {
            public const int SuperAdmin = 1;
            public const int Admin = 2;
            public const int Provider = 3;
            public const int Owner = 4;           
            
        }

        public static class PetType
        {
            public const int Dog = 1;
            public const int Cat = 2;
            public const int Bird = 3;
            public const int Rabbit = 4;
            public const int Other = 5;
        }

        public static class Appointment
        {
            public const int Pending = 1;
            public const int Confirmed = 2;
            public const int Completed = 3;
            public const int Cancelled = 4;
            public const int Declined = 8;
        }

        public static class Payment
        {
            public const int Pending = 5;
            public const int Completed = 6;
            public const int Failed = 7;
        }
        public static class RowStatus
        {
            public const string Active = "a";
            public const string Inactive = "i";
            public const string Deleted = "d";
            public const string Archived = "v";
        }
    }
}

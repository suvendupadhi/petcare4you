using Microsoft.EntityFrameworkCore;
using PetCareAPI.Models;
using System.Text.RegularExpressions;

namespace PetCareAPI.Data
{
    public class PetCareContext : DbContext
    {
        public PetCareContext(DbContextOptions<PetCareContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<UserRole> UserRoles { get; set; } = null!;
        public DbSet<Provider> Providers { get; set; } = null!;
        public DbSet<ServiceType> ServiceTypes { get; set; } = null!;
        public DbSet<ProviderService> ProviderServices { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<Availability> Availabilities { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<StatusMaster> StatusMasters { get; set; } = null!;
        public DbSet<PetType> PetTypes { get; set; } = null!;
        public DbSet<Breed> Breeds { get; set; } = null!;
        public DbSet<Pet> Pets { get; set; } = null!;
        public DbSet<ProviderPhoto> ProviderPhotos { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<SavedProvider> SavedProviders { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<Tip> Tips { get; set; } = null!;
        public DbSet<SystemConfiguration> SystemConfigurations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Pet Configuration
            modelBuilder.Entity<Pet>().ToTable("pets");
            modelBuilder.Entity<Pet>()
                .HasOne(p => p.Owner)
                .WithMany(u => u.Pets)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pet>()
                .HasOne(p => p.PetType)
                .WithMany(pt => pt.Pets)
                .HasForeignKey(p => p.PetTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Pet>()
                .HasOne(p => p.Breed)
                .WithMany(b => b.Pets)
                .HasForeignKey(p => p.BreedId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Breed>().ToTable("breeds");
            modelBuilder.Entity<Breed>()
                .HasOne(b => b.PetType)
                .WithMany(pt => pt.Breeds)
                .HasForeignKey(b => b.PetTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>().ToTable("appointments");
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Pet)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PetId)
                .OnDelete(DeleteBehavior.SetNull);

            // Provider Configuration
            modelBuilder.Entity<Provider>().ToTable("providers");
            modelBuilder.Entity<Provider>()
                .HasOne(p => p.User)
                .WithOne(u => u.Provider)
                .HasForeignKey<Provider>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProviderPhoto>().ToTable("provider_photos");
            modelBuilder.Entity<ProviderPhoto>()
                .HasOne(pp => pp.Provider)
                .WithMany(p => p.Photos)
                .HasForeignKey(pp => pp.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProviderService Configuration
            modelBuilder.Entity<ProviderService>()
                .ToTable("provider_service_types")
                .HasOne(ps => ps.Provider)
                .WithMany(p => p.ProviderServices)
                .HasForeignKey(ps => ps.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProviderService>()
                .HasOne(ps => ps.ServiceType)
                .WithMany()
                .HasForeignKey(ps => ps.ServiceTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProviderService>().Property(ps => ps.ProviderId).HasColumnName("provider_id");
            modelBuilder.Entity<ProviderService>().Property(ps => ps.ServiceTypeId).HasColumnName("service_type_id");

            // Appointment Configuration
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Owner)
                .WithMany(u => u.Appointments)
                .HasForeignKey(a => a.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Provider)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Availability Configuration
            modelBuilder.Entity<Availability>().ToTable("availability");
            modelBuilder.Entity<Availability>()
                .Property(a => a.Id)
                .ValueGeneratedOnAdd();
            modelBuilder.Entity<Availability>()
                .HasOne(a => a.Provider)
                .WithMany(p => p.Availabilities)
                .HasForeignKey(a => a.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Payment Configuration
            modelBuilder.Entity<Payment>().ToTable("payments");
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Appointment)
                .WithOne(a => a.Payment)
                .HasForeignKey<Payment>(p => p.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // SavedProvider Configuration
            modelBuilder.Entity<SavedProvider>().ToTable("saved_providers");
            modelBuilder.Entity<SavedProvider>()
                .HasOne(sp => sp.User)
                .WithMany()
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedProvider>()
                .HasOne(sp => sp.Provider)
                .WithMany()
                .HasForeignKey(sp => sp.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedProvider>()
                .HasIndex(sp => new { sp.UserId, sp.ProviderId })
                .IsUnique();

            // Review Configuration
            modelBuilder.Entity<Review>().ToTable("reviews");
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Appointment)
                .WithOne()
                .HasForeignKey<Review>(r => r.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Owner)
                .WithMany()
                .HasForeignKey(r => r.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Provider)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Other mappings
            modelBuilder.Entity<ServiceType>().ToTable("service_types");
            modelBuilder.Entity<UserRole>().ToTable("user_roles");
            modelBuilder.Entity<PetType>().ToTable("pet_types");
            modelBuilder.Entity<StatusMaster>().ToTable("status_master");
            modelBuilder.Entity<Tip>().ToTable("tips");
            modelBuilder.Entity<Notification>().ToTable("notifications");

            // Force all table and column names to snake_case for PostgreSQL compatibility
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Ensure schema is set for all entities
                entity.SetSchema("petcare");
                
                // Set table name to snake_case
                var tableName = entity.GetTableName();
                if (!string.IsNullOrEmpty(tableName))
                {
                    entity.SetTableName(ToSnakeCase(tableName));
                }

                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(ToSnakeCase(property.GetColumnName()));
                }

                foreach (var key in entity.GetKeys())
                {
                    key.SetName(ToSnakeCase(key.GetName()));
                }

                foreach (var foreignKey in entity.GetForeignKeys())
                {
                    foreignKey.SetConstraintName(ToSnakeCase(foreignKey.GetConstraintName()));
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()));
                }
            }
        }

        private string? ToSnakeCase(string? input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return Regex.Replace(input, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
        }
    }
}

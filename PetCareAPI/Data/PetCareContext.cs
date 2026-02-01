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
        public DbSet<Provider> Providers { get; set; } = null!;
        public DbSet<ServiceType> ServiceTypes { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<Availability> Availabilities { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Provider Configuration
            modelBuilder.Entity<Provider>()
                .HasOne(p => p.User)
                .WithOne(u => u.Provider)
                .HasForeignKey<Provider>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ServiceType Configuration
            modelBuilder.Entity<Provider>()
                .HasMany(p => p.ServiceTypes)
                .WithMany(s => s.Providers)
                .UsingEntity<Dictionary<string, object>>(
                    "ProviderServiceType",
                    j => j.HasOne<ServiceType>().WithMany().HasForeignKey("ServiceTypeId"),
                    j => j.HasOne<Provider>().WithMany().HasForeignKey("ProviderId"),
                    j => j.ToTable("provider_service_types", "petcare")
                );

            // Column naming for join table
            modelBuilder.Entity("ProviderServiceType").Property<int>("ProviderId").HasColumnName("provider_id");
            modelBuilder.Entity("ProviderServiceType").Property<int>("ServiceTypeId").HasColumnName("service_type_id");

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
            modelBuilder.Entity<Availability>()
                .HasOne(a => a.Provider)
                .WithMany(p => p.Availabilities)
                .HasForeignKey(a => a.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Payment Configuration
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

            // Force all table and column names to snake_case for PostgreSQL compatibility
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                entity.SetSchema("petcare");
                entity.SetTableName(ToSnakeCase(entity.GetTableName()));

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

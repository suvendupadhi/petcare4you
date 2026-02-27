using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using PetCareAPI.Models.DTOs;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly PetCare4YouContext _context;
        private readonly IWebHostEnvironment _environment;

        public UsersController(PetCare4YouContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet("me")]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users
                .Include(u => u.Provider)
                    .ThenInclude(p => p!.ProviderServices)
                        .ThenInclude(ps => ps.ServiceType)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();


            // Don't return password hash
            user.PasswordHash = string.Empty;

            return user;

            // var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            //if (userIdClaim == null)
            //    return Unauthorized();
            //var userId = int.Parse(userIdClaim.Value);

            //var user = await _context.Users
            //    .Where(u => u.Id == userId)
            //    .Select(u => new UserDto
            //    {
            //        Id = u.Id,
            //        Email = u.Email,
            //        Name = u.Name,
            //        Provider = u.Provider == null ? null : new ProviderDto
            //        {
            //            Id = u.Provider.Id,
            //            Name = u.Provider.Name
            //        }
            //    })
            //    .FirstOrDefaultAsync();

            //if (user == null)
            //    return NotFound();

            //return Ok(user);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto userUpdate)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            user.FirstName = userUpdate.FirstName;
            user.LastName = userUpdate.LastName;
            user.PhoneNumber = userUpdate.PhoneNumber ?? string.Empty;
            user.Address = userUpdate.Address;
            user.ProfileImageUrl = userUpdate.ProfileImageUrl;
            user.UpdatedAt = DateTime.UtcNow;
            
            // Ensure any other date times are UTC
            if (user.ResetTokenExpiry.HasValue)
            {
                user.ResetTokenExpiry = DateTime.SpecifyKind(user.ResetTokenExpiry.Value, DateTimeKind.Utc);
            }
            user.CreatedAt = DateTime.SpecifyKind(user.CreatedAt, DateTimeKind.Utc);
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("me/photo")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfilePhoto(IFormFile file)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"user_{user.Id}_{DateTime.Now.Ticks}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                user.ProfileImageUrl = $"/uploads/{fileName}";
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { url = user.ProfileImageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

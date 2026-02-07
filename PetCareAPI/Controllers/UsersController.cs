using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetCareAPI.Data;
using PetCareAPI.Models;
using System.Security.Claims;

namespace PetCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly PetCareContext _context;

        public UsersController(PetCareContext context)
        {
            _context = context;
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
        public async Task<IActionResult> UpdateProfile([FromBody] User userUpdate)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            user.FirstName = userUpdate.FirstName;
            user.LastName = userUpdate.LastName;
            user.PhoneNumber = userUpdate.PhoneNumber;
            user.Address = userUpdate.Address;
            user.ProfileImageUrl = userUpdate.ProfileImageUrl;
            user.UpdatedAt = DateTime.UtcNow;
            
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

            // In a real app, we would save the file to a cloud storage or a local folder
            // For this demo, we'll just use a placeholder URL or the filename
            // Since we don't have a static file server configured, we'll return a sample image
            user.ProfileImageUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400";
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { url = user.ProfileImageUrl });
        }
    }
}

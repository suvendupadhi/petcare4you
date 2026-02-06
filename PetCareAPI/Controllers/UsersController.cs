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
    }
}

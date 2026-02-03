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
    public class PetsController : ControllerBase
    {
        private readonly PetCareContext _context;

        public PetsController(PetCareContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pet>>> GetMyPets()
        {
            var userId = GetUserId();
            return await _context.Pets
                .Include(p => p.PetType)
                .Include(p => p.Breed)
                .Where(p => p.OwnerId == userId)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pet>> GetPet(int id)
        {
            var userId = GetUserId();
            var pet = await _context.Pets
                .Include(p => p.PetType)
                .Include(p => p.Breed)
                .FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == userId);

            if (pet == null) return NotFound();
            return pet;
        }

        [HttpPost]
        public async Task<ActionResult<Pet>> CreatePet([FromBody] Pet pet)
        {
            pet.OwnerId = GetUserId();
            pet.CreatedAt = DateTime.UtcNow;
            pet.UpdatedAt = DateTime.UtcNow;

            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPet), new { id = pet.Id }, pet);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePet(int id, [FromBody] Pet petUpdate)
        {
            var userId = GetUserId();
            var pet = await _context.Pets.FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == userId);

            if (pet == null) return NotFound();

            pet.Name = petUpdate.Name;
            pet.PetTypeId = petUpdate.PetTypeId;
            pet.BreedId = petUpdate.BreedId;
            pet.Age = petUpdate.Age;
            pet.Weight = petUpdate.Weight;
            pet.MedicalNotes = petUpdate.MedicalNotes;
            pet.ProfileImageUrl = petUpdate.ProfileImageUrl;
            pet.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePet(int id)
        {
            var userId = GetUserId();
            var pet = await _context.Pets.FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == userId);

            if (pet == null) return NotFound();

            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("types")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<PetType>>> GetPetTypes()
        {
            return await _context.PetTypes.ToListAsync();
        }

        [HttpGet("breeds/{typeId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Breed>>> GetBreeds(int typeId)
        {
            return await _context.Breeds.Where(b => b.PetTypeId == typeId).ToListAsync();
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }
    }
}

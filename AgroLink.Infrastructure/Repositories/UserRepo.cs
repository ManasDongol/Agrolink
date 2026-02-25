using AgroLink.Domain.Entities;
using AgroLink.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AgroLink.Infrastructure.Repositories;

public class UserRepo(AgroLinkDbContext dbContext)
{
    public void loginUser(User user)
    {
        var result =  dbContext.Users.Add(user);
    }

    public async Task<User?> RegisterUser(User user)
    {
        var result  =  dbContext.Users.Add(user);
        try
        {
            var rowsInserted = await dbContext.SaveChangesAsync();
            if (rowsInserted > 0)
            {
                return user;
            }

            return user;
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is PostgresException pg &&
                pg.SqlState == "23505")
            {
                Console.WriteLine("same username or email");
                // Unique constraint violation
                return null; 
            }
        }

        return user;

    }
    public User? CheckUsernameExists(string username)
    {
        var result = dbContext.Users.FirstOrDefault(x => x.Username == username);
        return result;
    }

    public User? GetUserByEmail(string email)
    {
        var result = dbContext.Users.FirstOrDefault(x => x.Email == email);
        return result;
    }

    public string? getUserSalt(string username){
        var result = dbContext.Users.FirstOrDefault(x => x.Username == username);
        if (result == null)
        {
            return null;
        }
        return result.salt;
        
    }

    public User GetUserByIdAsync(string userID)
    {
        var result =  dbContext.Users.FirstOrDefault(x => x.UserId.ToString() == userID);
        return result;
    }
  
}
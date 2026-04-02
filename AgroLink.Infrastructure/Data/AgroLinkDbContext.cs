using AgroLink.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroLink.Infrastructure.Data;

public class AgroLinkDbContext(DbContextOptions<AgroLinkDbContext> options) : DbContext(options)
{

    public DbSet<User> Users { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<ConnectionRequests>   ConnectionRequests { get; set; }
    public DbSet<Connections> Connections { get; set; }
    public DbSet<Posts> Posts { get; set; }
   public DbSet<Conversation> Conversations { get; set; }
   public DbSet<Message> Messages { get; set; }
   public DbSet<Comment> Comments { get; set; }
   public DbSet<Like> Likes { get; set; }
  
   public DbSet<AiSession> AiSessions { get; set; }
   public DbSet<AiMessage> AiMessages { get; set; }
   
   public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>()
            .HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<Profile>(p => p.UserId);
        
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.User1)
            .WithMany()
            .HasForeignKey(c => c.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.User2)
            .WithMany()
            .HasForeignKey(c => c.User2Id)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Connections>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Connections>()
            .HasOne(c => c.ConnectionUser)
            .WithMany()
            .HasForeignKey(c => c.ConnectionUserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        
        modelBuilder.Entity<AiSession>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AiMessage>()
            .HasOne(m => m.AiSession)
            .WithMany(s => s.AiMessages)
            .HasForeignKey(m => m.AiSessionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        
       
    }

}

   
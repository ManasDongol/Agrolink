using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgroLink.Domain.Entities;
public class Notification
    {
        [Key]
        public Guid Id { get; set; } =  Guid.NewGuid();
 
        // Who receives this notification
        [Required]
        public Guid RecipientUserId { get; set; }
 
        // Who triggered it (null for system notifications like price alerts)
        public Guid? SenderUserId { get; set; }
 
     
 
        [Required]
        public string Message { get; set; }
 

        public bool IsRead { get; set; } = false;
 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
 
        // Navigation
    
        public User Recipient { get; set; }
 
     
        public User? Sender { get; set; }
    }
